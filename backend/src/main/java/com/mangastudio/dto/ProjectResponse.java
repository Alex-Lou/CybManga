package com.mangastudio.dto;

import java.time.LocalDateTime;

/** Projet complet renvoyé au client (inclut le stateJson). */
public record ProjectResponse(
        Long id,
        String name,
        String description,
        String stateJson,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
