package com.mangastudio;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MangaStudioApplication {

    // Variable pour contrôler la fenêtre depuis l'extérieur (BrowserLauncher)
    public static ModernSplashScreen splash;

    public static void main(String[] args) {
        // 1. OBLIGATOIRE : Permet d'afficher une fenêtre (sinon Spring bloque l'interface)
        System.setProperty("java.awt.headless", "false");

        // 2. On lance ta fenêtre "Coucou mon chat..." tout de suite
        splash = new ModernSplashScreen();

        // 3. On configure Spring comme tu l'avais fait
        SpringApplication app = new SpringApplication(MangaStudioApplication.class);

        // Ta config existante
        app.setBannerMode(Banner.Mode.CONSOLE);
        app.setLogStartupInfo(false);

        // 4. On lance le chargement du backend
        app.run(args);
    }
}