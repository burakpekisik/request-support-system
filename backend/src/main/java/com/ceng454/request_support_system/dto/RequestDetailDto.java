package com.ceng454.request_support_system.dto;

import lombok.Data;
import java.time.LocalDateTime;
 
@Data
public class RequestDetailDto {
    private Long id;
    private String title;
    private String status;
    private String statusColor; // Frontend'de renklendirme için (#FF0000 gibi)
    private String unitName;
    private String priority;
    private LocalDateTime createdAt;
    // İhtiyaca göre eklenebilir:
    // private String requesterName; 
    // private String assignedOfficerName;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatusColor() {
        return statusColor;
    }

    public void setStatusColor(String statusColor) {
        this.statusColor = statusColor;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}