package com.smartcampus.dto;

import com.smartcampus.model.Ticket;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String resourceId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private Ticket.Priority priority;

    private String contactDetails;
}
