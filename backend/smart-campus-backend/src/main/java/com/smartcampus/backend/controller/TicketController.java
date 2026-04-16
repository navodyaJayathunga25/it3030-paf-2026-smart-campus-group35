package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.CommentRequest;
import com.smartcampus.backend.dto.request.ReviewRequest;
import com.smartcampus.backend.dto.request.TicketRequest;
import com.smartcampus.backend.dto.request.TicketStatusRequest;
import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.model.Comment;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /**
     * GET /api/tickets - List tickets by role
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getTickets(
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getTicketsForUser(currentUser)));
    }

    /**
     * GET /api/tickets/{id} - Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> getTicketById(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getTicketById(id, currentUser)));
    }

    /**
     * POST /api/tickets - Create new ticket (with optional image attachments)
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<ApiResponse<Ticket>> createTicket(
        @RequestPart("data") @Valid TicketRequest request,
        @RequestPart(value = "files", required = false) List<MultipartFile> files,
        @AuthenticationPrincipal User currentUser) throws IOException {
        Ticket ticket = ticketService.createTicket(request, files, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Ticket created successfully", ticket));
    }

    /**
     * PUT /api/tickets/{id}/status - Update ticket status
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<Ticket>> updateStatus(
        @PathVariable String id,
        @Valid @RequestBody TicketStatusRequest request,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Ticket status updated", ticketService.updateTicketStatus(id, request, currentUser))
        );
    }

    /**
     * PUT /api/tickets/{id}/assign - Assign technician (ADMIN only)
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Ticket>> assignTicket(
        @PathVariable String id,
        @RequestBody ReviewRequest request,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Ticket assigned", ticketService.assignTicket(id, request.getReason(), currentUser))
        );
    }

    // --- Comments ---

    /**
     * GET /api/tickets/{id}/comments - Get comments for a ticket
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getComments(id, currentUser)));
    }

    /**
     * POST /api/tickets/{id}/comments - Add comment to ticket
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Comment>> addComment(
        @PathVariable String id,
        @Valid @RequestBody CommentRequest request,
        @AuthenticationPrincipal User currentUser) {
        Comment comment = ticketService.addComment(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Comment added", comment));
    }

    /**
     * PUT /api/tickets/{ticketId}/comments/{commentId} - Update comment
     */
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Comment>> updateComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @Valid @RequestBody CommentRequest request,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Comment updated", ticketService.updateComment(ticketId, commentId, request, currentUser))
        );
    }

    /**
     * DELETE /api/tickets/{ticketId}/comments/{commentId} - Delete comment
     */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @PathVariable String ticketId,
        @PathVariable String commentId,
        @AuthenticationPrincipal User currentUser) {
        ticketService.deleteComment(ticketId, commentId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }
}

