// ============================================
// SumiWire PRO - Professional Drawing Engine
// Multi-canvas (baked + active + cursor overlay)
// getCoalescedEvents, LazyBrush stabilizer
// Quadratic Bezier realtime smoothing
// Stamp-based spacing, pressure interpolation
// ============================================

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { detectShape } from '../../utils/shapeDetection';
import { generateSpeedLines, generateFocusLines } from '../../utils/effectLines';
import { renderScreentoneRegion } from '../../utils/screentone';

// --- LazyBrush stabilizer (Clip Studio / Lazy Nezumi style) ---
class LazyStabilizer {
  constructor(radius = 6) {
    this.x = 0; this.y = 0;
    this.radius = radius;
    this.initialized = false;
  }
  reset() { this.initialized = false; }
  setRadius(r) { this.radius = Math.max(0, r); }
  update(px, py) {
    if (!this.initialized) { this.x = px; this.y = py; this.initialized = true; return { x: px, y: py }; }
    if (this.radius <= 0) { this.x = px; this.y = py; return { x: px, y: py }; }
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.radius) {
      const move = dist - this.radius;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * move;
      this.y += Math.sin(angle) * move;
    }
    return { x: this.x, y: this.y };
  }
}

// --- Stamp-based brush renderer ---
const stampBrush = (ctx, x, y, brushSize, brushColor, brushOpacity, brush) => {
  ctx.save();
  ctx.globalAlpha = brushOpacity;
  ctx.translate(x, y);
  if (brush.angle) ctx.rotate((brush.angle * Math.PI) / 180);
  const half = brushSize / 2;
  const ratio = brush.ratio || 1;

  if (brush.type === 'texture' && brush._img?.complete) {
    ctx.drawImage(brush._img, -half, -half * ratio, brushSize, brushSize * ratio);
  } else {
    ctx.fillStyle = brushColor;
    ctx.beginPath();
    switch (brush.shape) {
      case 'square': ctx.rect(-half, -half, brushSize, brushSize); break;
      case 'rectangle': ctx.rect(-half, -half * ratio, brushSize, brushSize * ratio); break;
      case 'ellipse': ctx.ellipse(0, 0, half, half * ratio, 0, 0, Math.PI * 2); break;
      case 'circle': default:
        if (brush.softness) {
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
          g.addColorStop(0, brushColor);
          g.addColorStop(Math.max(0, 1 - brush.softness), brushColor);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
        }
        ctx.arc(0, 0, half, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.restore();
};

// --- Draw a stroke with quadratic bezier smoothing + pressure ---
const renderStroke = (ctx, points, strokeSize, strokeColor, strokeOpacity, isEraser, brush) => {
  if (!points || points.length < 1) return;
  ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

  const minR = brush.minSizeRatio || 0.2;
  const usePressureSize = brush.pressureSize !== false;
  const usePressureOpacity = !!brush.pressureOpacity;

  const getSize = (p) => {
    const pr = p.pressure ?? 0.5;
    return strokeSize * (usePressureSize ? minR + pr * (1 - minR) : 1);
  };
  const getOpacity = (p) => {
    const pr = p.pressure ?? 0.5;
    return strokeOpacity * (usePressureOpacity ? 0.3 + pr * 0.7 : 1);
  };

  if (brush.type === 'texture' || brush.softness > 0 || brush.shape === 'ellipse' || brush.shape === 'rectangle') {
    // Stamp-based rendering with proper spacing
    const spacing = Math.max(1, strokeSize * 0.15);
    let dist = 0;
    stampBrush(ctx, points[0].x, points[0].y, getSize(points[0]), strokeColor, getOpacity(points[0]), brush);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], curr = points[i];
      const segDist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      let d = dist;
      while (d < segDist) {
        const t = d / segDist;
        const x = prev.x + (curr.x - prev.x) * t;
        const y = prev.y + (curr.y - prev.y) * t;
        const pr = { pressure: (prev.pressure ?? 0.5) + ((curr.pressure ?? 0.5) - (prev.pressure ?? 0.5)) * t };
        stampBrush(ctx, x, y, getSize(pr), strokeColor, getOpacity(pr), brush);
        d += spacing;
      }
      dist = d - segDist;
    }
  } else {
    // Vector path with quadratic bezier smoothing + variable width
    const hasPressureVar = points.some(p => p.pressure != null && p.pressure < 0.95);

    if (hasPressureVar && usePressureSize) {
      // Segmented drawing for variable width
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1], curr = points[i];
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = getSize(curr);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.globalAlpha = getOpacity(curr);

        if (i >= 2) {
          // Quadratic bezier through midpoints for smooth curves
          const pprev = points[i - 2];
          const cpx = prev.x, cpy = prev.y;
          const endx = (prev.x + curr.x) / 2, endy = (prev.y + curr.y) / 2;
          ctx.moveTo((pprev.x + prev.x) / 2, (pprev.y + prev.y) / 2);
          ctx.quadraticCurveTo(cpx, cpy, endx, endy);
        } else {
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
        }
        ctx.stroke();
      }
    } else {
      // Fast path: single stroke with quadratic bezier
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeSize;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = strokeOpacity;

      if (points.length === 1) {
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[0].x + 0.1, points[0].y);
      } else if (points.length === 2) {
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
      } else {
        ctx.moveTo(points[0].x, points[0].y);
        const mid01x = (points[0].x + points[1].x) / 2;
        const mid01y = (points[0].y + points[1].y) / 2;
        ctx.lineTo(mid01x, mid01y);
        for (let i = 1; i < points.length - 1; i++) {
          const cpx = points[i].x, cpy = points[i].y;
          const ex = (points[i].x + points[i + 1].x) / 2;
          const ey = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
};


// ======================== COMPONENT ========================
const DrawingCanvas = ({ pageWidth, pageHeight }) => {
  const { state, dispatch, currentPage } = useStudio();
  // Canvas refs: baked (finished strokes), active (current stroke), and main visible
  const bakedRef = useRef(null);
  const activeRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef([]);
  const lazyRef = useRef(new LazyStabilizer(6));
  const textureCache = useRef(new Map());
  const rafRef = useRef(null);
  const needsRedrawRef = useRef(false);

  // Two-phase tool state (speedlines, focuslines, gradient: click origin → drag → release)
  const [twoPhaseOrigin, setTwoPhaseOrigin] = useState(null);
  const twoPhaseOriginRef = useRef(null);

  const { tool, color, size, opacity, brushId } = state.drawing;
  const isEraser = tool === 'eraser';
  const stabilization = state.drawing.stabilization ?? 5;
  const currentBrush = state.brushes?.find(b => b.id === brushId) || state.brushes?.[0] || { shape: 'circle' };
  const isTwoPhaseTool = tool === 'speedlines' || tool === 'focuslines' || tool === 'gradient';

  // Preload texture images
  const getBrushWithTexture = useCallback((brush) => {
    if (brush.type === 'texture' && brush.textureData) {
      if (!textureCache.current.has(brush.id)) {
        const img = new Image();
        img.src = brush.textureData;
        textureCache.current.set(brush.id, img);
      }
      return { ...brush, _img: textureCache.current.get(brush.id) };
    }
    return brush;
  }, []);

  // === BAKE all finished strokes onto the baked canvas ===
  const bakeStrokes = useCallback(() => {
    const baked = bakedRef.current;
    if (!baked) return;
    const ctx = baked.getContext('2d');
    ctx.clearRect(0, 0, pageWidth, pageHeight);
    // Flatten all visible layers' strokes for rendering (bottom to top)
    const allStrokes = (currentPage?.layers || [])
      .filter(layer => layer.visible)
      .flatMap(layer => {
        return (layer.strokes || []).map(s => ({ ...s, _layerOpacity: layer.opacity, _layerBlend: layer.blendMode }));
      });
    if (allStrokes.length > 0) {
      allStrokes.forEach(stroke => {
        // Special stroke types
        if (stroke.type === 'fill' || stroke.type === 'screentone') {
          // Render stored image
          if (stroke.imageData && stroke.bounds) {
            let img = fillImageCache.current.get(stroke.id);
            if (!img) {
              img = new Image();
              img.src = stroke.imageData;
              fillImageCache.current.set(stroke.id, img);
            }
            if (img.complete) {
              ctx.globalAlpha = stroke.opacity ?? 1;
              ctx.drawImage(img, stroke.bounds.x, stroke.bounds.y, stroke.bounds.w, stroke.bounds.h);
              ctx.globalAlpha = 1;
            } else {
              img.onload = () => bakeStrokes(); // re-bake when image loads
            }
          }
          return;
        }

        if (stroke.type === 'compound' && stroke.subStrokes) {
          // Render each sub-stroke (speed lines, focus lines)
          stroke.subStrokes.forEach(sub => {
            const subBrush = { shape: 'circle', pressureSize: true, minSizeRatio: 0.05 };
            renderStroke(ctx, sub.points, sub.size, sub.color, sub.opacity, false, subBrush);
          });
          return;
        }

        if (stroke.type === 'gradient') {
          const grad = stroke.gradientType === 'radial'
            ? ctx.createRadialGradient(stroke.startX, stroke.startY, 0, stroke.startX, stroke.startY, Math.hypot(stroke.endX - stroke.startX, stroke.endY - stroke.startY))
            : ctx.createLinearGradient(stroke.startX, stroke.startY, stroke.endX, stroke.endY);
          grad.addColorStop(0, stroke.color1 || stroke.color);
          grad.addColorStop(1, stroke.color2 || 'transparent');
          ctx.fillStyle = grad;
          ctx.globalAlpha = stroke.opacity ?? 1;
          ctx.fillRect(0, 0, pageWidth, pageHeight);
          ctx.globalAlpha = 1;
          return;
        }

        // Standard strokes
        const brush = state.brushes?.find(b => b.id === stroke.brushId) || { shape: 'circle' };
        const b = getBrushWithTexture(brush);
        if (stroke.alphaLock) ctx.globalCompositeOperation = 'source-atop';
        renderStroke(ctx, stroke.points, stroke.size, stroke.color, stroke.opacity, stroke.isEraser, b);
        if (stroke.alphaLock) ctx.globalCompositeOperation = 'source-over';
      });
    }
  }, [currentPage, pageWidth, pageHeight, state.brushes, getBrushWithTexture]);

  // Rebake when page/strokes change (undo/redo/page switch)
  useEffect(() => { bakeStrokes(); }, [bakeStrokes]);

  // Helper: draw ONE segment incrementally (last 2 points) — immediate visual feedback
  const drawSegment = useCallback((ctx, prev, curr, strokeColor, strokeSize, strokeOpacity, eraserMode, brush) => {
    ctx.globalCompositeOperation = eraserMode ? 'destination-out' : 'source-over';
    const minR = brush.minSizeRatio || 0.2;
    const pressure = curr.pressure ?? 0.5;
    const pSize = strokeSize * (brush.pressureSize !== false ? minR + pressure * (1 - minR) : 1);
    const pOpacity = strokeOpacity * (brush.pressureOpacity ? 0.3 + pressure * 0.7 : 1);

    if (brush.type === 'texture' || brush.softness > 0 || brush.shape === 'ellipse' || brush.shape === 'rectangle') {
      stampBrush(ctx, curr.x, curr.y, pSize, strokeColor, pOpacity, brush);
    } else {
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = pSize;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = pOpacity;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // Canvas position helper — accounts for rotation, zoom, flip
  const getCanvasPos = useCallback((e) => {
    const baked = bakedRef.current;
    if (!baked) return { x: 0, y: 0, pressure: 0.5 };
    const rect = baked.getBoundingClientRect();

    // If canvas is rotated, we need inverse rotation
    const rotation = state.canvasRotation || 0;
    if (rotation !== 0) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rad = -(rotation * Math.PI) / 180;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const rx = dx * Math.cos(rad) - dy * Math.sin(rad) + centerX;
      const ry = dx * Math.sin(rad) + dy * Math.cos(rad) + centerY;
      return {
        x: (rx - rect.left) * (baked.width / rect.width),
        y: (ry - rect.top) * (baked.height / rect.height),
        pressure: Math.max(0.01, e.pressure ?? 0.5),
      };
    }

    return {
      x: (e.clientX - rect.left) * (baked.width / rect.width),
      y: (e.clientY - rect.top) * (baked.height / rect.height),
      pressure: Math.max(0.01, e.pressure ?? 0.5),
    };
  }, [state.canvasRotation]);

  // --- EYEDROPPER (pick color from canvas) ---
  const pickColor = useCallback((e) => {
    const baked = bakedRef.current;
    if (!baked) return;
    const pos = getCanvasPos(e);
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);
    if (x < 0 || x >= baked.width || y < 0 || y >= baked.height) return;
    const ctx = baked.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
      dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { color: hex } });
    }
  }, [dispatch, getCanvasPos]);

  // --- FLOOD FILL with gap closing — stores result as stroke image ---
  const floodFill = useCallback((e) => {
    const baked = bakedRef.current;
    if (!baked) return;
    const pos = getCanvasPos(e);
    const sx = Math.round(pos.x), sy = Math.round(pos.y);
    const w = baked.width, h = baked.height;
    if (w * h > 2000 * 2000 || sx < 0 || sx >= w || sy < 0 || sy >= h) return;

    // Work on a copy so we don't modify baked directly
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = w; tmpCanvas.height = h;
    const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
    tmpCtx.drawImage(baked, 0, 0);

    const imgData = tmpCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const tolerance = 32;
    const gapSize = state.drawing.fillGapSize || 0;

    const idx = (sy * w + sx) * 4;
    const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2], ta = data[idx + 3];
    const fr = parseInt(color.slice(1, 3), 16);
    const fg = parseInt(color.slice(3, 5), 16);
    const fb = parseInt(color.slice(5, 7), 16);
    if (Math.abs(tr - fr) < 5 && Math.abs(tg - fg) < 5 && Math.abs(tb - fb) < 5 && ta > 240) return;

    // Track fill bounds for efficient storage
    let fMinX = w, fMinY = h, fMaxX = 0, fMaxY = 0;
    const markFill = (cx, cy) => {
      if (cx < fMinX) fMinX = cx; if (cx > fMaxX) fMaxX = cx;
      if (cy < fMinY) fMinY = cy; if (cy > fMaxY) fMaxY = cy;
    };

    if (gapSize > 0) {
      const dilated = new Uint8Array(w * h);
      for (let y2 = 0; y2 < h; y2++) {
        for (let x2 = 0; x2 < w; x2++) {
          if (data[(y2 * w + x2) * 4 + 3] > 128) {
            for (let dy = -gapSize; dy <= gapSize; dy++) {
              for (let dx = -gapSize; dx <= gapSize; dx++) {
                const nx = x2 + dx, ny = y2 + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) dilated[ny * w + nx] = 1;
              }
            }
          }
        }
      }
      const visited = new Uint8Array(w * h);
      const stack = [[sx, sy]];
      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
        const pi = cy * w + cx;
        if (visited[pi] || dilated[pi]) continue;
        visited[pi] = 1;
        const di = pi * 4;
        data[di] = fr; data[di + 1] = fg; data[di + 2] = fb; data[di + 3] = 255;
        markFill(cx, cy);
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
    } else {
      const matches = (i) => Math.abs(data[i] - tr) <= tolerance && Math.abs(data[i + 1] - tg) <= tolerance && Math.abs(data[i + 2] - tb) <= tolerance && Math.abs(data[i + 3] - ta) <= tolerance;
      const visited = new Uint8Array(w * h);
      const stack = [[sx, sy]];
      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
        const pi = cy * w + cx;
        if (visited[pi]) continue;
        const di = pi * 4;
        if (!matches(di)) continue;
        visited[pi] = 1;
        data[di] = fr; data[di + 1] = fg; data[di + 2] = fb; data[di + 3] = 255;
        markFill(cx, cy);
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
    }

    if (fMaxX < fMinX) return; // nothing filled

    // Extract just the filled region as an image
    tmpCtx.putImageData(imgData, 0, 0);
    const regionW = fMaxX - fMinX + 1, regionH = fMaxY - fMinY + 1;
    const regionCanvas = document.createElement('canvas');
    regionCanvas.width = regionW; regionCanvas.height = regionH;
    const regionCtx = regionCanvas.getContext('2d');
    regionCtx.drawImage(tmpCanvas, fMinX, fMinY, regionW, regionH, 0, 0, regionW, regionH);

    // Store as a special fill stroke
    dispatch({
      type: ACTIONS.ADD_STROKE,
      payload: {
        type: 'fill',
        imageData: regionCanvas.toDataURL('image/png'),
        bounds: { x: fMinX, y: fMinY, w: regionW, h: regionH },
        color, points: [{ x: sx, y: sy }], size: 1, opacity: 1,
        isEraser: false, tool: 'fill', brushId: 'round',
      }
    });
  }, [color, dispatch, getCanvasPos, state.drawing.fillGapSize]);

  // --- POINTER HANDLERS ---
  const handlePointerDown = useCallback((e) => {
    if (state.activeTool !== 'draw' || e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();

    const pos = getCanvasPos(e);

    // === SINGLE-CLICK TOOLS ===
    if (tool === 'eyedropper') { pickColor(e); return; }
    if (tool === 'fill') { floodFill(e); return; }

    // === TWO-PHASE TOOLS (click origin → drag → release to commit) ===
    if (isTwoPhaseTool) {
      e.target.setPointerCapture(e.pointerId);
      twoPhaseOriginRef.current = pos;
      setTwoPhaseOrigin(pos);
      isDrawingRef.current = true;
      currentStrokeRef.current = [pos];
      return;
    }

    // === SCREENTONE (paint-like: accumulate region then apply) ===
    if (tool === 'screentone') {
      e.target.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [pos];
      needsRedrawRef.current = true;
      return;
    }

    // === STANDARD DRAWING TOOLS (brush, pencil, marker, eraser) ===
    e.target.setPointerCapture(e.pointerId);
    lazyRef.current.setRadius(stabilization * 2);
    lazyRef.current.reset();
    const smoothed = lazyRef.current.update(pos.x, pos.y);
    const sPos = { ...smoothed, pressure: pos.pressure };

    isDrawingRef.current = true;
    currentStrokeRef.current = [sPos];

    // Draw first stamp immediately for instant feedback
    const targetCanvas = isEraser ? bakedRef.current : activeRef.current;
    if (targetCanvas) {
      const ctx = targetCanvas.getContext('2d');
      const brush = getBrushWithTexture(currentBrush);
      stampBrush(ctx, sPos.x, sPos.y,
        size * (brush.pressureSize !== false ? (brush.minSizeRatio || 0.2) + sPos.pressure * (1 - (brush.minSizeRatio || 0.2)) : 1),
        isEraser ? 'white' : color,
        opacity * (brush.pressureOpacity ? 0.3 + sPos.pressure * 0.7 : 1),
        brush);
    }
  }, [state.activeTool, tool, getCanvasPos, stabilization, pickColor, floodFill, isTwoPhaseTool]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e);

    // Two-phase tools: preview on active canvas
    if (isTwoPhaseTool && twoPhaseOriginRef.current) {
      const origin = twoPhaseOriginRef.current;
      const actCtx = activeRef.current?.getContext('2d');
      if (!actCtx) return;
      actCtx.clearRect(0, 0, pageWidth, pageHeight);

      if (tool === 'gradient') {
        const grad = state.drawing.gradientType === 'radial'
          ? actCtx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, Math.hypot(pos.x - origin.x, pos.y - origin.y))
          : actCtx.createLinearGradient(origin.x, origin.y, pos.x, pos.y);
        grad.addColorStop(0, color);
        grad.addColorStop(1, state.drawing.gradientSecondColor || 'transparent');
        actCtx.fillStyle = grad;
        actCtx.globalAlpha = opacity;
        actCtx.fillRect(0, 0, pageWidth, pageHeight);
        actCtx.globalAlpha = 1;
      } else {
        // Speed/Focus lines preview: show direction line
        actCtx.strokeStyle = color;
        actCtx.lineWidth = 1;
        actCtx.setLineDash([6, 4]);
        actCtx.globalAlpha = 0.5;
        actCtx.beginPath();
        actCtx.moveTo(origin.x, origin.y);
        actCtx.lineTo(pos.x, pos.y);
        actCtx.stroke();
        actCtx.setLineDash([]);
        actCtx.globalAlpha = 1;
        // Show radius circle for focus lines
        if (tool === 'focuslines') {
          const r = Math.hypot(pos.x - origin.x, pos.y - origin.y);
          actCtx.beginPath();
          actCtx.arc(origin.x, origin.y, r, 0, Math.PI * 2);
          actCtx.stroke();
        }
      }
      currentStrokeRef.current = [origin, pos];
      return;
    }

    // Screentone: accumulate stroke path (preview as outline)
    if (tool === 'screentone') {
      currentStrokeRef.current.push(pos);
      // Draw outline preview on active canvas
      const actCtx = activeRef.current?.getContext('2d');
      if (actCtx && currentStrokeRef.current.length >= 2) {
        const pts = currentStrokeRef.current;
        actCtx.clearRect(0, 0, pageWidth, pageHeight);
        actCtx.strokeStyle = color;
        actCtx.lineWidth = 1;
        actCtx.setLineDash([4, 4]);
        actCtx.globalAlpha = 0.6;
        actCtx.beginPath();
        actCtx.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => actCtx.lineTo(p.x, p.y));
        actCtx.closePath();
        actCtx.stroke();
        actCtx.setLineDash([]);
        actCtx.globalAlpha = 1;
      }
      return;
    }

    // === STANDARD DRAWING: incremental segment rendering (instant feedback) ===
    const events = e.getCoalescedEvents?.() ?? [e];
    // Eraser draws directly on baked canvas, others on active canvas
    const targetCanvas = isEraser ? bakedRef.current : activeRef.current;
    if (!targetCanvas) return;
    const ctx = targetCanvas.getContext('2d');
    const brush = getBrushWithTexture(currentBrush);

    for (const ce of events) {
      const rawPos = getCanvasPos(ce);
      const smoothed = lazyRef.current.update(rawPos.x, rawPos.y);
      const newPoint = { ...smoothed, pressure: rawPos.pressure };
      const prevPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
      currentStrokeRef.current.push(newPoint);

      // Draw this segment immediately
      if (prevPoint) {
        drawSegment(ctx, prevPoint, newPoint, isEraser ? 'white' : color, size, opacity, isEraser, brush);
      }
    }
  }, [getCanvasPos, isTwoPhaseTool, tool, color, opacity, pageWidth, pageHeight, state.drawing.gradientType, state.drawing.gradientSecondColor]);

  // --- Image cache for fill/screentone strokes ---
  const fillImageCache = useRef(new Map());

  // --- Mirror points for symmetry ---
  const mirrorPoints = useCallback((points, mode) => {
    const result = [];
    for (const p of points) {
      if (mode === 'vertical' || mode === 'both') {
        result.push({ x: pageWidth - p.x, y: p.y, pressure: p.pressure });
      }
      if (mode === 'horizontal' || mode === 'both') {
        result.push({ x: p.x, y: pageHeight - p.y, pressure: p.pressure });
      }
      if (mode === 'both') {
        result.push({ x: pageWidth - p.x, y: pageHeight - p.y, pressure: p.pressure });
      }
    }
    return result;
  }, [pageWidth, pageHeight]);

  const handlePointerUp = useCallback((e) => {
    if (!isDrawingRef.current) return;
    try { e?.target?.releasePointerCapture(e.pointerId); } catch {}
    isDrawingRef.current = false;

    const points = [...currentStrokeRef.current];
    currentStrokeRef.current = [];
    if (activeRef.current) activeRef.current.getContext('2d').clearRect(0, 0, pageWidth, pageHeight);

    if (points.length < 1) return;

    // === TWO-PHASE TOOLS: commit on release ===
    if (isTwoPhaseTool && twoPhaseOriginRef.current && points.length >= 2) {
      const origin = twoPhaseOriginRef.current;
      const endPos = points[points.length - 1];
      twoPhaseOriginRef.current = null;
      setTwoPhaseOrigin(null);

      if (tool === 'speedlines') {
        const angle = Math.atan2(endPos.y - origin.y, endPos.x - origin.x);
        const length = Math.hypot(endPos.x - origin.x, endPos.y - origin.y);
        const lines = generateSpeedLines(origin.x, origin.y, angle, length, {
          count: state.drawing.speedlinesCount, spreadAngle: state.drawing.speedlinesSpread,
          minThick: state.drawing.speedlinesMinThick, maxThick: state.drawing.speedlinesMaxThick,
          color, opacity,
        }, pageWidth, pageHeight);
        // Store all lines as a compound stroke (1 undo entry)
        dispatch({ type: ACTIONS.ADD_STROKE, payload: {
          type: 'compound', subStrokes: lines,
          points: [origin, endPos], color, size: 1, opacity, isEraser: false,
          tool: 'speedlines', brushId: 'round',
        }});
        return;
      }

      if (tool === 'focuslines') {
        const innerRadius = Math.hypot(endPos.x - origin.x, endPos.y - origin.y);
        const lines = generateFocusLines(origin.x, origin.y, innerRadius, {
          count: state.drawing.focuslinesCount,
          minThick: state.drawing.focuslinesMinThick, maxThick: state.drawing.focuslinesMaxThick,
          color, opacity,
        }, pageWidth, pageHeight);
        dispatch({ type: ACTIONS.ADD_STROKE, payload: {
          type: 'compound', subStrokes: lines,
          points: [origin, endPos], color, size: 1, opacity, isEraser: false,
          tool: 'focuslines', brushId: 'round',
        }});
        return;
      }

      if (tool === 'gradient') {
        dispatch({ type: ACTIONS.ADD_STROKE, payload: {
          type: 'gradient',
          gradientType: state.drawing.gradientType || 'linear',
          startX: origin.x, startY: origin.y, endX: endPos.x, endY: endPos.y,
          color1: color, color2: state.drawing.gradientSecondColor || 'transparent',
          points: [origin, endPos], color, size: 1, opacity, isEraser: false,
          tool: 'gradient', brushId: 'round',
        }});
        return;
      }
    }

    // === SCREENTONE: apply pattern to painted region ===
    if (tool === 'screentone' && points.length >= 3) {
      const result = renderScreentoneRegion(points, pageWidth, pageHeight, {
        lpi: state.drawing.screentoneLPI, density: state.drawing.screentoneDensity,
        angle: state.drawing.screentoneAngle, shape: state.drawing.screentoneShape,
        color,
      });
      if (result) {
        dispatch({ type: ACTIONS.ADD_STROKE, payload: {
          type: 'screentone',
          imageData: result.imageData, bounds: result.bounds,
          points, color, size: 1, opacity, isEraser: false,
          tool: 'screentone', brushId: 'round',
        }});
      }
      return;
    }

    // === STANDARD DRAWING TOOLS ===
    let finalPoints = points;

    // Shape correction
    if (state.drawing.shapeCorrection && finalPoints.length >= 3) {
      const detection = detectShape(finalPoints);
      if (detection.type !== 'none' && detection.confidence > 0.8) {
        finalPoints = detection.correctedPoints;
      }
    }

    const basePayload = {
      points: finalPoints, color: isEraser ? 'white' : color,
      size, opacity, isEraser, tool, brushId: currentBrush.id,
      alphaLock: !!state.drawing.alphaLock,
    };

    dispatch({ type: ACTIONS.ADD_STROKE, payload: basePayload });

    // Symmetry
    const symMode = state.drawing.symmetryMode;
    if (symMode && symMode !== 'off') {
      if (symMode === 'vertical' || symMode === 'both') {
        dispatch({ type: ACTIONS.ADD_STROKE, payload: { ...basePayload, points: finalPoints.map(p => ({ x: pageWidth - p.x, y: p.y, pressure: p.pressure })) } });
      }
      if (symMode === 'horizontal' || symMode === 'both') {
        dispatch({ type: ACTIONS.ADD_STROKE, payload: { ...basePayload, points: finalPoints.map(p => ({ x: p.x, y: pageHeight - p.y, pressure: p.pressure })) } });
      }
      if (symMode === 'both') {
        dispatch({ type: ACTIONS.ADD_STROKE, payload: { ...basePayload, points: finalPoints.map(p => ({ x: pageWidth - p.x, y: pageHeight - p.y, pressure: p.pressure })) } });
      }
    }
  }, [dispatch, color, size, opacity, isEraser, tool, currentBrush, pageWidth, pageHeight, state.drawing, isTwoPhaseTool]);

  // Global up fallback
  useEffect(() => {
    const up = (e) => { if (isDrawingRef.current) handlePointerUp(e); };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [handlePointerUp]);

  // Cursor tracking
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const isDrawMode = state.activeTool === 'draw';

  const handleCursorMove = useCallback((e) => {
    if (!isDrawMode) return;
    const pos = getCanvasPos(e);
    setCursorPos({ x: pos.x, y: pos.y, visible: true });
  }, [isDrawMode, getCanvasPos]);

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
