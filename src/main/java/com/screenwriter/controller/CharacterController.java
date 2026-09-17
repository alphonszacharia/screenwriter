package com.screenwriter.controller;

import com.screenwriter.dto.CharacterRequest;
import com.screenwriter.dto.CharacterResponse;
import com.screenwriter.entity.Character;
import com.screenwriter.service.CharacterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/characters")
public class CharacterController {

    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @PostMapping
    public ResponseEntity<CharacterResponse> createCharacter(
            @PathVariable Long projectId,
            @Valid @RequestBody CharacterRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Character character = characterService.createCharacter(
                projectId,
                request,
                username
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new CharacterResponse(character));
    }

    @GetMapping
    public ResponseEntity<List<CharacterResponse>> getProjectCharacters(
            @PathVariable Long projectId,
            Authentication authentication) {

        String username = authentication.getName();

        List<CharacterResponse> characters = characterService
                .getProjectCharacters(projectId, username)
                .stream()
                .map(CharacterResponse::new)
                .toList();

        return ResponseEntity.ok(characters);
    }

    @GetMapping("/{characterId}")
    public ResponseEntity<CharacterResponse> getCharacter(
            @PathVariable Long projectId,
            @PathVariable Long characterId,
            Authentication authentication) {

        String username = authentication.getName();

        Character character = characterService.getCharacter(
                projectId,
                characterId,
                username
        );

        return ResponseEntity.ok(
                new CharacterResponse(character)
        );
    }

    @PutMapping("/{characterId}")
    public ResponseEntity<CharacterResponse> updateCharacter(
            @PathVariable Long projectId,
            @PathVariable Long characterId,
            @Valid @RequestBody CharacterRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Character character = characterService.updateCharacter(
                projectId,
                characterId,
                request,
                username
        );

        return ResponseEntity.ok(
                new CharacterResponse(character)
        );
    }

    @DeleteMapping("/{characterId}")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable Long projectId,
            @PathVariable Long characterId,
            Authentication authentication) {

        String username = authentication.getName();

        characterService.deleteCharacter(
                projectId,
                characterId,
                username
        );

        return ResponseEntity.noContent().build();
    }
}