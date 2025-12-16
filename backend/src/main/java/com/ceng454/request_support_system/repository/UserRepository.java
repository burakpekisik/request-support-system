package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.dto.UnitOfficerDto;
import com.ceng454.request_support_system.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            user.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        user.setIsActive(rs.getBoolean("is_active"));
        return user;
    };

    // TC Number ile kullanıcı bul
    public Optional<User> findByTcNumber(String tcNumber) {
        String sql = "SELECT * FROM users WHERE tc_number = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, tcNumber);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // Email ile kullanıcı bul
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // ID ile kullanıcı bul
    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    // Kullanıcı kaydet (INSERT)
    public User save(User user) {
        String sql = "INSERT INTO users (tc_number, email, password_hash, first_name, last_name, phone_number, avatar_url, created_at, is_active) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getTcNumber());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getFirstName());
            ps.setString(5, user.getLastName());
            ps.setString(6, user.getPhoneNumber());
            ps.setString(7, user.getAvatarUrl());
            ps.setTimestamp(8, Timestamp.valueOf(user.getCreatedAt()));
            ps.setBoolean(9, user.getIsActive());
            return ps;
        }, keyHolder);
        
        user.setId(keyHolder.getKey().longValue());
        return user;
    }

    // TC Number var mı kontrol et
    public boolean existsByTcNumber(String tcNumber) {
        String sql = "SELECT COUNT(*) FROM users WHERE tc_number = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tcNumber);
        return count != null && count > 0;
    }

    // Email var mı kontrol et
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public List<Integer> findUnitIdsByOfficerId(Long officerId) {
        String sql = "SELECT unit_id FROM officer_unit_assignments WHERE user_id = ?";
        
        return jdbcTemplate.queryForList(sql, Integer.class, officerId);
    }

    /**
     * Get unit names for an officer (comma separated if multiple)
     */
    public String findUnitNamesByOfficerId(Long officerId) {
        String sql = """
            SELECT u.name 
            FROM units u 
            INNER JOIN officer_unit_assignments oua ON u.id = oua.unit_id 
            WHERE oua.user_id = ?
            ORDER BY u.name
        """;
        
        List<String> unitNames = jdbcTemplate.queryForList(sql, String.class, officerId);
        return unitNames.isEmpty() ? null : String.join(", ", unitNames);
    }

    /**
     * Get all officers in the same units as the given officer (excluding the officer themselves)
     */
    public List<UnitOfficerDto> findOfficersInSameUnits(Long officerId) {
        String sql = """
            SELECT DISTINCT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.avatar_url,
                r.name as role_name
            FROM users u
            INNER JOIN officer_unit_assignments oua ON u.id = oua.user_id
            INNER JOIN user_roles ur ON u.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE oua.unit_id IN (
                SELECT unit_id FROM officer_unit_assignments WHERE user_id = ?
            )
            AND u.id != ?
            AND u.is_active = TRUE
            ORDER BY u.first_name, u.last_name
        """;
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> UnitOfficerDto.builder()
                .id(rs.getLong("id"))
                .firstName(rs.getString("first_name"))
                .lastName(rs.getString("last_name"))
                .email(rs.getString("email"))
                .avatarUrl(rs.getString("avatar_url"))
                .roleName(rs.getString("role_name"))
                .build(), officerId, officerId);
    }

    // Kullanıcı profilini güncelle (UPDATE)
    public void updateProfile(Long userId, String firstName, String lastName, String email, String phoneNumber) {
        String sql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ? WHERE id = ?";
        jdbcTemplate.update(sql, firstName, lastName, email, phoneNumber, userId);
    }

    // Avatar URL güncelle
    public void updateAvatarUrl(Long userId, String avatarUrl) {
        String sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
        jdbcTemplate.update(sql, avatarUrl, userId);
    }

    // Email benzersizlik kontrolü (kendisi hariç)
    public boolean existsByEmailExcludingUser(String email, Long userId) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ? AND id != ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email, userId);
        return count != null && count > 0;
    }

}