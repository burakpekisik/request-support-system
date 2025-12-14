package com.ceng454.request_support_system.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
@Data
public class UserChangeStatsDto {
    private double percentage;
    @JsonProperty("isPositive")
    private boolean isPositive;
    private String label;

    // getter / setter
    public double getPercentage() {
        return percentage;
    }
    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
    public String getLabel() {
        return label;
    }
    public void setLabel(String label) {
        this.label = label;
    }
    public boolean isPositive() {
    return isPositive;
}
    public void setIsPositive(boolean isPositive) {
        this.isPositive = isPositive;
    }
}
