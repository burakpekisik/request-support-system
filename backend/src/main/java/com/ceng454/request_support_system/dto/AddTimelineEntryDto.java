package com.ceng454.request_support_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddTimelineEntryDto {
    private Long requestId; // PathVariable'dan da alınabilir

    @NotNull(message = "Yeni durum seçilmelidir")
    private Integer newStatusId; // 2: İşlemde, 3: Çözüldü vb.

    // private Integer currentStatusId; // Güvenlik kontrolü için eski durum da istenebilir

    private String comment; // Cevap metni
}