package com.smartcampus.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    // OWASP A03: Allowed file types to prevent malicious uploads
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        // OWASP A03: Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("File type not allowed. Only images are accepted.");
        }

        // OWASP A03: Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 10MB limit.");
        }

        // OWASP A03: Generate secure random filename to prevent path traversal
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            // Validate extension
            extension = extension.toLowerCase().replaceAll("[^.a-z]", "");
        }

        String filename = UUID.randomUUID().toString() + extension;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        Path targetLocation = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        log.info("Stored file: {}", filename);
        return "/api/files/" + filename;
    }

    public void deleteFile(String fileUrl) {
        try {
            String filename = fileUrl.replace("/api/files/", "");
            // OWASP A03: Prevent path traversal
            filename = Paths.get(filename).getFileName().toString();

            Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }
}

