// ============================================
// SumiWire PRO - Reducer
// ============================================

import { ACTIONS } from './actions';
import { createInitialPage, addToHistory, defaultState, getInitialState } from './state';
import { generateId, deepClone } from '../../utils/helpers';
import { PAGE_FORMATS, LAYOUT_TEMPLATES, DEFAULT_PANEL, DEFAULT_BUBBLE, DEFAULT_LAYER } from '../../utils/constants';
import { createDefaultLayers } from '../../utils/migration';

export const reducer = (state, action) => {
  const currentPage = state.pages[state.activePageIndex];

  // Helper pour gérer l'historique automatiquement
  const withHistory = (newState, label) => {
    if (action.payload?.skipHistory) {
      return newState;
    }
    return {
      ...newState,
      ...addToHistory(newState, newState.pages, newState.activePageIndex, label)
    };
  };

  switch (action.type) {
    // === PAGES ===
    case ACTIONS.ADD_PAGE: {
      const newPage = createInitialPage(action.payload?.format || currentPage?.format || 'a4');
      const newPages = [...state.pages, newPage];
      return withHistory({ ...state, pages: newPages, activePageIndex: newPages.length - 1 }, 'Ajouter page');
    }

    case ACTIONS.DELETE_PAGE: {
      if (state.pages.length <= 1) return state;
      const newPages = state.pages.filter((_, i) => i !== action.payload);
      const newIndex = Math.min(state.activePageIndex, newPages.length - 1);
      return withHistory({ ...state, pages: newPages, activePageIndex: newIndex, selectedPanelIds: [], selectedBubbleIds: [], editingImageId: null }, 'Supprimer page');
    }

    case ACTIONS.DUPLICATE_PAGE: {
      const pageToDupe = state.pages[action.payload];
      const dupLayers = (pageToDupe.layers || []).map(l => ({
        ...deepClone(l),
        id: generateId(),
        strokes: (l.strokes || []).map(s => ({ ...s, id: generateId() })),
      }));
      const newPage = {
        ...deepClone(pageToDupe),
        id: generateId(),
        panels: pageToDupe.panels.map(p => ({ ...p, id: generateId() })),
        bubbles: pageToDupe.bubbles.map(b => ({ ...b, id: generateId() })),
        layers: dupLayers,
        activeLayerId: dupLayers[1]?.id || dupLayers[0]?.id,
        position: null,
      };
      const newPages = [...state.pages];
      newPages.splice(action.payload + 1, 0, newPage);
      return withHistory({ ...state, pages: newPages, activePageIndex: action.payload + 1 }, 'Dupliquer page');
    }

    case ACTIONS.SET_ACTIVE_PAGE:
      return { ...state, activePageIndex: action.payload, selectedPanelIds: [], selectedBubbleIds: [], editingImageId: null };

    case ACTIONS.SET_PAGE_FORMAT: {
      const { pageIndex, format } = action.payload;
      const newPages = state.pages.map((p, i) => i === pageIndex ? { ...p, format } : p);
      return withHistory({ ...state, pages: newPages }, 'Changer format page');
    }

    case ACTIONS.REORDER_PAGES: {
      const { fromIndex, toIndex } = action.payload;
      const newPages = [...state.pages];
      const [moved] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, moved);
      return withHistory({ ...state, pages: newPages, activePageIndex: toIndex }, 'Réorganiser pages');
    }

    case ACTIONS.SET_PAGE_POSITION: {
      const { pageIndex, position } = action.payload;
      
      const newPages = state.pages.map((page, index) => {
        if (index === pageIndex) {
          return {
            ...page,
            position: {
              x: Math.round(position.x),
              y: Math.round(position.y),
            },
          };
        }
        return page;
      });
      
      // On ne met pas dans l'historique pour éviter de polluer avec chaque déplacement
      return { ...state, pages: newPages };
    }

    // === PANELS (CASES) ===
    case ACTIONS.ADD_PANEL: {
      const newPanel = { ...DEFAULT_PANEL, ...action.payload, id: generateId() };
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, panels: [...p.panels, newPanel] } : p);
      return withHistory({ ...state, pages: newPages, selectedPanelIds: [newPanel.id], selectedBubbleIds: [], editingImageId: null }, 'Ajouter case');
    }

    case ACTIONS.UPDATE_PANEL: {
      const { id, updates } = action.payload;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, panels: p.panels.map(panel => panel.id === id ? { ...panel, ...updates } : panel) } : p);
      return withHistory({ ...state, pages: newPages }, 'Modifier case');
    }

    case ACTIONS.DELETE_PANELS: {
      const idsToDelete = action.payload || state.selectedPanelIds;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, panels: p.panels.filter(panel => !idsToDelete.includes(panel.id)) } : p);
      return withHistory({ ...state, pages: newPages, selectedPanelIds: [], editingImageId: null }, 'Supprimer case(s)');
    }

    // === BUBBLES (BULLES) ===
    case ACTIONS.ADD_BUBBLE: {
      const newBubble = { ...DEFAULT_BUBBLE, ...action.payload, id: generateId() };
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, bubbles: [...p.bubbles, newBubble] } : p);
      return withHistory({ ...state, pages: newPages, selectedPanelIds: [], selectedBubbleIds: [newBubble.id], editingImageId: null }, 'Ajouter bulle');
    }

    case ACTIONS.UPDATE_BUBBLE: {
      const { id, updates } = action.payload;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, bubbles: p.bubbles.map(bubble => bubble.id === id ? { ...bubble, ...updates } : bubble) } : p);
      return withHistory({ ...state, pages: newPages }, 'Modifier bulle');
    }

    case ACTIONS.DELETE_BUBBLES: {
      const idsToDelete = action.payload || state.selectedBubbleIds;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, bubbles: p.bubbles.filter(bubble => !idsToDelete.includes(bubble.id)) } : p);
      return withHistory({ ...state, pages: newPages, selectedBubbleIds: [] }, 'Supprimer bulle(s)');
    }

    // === DRAWING (DESSIN) — targets active layer ===
    case ACTIONS.ADD_STROKE: {
      const stroke = { id: generateId(), ...action.payload };
      const newPages = state.pages.map((p, i) => {
        if (i !== state.activePageIndex) return p;
        const activeLayerId = p.activeLayerId;
        const layers = (p.layers || []).map(layer => {
          if (layer.id !== activeLayerId) return layer;
          if (layer.locked) return layer; // locked = no-op
          return { ...layer, strokes: [...layer.strokes, stroke] };
        });
        return { ...p, layers };
      });
      return withHistory({ ...state, pages: newPages }, 'Dessiner trait');
    }

    case ACTIONS.DELETE_STROKE: {
      const newPages = state.pages.map((p, i) => {
        if (i !== state.activePageIndex) return p;
        const layers = (p.layers || []).map(layer => ({
          ...layer,
          strokes: layer.strokes.filter(d => d.id !== action.payload),
        }));
        return { ...p, layers };
      });
      return withHistory({ ...state, pages: newPages }, 'Effacer trait');
    }

    case ACTIONS.CLEAR_DRAWINGS:
    case ACTIONS.CLEAR_LAYER_STROKES: {
      const newPages = state.pages.map((p, i) => {
        if (i !== state.activePageIndex) return p;
        const activeLayerId = p.activeLayerId;
        const layers = (p.layers || []).map(layer =>
          layer.id === activeLayerId ? { ...layer, strokes: [] } : layer
        );
        return { ...p, layers };
      });
      return withHistory({ ...state, pages: newPages }, 'Effacer calque');
    }

    // === LAYERS ===
    case ACTIONS.ADD_LAYER: {
      const newLayer = { ...DEFAULT_LAYER, id: generateId(), name: action.payload?.name || `Calque ${(currentPage.layers || []).length + 1}` };
      const insertIdx = action.payload?.insertIndex ?? (currentPage.layers || []).length;
      const newLayers = [...(currentPage.layers || [])];
      newLayers.splice(insertIdx, 0, newLayer);
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, layers: newLayers, activeLayerId: newLayer.id } : p);
      return withHistory({ ...state, pages: newPages }, 'Ajouter calque');
    }

    case ACTIONS.DELETE_LAYER: {
      const layers = currentPage.layers || [];
      if (layers.length <= 1) return state; // invariant: min 1 layer
      const idx = layers.findIndex(l => l.id === action.payload);
      if (idx === -1) return state;
      const newLayers = layers.filter(l => l.id !== action.payload);
      // Fix clipping: if deleted layer was base of clipping group
      if (idx < newLayers.length && newLayers[idx]?.clippingMask) {
        newLayers[idx] = { ...newLayers[idx], clippingMask: false };
      }
      // New active: prefer layer above, else below
      let newActiveId = currentPage.activeLayerId;
      if (newActiveId === action.payload) {
        newActiveId = newLayers[Math.min(idx, newLayers.length - 1)]?.id;
      }
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, layers: newLayers, activeLayerId: newActiveId } : p);
      return withHistory({ ...state, pages: newPages }, 'Supprimer calque');
    }

    case ACTIONS.RENAME_LAYER: {
      const { layerId, name } = action.payload;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex
        ? { ...p, layers: (p.layers || []).map(l => l.id === layerId ? { ...l, name } : l) }
        : p);
      return { ...state, pages: newPages }; // no history (view state)
    }

    case ACTIONS.DUPLICATE_LAYER: {
      const layers = currentPage.layers || [];
      const idx = layers.findIndex(l => l.id === action.payload);
      if (idx === -1) return state;
      const src = layers[idx];
      const dup = {
        ...deepClone(src),
        id: generateId(),
        name: `${src.name} (copie)`,
        strokes: src.strokes.map(s => ({ ...s, id: generateId() })),
      };
      const newLayers = [...layers];
      newLayers.splice(idx + 1, 0, dup);
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, layers: newLayers, activeLayerId: dup.id } : p);
      return withHistory({ ...state, pages: newPages }, 'Dupliquer calque');
    }

    case ACTIONS.REORDER_LAYERS: {
      const { fromIndex, toIndex } = action.payload;
      const newLayers = [...(currentPage.layers || [])];
      const [moved] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, moved);
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, layers: newLayers } : p);
      return withHistory({ ...state, pages: newPages }, 'Réorganiser calques');
    }

    case ACTIONS.SET_ACTIVE_LAYER: {
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, activeLayerId: action.payload } : p);
      return { ...state, pages: newPages }; // no history
    }

    case ACTIONS.TOGGLE_LAYER_VISIBILITY: {
      const newPages = state.pages.map((p, i) => i === state.activePageIndex
        ? { ...p, layers: (p.layers || []).map(l => l.id === action.payload ? { ...l, visible: !l.visible } : l) }
        : p);
      return { ...state, pages: newPages }; // no history
    }

    case ACTIONS.TOGGLE_LAYER_LOCK: {
      const newPages = state.pages.map((p, i) => i === state.activePageIndex
        ? { ...p, layers: (p.layers || []).map(l => l.id === action.payload ? { ...l, locked: !l.locked } : l) }
        : p);
      return { ...state, pages: newPages }; // no history
    }

    case ACTIONS.SET_LAYER_OPACITY: {
      const { layerId, opacity } = action.payload;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex
        ? { ...p, layers: (p.layers || []).map(l => l.id === layerId ? { ...l, opacity } : l) }
        : p);
      return withHistory({ ...state, pages: newPages }, 'Opacité calque');
    }

    case ACTIONS.SET_LAYER_BLEND_MODE: {
      const { layerId, blendMode } = action.payload;
      const newPages = state.pages.map((p, i) => i === state.activePageIndex
        ? { ...p, layers: (p.layers || []).map(l => l.id === layerId ? { ...l, blendMode } : l) }
        : p);
      return withHistory({ ...state, pages: newPages }, 'Blend mode calque');
    }

    case ACTIONS.TOGGLE_CLIPPING_MASK: {
      const layers = currentPage.layers || [];
      const idx = layers.findIndex(l => l.id === action.payload);
      if (idx <= 0) return state; // can't clip bottom layer
      const newLayers = layers.map((l, i) => i === idx ? { ...l, clippingMask: !l.clippingMask } : l);
      const newPages = state.pages.map((p, i) => i === state.activePageIndex ? { ...p, layers: newLayers } : p);
      return withHistory({ ...state, pages: newPages }, 'Clipping mask');
    }

    // === SELECTION ===
    case ACTIONS.SET_SELECTION:
      return { ...state, selectedPanelIds: action.payload.panelIds || [], selectedBubbleIds: action.payload.bubbleIds || [], editingImageId: null };

    case ACTIONS.ADD_TO_SELECTION:
      return {
        ...state,
        selectedPanelIds: action.payload.panelId ? [...state.selectedPanelIds, action.payload.panelId] : state.selectedPanelIds,
        selectedBubbleIds: action.payload.bubbleId ? [...state.selectedBubbleIds, action.payload.bubbleId] : state.selectedBubbleIds,
        editingImageId: null,
      };

    case ACTIONS.CLEAR_SELECTION:
      return { ...state, selectedPanelIds: [], selectedBubbleIds: [], editingImageId: null };

    case ACTIONS.SET_EDITING_IMAGE:
      return { ...state, editingImageId: action.payload };

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

    default: return state;
  }
};