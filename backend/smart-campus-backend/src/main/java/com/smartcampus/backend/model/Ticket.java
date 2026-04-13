package com.smartcampus.model;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;

    private String resourceId;
    private String resourceName;


    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String reportedBy;
    private String reportedByName;

    private String contactDetails;

    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    private String resolutionNotes;
    private String reason;

    @LastModifiedDate
    private Instant updatedAt;

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}
