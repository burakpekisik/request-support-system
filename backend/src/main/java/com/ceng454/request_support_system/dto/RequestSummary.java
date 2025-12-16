package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestSummary {
    private Long id;
    private String title;
    private String description;
    private String requesterName;
    private String requesterEmail;
    private String requesterAvatarUrl;
    private String category;
    private String priority;
    private String status;
    private Integer statusId;
    private String unitName;
    private Long assignedOfficerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
