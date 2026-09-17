package com.screenwriter.service;

import com.screenwriter.dto.SceneRequest;
import com.screenwriter.entity.Character;
import com.screenwriter.entity.Project;
import com.screenwriter.entity.Scene;
import com.screenwriter.repository.CharacterRepository;
import com.screenwriter.repository.SceneContentRepository;
import com.screenwriter.repository.ProjectRepository;
import com.screenwriter.repository.SceneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
public class SceneService {

    private final SceneRepository sceneRepository;
    private final ProjectRepository projectRepository;
    private final CharacterRepository characterRepository;
    private final SceneContentRepository sceneContentRepository;

    public SceneService(
            SceneRepository sceneRepository,
            ProjectRepository projectRepository,
            CharacterRepository characterRepository,
            SceneContentRepository sceneContentRepository) {

        this.sceneRepository = sceneRepository;
        this.projectRepository = projectRepository;
        this.characterRepository = characterRepository;
        this.sceneContentRepository = sceneContentRepository;
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

    @Transactional
    public void deleteScene(
            Long projectId,
            Long sceneId,
            String username) {

        // Verify that the project belongs to the logged-in user.
        Project project = projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        // Find the scene inside this project.
        Scene scene = sceneRepository
                .findByIdAndProjectId(sceneId, projectId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));

        // Remove the scene's content first so no orphaned dialogue/action
        // records remain after the scene is deleted.
        List<com.screenwriter.entity.SceneContent> contents =
                sceneContentRepository
                        .findBySceneIdOrderByContentOrder(sceneId);

        if (!contents.isEmpty()) {
            sceneContentRepository.deleteAll(contents);
        }

        // Delete the scene itself.
        sceneRepository.delete(scene);

        // Renumber all remaining scenes sequentially:
        // 1, 2, 3, 4 -> delete 2 -> 1, 2, 3
        List<Scene> remainingScenes =
                sceneRepository
                        .findByProjectIdOrderBySceneOrder(projectId);

        int order = 1;

        for (Scene remainingScene : remainingScenes) {
            remainingScene.setSceneOrder(order++);
            remainingScene.setUpdatedAt(LocalDateTime.now());
        }

        sceneRepository.saveAll(remainingScenes);
    }

}