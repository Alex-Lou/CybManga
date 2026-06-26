// ============================================
// SumiWire PRO - Main Canvas
// Custom Cursor & Theme Adaptation
// FREE PAGE DRAG & DROP in "all" view mode
// ============================================

import React, { useRef } from 'react';
import { useStudio } from '../../context/StudioContext';
import { CANVAS } from '../../styles/tailwind';
import { MM_TO_PX, SAFE_MARGIN_MM, BLEED_MARGIN_MM } from '../../utils/constants';
import { getSelectionCursor } from './cursors';
import { useCanvasInteraction } from './useCanvasInteraction';
import CanvasView from './CanvasView';

const Canvas = () => {
  const { state, dispatch, currentPage, theme } = useStudio();
  const canvasInnerRef = useRef(null);

  const {
    containerRef,
    isPanning,
    isSpacePressed,
    draggingPageIndex,
    dragPreviewPos,
    handleCanvasClick,
    handleMouseDown,
    handlePageDragStart,
    handleCanvasDragOver,
    handleCanvasDrop,
  } = useCanvasInteraction({ state, dispatch, currentPage });

  const safeMargin = SAFE_MARGIN_MM * MM_TO_PX;
  const bleedMargin = BLEED_MARGIN_MM * MM_TO_PX;

  // --- CURSOR LOGIC (DYNAMIQUE) ---
  let cursorStyle = 'default';

  if (state.activeTool === 'select') {
    cursorStyle = getSelectionCursor(state.isDarkMode);
  }

  if (state.activeTool === 'draw') {
    cursorStyle = 'none';
  }

  if (state.activeTool === 'pan' || isSpacePressed) {
    cursorStyle = isPanning ? 'grabbing' : 'grab';
  }

  // In "all" view mode with select tool, show move cursor
  if (state.viewMode === 'all' && state.activeTool === 'select' && !isSpacePressed) {
    cursorStyle = 'default';
  }

  if (draggingPageIndex !== null) {
    cursorStyle = 'grabbing';
  }

  // En mode pan (outil main / espace / pan en cours) on coupe le scroll natif tactile
  // pour que le pointer-pan prenne la main au doigt et au stylet. Sinon on laisse le
  // scroll natif assurer le déplacement à un doigt sur les zones vides.
  const isPanMode = state.activeTool === 'pan' || isSpacePressed || isPanning;

  return (
    <div
      ref={containerRef}
      className={`${CANVAS.container} canvas-scrollbar${state.isDarkMode ? ' cyber-grid' : ''}`}
      style={{
        backgroundColor: theme.canvas,
        cursor: cursorStyle,
        touchAction: isPanMode ? 'none' : 'auto',
      }}
      tabIndex={0}
      onClick={handleCanvasClick}
      onPointerDown={handleMouseDown}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <div
        className={CANVAS.wrapper}
        style={{
          transform: `translate(${state.panOffset.x}px, ${state.panOffset.y}px)`,
        }}
      >
        <div
          ref={canvasInnerRef}
          id="canvas-export-area"
          className={CANVAS.inner + ' canvas-background'}
          style={{
            transform: `scale(${state.zoom})${state.flipH ? ' scaleX(-1)' : ''}${state.canvasRotation ? ` rotate(${state.canvasRotation}deg)` : ''}`,
            transformOrigin: '0 0',
          }}
        >
          <CanvasView
            state={state}
            currentPage={currentPage}
            theme={theme}
            safeMargin={safeMargin}
            bleedMargin={bleedMargin}
            isSpacePressed={isSpacePressed}
            draggingPageIndex={draggingPageIndex}
            dragPreviewPos={dragPreviewPos}
            onPageDragStart={handlePageDragStart}
            onCanvasClick={handleCanvasClick}
            dispatch={dispatch}
          />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
