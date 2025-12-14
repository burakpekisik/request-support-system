package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private BigDecimal fileSizeMb;
}
