package com.ceng454.request_support_system.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerUnitAssignment {
    private Integer id;
    private Long userId;
    private Integer unitId;


}