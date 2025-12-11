package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.AddTimelineEntryDto;
import com.ceng454.request_support_system.dto.CreateRequestDto;
import com.ceng454.request_support_system.dto.RequestDetailDto;
import com.ceng454.request_support_system.model.Attachment;
import com.ceng454.request_support_system.model.Request;
import com.ceng454.request_support_system.model.RequestTimeline;
import com.ceng454.request_support_system.repository.AttachmentRepository;
import com.ceng454.request_support_system.repository.RequestRepository;
import com.ceng454.request_support_system.repository.TimelineRepository;
import com.ceng454.request_support_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final TimelineRepository timelineRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

    // --- SENARYO 1: YENİ TALEP OLUŞTURMA ---
    @Transactional
    public void createRequest(CreateRequestDto dto, Long userId) {
        // 1. Request Modeli Oluştur
        Request request = new Request();
        request.setRequesterId(userId);
        request.setUnitId(dto.getUnitId());
        request.setCategoryId(dto.getCategoryId());
        // Priority null ise Medium (2) olarak ata
        request.setPriorityId(dto.getPriorityId() != null ? dto.getPriorityId() : 2);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setCurrentStatusId(1); // ID 1 = "Beklemede" (Database seed verisine göre)

        // 2. Request'i Kaydet ve ID'sini al
        Long requestId = requestRepository.save(request);

        // 3. Timeline'a (Tarihçe) İlk Kaydı At
        RequestTimeline timeline = new RequestTimeline();
        timeline.setRequestId(requestId);
        timeline.setActorId(userId);
        timeline.setPreviousStatusId(null); // İlk kayıt
        timeline.setNewStatusId(1);
        timeline.setComment("Talep oluşturuldu.");
        timelineRepository.save(timeline);

        // 4. Dosyaları Kaydet (Opsiyonel)
        if (dto.getFiles() != null && !dto.getFiles().isEmpty()) {
            for (CreateRequestDto.FileInfo fileInfo : dto.getFiles()) {
                Attachment attachment = new Attachment();
                attachment.setRequestId(requestId);
                attachment.setUploaderId(userId);
                attachment.setTimelineId(null); // Talep açılışında yüklendi
                attachment.setFileName(fileInfo.getFileName());
                attachment.setFilePath(fileInfo.getFilePath());
                attachment.setFileType(fileInfo.getFileType() != null ? fileInfo.getFileType() : "unknown");
                
                // Double'ı BigDecimal'e çevir
                if (fileInfo.getFileSizeMb() != null) {
                    attachment.setFileSizeMb(BigDecimal.valueOf(fileInfo.getFileSizeMb()));
                }

                attachmentRepository.save(attachment);
            }
        }
    }

    // --- SENARYO 2: TALEBİ LİSTELEME ---
    public List<Map<String, Object>> getMyRequests(Long userId) {
        return requestRepository.findRequestsByRequesterId(userId);
    }

    public List<Map<String, Object>> getOfficerRequests(Long officerId) {
        // Personelin sorumlu olduğu birimlerin ID'lerini bul
        List<Integer> unitIds = userRepository.findUnitIdsByOfficerId(officerId);

        // O birimlere gelen talepleri getir
        return requestRepository.findRequestsByUnitIds(unitIds);
    }

    // --- SENARYO 3: CEVAP VERME / DURUM DEĞİŞTİRME ---
    @Transactional
    public void addResponse(Long requestId, AddTimelineEntryDto dto, Long officerId) {
        // Not: Burada 'requestId'ye ait eski statüyü çekmek için repo'ya 'findById' eklenebilir.
        // Şimdilik dto'dan geldiğini varsayıyoruz veya null geçiyoruz.

        // 1. Timeline Kaydı (Cevap/Hareket)
        RequestTimeline timeline = new RequestTimeline();
        timeline.setRequestId(requestId);
        timeline.setActorId(officerId);
        timeline.setNewStatusId(dto.getNewStatusId()); // Örn: 2 (İşlemde), 4 (Çözüldü)
        timeline.setComment(dto.getComment());
        timelineRepository.save(timeline);

        // 2. Ana Tabloyu (Request) Güncelle (Denormalizasyon)
        // Officer işlem yaptığı için talep ona atanır (assignedOfficerId = officerId)
        requestRepository.updateStatusAndAssignment(requestId, dto.getNewStatusId(), officerId);
    }
}