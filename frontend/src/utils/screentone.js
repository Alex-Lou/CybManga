// ============================================
// SumiWire PRO — Screentone / Halftone Pattern Generator
// ============================================

const tileCache = new Map();

/**
 * Generate a screentone pattern tile (small repeating unit).
 * Returns an OffscreenCanvas or regular Canvas element.
 */
function generateTile(lpi, density, angle, shape, color) {
  const key = `${lpi}-${density}-${angle}-${shape}-${color}`;
  if (tileCache.has(key)) return tileCache.get(key);

  // Tile size based on LPI (at 96 DPI screen)
  const cellSize = Math.max(4, Math.round(96 / lpi));
  const tileSize = cellSize * 4; // 4x4 cells per tile for rotation to work

  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext('2d');

  ctx.save();
  // Rotate the pattern
  ctx.translate(tileSize / 2, tileSize / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-tileSize / 2, -tileSize / 2);

  const maxRadius = cellSize * 0.45;
  const radius = maxRadius * (density / 100);

  ctx.fillStyle = color;

  for (let row = -2; row < tileSize / cellSize + 2; row++) {
    for (let col = -2; col < tileSize / cellSize + 2; col++) {
      const cx = col * cellSize + cellSize / 2;
      const cy = row * cellSize + cellSize / 2;

      ctx.beginPath();
      switch (shape) {
        case 'line':
          ctx.rect(cx - cellSize / 2, cy - radius, cellSize, radius * 2);
          break;
        case 'cross':
          ctx.rect(cx - radius, cy - cellSize / 2, radius * 2, cellSize);
          ctx.rect(cx - cellSize / 2, cy - radius, cellSize, radius * 2);
          break;
        case 'dot':
        default:
          ctx.arc(cx, cy, Math.max(0.5, radius), 0, Math.PI * 2);
          break;
      }
      ctx.fill();
    }
  }
  ctx.restore();

  // Cache for performance
  if (tileCache.size > 50) {
    const firstKey = tileCache.keys().next().value;
    tileCache.delete(firstKey);
  }
  tileCache.set(key, canvas);
  return canvas;
}

/**
 * Paint screentone pattern into a region defined by stroke points.
 * Returns a dataURL of the result for storage as a stroke.
 */
export function renderScreentoneRegion(points, pageW, pageH, params) {
  const { lpi = 55, density = 30, angle = 45, shape = 'dot', color = '#000000' } = params;

  // Find bounding box of the stroke
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  minX = Math.max(0, Math.floor(minX) - 5);
  minY = Math.max(0, Math.floor(minY) - 5);
  maxX = Math.min(pageW, Math.ceil(maxX) + 5);
  maxY = Math.min(pageH, Math.ceil(maxY) + 5);

  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= 0 || h <= 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Create clipping mask from stroke points
  ctx.beginPath();
  ctx.moveTo(points[0].x - minX, points[0].y - minY);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x - minX, points[i].y - minY);
  }
  ctx.closePath();
  ctx.clip();

  // Fill with screentone pattern
  const tile = generateTile(lpi, density, angle, shape, color);
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);

  return {
    imageData: canvas.toDataURL('image/png'),
    bounds: { x: minX, y: minY, w, h },
  };
}
