// ============================================
// SumiWire PRO - Constantes : layouts & cases (panels)
// ============================================

// === LAYOUT TEMPLATES ===
export const LAYOUT_TEMPLATES = {
  'empty': { name: 'Vide', icon: '⬜', panels: [] },
  'full': { name: 'Pleine page', icon: '▣', panels: [{ x: 0, y: 0, w: 1, h: 1 }] },
  'half-h': { name: '2 Bandes', icon: '⬒', panels: [
    { x: 0, y: 0, w: 1, h: 0.5 },
    { x: 0, y: 0.5, w: 1, h: 0.5 }
  ]},
  'half-v': { name: '2 Colonnes', icon: '⬓', panels: [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 }
  ]},
  'grid-2x2': { name: 'Grille 2×2', icon: '⊞', panels: [
    { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
  ]},
  'grid-2x3': { name: 'Grille 2×3', icon: '⊟', panels: [
    { x: 0, y: 0, w: 0.5, h: 0.333 }, { x: 0.5, y: 0, w: 0.5, h: 0.333 },
    { x: 0, y: 0.333, w: 0.5, h: 0.334 }, { x: 0.5, y: 0.333, w: 0.5, h: 0.334 },
    { x: 0, y: 0.667, w: 0.5, h: 0.333 }, { x: 0.5, y: 0.667, w: 0.5, h: 0.333 }
  ]},
  'manga-3': { name: 'Manga 3 cases', icon: '⊡', panels: [
    { x: 0, y: 0, w: 1, h: 0.35 },
    { x: 0, y: 0.35, w: 0.55, h: 0.35 }, { x: 0.55, y: 0.35, w: 0.45, h: 0.35 },
    { x: 0, y: 0.7, w: 1, h: 0.3 }
  ]},
  'manga-5': { name: 'Manga 5 cases', icon: '▦', panels: [
    { x: 0, y: 0, w: 0.6, h: 0.4 }, { x: 0.6, y: 0, w: 0.4, h: 0.25 },
    { x: 0.6, y: 0.25, w: 0.4, h: 0.15 },
    { x: 0, y: 0.4, w: 0.45, h: 0.3 }, { x: 0.45, y: 0.4, w: 0.55, h: 0.3 },
    { x: 0, y: 0.7, w: 1, h: 0.3 }
  ]},
  'comic-classic': { name: 'Comic classique', icon: '▤', panels: [
    { x: 0, y: 0, w: 0.5, h: 0.33 }, { x: 0.5, y: 0, w: 0.5, h: 0.33 },
    { x: 0, y: 0.33, w: 1, h: 0.34 },
    { x: 0, y: 0.67, w: 0.33, h: 0.33 }, { x: 0.33, y: 0.67, w: 0.33, h: 0.33 }, { x: 0.66, y: 0.67, w: 0.34, h: 0.33 }
  ]},
};

// === PANEL TYPES ===
export const PANEL_TYPES = {
  'rectangle': { name: 'Rectangle', icon: '▭' },
  'rounded': { name: 'Arrondi', icon: '▢' },
  'circle': { name: 'Cercle', icon: '○' },
  'ellipse': { name: 'Ellipse', icon: '⬭' },
  'diagonal-left': { name: 'Diagonale ↙', icon: '◣' },
  'diagonal-right': { name: 'Diagonale ↘', icon: '◢' },
  'trapezoid': { name: 'Trapèze', icon: '⏢' },
  'parallelogram': { name: 'Parallélogramme', icon: '▱' },
  'hexagon': { name: 'Hexagone', icon: '⬡' },
  'octagon': { name: 'Octogone', icon: '⯃' },
  'star': { name: 'Étoile', icon: '☆' },
  'cloud': { name: 'Nuage', icon: '☁' },
  'explosion': { name: 'Explosion', icon: '💥' },
  'torn': { name: 'Déchiré', icon: '⚡' },
};

// === DEFAULT PANEL ===
export const DEFAULT_PANEL = {
  name: '',
  type: 'rectangle',
  x: 50,
  y: 50,
  width: 200,
  height: 150,
  borderWidth: 3,
  borderColor: '#000000',
  borderRadius: 0,
  backgroundColor: '#ffffff',
  rotation: 0,
  skewX: 0,
  skewY: 0,
  zIndex: 1,
  image: null,
  imageScaleX: 1,
  imageScaleY: 1,
  imageX: 0,
  imageY: 0,
  originalImageWidth: 0,
  originalImageHeight: 0,
};
