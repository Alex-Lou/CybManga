package com.mangastudio.service;

import com.mangastudio.dto.AutosaveRequest;
import com.mangastudio.dto.ProjectRequest;
import com.mangastudio.dto.ProjectResponse;
import com.mangastudio.dto.ProjectSummaryResponse;
import com.mangastudio.entity.Project;
import com.mangastudio.exception.ResourceNotFoundException;
import com.mangastudio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final String DEFAULT_NAME = "Sans titre";
    private static final String EMPTY_STATE = "{}";

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getProjectsSummary(Pageable pageable) {
        return projectRepository.findAll(pageable).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = Project.builder()
                .name(request.name())
                .description(request.description())
                .stateJson(request.stateJson() != null ? request.stateJson() : EMPTY_STATE)
                .build();
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findEntity(id);
        project.setName(request.name());
        project.setDescription(request.description());
        if (request.stateJson() != null) {
            project.setStateJson(request.stateJson());
        }
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Projet introuvable : " + id);
        }
        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectResponse autosave(AutosaveRequest request) {
        String name = request.name() != null ? request.name() : DEFAULT_NAME;
        String stateJson = request.stateJson() != null ? request.stateJson() : EMPTY_STATE;

        if (request.id() != null) {
            Project existing = projectRepository.findById(request.id()).orElse(null);
            if (existing != null) {
                existing.setName(name);
                existing.setStateJson(stateJson);
                return toResponse(projectRepository.save(existing));
            }
        }

        Project project = Project.builder()
                .name(name)
                .stateJson(stateJson)
                .build();
        return toResponse(projectRepository.save(project));
    }

    // --- Mapping entité → DTO (l'entité ne sort jamais de cette couche) ---

    private Project findEntity(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + id));
    }

    private ProjectResponse toResponse(Project p) {
        return new ProjectResponse(
                p.getId(), p.getName(), p.getDescription(),
                p.getStateJson(), p.getCreatedAt(), p.getUpdatedAt());
    }

    private ProjectSummaryResponse toSummary(Project p) {
        return new ProjectSummaryResponse(
                p.getId(), p.getName(), p.getDescription(),
                p.getCreatedAt(), p.getUpdatedAt());
    }
}
