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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;

    private String resourceId;
    private String resourceName;

    private String category;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String reportedBy;
    private String reportedByName;

    private String assignedTo;
    private String assignedToName;

    private String contactDetails;

    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    private String resolutionNotes;
    private String reason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}
