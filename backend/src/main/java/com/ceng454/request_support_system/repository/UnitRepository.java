package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.Unit;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UnitRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Unit> rowMapper = (rs, rowNum) -> new Unit(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getString("description"),
            rs.getBoolean("is_active")
    );

    public List<Unit> findAll() {
        String sql = "SELECT id, name, description, is_active FROM units ORDER BY name";
        return jdbcTemplate.query(sql, rowMapper);
    }
    
    public Optional<Unit> findById(Integer id) {
        String sql = "SELECT id, name, description, is_active FROM units WHERE id = ?";
        return jdbcTemplate.query(sql, new Object[]{id}, rowMapper).stream().findFirst();
    }

    public void add(String name, String description) {
        String sql = "INSERT INTO units (name, description, is_active) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, name, description, true);
    }

    public int update(Unit unit) {
        String sql = "UPDATE units SET name = ?, description = ?, is_active = ? WHERE id = ?";
        return jdbcTemplate.update(sql, unit.getName(), unit.getDescription(), unit.getIsActive(), unit.getId());
    }

    public void setActivity(Integer id, boolean isActive) {
        String sql = "UPDATE units SET is_active = ? WHERE id = ?";
        jdbcTemplate.update(sql, isActive, id);
    }
}
