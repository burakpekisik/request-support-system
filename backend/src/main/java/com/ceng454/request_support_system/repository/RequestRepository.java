package com.ceng454.request_support_system.repository;

import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.enums.Priority;
import com.ceng454.request_support_system.enums.Status;
import com.ceng454.request_support_system.model.Request;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
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

    private final RowMapper<RequestSummary> requestSummaryRowMapper = (rs, rowNum) -> {
        Long assignedOfficerId = rs.getObject("assigned_officer_id") != null 
            ? rs.getLong("assigned_officer_id") : null;
        return RequestSummary.builder()
            .id(rs.getLong("id"))
            .title(rs.getString("title"))
            .description(rs.getString("description"))
            .requesterName(rs.getString("requester_name"))
            .requesterEmail(rs.getString("requester_email"))
            .requesterAvatarUrl(rs.getString("requester_avatar_url"))
            .category(rs.getString("category"))
            .priority(rs.getString("priority"))
            .status(rs.getString("status"))
            .statusId(rs.getInt("status_id"))
            .unitName(rs.getString("unit_name"))
            .assignedOfficerId(assignedOfficerId)
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
            .build();
    };

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

    // ========== Officer Dashboard Methods ==========

    /**
     * Officer'a atanmış birimler için bekleyen talepler
     */
    public List<RequestSummary> findPendingRequestsByOfficerUnits(Long officerId, int limit) {
        String sql = """
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                u.avatar_url as requester_avatar_url,
                c.name as category,
                p.name as priority,
                s.name as status,
                r.current_status_id as status_id,
                un.name as unit_name,
                r.assigned_officer_id,
                r.created_at,
                r.updated_at
            FROM requests r
            INNER JOIN users u ON r.requester_id = u.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN units un ON r.unit_id = un.id
            INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
            WHERE oua.user_id = ?
              AND s.is_final = FALSE
              AND r.assigned_officer_id IS NULL
            ORDER BY p.level DESC, r.created_at ASC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, requestSummaryRowMapper, officerId, limit);
    }

    /**
     * Officer'a atanmış aktif talepler (devam edenler)
     */
    public List<RequestSummary> findInProgressRequestsByOfficer(Long officerId, int limit) {
        String sql = """
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                u.avatar_url as requester_avatar_url,
                c.name as category,
                p.name as priority,
                s.name as status,
                r.current_status_id as status_id,
                un.name as unit_name,
                r.assigned_officer_id,
                r.created_at,
                r.updated_at
            FROM requests r
            INNER JOIN users u ON r.requester_id = u.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN units un ON r.unit_id = un.id
            WHERE r.assigned_officer_id = ?
              AND s.is_final = FALSE
            ORDER BY p.level DESC, r.updated_at DESC
            LIMIT ?
        """;
        
        return jdbcTemplate.query(sql, requestSummaryRowMapper, officerId, limit);
    }

    /**
     * Yeni talep sayısı (officer'ın birimlerinde)
     */
    public int countNewRequestsByOfficerUnits(Long officerId) {
        String sql = """
            SELECT COUNT(*) 
            FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
            WHERE oua.user_id = ?
              AND s.name = 'Pending'
              AND r.assigned_officer_id IS NULL
        """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, officerId);
        return count != null ? count : 0;
    }

    /**
     * Devam eden talep sayısı (officer'a atanmış)
     */
    public int countInProgressRequestsByOfficer(Long officerId) {
        String sql = """
            SELECT COUNT(*) 
            FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            WHERE r.assigned_officer_id = ?
              AND s.is_final = FALSE
        """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, officerId);
        return count != null ? count : 0;
    }

    /**
     * Bugün çözülen talep sayısı
     */
    public int countResolvedTodayByOfficer(Long officerId) {
        String sql = """
            SELECT COUNT(*) 
            FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            WHERE r.assigned_officer_id = ?
              AND s.name LIKE 'Resolved%'
              AND DATE(r.updated_at) = CURDATE()
        """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, officerId);
        return count != null ? count : 0;
    }

    /**
     * Transfer edilen talep sayısı (son 7 gün)
     */
    public int countTransferredByOfficer(Long officerId) {
        String sql = """
            SELECT COUNT(DISTINCT rt.request_id)
            FROM request_timeline rt
            INNER JOIN requests r ON rt.request_id = r.id
            WHERE rt.actor_id = ?
              AND rt.comment LIKE '%transfer%'
              AND rt.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """;
        
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, officerId);
        return count != null ? count : 0;
    }

    /**
     * Geçen aya göre yeni talep trendi
     */
    public int calculateNewRequestsTrend(Long officerId) {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
                 WHERE oua.user_id = ? 
                   AND YEAR(r.created_at) = YEAR(CURDATE())
                   AND MONTH(r.created_at) = MONTH(CURDATE())) as this_month,
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
                 WHERE oua.user_id = ? 
                   AND YEAR(r.created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                   AND MONTH(r.created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as last_month
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            int thisMonth = rs.getInt("this_month");
            int lastMonth = rs.getInt("last_month");
            if (lastMonth == 0) return 0;
            return (int) (((double) (thisMonth - lastMonth) / lastMonth) * 100);
        }, officerId, officerId);
    }

    /**
     * Geçen aya göre çözülen taleplerin trendi
     */
    public int calculateResolvedTodayTrend(Long officerId) {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN statuses s ON r.current_status_id = s.id
                 WHERE r.assigned_officer_id = ? 
                   AND s.name LIKE 'Resolved%'
                   AND YEAR(r.updated_at) = YEAR(CURDATE())
                   AND MONTH(r.updated_at) = MONTH(CURDATE())) as this_month,
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN statuses s ON r.current_status_id = s.id
                 WHERE r.assigned_officer_id = ? 
                   AND s.name LIKE 'Resolved%'
                   AND YEAR(r.updated_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                   AND MONTH(r.updated_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as last_month
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            int thisMonth = rs.getInt("this_month");
            int lastMonth = rs.getInt("last_month");
            if (lastMonth == 0) return 0;
            return (int) (((double) (thisMonth - lastMonth) / lastMonth) * 100);
        }, officerId, officerId);
    }

    /**
     * Officer inbox'ındaki talepleri filtrele, sırala ve ara (pagination ile)
     */
    public Map<String, Object> findInboxRequestsWithFilters(
            Long officerId,
            String status,
            String priority,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder baseSql = new StringBuilder("""
            FROM requests r
            INNER JOIN users u ON r.requester_id = u.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN units un ON r.unit_id = un.id
            INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
            WHERE oua.user_id = ?
        """);

        List<Object> params = new java.util.ArrayList<>();
        params.add(officerId);

        // Status filter - Enum-based approach
        Status statusEnum = Status.fromFilterValue(status);
        if (statusEnum != null) {
            baseSql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Priority filter - Enum-based approach
        Priority priorityEnum = Priority.fromFilterValue(priority);
        if (priorityEnum != null) {
            baseSql.append(" AND p.name = '").append(priorityEnum.getDisplayName()).append("'");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            baseSql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Count query
        String countSql = "SELECT COUNT(*) " + baseSql;
        Integer total = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        // Data query with sorting and pagination
        StringBuilder dataSql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                u.avatar_url as requester_avatar_url,
                c.name as category,
                p.name as priority,
                s.name as status,
                r.current_status_id as status_id,
                un.name as unit_name,
                r.assigned_officer_id,
                r.created_at,
                r.updated_at
        """);
        dataSql.append(baseSql);

        // Sorting
        String orderByClause = switch (sortBy) {
            case "priority" -> " ORDER BY p.level " + sortOrder.toUpperCase();
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "requester" -> " ORDER BY u.last_name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        dataSql.append(orderByClause);

        // Pagination
        dataSql.append(" LIMIT ? OFFSET ?");
        List<Object> dataParams = new java.util.ArrayList<>(params);
        dataParams.add(size);
        dataParams.add(page * size);

        List<RequestSummary> data = jdbcTemplate.query(dataSql.toString(), requestSummaryRowMapper, dataParams.toArray());
        int totalPages = (int) Math.ceil((double) (total != null ? total : 0) / size);

        return Map.of(
            "data", data,
            "total", total != null ? total : 0,
            "totalPages", totalPages,
            "currentPage", page
        );
    }

    /**
     * Officer'a atanmış taleplerin istatistiklerini getir
     */
    public Map<String, Integer> getAssignmentStats(Long officerId) {
        // Toplam atanan
        Integer totalAssigned = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM requests WHERE assigned_officer_id = ?",
            Integer.class,
            officerId
        );

        // Bekleyen/İşlemde olanlar (pending action)
        Integer pendingAction = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            WHERE r.assigned_officer_id = ?
            AND s.name IN (?, ?, ?, ?)
            """,
            Integer.class,
            officerId,
            Status.PENDING.getDisplayName(),
            Status.IN_PROGRESS.getDisplayName(),
            Status.ANSWERED.getDisplayName(),
            Status.WAITING_RESPONSE.getDisplayName()
        );

        // Bu hafta çözülenler
        Integer resolvedThisWeek = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*) FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            WHERE r.assigned_officer_id = ?
            AND s.name IN (?, ?)
            AND r.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            """,
            Integer.class,
            officerId,
            Status.RESOLVED_SUCCESSFULLY.getDisplayName(),
            Status.RESOLVED_NEGATIVELY.getDisplayName()
        );

        return Map.of(
            "totalAssigned", totalAssigned != null ? totalAssigned : 0,
            "pendingAction", pendingAction != null ? pendingAction : 0,
            "resolvedThisWeek", resolvedThisWeek != null ? resolvedThisWeek : 0
        );
    }

    /**
     * Officer'a atanmış talepleri filtrele ve getir
     */
    public Map<String, Object> findAssignedRequests(
            Long officerId,
            String status,
            String priority,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder baseSql = new StringBuilder("""
            FROM requests r
            INNER JOIN users u ON r.requester_id = u.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN units un ON r.unit_id = un.id
            WHERE r.assigned_officer_id = ?
        """);

        List<Object> params = new java.util.ArrayList<>();
        params.add(officerId);

        // Status filter - Enum-based approach
        Status statusEnum = Status.fromFilterValue(status);
        if (statusEnum != null) {
            baseSql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Priority filter - Enum-based approach
        Priority priorityEnum = Priority.fromFilterValue(priority);
        if (priorityEnum != null) {
            baseSql.append(" AND p.name = '").append(priorityEnum.getDisplayName()).append("'");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            baseSql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Count query
        String countSql = "SELECT COUNT(*) " + baseSql;
        Integer total = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        // Data query with sorting and pagination
        StringBuilder dataSql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                u.avatar_url as requester_avatar_url,
                c.name as category,
                p.name as priority,
                s.name as status,
                r.current_status_id as status_id,
                un.name as unit_name,
                r.assigned_officer_id,
                r.created_at,
                r.updated_at
        """);
        dataSql.append(baseSql);

        // Sorting
        String orderByClause = switch (sortBy) {
            case "priority" -> " ORDER BY p.level " + sortOrder.toUpperCase();
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "requester" -> " ORDER BY u.last_name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        dataSql.append(orderByClause);

        // Pagination
        dataSql.append(" LIMIT ? OFFSET ?");
        List<Object> dataParams = new java.util.ArrayList<>(params);
        dataParams.add(size);
        dataParams.add(page * size);

        List<RequestSummary> data = jdbcTemplate.query(dataSql.toString(), requestSummaryRowMapper, dataParams.toArray());
        int totalPages = (int) Math.ceil((double) (total != null ? total : 0) / size);

        return Map.of(
            "data", data,
            "total", total != null ? total : 0,
            "totalPages", totalPages,
            "currentPage", page
        );
    }

    /**
     * Officer'ın kendi oluşturduğu talepleri filtrele ve getir
     */
    public Map<String, Object> findMyRequests(
            Long requesterId,
            String status,
            String category,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder baseSql = new StringBuilder("""
            FROM requests r
            INNER JOIN users u ON r.requester_id = u.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN units un ON r.unit_id = un.id
            WHERE r.requester_id = ?
        """);

        List<Object> params = new java.util.ArrayList<>();
        params.add(requesterId);

        // Status filter - Enum-based approach
        Status statusEnum = Status.fromFilterValue(status);
        if (statusEnum != null) {
            baseSql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Category filter
        if (!"all".equalsIgnoreCase(category)) {
            baseSql.append(" AND c.name LIKE ?");
            params.add("%" + category + "%");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            baseSql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR un.name LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Count query
        String countSql = "SELECT COUNT(*) " + baseSql;
        Integer total = jdbcTemplate.queryForObject(countSql, Integer.class, params.toArray());

        // Data query with sorting and pagination
        StringBuilder dataSql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                u.avatar_url as requester_avatar_url,
                c.name as category,
                p.name as priority,
                s.name as status,
                r.current_status_id as status_id,
                un.name as unit_name,
                r.assigned_officer_id,
                r.created_at,
                r.updated_at
        """);
        dataSql.append(baseSql);

        // Sorting
        String orderByClause = switch (sortBy) {
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "category" -> " ORDER BY c.name " + sortOrder.toUpperCase();
            case "unit" -> " ORDER BY un.name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        dataSql.append(orderByClause);

        // Pagination
        dataSql.append(" LIMIT ? OFFSET ?");
        List<Object> dataParams = new java.util.ArrayList<>(params);
        dataParams.add(size);
        dataParams.add(page * size);

        List<RequestSummary> data = jdbcTemplate.query(dataSql.toString(), requestSummaryRowMapper, dataParams.toArray());
        int totalPages = (int) Math.ceil((double) (total != null ? total : 0) / size);

        return Map.of(
            "data", data,
            "total", total != null ? total : 0,
            "totalPages", totalPages,
            "currentPage", page
        );
    }

    /**
     * Tüm kategorileri getir
     */
    public List<Map<String, Object>> findAllCategories() {
        String sql = "SELECT id, name, description FROM categories WHERE is_active = 1 ORDER BY name ASC";
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Tüm birimleri getir
     */
    public List<Map<String, Object>> findAllUnits() {
        String sql = "SELECT id, name, description FROM units WHERE is_active = 1 ORDER BY name ASC";
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Tek bir request'i ID ile getir (detaylı)
     */
    public Map<String, Object> findById(Long requestId) {
        String sql = """
            SELECT 
                r.id,
                r.title,
                r.description,
                r.created_at,
                r.updated_at,
                r.requester_id,
                r.assigned_officer_id,
                r.unit_id,
                r.category_id,
                r.priority_id,
                r.current_status_id,
                s.name as status_name,
                s.color_code as status_color,
                p.name as priority_name,
                p.color_code as priority_color,
                c.name as category_name,
                un.name as unit_name,
                CONCAT(req.first_name, ' ', req.last_name) as requester_name,
                req.email as requester_email,
                req.avatar_url as requester_avatar_url,
                CONCAT(off.first_name, ' ', off.last_name) as assigned_officer_name
            FROM requests r
            INNER JOIN statuses s ON r.current_status_id = s.id
            INNER JOIN priorities p ON r.priority_id = p.id
            INNER JOIN categories c ON r.category_id = c.id
            INNER JOIN units un ON r.unit_id = un.id
            INNER JOIN users req ON r.requester_id = req.id
            LEFT JOIN users off ON r.assigned_officer_id = off.id
            WHERE r.id = ?
        """;
        
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, requestId);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Request'in current_status_id'sini getir
     */
    public Integer getCurrentStatusId(Long requestId) {
        String sql = "SELECT current_status_id FROM requests WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, requestId);
    }

    /**
     * Request durumunu güncelle
     */
    public void updateStatus(Long requestId, Integer newStatusId) {
        String sql = "UPDATE requests SET current_status_id = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, newStatusId, requestId);
    }

    /**
     * Request priority'sini güncelle
     */
    public void updatePriority(Long requestId, Integer newPriorityId) {
        String sql = "UPDATE requests SET priority_id = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, newPriorityId, requestId);
    }

    /**
     * Get priority_id from request
     */
    public Integer getPriorityId(Long requestId) {
        String sql = "SELECT priority_id FROM requests WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, requestId);
    }

        // ========== Student Dashboard Methods ========== 
    
        public List<RequestSummary> findRecentByRequesterId(Long requesterId, int limit) {
            String sql = """
                SELECT
                    r.id,
                    r.title,
                    r.description,
                    CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                    u.email as requester_email,
                    u.avatar_url as requester_avatar_url,
                    c.name as category,
                    p.name as priority,
                    s.name as status,
                    r.current_status_id as status_id,
                    un.name as unit_name,
                    r.assigned_officer_id,
                    r.created_at,
                    r.updated_at
                FROM requests r
                INNER JOIN users u ON r.requester_id = u.id
                INNER JOIN categories c ON r.category_id = c.id
                INNER JOIN priorities p ON r.priority_id = p.id
                INNER JOIN statuses s ON r.current_status_id = s.id
                INNER JOIN units un ON r.unit_id = un.id
                WHERE r.requester_id = ?
                ORDER BY r.created_at DESC
                LIMIT ?
            """;
            return jdbcTemplate.query(sql, requestSummaryRowMapper, requesterId, limit);
        }
    
        public long countTotalByRequesterId(Long requesterId) {
            String sql = "SELECT COUNT(*) FROM requests WHERE requester_id = ?";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, requesterId);
            return count != null ? count : 0;
        }
    
        public long countActiveByRequesterId(Long requesterId) {
            String sql = "SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (1, 2, 3)";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, requesterId);
            return count != null ? count : 0;
        }
    
        public long countPendingByRequesterId(Long requesterId) {
            String sql = "SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id = 3";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, requesterId);
            return count != null ? count : 0;
        }
    
        public long countResolvedByRequesterId(Long requesterId) {
            String sql = "SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (4, 5)";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, requesterId);
            return count != null ? count : 0;
        }
    
        public int calculateTotalRequestsTrendByRequester(Long requesterId) {
            String sql = """
                SELECT
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as this_month,
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
            """;
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                int thisMonth = rs.getInt("this_month");
                int lastMonth = rs.getInt("last_month");
                if (lastMonth == 0) return thisMonth > 0 ? 100 : 0;
                return (int) (((double) (thisMonth - lastMonth) / lastMonth) * 100);
            }, requesterId, requesterId);
        }
    
        public int calculateActiveRequestsTrendByRequester(Long requesterId) {
            String sql = """
                SELECT
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (1, 2, 3) AND created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as this_month,
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (1, 2, 3) AND created_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
            """;
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                int thisMonth = rs.getInt("this_month");
                int lastMonth = rs.getInt("last_month");
                if (lastMonth == 0) return thisMonth > 0 ? 100 : 0;
                return (int) (((double) (thisMonth - lastMonth) / lastMonth) * 100);
            }, requesterId, requesterId);
        }
    
        public int calculateResolvedRequestsTrendByRequester(Long requesterId) {
            String sql = """
                SELECT
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (4, 5) AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as this_month,
                    (SELECT COUNT(*) FROM requests WHERE requester_id = ? AND current_status_id IN (4, 5) AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND updated_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) as last_month
            """;
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                int thisMonth = rs.getInt("this_month");
                int lastMonth = rs.getInt("last_month");
                if (lastMonth == 0) return thisMonth > 0 ? 100 : 0;
                return (int) (((double) (thisMonth - lastMonth) / lastMonth) * 100);
            }, requesterId, requesterId);
        }
    }
