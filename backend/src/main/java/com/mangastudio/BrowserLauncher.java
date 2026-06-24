package com.mangastudio;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import java.awt.Desktop;
import java.net.URI;

@Component
public class BrowserLauncher {

    @EventListener(ApplicationReadyEvent.class)
    public void launchBrowser() {
        // 1. Fermer le Splash Screen (On accède à la variable statique du Main)
        if (MangaStudioApplication.splash != null) {
            MangaStudioApplication.splash.close();
        }

        // 2. Ouvrir Chrome / Navigateur par défaut
        System.out.println("Application prête ! Lancement du navigateur...");
        try {
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(new URI("http://localhost:8080"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}