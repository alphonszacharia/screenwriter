package com.screenwriter.controller;

import com.screenwriter.dto.SceneContentRequest;
import com.screenwriter.dto.SceneContentResponse;
import com.screenwriter.entity.SceneContent;
import com.screenwriter.service.SceneContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenes/{sceneId}/contents")
public class SceneContentController {

    private final SceneContentService sceneContentService;

    public SceneContentController(
            SceneContentService sceneContentService) {

        this.sceneContentService = sceneContentService;
    }

    @PostMapping
    public ResponseEntity<SceneContentResponse> createContent(
            @PathVariable Long sceneId,
            @Valid @RequestBody SceneContentRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        SceneContent content =
                sceneContentService.createContent(
                        sceneId,
                        request,
                        username
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new SceneContentResponse(content));
    }

    @GetMapping
    public ResponseEntity<List<SceneContentResponse>> getSceneContents(
            @PathVariable Long sceneId,
            Authentication authentication) {

        String username = authentication.getName();

        List<SceneContentResponse> contents =
                sceneContentService
                        .getSceneContents(sceneId, username)
                        .stream()
                        .map(SceneContentResponse::new)
                        .toList();

        return ResponseEntity.ok(contents);
    }
    @PutMapping
    public ResponseEntity<List<SceneContentResponse>> replaceSceneContents(
            @PathVariable Long sceneId,
            @Valid @RequestBody List<SceneContentRequest> requests,
            Authentication authentication) {

        String username = authentication.getName();

        List<SceneContentResponse> contents =
                sceneContentService
                        .replaceSceneContents(
                                sceneId,
                                requests,
                                username
                        )
                        .stream()
                        .map(SceneContentResponse::new)
                        .toList();

        return ResponseEntity.ok(contents);
    }
}