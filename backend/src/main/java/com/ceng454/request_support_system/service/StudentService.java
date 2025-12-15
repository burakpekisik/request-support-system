package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.dto.StudentDashboardStats;
import com.ceng454.request_support_system.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

        int totalRequestsTrend = requestRepository.calculateTotalRequestsTrendByRequester(studentId);
        int activeRequestsTrend = requestRepository.calculateActiveRequestsTrendByRequester(studentId);
        int resolvedRequestsTrend = requestRepository.calculateResolvedRequestsTrendByRequester(studentId);

        return new StudentDashboardStats(
                activeRequests,
                pendingReview,
                resolvedRequests,
                totalRequests,
                resolvedPercentage,
                totalRequestsTrend,
                activeRequestsTrend,
                resolvedRequestsTrend
        );
    }

    public List<RequestSummary> getRecentRequests(Long studentId, int limit) {
        return requestRepository.findRecentByRequesterId(studentId, limit);
    }
}
