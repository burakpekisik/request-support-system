package com.ceng454.request_support_system.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestTimeline {
    private Long id;
    private Long requestId;
    private Long actorId;           // İşlemi yapan kişi
    private Integer previousStatusId;
    private Integer newStatusId;
    private String comment;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getActorId() {
        return actorId;
    }

    public void setActorId(Long actorId) {
        this.actorId = actorId;
    }

    public Integer getPreviousStatusId() {
        return previousStatusId;
    }

    public void setPreviousStatusId(Integer previousStatusId) {
        this.previousStatusId = previousStatusId;
    }

    public Integer getNewStatusId() {
        return newStatusId;
    }

    public void setNewStatusId(Integer newStatusId) {
        this.newStatusId = newStatusId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}