// ============================================
// SumiWire PRO - Panel Component
// V7.2 : Performance Fix + Import Fix
// ============================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { PANEL, cn } from '../../styles/tailwind';
import { snapToGrid, clamp } from '../../utils/helpers';

const Panel = ({ panel, pageWidth, pageHeight }) => {
  const { state, dispatch, theme } = useStudio();

  // --- ÉTATS LOCAUX ---
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizingImage, setIsResizingImage] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef(null);

  // --- REFS POUR CALCULS (Optimisés) ---
  const dragStartRef = useRef({ x: 0, y: 0, panelX: 0, panelY: 0, width: 0, height: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, panelX: 0, panelY: 0 });
  const imageDragStartRef = useRef({ x: 0, y: 0, imageX: 0, imageY: 0 });
  const imageResizeStartRef = useRef({ x: 0, y: 0, scaleX: 1, scaleY: 1, imageX: 0, imageY: 0, originalW: 100 });

  const isSelected = state.selectedPanelIds.includes(panel.id);
  const isLocked = state.layoutLocked;
  const isEditingImage = state.editingImageId === panel.id;

  const handleImageLoad = (e) => {
    setImageDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  // --- GÉNÉRATEUR DE FORMES ---
  const getPanelShapePath = (width, height, type) => {
    const w = width;
    const h = height;

    switch (type) {
      case 'trapezoid': return `M ${w * 0.2},0 L ${w * 0.8},0 L ${w},${h} L 0,${h} Z`;
      case 'parallelogram': return `M ${w * 0.25},0 L ${w},0 L ${w * 0.75},${h} L 0,${h} Z`;
      case 'hexagon': return `M ${w * 0.25},0 L ${w * 0.75},0 L ${w},${h / 2} L ${w * 0.75},${h} L ${w * 0.25},${h} L 0,${h / 2} Z`;
      case 'octagon': 
        const s = Math.min(w, h) * 0.3;
        return `M ${s},0 L ${w - s},0 L ${w},${s} L ${w},${h - s} L ${w - s},${h} L ${s},${h} L 0,${h - s} L 0,${s} Z`;
      case 'star': {
        const cx = w / 2; const cy = h / 2;
        const outerRadius = Math.min(w, h) / 2;
        const innerRadius = outerRadius / 2.5;
        let path = '';
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          path += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
        }
        return path + ' Z';
      }
      case 'burst':
      case 'shout':
      case 'explosion': {
        const bcx = w / 2; const bcy = h / 2;
        const bOuter = Math.min(w, h) / 2;
        const bInner = bOuter * 0.6;
        let bPath = '';
        for (let i = 0; i < 16; i++) {
          const angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
          const r = i % 2 === 0 ? bOuter : bInner;
          const x = bcx + Math.cos(angle) * r;
          const y = bcy + Math.sin(angle) * r;
          bPath += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
        }
        return bPath + ' Z';
      }
      case 'cloud':
        return `M ${w*0.2},${h*0.8} Q ${w*0.1},${h*0.5} ${w*0.3},${h*0.4} Q ${w*0.4},${h*0.1} ${w*0.6},${h*0.4} Q ${w*0.9},${h*0.3} ${w*0.9},${h*0.6} Q ${w},${h*0.9} ${w*0.7},${h*0.9} Q ${w*0.4},${h} ${w*0.2},${h*0.8} Z`;
      case 'torn':
        let tPath = `M 0,0 L ${w},0 L ${w},${h*0.85} `;
        const steps = 12;
        const stepW = w / steps;
        for(let i=1; i<=steps; i++) {
           const x = w - (i * stepW);
           const y = (i % 2 === 0) ? h * 0.85 : h;
           tPath += `L ${x},${y} `;
        }
        return tPath + `L 0,${h*0.85} Z`;
      case 'diagonal-left': return `M ${w * 0.15},0 L ${w},0 L ${w},${h} L 0,${h} Z`;
      case 'diagonal-right': return `M 0,0 L ${w * 0.85},0 L ${w},${h} L 0,${h} Z`;
      default: return null;
    }
  };

  // --- HANDLERS ---
  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    if (e.shiftKey) {
      if (isEditingImage) dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
      if (isSelected) {
        dispatch({
          type: ACTIONS.SET_SELECTION,
          payload: { panelIds: state.selectedPanelIds.filter(id => id !== panel.id), bubbleIds: state.selectedBubbleIds }
        });
      } else {
        dispatch({ type: ACTIONS.ADD_TO_SELECTION, payload: { panelId: panel.id } });
      }
    } else {
      if (!isEditingImage) dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [panel.id], bubbleIds: [] } });
    }
  }, [dispatch, panel.id, isSelected, isEditingImage, state.selectedPanelIds, state.selectedBubbleIds]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (panel.image && !isLocked) {
      dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: panel.id });
      if (!isSelected) dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [panel.id], bubbleIds: [] } });
    }
  }, [panel.image, panel.id, isLocked, isSelected, dispatch]);

  // --- CONTEXT MENU (clic droit) ---
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSelected) {
      dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [panel.id], bubbleIds: [] } });
    }
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [isSelected, dispatch, panel.id]);

  const handleRenameStart = useCallback(() => {
    setRenameValue(panel.name || '');
    setIsRenaming(true);
    setContextMenu(null);
  }, [panel.name]);

  const handleRenameConfirm = useCallback(() => {
    dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: panel.id, updates: { name: renameValue.trim() } } });
    setIsRenaming(false);
  }, [dispatch, panel.id, renameValue]);

  const handleRenameKeyDown = useCallback((e) => {
    e.stopPropagation();
    if (e.key === 'Enter') handleRenameConfirm();
    if (e.key === 'Escape') setIsRenaming(false);
  }, [handleRenameConfirm]);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [contextMenu]);

  // Auto-focus rename input
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;
    if (e.button !== 0) return;

    if (!isSelected) dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [panel.id], bubbleIds: [] } });

    if (isEditingImage && panel.image) {
      setIsDraggingImage(true);
      imageDragStartRef.current = {
        x: e.clientX, y: e.clientY,
        imageX: panel.imageX || 0,
        imageY: panel.imageY || 0,
      };
      return;
    }
    
    setIsDragging(true);
    // SAUVEGARDE DIMENSIONS AU CLICK
    dragStartRef.current = {
      x: e.clientX, y: e.clientY,
      panelX: panel.x,
      panelY: panel.y,
      width: panel.width,
      height: panel.height,
    };
  }, [isLocked, isSelected, isEditingImage, panel, dispatch]);

  const handleResizeStart = useCallback((e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;

    setIsResizing(true);
    setResizeHandle(handle);
    resizeStartRef.current = {
      x: e.clientX, y: e.clientY,
      width: panel.width, height: panel.height,
      panelX: panel.x, panelY: panel.y,
    };
  }, [isLocked, panel]);

  const handleImageResizeStart = useCallback((e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLocked) return;

    setIsResizingImage(true);
    setResizeHandle(handle);
    imageResizeStartRef.current = {
      x: e.clientX, y: e.clientY,
      scaleX: panel.imageScaleX || 1, scaleY: panel.imageScaleY || 1,
      imageX: panel.imageX || 0, imageY: panel.imageY || 0,
      originalW: panel.originalImageWidth || 100 
    };
  }, [isLocked, panel]);

  // --- LOGIQUE DE DÉPLACEMENT ---
  useEffect(() => {
    if (!isDragging && !isResizing && !isDraggingImage && !isResizingImage) return;
    
    const handleMouseMove = (e) => {
      const zoom = state.zoom;
      
      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        let newX = dragStartRef.current.panelX + dx;
        let newY = dragStartRef.current.panelY + dy;
        const currentWidth = dragStartRef.current.width;
        const currentHeight = dragStartRef.current.height;

        if (state.snapToGrid) {
          newX = snapToGrid(newX);
          newY = snapToGrid(newY);
        }
        newX = clamp(newX, 0, pageWidth - currentWidth);
        newY = clamp(newY, 0, pageHeight - currentHeight);
        
        dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: panel.id, updates: { x: newX, y: newY }, skipHistory: true } });
      }

      if (isDraggingImage) {
        const dx = (e.clientX - imageDragStartRef.current.x) / zoom;
        const dy = (e.clientY - imageDragStartRef.current.y) / zoom;
        dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: panel.id, updates: { imageX: imageDragStartRef.current.imageX + dx, imageY: imageDragStartRef.current.imageY + dy }, skipHistory: true } });
      }
      
      if (isResizing) {
        const dx = (e.clientX - resizeStartRef.current.x) / zoom;
        const dy = (e.clientY - resizeStartRef.current.y) / zoom;
        let newX = resizeStartRef.current.panelX;
        let newY = resizeStartRef.current.panelY;
        let newWidth = resizeStartRef.current.width;
        let newHeight = resizeStartRef.current.height;
        
        switch (resizeHandle) {
          case 'n': newY += dy; newHeight -= dy; break;
          case 's': newHeight += dy; break;
          case 'e': newWidth += dx; break;
          case 'w': newX += dx; newWidth -= dx; break;
          case 'ne': newY += dy; newHeight -= dy; newWidth += dx; break;
          case 'nw': newX += dx; newY += dy; newWidth -= dx; newHeight -= dy; break;
          case 'se': newWidth += dx; newHeight += dy; break;
          case 'sw': newX += dx; newWidth -= dx; newHeight += dy; break;
        }
        
        const minSize = 30;
        if (newWidth < minSize) { if (resizeHandle.includes('w')) newX = resizeStartRef.current.panelX + resizeStartRef.current.width - minSize; newWidth = minSize; }
        if (newHeight < minSize) { if (resizeHandle.includes('n')) newY = resizeStartRef.current.panelY + resizeStartRef.current.height - minSize; newHeight = minSize; }
        
        if (state.snapToGrid) { newX = snapToGrid(newX); newY = snapToGrid(newY); newWidth = snapToGrid(newWidth); newHeight = snapToGrid(newHeight); }
        dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: panel.id, updates: { x: newX, y: newY, width: newWidth, height: newHeight }, skipHistory: true } });
      }

      if (isResizingImage) {
        const dx = (e.clientX - imageResizeStartRef.current.x) / zoom;
        const dy = (e.clientY - imageResizeStartRef.current.y) / zoom;
        const originalW = imageResizeStartRef.current.originalW;
        const scaleFactorX = dx / originalW;
        const scaleFactorY = dy / originalW;

        let newScaleX = imageResizeStartRef.current.scaleX;
        let newScaleY = imageResizeStartRef.current.scaleY;

        // Corner handles: uniform resize (both X and Y)
        if (resizeHandle === 'se') { newScaleX += scaleFactorX; newScaleY += scaleFactorX; }
        else if (resizeHandle === 'sw') { newScaleX -= scaleFactorX; newScaleY -= scaleFactorX; }
        else if (resizeHandle === 'ne') { newScaleX += scaleFactorX; newScaleY += scaleFactorX; }
        else if (resizeHandle === 'nw') { newScaleX -= scaleFactorX; newScaleY -= scaleFactorX; }
        // Edge handles: stretch in ONE direction only
        else if (resizeHandle === 'e') { newScaleX += scaleFactorX; }
        else if (resizeHandle === 'w') { newScaleX -= scaleFactorX; }
        else if (resizeHandle === 's') { newScaleY += scaleFactorY; }
        else if (resizeHandle === 'n') { newScaleY -= scaleFactorY; }

        dispatch({ type: ACTIONS.UPDATE_PANEL, payload: { id: panel.id, updates: { imageScaleX: Math.max(0.1, newScaleX), imageScaleY: Math.max(0.1, newScaleY) }, skipHistory: true } });
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging) dispatch({ type: ACTIONS.SAVE_HISTORY, payload: 'Déplacer case' });
      if (isResizing) dispatch({ type: ACTIONS.SAVE_HISTORY, payload: 'Redimensionner case' });
      if (isDraggingImage) dispatch({ type: ACTIONS.SAVE_HISTORY, payload: 'Déplacer image' });
      if (isResizingImage) dispatch({ type: ACTIONS.SAVE_HISTORY, payload: 'Redimensionner image' });
      setIsDragging(false); setIsResizing(false); setIsDraggingImage(false); setIsResizingImage(false); setResizeHandle(null);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, isResizing, isDraggingImage, isResizingImage, resizeHandle, pageWidth, pageHeight, state.zoom, state.snapToGrid, dispatch, panel.id]); 

  // --- RENDU ---
  const renderPanelContent = () => {
    const { image, imageScaleX = 1, imageScaleY = 1, imageX = 0, imageY = 0, backgroundColor, imageOpacity = 1 } = panel;
    return (
      <div 
        style={{ 
            width: '100%', height: '100%', 
            backgroundColor, overflow: 'hidden', position: 'relative',
            pointerEvents: 'auto'
        }}
      >
        {image && (
          <img
            src={image}
            onLoad={handleImageLoad}
            alt="Panel content"
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%, -50%) translate(${imageX}px, ${imageY}px) scale(${imageScaleX}, ${imageScaleY})`,
              maxWidth: 'none', pointerEvents: 'none', userSelect: 'none',
              opacity: imageOpacity
            }}
          />
        )}
      </div>
    );
  };
  
  const renderPanelShape = () => {
    const { type, width, height, borderWidth, borderColor, borderRadius, borderStyle, backgroundColor } = panel;
    const pathD = getPanelShapePath(width, height, type);
    
    if (!pathD) {
       let style = { 
           width: '100%', height: '100%', 
           border: `${borderWidth}px ${borderStyle || 'solid'} ${borderColor}`, 
           overflow: 'hidden', 
           backgroundColor: backgroundColor,
           pointerEvents: 'auto'
       };
       if (type === 'circle' || type === 'ellipse') style.borderRadius = '50%';
       if (type === 'rounded') style.borderRadius = borderRadius || 20;
       return <div style={style}>{renderPanelContent()}</div>;
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path d={pathD} fill={backgroundColor || 'white'} pointerEvents="auto" /> 
          </svg>
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}><defs><clipPath id={`clip-${panel.id}`}><path d={pathD} /></clipPath></defs></svg>
          <div style={{ width: '100%', height: '100%', clipPath: `url(#clip-${panel.id})`, pointerEvents: 'auto' }}>
             {renderPanelContent()}
          </div>
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <path d={pathD} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={borderStyle === 'dashed' ? '10,5' : borderStyle === 'dotted' ? '3,3' : 'none'} />
          </svg>
        </div>
    );
  };

  const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
  const imageHandles = ['n', 's', 'e', 'w'];
  const imgW = (imageDimensions.width || 0) * (panel.imageScaleX || 1);
  const imgH = (imageDimensions.height || 0) * (panel.imageScaleY || 1);
  const imgX = (panel.width / 2) + (panel.imageX || 0) - (imgW / 2);
  const imgY = (panel.height / 2) + (panel.imageY || 0) - (imgH / 2);

  return (
    <div
      className={cn(PANEL.container, isSelected && !isEditingImage && PANEL.selected, isLocked && PANEL.locked)}
      style={{
        left: panel.x,
        top: panel.y,
        width: panel.width,
        height: panel.height,
        transform: panel.rotation ? `rotate(${panel.rotation}deg)` : 'none',
        zIndex: panel.zIndex || 1,
        cursor: isLocked ? 'not-allowed' : (isEditingImage ? 'move' : (isDragging ? 'grabbing' : 'grab')),
        outline: isEditingImage ? '2px dashed #f59e0b' : 'none',
        outlineOffset: '2px',
        pointerEvents: 'auto'
      }}
      onClick={handleSelect}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {renderPanelShape()}

      {/* Context menu — portal to body */}
      {contextMenu && createPortal(
        <div
          className="fixed py-1.5 rounded-lg shadow-2xl border min-w-44"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 99999,
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer rounded-md mx-1 transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.selection}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={handleRenameStart}
          >
            <span>✏️</span>
            <span>Renommer</span>
          </div>
        </div>,
        document.body
      )}

      {/* Rename overlay — portal to body */}
      {isRenaming && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 99998, backgroundColor: 'rgba(0,0,0,0.35)' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleRenameConfirm();
          }}
        >
          <div
            className="rounded-xl shadow-2xl p-4 flex flex-col gap-3 items-center"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, border: `1px solid ${theme.border}`, minWidth: 260 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-semibold" style={{ color: theme.text }}>
              Renommer la case
            </span>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-40"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              placeholder="Nom de la case..."
            />
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                style={{ borderColor: theme.border, color: theme.textSecondary }}
                onMouseDown={(e) => { e.stopPropagation(); setIsRenaming(false); }}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-3 py-1.5 text-sm rounded-lg text-white transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseDown={(e) => { e.stopPropagation(); handleRenameConfirm(); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      {isSelected && !isLocked && !isEditingImage && (
        <div className={PANEL.handles} style={{ pointerEvents: 'none' }}>
          {handles.map(handle => (
            <div
              key={handle}
              className={cn(PANEL.handle, PANEL[`handle${handle.toUpperCase()}`])}
              onMouseDown={(e) => handleResizeStart(e, handle)}
              style={{
                pointerEvents: 'auto',
                top: handle.includes('n') ? 0 : handle.includes('s') ? '100%' : '50%',
                left: handle.includes('w') ? 0 : handle.includes('e') ? '100%' : '50%',
                transform: `translate(${handle.includes('e') ? '50%' : handle.includes('w') ? '-50%' : '-50%'}, ${handle.includes('s') ? '50%' : handle.includes('n') ? '-50%' : '-50%'})`,
                cursor: `${handle}-resize`
              }}
            />
          ))}
        </div>
      )}

      {isEditingImage && panel.image && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute border border-yellow-500 opacity-50 pointer-events-none" style={{ top: imgY, left: imgX, width: imgW, height: imgH }} />
          {imageHandles.map(handle => {
            let top = imgY + imgH / 2;
            let left = imgX + imgW / 2;
            if (handle.includes('n')) top = imgY;
            if (handle.includes('s')) top = imgY + imgH;
            if (handle.includes('w')) left = imgX;
            if (handle.includes('e')) left = imgX + imgW;
            return (
              <div
                key={`img-${handle}`}
                className="absolute w-3 h-3 bg-yellow-500 rounded-full pointer-events-auto cursor-pointer border border-white hover:scale-125 transition-transform"
                onMouseDown={(e) => handleImageResizeStart(e, handle)}
                style={{ top, left, transform: 'translate(-50%, -50%)', cursor: `${handle}-resize` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Panel;