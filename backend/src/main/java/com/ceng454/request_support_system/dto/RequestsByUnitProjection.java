package com.ceng454.request_support_system.dto;

public class RequestsByUnitProjection {
    private String unitName;
    private int requestCount;
    // getters and setters
    public String getUnitName() {
        return unitName;
    }
    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }
    public int getRequestCount() {
        return requestCount;
    }
    public void setRequestCount(int requestCount) {
        this.requestCount = requestCount;
    }
}
