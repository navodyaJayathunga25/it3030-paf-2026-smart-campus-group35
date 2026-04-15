package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceRequest;
import com.smartcampus.backend.dto.response.ApiResponse;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * GET /api/resources - List all resources with optional filters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Resource>>> getResources(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
            ApiResponse.success(resourceService.getAllResources(type, status, search))
        );
    }

    /**
     * GET /api/resources/{id} - Get resource by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Resource>> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getResourceById(id)));
    }

    /**
     * POST /api/resources - Create a new resource (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> createResource(
        @Valid @RequestBody ResourceRequest request) {
        Resource resource = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Resource created successfully", resource));
    }

    /**
     * PUT /api/resources/{id} - Update resource (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Resource>> updateResource(
        @PathVariable String id,
        @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("Resource updated successfully", resourceService.updateResource(id, request))
        );
    }

    /**
     * DELETE /api/resources/{id} - Delete resource (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }
}

