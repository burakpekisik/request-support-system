package com.ceng454.request_support_system.model;

import lombok.Data;

@Data
public class Status {
    private Integer id;
    private String name;
    private String colorCode;
    private Boolean isFinal;
}