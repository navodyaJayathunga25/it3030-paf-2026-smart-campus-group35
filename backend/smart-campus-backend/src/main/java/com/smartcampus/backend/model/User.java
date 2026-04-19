package com.smartcampus.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String picture;

    private String provider; // google, local

    private String providerId;

    private String department;

    private String passwordHash;

    @Builder.Default
    private boolean emailVerified = false;

    private String emailVerificationToken;

    private LocalDateTime emailVerificationExpiry;

    @Builder.Default
    private UserRole role = UserRole.USER;

    @Builder.Default
    private UserStatus status = UserStatus.PENDING;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
