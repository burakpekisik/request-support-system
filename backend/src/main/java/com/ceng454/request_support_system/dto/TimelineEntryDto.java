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
public class TimelineEntryDto {
    private Long id;
    private Long requestId;
    
    // Actor info
    private Long actorId;
    private String actorName;
    private String actorAvatarUrl;
    private String actorRole; // STUDENT, OFFICER, ADMIN
    
    // Status change info
    private Integer previousStatusId;
    private String previousStatus;
    private Integer newStatusId;
    private String newStatus;
    
    // Comment/message
    private String comment;
    
    // Attachments for this timeline entry
    private List<AttachmentDto> attachments;
    
    // Timestamp
    private LocalDateTime createdAt;
}
