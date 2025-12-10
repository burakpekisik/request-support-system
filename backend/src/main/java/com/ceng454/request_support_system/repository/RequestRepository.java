package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class RequestRepository {

    private final JdbcTemplate jdbcTemplate;

    // Talep Oluşturma (Auto-increment ID'yi geri döner)
    public Long save(Request request) {
        String sql = "INSERT INTO requests (requester_id, unit_id, category_id, priority_id, current_status_id, title, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, request.getRequesterId());
            ps.setInt(2, request.getUnitId());
            ps.setInt(3, request.getCategoryId());
            ps.setInt(4, request.getPriorityId());
            ps.setInt(5, request.getCurrentStatusId());
            ps.setString(6, request.getTitle());
            ps.setString(7, request.getDescription());
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    // Durum ve Atama Güncelleme (Denormalize alanları günceller)
    public void updateStatusAndAssignment(Long requestId, Integer newStatusId, Long assignedOfficerId) {
        String sql = "UPDATE requests SET current_status_id = ?, assigned_officer_id = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, newStatusId, assignedOfficerId, requestId);
    }

    // Öğrenci için Talepleri Listele (Detaylı DTO olarak döneriz ama şimdilik Map dönelim esneklik için)
    public List<Map<String, Object>> findRequestsByRequesterId(Long requesterId) {
        String sql = """
            SELECT r.id, r.title, r.created_at, 
                   s.name as status_name, s.color_code as status_color, 
                   u.name as unit_name, 
                   p.name as priority_name, p.color_code as priority_color
            FROM requests r
            JOIN statuses s ON r.current_status_id = s.id
            JOIN units u ON r.unit_id = u.id
            JOIN priorities p ON r.priority_id = p.id
            WHERE r.requester_id = ?
            ORDER BY r.created_at DESC
        """;
        return jdbcTemplate.queryForList(sql, requesterId);
    }

    // Personel için Talepleri Listele (Birim bazlı)
    public List<Map<String, Object>> findRequestsByUnitIds(List<Integer> unitIds) {
        if (unitIds.isEmpty()) return List.of();

        // Dinamik IN clause oluşturma (?,?,?)
        String inSql = String.join(",", java.util.Collections.nCopies(unitIds.size(), "?"));

        String sql = String.format("""
            SELECT r.id, r.title, r.created_at, 
                   s.name as status_name, s.color_code as status_color,
                   u.name as unit_name,
                   users.first_name, users.last_name
            FROM requests r
            JOIN statuses s ON r.current_status_id = s.id
            JOIN units u ON r.unit_id = u.id
            JOIN users ON r.requester_id = users.id
            WHERE r.unit_id IN (%s)
            ORDER BY r.created_at ASC
        """, inSql);

        return jdbcTemplate.queryForList(sql, unitIds.toArray());
    }
}