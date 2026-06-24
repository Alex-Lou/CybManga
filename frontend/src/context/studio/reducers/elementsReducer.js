// ============================================
// SumiWire PRO - Sous-réducteur : cases (panels), bulles, sélection
// ============================================

import { ACTIONS } from '../actions';
import { DEFAULT_PANEL, DEFAULT_BUBBLE } from '../../../utils/constants';
import { generateId } from '../../../utils/helpers';

export const elementsReducer = (state, action, { withHistory }) => {
  switch (action.type) {
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

    default: return undefined;
  }
};
