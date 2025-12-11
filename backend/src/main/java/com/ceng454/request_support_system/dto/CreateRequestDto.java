package com.ceng454.request_support_system.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CreateRequestDto {
    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    @NotBlank(message = "Açıklama boş olamaz")
    private String description;

    @NotNull(message = "Birim seçilmelidir")
    private Integer unitId;

    @NotNull(message = "Kategori seçilmelidir")
    private Integer categoryId;

    // Priority başta null, officer tarafından sonradan atanacak
    private Integer priorityId;

    // Dosya yükleme bilgileri (Controller'da dosya yüklendikten sonra buraya set edilir)
    private String fileName;
    private String filePath;
    private String fileType;
    private Double fileSizeMb;
    
    // Çoklu dosya desteği
    private List<FileInfo> files = new ArrayList<>();
    
    @Data
    public static class FileInfo {
        private String fileName;
        private String filePath;
        private String fileType;
        private Double fileSizeMb;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getUnitId() {
        return unitId;
    }

    public void setUnitId(Integer unitId) {
        this.unitId = unitId;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getPriorityId() {
        return priorityId;
    }

    public void setPriorityId(Integer priorityId) {
        this.priorityId = priorityId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Double getFileSizeMb() {
        return fileSizeMb;
    }

    public void setFileSizeMb(Double fileSizeMb) {
        this.fileSizeMb = fileSizeMb;
    }
}