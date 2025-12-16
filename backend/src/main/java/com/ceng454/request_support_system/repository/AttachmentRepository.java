package com.ceng454.request_support_system.repository;


import com.ceng454.request_support_system.model.Attachment;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AttachmentRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Attachment> attachmentRowMapper = (rs, rowNum) -> {
        Attachment a = new Attachment();
        a.setId(rs.getLong("id"));
        a.setRequestId(rs.getLong("request_id"));
        a.setUploaderId(rs.getLong("uploader_id"));
        
        Long timelineId = rs.getLong("timeline_id");
        a.setTimelineId(rs.wasNull() ? null : timelineId);
        
        a.setFileName(rs.getString("file_name"));
        a.setFilePath(rs.getString("file_path"));
        a.setFileType(rs.getString("file_type"));
        a.setFileSizeMb(rs.getBigDecimal("file_size_mb"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        a.setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null);
        
        return a;
    };

    public Long save(Attachment attachment) {
        String sql = "INSERT INTO attachments (request_id, uploader_id, timeline_id, file_name, file_path, file_type, file_size_mb, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, attachment.getRequestId());
            ps.setLong(2, attachment.getUploaderId());
            if (attachment.getTimelineId() != null) {
                ps.setLong(3, attachment.getTimelineId());
            } else {
                ps.setNull(3, java.sql.Types.BIGINT);
            }
            ps.setString(4, attachment.getFileName());
            ps.setString(5, attachment.getFilePath());
            ps.setString(6, attachment.getFileType());
            ps.setBigDecimal(7, attachment.getFileSizeMb());
            return ps;
        }, keyHolder);
        
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public List<Attachment> findByRequestId(Long requestId) {
        String sql = "SELECT * FROM attachments WHERE request_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, attachmentRowMapper, requestId);
    }

    public List<Attachment> findByTimelineId(Long timelineId) {
        String sql = "SELECT * FROM attachments WHERE timeline_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, attachmentRowMapper, timelineId);
    }

    public List<Attachment> findByUploaderId(Long uploaderId) {
        String sql = "SELECT * FROM attachments WHERE uploader_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, attachmentRowMapper, uploaderId);
    }

    /**
     * Find original request attachments (where timeline_id is null)
     */
    public List<Attachment> findOriginalAttachmentsByRequestId(Long requestId) {
        String sql = "SELECT * FROM attachments WHERE request_id = ? AND timeline_id IS NULL ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, attachmentRowMapper, requestId);
    }
}