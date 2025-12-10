package com.ceng454.request_support_system.repository;



import com.ceng454.request_support_system.model.Category;
import com.ceng454.request_support_system.model.Priority;
import com.ceng454.request_support_system.model.Status;
import com.ceng454.request_support_system.model.Unit;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class LookupRepository {

    private final JdbcTemplate jdbcTemplate;

    // --- RowMappers (Veritabanı satırını Java objesine çevirir) ---

    private final RowMapper<Unit> unitRowMapper = (rs, rowNum) -> {
        Unit unit = new Unit();
        unit.setId(rs.getInt("id"));
        unit.setName(rs.getString("name"));
        unit.setDescription(rs.getString("description"));
        unit.setIsActive(rs.getBoolean("is_active"));
        return unit;
    };

    private final RowMapper<Category> categoryRowMapper = (rs, rowNum) -> {
        Category category = new Category();
        category.setId(rs.getInt("id"));
        category.setName(rs.getString("name"));
        category.setDescription(rs.getString("description"));
        category.setIsActive(rs.getBoolean("is_active"));
        return category;
    };

    private final RowMapper<Status> statusRowMapper = (rs, rowNum) -> {
        Status status = new Status();
        status.setId(rs.getInt("id"));
        status.setName(rs.getString("name"));
        status.setColorCode(rs.getString("color_code"));
        status.setIsFinal(rs.getBoolean("is_final"));
        return status;
    };

    private final RowMapper<Priority> priorityRowMapper = (rs, rowNum) -> {
        Priority priority = new Priority();
        priority.setId(rs.getInt("id"));
        priority.setName(rs.getString("name"));
        priority.setLevel(rs.getInt("level"));
        priority.setColorCode(rs.getString("color_code"));
        return priority;
    };

    // --- Metotlar ---

    public List<Unit> findAllActiveUnits() {
        return jdbcTemplate.query("SELECT * FROM units WHERE is_active = 1", unitRowMapper);
    }

    public List<Category> findAllActiveCategories() {
        return jdbcTemplate.query("SELECT * FROM categories WHERE is_active = 1", categoryRowMapper);
    }

    public List<Status> findAllStatuses() {
        return jdbcTemplate.query("SELECT * FROM statuses", statusRowMapper);
    }

    public List<Priority> findAllPriorities() {
        // Öncelik sırasına göre getir (Level)
        return jdbcTemplate.query("SELECT * FROM priorities ORDER BY level ASC", priorityRowMapper);
    }
}