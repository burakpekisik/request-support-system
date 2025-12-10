package com.ceng454.request_support_system.service;

import com.ceng454.request_support_system.dto.OfficerAssignmentStats;
import com.ceng454.request_support_system.dto.OfficerDashboardStats;
import com.ceng454.request_support_system.dto.RequestSummary;
import com.ceng454.request_support_system.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OfficerService {

    @Autowired
    private RequestRepository requestRepository;

    /**
     * Officer dashboard istatistiklerini getir
     */
    public OfficerDashboardStats getDashboardStats(Long officerId) {
        int newRequests = requestRepository.countNewRequestsByOfficerUnits(officerId);
        int inProgress = requestRepository.countInProgressRequestsByOfficer(officerId);
        int resolvedToday = requestRepository.countResolvedTodayByOfficer(officerId);
        int transferred = requestRepository.countTransferredByOfficer(officerId);
        
        int newRequestsTrend = requestRepository.calculateNewRequestsTrend(officerId);
        int resolvedTodayTrend = requestRepository.calculateResolvedTodayTrend(officerId);

        return OfficerDashboardStats.builder()
                .newRequests(newRequests)
                .inProgress(inProgress)
                .resolvedToday(resolvedToday)
                .transferred(transferred)
                .newRequestsTrend(newRequestsTrend)
                .resolvedTodayTrend(resolvedTodayTrend)
                .build();
    }

    /**
     * Officer'ın inbox'ındaki son talepleri getir
     */
    public List<RequestSummary> getRecentInboxRequests(Long officerId, int limit) {
        return requestRepository.findPendingRequestsByOfficerUnits(officerId, limit);
    }

    /**
     * Officer'a atanmış devam eden talepleri getir
     */
    public List<RequestSummary> getInProgressRequests(Long officerId, int limit) {
        return requestRepository.findInProgressRequestsByOfficer(officerId, limit);
    }

    /**
     * Officer inbox'ındaki talepleri filtrele, sırala ve ara
     */
    public List<RequestSummary> getInboxRequests(
            Long officerId, 
            String status, 
            String priority, 
            String search, 
            String sortBy, 
            String sortOrder,
            int page,
            int size
    ) {
        return requestRepository.findInboxRequestsWithFilters(
            officerId, status, priority, search, sortBy, sortOrder, page, size
        );
    }

    /**
     * Officer'a atanmış taleplerin istatistiklerini getir
     */
    public OfficerAssignmentStats getAssignmentStats(Long officerId) {
        Map<String, Integer> stats = requestRepository.getAssignmentStats(officerId);
        
        return OfficerAssignmentStats.builder()
                .totalAssigned(stats.get("totalAssigned"))
                .pendingAction(stats.get("pendingAction"))
                .resolvedThisWeek(stats.get("resolvedThisWeek"))
                .build();
    }

    /**
     * Officer'a atanmış talepleri filtrele ve getir
     */
    public List<RequestSummary> getAssignedRequests(
            Long officerId,
            String status,
            String priority,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        return requestRepository.findAssignedRequests(
            officerId, status, priority, search, sortBy, sortOrder, page, size
        );
    }

    /**
     * Officer'ın kendi oluşturduğu talepleri getir
     */
    public List<RequestSummary> getMyRequests(
            Long officerId,
            String status,
            String category,
            String search,
            String sortBy,
            String sortOrder,
            int page,
            int size
    ) {
        return requestRepository.findMyRequests(
            officerId, status, category, search, sortBy, sortOrder, page, size
        );
    }

    /**
     * Tüm kategorileri getir
     */
    public List<Map<String, Object>> getAllCategories() {
        return requestRepository.findAllCategories();
    }
}
