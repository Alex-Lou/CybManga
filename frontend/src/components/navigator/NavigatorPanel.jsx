// ============================================
// SumiWire PRO — Navigator Minimap
// Thumbnail of current page + draggable viewport rectangle
// ============================================

import React, { useRef, useEffect, useCallback } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';

const NavigatorPanel = () => {
  const { state, dispatch, currentPage, pageFormat, theme } = useStudio();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const MINI_WIDTH = 180;
  const scale = MINI_WIDTH / pageFormat.width;
  const miniHeight = Math.round(pageFormat.height * scale);

  // Render minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentPage) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MINI_WIDTH, miniHeight);

    // Background
    ctx.fillStyle = theme.page;
    ctx.fillRect(0, 0, MINI_WIDTH, miniHeight);

    ctx.save();
    ctx.scale(scale, scale);

    // Draw panels as colored rectangles
    (currentPage.panels || []).forEach(panel => {
      ctx.fillStyle = panel.backgroundColor || '#fff';
      ctx.strokeStyle = panel.borderColor || '#000';
      ctx.lineWidth = 2 / scale;
      ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
      ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    });

    // Draw strokes as simplified paths
    const allStrokes = (currentPage.layers || []).filter(l => l.visible).flatMap(l => l.strokes || []);
    allStrokes.forEach(stroke => {
      if (stroke.type === 'fill' || stroke.type === 'screentone' || stroke.type === 'gradient') return;
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color || '#000';
      ctx.lineWidth = Math.max(1, stroke.size * 0.3) / scale;
      ctx.globalAlpha = stroke.opacity ?? 1;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    ctx.restore();

    // Draw viewport rectangle
    const vpX = (-state.panOffset.x / state.zoom) * scale;
    const vpY = (-state.panOffset.y / state.zoom) * scale;
    // Approximate viewport size (assume container ~800x600)
    const vpW = (800 / state.zoom) * scale;
    const vpH = (600 / state.zoom) * scale;

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.fillStyle = theme.primary;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(vpX, vpY, vpW, vpH);
    ctx.globalAlpha = 1;
  }, [currentPage, state.zoom, state.panOffset, theme, scale, miniHeight]);

  // Click on minimap → pan to that position
  const handleClick = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;
    dispatch({
      type: ACTIONS.SET_PAN,
      payload: { x: -clickX * state.zoom + 400, y: -clickY * state.zoom + 300 },
    });
  }, [dispatch, state.zoom, scale]);

  return (
    <div ref={containerRef}
      className="absolute bottom-3 right-3 rounded-lg shadow-lg border overflow-hidden z-40"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <div className="px-2 py-1 text-xs font-mono uppercase tracking-wider border-b flex items-center justify-between"
        style={{ borderColor: theme.border, color: theme.textSecondary }}>
        <span>Navigator</span>
        <span style={{ color: theme.primary }}>{Math.round(state.zoom * 100)}%</span>
      </div>
      <canvas
        ref={canvasRef}
        width={MINI_WIDTH}
        height={miniHeight}
        onClick={handleClick}
        className="cursor-crosshair"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default NavigatorPanel;
