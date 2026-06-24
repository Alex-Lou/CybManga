// ============================================
// SumiWire PRO - Moteur de brush (pur, sans React)
// LazyBrush stabilizer · stamp-based renderer · bezier smoothing
// ============================================

// --- LazyBrush stabilizer (Clip Studio / Lazy Nezumi style) ---
export class LazyStabilizer {
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
export const stampBrush = (ctx, x, y, brushSize, brushColor, brushOpacity, brush) => {
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
export const renderStroke = (ctx, points, strokeSize, strokeColor, strokeOpacity, isEraser, brush) => {
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
