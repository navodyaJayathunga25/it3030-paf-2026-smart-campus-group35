package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.Instant;

@Data
@Builder

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String resourceId;
    private String resourceName;

    private Instant startTime;
    private Instant endTime;

    private String purpose;
    private int attendees;



    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
