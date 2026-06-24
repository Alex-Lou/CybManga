// ============================================
// SumiWire PRO - Sous-réducteur : dessin (strokes) & calques
// ============================================

import { ACTIONS } from '../actions';
import { DEFAULT_LAYER } from '../../../utils/constants';
import { generateId, deepClone } from '../../../utils/helpers';

export const layersReducer = (state, action, { currentPage, withHistory }) => {
  switch (action.type) {
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

    default: return undefined;
  }
};
