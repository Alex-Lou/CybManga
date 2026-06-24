// ============================================
// SumiWire PRO - Sous-réducteur : pages
// ============================================

import { ACTIONS } from '../actions';
import { createInitialPage } from '../state';
import { generateId, deepClone } from '../../../utils/helpers';

export const pagesReducer = (state, action, { currentPage, withHistory }) => {
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

    default: return undefined;
  }
};
