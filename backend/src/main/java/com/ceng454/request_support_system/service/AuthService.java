package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.AuthResponse;
import com.ceng454.request_support_system.dto.LoginRequest;
import com.ceng454.request_support_system.dto.RegisterRequest;
import com.ceng454.request_support_system.dto.TokenValidationResponse;
import com.ceng454.request_support_system.model.Role;
import com.ceng454.request_support_system.model.User;
import com.ceng454.request_support_system.repository.RoleRepository;
import com.ceng454.request_support_system.repository.UserRepository;
import com.ceng454.request_support_system.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // TC validasyon
        if (!validateTCNumber(request.getTcNumber())) {
            throw new RuntimeException("Geçersiz TC Kimlik Numarası");
        }

        if (userRepository.existsByTcNumber(request.getTcNumber())) {
            throw new RuntimeException("Bu TC Kimlik Numarası zaten kayıtlı");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Bu email zaten kayıtlı");
        }

        // Yeni kullanıcı oluştur
        User user = User.builder()
                .tcNumber(request.getTcNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // STUDENT rolünü ata
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("STUDENT rolü bulunamadı"));
        
        userRoleRepository.assignRole(savedUser.getId(), studentRole.getId());

        // JWT token oluştur
        String token = jwtService.generateToken(
            savedUser.getTcNumber(), 
            savedUser.getId(), 
            "STUDENT"
        );

        return AuthResponse.builder()
                .token(token)
                .userId(savedUser.getId())
                .tcNumber(savedUser.getTcNumber())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .phoneNumber(savedUser.getPhoneNumber())
                .avatarUrl(savedUser.getAvatarUrl())
                .role("STUDENT")
                .message("Kayıt başarılı")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByTcNumber(request.getTcNumber())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Hatalı şifre");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Hesabınız aktif değil");
        }

        // Kullanıcının rollerini al
        List<Role> roles = userRoleRepository.findRolesByUserId(user.getId());
        
        if (roles.isEmpty()) {
            throw new RuntimeException("Kullanıcının rolü tanımlı değil");
        }

        // İlk rolü al (çoklu rol varsa öncelik sırası: ADMIN > OFFICER > STUDENT)
        String primaryRole = determinePrimaryRole(roles);

        String token = jwtService.generateToken(
            user.getTcNumber(), 
            user.getId(), 
            primaryRole
        );

        // Get unit name for officers
        String unitName = null;
        if ("OFFICER".equals(primaryRole)) {
            unitName = userRepository.findUnitNamesByOfficerId(user.getId());
        }

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .tcNumber(user.getTcNumber())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .role(primaryRole)
                .unitName(unitName)
                .message("Giriş başarılı")
                .build();
    }

    // Birden fazla rol varsa öncelik belirle
    private String determinePrimaryRole(List<Role> roles) {
        for (Role role : roles) {
            if ("ADMIN".equals(role.getName())) return "ADMIN";
        }
        for (Role role : roles) {
            if ("OFFICER".equals(role.getName())) return "OFFICER";
        }
        return "STUDENT";
    }

    private boolean validateTCNumber(String tcNumber) {
        if (tcNumber == null || tcNumber.length() != 11 || !tcNumber.matches("\\d+")) {
            return false;
        }
        if (tcNumber.charAt(0) == '0') return false;

        int[] digits = tcNumber.chars().map(c -> c - '0').toArray();
        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        
        int tenthDigit = (oddSum * 7 - evenSum) % 10;
        if (tenthDigit < 0) tenthDigit += 10;
        if (tenthDigit != digits[9]) return false;

        int sum = 0;
        for (int i = 0; i < 10; i++) sum += digits[i];
        return (sum % 10) == digits[10];
    }

    public TokenValidationResponse validateAndGetUserInfo(String tcNumber) {
        User user = userRepository.findByTcNumber(tcNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getIsActive()) {
            throw new RuntimeException("User account is not active");
        }

        // Kullanıcının rollerini al
        List<Role> roles = userRoleRepository.findRolesByUserId(user.getId());
        String primaryRole = determinePrimaryRole(roles);

        return TokenValidationResponse.builder()
                .valid(true)
                .userId(user.getId())
                .tcNumber(user.getTcNumber())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(primaryRole)
                .message("Token is valid")
                .build();
    }
}