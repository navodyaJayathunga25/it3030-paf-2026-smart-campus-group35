package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.request.BookingRequest;
import com.smartcampus.backend.exception.BookingConflictException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.exception.UnauthorizedException;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.Booking.BookingStatus;
import com.smartcampus.backend.model.Notification.NotificationType;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public List<Booking> getBookingsForUser(User currentUser) {
        if (currentUser.getRole().name().equals("ADMIN")) {
            return bookingRepository.findAllByOrderByCreatedAtDesc();
        }
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    public Booking getBookingById(String id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!currentUser.getRole().name().equals("ADMIN") &&
            !booking.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied to this booking");
        }
        return booking;
    }
}
