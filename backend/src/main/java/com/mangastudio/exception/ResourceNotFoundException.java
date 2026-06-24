package com.mangastudio.exception;

/** Levée quand une ressource demandée n'existe pas → mappée en HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
