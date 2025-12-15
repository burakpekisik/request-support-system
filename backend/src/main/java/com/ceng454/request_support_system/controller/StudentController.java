package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.dto.StudentDashboardStats;
import com.ceng454.request_support_system.model.User;
import com.ceng454.request_support_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDashboardStats> getDashboardStats(Authentication authentication) {
        Long studentId = Long.parseLong(authentication.getName());
        StudentDashboardStats stats = studentService.getDashboardStats(studentId);
        return ResponseEntity.ok(stats);
    }
}
