package com.mangastudio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Données acceptées en entrée pour créer ou mettre à jour un projet.
 * Le client ne fournit jamais id / createdAt / updatedAt : ces champs sont
 * gérés exclusivement côté serveur (entité Project).
 */
public record ProjectRequest(

        @NotBlank(message = "Le nom du projet est obligatoire")
        @Size(max = 255, message = "Le nom ne peut dépasser 255 caractères")
        String name,

        @Size(max = 2000, message = "La description ne peut dépasser 2000 caractères")
        String description,

        String stateJson
) {}
