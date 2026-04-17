package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.dto.response.UserResponse;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /**
     * GET /api/auth/me - Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
        @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(userService.toResponse(currentUser)));
    }

    /**
     * POST /api/auth/logout - Logout (client-side token invalidation)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // JWT is stateless â€” client deletes the token
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}

