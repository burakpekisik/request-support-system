package com.ceng454.request_support_system.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    private Long id;
    private Long requestId;
    private Long uploaderId;
    private Long timelineId; // Hangi cevapla yüklendi? (Opsiyonel)

    private String fileName;
    private String filePath;
    private String fileType;
    private BigDecimal fileSizeMb;

    private LocalDateTime createdAt;
}