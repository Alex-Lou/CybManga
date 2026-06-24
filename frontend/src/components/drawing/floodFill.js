// ============================================
// SumiWire PRO - Remplissage par diffusion (pur) avec fermeture de gaps
// Retourne { imageData, bounds } de la région remplie, ou null si rien à remplir.
// L'appelant gère getCanvasPos / les bornes / le dispatch.
// ============================================

export const floodFillRegion = (baked, sx, sy, fillColorHex, gapSize) => {
  const w = baked.width, h = baked.height;

  // Work on a copy so we don't modify baked directly
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = w; tmpCanvas.height = h;
  const tmpCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
  tmpCtx.drawImage(baked, 0, 0);

  const imgData = tmpCtx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const tolerance = 32;

  const idx = (sy * w + sx) * 4;
  const tr = data[idx], tg = data[idx + 1], tb = data[idx + 2], ta = data[idx + 3];
  const fr = parseInt(fillColorHex.slice(1, 3), 16);
  const fg = parseInt(fillColorHex.slice(3, 5), 16);
  const fb = parseInt(fillColorHex.slice(5, 7), 16);
  if (Math.abs(tr - fr) < 5 && Math.abs(tg - fg) < 5 && Math.abs(tb - fb) < 5 && ta > 240) return null;

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

  if (fMaxX < fMinX) return null; // nothing filled

  // Extract just the filled region as an image
  tmpCtx.putImageData(imgData, 0, 0);
  const regionW = fMaxX - fMinX + 1, regionH = fMaxY - fMinY + 1;
  const regionCanvas = document.createElement('canvas');
  regionCanvas.width = regionW; regionCanvas.height = regionH;
  const regionCtx = regionCanvas.getContext('2d');
  regionCtx.drawImage(tmpCanvas, fMinX, fMinY, regionW, regionH, 0, 0, regionW, regionH);

  return {
    imageData: regionCanvas.toDataURL('image/png'),
    bounds: { x: fMinX, y: fMinY, w: regionW, h: regionH },
  };
};
