package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.dto.response.UserResponse;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/users - List all users (ADMIN only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    /**
     * GET /api/users/{id} - Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
        @PathVariable String id,
        @AuthenticationPrincipal User currentUser) {
        // Users can only view their own profile unless admin
        if (!currentUser.getId().equals(id) && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    /**
     * PUT /api/users/{id}/role - Update user role (ADMIN only)
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(
        @PathVariable String id,
        @RequestBody Map<String, String> body) {
        UserRole role = UserRole.valueOf(body.get("role"));
        return ResponseEntity.ok(
            ApiResponse.success("User role updated", userService.updateUserRole(id, role))
        );
    }

    /**
     * PUT /api/users/{id}/status - Activate/deactivate user (ADMIN only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
        @PathVariable String id,
        @RequestBody Map<String, Boolean> body) {
        boolean active = body.get("active");
        return ResponseEntity.ok(
            ApiResponse.success("User status updated", userService.updateUserStatus(id, active))
        );
    }
}

