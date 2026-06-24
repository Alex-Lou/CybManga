// ============================================
// SumiWire PRO - Options conditionnelles par outil de dessin (présentationnel)
// gap fill · speedlines · focuslines · screentone · gradient
// ============================================

import React from 'react';
import { ACTIONS } from '../../context/StudioContext';
import { TOOLBAR } from '../../styles/tailwind';

const DrawingToolOptions = ({ drawing, dispatch, theme, getActiveStyle }) => {
  return (
    <>
      {/* Gap fill slider (visible when fill tool active) */}
      {drawing.tool === 'fill' && (
        <div className={TOOLBAR.group + ' gap-2'}>
          <span className={TOOLBAR.sliderLabel} title="Fermeture de gaps dans l'encrage">Gap:</span>
          <input type="range" min="0" max="10" value={drawing.fillGapSize ?? 0}
            onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { fillGapSize: parseInt(e.target.value) } })}
            className={TOOLBAR.slider} />
          <span className={TOOLBAR.sliderLabel} style={{ minWidth: '18px' }}>{drawing.fillGapSize ?? 0}px</span>
        </div>
      )}

      {/* Speed lines params */}
      {drawing.tool === 'speedlines' && (
        <div className={TOOLBAR.group + ' gap-2'}>
          <span className={TOOLBAR.sliderLabel}>Lignes:</span>
          <input type="range" min="10" max="300" value={drawing.speedlinesCount ?? 80}
            onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { speedlinesCount: parseInt(e.target.value) } })}
            className={TOOLBAR.slider} />
          <span className={TOOLBAR.sliderLabel} style={{ minWidth: '24px' }}>{drawing.speedlinesCount ?? 80}</span>
        </div>
      )}

      {/* Focus lines params */}
      {drawing.tool === 'focuslines' && (
        <div className={TOOLBAR.group + ' gap-2'}>
          <span className={TOOLBAR.sliderLabel}>Lignes:</span>
          <input type="range" min="20" max="300" value={drawing.focuslinesCount ?? 120}
            onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { focuslinesCount: parseInt(e.target.value) } })}
            className={TOOLBAR.slider} />
          <span className={TOOLBAR.sliderLabel} style={{ minWidth: '24px' }}>{drawing.focuslinesCount ?? 120}</span>
        </div>
      )}

      {/* Screentone params */}
      {drawing.tool === 'screentone' && (
        <>
          <div className={TOOLBAR.group + ' gap-2'}>
            <span className={TOOLBAR.sliderLabel}>LPI:</span>
            <input type="range" min="20" max="85" value={drawing.screentoneLPI ?? 55}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { screentoneLPI: parseInt(e.target.value) } })}
              className={TOOLBAR.slider} />
            <span className={TOOLBAR.sliderLabel} style={{ minWidth: '24px' }}>{drawing.screentoneLPI ?? 55}</span>
          </div>
          <div className={TOOLBAR.group + ' gap-2'}>
            <span className={TOOLBAR.sliderLabel}>Densité:</span>
            <input type="range" min="5" max="80" value={drawing.screentoneDensity ?? 30}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { screentoneDensity: parseInt(e.target.value) } })}
              className={TOOLBAR.slider} />
            <span className={TOOLBAR.sliderLabel} style={{ minWidth: '24px' }}>{drawing.screentoneDensity ?? 30}%</span>
          </div>
        </>
      )}

      {/* Gradient controls */}
      {drawing.tool === 'gradient' && (
        <div className={TOOLBAR.group + ' gap-2'}>
          <button className={TOOLBAR.button} style={getActiveStyle(drawing.gradientType === 'linear')}
            onClick={() => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { gradientType: 'linear' } })}
            title="Linéaire">━</button>
          <button className={TOOLBAR.button} style={getActiveStyle(drawing.gradientType === 'radial')}
            onClick={() => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { gradientType: 'radial' } })}
            title="Radial">◎</button>

          <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

          {/* Color A (current) → Color B selector */}
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded border" style={{ backgroundColor: drawing.color, borderColor: theme.border }} title="Couleur A (début)" />
            <span className="text-xs opacity-50">→</span>
            <div className="relative">
              <input type="color"
                value={drawing.gradientSecondColor || '#ffffff'}
                onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { gradientSecondColor: e.target.value } })}
                className="w-6 h-6 rounded border cursor-pointer"
                style={{ borderColor: theme.border }}
                title="Couleur B (fin)"
              />
            </div>
            <button className="text-xs px-1 rounded transition-all hover:opacity-80"
              style={{ color: theme.textSecondary, border: `1px solid ${theme.border}` }}
              onClick={() => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { gradientSecondColor: null } })}
              title="Couleur B → Transparent">
              ∅
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DrawingToolOptions;
