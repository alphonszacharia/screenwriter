package com.screenwriter.controller;

import com.screenwriter.dto.SceneRequest;
import com.screenwriter.dto.SceneResponse;
import com.screenwriter.entity.Scene;
import com.screenwriter.service.SceneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/scenes")
public class SceneController {

    private final SceneService sceneService;

    public SceneController(SceneService sceneService) {
        this.sceneService = sceneService;
    }

    @PostMapping
    public ResponseEntity<SceneResponse> createScene(
            @PathVariable Long projectId,
            @Valid @RequestBody SceneRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Scene scene = sceneService.createScene(
                projectId,
                request,
                username
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new SceneResponse(scene));
    }
    @PutMapping("/{sceneId}")
    public ResponseEntity<SceneResponse> updateScene(
            @PathVariable Long projectId,
            @PathVariable Long sceneId,
            @Valid @RequestBody SceneRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        Scene scene = sceneService.updateScene(
                projectId,
                sceneId,
                request,
                username
        );

        return ResponseEntity.ok(
                new SceneResponse(scene)
        );
    }

    @GetMapping
    public ResponseEntity<List<SceneResponse>> getProjectScenes(
            @PathVariable Long projectId,
            Authentication authentication) {

        String username = authentication.getName();

        List<SceneResponse> scenes = sceneService
                .getProjectScenes(projectId, username)
                .stream()
                .map(SceneResponse::new)
                .toList();

        return ResponseEntity.ok(scenes);
    }

    @GetMapping("/{sceneId}")
    public ResponseEntity<SceneResponse> getScene(
            @PathVariable Long projectId,
            @PathVariable Long sceneId,
            Authentication authentication) {

        String username = authentication.getName();

        Scene scene = sceneService.getScene(
                projectId,
                sceneId,
                username
        );

        return ResponseEntity.ok(
                new SceneResponse(scene)
        );
    }
}