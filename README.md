# 🖋️ SumiWire Pro v2.0

**Éditeur professionnel de manga & comics** — desktop, hors-ligne.

Là où la plupart des outils se contentent de gérer bulles et cases, SumiWire embarque
un **vrai moteur de dessin de niveau Clip Studio** (stabilisateur, sensibilité à la
pression, lissage Bézier). C'est sa colonne vertébrale et sa différence.

---

## ✨ Fonctionnalités

### 📄 Pages & mise en page
- 6 formats pro : **A4, US Comic, Manga B5, Manga Tankōbon, Webtoon, Square** (mm + px).
- 3 modes de vue : page unique, double page, et **« toutes les pages » avec drag & drop libre** des planches.
- Marges de sécurité (*safe area*) et de fond perdu (*bleed*), grille, guides, magnétisme.

### ✂️ Cases (panels)
- **14 formes** : rectangle, arrondi, cercle, ellipse, diagonales, trapèze, parallélogramme, hexagone, octogone, étoile, nuage, explosion, déchiré…
- 8 poignées de redimensionnement, rotation, verrouillage du layout, **templates** (grille 2×2, manga 3/5 cases, comic classique…).
- **Images dans les cases** : import, déplacement et redimensionnement de l'image *indépendamment* de la case (clip à la forme).

### 💬 Bulles
- **8 types** : dialogue, pensée, cri, murmure, narration, radio, robot, chant.
- **Queue repositionnable à 360°**, texte éditable en double-clic et **déplaçable indépendamment**, 14 polices.

### ✏️ Moteur de dessin (le cœur)
- Pinceau, crayon, marqueur, gomme, pipette, pot de remplissage.
- **Stabilisateur LazyBrush** (style Lazy Nezumi / Clip Studio).
- **Pression** (taille *et* opacité), lissage **Bézier quadratique** temps réel, espacement par tampons, événements coalescés (latence minimale).
- **Brushes personnalisables** (forme + texture), import/export JSON ou image, presets pro (G-Pen, Maru, calligraphie, aérographe, fusain, encre sèche…).

### 🎨 Outils pro manga
- **Trames (screentone)** : LPI, densité, angle, forme.
- **Lignes de vitesse** & **lignes de focus** générées à la volée.
- **Symétrie** verticale / horizontale / les deux (avec axes guides).
- **Correction de forme** (auto-cercle/ligne/rectangle), **alpha lock**, **remplissage avec fermeture de gaps**, dégradés linéaires/radiaux.

