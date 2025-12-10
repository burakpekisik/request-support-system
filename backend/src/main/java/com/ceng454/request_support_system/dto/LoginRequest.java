package com.ceng454.request_support_system.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    
    @NotBlank(message = "TC Kimlik Numarası boş olamaz")
    private String tcNumber;

    @NotBlank(message = "Şifre boş olamaz")
    private String password;

    // Constructors
    public LoginRequest() {
    }

    public LoginRequest(String tcNumber, String password) {
        this.tcNumber = tcNumber;
        this.password = password;
    }

    // Getters and Setters
    public String getTcNumber() {
        return tcNumber;
    }

    public void setTcNumber(String tcNumber) {
        this.tcNumber = tcNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}