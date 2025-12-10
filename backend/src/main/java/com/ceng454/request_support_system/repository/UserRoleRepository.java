package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UserRoleRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Role> roleRowMapper = (rs, rowNum) -> {
        Role role = new Role();
        role.setId(rs.getInt("id"));
        role.setName(rs.getString("name"));
        role.setDescription(rs.getString("description"));
        return role;
    };

    // Kullanıcıya rol ata
    public void assignRole(Long userId, Integer roleId) {
        String sql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
        jdbcTemplate.update(sql, userId, roleId);
    }

    // Kullanıcının rollerini getir
    public List<Role> findRolesByUserId(Long userId) {
        String sql = """
            SELECT r.* FROM roles r
            INNER JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        """;
        return jdbcTemplate.query(sql, roleRowMapper, userId);
    }

    // Kullanıcının belirli bir rolü var mı?
    public boolean hasRole(Long userId, String roleName) {
        String sql = """
            SELECT COUNT(*) FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ? AND r.name = ?
        """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId, roleName);
        return count != null && count > 0;
    }

    // Kullanıcının tüm rollerini sil
    public void deleteAllRolesByUserId(Long userId) {
        String sql = "DELETE FROM user_roles WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }
}