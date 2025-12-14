package com.ceng454.request_support_system.repository;


import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class AdminDashboardRepository {

    private final JdbcTemplate jdbcTemplate;

//User Stats
    public int countTotalUser() {
        String sql = "SELECT COUNT(DISTINCT id) FROM users";
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
    
}