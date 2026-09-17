package com.screenwriter.service;

import com.screenwriter.dto.ProjectRequest;
import com.screenwriter.entity.Project;
import com.screenwriter.entity.User;
import com.screenwriter.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;
import com.screenwriter.exception.ProjectNotFoundException;
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

    public ProjectService(
            ProjectRepository projectRepository,
            UserService userService) {

        this.projectRepository = projectRepository;
        this.userService = userService;
    }

    public Project createProject(
            ProjectRequest request,
            String username) {

        User user = userService.findByUsername(username);

        Project project = new Project();

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setProductionName(request.getProductionName());
        project.setDirectorName(request.getDirectorName());
        project.setScreenwriterName(request.getScreenwriterName());

        LocalDateTime now = LocalDateTime.now();

        project.setCreatedAt(now);
        project.setUpdatedAt(now);

        project.setUser(user);

        return projectRepository.save(project);
    }
    public List<Project> getMyProjects(String username) {

        return projectRepository.findByUserUsername(username);
    }
    public Project getMyProject(Long id, String username) {

        return projectRepository
                .findByIdAndUserUsername(id, username)
                .orElseThrow(() ->
                        new ProjectNotFoundException("Project not found"));
    }
    public Project updateProject(
            Long id,
            ProjectRequest request,
            String username) {

        Project project = projectRepository
                .findByIdAndUserUsername(id, username)
                .orElseThrow(() ->
                        new ProjectNotFoundException("Project not found"));

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setProductionName(request.getProductionName());
        project.setDirectorName(request.getDirectorName());
        project.setScreenwriterName(request.getScreenwriterName());
        project.setUpdatedAt(LocalDateTime.now());

        return projectRepository.save(project);
    }
    public void deleteProject(Long id, String username) {

        Project project = projectRepository
                .findByIdAndUserUsername(id, username)
                .orElseThrow(() ->
                        new ProjectNotFoundException("Project not found"));

        projectRepository.delete(project);
    }
}