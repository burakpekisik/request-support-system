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


}