package com.screenwriter.dto;

import com.screenwriter.entity.SceneContent;
import lombok.Getter;

@Getter
public class SceneContentResponse {

    private Long id;
    private Integer contentOrder;
    private String type;
    private String content;
    private CharacterResponse character;

    public SceneContentResponse(SceneContent sceneContent) {
        this.id = sceneContent.getId();
        this.contentOrder = sceneContent.getContentOrder();
        this.type = sceneContent.getType();
        this.content = sceneContent.getContent();

        if (sceneContent.getCharacter() != null) {
            this.character =
                    new CharacterResponse(sceneContent.getCharacter());
        }
    }
}