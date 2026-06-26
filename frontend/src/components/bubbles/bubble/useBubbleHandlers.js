// ============================================
// SumiWire PRO - Bubble Handlers Hook
// V2.1 : Fix Import Paths
// ============================================
import { useState, useRef, useCallback, useEffect } from 'react';
// CORRECTION ICI : ../../../ au lieu de ../../
import { useStudio, ACTIONS } from '../../../context/StudioContext';
import { snapToGrid, clamp, angleBetweenPoints } from '../../../utils/helpers';

export const useBubbleHandlers = (bubble, pageWidth, pageHeight, bubbleRef, isSelected, isEditingImage) => {
  const { state, dispatch } = useStudio();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingTail, setIsDraggingTail] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizingImage, setIsResizingImage] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const dragStartRef = useRef({ x: 0, y: 0, bubbleX: 0, bubbleY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, bubbleX: 0, bubbleY: 0 });
  const textDragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const imageDragStartRef = useRef({ x: 0, y: 0, imageX: 0, imageY: 0 });
  const imageResizeStartRef = useRef({ x: 0, y: 0, scaleX: 1, scaleY: 1 });

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    
    // Si on clique sur une AUTRE bulle pendant l'édition d'image, sortir du mode édition
    if (state.editingImageId && state.editingImageId !== bubble.id) {
      dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
    }
    
    if (e.shiftKey) {
      if (isEditingImage) dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
      if (isSelected) {
        dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: state.selectedPanelIds, bubbleIds: state.selectedBubbleIds.filter(id => id !== bubble.id) } });
      } else {
        dispatch({ type: ACTIONS.ADD_TO_SELECTION, payload: { bubbleId: bubble.id } });
      }
    } else {
      if (!isEditingImage) dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [], bubbleIds: [bubble.id] } });
    }
  }, [dispatch, bubble.id, isSelected, isEditingImage, state.selectedPanelIds, state.selectedBubbleIds, state.editingImageId]);

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);

    if (!isSelected) dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: [], bubbleIds: [bubble.id] } });

    if (isEditingImage && bubble.image) {
      setIsDraggingImage(true);
      imageDragStartRef.current = { x: e.clientX, y: e.clientY, imageX: bubble.imageX || 0, imageY: bubble.imageY || 0 };
      return;
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, bubbleX: bubble.x, bubbleY: bubble.y };
  }, [isSelected, isEditingImage, bubble, dispatch]);

  const handleResizeStart = useCallback((e, h) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsResizing(true);
    setResizeHandle(h);
    resizeStartRef.current = { x: e.clientX, y: e.clientY, width: bubble.width, height: bubble.height, bubbleX: bubble.x, bubbleY: bubble.y };
  }, [bubble]);

  const handleImageResizeStart = useCallback((e, h) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsResizingImage(true);
    setResizeHandle(h);
    imageResizeStartRef.current = { 
      x: e.clientX, 
      y: e.clientY, 
      scaleX: bubble.imageScaleX || 1, 
      scaleY: bubble.imageScaleY || 1 
    };
  }, [bubble]);

  const handleTailMouseDown = useCallback((e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDraggingTail(true);
  }, []);

  const handleTextMouseDown = useCallback((e) => {
    if (bubble.textLocked) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDraggingText(true);
    textDragStartRef.current = { x: e.clientX, y: e.clientY, offsetX: bubble.textOffsetX || 0, offsetY: bubble.textOffsetY || 0 };
  }, [bubble]);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (bubble.image) {
      dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: bubble.id });
      if (!isSelected) dispatch({ type: ACTIONS.SET_SELECTION, payload: { bubbleIds: [bubble.id] } });
    } else {
      if (!isSelected) dispatch({ type: ACTIONS.SET_SELECTION, payload: { bubbleIds: [bubble.id] } });
      setTimeout(() => { 
        const i = document.getElementById('properties-bubble-text'); 
        if (i) { i.focus(); i.select(); } 
      }, 50);
    }
  }, [dispatch, isSelected, bubble.id, bubble.image]);

  // Sortir du mode édition image avec Escape
  useEffect(() => {
    if (!isEditingImage) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: ACTIONS.SET_EDITING_IMAGE, payload: null });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingImage, dispatch]);

  useEffect(() => {
    if (!isDragging && !isResizing && !isDraggingTail && !isDraggingText && !isDraggingImage && !isResizingImage) return;

    const handleMouseMove = (e) => {
      const zoom = state.zoom;

      if (isDragging) {
        const dx = (e.clientX - dragStartRef.current.x) / zoom;
        const dy = (e.clientY - dragStartRef.current.y) / zoom;
        let nx = dragStartRef.current.bubbleX + dx;
        let ny = dragStartRef.current.bubbleY + dy;
        if (state.snapToGrid) { nx = snapToGrid(nx); ny = snapToGrid(ny); }
        nx = clamp(nx, 0, pageWidth - bubble.width);
        ny = clamp(ny, 0, pageHeight - bubble.height);
        dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { x: nx, y: ny }, skipHistory: true } });
      }

      if (isResizing) {
        const dx = (e.clientX - resizeStartRef.current.x) / zoom;
        const dy = (e.clientY - resizeStartRef.current.y) / zoom;
        let nx = resizeStartRef.current.bubbleX;
        let ny = resizeStartRef.current.bubbleY;
        let nw = resizeStartRef.current.width;
        let nh = resizeStartRef.current.height;
        
        if (resizeHandle.includes('e')) nw += dx;
        if (resizeHandle.includes('w')) { nx += dx; nw -= dx; }
        if (resizeHandle.includes('s')) nh += dy;
        if (resizeHandle.includes('n')) { ny += dy; nh -= dy; }
        
        if (nw < 30) { if (resizeHandle.includes('w')) nx -= 30 - nw; nw = 30; }
        if (nh < 30) { if (resizeHandle.includes('n')) ny -= 30 - nh; nh = 30; }
        
        dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { x: nx, y: ny, width: nw, height: nh }, skipHistory: true } });
      }

      if (isDraggingTail && bubbleRef.current) {
        const r = bubbleRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        let ang = angleBetweenPoints(cx, cy, e.clientX, e.clientY);
        const dx = (e.clientX - cx) / zoom;
        const dy = (e.clientY - cy) / zoom;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const a = bubble.width / 2;
        const b = bubble.height / 2;
        const rad = (ang * Math.PI) / 180;
        const rEllipse = (a * b) / Math.sqrt(Math.pow(b * Math.cos(rad), 2) + Math.pow(a * Math.sin(rad), 2));
        const len = Math.max(10, dist - rEllipse);
        if (bubble.flipped) ang = 180 - ang;
        dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { tailAngle: ang, tailLength: len }, skipHistory: true } });
      }

      if (isDraggingText) {
        const dx = (e.clientX - textDragStartRef.current.x) / zoom;
        const dy = (e.clientY - textDragStartRef.current.y) / zoom;
        dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { textOffsetX: textDragStartRef.current.offsetX + dx, textOffsetY: textDragStartRef.current.offsetY + dy }, skipHistory: true } });
      }

      if (isDraggingImage) {
        const dx = (e.clientX - imageDragStartRef.current.x) / zoom;
        const dy = (e.clientY - imageDragStartRef.current.y) / zoom;
        dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { imageX: imageDragStartRef.current.imageX + dx, imageY: imageDragStartRef.current.imageY + dy }, skipHistory: true } });
      }

      // === REDIMENSIONNEMENT IMAGE - 8 DIRECTIONS ===
      if (isResizingImage) {
        const dx = (e.clientX - imageResizeStartRef.current.x) / zoom;
        const dy = (e.clientY - imageResizeStartRef.current.y) / zoom;
        const origW = bubble.originalImageWidth || bubble.width;
        const origH = bubble.originalImageHeight || bubble.height;
        
        let newScaleX = imageResizeStartRef.current.scaleX;
        let newScaleY = imageResizeStartRef.current.scaleY;
        
        const isCorner = resizeHandle.length === 2;
        
        // Redimensionnement horizontal
        if (resizeHandle.includes('e')) {
          newScaleX = Math.max(0.05, imageResizeStartRef.current.scaleX + dx / origW);
        } else if (resizeHandle.includes('w')) {
          newScaleX = Math.max(0.05, imageResizeStartRef.current.scaleX - dx / origW);
        }
        
        // Redimensionnement vertical
        if (resizeHandle.includes('s')) {
          newScaleY = Math.max(0.05, imageResizeStartRef.current.scaleY + dy / origH);
        } else if (resizeHandle.includes('n')) {
          newScaleY = Math.max(0.05, imageResizeStartRef.current.scaleY - dy / origH);
        }
        
        // Pour les coins : proportionnel par défaut, libre avec Shift
        if (isCorner && !e.shiftKey) {
          // Calculer le scale moyen pour garder les proportions
          const avgScale = (newScaleX + newScaleY) / 2;
          newScaleX = avgScale;
          newScaleY = avgScale;
        }
        
        dispatch({ 
          type: ACTIONS.UPDATE_BUBBLE, 
          payload: { 
            id: bubble.id, 
            updates: { imageScaleX: newScaleX, imageScaleY: newScaleY }, 
            skipHistory: true 
          } 
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing || isDraggingTail || isDraggingText || isDraggingImage || isResizingImage) {
        dispatch({ type: ACTIONS.SAVE_HISTORY });
      }
      setIsDragging(false);
      setIsResizing(false);
      setIsDraggingTail(false);
      setIsDraggingText(false);
      setIsDraggingImage(false);
      setIsResizingImage(false);
      setResizeHandle(null);
    };

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerup', handleMouseUp);
    };
  }, [isDragging, isResizing, isDraggingTail, isDraggingText, isDraggingImage, isResizingImage, resizeHandle, bubble, pageWidth, pageHeight, state.zoom, state.snapToGrid, dispatch, bubbleRef]);

  return {
    isDragging,
    handleSelect,
    handleMouseDown,
    handleResizeStart,
    handleImageResizeStart,
    handleTailMouseDown,
    handleTextMouseDown,
    handleDoubleClick,
  };
};