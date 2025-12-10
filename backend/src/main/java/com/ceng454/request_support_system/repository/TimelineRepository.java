package com.ceng454.request_support_system.repository;


import com.ceng454.request_support_system.model.RequestTimeline;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class TimelineRepository {

    private final JdbcTemplate jdbcTemplate;

    public void save(RequestTimeline timeline) {
        String sql = "INSERT INTO request_timeline (request_id, actor_id, previous_status_id, new_status_id, comment, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
        jdbcTemplate.update(sql, timeline.getRequestId(), timeline.getActorId(), timeline.getPreviousStatusId(), timeline.getNewStatusId(), timeline.getComment());
    }

    // Bir talebin tüm tarihçesini getir (Sohbet geçmişi gibi)
    public List<RequestTimeline> findByRequestId(Long requestId) {
        String sql = """
            SELECT t.*, u.first_name, u.last_name 
            FROM request_timeline t 
            JOIN users u ON t.actor_id = u.id 
            WHERE request_id = ? 
            ORDER BY t.created_at ASC
        """;

        // Not: Burada User bilgilerini de DTO ile dönmek daha doğru olur ama basit tutuyoruz.
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