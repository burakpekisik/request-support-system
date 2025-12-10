package com.ceng454.request_support_system.dto;

import lombok.Data;
import java.time.LocalDateTime;
 
@Data
public class RequestDetailDto {
    private Long id;
    private String title;
    private String status;
    private String statusColor; // Frontend'de renklendirme için (#FF0000 gibi)
    private String unitName;
    private String priority;
    private LocalDateTime createdAt;
    // İhtiyaca göre eklenebilir:
    // private String requesterName; 
    // private String assignedOfficerName;
}