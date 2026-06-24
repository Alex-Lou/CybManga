// ============================================
// SumiWire PRO - Reducer (racine)
// Délègue à des sous-réducteurs par domaine. Le premier qui gère l'action
// gagne ; si aucun ne la gère (tous renvoient undefined), l'état est inchangé.
// ============================================

import { makeWithHistory } from './reducers/withHistory';
import { pagesReducer } from './reducers/pagesReducer';
import { elementsReducer } from './reducers/elementsReducer';
import { layersReducer } from './reducers/layersReducer';
import { projectReducer } from './reducers/projectReducer';

const SUB_REDUCERS = [pagesReducer, elementsReducer, layersReducer, projectReducer];

export const reducer = (state, action) => {
  const ctx = {
    currentPage: state.pages[state.activePageIndex],
    withHistory: makeWithHistory(action),
  };

  for (const sub of SUB_REDUCERS) {
    const next = sub(state, action, ctx);
    if (next !== undefined) return next;
  }

  return state;
};
