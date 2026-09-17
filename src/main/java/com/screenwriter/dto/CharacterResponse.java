package com.screenwriter.dto;

import com.screenwriter.entity.Character;
import lombok.Getter;

@Getter
public class CharacterResponse {

    private Long id;
    private String name;
    private String description;

    public CharacterResponse(Character character) {
        this.id = character.getId();
        this.name = character.getName();
        this.description = character.getDescription();
    }
}