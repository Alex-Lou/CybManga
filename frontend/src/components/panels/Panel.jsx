// ============================================
// SumiWire PRO - Panel Component
// V7.2 : Performance Fix + Import Fix
// ============================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { PANEL, cn } from '../../styles/tailwind';
import { snapToGrid, clamp } from '../../utils/helpers';
import PanelShape from './PanelShape';
import PanelContextMenu from './PanelContextMenu';

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
      <PanelShape panel={panel} onImageLoad={handleImageLoad} />

      <PanelContextMenu
        contextMenu={contextMenu}
        isRenaming={isRenaming}
        theme={theme}
        renameValue={renameValue}
        renameInputRef={renameInputRef}
        onRenameStart={handleRenameStart}
        onRenameChange={setRenameValue}
        onRenameKeyDown={handleRenameKeyDown}
        onRenameConfirm={handleRenameConfirm}
        onRenameCancel={() => setIsRenaming(false)}
      />

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
