// ============================================
// SumiWire PRO - Contrôles de droite de la toolbar (flip, vue, zoom)
// ============================================

import React from 'react';
import { ACTIONS } from '../../context/StudioContext';
import { TOOLBAR } from '../../styles/tailwind';

const ToolbarViewControls = ({
  state, dispatch, theme, getActiveStyle,
  zoomInput, setZoomInput, onZoomCommit, onZoomKeyDown,
  onToggleRefPanel, showRefPanel,
}) => (
  <>
    {/* Canvas flip button */}
    <div className={TOOLBAR.group}>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.TOGGLE_FLIP_H })}
        title="Miroir horizontal" style={getActiveStyle(state.flipH)}>
        ↔️
      </button>
    </div>

    <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

    {/* View options */}
    <div className={TOOLBAR.group}>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.TOGGLE_GRID })}
        title="Grille (G)" style={getActiveStyle(state.showGrid)}>▦</button>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.TOGGLE_GUIDES })}
        title="Guides" style={getActiveStyle(state.showGuides)}>⛶</button>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.TOGGLE_SNAP })}
        title="Magnétisme (S)" style={getActiveStyle(state.snapToGrid)}>🧲</button>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.TOGGLE_READING_ORDER })}
        title="Ordre de lecture" style={getActiveStyle(state.showReadingOrder)}>📖</button>
      <button className={TOOLBAR.button} onClick={onToggleRefPanel}
        title="Images de référence" style={getActiveStyle(showRefPanel)}>🖼️</button>
    </div>

    <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

    {/* Zoom controls */}
    <div className={TOOLBAR.group}>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.SET_ZOOM, payload: Math.max(state.zoom - 0.1, 0.1) })} title="Zoom -">🔍-</button>
      <div className="flex items-center relative">
        <input type="number" value={zoomInput} onChange={(e) => setZoomInput(e.target.value)}
          onBlur={onZoomCommit} onKeyDown={onZoomKeyDown}
          className="w-12 text-center text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-current rounded appearance-none m-0 p-0"
          style={{ color: theme.text }} />
        <span className="text-sm pointer-events-none">%</span>
      </div>
      <button className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.SET_ZOOM, payload: Math.min(state.zoom + 0.1, 5) })} title="Zoom +">🔍+</button>
      <button className={TOOLBAR.button} onClick={() => { dispatch({ type: ACTIONS.SET_ZOOM, payload: 1 }); dispatch({ type: ACTIONS.SET_PAN, payload: { x: 0, y: 0 } }); }}
        title="Zoom 100% (Ctrl+0)" style={{ fontSize: '10px', padding: '2px 4px' }}>1:1</button>
    </div>
  </>
);

export default ToolbarViewControls;
