package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.CreateRequestDto;
import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.service.OfficerService;
import com.ceng454.request_support_system.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CommonController {

    @Autowired
    private OfficerService officerService;

    @Autowired
    private RequestService requestService;

    private static final String UPLOAD_DIR = "uploads/attachments/";
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "png", "jpg", "jpeg", "docx");

    /**
     * Get all categories (shared endpoint for all users)
     * GET /api/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        try {
            List<Map<String, Object>> categories = officerService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all units (shared endpoint for all users)
     * GET /api/units
     */
    @GetMapping("/units")
    public ResponseEntity<?> getUnits() {
        try {
            List<Map<String, Object>> units = officerService.getAllUnits();
            return ResponseEntity.ok(units);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get user's own submitted requests (shared endpoint for all users)
     * GET /api/my-requests?status=all&category=all&search=&sortBy=createdAt&sortOrder=desc&page=0&size=20
     */
    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            List<RequestSummary> requests = officerService.getMyRequests(
                userId, status, category, search, sortBy, sortOrder, page, size
            );
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Create new request (shared endpoint for all users)
     * POST /api/requests
     */
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("unitId") Integer unitId,
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());

            CreateRequestDto dto = new CreateRequestDto();
            dto.setTitle(title);
            dto.setDescription(description);
            dto.setUnitId(unitId);
            dto.setCategoryId(categoryId);

            // Dosya yükleme işlemi
            if (files != null && files.length > 0) {
                // Upload dizinini oluştur
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                // Tüm dosyaları işle
                for (MultipartFile file : files) {
                    if (!file.isEmpty()) {
                        // Dosya uzantısı kontrolü
                        String originalFilename = file.getOriginalFilename();
                        String fileExtension = "";
                        if (originalFilename != null && originalFilename.contains(".")) {
                            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
                        }

                        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
                            return ResponseEntity.badRequest().body(
                                Map.of("error", "Invalid file type: " + originalFilename + ". Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.")
                            );
                        }

                        // Benzersiz dosya adı oluştur
                        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
                        String filePath = UPLOAD_DIR + uniqueFilename;

                        // Dosyayı kaydet
                        Path path = Paths.get(filePath);
                        Files.write(path, file.getBytes());

                        // Dosya boyutunu MB olarak hesapla
                        double fileSizeMb = file.getSize() / (1024.0 * 1024.0);

                        // FileInfo oluştur ve listeye ekle
                        CreateRequestDto.FileInfo fileInfo = new CreateRequestDto.FileInfo();
                        fileInfo.setFileName(originalFilename);
                        fileInfo.setFilePath(filePath);
                        fileInfo.setFileType(fileExtension);
                        fileInfo.setFileSizeMb(Math.round(fileSizeMb * 100.0) / 100.0);
                        dto.getFiles().add(fileInfo);
                    }
                }
            }

            requestService.createRequest(dto, userId);
            return ResponseEntity.ok(Map.of("message", "Request created successfully"));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
