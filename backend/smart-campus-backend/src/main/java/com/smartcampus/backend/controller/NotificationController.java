package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications - Get all notifications for current user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success(notificationService.getUserNotifications(currentUser.getId()))
        );
    }

    /**
     * GET /api/notifications/unread-count - Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
        @AuthenticationPrincipal User currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    /**
     * PUT /api/notifications/{id}/read - Mark notification as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success(notificationService.markAsRead(id, currentUser.getId()))
        );
    }

    /**
     * PUT /api/notifications/read-all - Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
        @AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    /**
     * DELETE /api/notifications/{id} - Delete a read notification (authenticated user only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        notificationService.deleteNotification(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}

