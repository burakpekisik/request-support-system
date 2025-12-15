package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.AddTimelineEntryDto;
import com.ceng454.request_support_system.dto.CreateRequestDto;
import com.ceng454.request_support_system.dto.RequestDetailDto;
import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.dto.TimelineEntryDto;
import com.ceng454.request_support_system.dto.UpdateProfileDto;
import com.ceng454.request_support_system.enums.Status;
import com.ceng454.request_support_system.model.Attachment;
import com.ceng454.request_support_system.model.RequestTimeline;
import com.ceng454.request_support_system.repository.RequestRepository;
import com.ceng454.request_support_system.repository.TimelineRepository;
import com.ceng454.request_support_system.repository.UserRepository;
import com.ceng454.request_support_system.service.AttachmentService;
import com.ceng454.request_support_system.service.OfficerService;
import com.ceng454.request_support_system.service.ProfileService;
import com.ceng454.request_support_system.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.LocalDateTime;
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

    @Autowired
    private ProfileService profileService;

    @Autowired
    private AttachmentService attachmentService;

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private TimelineRepository timelineRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.upload.attachment.dir}")
    private String uploadDir;

    @Value("${app.upload.attachment.allowed-extensions}")
    private String allowedExtensionsConfig;

    private List<String> getAllowedExtensions() {
        return Arrays.asList(allowedExtensionsConfig.split(","));
    }

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
                File uploadDirFile = new File(uploadDir);
                if (!uploadDirFile.exists()) {
                    uploadDirFile.mkdirs();
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

                        if (!getAllowedExtensions().contains(fileExtension)) {
                            return ResponseEntity.badRequest().body(
                                Map.of("error", "Invalid file type: " + originalFilename + ". Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.")
                            );
                        }

                        // Benzersiz dosya adı oluştur
                        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
                        String filePath = uploadDir + uniqueFilename;

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

    /**
     * Update user profile (shared endpoint for all users)
     * PUT /api/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileDto dto,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            profileService.updateProfile(userId, dto);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Upload user avatar (shared endpoint for all users)
     * POST /api/profile/avatar
     */
    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            String avatarUrl = profileService.uploadAvatar(userId, file);
            return ResponseEntity.ok(Map.of(
                "message", "Avatar uploaded successfully",
                "avatarUrl", avatarUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get single request details by ID
     * GET /api/requests/{id}
     */
    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getRequestDetail(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Map<String, Object> requestData = requestRepository.findById(id);
            
            if (requestData == null) {
                return ResponseEntity.notFound().build();
            }

            RequestDetailDto dto = RequestDetailDto.builder()
                    .id(((Number) requestData.get("id")).longValue())
                    .title((String) requestData.get("title"))
                    .description((String) requestData.get("description"))
                    .status((String) requestData.get("status_name"))
                    .statusId(((Number) requestData.get("current_status_id")).intValue())
                    .statusColor((String) requestData.get("status_color"))
                    .unitName((String) requestData.get("unit_name"))
                    .unitId(((Number) requestData.get("unit_id")).intValue())
                    .priority((String) requestData.get("priority_name"))
                    .priorityColor((String) requestData.get("priority_color"))
                    .priorityId(((Number) requestData.get("priority_id")).intValue())
                    .category((String) requestData.get("category_name"))
                    .categoryId(((Number) requestData.get("category_id")).intValue())
                    .createdAt(convertToLocalDateTime(requestData.get("created_at")))
                    .updatedAt(convertToLocalDateTime(requestData.get("updated_at")))
                    .requesterId(((Number) requestData.get("requester_id")).longValue())
                    .requesterName((String) requestData.get("requester_name"))
                    .requesterEmail((String) requestData.get("requester_email"))
                    .requesterAvatarUrl((String) requestData.get("requester_avatar_url"))
                    .assignedOfficerId(requestData.get("assigned_officer_id") != null ? 
                            ((Number) requestData.get("assigned_officer_id")).longValue() : null)
                    .assignedOfficerName((String) requestData.get("assigned_officer_name"))
                    .build();

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Helper method to convert database date to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(Object dateObj) {
        if (dateObj == null) {
            return null;
        }
        if (dateObj instanceof LocalDateTime) {
            return (LocalDateTime) dateObj;
        }
        if (dateObj instanceof Timestamp) {
            return ((Timestamp) dateObj).toLocalDateTime();
        }
        return null;
    }

    /**
     * Get timeline/conversation history for a request
     * GET /api/requests/{id}/timeline
     */
    @GetMapping("/requests/{id}/timeline")
    public ResponseEntity<?> getRequestTimeline(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            List<TimelineEntryDto> timeline = timelineRepository.findByRequestIdAsDto(id);
            
            // Fetch attachments for each timeline entry
            for (TimelineEntryDto entry : timeline) {
                List<com.ceng454.request_support_system.dto.AttachmentDto> attachments = 
                    attachmentService.getAttachmentDtosByTimelineId(entry.getId());
                entry.setAttachments(attachments);
            }
            
            return ResponseEntity.ok(timeline);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Take ownership of a request (assign to current officer)
     * POST /api/requests/{id}/take-ownership
     */
    @PostMapping("/requests/{id}/take-ownership")
    public ResponseEntity<?> takeOwnership(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());
            
            // Check if request exists
            Map<String, Object> requestData = requestRepository.findById(id);
            if (requestData == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if request is already assigned to someone
            Object assignedOfficerIdObj = requestData.get("assigned_officer_id");
            if (assignedOfficerIdObj != null) {
                Long currentAssignedOfficerId = ((Number) assignedOfficerIdObj).longValue();
                if (currentAssignedOfficerId.equals(officerId)) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "You are already assigned to this request"
                    ));
                }
                // Optional: Prevent taking ownership if already assigned to someone else
                // return ResponseEntity.badRequest().body(Map.of(
                //     "error", "This request is already assigned to another officer"
                // ));
            }
            
            // Get current status
            Integer currentStatusId = requestRepository.getCurrentStatusId(id);
            
            // If request is pending (status 1), change to in_progress (status 2)
            Integer newStatusId = currentStatusId;
            if (currentStatusId != null && currentStatusId == 1) {
                newStatusId = 2; // in_progress
            }
            
            // Update request with new officer and optionally new status
            requestRepository.updateStatusAndAssignment(id, newStatusId, officerId);
            
            // Create timeline entry for the ownership change
            RequestTimeline timeline = new RequestTimeline();
            timeline.setRequestId(id);
            timeline.setActorId(officerId);
            timeline.setPreviousStatusId(currentStatusId);
            timeline.setNewStatusId(newStatusId);
            timeline.setComment("Took ownership of this request");
            timelineRepository.save(timeline);
            
            return ResponseEntity.ok(Map.of(
                "message", "Successfully took ownership of the request",
                "newStatusId", newStatusId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mark a request as resolved
     * POST /api/requests/{id}/mark-as-resolved
     */
    @PostMapping("/requests/{id}/mark-as-resolved")
    public ResponseEntity<?> markAsResolved(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());
            
            // Check if request exists
            Map<String, Object> requestData = requestRepository.findById(id);
            if (requestData == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if current user is the assigned officer
            Object assignedOfficerIdObj = requestData.get("assigned_officer_id");
            if (assignedOfficerIdObj == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "This request is not assigned to any officer. Please take ownership first."
                ));
            }
            
            Long assignedOfficerId = ((Number) assignedOfficerIdObj).longValue();
            if (!assignedOfficerId.equals(officerId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "You are not the assigned officer for this request"
                ));
            }
            
            // Get current status
            Integer currentStatusId = requestRepository.getCurrentStatusId(id);
            
            // Check if already resolved or cancelled using Status enum
            if (currentStatusId != null) {
                int resolvedSuccessId = Status.RESOLVED_SUCCESSFULLY.getId();
                int resolvedNegId = Status.RESOLVED_NEGATIVELY.getId();
                int cancelledId = Status.CANCELLED.getId();
                if (currentStatusId == resolvedSuccessId || currentStatusId == resolvedNegId || currentStatusId == cancelledId) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "This request is already resolved or cancelled"
                    ));
                }
            }
            
            // Set status to resolved successfully using Status enum
            Integer newStatusId = Status.RESOLVED_SUCCESSFULLY.getId();
            
            // Update request status
            requestRepository.updateStatus(id, newStatusId);
            
            // Create timeline entry
            RequestTimeline timeline = new RequestTimeline();
            timeline.setRequestId(id);
            timeline.setActorId(officerId);
            timeline.setPreviousStatusId(currentStatusId);
            timeline.setNewStatusId(newStatusId);
            timeline.setComment("Marked request as resolved");
            timelineRepository.save(timeline);
            
            return ResponseEntity.ok(Map.of(
                "message", "Request marked as resolved successfully",
                "newStatusId", newStatusId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Transfer a request to another officer in the same unit
     * POST /api/requests/{id}/transfer
     */
    @PostMapping("/requests/{id}/transfer")
    public ResponseEntity<?> transferToOfficer(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            Authentication authentication
    ) {
        try {
            Long currentOfficerId = Long.parseLong(authentication.getName());
            Long targetOfficerId = body.get("targetOfficerId");
            
            if (targetOfficerId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Target officer ID is required"
                ));
            }
            
            // Check if request exists
            Map<String, Object> requestData = requestRepository.findById(id);
            if (requestData == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verify target officer exists and is in the same unit
            List<Integer> currentOfficerUnits = userRepository.findUnitIdsByOfficerId(currentOfficerId);
            List<Integer> targetOfficerUnits = userRepository.findUnitIdsByOfficerId(targetOfficerId);
            
            boolean hasCommonUnit = currentOfficerUnits.stream()
                    .anyMatch(targetOfficerUnits::contains);
            
            if (!hasCommonUnit) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Target officer is not in the same unit"
                ));
            }
            
            // Get current status
            Integer currentStatusId = requestRepository.getCurrentStatusId(id);
            
            // Update request assignment
            requestRepository.updateStatusAndAssignment(id, currentStatusId, targetOfficerId);
            
            // Create timeline entry
            RequestTimeline timeline = new RequestTimeline();
            timeline.setRequestId(id);
            timeline.setActorId(currentOfficerId);
            timeline.setPreviousStatusId(currentStatusId);
            timeline.setNewStatusId(currentStatusId);
            timeline.setComment("Transferred request to another officer");
            timelineRepository.save(timeline);
            
            return ResponseEntity.ok(Map.of(
                "message", "Request transferred successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add response/comment to a request (updates timeline)
     * POST /api/requests/{id}/responses
     * Supports multipart/form-data for file attachments
     */
    @PostMapping(value = "/requests/{id}/responses", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<?> addResponse(
            @PathVariable Long id,
            @RequestParam("newStatusId") Integer newStatusId,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            Authentication authentication
    ) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            
            // Get current status
            Integer currentStatusId = requestRepository.getCurrentStatusId(id);
            
            // Create timeline entry
            RequestTimeline timeline = new RequestTimeline();
            timeline.setRequestId(id);
            timeline.setActorId(userId);
            timeline.setPreviousStatusId(currentStatusId);
            timeline.setNewStatusId(newStatusId);
            timeline.setComment(comment);
            
            // Save timeline entry and get the generated ID
            Long timelineId = timelineRepository.save(timeline);
            
            // Upload attachments if any
            List<Attachment> savedAttachments = null;
            if (files != null && files.length > 0) {
                savedAttachments = attachmentService.uploadAttachments(id, userId, timelineId, files);
            }
            
            // Update request status if changed
            if (!currentStatusId.equals(newStatusId)) {
                requestRepository.updateStatus(id, newStatusId);
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Response added successfully",
                "timelineId", timelineId,
                "attachmentCount", savedAttachments != null ? savedAttachments.size() : 0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel a request (only by the user who created it)
     * POST /api/requests/{id}/cancel
     */
    @PostMapping("/requests/{id}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {
        try {
            Long currentUserId = Long.parseLong(authentication.getName());

            // Check if request exists
            Map<String, Object> requestData = requestRepository.findById(id);
            if (requestData == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if current user is the requester
            Long requesterId = ((Number) requestData.get("requester_id")).longValue();
            if (!requesterId.equals(currentUserId)) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "You are not authorized to cancel this request"
                ));
            }

            // Get current status
            Integer currentStatusId = requestRepository.getCurrentStatusId(id);
            Integer newStatusId = Status.CANCELLED.getId(); // Status 4

            // Update request status
            requestRepository.updateStatus(id, newStatusId);

            // Create timeline entry
            RequestTimeline timeline = new RequestTimeline();
            timeline.setRequestId(id);
            timeline.setActorId(currentUserId);
            timeline.setPreviousStatusId(currentStatusId);
            timeline.setNewStatusId(newStatusId);
            timeline.setComment("Talep iptal edildi");
            timelineRepository.save(timeline);

            return ResponseEntity.ok(Map.of(
                    "message", "Request cancelled successfully",
                    "newStatusId", newStatusId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
