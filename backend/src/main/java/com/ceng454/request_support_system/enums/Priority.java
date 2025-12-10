package com.ceng454.request_support_system.enums;

public enum Priority {
    LOW(1, "Low", 1),
    NORMAL(2, "Normal", 2),
    HIGH(3, "High", 3),
    CRITICAL(4, "Critical", 4);

    private final int id;
    private final String displayName;
    private final int level;

    Priority(int id, String displayName, int level) {
        this.id = id;
        this.displayName = displayName;
        this.level = level;
    }

    public int getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getLevel() {
        return level;
    }

    public static Priority fromId(int id) {
        for (Priority priority : Priority.values()) {
            if (priority.id == id) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown priority ID: " + id);
    }

    public static Priority fromDisplayName(String displayName) {
        for (Priority priority : Priority.values()) {
            if (priority.displayName.equalsIgnoreCase(displayName)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown priority: " + displayName);
    }

    /**
     * Frontend filter değerinden Priority enum'unu bulur
     * @param filterValue Frontend'den gelen filter değeri (critical, high, medium, low)
     * @return İlgili Priority enum değeri, bulunamazsa null
     */
    public static Priority fromFilterValue(String filterValue) {
        if (filterValue == null || "all".equalsIgnoreCase(filterValue)) {
            return null;
        }
        return switch (filterValue.toLowerCase()) {
            case "critical" -> CRITICAL;
            case "high" -> HIGH;
            case "medium" -> NORMAL;
            case "low" -> LOW;
            default -> null;
        };
    }
}
