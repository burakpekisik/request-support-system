package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.*;
import com.ceng454.request_support_system.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + response.getToken())
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok()
                    .header("Authorization", "Bearer " + response.getToken())
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> validateToken(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            String tcNumber = authentication.getName(); // Token'dan TC number
            
            // Token'dan user bilgilerini al ve döndür
            TokenValidationResponse response = authService.validateAndGetUserInfo(tcNumber);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkToken(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok().body(new TokenCheckResponse(true, "Token is valid"));
        }
        return ResponseEntity.status(401).body(new TokenCheckResponse(false, "Token is invalid"));
    }
}