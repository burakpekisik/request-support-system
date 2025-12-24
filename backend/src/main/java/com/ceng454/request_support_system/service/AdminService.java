package com.ceng454.request_support_system.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ceng454.request_support_system.dto.RequestsByUnitProjection;
import com.ceng454.request_support_system.dto.UserChangeStatsDto;
import com.ceng454.request_support_system.repository.AdminDashboardRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminDashboardRepository adminDashboardRepository;
// --- SENARYO: TOPLAM KULLANICI SAYISINI GETİRME ---
    @Transactional
    public int getTotalUser() {
        return adminDashboardRepository.countTotalUser();
    }
    @Transactional
    public UserChangeStatsDto getMonthlyUserChange() {
        Double percentageChange = adminDashboardRepository.calculateTotalUserChangePercentageByMonth();

        UserChangeStatsDto statsDto = new UserChangeStatsDto();
        statsDto.setPercentage(percentageChange != null ? percentageChange : 0.0);
        statsDto.setLabel("Monthly User Change");
        if (percentageChange == null || percentageChange == 0.0 || percentageChange > 0) {
            statsDto.setIsPositive(true);
        } 
        else {
            statsDto.setIsPositive(false);
        }

        return statsDto;
    }
    
    @Transactional
    public int getTotalRequest() {
        return adminDashboardRepository.countTotalRequests();
    }

    @Transactional
    public UserChangeStatsDto getMonthlyRequestChange() {
        Double percentageChange = adminDashboardRepository.calculateTotalRequestChangePercentageByMonth();

        UserChangeStatsDto statsDto = new UserChangeStatsDto();
        statsDto.setPercentage(percentageChange != null ? percentageChange : 0.0);
        statsDto.setLabel("Monthly Request Change");
        if (percentageChange == null || percentageChange == 0.0 || percentageChange > 0) {
            statsDto.setIsPositive(true);
        } 
        else {
            statsDto.setIsPositive(false);
        }

        return statsDto;
    }
// --- SENARYO: BU AY TOPLAM ÇÖZÜMLENEN TALEP SAYISINI GETİRME ---
    @Transactional
    public int getTotalResolvedRequestMonth() {
        return adminDashboardRepository.countResolvedRequestsThisMonth();
    }

    @Transactional
    public UserChangeStatsDto getMonthlyResolvedRequestChange() {
        Double percentageChange = adminDashboardRepository.calculateResolvedRequestChangePercentageByMonth();

        UserChangeStatsDto statsDto = new UserChangeStatsDto();
        statsDto.setPercentage(percentageChange != null ? percentageChange : 0.0);
        statsDto.setLabel("Monthly Request Change");
        if (percentageChange == null || percentageChange == 0.0 || percentageChange > 0) {
            statsDto.setIsPositive(true);
        } 
        else {
            statsDto.setIsPositive(false);
        }

        return statsDto;
    }

    @Transactional
    public int getTotalPendingRequest() {
        return adminDashboardRepository.countPendingRequests();
    }

    @Transactional
    public List<RequestsByUnitProjection> getRequestsByUnit() {
    List<Map<String, Object>> rows =
            adminDashboardRepository.getRequestsByUnit();

    return rows.stream().map(row -> {
        RequestsByUnitProjection dto = new RequestsByUnitProjection();
        dto.setUnitName((String) row.get("unit_name"));
        dto.setRequestCount(((Number) row.get("request_count")).intValue());
        return dto;
    }).toList();
    }

    @Transactional
    public UserChangeStatsDto getMonthlyPendingRequestChange() {
        Double percentageChange = adminDashboardRepository.calculatePendingRequestChangePercentageByMonth();

        UserChangeStatsDto statsDto = new UserChangeStatsDto();
        statsDto.setPercentage(percentageChange != null ? percentageChange : 0.0);
        statsDto.setLabel("Monthly Request Change");
        if (percentageChange == null || percentageChange == 0.0 || percentageChange > 0) {
            statsDto.setIsPositive(true);
        } 
        else {
            statsDto.setIsPositive(false);
        }

        return statsDto;
    }

    @Transactional
    public Map<String, Object> getRequestsWithFilters(String status, String unit, int page, int size) {
        return adminDashboardRepository.getRequestsWithFilters(status, unit, page, size);
    }

    @Transactional
    public Map<String, Object> getUsersWithFilters(String search, String role, int page, int size) {
        return adminDashboardRepository.getUsersWithFilters(search, role, page, size);
    }

    @Transactional
    public void updateUserRole(Long userId, Integer roleId) {
        adminDashboardRepository.updateUserRole(userId, roleId);
    }

    @Transactional
    public void assignUserToUnits(Long userId, List<Integer> unitIds) {
        adminDashboardRepository.assignUserToUnits(userId, unitIds);
    }

    @Transactional
    public List<Map<String, Object>> getAllUnits() {
        return adminDashboardRepository.getAllUnits();
    }

    @Transactional
    public List<Map<String, Object>> getUserUnits(Long userId) {
        return adminDashboardRepository.getUserUnits(userId);
    }

    @Transactional
    public List<Map<String, Object>> getOfficersByUnit(Integer unitId) {
        return adminDashboardRepository.getOfficersByUnit(unitId);
    }

    @Transactional
    public void deleteUser(Long userId) {
        System.out.println("[AdminService] deleteUser called - userId: " + userId);
        try {
            adminDashboardRepository.deleteUser(userId);
            System.out.println("[AdminService] deleteUser completed successfully");
        } catch (Exception e) {
            System.out.println("[AdminService] Error in deleteUser: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

}


