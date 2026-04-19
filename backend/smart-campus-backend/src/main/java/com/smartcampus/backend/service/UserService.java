package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.response.UserResponse;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.model.UserStatus;
import com.smartcampus.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toResponse(user);
    }

    public UserResponse updateUserRole(String userId, UserRole role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(String userId, boolean active) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public UserResponse approveUser(String userId, UserRole role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        log.info("Approving user {} ({}) — old status={}, new role={}",
            user.getEmail(), user.getId(), user.getStatus(), role);
        user.setRole(role);
        user.setStatus(UserStatus.APPROVED);
        user.setActive(true);
        User saved = userRepository.save(user);

        emailService.sendWelcomeEmail(saved.getEmail(), saved.getName(), role);
        return toResponse(saved);
    }

    public UserResponse updateUserPicture(String userId, String picture) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setPicture(picture);
        return toResponse(userRepository.save(user));
    }

    public UserResponse rejectUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.REJECTED);
        user.setActive(false);
        return toResponse(userRepository.save(user));
    }

    public UserResponse toResponse(User user) {
        // Legacy users without status are treated as APPROVED
        UserStatus status = user.getStatus() == null ? UserStatus.APPROVED : user.getStatus();
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .picture(user.getPicture())
            .department(user.getDepartment())
            .role(user.getRole())
            .status(status)
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}

