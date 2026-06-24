// ============================================
// SumiWire PRO - Initial State & History
// Phase 2: Layer system with migration
// ============================================

import { DEFAULT_DRAWING, DEFAULT_BUBBLE, DEFAULT_LAYER, MAX_HISTORY_SIZE, DEFAULT_BRUSHES } from '../../utils/constants';
import { generateId, loadFromStorage, loadBrushesFromStorage } from '../../utils/helpers';
import { createDefaultLayers, migratePageToLayers } from '../../utils/migration';

// Helper to create a new page — now with layers instead of drawings
export const createInitialPage = (format = 'a4') => {
  const layers = createDefaultLayers();
  return {
    id: generateId(),
    format,
    panels: [],
    bubbles: [],
    layers,
    activeLayerId: layers[1].id, // "Ink" layer active by default
    locked: false,
    position: null,
  };
};

const initialPages = [createInitialPage()];
const initialBrushes = [...DEFAULT_BRUSHES, ...loadBrushesFromStorage()];

export const defaultState = {
  projectId: null,
  projectName: 'Sans titre',
  pages: initialPages,
  activePageIndex: 0,
  selectedPanelIds: [],
  selectedBubbleIds: [],
  editingImageId: null,
  activeTool: 'select',
  drawing: { ...DEFAULT_DRAWING },
  brushes: initialBrushes,
  viewMode: 'single',
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showGrid: true,
  showGuides: true,
  snapToGrid: true,
  layoutLocked: false,
  isDarkMode: false,
  flipH: false,
  // Session-only view state (never persisted)
  canvasRotation: 0,
  showReadingOrder: false,
  // Session-only Phase 2 state
  selection: null,
  transform: null,
  editingMask: false,
  // Standard
  history: [{ pages: initialPages, activePageIndex: 0, action: 'Initial' }],
  historyIndex: 0,
  showSettings: false,
  showExport: false,
  showHelp: false,
  clipboard: null,
};

// Ensure backward compat: pages have position, layers, hydrated bubbles
const hydratePages = (pages) => {
  return (pages || [createInitialPage()]).map(page => {
    // Ensure position
    const withPos = { ...page, position: page.position !== undefined ? page.position : null };
    // Migrate drawings[] → layers[] if needed
    const withLayers = migratePageToLayers(withPos);
    // Hydrate bubbles with new defaults
    return {
      ...withLayers,
      bubbles: (withLayers.bubbles || []).map(b => ({ ...DEFAULT_BUBBLE, ...b })),
    };
  });
};

export const getInitialState = () => {
  const savedState = loadFromStorage();

  if (savedState) {
    const hydratedPages = hydratePages(savedState.pages);

    return {
      ...defaultState,
      ...savedState,
      drawing: { ...DEFAULT_DRAWING, ...(savedState.drawing || {}) },
      pages: hydratedPages,
      // Session-only: always reset
      canvasRotation: 0,
      showReadingOrder: false,
      selection: null,
      transform: null,
      editingMask: false,
      // Standard resets
      history: [{ pages: hydratedPages, activePageIndex: savedState.activePageIndex || 0, action: 'Restauré' }],
      historyIndex: 0,
      selectedPanelIds: [],
      selectedBubbleIds: [],
      editingImageId: null,
      showSettings: false,
      showExport: false,
      showHelp: false,
    };
  }
  return { ...defaultState };
};

/**
 * HISTORY HELPER
 */
export const addToHistory = (state, newPages, newActivePageIndex, actionLabel) => {
  const slicedHistory = state.history.slice(0, state.historyIndex + 1);
  const snapshot = {
    pages: newPages,
    activePageIndex: newActivePageIndex,
    action: actionLabel,
    timestamp: Date.now(),
  };
  let newHistory = [...slicedHistory, snapshot];
  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
  }
  return { history: newHistory, historyIndex: newHistory.length - 1 };
};
