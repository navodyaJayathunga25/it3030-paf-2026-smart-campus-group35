package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.CommentRequest;
import com.smartcampus.backend.dto.TicketRequest;
import com.smartcampus.backend.dto.TicketStatusRequest;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.exception.UnauthorizedException;
import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Notification.NotificationType;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.Ticket.TicketStatus;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.CommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public List<Ticket> getTicketsForUser(User currentUser) {
        return switch (currentUser.getRole()) {
            case ADMIN -> ticketRepository.findAllByOrderByCreatedAtDesc();
            case TECHNICIAN -> ticketRepository.findByAssignedToOrderByCreatedAtDesc(currentUser.getId());
            default -> ticketRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        };
    }

    public Ticket getTicketById(String id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));

        if (currentUser.getRole().name().equals("USER") &&
            !ticket.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to this ticket");
        }
        return ticket;
    }

    public Ticket createTicket(TicketRequest request, List<MultipartFile> files, User currentUser) throws IOException {
        List<String> attachmentUrls = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new IllegalArgumentException("Maximum 3 attachments are allowed");
            }
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String url = fileStorageService.storeFile(file);
                    attachmentUrls.add(url);
                }
            }
        }

        Ticket ticket = Ticket.builder()
            .userId(currentUser.getId())
            .userName(currentUser.getName())
            .resourceId(request.getResourceId())
            .location(request.getLocation())
            .category(request.getCategory())
            .description(request.getDescription())
            .priority(request.getPriority())
            .status(TicketStatus.OPEN)
            .contactEmail(request.getContactEmail())
            .contactPhone(request.getContactPhone())
            .attachmentUrls(attachmentUrls)
            .build();

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(String ticketId, TicketStatusRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketStatus newStatus = request.getStatus();

        // Role-based status transitions
        if (currentUser.getRole().name().equals("USER")) {
            throw new UnauthorizedException("Users cannot change ticket status");
        }

        // Track first response time
        if (ticket.getFirstResponseAt() == null &&
            newStatus != TicketStatus.OPEN) {
            ticket.setFirstResponseAt(LocalDateTime.now());
        }

        // Track resolution time
        if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) &&
            ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        ticket.setStatus(newStatus);

        if (request.getNotes() != null) {
            if (newStatus == TicketStatus.REJECTED) {
                ticket.setRejectionReason(request.getNotes());
            } else {
                ticket.setResolutionNotes(request.getNotes());
            }
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotification(
            ticket.getUserId(),
            NotificationType.TICKET,
            "Ticket Status Updated",
            "Your ticket has been updated to: " + newStatus.name(),
            ticket.getId(),
            "/tickets/" + ticket.getId()
        );

        return saved;
    }

    public Ticket assignTicket(String ticketId, String technicianId, User admin) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User technician = userRepository.findById(technicianId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", technicianId));

        ticket.setAssignedTo(technician.getId());
        ticket.setAssignedToName(technician.getName());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(LocalDateTime.now());
            }
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotification(
            ticket.getUserId(),
            NotificationType.TICKET,
            "Ticket Assigned",
            "Your ticket has been assigned to " + technician.getName(),
            ticket.getId(),
            "/tickets/" + ticket.getId()
        );

        return saved;
    }

    // Comments
    public List<Comment> getComments(String ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (currentUser.getRole().name().equals("USER") &&
            !ticket.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to this ticket");
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment addComment(String ticketId, CommentRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (currentUser.getRole().name().equals("USER") &&
            !ticket.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to this ticket");
        }

        Comment comment = Comment.builder()
            .ticketId(ticketId)
            .userId(currentUser.getId())
            .userName(currentUser.getName())
            .userRole(currentUser.getRole().name())
            .content(request.getContent())
            .build();

        Comment saved = commentRepository.save(comment);

        // Notify ticket owner when others comment
        if (!ticket.getUserId().equals(currentUser.getId())) {
            notificationService.sendNotification(
                ticket.getUserId(),
                NotificationType.COMMENT,
                "New Comment on Your Ticket",
                currentUser.getName() + " commented on your ticket.",
                ticket.getId(),
                "/tickets/" + ticket.getId()
            );
        }

        return saved;
    }

    public Comment updateComment(String ticketId, String commentId, CommentRequest request, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        // Only comment owner or admin can edit
        if (!comment.getUserId().equals(currentUser.getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        return commentRepository.save(comment);
    }

    public void deleteComment(String ticketId, String commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to this ticket");
        }

        // Only comment owner or admin can delete
        if (!comment.getUserId().equals(currentUser.getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}

