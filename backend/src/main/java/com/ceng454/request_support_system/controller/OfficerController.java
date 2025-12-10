package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.OfficerAssignmentStats;
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

    /**
     * Get inbox requests with filtering, sorting and search
     * GET /api/officer/inbox?status=all&priority=all&search=&sortBy=createdAt&sortOrder=desc&page=0&size=20
     */
    @GetMapping("/inbox")
    public ResponseEntity<?> getInboxRequests(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String priority,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());

            List<RequestSummary> requests = officerService.getInboxRequests(
                officerId, status, priority, search, sortBy, sortOrder, page, size
            );
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get assignment statistics
     * GET /api/officer/assignments/stats
     */
    @GetMapping("/assignments/stats")
    public ResponseEntity<?> getAssignmentStats(Authentication authentication) {
        try {
            Long officerId = Long.parseLong(authentication.getName());

            OfficerAssignmentStats stats = officerService.getAssignmentStats(officerId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get assigned requests with filtering, sorting and search
     * GET /api/officer/assignments?status=all&priority=all&search=&sortBy=createdAt&sortOrder=desc&page=0&size=20
     */
    @GetMapping("/assignments")
    public ResponseEntity<?> getAssignedRequests(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String priority,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        try {
            Long officerId = Long.parseLong(authentication.getName());

            List<RequestSummary> requests = officerService.getAssignedRequests(
                officerId, status, priority, search, sortBy, sortOrder, page, size
            );
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
