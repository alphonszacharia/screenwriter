package com.screenwriter.repository;

import com.screenwriter.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByUserUsername(String username);

    Optional<Project> findByIdAndUserUsername(Long id, String username);
}