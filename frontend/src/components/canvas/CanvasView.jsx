// ============================================
// SumiWire PRO - Modes de vue du canvas (single / spread / all)
// ============================================

import React from 'react';
import { CANVAS } from '../../styles/tailwind';
import { PAGE_FORMATS } from '../../utils/constants';
import CanvasPage from './CanvasPage';

// Page « en regard » vide (quand il n'y a pas de page suivante) : rend la vue
// double page lisible comme un livre ouvert, même avec une seule page.
const BlankFacingPage = ({ format, theme }) => (
  <div
    className="flex items-center justify-center"
    style={{
      width: format.width,
      height: format.height,
      backgroundColor: theme.page,
      opacity: 0.4,
      border: `2px dashed ${theme.border}`,
      borderRadius: 2,
    }}
  >
    <span
      className="uppercase tracking-widest font-medium"
      style={{ fontSize: 34, color: theme.textMuted }}
    >
      Page suivante
    </span>
  </div>
);

const CanvasView = ({
  state, currentPage, theme, safeMargin, bleedMargin,
  isSpacePressed, draggingPageIndex, dragPreviewPos,
  onPageDragStart, onCanvasClick, dispatch,
}) => {
  // Props forwardées à chaque page rendue.
  const pageProps = {
    state, theme, safeMargin, bleedMargin,
    isSpacePressed, draggingPageIndex, onPageDragStart, onCanvasClick, dispatch,
  };

  switch (state.viewMode) {
    case 'single': {
      // Add padding around the page to allow scrolling
      const singleFormat = PAGE_FORMATS[currentPage?.format || 'a4'];
      return (
        <div
          className={CANVAS.singleView}
          style={{
            minWidth: singleFormat.width + 200,
            minHeight: singleFormat.height + 200,
            padding: '100px',
          }}
        >
          <CanvasPage page={currentPage} pageIndex={state.activePageIndex} {...pageProps} />
        </div>
      );
    }

    case 'spread': {
      const nextIndex = state.activePageIndex + 1;
      const nextPage = state.pages[nextIndex];
      const spreadFormat = PAGE_FORMATS[currentPage?.format || 'a4'];
      return (
        <div
          className={CANVAS.spreadView}
          style={{
            minWidth: spreadFormat.width * 2 + 240,
            minHeight: spreadFormat.height + 200,
            padding: '100px',
          }}
        >
          <CanvasPage page={currentPage} pageIndex={state.activePageIndex} {...pageProps} />
          {nextPage
            ? <CanvasPage page={nextPage} pageIndex={nextIndex} {...pageProps} />
            : <BlankFacingPage format={spreadFormat} theme={theme} />}
        </div>
      );
    }

    case 'all': {
      // Calculate grid layout constants
      const gridColumns = 3;
      const gridGap = 40;

      // Calculate dynamic canvas size based on pages
      const allFormat = PAGE_FORMATS[state.pages[0]?.format || 'a4'];
      const numRows = Math.ceil(state.pages.length / gridColumns);
      const canvasWidth = Math.max(
        1200,
        gridColumns * (allFormat.width * 0.5 + gridGap) + 200
      );
      const canvasHeight = Math.max(
        800,
        numRows * (allFormat.height * 0.5 + gridGap) + 200
      );

      return (
        <div
          className={CANVAS.allView}
          style={{
            position: 'relative',
            minWidth: canvasWidth,
            minHeight: canvasHeight,
            padding: '50px',
          }}
        >
          {state.pages.map((page, index) => {
            const format = PAGE_FORMATS[page.format];

            // Use stored position or calculate default grid position
            // Position is stored in "unscaled" coordinates (before the 0.5 scale)
            const defaultPosition = {
              x: (index % gridColumns) * (format.width + gridGap * 2),
              y: Math.floor(index / gridColumns) * (format.height + gridGap * 2),
            };

            const position = page.position || defaultPosition;

            // If currently dragging this page, use preview position
            const displayPos = (draggingPageIndex === index && dragPreviewPos)
              ? dragPreviewPos
              : position;

            return (
              <div
                key={page.id}
                style={{
                  position: 'absolute',
                  left: displayPos.x,
                  top: displayPos.y,
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left',
                  transition: draggingPageIndex === index ? 'none' : 'left 0.15s ease-out, top 0.15s ease-out',
                  zIndex: draggingPageIndex === index ? 100 : 1,
                }}
              >
                <CanvasPage page={page} pageIndex={index} extraStyle={{}} isDraggable {...pageProps} />
              </div>
            );
          })}
        </div>
      );
    }

    default:
      return <CanvasPage page={currentPage} pageIndex={state.activePageIndex} {...pageProps} />;
  }
};

export default CanvasView;
