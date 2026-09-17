package com.screenwriter.repository;

import com.screenwriter.entity.Scene;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SceneRepository extends JpaRepository<Scene, Long> {

    List<Scene> findByProjectIdOrderBySceneOrder(Long projectId);

    Optional<Scene> findByIdAndProjectId(Long id, Long projectId);
}