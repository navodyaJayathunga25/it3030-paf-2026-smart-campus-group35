package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String reason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
