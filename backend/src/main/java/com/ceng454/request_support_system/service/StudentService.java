package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.StudentDashboardStats;
import com.ceng454.request_support_system.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final RequestRepository requestRepository;

    public StudentDashboardStats getDashboardStats(Long studentId) {
        long totalRequests = requestRepository.countTotalByRequesterId(studentId);
        long activeRequests = requestRepository.countActiveByRequesterId(studentId);
        long pendingReview = requestRepository.countPendingByRequesterId(studentId);
        long resolvedRequests = requestRepository.countResolvedByRequesterId(studentId);

        double resolvedPercentage = 0;
        if (totalRequests > 0) {
            resolvedPercentage = ((double) resolvedRequests / totalRequests) * 100;
        }

        return new StudentDashboardStats(
                activeRequests,
                pendingReview,
                resolvedRequests,
                totalRequests,
                resolvedPercentage
        );
    }
}
