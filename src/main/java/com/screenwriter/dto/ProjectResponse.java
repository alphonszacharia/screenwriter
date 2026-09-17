package com.screenwriter.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProjectResponse {

    private Long id;
    private String title;
    private String description;
    private String productionName;
    private String directorName;
    private String screenwriterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProjectResponse() {
    }

    public ProjectResponse(
            Long id,
            String title,
            String description,
            String productionName,
            String directorName,
            String screenwriterName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.productionName=productionName;
        this.directorName=directorName;
        this.screenwriterName=screenwriterName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}