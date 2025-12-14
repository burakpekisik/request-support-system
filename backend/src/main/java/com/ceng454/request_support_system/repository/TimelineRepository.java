package com.ceng454.request_support_system.repository;


import com.ceng454.request_support_system.dto.TimelineEntryDto;
import com.ceng454.request_support_system.model.RequestTimeline;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class TimelineRepository {

    private final JdbcTemplate jdbcTemplate;

    public Long save(RequestTimeline timeline) {
        String sql = "INSERT INTO request_timeline (request_id, actor_id, previous_status_id, new_status_id, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, timeline.getRequestId());
            ps.setLong(2, timeline.getActorId());
            if (timeline.getPreviousStatusId() != null) {
                ps.setInt(3, timeline.getPreviousStatusId());
            } else {
                ps.setNull(3, java.sql.Types.INTEGER);
            }
            ps.setInt(4, timeline.getNewStatusId());
            ps.setString(5, timeline.getComment());
            return ps;
        }, keyHolder);
        
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    // Bir talebin tüm tarihçesini getir (Sohbet geçmişi gibi) - DTO olarak döner
    public List<TimelineEntryDto> findByRequestIdAsDto(Long requestId) {
        String sql = """
            SELECT 
                t.id,
                t.request_id,
                t.actor_id,
                t.previous_status_id,
                t.new_status_id,
                t.comment,
                t.created_at,
                CONCAT(u.first_name, ' ', u.last_name) as actor_name,
                u.avatar_url as actor_avatar_url,
                COALESCE(r.name, 'USER') as actor_role,
                ps.name as previous_status_name,
                ns.name as new_status_name
            FROM request_timeline t 
            INNER JOIN users u ON t.actor_id = u.id 
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            LEFT JOIN statuses ps ON t.previous_status_id = ps.id
            INNER JOIN statuses ns ON t.new_status_id = ns.id
            WHERE t.request_id = ? 
            ORDER BY t.created_at ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> TimelineEntryDto.builder()
                .id(rs.getLong("id"))
                .requestId(rs.getLong("request_id"))
                .actorId(rs.getLong("actor_id"))
                .actorName(rs.getString("actor_name"))
                .actorAvatarUrl(rs.getString("actor_avatar_url"))
                .actorRole(rs.getString("actor_role"))
                .previousStatusId(rs.getObject("previous_status_id", Integer.class))
                .previousStatus(rs.getString("previous_status_name"))
                .newStatusId(rs.getInt("new_status_id"))
                .newStatus(rs.getString("new_status_name"))
                .comment(rs.getString("comment"))
                .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
                .build(), requestId);
    }

    // Eski metod (uyumluluk için)
    public List<RequestTimeline> findByRequestId(Long requestId) {
        String sql = """
            SELECT t.*, u.first_name, u.last_name 
            FROM request_timeline t 
            JOIN users u ON t.actor_id = u.id 
            WHERE request_id = ? 
            ORDER BY t.created_at ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            RequestTimeline t = new RequestTimeline();
            t.setId(rs.getLong("id"));
            t.setRequestId(rs.getLong("request_id"));
            t.setActorId(rs.getLong("actor_id"));
            t.setPreviousStatusId(rs.getObject("previous_status_id", Integer.class));
            t.setNewStatusId(rs.getInt("new_status_id"));
            t.setComment(rs.getString("comment"));
            t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return t;
        }, requestId);
    }
}