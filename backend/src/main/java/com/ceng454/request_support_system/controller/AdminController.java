package com.ceng454.request_support_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/dashboard/stats/total-resolved-requests-this-month")
    public ResponseEntity<?> getTotalResolvedRequestsThisMonth(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            int totalResolvedRequestsThisMonth = adminService.getTotalResolvedRequestMonth();

            return ResponseEntity.ok(   Map.of(
                "totalResolvedRequestsThisMonth", totalResolvedRequestsThisMonth
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboard/stats/monthly-resolved-request-change")
    public ResponseEntity<UserChangeStatsDto> getTotalResolvedRequestsChangeByMonth(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            UserChangeStatsDto adminMonthlyResolvedRequestChange = adminService.getMonthlyResolvedRequestChange();

            return ResponseEntity.ok(adminMonthlyResolvedRequestChange);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard/stats/pending-requests")
    public ResponseEntity<?> getRequestPending(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            int totalPendingRequest = adminService.getTotalPendingRequest();
            return ResponseEntity.ok(   Map.of(
                "totalPendingRequest", totalPendingRequest
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/dashboard/stats/requests-by-unit")
    public ResponseEntity<?> getRequestsByUnit(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            return ResponseEntity.ok(adminService.getRequestsByUnit());
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dashboard/stats/monthly-pending-request-change")
    public ResponseEntity<UserChangeStatsDto> getTotalPendingRequestsChangeByMonth(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long adminId = Long.parseLong(authentication.getName());
            UserChangeStatsDto adminMonthlyPendingRequestChange = adminService.getMonthlyPendingRequestChange();

            return ResponseEntity.ok(adminMonthlyPendingRequestChange);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getRequestsWithFilters(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String unit,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            Map<String, Object> result = adminService.getRequestsWithFilters(status, unit, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsersWithFilters(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            Map<String, Object> result = adminService.getUsersWithFilters(search, role, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, Integer> requestBody,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            Integer roleId = requestBody.get("roleId");
            
            if (roleId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "roleId is required"));
            }
            
            adminService.updateUserRole(userId, roleId);
            return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/units")
    public ResponseEntity<?> assignUserToUnits(
            @PathVariable Long userId,
            @RequestBody Map<String, List<Integer>> requestBody,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            List<Integer> unitIds = requestBody.get("unitIds");
            
            if (unitIds == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "unitIds is required"));
            }
            
            adminService.assignUserToUnits(userId, unitIds);
            return ResponseEntity.ok(Map.of("message", "User units assigned successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/units")
    public ResponseEntity<?> getAllUnits(Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            List<Map<String, Object>> units = adminService.getAllUnits();
            return ResponseEntity.ok(units);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get officers by unit ID
     * GET /api/admin/units/{unitId}/officers
     */
    @GetMapping("/units/{unitId}/officers")
    public ResponseEntity<?> getOfficersByUnit(
            @PathVariable Integer unitId,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            List<Map<String, Object>> officers = adminService.getOfficersByUnit(unitId);
            return ResponseEntity.ok(officers);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a user
     * DELETE /api/admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            Long adminId = Long.parseLong(authentication.getName());
            System.out.println("[AdminController] DELETE /admin/users/{userId} called - adminId: " + adminId + ", userId: " + userId);
            
            // Ensure admin is not deleting themselves
            if (adminId.equals(userId)) {
                System.out.println("[AdminController] Error: Admin trying to delete their own account");
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete your own account"));
            }
            
            System.out.println("[AdminController] Calling adminService.deleteUser(" + userId + ")");
            adminService.deleteUser(userId);
            System.out.println("[AdminController] User deleted successfully - userId: " + userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
            
        } catch (Exception e) {
            System.out.println("[AdminController] Error deleting user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
