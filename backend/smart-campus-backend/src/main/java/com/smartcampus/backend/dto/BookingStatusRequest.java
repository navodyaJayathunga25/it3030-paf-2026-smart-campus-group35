package com.smartcampus.dto;

import com.smartcampus.model.Booking;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusRequest {

    @NotNull(message = "Status is required")
    private Booking.BookingStatus status;

    private String reason;
}
