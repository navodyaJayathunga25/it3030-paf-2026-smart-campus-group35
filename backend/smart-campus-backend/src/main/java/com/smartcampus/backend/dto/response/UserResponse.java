package com.smartcampus.backend.dto.response;

import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String picture;
    private String department;
    private UserRole role;
    private UserStatus status;
    private boolean active;
    private LocalDateTime createdAt;
}
