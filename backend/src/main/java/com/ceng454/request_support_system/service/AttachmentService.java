package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.model.Attachment;
import com.ceng454.request_support_system.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Attachment Service
 * SOLID Principles:
 * - Single Responsibility: Only handles attachment upload and management
 * - Open/Closed: Can be extended for different storage backends (S3, etc.)
 * - Dependency Inversion: Depends on AttachmentRepository abstraction
 */
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Value("${app.upload.attachment.dir}")
    private String attachmentUploadDir;

    @Value("${app.upload.attachment.allowed-extensions}")
    private String allowedExtensionsConfig;

    @Value("${spring.servlet.multipart.max-file-size:10MB}")
    private String maxFileSizeConfig;

    private List<String> getAllowedExtensions() {
        return Arrays.asList(allowedExtensionsConfig.split(","));
    }

    private long getMaxFileSize() {
        // Parse max file size from config (e.g., "10MB" -> 10485760)
        String size = maxFileSizeConfig.toUpperCase().replace("MB", "").trim();
        try {
            return Long.parseLong(size) * 1024 * 1024;
        } catch (NumberFormatException e) {
            return 10 * 1024 * 1024; // Default 10MB
        }
    }

    /**
     * Upload attachments for a timeline entry
     * @param requestId The request ID
     * @param uploaderId The user who uploaded the files
     * @param timelineId The timeline entry ID (response)
     * @param files Array of files to upload
     * @return List of saved attachments
     */
    @Transactional
    public List<Attachment> uploadAttachments(Long requestId, Long uploaderId, Long timelineId, MultipartFile[] files) throws IOException {
        List<Attachment> savedAttachments = new ArrayList<>();

        if (files == null || files.length == 0) {
            return savedAttachments;
        }

        // Create upload directory if not exists
        File uploadDirFile = new File(attachmentUploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            // Validate file
            validateFile(file);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
            String filePath = attachmentUploadDir + uniqueFilename;

            // Save file to disk
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());

            // Calculate file size in MB
            BigDecimal fileSizeMb = BigDecimal.valueOf(file.getSize())
                    .divide(BigDecimal.valueOf(1024 * 1024), 4, RoundingMode.HALF_UP);

            // Create attachment record
            Attachment attachment = Attachment.builder()
                    .requestId(requestId)
                    .uploaderId(uploaderId)
                    .timelineId(timelineId)
                    .fileName(originalFilename)
                    .filePath(filePath)
                    .fileType(file.getContentType())
                    .fileSizeMb(fileSizeMb)
                    .build();

            // Save to database
            attachmentRepository.save(attachment);
            savedAttachments.add(attachment);
        }

        return savedAttachments;
    }

    /**
     * Validate file before upload
     */
    private void validateFile(MultipartFile file) {
        // Check file size
        if (file.getSize() > getMaxFileSize()) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }

        // Check file extension
        String fileExtension = getFileExtension(file.getOriginalFilename());
        if (!getAllowedExtensions().contains(fileExtension)) {
            throw new RuntimeException("Invalid file type. Allowed types: " + String.join(", ", getAllowedExtensions()));
        }
    }

    /**
     * Get file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Get attachments by request ID
     */
    public List<Attachment> getAttachmentsByRequestId(Long requestId) {
        return attachmentRepository.findByRequestId(requestId);
    }

    /**
     * Get attachments by timeline ID
     */
    public List<Attachment> getAttachmentsByTimelineId(Long timelineId) {
        return attachmentRepository.findByTimelineId(timelineId);
    }

    /**
     * Get attachments as DTOs by timeline ID
     */
    public List<com.ceng454.request_support_system.dto.AttachmentDto> getAttachmentDtosByTimelineId(Long timelineId) {
        List<Attachment> attachments = attachmentRepository.findByTimelineId(timelineId);
        return attachments.stream()
                .map(a -> com.ceng454.request_support_system.dto.AttachmentDto.builder()
                        .id(a.getId())
                        .fileName(a.getFileName())
                        .filePath(a.getFilePath())
                        .fileType(a.getFileType())
                        .fileSizeMb(a.getFileSizeMb())
                        .build())
                .toList();
    }
}
