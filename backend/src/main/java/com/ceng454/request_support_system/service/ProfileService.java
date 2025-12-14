package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.UpdateProfileDto;
import com.ceng454.request_support_system.model.User;
import com.ceng454.request_support_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    @Value("${app.upload.avatar.dir}")
    private String avatarUploadDir;

    @Value("${app.upload.avatar.allowed-extensions}")
    private String allowedImageExtensionsConfig;

    @Value("${app.upload.avatar.max-size}")
    private long maxAvatarSize;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private List<String> getAllowedImageExtensions() {
        return Arrays.asList(allowedImageExtensionsConfig.split(","));
    }

    /**
     * Kullanıcı profilini güncelle
     * SOLID Principles:
     * - Single Responsibility: Sadece profil güncelleme işlemlerinden sorumlu
     * - Dependency Inversion: UserRepository abstraction'a bağımlı
     */
    @Transactional
    public void updateProfile(Long userId, UpdateProfileDto dto) {
        // 1. Kullanıcının var olup olmadığını kontrol et
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Email değişti mi ve başka birisi tarafından kullanılıyor mu kontrol et
        if (!user.getEmail().equals(dto.getEmail())) {
            if (userRepository.existsByEmailExcludingUser(dto.getEmail(), userId)) {
                throw new RuntimeException("Email is already in use by another user");
            }
        }

        // 3. Profil bilgilerini güncelle
        userRepository.updateProfile(
            userId,
            dto.getFirstName(),
            dto.getLastName(),
            dto.getEmail(),
            dto.getPhoneNumber()
        );
    }

    /**
     * Kullanıcı avatar'ini yükle ve güncelle
     */
    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        // 1. Kullanıcının var olup olmadığını kontrol et
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Dosya boş mu kontrol et
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // 3. Dosya boyutu kontrolü
        if (file.getSize() > maxAvatarSize) {
            throw new RuntimeException("File size exceeds maximum allowed size of 5MB");
        }

        // 4. Dosya uzantısı kontrolü
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        }

        if (!getAllowedImageExtensions().contains(fileExtension)) {
            throw new RuntimeException("Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP images are allowed.");
        }

        // 5. Upload dizinini oluştur
        File uploadDirFile = new File(avatarUploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        // 6. Benzersiz dosya adı oluştur
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
        String filePath = avatarUploadDir + uniqueFilename;

        // 7. Dosyayı kaydet
        Path path = Paths.get(filePath);
        Files.write(path, file.getBytes());

        // 8. Veritabanında avatar URL'sini güncelle
        String avatarUrl = "/" + filePath;
        userRepository.updateAvatarUrl(userId, avatarUrl);

        return avatarUrl;
    }
}
