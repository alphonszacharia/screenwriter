package com.screenwriter.service;

import com.screenwriter.dto.CharacterRequest;
import com.screenwriter.entity.Character;
import com.screenwriter.entity.Project;
import com.screenwriter.repository.CharacterRepository;
import com.screenwriter.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CharacterService {

    private final CharacterRepository characterRepository;
    private final ProjectRepository projectRepository;

    public CharacterService(
            CharacterRepository characterRepository,
            ProjectRepository projectRepository) {

        this.characterRepository = characterRepository;
        this.projectRepository = projectRepository;
    }

    public Character createCharacter(
            Long projectId,
            CharacterRequest request,
            String username) {

        Project project = projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        Character character = new Character();

        character.setName(request.getName());
        character.setDescription(request.getDescription());
        character.setProject(project);

        return characterRepository.save(character);
    }

    public List<Character> getProjectCharacters(
            Long projectId,
            String username) {

        projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        return characterRepository.findByProjectId(projectId);
    }

    public Character getCharacter(
            Long projectId,
            Long characterId,
            String username) {

        projectRepository
                .findByIdAndUserUsername(projectId, username)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        return characterRepository
                .findByIdAndProjectId(characterId, projectId)
                .orElseThrow(() ->
                        new RuntimeException("Character not found"));
    }

    public Character updateCharacter(
            Long projectId,
            Long characterId,
            CharacterRequest request,
            String username) {

        Character character = getCharacter(
                projectId,
                characterId,
                username
        );

        character.setName(request.getName());
        character.setDescription(request.getDescription());

        return characterRepository.save(character);
    }

    public void deleteCharacter(
            Long projectId,
            Long characterId,
            String username) {

        Character character = getCharacter(
                projectId,
                characterId,
                username
        );

        characterRepository.delete(character);
    }
}