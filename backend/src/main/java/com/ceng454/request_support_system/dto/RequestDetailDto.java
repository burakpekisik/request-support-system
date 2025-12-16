package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
 
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDetailDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private Integer statusId;
    private String statusColor;
    private String unitName;
    private Integer unitId;
    private String priority;
    private String priorityColor;
    private Integer priorityId;
    private String category;
    private Integer categoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Requester info
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterAvatarUrl;
    
    // Assigned officer info
    private Long assignedOfficerId;
    private String assignedOfficerName;
    
    // Original request attachments
    private List<AttachmentDto> attachments;
}