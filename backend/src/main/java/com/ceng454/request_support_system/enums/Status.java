package com.ceng454.request_support_system.enums;

public enum Status {
    PENDING(1, "Pending", false),
    IN_PROGRESS(2, "In Progress", false),
    ANSWERED(3, "Answered", false),
    CANCELLED(5, "Cancelled", true),
    WAITING_RESPONSE(6, "Waiting Response", false),
    RESOLVED_SUCCESSFULLY(7, "Resolved Successfully", true),
    RESOLVED_NEGATIVELY(8, "Resolved Negatively", true);

    private final int id;
    private final String displayName;
    private final boolean isFinal;

    Status(int id, String displayName, boolean isFinal) {
        this.id = id;
        this.displayName = displayName;
        this.isFinal = isFinal;
    }

    public int getId() {
        return id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isFinal() {
        return isFinal;
    }

    public static Status fromId(int id) {
        for (Status status : Status.values()) {
            if (status.id == id) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status ID: " + id);
    }

    public static Status fromDisplayName(String displayName) {
        for (Status status : Status.values()) {
            if (status.displayName.equalsIgnoreCase(displayName)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + displayName);
    }

    /**
     * Frontend filter değerinden Status enum'unu bulur
     * @param filterValue Frontend'den gelen filter değeri (pending, in_progress, vb.)
     * @return İlgili Status enum değeri, bulunamazsa null
     */
    public static Status fromFilterValue(String filterValue) {
        if (filterValue == null || "all".equalsIgnoreCase(filterValue)) {
            return null;
        }
        return switch (filterValue.toLowerCase()) {
            case "pending" -> PENDING;
            case "in_progress" -> IN_PROGRESS;
            case "answered" -> ANSWERED;
            case "waiting_response" -> WAITING_RESPONSE;
            case "resolved_successfully" -> RESOLVED_SUCCESSFULLY;
            case "resolved_negatively" -> RESOLVED_NEGATIVELY;
            case "cancelled" -> CANCELLED;
            default -> null;
        };
    }
}
