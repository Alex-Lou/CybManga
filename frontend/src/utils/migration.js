// ============================================
// SumiWire PRO — Document Migration
// Converts old drawings[] format to layers[] format
// Backward compatible: old docs auto-migrate on load
// ============================================

import { generateId } from './helpers';
import { DEFAULT_LAYER } from './constants';

/**
 * Create default layers for a new page.
 */
export function createDefaultLayers() {
  return [
    { ...DEFAULT_LAYER, id: generateId(), name: 'Background', blendMode: 'source-over' },
    { ...DEFAULT_LAYER, id: generateId(), name: 'Ink', blendMode: 'source-over' },
    { ...DEFAULT_LAYER, id: generateId(), name: 'Color', blendMode: 'multiply' },
  ];
}

/**
 * Migrate a page from old drawings[] format to layers[] format.
 * If page already has layers[], returns it unchanged (with defaults merged).
 * @param {object} page - Page object from state
 * @returns {object} Migrated page with layers[]
 */
export function migratePageToLayers(page) {
  // Already migrated: merge defaults into each existing layer
  if (page.layers && page.layers.length > 0) {
    return {
      ...page,
      layers: page.layers.map(layer => ({ ...DEFAULT_LAYER, ...layer })),
      activeLayerId: page.activeLayerId || page.layers[0]?.id,
    };
  }

  // Old format: page.drawings[] exists, no layers[]
  const inkLayerId = generateId();
  const inkLayer = {
    ...DEFAULT_LAYER,
    id: inkLayerId,
    name: 'Ink',
    strokes: page.drawings || [],
  };

  return {
    ...page,
    layers: [
      { ...DEFAULT_LAYER, id: generateId(), name: 'Background' },
      inkLayer,
      { ...DEFAULT_LAYER, id: generateId(), name: 'Color', blendMode: 'multiply' },
    ],
    activeLayerId: inkLayerId,
    drawings: undefined, // remove old field
  };
}
