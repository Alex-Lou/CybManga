// ============================================
// SumiWire PRO - Raccourcis clavier globaux du header (hook)
// ============================================

import { useEffect } from 'react';
import { ACTIONS } from '../../context/StudioContext';
import { loadKeybindings, matchesBinding } from '../../utils/keybindings';

/**
 * Installe l'écouteur global des raccourcis clavier (personnalisables).
 * Mêmes dépendances que l'effet d'origine : [dispatch, canUndo, canRedo, state].
 */
export const useHeaderShortcuts = ({ state, dispatch, canUndo, canRedo, handleSave, handleNew, fileInputRef }) => {
  useEffect(() => {
    const bindings = loadKeybindings();

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      // Ctrl-based shortcuts
      if (matchesBinding(e, bindings.save)) { e.preventDefault(); handleSave(); return; }
      if (matchesBinding(e, bindings.newProject)) { e.preventDefault(); handleNew(); return; }
      if (matchesBinding(e, bindings.undo)) { e.preventDefault(); if (canUndo) dispatch({ type: ACTIONS.UNDO }); return; }
      if (matchesBinding(e, bindings.redo) || matchesBinding(e, bindings.redoAlt)) { e.preventDefault(); if (canRedo) dispatch({ type: ACTIONS.REDO }); return; }
      if (matchesBinding(e, bindings.open)) { e.preventDefault(); fileInputRef.current?.click(); return; }
      if (matchesBinding(e, bindings.copy)) { e.preventDefault(); dispatch({ type: ACTIONS.COPY }); return; }
      if (matchesBinding(e, bindings.paste)) { e.preventDefault(); dispatch({ type: ACTIONS.PASTE }); return; }
      if (matchesBinding(e, bindings.selectAll)) {
        e.preventDefault();
        const cp = state.pages[state.activePageIndex];
        dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: cp.panels.map(p => p.id), bubbleIds: cp.bubbles.map(b => b.id) } });
        return;
      }
      if (matchesBinding(e, bindings.zoomReset)) { e.preventDefault(); dispatch({ type: ACTIONS.SET_ZOOM, payload: 1 }); return; }
      if (matchesBinding(e, bindings.zoomIn)) { e.preventDefault(); dispatch({ type: ACTIONS.SET_ZOOM, payload: Math.min(state.zoom + 0.1, 5) }); return; }
      if (matchesBinding(e, bindings.zoomOut)) { e.preventDefault(); dispatch({ type: ACTIONS.SET_ZOOM, payload: Math.max(state.zoom - 0.1, 0.1) }); return; }

      // Delete
      if (matchesBinding(e, bindings.delete) || matchesBinding(e, bindings.deleteAlt)) {
        if (state.editingImageId) {
          dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: state.editingImageId, updates: { image: null } } });
          dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
        } else {
          if (state.selectedPanelIds.length > 0) dispatch({ type: ACTIONS.DELETE_PANELS });
          if (state.selectedBubbleIds.length > 0) dispatch({ type: ACTIONS.DELETE_BUBBLES });
        }
        return;
      }

      // Non-ctrl shortcuts
      if (matchesBinding(e, bindings.viewSingle)) { dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'single' }); return; }
      if (matchesBinding(e, bindings.viewSpread)) { dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'spread' }); return; }
      if (matchesBinding(e, bindings.viewAll)) { dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'all' }); return; }
      if (matchesBinding(e, bindings.toggleGuides)) { dispatch({ type: ACTIONS.TOGGLE_GUIDES }); return; }
      if (matchesBinding(e, bindings.toggleGrid)) { dispatch({ type: ACTIONS.TOGGLE_GRID }); return; }
      if (matchesBinding(e, bindings.toggleSnap)) { dispatch({ type: ACTIONS.TOGGLE_SNAP }); return; }
      if (matchesBinding(e, bindings.select)) { dispatch({ type: ACTIONS.SET_TOOL, payload: 'select' }); return; }
      if (matchesBinding(e, bindings.pan)) { dispatch({ type: ACTIONS.SET_TOOL, payload: state.activeTool === 'pan' ? 'select' : 'pan' }); return; }
      if (matchesBinding(e, bindings.draw)) { dispatch({ type: ACTIONS.SET_TOOL, payload: state.activeTool === 'draw' ? 'select' : 'draw' }); return; }
      if (matchesBinding(e, bindings.eraser)) { dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'eraser' } }); dispatch({ type: ACTIONS.SET_TOOL, payload: 'draw' }); return; }
      if (matchesBinding(e, bindings.brush)) { dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'brush' } }); dispatch({ type: ACTIONS.SET_TOOL, payload: 'draw' }); return; }
      if (matchesBinding(e, bindings.brushSize1)) { dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { size: Math.max(1, state.drawing.size - 2) } }); return; }
      if (matchesBinding(e, bindings.brushSize2)) { dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { size: Math.min(100, state.drawing.size + 2) } }); return; }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, canUndo, canRedo, state]);
};
