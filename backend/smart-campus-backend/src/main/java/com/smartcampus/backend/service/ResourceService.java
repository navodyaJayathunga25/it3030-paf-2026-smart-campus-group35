package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.ResourceRequest;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources(String type, String status, String search) {
        if (StringUtils.hasText(search)) {
            return resourceRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(search, search);
        }

        if (StringUtils.hasText(type) && StringUtils.hasText(status)) {
            return resourceRepository.findByTypeAndStatus(
                ResourceType.valueOf(type),
                ResourceStatus.valueOf(status)
            );
        }

        if (StringUtils.hasText(type)) {
            return resourceRepository.findByType(ResourceType.valueOf(type));
        }

        if (StringUtils.hasText(status)) {
            return resourceRepository.findByStatus(ResourceStatus.valueOf(status));
        }

        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
    }

    public Resource createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
            .name(request.getName())
            .type(request.getType())
            .capacity(request.getCapacity())
            .location(request.getLocation())
            .building(request.getBuilding())
            .floor(request.getFloor())
            .description(request.getDescription())
            .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
            .amenities(request.getAmenities())
            .availabilityWindows(request.getAvailabilityWindows())
            .build();
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, ResourceRequest request) {
        Resource resource = getResourceById(id);
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        resource.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }
        resource.setAmenities(request.getAmenities());
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }
}

