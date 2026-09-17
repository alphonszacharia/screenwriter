package com.screenwriter.controller;

import com.screenwriter.dto.ProjectRequest;
import com.screenwriter.dto.ProjectResponse;
import com.screenwriter.entity.Project;
import com.screenwriter.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Project project = projectService.createProject(
                request,
                username
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProductionName(),
                project.getDirectorName(),
                project.getScreenwriterName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping
    public ResponseEntity<java.util.List<ProjectResponse>> getMyProjects(
            Authentication authentication) {

        String username = authentication.getName();

        java.util.List<Project> projects =
                projectService.getMyProjects(username);

        java.util.List<ProjectResponse> responses =
                projects.stream()
                        .map(project -> new ProjectResponse(
                                project.getId(),
                                project.getTitle(),
                                project.getDescription(),
                                project.getProductionName(),
                                project.getDirectorName(),
                                project.getScreenwriterName(),
                                project.getCreatedAt(),
                                project.getUpdatedAt()
                        ))
                        .toList();

        return ResponseEntity.ok(responses);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getMyProject(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        Project project = projectService.getMyProject(
                id,
                username
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProductionName(),
                project.getDirectorName(),
                project.getScreenwriterName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );

        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Project project = projectService.updateProject(
                id,
                request,
                username
        );

        ProjectResponse response = new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getProductionName(),
                project.getDirectorName(),
                project.getScreenwriterName(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );

        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();

        projectService.deleteProject(id, username);

        return ResponseEntity.noContent().build();
    }
}