// ============================================
// SumiWire PRO - Constantes : formats, vue, métriques, historique
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
