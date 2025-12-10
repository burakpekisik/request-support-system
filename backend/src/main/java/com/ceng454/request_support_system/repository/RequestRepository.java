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

    private final RowMapper<RequestSummary> requestSummaryRowMapper = (rs, rowNum) -> 
        RequestSummary.builder()
            .id(rs.getLong("id"))
            .title(rs.getString("title"))
            .description(rs.getString("description"))
            .requesterName(rs.getString("requester_name"))
            .requesterEmail(rs.getString("requester_email"))
            .category(rs.getString("category"))
            .priority(rs.getString("priority"))
            .status(rs.getString("status"))
            .unitName(rs.getString("unit_name"))
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .updatedAt(rs.getTimestamp("updated_at").toLocalDateTime())
            .build();

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
                c.name as category,
                p.name as priority,
                s.name as status,
                un.name as unit_name,
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
                c.name as category,
                p.name as priority,
                s.name as status,
                un.name as unit_name,
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
              AND s.name = 'Beklemede'
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
              AND s.name = 'Çözüldü'
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
     * Geçen haftaya göre yeni talep trendi
     */
    public int calculateNewRequestsTrend(Long officerId) {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
                 WHERE oua.user_id = ? 
                   AND DATE(r.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as this_week,
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN officer_unit_assignments oua ON r.unit_id = oua.unit_id
                 WHERE oua.user_id = ? 
                   AND DATE(r.created_at) >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
                   AND DATE(r.created_at) < DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as last_week
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            int thisWeek = rs.getInt("this_week");
            int lastWeek = rs.getInt("last_week");
            if (lastWeek == 0) return 0;
            return (int) (((double) (thisWeek - lastWeek) / lastWeek) * 100);
        }, officerId, officerId);
    }

    /**
     * Bugün çözülen taleplerin trendi
     */
    public int calculateResolvedTodayTrend(Long officerId) {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN statuses s ON r.current_status_id = s.id
                 WHERE r.assigned_officer_id = ? 
                   AND s.name = 'Çözüldü'
                   AND DATE(r.updated_at) = CURDATE()) as today,
                (SELECT COUNT(*) FROM requests r
                 INNER JOIN statuses s ON r.current_status_id = s.id
                 WHERE r.assigned_officer_id = ? 
                   AND s.name = 'Çözüldü'
                   AND DATE(r.updated_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)) as yesterday
        """;
        
        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            int today = rs.getInt("today");
            int yesterday = rs.getInt("yesterday");
            if (yesterday == 0) return 0;
            return (int) (((double) (today - yesterday) / yesterday) * 100);
        }, officerId, officerId);
    }

    /**
     * Officer inbox'ındaki talepleri filtrele, sırala ve ara (pagination ile)
     */
    public List<RequestSummary> findInboxRequestsWithFilters(
            Long officerId,
            String status,
            String priority,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                c.name as category,
                p.name as priority,
                s.name as status,
                un.name as unit_name,
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
        """);

        List<Object> params = new java.util.ArrayList<>();
        params.add(officerId);

        // Status filter - Enum-based approach
        Status statusEnum = Status.fromFilterValue(status);
        if (statusEnum != null) {
            sql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Priority filter - Enum-based approach
        Priority priorityEnum = Priority.fromFilterValue(priority);
        if (priorityEnum != null) {
            sql.append(" AND p.name = '").append(priorityEnum.getDisplayName()).append("'");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Sorting
        String orderByClause = switch (sortBy) {
            case "priority" -> " ORDER BY p.level " + sortOrder.toUpperCase();
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "requester" -> " ORDER BY u.last_name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        sql.append(orderByClause);

        // Pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), requestSummaryRowMapper, params.toArray());
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
    public List<RequestSummary> findAssignedRequests(
            Long officerId,
            String status,
            String priority,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                c.name as category,
                p.name as priority,
                s.name as status,
                un.name as unit_name,
                r.created_at,
                r.updated_at
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
            sql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Priority filter - Enum-based approach
        Priority priorityEnum = Priority.fromFilterValue(priority);
        if (priorityEnum != null) {
            sql.append(" AND p.name = '").append(priorityEnum.getDisplayName()).append("'");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Sorting
        String orderByClause = switch (sortBy) {
            case "priority" -> " ORDER BY p.level " + sortOrder.toUpperCase();
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "requester" -> " ORDER BY u.last_name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        sql.append(orderByClause);

        // Pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), requestSummaryRowMapper, params.toArray());
    }

    /**
     * Officer'ın kendi oluşturduğu talepleri filtrele ve getir
     */
    public List<RequestSummary> findMyRequests(
            Long requesterId,
            String status,
            String category,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT 
                r.id,
                r.title,
                r.description,
                CONCAT(u.first_name, ' ', u.last_name) as requester_name,
                u.email as requester_email,
                c.name as category,
                p.name as priority,
                s.name as status,
                un.name as unit_name,
                r.created_at,
                r.updated_at
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
            sql.append(" AND s.name = '").append(statusEnum.getDisplayName()).append("'");
        }

        // Category filter
        if (!"all".equalsIgnoreCase(category)) {
            sql.append(" AND c.name LIKE ?");
            params.add("%" + category + "%");
        }

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (r.title LIKE ? OR r.description LIKE ? OR un.name LIKE ?)");
            String searchPattern = "%" + search.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }

        // Sorting
        String orderByClause = switch (sortBy) {
            case "status" -> " ORDER BY s.name " + sortOrder.toUpperCase();
            case "category" -> " ORDER BY c.name " + sortOrder.toUpperCase();
            case "unit" -> " ORDER BY un.name " + sortOrder.toUpperCase();
            case "updatedAt" -> " ORDER BY r.updated_at " + sortOrder.toUpperCase();
            default -> " ORDER BY r.created_at " + sortOrder.toUpperCase();
        };
        sql.append(orderByClause);

        // Pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), requestSummaryRowMapper, params.toArray());
    }

    /**
     * Tüm kategorileri getir
     */
    public List<Map<String, Object>> findAllCategories() {
        String sql = "SELECT id, name, description FROM categories WHERE is_active = 1 ORDER BY name ASC";
        return jdbcTemplate.queryForList(sql);
    }
}
