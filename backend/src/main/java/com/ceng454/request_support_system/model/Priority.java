package com.ceng454.request_support_system.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Priority {
    private Integer id;
    private String name;
    private Integer level;
    private String colorCode;
}