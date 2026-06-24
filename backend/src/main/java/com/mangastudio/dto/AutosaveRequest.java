package com.mangastudio.dto;

/**
 * Payload d'auto-sauvegarde. Volontairement permissif :
 * id == null → création d'un nouveau projet ;
 * name / stateJson absents → valeurs par défaut appliquées dans le service.
 */
public record AutosaveRequest(
        Long id,
        String name,
        String stateJson
) {}
