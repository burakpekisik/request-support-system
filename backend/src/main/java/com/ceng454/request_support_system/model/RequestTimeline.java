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
public class RequestTimeline {
    private Long id;
    private Long requestId;
    private Long actorId;           // İşlemi yapan kişi
    private Integer previousStatusId;
    private Integer newStatusId;
    private String comment;
    private LocalDateTime createdAt;


}