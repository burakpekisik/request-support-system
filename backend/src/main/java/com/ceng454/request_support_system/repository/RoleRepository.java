package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class RoleRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Role> roleRowMapper = (rs, rowNum) -> {
        Role role = new Role();
        role.setId(rs.getInt("id"));
        role.setName(rs.getString("name"));
        role.setDescription(rs.getString("description"));
        return role;
    };

    public Optional<Role> findByName(String name) {
        String sql = "SELECT * FROM roles WHERE name = ?";
        try {
            Role role = jdbcTemplate.queryForObject(sql, roleRowMapper, name);
            return Optional.ofNullable(role);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Role> findById(Integer id) {
        String sql = "SELECT * FROM roles WHERE id = ?";
        try {
            Role role = jdbcTemplate.queryForObject(sql, roleRowMapper, id);
            return Optional.ofNullable(role);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public List<Role> findAll() {
        String sql = "SELECT * FROM roles";
        return jdbcTemplate.query(sql, roleRowMapper);
    }
}