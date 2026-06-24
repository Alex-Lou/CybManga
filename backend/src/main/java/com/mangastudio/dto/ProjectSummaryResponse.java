package com.mangastudio.dto;

import java.time.LocalDateTime;

/** Résumé de projet pour les listes : sans le stateJson, pour la performance. */
public record ProjectSummaryResponse(
        Long id,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
