package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerDashboardStats {
    private Integer newRequests;
    private Integer inProgress;
    private Integer resolvedToday;
    private Integer transferred;
    private Integer newRequestsTrend;  // Geçen haftaya göre değişim yüzdesi
    private Integer resolvedTodayTrend;
}
