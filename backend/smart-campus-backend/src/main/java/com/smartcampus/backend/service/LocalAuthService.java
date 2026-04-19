package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.request.LoginRequest;
import com.smartcampus.backend.dto.request.RegisterRequest;
import com.smartcampus.backend.dto.response.AuthResponse;
import com.smartcampus.backend.exception.UnauthorizedException;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.model.UserRole;
import com.smartcampus.backend.model.UserStatus;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocalAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    public void register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        String token = UUID.randomUUID().toString();
        User user = User.builder()
            .name(request.getName().trim())
            .email(email)
            .department(request.getDepartment())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .provider("local")
            .emailVerified(false)
            .emailVerificationToken(token)
            .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
            .role(UserRole.USER)
            .status(UserStatus.PENDING)
            .active(false)
            .build();

        userRepository.save(user);
        log.info("Registered local user {} — awaiting email verification", email);

        emailService.sendVerificationEmail(email, user.getName(), token);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification link."));

        if (user.getEmailVerificationExpiry() != null
            && user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired. Please register again.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);
        log.info("Email verified for {} — now awaiting admin approval", user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (user.getPasswordHash() == null || !"local".equals(user.getProvider())) {
            throw new UnauthorizedException("This account uses Google Sign-In. Please continue with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your email before signing in.");
        }

        if (user.getStatus() != UserStatus.APPROVED) {
            if (user.getStatus() == UserStatus.REJECTED) {
                throw new UnauthorizedException("Your account was not approved.");
            }
            throw new UnauthorizedException("Your account is pending admin approval.");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account is disabled.");
        }

        String jwt = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.builder()
            .token(jwt)
            .user(userService.toResponse(user))
            .build();
    }
}
