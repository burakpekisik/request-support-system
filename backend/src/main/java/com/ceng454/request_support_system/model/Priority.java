package com.ceng454.request_support_system.model;


import lombok.Data;

@Data
public class Priority {
    private Integer id;
    private String name;
    private Integer level;
    private String colorCode;
}