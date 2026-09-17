package com.screenwriter.service;

import com.screenwriter.dto.SceneRequest;
import com.screenwriter.entity.Character;
import com.screenwriter.entity.Project;
import com.screenwriter.entity.Scene;
import com.screenwriter.repository.CharacterRepository;
import com.screenwriter.repository.ProjectRepository;
import com.screenwriter.repository.SceneRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final ProjectRepository projectRepository;
    private final CharacterRepository characterRepository;

    public SceneService(
            SceneRepository sceneRepository,
            ProjectRepository projectRepository,
            CharacterRepository characterRepository) {

        this.sceneRepository = sceneRepository;
        this.projectRepository = projectRepository;
        this.characterRepository = characterRepository;
    }

    public Scene createScene(
            Long projectId,
            SceneRequest request,
            String username) {

        Project project = projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        Scene scene = new Scene();

        List<Scene> existingScenes =
                sceneRepository.findByProjectIdOrderBySceneOrder(projectId);

        int nextSceneOrder = existingScenes.size() + 1;

        scene.setSceneOrder(nextSceneOrder);
        scene.setSceneName(request.getSceneName());
        scene.setHeading(request.getHeading());
        scene.setDescription(request.getDescription());

        LocalDateTime now = LocalDateTime.now();

        scene.setCreatedAt(now);
        scene.setUpdatedAt(now);
        scene.setProject(project);

        if (request.getCharacterIds() != null) {

            List<Character> characters =
                    characterRepository.findAllById(
                            request.getCharacterIds()
                    );

            scene.setCharacters(
                    new HashSet<>(characters)
            );
        }

        return sceneRepository.save(scene);
    }

    public Scene updateScene(
            Long projectId,
            Long sceneId,
            SceneRequest request,
            String username) {

        Project project = projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        Scene scene = sceneRepository
                .findByIdAndProjectId(sceneId, projectId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));

        scene.setSceneName(request.getSceneName());
        scene.setHeading(request.getHeading());
        scene.setDescription(request.getDescription());

        scene.setProject(project);
        scene.setUpdatedAt(LocalDateTime.now());

        return sceneRepository.save(scene);
    }

    public List<Scene> getProjectScenes(
            Long projectId,
            String username) {

        projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        return sceneRepository
                .findByProjectIdOrderBySceneOrder(projectId);
    }

    public Scene getScene(
            Long projectId,
            Long sceneId,
            String username) {

        projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        return sceneRepository
                .findByIdAndProjectId(sceneId, projectId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));
    }
}