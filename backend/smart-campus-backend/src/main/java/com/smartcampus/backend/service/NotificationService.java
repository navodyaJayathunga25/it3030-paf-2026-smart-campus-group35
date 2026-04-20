package com.smartcampus.backend.service;

import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.Notification.NotificationType;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyAdmins(NotificationType type, String title, String message,
                              String referenceId, String link) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            sendNotification(admin.getId(), type, title, message, referenceId, link);
        }
        log.debug("Notified {} admin(s): {}", admins.size(), title);
    }

    public void notifyAdminsExcept(String excludedUserId, NotificationType type,
                                   String title, String message,
                                   String referenceId, String link) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        int notified = 0;
        for (User admin : admins) {
            if (excludedUserId != null && excludedUserId.equals(admin.getId())) {
                continue;
            }
            sendNotification(admin.getId(), type, title, message, referenceId, link);
            notified++;
        }
        log.debug("Notified {} admin(s) (excluding={}): {}", notified, excludedUserId, title);
    }

    public void sendNotification(String userId, NotificationType type,
                                  String title, String message,
                                  String referenceId, String link) {
        String resolvedLink = resolveLink(type, referenceId, link);
        Notification notification = Notification.builder()
            .userId(userId)
            .type(type)
            .title(title)
            .message(message)
            .referenceId(referenceId)
            .link(resolvedLink)
            .read(false)
            .build();
        notificationRepository.save(notification);
        log.debug("Notification sent to user {}: {}", userId, title);
    }

    private String resolveLink(NotificationType type, String referenceId, String link) {
        if (link != null && !link.isBlank()) {
            return link;
        }

        return switch (type) {
            case BOOKING -> referenceId != null && !referenceId.isBlank()
                ? "/bookings/" + referenceId
                : "/bookings";
            case TICKET, COMMENT -> referenceId != null && !referenceId.isBlank()
                ? "/tickets/" + referenceId
                : "/tickets";
            case USER -> "/admin/users";
        };
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new com.smartcampus.backend.exception.ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new com.smartcampus.backend.exception.UnauthorizedException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new com.smartcampus.backend.exception.ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new com.smartcampus.backend.exception.UnauthorizedException("You can only delete your own notifications");
        }

        if (!notification.isRead()) {
            throw new IllegalArgumentException("Only read notifications can be deleted");
        }

        notificationRepository.delete(notification);
        log.debug("Notification deleted for user {}: {}", userId, notificationId);
    }
}

