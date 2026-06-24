package com.mangastudio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class StartupDisplay {

    private static final Logger log = LoggerFactory.getLogger(StartupDisplay.class);
    private final Environment env;

    public StartupDisplay(Environment env) {
        this.env = env;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationEvent(ApplicationReadyEvent event) {
        try {
            Instant startTime = Instant.ofEpochMilli(event.getTimestamp());
            Duration startupTime = Duration.between(startTime, Instant.now());

            String port = env.getProperty("server.port", "8080");
            String context = env.getProperty("server.servlet.context-path", "");
            String activeProfile = env.getProperty("spring.profiles.active", "default");

            // Le log.info ici utilisera le format défini dans logback-spring.xml
            log.info("\n" +
                    "╔══════════════════════════════════════════════════════════════════════╗\n" +
                    "║               🚀 COMICFLOW STARTED SUCCESSFULLY                      ║\n" +
                    "╚══════════════════════════════════════════════════════════════════════╝\n" +
                    "\n" +
                    "  📊 Status:\n" +
                    "     ✓ Startup Time ................... " + formatDuration(startupTime) + "\n" +
                    "     ✓ Profile ........................ " + activeProfile + "\n" +
                    "     ✓ Port ........................... " + port + "\n" +
                    "\n" +
                    "  🌐 Access URLs (local uniquement):\n" +
                    "     • Backend:  http://localhost:" + port + context + "\n" +
                    "     • Swagger:  http://localhost:" + port + context + "/swagger-ui.html\n" +
                    "\n" +
                    "╚══════════════════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String formatDuration(Duration duration) {
        long seconds = duration.getSeconds();
        return String.format("%d.%03ds", seconds, duration.toMillisPart());
    }
}