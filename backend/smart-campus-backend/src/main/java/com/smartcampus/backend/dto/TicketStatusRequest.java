package com.smartcampus.backend.dto;

import com.smartcampus.backend.model.Ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String notes;
}

