// ============================================
// SumiWire PRO - Rendu d'une page du canvas (présentationnel)
// ============================================

import React from 'react';
import { ACTIONS } from '../../context/StudioContext';
import { CANVAS, cn } from '../../styles/tailwind';
import { PAGE_FORMATS } from '../../utils/constants';
import Panel from '../panels/Panel';
import Bubble from '../bubbles/bubble/Bubble';
import DrawingCanvas from '../drawing/DrawingCanvas';

const CanvasPage = ({
  page, pageIndex, extraStyle = {}, isDraggable = false,
  state, theme, safeMargin, bleedMargin, isSpacePressed, draggingPageIndex,
  onPageDragStart, onCanvasClick, dispatch,
}) => {
  const format = PAGE_FORMATS[page.format];
  const isActive = pageIndex === state.activePageIndex;
  const isDragging = draggingPageIndex === pageIndex;

  return (
    <div
      key={page.id}
      className={cn(
        CANVAS.page,
        isActive && 'ring-2',
        isDraggable && 'cursor-move',
        isDragging && 'opacity-50'
      )}
      style={{
        width: format.width,
        height: format.height,
        backgroundColor: theme.page,
        position: 'relative',
        // En vue « all » la page est déplaçable : touch-action none pour la traîner au doigt/stylet.
        ...(isDraggable ? { touchAction: 'none' } : {}),
        ...(isActive ? { boxShadow: `0 0 0 2px ${theme.primary}, 0 0 15px ${theme.glow || 'rgba(0,247,255,0.2)'}` } : {}),
        ...extraStyle,
      }}
      onPointerDown={(e) => {
        if (isDraggable && e.button === 0 && !isSpacePressed && state.activeTool !== 'pan') {
          onPageDragStart(e, pageIndex);
        }
      }}
      onClick={(e) => {
        if (state.activeTool === 'draw' || state.activeTool === 'pan' || isSpacePressed) return;
        if (isDragging) return;

        e.stopPropagation();
        if (pageIndex !== state.activePageIndex) {
          dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, payload: pageIndex });
        }
      }}
    >
      {/* Guides */}
      {state.showGuides && (
        <>
          <div
            className={CANVAS.safeArea}
            style={{
              left: safeMargin, top: safeMargin, right: safeMargin, bottom: safeMargin,
              borderColor: theme.guide,
            }}
          />
          <div
            className={CANVAS.bleedArea}
            style={{
              left: -bleedMargin, top: -bleedMargin, right: -bleedMargin, bottom: -bleedMargin,
              borderColor: theme.bleed,
            }}
          />
        </>
      )}

      {/* Grid */}
      {state.showGrid && (
        <svg className={CANVAS.grid} width={format.width} height={format.height}>
          <defs>
            <pattern id={`grid-${page.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={theme.border} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${page.id})`} />
        </svg>
      )}

      {/* Content */}
      <div className="page-content absolute inset-0" onClick={onCanvasClick}>
        {page.panels.map(panel => (
          <Panel
            key={panel.id}
            panel={panel}
            pageWidth={format.width}
            pageHeight={format.height}
          />
        ))}

        {isActive && (
          <DrawingCanvas
            pageWidth={format.width}
            pageHeight={format.height}
          />
        )}

        {page.bubbles.map(bubble => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            pageWidth={format.width}
            pageHeight={format.height}
          />
        ))}

        {/* Reading Order Overlay */}
        {state.showReadingOrder && page.panels.length > 0 && (
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 60 }}
            width={format.width} height={format.height}>
            <defs>
              <marker id="ro-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={theme.primary} opacity="0.6" />
              </marker>
            </defs>
            {[...page.panels]
              .sort((a, b) => {
                // Top-to-bottom, then right-to-left (manga) or left-to-right
                const rowA = Math.floor(a.y / 80), rowB = Math.floor(b.y / 80);
                if (rowA !== rowB) return rowA - rowB;
                return a.x - b.x;
              })
              .map((panel, i, sorted) => {
                const cx = panel.x + panel.width / 2;
                const cy = panel.y + panel.height / 2;
                const next = sorted[i + 1];
                return (
                  <g key={panel.id}>
                    <circle cx={cx} cy={cy} r={14}
                      fill={theme.primary} opacity={0.85} />
                    <text x={cx} y={cy + 5} textAnchor="middle"
                      fill="#fff" fontSize={12} fontWeight="bold" fontFamily="'Orbitron', monospace">
                      {i + 1}
                    </text>
                    {next && (
                      <line x1={cx} y1={cy} x2={next.x + next.width / 2} y2={next.y + next.height / 2}
                        stroke={theme.primary} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.4}
                        markerEnd="url(#ro-arrow)" />
                    )}
                  </g>
                );
              })}
          </svg>
        )}
      </div>

      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs pointer-events-none"
        style={{
          backgroundColor: theme.surface,
          color: theme.textSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        Page {pageIndex + 1}
      </div>
    </div>
  );
};

export default CanvasPage;
