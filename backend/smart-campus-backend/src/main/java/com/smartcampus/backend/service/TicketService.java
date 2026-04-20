package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.request.CommentRequest;
import com.smartcampus.backend.dto.request.TicketRequest;
import com.smartcampus.backend.dto.request.TicketStatusRequest;
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
    private final EmailService emailService;

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

    public Ticket createTicket(TicketRequest request, User currentUser) {
        List<String> attachmentUrls = request.getAttachmentUrls() != null
            ? new ArrayList<>(request.getAttachmentUrls())
            : new ArrayList<>();

        if (attachmentUrls.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 attachments are allowed");
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

        Ticket saved = ticketRepository.save(ticket);

        String recipient = (ticket.getContactEmail() != null && !ticket.getContactEmail().isBlank())
            ? ticket.getContactEmail()
            : currentUser.getEmail();
        emailService.sendTicketReceivedEmail(
            recipient,
            currentUser.getName(),
            saved.getId(),
            saved.getCategory(),
            saved.getDescription()
        );

        return saved;
    }

    public Ticket updateTicketStatus(String ticketId, TicketStatusRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        TicketStatus newStatus = request.getStatus();
        TicketStatus currentStatus = ticket.getStatus();
        String role = currentUser.getRole().name();

        // Role-based status transitions
        if (role.equals("USER")) {
            throw new UnauthorizedException("Users cannot change ticket status");
        }

        if (role.equals("ADMIN")) {
            boolean hasTechnician = ticket.getAssignedTo() != null
                && !ticket.getAssignedTo().isBlank();
            if (hasTechnician) {
                // Once a technician is assigned, admin may only reject an OPEN ticket
                // or close a RESOLVED ticket. The technician owns start/resolve.
                boolean canReject = newStatus == TicketStatus.REJECTED && currentStatus == TicketStatus.OPEN;
                boolean canClose  = newStatus == TicketStatus.CLOSED && currentStatus == TicketStatus.RESOLVED;
                if (!canReject && !canClose) {
                    throw new UnauthorizedException(
                        "A technician is already assigned. Admin can only reject or close this ticket; "
                        + "starting work and resolving are the assigned technician's responsibility."
                    );
                }
            }
            // If no technician is assigned, admin may drive any transition.
        } else if (role.equals("TECHNICIAN")) {
            // Technician must be the one assigned.
            if (ticket.getAssignedTo() == null
                || !ticket.getAssignedTo().equals(currentUser.getId())) {
                throw new UnauthorizedException("You are not the assigned technician for this ticket");
            }
            // Technician may move to IN_PROGRESS or RESOLVED only.
            if (newStatus != TicketStatus.IN_PROGRESS && newStatus != TicketStatus.RESOLVED) {
                throw new UnauthorizedException(
                    "Technicians can only start work or mark a ticket as resolved. "
                    + "Closing the ticket is reserved for admins."
                );
            }
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

        if (newStatus == TicketStatus.RESOLVED) {
            notificationService.sendNotification(
                ticket.getUserId(),
                NotificationType.TICKET,
                "Ticket Resolved",
                "Your ticket \"" + ticket.getCategory() + "\" has been resolved.",
                ticket.getId(),
                "/tickets/" + ticket.getId()
            );
        }

        if (newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED
            || newStatus == TicketStatus.REJECTED) {
            String recipient = resolveRecipientEmail(saved);
            if (recipient != null && !recipient.isBlank()) {
                String recipientName = saved.getUserName() != null ? saved.getUserName() : "there";
                if (newStatus == TicketStatus.REJECTED) {
                    emailService.sendTicketRejectedEmail(
                        recipient, recipientName, saved.getId(),
                        saved.getCategory(), saved.getRejectionReason()
                    );
                } else {
                    emailService.sendTicketResolvedEmail(
                        recipient, recipientName, saved.getId(),
                        saved.getCategory(), saved.getResolutionNotes(),
                        newStatus == TicketStatus.CLOSED
                    );
                }
            }
        }

        return saved;
    }

    private String resolveRecipientEmail(Ticket ticket) {
        if (ticket.getContactEmail() != null && !ticket.getContactEmail().isBlank()) {
            return ticket.getContactEmail();
        }
        return userRepository.findById(ticket.getUserId())
            .map(User::getEmail)
            .orElse(null);
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
            technician.getId(),
            NotificationType.TICKET,
            "New Ticket Assigned",
            "You have been assigned a new ticket: \"" + ticket.getCategory()
                + "\" (Priority: " + ticket.getPriority().name() + ")",
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

    public void deleteTicket(String ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        boolean isAdmin = currentUser.getRole().name().equals("ADMIN");
        boolean isOwner = ticket.getUserId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You can only delete your own tickets");
        }

        if (!isAdmin && ticket.getStatus() != TicketStatus.REJECTED) {
            throw new UnauthorizedException("Only rejected tickets can be deleted");
        }

        commentRepository.deleteAll(commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
        ticketRepository.delete(ticket);
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

