package com.ceng454.request_support_system.service;

import com.nimbusds.jose.jwk.OctetSequenceKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}") // 24 saat
    private long jwtExpiration;

    private JwtEncoder jwtEncoder;
    private JwtDecoder jwtDecoder;

    // JWT Encoder oluştur - Basitleştirilmiş versiyon
    private JwtEncoder getJwtEncoder() {
        if (jwtEncoder == null) {
            SecretKey key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            
            // OctetSequenceKey oluştur - algorithm kullanmadan
            OctetSequenceKey jwk = new OctetSequenceKey.Builder(key.getEncoded())
                    .build();
            
            jwtEncoder = new NimbusJwtEncoder((jwkSelector, context) -> 
                java.util.Collections.singletonList(jwk)
            );
        }
        return jwtEncoder;
    }

    // JWT Decoder oluştur
    private JwtDecoder getJwtDecoder() {
        if (jwtDecoder == null) {
            SecretKey key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            jwtDecoder = NimbusJwtDecoder.withSecretKey(key)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }
        return jwtDecoder;
    }

    // Token oluştur
    public String generateToken(String tcNumber, Long userId, String role) {
        Instant now = Instant.now();
        Instant expiration = now.plusMillis(jwtExpiration);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("http://localhost:8080")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(tcNumber)
                .claim("userId", userId)
                .claim("role", role)
                .build();

        // Encoder parametrelerinde algoritma belirt
        JwtEncoderParameters parameters = JwtEncoderParameters.from(
            JwsHeader.with(MacAlgorithm.HS256).build(),
            claims
        );

        return getJwtEncoder().encode(parameters).getTokenValue();
    }

    // Token'dan TC Number çıkar
    public String extractTcNumber(String token) {
        Jwt jwt = getJwtDecoder().decode(token);
        return jwt.getSubject();
    }

    // Token'dan User ID çıkar
    public Long extractUserId(String token) {
        Jwt jwt = getJwtDecoder().decode(token);
        return jwt.getClaim("userId");
    }

    // Token'dan Role çıkar
    public String extractRole(String token) {
        Jwt jwt = getJwtDecoder().decode(token);
        return jwt.getClaim("role");
    }

    // Token geçerli mi kontrol et
    public boolean validateToken(String token) {
        try {
            Jwt jwt = getJwtDecoder().decode(token);
            return jwt.getExpiresAt() != null && !jwt.getExpiresAt().isBefore(Instant.now());
        } catch (Exception e) {
            return false;
        }
    }

    // Token'dan tüm bilgileri al
    public Jwt decodeToken(String token) {
        return getJwtDecoder().decode(token);
    }
}