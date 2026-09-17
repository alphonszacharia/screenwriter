package com.screenwriter.service;

import com.screenwriter.dto.SceneContentRequest;
import com.screenwriter.entity.Character;
import com.screenwriter.entity.Scene;
import com.screenwriter.entity.SceneContent;
import com.screenwriter.repository.CharacterRepository;
import com.screenwriter.repository.SceneContentRepository;
import com.screenwriter.repository.SceneRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SceneContentService {

    private final SceneContentRepository sceneContentRepository;
    private final SceneRepository sceneRepository;
    private final CharacterRepository characterRepository;

    public SceneContentService(
            SceneContentRepository sceneContentRepository,
            SceneRepository sceneRepository,
            CharacterRepository characterRepository) {

        this.sceneContentRepository = sceneContentRepository;
        this.sceneRepository = sceneRepository;
        this.characterRepository = characterRepository;
    }

    public SceneContent createContent(
            Long sceneId,
            SceneContentRequest request,
            String username) {

        Scene scene = sceneRepository
                .findById(sceneId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));

        if (!scene.getProject().getUser().getUsername().equals(username)) {
            throw new RuntimeException("Scene not found");
        }

        SceneContent sceneContent = new SceneContent();

        sceneContent.setContentOrder(request.getContentOrder());
        sceneContent.setType(request.getType());
        sceneContent.setContent(request.getContent());
        sceneContent.setScene(scene);

        if (request.getCharacterId() != null) {
            Character character = characterRepository
                    .findByIdAndProjectId(
                            request.getCharacterId(),
                            scene.getProject().getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException("Character not found"));

            sceneContent.setCharacter(character);
        }

        return sceneContentRepository.save(sceneContent);
    }

    public List<SceneContent> getSceneContents(
            Long sceneId,
            String username) {

        Scene scene = sceneRepository
                .findById(sceneId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));

        if (!scene.getProject().getUser().getUsername().equals(username)) {
            throw new RuntimeException("Scene not found");
        }

        return sceneContentRepository
                .findBySceneIdOrderByContentOrder(sceneId);
    }
    public List<SceneContent> replaceSceneContents(
            Long sceneId,
            List<SceneContentRequest> requests,
            String username) {

        Scene scene = sceneRepository
                .findById(sceneId)
                .orElseThrow(() ->
                        new RuntimeException("Scene not found"));

        if (!scene.getProject().getUser().getUsername().equals(username)) {
            throw new RuntimeException("Scene not found");
        }

        // Delete the old content blocks
        List<SceneContent> existingContents =
                sceneContentRepository
                        .findBySceneIdOrderByContentOrder(sceneId);

        sceneContentRepository.deleteAll(existingContents);

        // Create the new content blocks
        List<SceneContent> newContents = new java.util.ArrayList<>();

        for (SceneContentRequest request : requests) {

            SceneContent sceneContent = new SceneContent();

            sceneContent.setContentOrder(request.getContentOrder());
            sceneContent.setType(request.getType());
            sceneContent.setContent(request.getContent());
            sceneContent.setScene(scene);

            if (request.getCharacterId() != null) {

                Character character = characterRepository
                        .findByIdAndProjectId(
                                request.getCharacterId(),
                                scene.getProject().getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Character not found"));

                sceneContent.setCharacter(character);
            }

            newContents.add(sceneContent);
        }

        return sceneContentRepository.saveAll(newContents);
    }
}