package com.smartcampus.dto;

import com.smartcampus.model.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private Resource.ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;


}
