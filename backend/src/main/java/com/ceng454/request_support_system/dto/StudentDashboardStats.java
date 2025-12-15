package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDashboardStats {
    private long activeRequests;
    private long pendingReview;
    private long resolvedRequests;
    private long totalRequests;
    private double resolvedRequestsPercentage;
}
