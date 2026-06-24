// ============================================
// SumiWire PRO - Constantes : dessin, brushes, calques, modes de fusion
// ============================================

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

// === DEFAULT DRAWING ===
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
