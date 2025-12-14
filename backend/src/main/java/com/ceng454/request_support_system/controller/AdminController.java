package com.ceng454.request_support_system.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ceng454.request_support_system.dto.UserChangeStatsDto;
import com.ceng454.request_support_system.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get officer dashboard statistics
     * GET /api/officer/dashboard/stats
     */
    @GetMapping("/dashboard/stats/total-user")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            int adminTotalUser = adminService.getTotalUser();

            return ResponseEntity.ok(   Map.of(
                "totalUser", adminTotalUser
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboard/stats/monthly-user-change")
    public ResponseEntity<UserChangeStatsDto> getUserChangePercentageDashboardStats(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            UserChangeStatsDto adminMonthlyUserChange = adminService.getMonthlyUserChange();

            return ResponseEntity.ok(adminMonthlyUserChange);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard/stats/total-request")
    public ResponseEntity<?> getDashboardRequestStats(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            int adminTotalRequest = adminService.getTotalRequest();

            return ResponseEntity.ok(   Map.of(
                "totalRequest", adminTotalRequest
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboard/stats/monthly-request-change")
    public ResponseEntity<UserChangeStatsDto> getRequestChangePercentageDashboardStats(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            UserChangeStatsDto adminMonthlyRequestChange = adminService.getMonthlyRequestChange();

            return ResponseEntity.ok(adminMonthlyRequestChange);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
