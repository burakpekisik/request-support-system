package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.OfficerDashboardStats;
import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.service.OfficerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@CrossOrigin(origins = "*")
public class OfficerController {

    @Autowired
    private OfficerService officerService;

    /**
     * Get officer dashboard statistics
     * GET /api/officer/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            // Authentication object'inden userId al (JwtAuthenticationFilter set ediyor)
            Long officerId = Long.parseLong(authentication.getName());

            OfficerDashboardStats stats = officerService.getDashboardStats(officerId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get recent inbox requests
     * GET /api/officer/inbox/recent?limit=5
     */
    @GetMapping("/inbox/recent")
    public ResponseEntity<?> getRecentInboxRequests(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());

            List<RequestSummary> requests = officerService.getRecentInboxRequests(officerId, limit);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get in-progress requests
     * GET /api/officer/requests/in-progress?limit=10
     */
    @GetMapping("/requests/in-progress")
    public ResponseEntity<?> getInProgressRequests(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());

            List<RequestSummary> requests = officerService.getInProgressRequests(officerId, limit);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
