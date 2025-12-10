package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.RegisterRequest;
import com.ceng454.request_support_system.dto.AuthResponse;
import com.ceng454.request_support_system.model.User;
import com.ceng454.request_support_system.repository.UserRepository;
import com.ceng454.request_support_system.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        // Email kontrolü
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Yeni user oluştur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // User'ı kaydet
        User savedUser = userRepository.save(user);

        // JWT token oluştur
        String token = jwtTokenProvider.generateToken(savedUser.getId());

        // Response oluştur
        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getName()
        );
    }
}