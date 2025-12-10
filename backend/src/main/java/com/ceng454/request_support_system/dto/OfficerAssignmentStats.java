package com.ceng454.request_support_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerAssignmentStats {
    private int totalAssigned;
    private int pendingAction;
    private int resolvedThisWeek;
}
