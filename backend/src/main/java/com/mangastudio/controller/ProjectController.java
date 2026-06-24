package com.mangastudio.controller;

import com.mangastudio.entity.Project;
import com.mangastudio.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Liste tous les projets (sans le stateJson pour performance).
     */
    @GetMapping("/projects")
    public List<Map<String, Object>> getAllProjects() {
        return projectService.getAllProjectsSummary();
    }

    /**
     * Charge un projet complet avec son state JSON.
     */
    @GetMapping("/projects/{id}")
    public Project getProject(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    /**
     * Crée un nouveau projet.
     * Body: { "name": "...", "stateJson": "{...}" }
     */
    @PostMapping("/projects")
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    /**
     * Sauvegarde (met à jour) un projet existant.
     * Body: { "name": "...", "stateJson": "{...}" }
     */
    @PutMapping("/projects/{id}")
    public Project updateProject(@PathVariable Long id, @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }

    /**
     * Supprime un projet.
     */
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Auto-save : sauvegarde rapide du state JSON courant.
     * Si le projet n'existe pas encore (id null), le crée.
     */
    @PostMapping("/projects/autosave")
    public Project autosave(@RequestBody Map<String, Object> payload) {
        return projectService.autosave(payload);
    }
}
