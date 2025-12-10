package com.ceng454.request_support_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    
    @NotBlank(message = "TC Kimlik Numarası boş olamaz")
    @Pattern(regexp = "^[0-9]{11}$", message = "TC Kimlik Numarası 11 haneli olmalıdır")
    private String tcNumber;

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;

    @NotBlank(message = "Şifre boş olamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;

    @NotBlank(message = "Ad boş olamaz")
    private String firstName;

    @NotBlank(message = "Soyad boş olamaz")
    private String lastName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Telefon numarası 10 haneli olmalıdır")
    private String phoneNumber;

    // Constructors
    public RegisterRequest() {
    }

    public RegisterRequest(String tcNumber, String email, String password, 
                          String firstName, String lastName, String phoneNumber) {
        this.tcNumber = tcNumber;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
    }

    // Getters and Setters
    public String getTcNumber() {
        return tcNumber;
    }

    public void setTcNumber(String tcNumber) {
        this.tcNumber = tcNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}