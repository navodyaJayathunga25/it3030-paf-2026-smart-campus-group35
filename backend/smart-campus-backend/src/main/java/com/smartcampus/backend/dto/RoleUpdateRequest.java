package com.smartcampus.dto;

import com.smartcampus.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleUpdateRequest {

    @NotNull(message = "Role is required")
    private User.Role role;
}
