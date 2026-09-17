package com.screenwriter.repository;

import com.screenwriter.entity.SceneContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SceneContentRepository
        extends JpaRepository<SceneContent, Long> {

    List<SceneContent> findBySceneIdOrderByContentOrder(Long sceneId);
}