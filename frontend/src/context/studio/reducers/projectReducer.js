// ============================================
// SumiWire PRO - Sous-réducteur : outils, vue, UI, layout, projet,
// historique, presse-papier, brushes
// ============================================

import { ACTIONS } from '../actions';
import { createInitialPage, addToHistory, defaultState, getInitialState } from '../state';
import { generateId, deepClone } from '../../../utils/helpers';
import { PAGE_FORMATS, LAYOUT_TEMPLATES, DEFAULT_PANEL } from '../../../utils/constants';

export const projectReducer = (state, action, { currentPage, withHistory }) => {
  switch (action.type) {
    // === TOOLS & VIEW ===
    case ACTIONS.SET_TOOL: return { ...state, activeTool: action.payload };
    case ACTIONS.SET_DRAWING_SETTINGS: return { ...state, drawing: { ...state.drawing, ...action.payload } };
    case ACTIONS.SET_VIEW_MODE: return { ...state, viewMode: action.payload };
    case ACTIONS.SET_ZOOM: return { ...state, zoom: action.payload };
    case ACTIONS.SET_PAN: return { ...state, panOffset: action.payload };
    case ACTIONS.TOGGLE_GRID: return { ...state, showGrid: !state.showGrid };
    case ACTIONS.TOGGLE_GUIDES: return { ...state, showGuides: !state.showGuides };
    case ACTIONS.TOGGLE_SNAP: return { ...state, snapToGrid: !state.snapToGrid };

    // === UI ===
    case ACTIONS.TOGGLE_SETTINGS: return { ...state, showSettings: !state.showSettings };
    case ACTIONS.TOGGLE_EXPORT: return { ...state, showExport: !state.showExport };
    case ACTIONS.TOGGLE_HELP: return { ...state, showHelp: !state.showHelp };
    case ACTIONS.TOGGLE_DARK_MODE: return { ...state, isDarkMode: !state.isDarkMode };
    case ACTIONS.TOGGLE_FLIP_H: return { ...state, flipH: !state.flipH };
    case ACTIONS.SET_CANVAS_ROTATION: return { ...state, canvasRotation: action.payload };
    case ACTIONS.TOGGLE_READING_ORDER: return { ...state, showReadingOrder: !state.showReadingOrder };

    // === LAYOUT ===
    case ACTIONS.APPLY_LAYOUT: {
      if (state.layoutLocked) return state;
      const template = LAYOUT_TEMPLATES[action.payload];
      if (!template) return state;
      const format = PAGE_FORMATS[currentPage.format];
      const margin = 20, gutter = 10;
      const contentW = format.width - margin * 2;
      const contentH = format.height - margin * 2;

      const newPanels = template.panels.map((p) => ({
        ...DEFAULT_PANEL, id: generateId(),
        x: margin + p.x * contentW + (p.x > 0 ? gutter / 2 : 0),
        y: margin + p.y * contentH + (p.y > 0 ? gutter / 2 : 0),
        width: p.w * contentW - (p.x > 0 && p.x + p.w < 1 ? gutter : p.x > 0 || p.x + p.w < 1 ? gutter / 2 : 0),
        height: p.h * contentH - (p.y > 0 && p.y + p.h < 1 ? gutter : p.y > 0 || p.y + p.h < 1 ? gutter / 2 : 0),
      }));
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, panels: newPanels } : p);
      return withHistory({ ...state, pages: newPages, selectedPanelIds: [], editingImageId: null }, `Appliquer layout: ${template.name}`);
    }

    case ACTIONS.TOGGLE_LAYOUT_LOCK: return { ...state, layoutLocked: !state.layoutLocked };

    // === PROJECT MANAGEMENT ===
    case ACTIONS.SET_PROJECT_NAME: return { ...state, projectName: action.payload };
    case ACTIONS.SET_PROJECT_ID: return { ...state, projectId: action.payload };

    case ACTIONS.LOAD_PROJECT: {
      const loadedPages = action.payload.pages || [createInitialPage()];
      return {
        ...defaultState,
        ...action.payload,
        pages: loadedPages,
        projectId: action.payload.projectId || null,
        history: [{ pages: deepClone(loadedPages), activePageIndex: 0, action: 'Charger projet' }],
        historyIndex: 0,
      };
    }

    case ACTIONS.NEW_PROJECT: {
      const newInitialPages = [createInitialPage(action.payload?.format || 'a4')];
      return {
        ...getInitialState(),
        pages: newInitialPages,
        projectId: null,
        history: [{ pages: deepClone(newInitialPages), activePageIndex: 0, action: 'Nouveau projet' }],
        historyIndex: 0,
      };
    }

    // === HISTORY ===
    case ACTIONS.UNDO: {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      return { ...state, pages: deepClone(snapshot.pages), activePageIndex: snapshot.activePageIndex, historyIndex: newIndex, selectedPanelIds: [], selectedBubbleIds: [], editingImageId: null };
    }

    case ACTIONS.REDO: {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      return { ...state, pages: deepClone(snapshot.pages), activePageIndex: snapshot.activePageIndex, historyIndex: newIndex, selectedPanelIds: [], selectedBubbleIds: [], editingImageId: null };
    }

    case ACTIONS.SAVE_HISTORY:
      return { ...state, ...addToHistory(state, state.pages, state.activePageIndex, action.payload || 'Modification') };

    // === CLIPBOARD ===
    case ACTIONS.COPY: {
      const panelsToCopy = currentPage.panels.filter(p => state.selectedPanelIds.includes(p.id));
      const bubblesToCopy = currentPage.bubbles.filter(b => state.selectedBubbleIds.includes(b.id));
      return { ...state, clipboard: { panels: panelsToCopy, bubbles: bubblesToCopy } };
    }

    case ACTIONS.PASTE: {
      if (!state.clipboard) return state;
      const offset = 20;
      const newPanels = state.clipboard.panels.map(p => ({ ...p, id: generateId(), x: p.x + offset, y: p.y + offset }));
      const newBubbles = state.clipboard.bubbles.map(b => ({ ...b, id: generateId(), x: b.x + offset, y: b.y + offset }));
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, panels: [...p.panels, ...newPanels], bubbles: [...p.bubbles, ...newBubbles] } : p);
      return withHistory({ ...state, pages: newPages, selectedPanelIds: newPanels.map(p => p.id), selectedBubbleIds: newBubbles.map(b => b.id) }, 'Coller');
    }

    // === BRUSHES ===
    case ACTIONS.ADD_BRUSH: {
      const newBrush = { ...action.payload, id: generateId(), builtin: false };
      return { ...state, brushes: [...state.brushes, newBrush] };
    }

    case ACTIONS.DELETE_BRUSH: {
      // Can't delete builtin brushes
      const brushToDelete = state.brushes.find(b => b.id === action.payload);
      if (brushToDelete?.builtin) return state;

      const newBrushes = state.brushes.filter(b => b.id !== action.payload);
      // If deleted brush was active, switch to round
      const newDrawing = state.drawing.brushId === action.payload
        ? { ...state.drawing, brushId: 'round' }
        : state.drawing;
      return { ...state, brushes: newBrushes, drawing: newDrawing };
    }

    case ACTIONS.SET_ACTIVE_BRUSH: {
      return { ...state, drawing: { ...state.drawing, brushId: action.payload } };
    }

    default: return undefined;
  }
};
