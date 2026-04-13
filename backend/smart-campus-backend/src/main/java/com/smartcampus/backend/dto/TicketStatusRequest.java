package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusRequest {

    @NotNull(message = "Status is required")
    private Ticket.TicketStatus status;

    private String reason;
    private String assignedTo;
    private String resolutionNotes;
}
