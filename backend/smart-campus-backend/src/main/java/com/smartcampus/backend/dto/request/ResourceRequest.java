package com.smartcampus.backend.dto.request;

import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    //@NotBlank(message = "Building is required")
    //private String building;

    //private String floor;

    private String description;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private List<String> facilities;

    private String availabilityWindows;

    // Admin-controlled access: which roles can access this resource
    private List<String> allowedRoles;
}

