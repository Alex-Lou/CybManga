// ============================================
// SumiWire PRO - Professional Drawing Engine
// Multi-canvas (baked + active + cursor overlay)
// La logique du moteur vit dans le hook useDrawingPointer.
// ============================================

import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { useDrawingPointer } from './useDrawingPointer';

const DrawingCanvas = ({ pageWidth, pageHeight }) => {
  const { state, dispatch, currentPage } = useStudio();

  const {
    bakedRef, activeRef,
    handlePointerDown, handlePointerMove, handlePointerUp, handleCursorMove,
    cursorPos, setCursorPos,
    isDrawMode, size, currentBrush, isEraser, color,
  } = useDrawingPointer({ state, dispatch, currentPage, pageWidth, pageHeight });

  return (
    <div style={{ position: 'relative', width: pageWidth, height: pageHeight }}
      onPointerMove={handleCursorMove}
      onPointerLeave={() => setCursorPos(prev => ({ ...prev, visible: false }))}
      onPointerEnter={() => isDrawMode && setCursorPos(prev => ({ ...prev, visible: true }))}
    >
      {/* Layer 1: Baked strokes (finished) */}
      <canvas ref={bakedRef} width={pageWidth} height={pageHeight}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 49, pointerEvents: 'none' }} />

      {/* Layer 2: Active stroke */}
      <canvas ref={activeRef} width={pageWidth} height={pageHeight}
        style={{
          position: 'absolute', top: 0, left: 0, zIndex: 50,
          pointerEvents: isDrawMode ? 'auto' : 'none',
          cursor: 'none', touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={(e) => { handlePointerMove(e); handleCursorMove(e); }}
        onPointerUp={handlePointerUp}
      />

      {/* Layer 3: Custom cursor — visible on any background */}
      {isDrawMode && cursorPos.visible && (
        <div style={{
          position: 'absolute',
          left: cursorPos.x, top: cursorPos.y,
          width: Math.max(size, 4), height: Math.max(size, 4),
          borderRadius: currentBrush.shape === 'square' ? '0' : '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none', zIndex: 52,
          // Double border for visibility on ANY background
          border: '1.5px solid rgba(0, 247, 255, 0.8)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 0 6px rgba(0, 247, 255, 0.4)',
          backgroundColor: isEraser ? 'rgba(255,255,255,0.15)' : `${color}33`,
        }} />
      )}

      {/* Symmetry axis guides */}
      {isDrawMode && state.drawing.symmetryMode && state.drawing.symmetryMode !== 'off' && (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: pageWidth, height: pageHeight, pointerEvents: 'none', zIndex: 51 }}>
          {(state.drawing.symmetryMode === 'vertical' || state.drawing.symmetryMode === 'both') && (
            <line x1={pageWidth / 2} y1={0} x2={pageWidth / 2} y2={pageHeight}
              stroke="#00f7ff" strokeWidth="1" strokeDasharray="8,6" opacity="0.5" />
          )}
          {(state.drawing.symmetryMode === 'horizontal' || state.drawing.symmetryMode === 'both') && (
            <line x1={0} y1={pageHeight / 2} x2={pageWidth} y2={pageHeight / 2}
              stroke="#ff00ea" strokeWidth="1" strokeDasharray="8,6" opacity="0.5" />
          )}
        </svg>
      )}
    </div>
  );
};

export default DrawingCanvas;
