package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Basit token check response
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenCheckResponse {
    private boolean valid;
    private String message;
}