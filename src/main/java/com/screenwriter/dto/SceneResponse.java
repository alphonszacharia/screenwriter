package com.screenwriter.dto;

import com.screenwriter.entity.Scene;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
public class SceneResponse {

    private Long id;
    private Integer sceneOrder;
    private String sceneName;
    private String heading;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CharacterResponse> characters;

    public SceneResponse(Scene scene) {

        this.id = scene.getId();
        this.sceneOrder = scene.getSceneOrder();
        this.sceneName = scene.getSceneName();
        this.heading = scene.getHeading();
        this.description = scene.getDescription();
        this.createdAt = scene.getCreatedAt();
        this.updatedAt = scene.getUpdatedAt();

        this.characters = scene.getCharacters()
                .stream()
                .map(CharacterResponse::new)
                .toList();
    }
}