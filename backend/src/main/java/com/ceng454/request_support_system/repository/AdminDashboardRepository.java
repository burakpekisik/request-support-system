package com.ceng454.request_support_system.repository;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AdminDashboardRepository {

    private final JdbcTemplate jdbcTemplate;

//User Stats
    public int countTotalUser() {
        String sql = "SELECT COUNT(DISTINCT id) FROM users WHERE is_active = 1";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public Double calculateTotalUserChangePercentageByMonth() {
        String sql = """
            SELECT
                CASE
                    WHEN last_month = 0 THEN 0
                    ELSE ((this_month - last_month) * 100.0 / last_month)
                END
            FROM (
                SELECT
                    SUM(CASE
                        WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS this_month,

                    SUM(CASE
                        WHEN created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                         AND created_at <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS last_month
                FROM users
                WHERE is_active = 1
            ) t
            """;

        return jdbcTemplate.queryForObject(sql, Double.class);
    }
//Request Stats
    public int countTotalRequests() {
        String sql = "SELECT COUNT(DISTINCT id) FROM requests";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public Double calculateTotalRequestChangePercentageByMonth() {
        String sql = """
            SELECT
                CASE
                    WHEN last_month = 0 THEN 0
                    ELSE ((this_month - last_month) * 100.0 / last_month)
                END
            FROM (
                SELECT
                    SUM(CASE
                        WHEN created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS this_month,

                    SUM(CASE
                        WHEN created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                         AND created_at <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS last_month
                FROM requests
            ) t
            """;

        return jdbcTemplate.queryForObject(sql, Double.class);
    }
//Resolved Request Stats
    public int countResolvedRequestsThisMonth(){
        String sql = """
            SELECT COUNT(*) AS total_resolved_requests
            FROM requests
            WHERE current_status_id IN (7, 8)
            AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND created_at <  DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
        """;
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public Double calculateResolvedRequestChangePercentageByMonth() {
        String sql = """
            SELECT
                CASE
                    WHEN last_month = 0 THEN 0
                    ELSE ((this_month - last_month) * 100.0 / last_month)
                END
            FROM (
                SELECT
                    SUM(CASE
                        WHEN current_status_id IN (7, 8)
                        AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS this_month,

                    SUM(CASE
                        WHEN current_status_id IN (7, 8)
                        AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                        AND created_at <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        THEN 1 ELSE 0
                    END) AS last_month
                FROM requests
            ) t
            """;

        return jdbcTemplate.queryForObject(sql, Double.class);
    }

    public int countPendingRequests() {
    String sql = """
        SELECT COUNT(*) AS total_pending_requests
        FROM requests
        WHERE current_status_id = 1
    """;
    return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public List<Map<String, Object>> getRequestsByUnit() {
        String sql = """
            SELECT
                u.name AS unit_name,
                COUNT(r.id) AS request_count
            FROM units u
            LEFT JOIN requests r
                ON r.category_id = u.id
            GROUP BY u.id, u.name
            ORDER BY request_count DESC
            LIMIT 5
        """;

        return jdbcTemplate.queryForList(sql);
    }

    public Double calculatePendingRequestChangePercentageByMonth() {
        String sql = """
        SELECT
            CASE
                WHEN last_month = 0 THEN 0
                ELSE ((this_month - last_month) * 100.0 / last_month)
            END
        FROM (
            SELECT
                SUM(CASE
                    WHEN current_status_id = 1
                     AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    THEN 1 ELSE 0
                END) AS this_month,

                SUM(CASE
                    WHEN current_status_id = 1
                     AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                     AND created_at <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    THEN 1 ELSE 0
                END) AS last_month
            FROM requests
        ) t
        """;

        return jdbcTemplate.queryForObject(sql, Double.class);
    }

    public Map<String, Object> getRequestsWithFilters(String status, String unit, int page, int size) {
        int offset = (page - 1) * size;
        
        System.out.println("[AdminDashboardRepository] getRequestsWithFilters called - status: " + status + ", unit: " + unit + ", page: " + page + ", size: " + size);
        
        // Build status filter
        int statusId = -1;
        if (status != null && !status.equals("all")) {
            statusId = switch (status) {
                case "waiting" -> 1;
                case "in_progress" -> 2;
                case "answered" -> 3;
                case "waiting_response" -> 6;
                case "resolved_successfully" -> 7;
                case "resolved_negatively" -> 8;
                case "cancelled" -> 5;
                default -> -1;
            };
        }
        
        // Build unit filter
        String unitName = null;
        if (unit != null && !unit.equals("all") && !unit.isEmpty()) {
            unitName = capitalizeUnit(unit);
        }
        
        System.out.println("[AdminDashboardRepository] Resolved filters - statusId: " + statusId + ", unitName: " + unitName);
        
        // Build SQL with parameters
        StringBuilder countSqlBuilder = new StringBuilder(
            "SELECT COUNT(*) as total FROM requests r " +
            "JOIN statuses s ON r.current_status_id = s.id " +
            "JOIN units u ON r.unit_id = u.id "
        );
        
        List<Object> countParams = new ArrayList<>();
        
        if (statusId != -1) {
            countSqlBuilder.append("WHERE r.current_status_id = ? ");
            countParams.add(statusId);
        }
        
        if (unitName != null) {
            if (statusId == -1) {
                countSqlBuilder.append("WHERE ");
            } else {
                countSqlBuilder.append("AND ");
            }
            countSqlBuilder.append("u.name = ? ");
            countParams.add(unitName);
        }
        
        String countSql = countSqlBuilder.toString();
        System.out.println("[AdminDashboardRepository] Count SQL: " + countSql + " with params: " + countParams);
        
        Integer totalCount = jdbcTemplate.queryForObject(countSql, Integer.class, countParams.toArray());
        if (totalCount == null) {
            totalCount = 0;
        }
        
        System.out.println("[AdminDashboardRepository] Total count: " + totalCount);
        
        // Build data query
        StringBuilder dataSqlBuilder = new StringBuilder(
            "SELECT r.id, r.title, r.description, r.created_at, r.updated_at, " +
            "s.name as status_name, s.color_code as status_color, r.current_status_id as status_id, " +
            "u.name as unit_name, p.name as priority_name, p.color_code as priority_color, r.priority_id, " +
            "CONCAT(req.first_name, ' ', req.last_name) as requester_name, req.email as requester_email, " +
            "r.assigned_officer_id, " +
            "CASE WHEN ao.id IS NOT NULL THEN CONCAT(ao.first_name, ' ', ao.last_name) ELSE NULL END as assigned_officer_name " +
            "FROM requests r " +
            "JOIN statuses s ON r.current_status_id = s.id " +
            "JOIN units u ON r.unit_id = u.id " +
            "JOIN priorities p ON r.priority_id = p.id " +
            "JOIN users req ON r.requester_id = req.id " +
            "LEFT JOIN users ao ON r.assigned_officer_id = ao.id "
        );
        
        List<Object> dataParams = new ArrayList<>(countParams);
        
        if (statusId != -1) {
            dataSqlBuilder.append("WHERE r.current_status_id = ? ");
            if (dataParams.isEmpty()) {
                dataParams.add(statusId);
            }
        }
        
        if (unitName != null) {
            if (statusId == -1) {
                dataSqlBuilder.append("WHERE ");
            } else {
                dataSqlBuilder.append("AND ");
            }
            dataSqlBuilder.append("u.name = ? ");
            if (dataParams.size() == 1) {
                dataParams.add(unitName);
            }
        }
        
        dataSqlBuilder.append("ORDER BY r.created_at DESC LIMIT ? OFFSET ?");
        dataParams.add(size);
        dataParams.add(offset);
        
        String dataSql = dataSqlBuilder.toString();
        System.out.println("[AdminDashboardRepository] Data SQL: " + dataSql + " with params: " + dataParams);
        
        List<Map<String, Object>> data = jdbcTemplate.queryForList(dataSql, dataParams.toArray());
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", data);
        result.put("total", totalCount);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (totalCount + size - 1) / size);
        
        return result;
    }

    public Map<String, Object> getUsersWithFilters(String search, String role, int page, int size) {
        int offset = (page - 1) * size;
        
        System.out.println("[AdminDashboardRepository] getUsersWithFilters called - search: " + search + ", role: " + role + ", page: " + page + ", size: " + size);
        
        // Build role filter
        String roleFilter = null;
        if (role != null && !role.equals("all") && !role.isEmpty()) {
            roleFilter = switch (role) {
                case "student" -> "Student";
                case "officer" -> "Officer";
                case "admin" -> "Admin";
                default -> null;
            };
        }
        
        System.out.println("[AdminDashboardRepository] Resolved role filter: " + roleFilter);
        
        // Build count query
        StringBuilder countSqlBuilder = new StringBuilder(
            "SELECT COUNT(DISTINCT u.id) as total FROM users u " +
            "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
            "LEFT JOIN roles r ON ur.role_id = r.id "
        );
        
        List<Object> countParams = new ArrayList<>();
        List<String> conditions = new ArrayList<>();
        
        // Always filter active users
        conditions.add("u.is_active = 1");
        
        if (search != null && !search.isEmpty()) {
            conditions.add("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.tc_number LIKE ? OR u.email LIKE ?)");
            String searchParam = "%" + search + "%";
            countParams.add(searchParam);
            countParams.add(searchParam);
            countParams.add(searchParam);
            countParams.add(searchParam);
        }
        
        if (roleFilter != null) {
            conditions.add("r.name = ?");
            countParams.add(roleFilter);
        }
        
        if (!conditions.isEmpty()) {
            countSqlBuilder.append("WHERE ").append(String.join(" AND ", conditions));
        }
        
        String countSql = countSqlBuilder.toString();
        System.out.println("[AdminDashboardRepository] Count SQL: " + countSql + " with params: " + countParams);
        
        Integer totalCount = jdbcTemplate.queryForObject(countSql, Integer.class, countParams.toArray());
        if (totalCount == null) {
            totalCount = 0;
        }
        
        System.out.println("[AdminDashboardRepository] Total count: " + totalCount);
        
        // Build data query - get users first
        StringBuilder dataSqlBuilder = new StringBuilder(
            "SELECT DISTINCT u.id, u.tc_number, u.first_name, u.last_name, u.email, " +
            "(SELECT r2.name FROM user_roles ur2 JOIN roles r2 ON ur2.role_id = r2.id WHERE ur2.user_id = u.id LIMIT 1) as role_name, " +
            "u.created_at " +
            "FROM users u " +
            "LEFT JOIN user_roles ur ON u.id = ur.user_id " +
            "LEFT JOIN roles r ON ur.role_id = r.id "
        );
        
        List<Object> dataParams = new ArrayList<>(countParams);
        
        if (!conditions.isEmpty()) {
            dataSqlBuilder.append("WHERE ").append(String.join(" AND ", conditions));
        }
        
        dataSqlBuilder.append(" ORDER BY u.created_at DESC LIMIT ? OFFSET ?");
        dataParams.add(size);
        dataParams.add(offset);
        
        String dataSql = dataSqlBuilder.toString();
        System.out.println("[AdminDashboardRepository] Data SQL: " + dataSql + " with params: " + dataParams);
        
        List<Map<String, Object>> users = jdbcTemplate.queryForList(dataSql, dataParams.toArray());
        
        // Get unit assignments for all users in a single query
        if (!users.isEmpty()) {
            List<Long> userIds = users.stream()
                .map(u -> ((Number) u.get("id")).longValue())
                .collect(java.util.stream.Collectors.toList());
            
            String unitsSql = "SELECT oua.user_id, un.id as unit_id, un.name as unit_name " +
                "FROM officer_unit_assignments oua " +
                "JOIN units un ON oua.unit_id = un.id " +
                "WHERE oua.user_id IN (" + userIds.stream().map(id -> "?").collect(java.util.stream.Collectors.joining(",")) + ")";
            
            List<Map<String, Object>> unitAssignments = jdbcTemplate.queryForList(unitsSql, userIds.toArray());
            
            // Group units by user_id
            Map<Long, List<Map<String, Object>>> unitsByUser = unitAssignments.stream()
                .collect(java.util.stream.Collectors.groupingBy(ua -> ((Number) ua.get("user_id")).longValue()));
            
            // Add unit info to each user
            for (Map<String, Object> user : users) {
                Long userId = ((Number) user.get("id")).longValue();
                List<Map<String, Object>> userUnits = unitsByUser.getOrDefault(userId, new ArrayList<>());
                
                if (!userUnits.isEmpty()) {
                    String unitIds = userUnits.stream()
                        .map(u -> u.get("unit_id").toString())
                        .collect(java.util.stream.Collectors.joining(","));
                    String unitNames = userUnits.stream()
                        .map(u -> u.get("unit_name").toString())
                        .collect(java.util.stream.Collectors.joining(", "));
                    user.put("unit_ids", unitIds);
                    user.put("unit_names", unitNames);
                } else {
                    user.put("unit_ids", null);
                    user.put("unit_names", null);
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", users);
        result.put("total", totalCount);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (totalCount + size - 1) / size);
        
        return result;
    }

    private String capitalizeUnit(String unitString) {
        if (unitString == null || unitString.isEmpty()) {
            return unitString;
        }
        String[] words = unitString.split("-");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (result.length() > 0) {
                result.append(" ");
            }
            if (word.length() > 0) {
                result.append(word.substring(0, 1).toUpperCase())
                      .append(word.substring(1).toLowerCase());
            }
        }
        return result.toString();
    }

    // Update user role
    public void updateUserRole(Long userId, Integer roleId) {
        System.out.println("[AdminDashboardRepository] updateUserRole called - userId: " + userId + ", roleId: " + roleId);
        
        // First, delete existing roles for this user
        String deleteSql = "DELETE FROM user_roles WHERE user_id = ?";
        jdbcTemplate.update(deleteSql, userId);
        
        // Then, insert new role
        String insertSql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
        jdbcTemplate.update(insertSql, userId, roleId);
        
        System.out.println("[AdminDashboardRepository] Role updated successfully");
    }

    // Assign user to units (for officers)
    public void assignUserToUnits(Long userId, List<Integer> unitIds) {
        System.out.println("[AdminDashboardRepository] assignUserToUnits called - userId: " + userId + ", unitIds: " + unitIds);
        
        // First, delete existing unit assignments for this user
        String deleteSql = "DELETE FROM officer_unit_assignments WHERE user_id = ?";
        jdbcTemplate.update(deleteSql, userId);
        
        // Then, insert new unit assignments
        String insertSql = "INSERT INTO officer_unit_assignments (user_id, unit_id) VALUES (?, ?)";
        for (Integer unitId : unitIds) {
            jdbcTemplate.update(insertSql, userId, unitId);
        }
        
        System.out.println("[AdminDashboardRepository] Units assigned successfully");
    }

    // Get units assigned to a user
    public List<Map<String, Object>> getUserUnits(Long userId) {
        System.out.println("[AdminDashboardRepository] getUserUnits called - userId: " + userId);
        
        String sql = "SELECT u.id, u.name FROM units u " +
                     "INNER JOIN officer_unit_assignments oua ON u.id = oua.unit_id " +
                     "WHERE oua.user_id = ?";
        
        return jdbcTemplate.queryForList(sql, userId);
    }

    // Get all units
    public List<Map<String, Object>> getAllUnits() {
        System.out.println("[AdminDashboardRepository] getAllUnits called");
        
        String sql = "SELECT id, name, description FROM units WHERE is_active = 1 ORDER BY name";
        
        return jdbcTemplate.queryForList(sql);
    }

    // Get officers by unit ID
    public List<Map<String, Object>> getOfficersByUnit(Integer unitId) {
        System.out.println("[AdminDashboardRepository] getOfficersByUnit called - unitId: " + unitId);
        
        String sql = """
            SELECT DISTINCT 
                u.id,
                u.first_name AS firstName,
                u.last_name AS lastName,
                u.email,
                u.avatar_url AS avatarUrl,
                r.name as roleName
            FROM users u
            INNER JOIN officer_unit_assignments oua ON u.id = oua.user_id
            INNER JOIN user_roles ur ON u.id = ur.user_id
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE oua.unit_id = ?
            AND u.is_active = TRUE
            ORDER BY u.first_name, u.last_name
        """;
        
        return jdbcTemplate.queryForList(sql, unitId);
    }

    // Delete user (soft delete by setting is_active to false)
    public void deleteUser(Long userId) {
        System.out.println("[AdminDashboardRepository] deleteUser called - userId: " + userId);
        
        // Soft delete: set is_active = false
        String sql = "UPDATE users SET is_active = 0 WHERE id = ?";
        System.out.println("[AdminDashboardRepository] Executing SQL: " + sql + " with userId: " + userId);
        
        int rowsAffected = jdbcTemplate.update(sql, userId);
        
        System.out.println("[AdminDashboardRepository] Rows affected: " + rowsAffected);
        
        if (rowsAffected == 0) {
            System.out.println("[AdminDashboardRepository] WARNING: No user found with id: " + userId);
        } else {
            System.out.println("[AdminDashboardRepository] SUCCESS: User soft deleted - userId: " + userId + ", rows affected: " + rowsAffected);
        }
    }
}