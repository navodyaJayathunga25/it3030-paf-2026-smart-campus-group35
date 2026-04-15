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

    public Booking createBooking(BookingRequest request, User currentUser) {
        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", request.getResourceId()));

        if (resource.getStatus() == Resource.ResourceStatus.OUT_OF_SERVICE) {
            throw new IllegalArgumentException("Resource is currently out of service");
        }

        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for conflicts (OWASP A01: business logic validation)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resource.getId(),
            request.getDate(),
            request.getStartTime(),
            request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                "This resource is already booked during the requested time slot"
            );
        }

        Booking booking = Booking.builder()
            .userId(currentUser.getId())
            .userName(currentUser.getName())
            .resourceId(resource.getId())
            .resourceName(resource.getName())
            .date(request.getDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .purpose(request.getPurpose())
            .expectedAttendees(request.getExpectedAttendees())
            .status(BookingStatus.PENDING)
            .build();

        return bookingRepository.save(booking);
    }

    public Booking approveBooking(String bookingId, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(admin.getId());
        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
            booking.getUserId(),
            NotificationType.BOOKING,
            "Booking Approved",
            "Your booking for " + booking.getResourceName() + " on " + booking.getDate() + " has been approved.",
            booking.getId(),
            "/bookings/" + booking.getId()
        );

        return saved;
    }

    public Booking rejectBooking(String bookingId, String reason, User admin) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setApprovedBy(admin.getId());
        Booking saved = bookingRepository.save(booking);

        notificationService.sendNotification(
            booking.getUserId(),
            NotificationType.BOOKING,
            "Booking Rejected",
            "Your booking for " + booking.getResourceName() + " on " + booking.getDate() + " was rejected. Reason: " + reason,
            booking.getId(),
            "/bookings/" + booking.getId()
        );

        return saved;
    }

    public Booking cancelBooking(String bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUserId().equals(currentUser.getId()) &&
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED ||
            booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Booking is already " + booking.getStatus().name().toLowerCase());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
