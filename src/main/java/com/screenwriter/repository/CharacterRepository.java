package com.screenwriter.repository;

import com.screenwriter.entity.Character;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {

    List<Character> findByProjectId(Long projectId);

    Optional<Character> findByIdAndProjectId(
            Long id,
            Long projectId
    );
}