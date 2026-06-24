package com.mangastudio.service;

import com.mangastudio.entity.Project;
import com.mangastudio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<Map<String, Object>> getAllProjectsSummary() {
        List<Project> projects = projectRepository.findAllByOrderByUpdatedAtDesc();
        List<Map<String, Object>> summaries = new ArrayList<>();
        for (Project p : projects) {
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("id", p.getId());
            summary.put("name", p.getName());
            summary.put("description", p.getDescription());
            summary.put("createdAt", p.getCreatedAt());
            summary.put("updatedAt", p.getUpdatedAt());
            summaries.add(summary);
        }
        return summaries;
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    @Transactional
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, Project projectData) {
        Project project = getProjectById(id);
        project.setName(projectData.getName());
        project.setDescription(projectData.getDescription());
        project.setStateJson(projectData.getStateJson());
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    @Transactional
    public Project autosave(Map<String, Object> payload) {
        Long id = null;
        if (payload.get("id") != null) {
            id = ((Number) payload.get("id")).longValue();
        }

        String name = (String) payload.getOrDefault("name", "Sans titre");
        String stateJson = (String) payload.getOrDefault("stateJson", "{}");

        if (id != null) {
            Optional<Project> existing = projectRepository.findById(id);
            if (existing.isPresent()) {
                Project project = existing.get();
                project.setName(name);
                project.setStateJson(stateJson);
                return projectRepository.save(project);
            }
        }

        Project project = Project.builder()
                .name(name)
                .stateJson(stateJson)
                .build();
        return projectRepository.save(project);
    }
}
