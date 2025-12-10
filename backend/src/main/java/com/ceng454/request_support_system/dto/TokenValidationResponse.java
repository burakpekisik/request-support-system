package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Detaylı token validation response
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {
    private boolean valid;
    private Long userId;
    private String tcNumber;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;
}