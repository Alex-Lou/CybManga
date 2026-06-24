// ============================================
// SumiWire PRO - Main Canvas
// Custom Cursor & Theme Adaptation
// FREE PAGE DRAG & DROP in "all" view mode
// ============================================

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { CANVAS, cn } from '../../styles/tailwind';
import { PAGE_FORMATS, MM_TO_PX, SAFE_MARGIN_MM, BLEED_MARGIN_MM } from '../../utils/constants';
import Panel from '../panels/Panel';
import Bubble from '../bubbles/bubble/Bubble';
import DrawingCanvas from '../drawing/DrawingCanvas';

// --- GÉNÉRATEUR DE CURSEUR SVG DYNAMIQUE ---
const getSelectionCursor = (isDark) => {
  const fill = isDark ? '#ffffff' : '#000000';
  const stroke = isDark ? '#000000' : '#ffffff';
  
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L11 28L16 17L26 15L2 2Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `.trim();

  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') 0 0, auto`;
};

const Canvas = () => {
  const { state, dispatch, currentPage, pageFormat, theme } = useStudio();
  const containerRef = useRef(null);
  const canvasInnerRef = useRef(null);
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  
  // Page dragging state (for "all" view mode)
  const [draggingPageIndex, setDraggingPageIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreviewPos, setDragPreviewPos] = useState(null);
  const dragPreviewPosRef = useRef(null); // Real-time position tracking
  
  const { width: pageWidth, height: pageHeight } = pageFormat;
  const safeMargin = SAFE_MARGIN_MM * MM_TO_PX;
  const bleedMargin = BLEED_MARGIN_MM * MM_TO_PX;

  // --- CENTRER LA VUE SUR LES PAGES ---
  const centerViewOnPages = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculer la position de la première page selon le mode
    let targetX = 0;
    let targetY = 0;
    let contentWidth = 0;
    let contentHeight = 0;
    
    if (state.viewMode === 'single') {
      const format = PAGE_FORMATS[currentPage?.format || 'a4'];
      contentWidth = format.width + 200;
      contentHeight = format.height + 200;
      // Centrer sur la page
      targetX = (contentWidth * state.zoom - containerWidth) / 2;
      targetY = (contentHeight * state.zoom - containerHeight) / 2;
    } else if (state.viewMode === 'spread') {
      const format = PAGE_FORMATS[currentPage?.format || 'a4'];
      contentWidth = (format.width * 2) + 300;
      contentHeight = format.height + 200;
      targetX = (contentWidth * state.zoom - containerWidth) / 2;
      targetY = (contentHeight * state.zoom - containerHeight) / 2;
    } else if (state.viewMode === 'all') {
      // En mode all, centrer sur la première page (position 0,0 ou position stockée)
      const firstPage = state.pages[0];
      const format = PAGE_FORMATS[firstPage?.format || 'a4'];
      const gridGap = 40;
      const firstPos = firstPage?.position || { x: 0, y: 0 };
      
      // Calculer où la première page apparaît (avec scale 0.5)
      const scaledX = firstPos.x * 0.5;
      const scaledY = firstPos.y * 0.5;
      const scaledWidth = format.width * 0.5;
      const scaledHeight = format.height * 0.5;
      
      // Centrer la vue sur cette page
      targetX = (scaledX + scaledWidth / 2) * state.zoom - containerWidth / 2;
      targetY = (scaledY + scaledHeight / 2) * state.zoom - containerHeight / 2;
    }
    
    // Appliquer le scroll (avec limites)
    container.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: 'smooth'
    });
  }, [state.viewMode, state.zoom, state.pages, currentPage]);

  // Centrer la vue quand le mode change
  useEffect(() => {
    // Petit délai pour laisser le DOM se mettre à jour
    const timer = setTimeout(() => {
      centerViewOnPages();
    }, 50);
    return () => clearTimeout(timer);
  }, [state.viewMode]);

  // Centrer au montage initial
  useEffect(() => {
    const timer = setTimeout(() => {
      centerViewOnPages();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // --- SHORTCUTS (ESPACE POUR PAN + FLÈCHES POUR SCROLL + HOME POUR CENTRER) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space for pan mode
      if (e.code === 'Space' && !e.repeat && state.activeTool !== 'draw') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      
      // Home key to center view on pages
      if (e.code === 'Home') {
        e.preventDefault();
        centerViewOnPages();
        return;
      }
      
      // Arrow keys for scrolling (when not editing text)
      const isEditing = document.activeElement?.isContentEditable || 
                        document.activeElement?.tagName === 'INPUT' || 
                        document.activeElement?.tagName === 'TEXTAREA';
      
      if (!isEditing && containerRef.current) {
        const scrollAmount = e.shiftKey ? 100 : 50; // Shift = faster scroll
        
        switch (e.code) {
          case 'ArrowUp':
            e.preventDefault();
            containerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            break;
          case 'ArrowDown':
            e.preventDefault();
            containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            break;
          case 'ArrowLeft':
            e.preventDefault();
            containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            break;
          case 'ArrowRight':
            e.preventDefault();
            containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            break;
          default:
            break;
        }
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (isPanning) setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.activeTool, isPanning, centerViewOnPages]);
  
  // --- CLICK BACKGROUND TO CLEAR SELECTION & EXIT IMAGE EDITING ---
  const handleCanvasClick = useCallback((e) => {
    if (state.activeTool === 'draw' || isPanning || draggingPageIndex !== null) return;

    if (e.target === e.currentTarget || 
        e.target.classList.contains('canvas-background') ||
        e.target.classList.contains('page-content')) {
      
      if (state.editingImageId) {
        dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
      }
      
      dispatch({ type: ACTIONS.CLEAR_SELECTION });
    }
  }, [dispatch, state.activeTool, state.editingImageId, isPanning, draggingPageIndex]);
  
  // --- PANNING LOGIC ---
  const handleMouseDown = useCallback((e) => {
    // Don't pan if we're dragging a page
    if (draggingPageIndex !== null) return;
    
    const isPanTool = state.activeTool === 'pan';
    const isMiddleClick = e.button === 1;
    const isAltDrag = e.button === 0 && e.altKey;
    
    if ((isPanTool && e.button === 0) || (isSpacePressed && e.button === 0) || isMiddleClick || isAltDrag) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        offsetX: state.panOffset.x,
        offsetY: state.panOffset.y,
      };
    }
  }, [state.panOffset, state.activeTool, isSpacePressed, draggingPageIndex]);
  
  useEffect(() => {
    if (!isPanning) return;
    
    const handleMouseMove = (e) => {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      
      dispatch({
        type: ACTIONS.SET_PAN,
        payload: {
          x: panStartRef.current.offsetX + dx,
          y: panStartRef.current.offsetY + dy,
        }
      });
    };
    
    const handleMouseUp = () => {
      setIsPanning(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, dispatch]);
  
  // --- PAGE DRAGGING IN "ALL" VIEW ---
  const handlePageDragStart = useCallback((e, pageIndex) => {
    if (state.viewMode !== 'all') return;
    if (state.activeTool === 'draw' || isSpacePressed || state.activeTool === 'pan') return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const page = state.pages[pageIndex];
    const format = PAGE_FORMATS[page.format];
    
    // Store mouse start position
    setDraggingPageIndex(pageIndex);
    setDragOffset({
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    });
    
    // Get current page position (or calculate default)
    const gridColumns = 3;
    const gridGap = 40;
    const defaultPosition = {
      x: (pageIndex % gridColumns) * (format.width + gridGap * 2),
      y: Math.floor(pageIndex / gridColumns) * (format.height + gridGap * 2),
    };
    const currentPos = page.position || defaultPosition;
    
    // Store original position in both state and ref
    const initialPos = { ...currentPos, originalX: currentPos.x, originalY: currentPos.y };
    setDragPreviewPos(initialPos);
    dragPreviewPosRef.current = initialPos;
  }, [state.viewMode, state.activeTool, isSpacePressed, state.pages]);
  
  // Handle page drag move
  useEffect(() => {
    if (draggingPageIndex === null || dragPreviewPos?.originalX === undefined) return;
    
    const handleMouseMove = (e) => {
      // Calculate mouse delta in screen pixels
      const deltaScreenX = e.clientX - dragOffset.startMouseX;
      const deltaScreenY = e.clientY - dragOffset.startMouseY;
      
      // Convert screen delta to canvas coordinates
      // Screen movement needs to be divided by (zoom * pageScale) to get canvas movement
      const pageScale = 0.5;
      const deltaCanvasX = deltaScreenX / (state.zoom * pageScale);
      const deltaCanvasY = deltaScreenY / (state.zoom * pageScale);
      
      // New position = original position + delta
      const newX = dragPreviewPos.originalX + deltaCanvasX;
      const newY = dragPreviewPos.originalY + deltaCanvasY;
      
      // Update both ref (immediate) and state (for render)
      const newPos = { ...dragPreviewPos, x: newX, y: newY };
      dragPreviewPosRef.current = newPos;
      setDragPreviewPos(newPos);
    };
    
    const handleMouseUp = () => {
      // Use ref for the most up-to-date position
      if (draggingPageIndex !== null && dragPreviewPosRef.current) {
        dispatch({
          type: ACTIONS.SET_PAGE_POSITION,
          payload: {
            pageIndex: draggingPageIndex,
            position: { 
              x: dragPreviewPosRef.current.x, 
              y: dragPreviewPosRef.current.y 
            },
          }
        });
      }
      
      setDraggingPageIndex(null);
      setDragPreviewPos(null);
      dragPreviewPosRef.current = null;
      setDragOffset({ x: 0, y: 0 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPageIndex, dragOffset, state.zoom, dispatch, dragPreviewPos?.originalX, dragPreviewPos?.originalY]);
  
  // --- DROP FROM SIDEBAR ---
  const handleCanvasDragOver = useCallback((e) => {
    if (state.viewMode !== 'all') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [state.viewMode]);
  
  const handleCanvasDrop = useCallback((e) => {
    if (state.viewMode !== 'all') return;
    e.preventDefault();
    
    const pageIndexStr = e.dataTransfer.getData('application/x-sumiwire-page');
    if (!pageIndexStr) return;
    
    const pageIndex = parseInt(pageIndexStr, 10);
    if (isNaN(pageIndex) || pageIndex < 0 || pageIndex >= state.pages.length) return;
    
    // Calculate drop position relative to canvas
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Mouse position relative to container
    const mouseInContainerX = e.clientX - containerRect.left;
    const mouseInContainerY = e.clientY - containerRect.top;
    
    // Remove panOffset and zoom to get canvas coordinates
    const mouseInCanvasX = (mouseInContainerX - state.panOffset.x) / state.zoom;
    const mouseInCanvasY = (mouseInContainerY - state.panOffset.y) / state.zoom;
    
    dispatch({
      type: ACTIONS.SET_PAGE_POSITION,
      payload: {
        pageIndex,
        position: { x: mouseInCanvasX, y: mouseInCanvasY },
      }
    });
    
    // Also set this page as active
    dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, payload: pageIndex });
  }, [state.viewMode, state.pages.length, state.zoom, state.panOffset, dispatch]);
  
  // --- ZOOM SCROLL (CENTRÉ SUR LA SOURIS) ---
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    // Shift + wheel = horizontal scroll
    if (e.shiftKey) {
      dispatch({
        type: ACTIONS.SET_PAN,
        payload: {
          x: state.panOffset.x - e.deltaY,
          y: state.panOffset.y,
        }
      });
      return;
    }
    
    // Zoom centré sur la position de la souris
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Position de la souris relative au container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Position de la souris dans le canvas (avant zoom)
    const mouseCanvasX = (mouseX - state.panOffset.x) / state.zoom;
    const mouseCanvasY = (mouseY - state.panOffset.y) / state.zoom;
    
    // Calculer le nouveau zoom
    const zoomSpeed = (e.ctrlKey || e.metaKey) ? 0.05 : 0.1;
    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newZoom = Math.max(0.1, Math.min(5, state.zoom + delta));
    
    // Calculer le nouveau pan pour garder la souris au même endroit
    const newPanX = mouseX - mouseCanvasX * newZoom;
    const newPanY = mouseY - mouseCanvasY * newZoom;
    
    dispatch({ type: ACTIONS.SET_ZOOM, payload: newZoom });
    dispatch({ 
      type: ACTIONS.SET_PAN, 
      payload: { x: newPanX, y: newPanY } 
    });
  }, [state.zoom, state.panOffset, dispatch]);
  
  // Attach wheel event with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);
  
  // --- RENDER PAGE HELPER ---
  const renderPage = (page, pageIndex, extraStyle = {}, isDraggable = false) => {
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
          ...(isActive ? { boxShadow: `0 0 0 2px ${theme.primary}, 0 0 15px ${theme.glow || 'rgba(0,247,255,0.2)'}` } : {}),
          ...extraStyle,
        }}
        onMouseDown={(e) => {
          if (isDraggable && e.button === 0 && !isSpacePressed && state.activeTool !== 'pan') {
            handlePageDragStart(e, pageIndex);
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
        <div className="page-content absolute inset-0" onClick={handleCanvasClick}>
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
  
  // --- VIEW MODES ---
  const renderView = () => {
    switch (state.viewMode) {
      case 'single':
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
            {renderPage(currentPage, state.activePageIndex)}
          </div>
        );
        
      case 'spread':
        const nextIndex = state.activePageIndex + 1;
        const nextPage = state.pages[nextIndex];
        const spreadFormat = PAGE_FORMATS[currentPage?.format || 'a4'];
        return (
          <div 
            className={CANVAS.spreadView}
            style={{
              minWidth: (spreadFormat.width * 2) + 300,
              minHeight: spreadFormat.height + 200,
              padding: '100px',
            }}
          >
            {renderPage(currentPage, state.activePageIndex)}
            {nextPage && renderPage(nextPage, nextIndex)}
          </div>
        );
        
      case 'all':
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
                  {renderPage(page, index, {}, true)}
                </div>
              );
            })}
          </div>
        );
        
      default:
        return renderPage(currentPage, state.activePageIndex);
    }
  };
  
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

  return (
    <div
      ref={containerRef}
      className={`${CANVAS.container} canvas-scrollbar${state.isDarkMode ? ' cyber-grid' : ''}`}
      style={{
        backgroundColor: theme.canvas,
        cursor: cursorStyle,
      }}
      tabIndex={0}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
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
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default Canvas;