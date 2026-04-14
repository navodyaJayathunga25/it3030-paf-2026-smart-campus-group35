package com.smartcampus.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceType, String id) {
        super(resourceType + " not found with id: " + id);
    }
}
