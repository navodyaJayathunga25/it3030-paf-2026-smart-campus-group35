package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getResources(String type, String location, Integer capacity, String status) {
        List<Resource> resources = resourceRepository.findAll();

        if (StringUtils.hasText(type)) {
            try {
                Resource.ResourceType resourceType = Resource.ResourceType.valueOf(type.toUpperCase());
                resources = resources.stream()
                        .filter(r -> r.getType() == resourceType)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid resource type filter: {}", type);
            }
        }

        if (StringUtils.hasText(location)) {
            String locationLower = location.toLowerCase();
            resources = resources.stream()
                    .filter(r -> r.getLocation() != null &&
                            r.getLocation().toLowerCase().contains(locationLower))
                    .collect(Collectors.toList());
        }

        if (capacity != null && capacity > 0) {
            resources = resources.stream()
                    .filter(r -> r.getCapacity() >= capacity)
                    .collect(Collectors.toList());
        }

        if (StringUtils.hasText(status)) {
            try {
                Resource.ResourceStatus resourceStatus = Resource.ResourceStatus.valueOf(status.toUpperCase());
                resources = resources.stream()
                        .filter(r -> r.getStatus() == resourceStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid resource status filter: {}", status);
            }
        }

        return resources;
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", id));
    }

    public Resource createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : Resource.ResourceStatus.ACTIVE)
                .availabilityWindows(request.getAvailabilityWindows())
                .description(request.getDescription())
                .build();

        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, ResourceRequest request) {
        Resource resource = getResourceById(id);

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }
        resource.setAvailabilityWindows(request.getAvailabilityWindows());
        resource.setDescription(request.getDescription());

        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }
}
