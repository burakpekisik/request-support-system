package com.ceng454.request_support_system.model;



import lombok.Data;

@Data
public class Category {
    private Integer id;
    private String name;
    private String description;
    private Boolean isActive;
}