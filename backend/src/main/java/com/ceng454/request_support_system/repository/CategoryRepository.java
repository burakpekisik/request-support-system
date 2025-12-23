package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Category> rowMapper = (rs, rowNum) -> {
        Category category = new Category();
        category.setId(rs.getInt("id"));
        category.setName(rs.getString("name"));
        category.setIsActive(rs.getBoolean("is_active"));
        // 'description' alanı modelde yok, eklenirse burası güncellenmeli.
        return category;
    };

    public List<Category> findAll() {
        String sql = "SELECT id, name, is_active FROM categories ORDER BY name";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public void add(String name) {
        String sql = "INSERT INTO categories (name, is_active) VALUES (?, ?)";
        jdbcTemplate.update(sql, name, true);
    }

    public void update(Integer id, String name) {
        String sql = "UPDATE categories SET name = ? WHERE id = ?";
        jdbcTemplate.update(sql, name, id);
    }

    public void setActivity(Integer id, boolean isActive) {
        String sql = "UPDATE categories SET is_active = ? WHERE id = ?";
        jdbcTemplate.update(sql, isActive, id);
    }
}
