# 🎨 SumiWire Pro v2.0

Éditeur professionnel de manga et comics.

## ✨ Fonctionnalités

### 🔧 Corrections v2.0
- ✅ **Queues de bulles 360°** - Rotation complète autour de la bulle
- ✅ **Resize vertical & horizontal** - Fonctionne dans toutes les directions
- ✅ **Texte DANS les bulles** - Plus au-dessus !
- ✅ **Texte déplaçable** - Indépendamment de la bulle (déverrouillable)
- ✅ **Curseur de dessin visible** - Point noir pour repérer le curseur
- ✅ **Ctrl+Z par action** - Annule une action à la fois
- ✅ **Styles Tailwind centralisés** - Dans `styles/tailwind.js`
- ✅ **Mode clair/sombre** - Toggle dans le header
- ✅ **Header avec navbar** - Fichier, Édition, Affichage, Aide

### 📄 Pages
- Formats multiples (A4, US Comic, Manga B5, Webtoon, Square)
- Vue unique, double page, toutes les pages
- Miniatures avec prévisualisation
- Drag & drop pour réorganiser

### ✂️ Cases (Panels)
- 14 types de formes (rectangle, cercle, diagonale, explosion...)
- 8 poignées de redimensionnement
- Verrouillage/déverrouillage du layout
- Templates de mise en page

### 💬 Bulles
- 8 types (dialogue, pensée, cri, murmure, narration...)
- Queue repositionnable à 360°
- Texte éditable en double-cliquant
- Texte déplaçable indépendamment
- 14 polices incluses

### ✏️ Dessin
- Pinceau, crayon, marqueur, gomme
- Taille et opacité ajustables
- Curseur visible (point noir)

### ⌨️ Raccourcis
| Action | Raccourci |
|--------|-----------|
| Sélection | V |
| Dessin | D |
| Annuler | Ctrl+Z |
| Rétablir | Ctrl+Y |
| Copier | Ctrl+C |
| Coller | Ctrl+V |
| Sauvegarder | Ctrl+S |
| Supprimer | Delete |
| Vue 1/2/3 | 1/2/3 |
| Zoom | Ctrl+Scroll |
| Pan | Alt+Drag |

## 🚀 Installation

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:3000

## 📁 Structure

```
frontend/src/
├── components/
│   ├── header/       # Navbar & menus
│   ├── toolbar/      # Outils & layouts
│   ├── sidebar/      # Pages & layers
│   ├── canvas/       # Zone de travail
│   ├── panels/       # Composant Panel
│   ├── bubbles/      # Composant Bubble
│   ├── drawing/      # Canvas de dessin
│   ├── properties/   # Panneau propriétés
│   └── modals/       # Paramètres, export...
├── context/          # State global
├── styles/           # Tailwind classes
└── utils/            # Constants & helpers
```

## 📝 License

MIT

---
Fait avec ❤️
