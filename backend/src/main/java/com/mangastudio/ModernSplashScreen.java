package com.mangastudio;

import javax.swing.*;
import java.awt.*;
import java.net.URL;

public class ModernSplashScreen extends JWindow {

    private JLabel textLabel;
    private int step = 0;

    // Tes messages dans l'ordre demandé
    private final String[] messages = {
            "Coucou mon chat...",
            "... Encore quelques instants ...",
            "... oui tu me l'as dit, et oui je suis un vieux loup...",
            "Allons!..."
    };

    public ModernSplashScreen() {
        // 1. Configuration de la fenêtre
        setSize(450, 350); // Taille ajustée pour l'image + texte
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());

        // 2. Panel de fond (Style "Cozy" - Rose pâle)
        JPanel content = new JPanel();
        content.setBackground(new Color(255, 240, 245)); // Lavender Blush
        // Une bordure douce pour faire joli
        content.setBorder(BorderFactory.createLineBorder(new Color(230, 200, 210), 2));
        content.setLayout(new GridBagLayout());
        add(content);

        // Configuration pour centrer les éléments
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.insets = new Insets(10, 0, 15, 0); // Espace entre l'image et le texte

        // 3. CHARGEMENT DE L'IMAGE
        // Note importante : On utilise le chemin relatif au "classpath", pas le chemin C:\...
        // Cela permet à l'app de marcher sur n'importe quel PC.
        URL imageUrl = getClass().getResource("/static/images/logoApp.png");

        if (imageUrl != null) {
            // Si l'image est trouvée, on la redimensionne joliment
            ImageIcon originalIcon = new ImageIcon(imageUrl);
            Image scaledImage = originalIcon.getImage().getScaledInstance(120, 120, Image.SCALE_SMOOTH);
            JLabel imageLabel = new JLabel(new ImageIcon(scaledImage));

            gbc.gridy = 0; // Position : En haut
            content.add(imageLabel, gbc);
        } else {
            // Sécurité : Si l'image n'est pas trouvée, on affiche le titre en texte
            System.out.println("Image introuvable ! Vérifiez /static/images/logoApp.png");
            JLabel titleLabel = new JLabel("SumiWire");
            titleLabel.setFont(new Font("Serif", Font.BOLD | Font.ITALIC, 30));
            titleLabel.setForeground(new Color(200, 100, 120));

            gbc.gridy = 0;
            content.add(titleLabel, gbc);
        }

        // 4. Le Texte des messages
        textLabel = new JLabel(messages[0], SwingConstants.CENTER);
        textLabel.setFont(new Font("Segoe UI Semibold", Font.PLAIN, 16));
        textLabel.setForeground(new Color(100, 80, 90)); // Gris chaud (plus doux que noir)

        gbc.gridy = 1; // Position : En dessous de l'image
        content.add(textLabel, gbc);

        // 5. Système de défilement des messages (Timer)
        Timer timer = new Timer(2500, e -> {
            step++; // On passe au message suivant
            if (step < messages.length) {
                textLabel.setText(messages[step]);
            } else {
                // Si on a tout affiché, on arrête de changer le texte
                ((Timer)e.getSource()).stop();
            }
        });

        timer.start();
        setVisible(true);
    }

    public void close() {
        setVisible(false);
        dispose();
    }
}