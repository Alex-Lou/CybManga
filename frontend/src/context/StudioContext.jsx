// ============================================
// SumiWire PRO - Global State Context
// ============================================

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { ACTIONS } from './studio/actions';
import { reducer } from './studio/reducer';
import { getInitialState } from './studio/state';
import { PAGE_FORMATS, THEME_COLORS } from '../utils/constants';
import { saveToStorage } from '../utils/helpers';
import { autosaveProject, serializeState } from '../utils/api';

// === Context ===
const StudioContext = createContext(null);

export const StudioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  const stateRef = useRef(state);
  const projectIdRef = useRef(state.projectId || null);
  const savingRef = useRef(false);
  stateRef.current = state;
  projectIdRef.current = state.projectId || null;

  // Backend auto-save function
  const doBackendSave = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;

    const currentState = stateRef.current;

    try {
      const stateJson = serializeState(currentState);
      const result = await autosaveProject(
        projectIdRef.current,
        currentState.projectName || 'Sans titre',
        stateJson
      );

      // If this was a first save (no ID yet), store the returned ID
      if (result?.id && !projectIdRef.current) {
        projectIdRef.current = result.id;
        dispatch({ type: ACTIONS.SET_PROJECT_ID, payload: result.id });
      }
    } catch (err) {
      console.warn('Backend auto-save failed, falling back to localStorage:', err.message);
      // Fallback: save to localStorage
      saveToStorage(currentState);
    } finally {
      savingRef.current = false;
    }
  }, [dispatch]);

  // Auto-save effect - saves to backend every 30s, localStorage as fallback
  useEffect(() => {
    const saveInterval = setInterval(() => {
      doBackendSave();
    }, 30000);

    const handleBeforeUnload = () => {
      // Sync save to localStorage on unload (backend call may not complete)
      saveToStorage(stateRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save on unmount
      saveToStorage(stateRef.current);
    };
  }, [doBackendSave]);

  // Computed values
  const currentPage = state.pages[state.activePageIndex];
  const pageFormat = PAGE_FORMATS[currentPage?.format || 'a4'];
  const theme = state.isDarkMode ? THEME_COLORS.dark : THEME_COLORS.light;
  const activeLayer = (currentPage?.layers || []).find(l => l.id === currentPage?.activeLayerId) || (currentPage?.layers || [])[0] || null;

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const value = {
    state,
    dispatch,
    currentPage,
    activeLayer,
    pageFormat,
    theme,
    canUndo,
    canRedo,
    ACTIONS,
    doBackendSave,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within StudioProvider');
  }
  return context;
};

export { ACTIONS };
