package com.smartcampus.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @GetMapping
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("API_BASE_URL", "http://localhost:8080"));
    }
}

