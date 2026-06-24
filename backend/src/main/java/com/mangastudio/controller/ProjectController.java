package com.mangastudio.controller;

import com.mangastudio.dto.AutosaveRequest;
import com.mangastudio.dto.ProjectRequest;
import com.mangastudio.dto.ProjectResponse;
import com.mangastudio.dto.ProjectSummaryResponse;
import com.mangastudio.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /** Liste les projets (résumé sans stateJson), du plus récent au plus ancien. Borné (100 par défaut). */
    @GetMapping("/projects")
    public List<ProjectSummaryResponse> getAllProjects(
            @PageableDefault(size = 100, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return projectService.getProjectsSummary(pageable);
    }

    /** Charge un projet complet (avec son stateJson). */
    @GetMapping("/projects/{id}")
    public ProjectResponse getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    /** Crée un nouveau projet. */
    @PostMapping("/projects")
    public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) {
        return projectService.createProject(request);
    }

    /** Met à jour un projet existant. */
    @PutMapping("/projects/{id}")
    public ProjectResponse updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectService.updateProject(id, request);
    }

    /** Supprime un projet. */
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    /** Auto-sauvegarde rapide du state courant : crée le projet si id absent. */
    @PostMapping("/projects/autosave")
    public ProjectResponse autosave(@RequestBody AutosaveRequest request) {
        return projectService.autosave(request);
    }
}