### 🗂️ Calques & couleurs
- Calques complets : visibilité, verrouillage, opacité, **10 modes de fusion** (uniquement ceux qui survivent à l'export PSD), masque d'écrêtage.
- Palettes manga/trames/peaux/nature/vibrant, couleurs récentes, **harmonie par « mood »**.

### 💾 Persistance & export
- **Auto-sauvegarde** (30 s) vers le backend + repli localStorage.
- Export **PNG** et **PSD Adobe** (avec calques), projets `.manga`, **import PSD** (Adobe/Fresco).
- Annuler/Rétablir **par action** (historique 100), raccourcis clavier **personnalisables**.

### 🎭 Design
Double identité pilotée par une **source de tokens unique** :
- **Sombre** : cyberpunk néon (cyan `#00f7ff`, magenta `#ff00ea`, typo Orbitron).
- **Clair** : chrome/argent industriel.

Rendu **multi-canvas** (calque *baked* + calque actif + overlay curseur) pour un dessin fluide.

---

## ⌨️ Raccourcis (personnalisables)

| Action | Raccourci | | Action | Raccourci |
|---|---|---|---|---|
| Sélection | `V` | | Sauvegarder | `Ctrl+S` |
| Main (pan) | `H` | | Copier / Coller | `Ctrl+C` / `Ctrl+V` |
| Dessin | `D` | | Supprimer | `Suppr` |
| Annuler / Rétablir | `Ctrl+Z` / `Ctrl+Y` | | Vues 1 / 2 / 3 | `1` `2` `3` |
| Zoom | `Ctrl+Molette` | | Centrer | `Home` |
| Pan temporaire | `Espace+Glisser` ou `Alt+Glisser` | | Tout sélectionner | `Ctrl+A` |

---

## 🧱 Stack technique

| Couche | Technologies |
|---|---|
| **Frontend** | React 18 · Vite 5 · Tailwind 3 · **Electron 40** (desktop Windows portable) |
| **État** | Context + reducer pur (découpé par domaine) · persistance document-store |
| **Backend** | **Spring Boot 3.2 · Java 21 · H2** (fichier local) · JPA · springdoc/Swagger · Lombok |
| **Packaging** | electron-builder · **jpackage** (runtime Java embarqué) · Maven (build le React → static) |

Architecture **offline-first** : le backend tourne en local (lié à `127.0.0.1`), aucune dépendance cloud.

---

## 🚀 Démarrer

### Frontend (UI + dessin)
```bash
cd frontend
npm install
npm run dev            # Vite → http://localhost:3000
npm run build          # bundle → frontend/dist/
npm run electron:dev   # build + lance l'app Electron
npm run electron:build # installeur Windows portable → frontend/release/
```
> Node 18.17+ requis.

### Backend (API de sauvegarde — optionnel en dev)
```bash
cd backend
mvn spring-boot:run    # API Spring Boot → http://localhost:8080
mvn package            # jar (copie frontend/dist → static/)
```
> Sans backend lancé, l'app fonctionne quand même via le repli localStorage.

---

## 📁 Structure

```
manga-studio-pro/
├── frontend/                       React 18 · Vite · Tailwind · Electron
│   ├── src/
│   │   ├── components/
│   │   │   ├── header/             navbar, menus, raccourcis (hook), dialogue projets
│   │   │   ├── toolbar/            outils, dropdowns, color picker, options, modal brush
│   │   │   ├── sidebar/            pages & calques
│   │   │   ├── canvas/             zone de travail, vues, rendu de page, curseur
│   │   │   ├── panels/             cases : formes, interaction, menu contextuel
│   │   │   ├── bubbles/bubble/     bulles : formes, géométrie, queues
│   │   │   ├── drawing/            moteur de dessin, brushEngine, flood-fill
│   │   │   ├── properties/         panneau de propriétés
│   │   │   ├── navigator/          navigation rapide
│   │   │   ├── radial/             menu radial
│   │   │   ├── reference/          images de référence
│   │   │   └── modals/             paramètres, export…
│   │   ├── context/studio/         état global : state · actions · reducer (+ reducers/ par domaine)
│   │   ├── styles/                 tokens & classes Tailwind centralisées
│   │   └── utils/                  constants/ (par domaine) · api · psd* · screentone · effectLines · …
│   └── electron/main.cjs           shell desktop
└── backend/                        Spring Boot · Java 21 · H2
    └── src/main/java/com/mangastudio/
        ├── controller/ service/ repository/ entity/ dto/ config/ exception/
        └── (desktop : BrowserLauncher, ModernSplashScreen, StartupDisplay)
```

Principes : contenu / style / structure / interaction séparés (SoC), composants courts
(< 400 lignes), DTO côté API, îlots de logique extraits en hooks. Voir [`CLAUDE.md`](CLAUDE.md).

---

## 🚀 Ce qui le rend différent

1. **Un moteur de dessin pro en web-tech** — stabilisateur, pression, Bézier : niveau natif, pas un `<canvas>` jouet.
2. **100 % orienté manga** : trames, lignes de vitesse/focus, queues 360°, formats B5/Tankōbon/Webtoon — natifs.
3. **Interopérabilité PSD honnête** : import *et* export avec calques, et seulement les modes de fusion réellement supportés.
4. **Desktop hors-ligne, données locales** : Electron + Spring Boot + H2, sans internet, rien dans le cloud.
5. **Persistance « document-store »** : le frontend est la source de vérité, souple et rapide (façon Figma/Excalidraw).
6. **Rendu multi-canvas** pour un dessin temps réel sans accroc.

---

## 📝 License

MIT
