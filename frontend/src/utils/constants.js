// ============================================
// SumiWire PRO - Constants & Configuration
// ============================================

// === PAGE FORMATS ===
export const PAGE_FORMATS = {
  'a4': { name: 'A4', width: 794, height: 1123, widthMm: 210, heightMm: 297 },
  'us-comic': { name: 'US Comic', width: 624, height: 960, widthMm: 165, heightMm: 254 },
  'manga-b5': { name: 'Manga B5', width: 680, height: 960, widthMm: 182, heightMm: 257 },
  'manga-tanko': { name: 'Manga Tankobon', width: 610, height: 860, widthMm: 161, heightMm: 227 },
  'webtoon': { name: 'Webtoon', width: 800, height: 1280, widthMm: 211, heightMm: 338 },
  'square': { name: 'Square', width: 800, height: 800, widthMm: 211, heightMm: 211 },
};

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

// === BUBBLE TYPES ===
export const BUBBLE_TYPES = {
  'speech': { 
    name: 'Dialogue', 
    icon: '💬',
    defaults: {
      fontFamily: "'Comic Neue', cursive",
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 3,
    }
  },
  'thought': { 
    name: 'Pensée', 
    icon: '💭',
    defaults: {
      fontFamily: "'Comic Neue', cursive",
      fontSize: 15,
      fontWeight: 'normal',
      fontStyle: 'italic',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'shout': { 
    name: 'Cri', 
    icon: '💥',
    defaults: {
      fontFamily: "'Bangers', cursive",
      fontSize: 22,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 4,
    }
  },
  'whisper': { 
    name: 'Murmure', 
    icon: '🤫',
    defaults: {
      fontFamily: "'Patrick Hand', cursive",
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'italic',
      backgroundColor: '#ffffff',
      borderColor: '#666666',
      borderWidth: 1.5,
    }
  },
  'narration': { 
    name: 'Narration', 
    icon: '📜',
    defaults: {
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#fef9c3',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'radio': { 
    name: 'Radio/TV', 
    icon: '📻',
    defaults: {
      fontFamily: "Arial, sans-serif",
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'robot': { 
    name: 'Robot/IA', 
    icon: '🤖',
    defaults: {
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'normal',
      backgroundColor: '#e5e7eb',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
  'chant': { 
    name: 'Chant', 
    icon: '🎵',
    defaults: {
      fontFamily: "'Gloria Hallelujah', cursive",
      fontSize: 16,
      fontWeight: 'normal',
      fontStyle: 'normal',
      backgroundColor: '#ffffff',
      borderColor: '#000000',
      borderWidth: 2,
    }
  },
};

// === FONTS ===
export const FONTS = [
  { name: 'Comic Neue', value: "'Comic Neue', cursive" },
  { name: 'Bangers', value: "'Bangers', cursive" },
  { name: 'Permanent Marker', value: "'Permanent Marker', cursive" },
  { name: 'Patrick Hand', value: "'Patrick Hand', cursive" },
  { name: 'Indie Flower', value: "'Indie Flower', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Shadows Into Light', value: "'Shadows Into Light', cursive" },
  { name: 'Gloria Hallelujah', value: "'Gloria Hallelujah', cursive" },
  { name: 'Amatic SC', value: "'Amatic SC', cursive" },
  { name: 'Kranky', value: "'Kranky', cursive" },
  { name: 'Noto Sans JP', value: "'Noto Sans JP', sans-serif" },
  { name: 'M PLUS Rounded 1c', value: "'M PLUS Rounded 1c', sans-serif" },
  { name: 'Kosugi Maru', value: "'Kosugi Maru', sans-serif" },
  { name: 'Arial', value: 'Arial, sans-serif' },
];

// === DRAWING TOOLS ===
export const DRAWING_TOOLS = {
  'brush': { name: 'Pinceau', icon: '🖌️', cursor: 'crosshair' },
  'pencil': { name: 'Crayon', icon: '✏️', cursor: 'crosshair' },
  'marker': { name: 'Marqueur', icon: '🖊️', cursor: 'crosshair' },
  'eraser': { name: 'Gomme', icon: '🧽', cursor: 'crosshair' },
  'eyedropper': { name: 'Pipette', icon: '💉', cursor: 'crosshair' },
  'fill': { name: 'Remplissage', icon: '🪣', cursor: 'crosshair' },
  'speedlines': { name: 'Lignes de vitesse', icon: '💨', cursor: 'crosshair' },
  'focuslines': { name: 'Lignes de focus', icon: '🎯', cursor: 'crosshair' },
  'screentone': { name: 'Trame', icon: '🔲', cursor: 'crosshair' },
  'gradient': { name: 'Dégradé', icon: '🌈', cursor: 'crosshair' },
};

// === BRUSHES ===
export const DEFAULT_BRUSHES = [
  // --- Basics ---
  {
    id: 'round',
    name: 'Rond',
    type: 'shape',
    shape: 'circle',
    icon: '●',
    pressureSize: true,
    pressureOpacity: false,
    builtin: true,
  },
  {
    id: 'square',
    name: 'Carré',
    type: 'shape',
    shape: 'square',
    icon: '■',
    pressureSize: true,
    pressureOpacity: false,
    builtin: true,
  },
  // --- Pro: Ink & Calligraphy ---
  {
    id: 'pen',
    name: 'Plume',
    type: 'shape',
    shape: 'ellipse',
    angle: 45,
    ratio: 0.3,
    icon: '✒️',
    pressureSize: true,
    pressureOpacity: false,
    builtin: true,
  },
  {
    id: 'gpen',
    name: 'G-Pen',
    type: 'shape',
    shape: 'circle',
    icon: '🖊️',
    pressureSize: true,
    pressureOpacity: false,
    minSizeRatio: 0.1,
    builtin: true,
  },
  {
    id: 'maru',
    name: 'Maru Pen',
    type: 'shape',
    shape: 'circle',
    icon: '🔘',
    pressureSize: true,
    pressureOpacity: false,
    minSizeRatio: 0.05,
    builtin: true,
  },
  {
    id: 'calligraphy',
    name: 'Calligraphie',
    type: 'shape',
    shape: 'ellipse',
    angle: 30,
    ratio: 0.15,
    icon: '🪶',
    pressureSize: true,
    pressureOpacity: true,
    builtin: true,
  },
  // --- Pro: Painting ---
  {
    id: 'soft',
    name: 'Doux',
    type: 'shape',
    shape: 'circle',
    softness: 0.5,
    icon: '○',
    pressureSize: false,
    pressureOpacity: true,
    builtin: true,
  },
  {
    id: 'airbrush',
    name: 'Aérographe',
    type: 'shape',
    shape: 'circle',
    softness: 0.85,
    icon: '💨',
    pressureSize: false,
    pressureOpacity: true,
    builtin: true,
  },
  {
    id: 'marker',
    name: 'Marqueur',
    type: 'shape',
    shape: 'ellipse',
    ratio: 0.6,
    angle: 15,
    icon: '🖍️',
    pressureSize: true,
    pressureOpacity: true,
    builtin: true,
  },
  {
    id: 'flat',
    name: 'Plat',
    type: 'shape',
    shape: 'rectangle',
    ratio: 0.2,
    angle: 0,
    icon: '▬',
    pressureSize: true,
    pressureOpacity: false,
    builtin: true,
  },
  // --- Pro: Special ---
  {
    id: 'ink_dry',
    name: 'Encre sèche',
    type: 'shape',
    shape: 'circle',
    softness: 0.15,
    icon: '🩸',
    pressureSize: true,
    pressureOpacity: true,
    minSizeRatio: 0.3,
    builtin: true,
  },
  {
    id: 'charcoal',
    name: 'Fusain',
    type: 'shape',
    shape: 'ellipse',
    ratio: 0.7,
    angle: 10,
    softness: 0.35,
    icon: '🪵',
    pressureSize: true,
    pressureOpacity: true,
    builtin: true,
  },
];

// === BLEND MODES (Phase 2) ===
// 10 modes supported in-app AND in PSD export — no false promises
export const BLEND_MODES = [
  { id: 'source-over', name: 'Normal', psd: 'normal' },
  { id: 'multiply', name: 'Multiply', psd: 'multiply' },
  { id: 'screen', name: 'Screen', psd: 'screen' },
  { id: 'overlay', name: 'Overlay', psd: 'overlay' },
  { id: 'soft-light', name: 'Soft Light', psd: 'soft light' },
  { id: 'hard-light', name: 'Hard Light', psd: 'hard light' },
  { id: 'color-dodge', name: 'Color Dodge', psd: 'color dodge' },
  { id: 'color-burn', name: 'Color Burn', psd: 'color burn' },
  { id: 'darken', name: 'Darken', psd: 'darken' },
  { id: 'lighten', name: 'Lighten', psd: 'lighten' },
];

export const BLEND_MODES_MAP = Object.fromEntries(BLEND_MODES.map(m => [m.id, m]));

// === DEFAULT LAYER ===
export const DEFAULT_LAYER = {
  id: '',
  name: 'Layer',
  visible: true,
  locked: false,
  opacity: 1,
  blendMode: 'source-over',
  clippingMask: false,
  strokes: [],
  mask: null,
};

// === VIEW MODES ===
export const VIEW_MODES = {
  'single': { name: 'Page unique', icon: '📄' },
  'spread': { name: 'Double page', icon: '📖' },
  'all': { name: 'Toutes les pages', icon: '📚' },
};

// === GRID & SNAP ===
export const GRID_SIZE = 10;
export const SNAP_THRESHOLD = 8;
export const SAFE_MARGIN_MM = 15;
export const BLEED_MARGIN_MM = 3;
export const MM_TO_PX = 3.7795275591;

// === HISTORY ===
export const MAX_HISTORY_SIZE = 100;

// === DEFAULT VALUES ===
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

export const DEFAULT_BUBBLE = {
  type: 'speech',
  x: 100,
  y: 100,
  width: 180,
  height: 100,
  tailAngle: 180,
  tailLength: 40,
  tailWidth: 20,
  backgroundColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: 3,
  zIndex: 10,
  text: '',
  textOffsetX: 0,
  textOffsetY: 0,
  textLocked: true,
  fontSize: 16,
  fontFamily: "'Comic Neue', cursive",
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  textColor: '#000000',
  lineHeight: 1.3,
  autoSize: true,
};

export const DEFAULT_DRAWING = {
  tool: 'pencil',
  brushId: 'round',
  color: '#000000',
  size: 3,
  opacity: 1,
  stabilization: 5,
  recentColors: [],
  // Phase 1 — Pro features
  symmetryMode: 'off',        // 'off'|'vertical'|'horizontal'|'both'
  shapeCorrection: false,
  alphaLock: false,
  fillGapSize: 0,             // 0-10 pixels gap closing
  // Speed/Focus lines params
  speedlinesCount: 80,
  speedlinesSpread: 30,
  speedlinesMinThick: 0.3,
  speedlinesMaxThick: 3,
  focuslinesCount: 120,
  focuslinesInnerRadius: 50,
  focuslinesMinThick: 0.3,
  focuslinesMaxThick: 2,
  // Screentone params
  screentoneLPI: 55,
  screentoneDensity: 30,
  screentoneAngle: 45,
  screentoneShape: 'dot',
  // Gradient params
  gradientType: 'linear',
  gradientSecondColor: null,
};

// Manga color palettes
export const COLOR_PALETTES = {
  manga: {
    name: 'Manga Classic',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
             '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483', '#2b2d42'],
  },
  screentone: {
    name: 'Trames',
    colors: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080',
             '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2', '#ffffff'],
  },
  skin: {
    name: 'Peaux',
    colors: ['#fce4d6', '#f5d0b5', '#e8b894', '#d4a373', '#c68c53', '#b07542',
             '#8d5e32', '#6b4423', '#ffe0bd', '#ffd1a4', '#ffc18c', '#ffb074'],
  },
  nature: {
    name: 'Nature',
    colors: ['#2d5016', '#3a6b1e', '#4a8c2a', '#5aad36', '#7bc950', '#a8e06a',
             '#4a90d9', '#5ba3ec', '#87ceeb', '#b5e2f5', '#d4f0fc', '#e8f8ff'],
  },
  vibrant: {
    name: 'Vibrant',
    colors: ['#ff0000', '#ff6600', '#ffcc00', '#33cc33', '#0066ff', '#9933ff',
             '#ff3399', '#ff9966', '#ffff66', '#66ff66', '#66ccff', '#cc66ff'],
  },
};

// === THEME COLORS ===
// Light: Chrome/Silver industrial — Dark: Cyberpunk neon
export const THEME_COLORS = {
  light: {
    bg: '#e4e7ec',
    surface: '#f0f2f5',
    surfaceHover: '#e8eaee',
    border: '#c8cdd5',
    borderHover: '#a8b0bc',
    text: '#1a1d24',
    textSecondary: '#4a5060',
    textMuted: '#7a8290',
    primary: '#0088aa',
    primaryHover: '#006d8a',
    accent: '#8855cc',
    success: '#22886a',
    warning: '#bb8822',
    error: '#cc3344',
    canvas: '#cdd1d8',
    page: '#ffffff',
    selection: 'rgba(0, 136, 170, 0.15)',
    guide: '#0088aa',
    bleed: '#cc3344',
    glow: 'rgba(0, 136, 170, 0.2)',
    glowMagenta: 'rgba(136, 85, 204, 0.2)',
  },
  dark: {
    bg: '#0a0a0f',
    surface: '#141726',
    surfaceHover: '#1f2233',
    border: '#2b2d42',
    borderHover: '#3d4060',
    text: '#e0e1dd',
    textSecondary: '#9aa5b1',
    textMuted: '#636a76',
    primary: '#00f7ff',
    primaryHover: '#00d4db',
    accent: '#ff00ea',
    success: '#00ff87',
    warning: '#f3e600',
    error: '#ff2e63',
    canvas: '#060610',
    page: '#1a1a2e',
    selection: 'rgba(0, 247, 255, 0.18)',
    guide: '#00f7ff',
    bleed: '#ff2e63',
    glow: 'rgba(0, 247, 255, 0.4)',
    glowMagenta: 'rgba(255, 0, 234, 0.4)',
  },
};