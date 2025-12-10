package com.ceng454.request_support_system.repository;


import com.ceng454.request_support_system.model.Attachment;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AttachmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public void save(Attachment attachment) {
        String sql = "INSERT INTO attachments (request_id, uploader_id, timeline_id, file_name, file_path, file_type, file_size_mb, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        jdbcTemplate.update(sql, attachment.getRequestId(), attachment.getUploaderId(), attachment.getTimelineId(), attachment.getFileName(), attachment.getFilePath(), attachment.getFileType(), attachment.getFileSizeMb());
    }

    public List<Attachment> findByRequestId(Long requestId) {
        String sql = "SELECT * FROM attachments WHERE request_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Attachment a = new Attachment();
            a.setId(rs.getLong("id"));
            a.setFileName(rs.getString("file_name"));
            a.setFilePath(rs.getString("file_path"));
            // ... diğer alanlar
            return a;
        }, requestId);
    }
}