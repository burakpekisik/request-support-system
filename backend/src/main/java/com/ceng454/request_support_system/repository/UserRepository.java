package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepository {
    private final JdbcTemplate jdbcTemplate;
 
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setTcNumber(rs.getString("tc_number"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFirstName(rs.getString("first_name"));
        user.setLastName(rs.getString("last_name"));
        user.setPhoneNumber(rs.getString("phone_number"));
        user.setAvatarUrl(rs.getString("avatar_url"));
        user.setIsActive(rs.getBoolean("is_active"));
        user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return user;
    };
 
    // TC No ile kullanıcı bul (Login için)
    public Optional<User> findByTcNumber(String tcNumber) {
        String sql = "SELECT * FROM users WHERE tc_number = ? AND is_active = 1";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, userRowMapper, tcNumber));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
 
    // Kullanıcının rollerini getir (Spring Security için)
    public List<String> findRolesByUserId(Long userId) {
        String sql = "SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?";
        return jdbcTemplate.queryForList(sql, String.class, userId);
    }
 
    // Personelin sorumlu olduğu birimlerin ID'lerini getir
    public List<Integer> findUnitIdsByOfficerId(Long officerId) {
        String sql = "SELECT unit_id FROM officer_unit_assignments WHERE user_id = ?";
        return jdbcTemplate.queryForList(sql, Integer.class, officerId);
    }
 
    // Yeni Kullanıcı Kaydet
    public void save(User user) {
        String sql = "INSERT INTO users (tc_number, email, password_hash, first_name, last_name, phone_number, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())";
        jdbcTemplate.update(sql, user.getTcNumber(), user.getEmail(), user.getPasswordHash(), user.getFirstName(), user.getLastName(), user.getPhoneNumber());
    }
    // Kullanıcıya rol ata (Kaydolurken varsayılan STUDENT atamak için)
    public void addRoleToUser(Long userId, String roleName) {
        // Önce rolün ID'sini bul
        String findRoleSql = "SELECT id FROM roles WHERE name = ?";
        Integer roleId = jdbcTemplate.queryForObject(findRoleSql, Integer.class, roleName);
        // Sonra ilişki tablosuna ekle
        String insertSql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
        jdbcTemplate.update(insertSql, userId, roleId);
    }
}

    
    

