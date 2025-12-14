package com.ceng454.request_support_system.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Request {
    private Long id;
    private Long requesterId;       // User ID
    private Integer unitId;         // Unit ID
    private Integer categoryId;     // Category ID
    private Integer priorityId;     // Priority ID
    private Long assignedOfficerId; // User ID (Nullable)
    private Integer currentStatusId;// Status ID

    private String title;
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}