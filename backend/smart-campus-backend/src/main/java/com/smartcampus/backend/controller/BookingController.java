package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.BookingRequest;
import com.smartcampus.backend.dto.request.ReviewRequest;
import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * GET /api/bookings - List bookings (USER: own, ADMIN: all)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getBookings(
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingsForUser(currentUser)));
    }

    /**
     * GET /api/bookings/{id} - Get booking by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id, currentUser)));
    }

    /**
     * POST /api/bookings - Create a new booking
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
        @Valid @RequestBody BookingRequest request,
        @AuthenticationPrincipal User currentUser) {
        Booking booking = bookingService.createBooking(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Booking request submitted successfully", booking));
    }

    /**
     * PUT /api/bookings/{id}/approve - Approve booking (ADMIN only)
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> approveBooking(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Booking approved", bookingService.approveBooking(id, currentUser))
        );
    }

    /**
     * PUT /api/bookings/{id}/reject - Reject booking (ADMIN only)
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> rejectBooking(
        @PathVariable String id,
        @RequestBody ReviewRequest request,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Booking rejected", bookingService.rejectBooking(id, request.getReason(), currentUser))
        );
    }

    /**
     * PUT /api/bookings/{id}/cancel - Cancel booking
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(
            ApiResponse.success("Booking cancelled", bookingService.cancelBooking(id, currentUser))
        );
    }
}

