package com.ceng454.request_support_system.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

}