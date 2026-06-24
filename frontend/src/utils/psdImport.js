// ============================================
// SumiWire PRO — Adobe PSD Import
// Supports PSD files from Adobe Fresco, Photoshop, Clip Studio (via PSD export)
// Uses ag-psd library
// ============================================

import { readPsd } from 'ag-psd';
import { generateId } from './helpers';

/**
 * Import a PSD file and convert it to SumiWire page data.
 * Each PSD layer becomes a drawing stroke (rasterized as image).
 * @param {File} file - The .psd file from file input
 * @returns {Promise<{ page: object, info: string }>}
 */
export async function importPsdFile(file) {
  const buffer = await file.arrayBuffer();
  const psd = readPsd(new Uint8Array(buffer));

  const pageWidth = psd.width;
  const pageHeight = psd.height;

  // Determine closest page format
  const format = detectFormat(pageWidth, pageHeight);

  // Extract layers as image strokes
  const drawings = [];
  const layerNames = [];

  function extractLayers(children, depth = 0) {
    if (!children) return;
    for (const layer of children) {
      // Skip hidden layers
      if (layer.hidden) continue;

      // Groups/folders: recurse
      if (layer.children) {
        extractLayers(layer.children, depth + 1);
        continue;
      }

      // Raster layer: extract as image
      if (layer.canvas) {
        try {
          const dataUrl = layer.canvas.toDataURL('image/png');
          const x = layer.left || 0;
          const y = layer.top || 0;
          const w = (layer.right || pageWidth) - x;
          const h = (layer.bottom || pageHeight) - y;

          drawings.push({
            id: generateId(),
            type: 'fill',
            imageData: dataUrl,
            bounds: { x, y, w, h },
            color: '#000000',
            points: [{ x: x + w / 2, y: y + h / 2 }],
            size: 1,
            opacity: layer.opacity ?? 1,
            isEraser: false,
            tool: 'import',
            brushId: 'round',
            layerName: layer.name || `Layer ${drawings.length + 1}`,
          });

          layerNames.push(layer.name || `Layer ${drawings.length}`);
        } catch (err) {
          console.warn('Failed to extract layer:', layer.name, err);
        }
      }
    }
  }

  extractLayers(psd.children);

  // If no layers extracted, try the composite image
  if (drawings.length === 0 && psd.canvas) {
    const dataUrl = psd.canvas.toDataURL('image/png');
    drawings.push({
      id: generateId(),
      type: 'fill',
      imageData: dataUrl,
      bounds: { x: 0, y: 0, w: pageWidth, h: pageHeight },
      color: '#000000',
      points: [{ x: pageWidth / 2, y: pageHeight / 2 }],
      size: 1, opacity: 1,
      isEraser: false, tool: 'import', brushId: 'round',
      layerName: 'Composite',
    });
    layerNames.push('Composite');
  }

  const page = {
    id: generateId(),
    format,
    panels: [],
    bubbles: [],
    drawings,
    locked: false,
    position: null,
  };

  const info = `${psd.width}×${psd.height}px — ${layerNames.length} layer(s): ${layerNames.join(', ')}`;

  return { page, info, width: pageWidth, height: pageHeight };
}

function detectFormat(w, h) {
  // Match against known formats (approximate)
  const formats = {
    'a4': { w: 794, h: 1123 },
    'us-comic': { w: 680, h: 1032 },
    'manga-b5': { w: 728, h: 1032 },
    'manga-tanko': { w: 653, h: 924 },
    'webtoon': { w: 800, h: 1280 },
    'square': { w: 800, h: 800 },
  };

  let bestFormat = 'a4';
  let bestDist = Infinity;

  for (const [key, size] of Object.entries(formats)) {
    const dist = Math.abs(w - size.w) + Math.abs(h - size.h);
    if (dist < bestDist) {
      bestDist = dist;
      bestFormat = key;
    }
  }
  return bestFormat;
}
