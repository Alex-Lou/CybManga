// ============================================
// SumiWire PRO - Helper d'historique partagé entre sous-réducteurs
// ============================================

import { addToHistory } from '../state';

/**
 * Construit le helper d'historique lié à l'action courante.
 * Retourne (newState, label) => état enrichi de l'historique,
 * sauf si action.payload.skipHistory est vrai.
 */
export const makeWithHistory = (action) => (newState, label) => {
  if (action.payload?.skipHistory) {
    return newState;
  }
  return {
    ...newState,
    ...addToHistory(newState, newState.pages, newState.activePageIndex, label),
  };
};
