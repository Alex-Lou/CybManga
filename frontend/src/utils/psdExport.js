// ============================================
// SumiWire PRO — PSD Export
// Save current page as PSD with layers preserved
// Uses ag-psd (read AND write)
// ============================================

import { writePsd } from 'ag-psd';
import { PAGE_FORMATS } from './constants';

/**
 * Export the current page as a PSD file with layers.
 * Each stroke/drawing becomes a separate PSD layer.
 * @param {object} page - Current page object from state
 * @param {string} format - Page format key (e.g. 'a4')
 * @param {HTMLCanvasElement} bakedCanvas - The baked canvas with all strokes rendered
 * @param {string} projectName - Name for the file
 */
export async function exportAsPsd(page, format, bakedCanvas, projectName) {
  const pageFormat = PAGE_FORMATS[format] || PAGE_FORMATS['a4'];
  const width = pageFormat.width;
  const height = pageFormat.height;

  // Build PSD layer tree
  const children = [];

  // Layer 1: Background (white)
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  const bgCtx = bgCanvas.getContext('2d');
  bgCtx.fillStyle = '#ffffff';
  bgCtx.fillRect(0, 0, width, height);

  children.push({
    name: 'Background',
    canvas: bgCanvas,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    opacity: 1,
    hidden: false,
  });

  // Layer 2: Panels (each panel as a separate layer)
  for (let i = 0; i < (page.panels || []).length; i++) {
    const panel = page.panels[i];
    const panelCanvas = document.createElement('canvas');
    panelCanvas.width = width;
    panelCanvas.height = height;
    const pCtx = panelCanvas.getContext('2d');

    // Draw panel background + border
    pCtx.fillStyle = panel.backgroundColor || '#ffffff';
    pCtx.fillRect(panel.x, panel.y, panel.width, panel.height);
    if (panel.borderWidth > 0) {
      pCtx.strokeStyle = panel.borderColor || '#000000';
      pCtx.lineWidth = panel.borderWidth || 2;
      pCtx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    }

    // Draw panel image if exists
    if (panel.image) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = panel.image;
        });
        const sx = panel.imageScaleX || 1;
        const sy = panel.imageScaleY || 1;
        pCtx.save();
        pCtx.beginPath();
        pCtx.rect(panel.x, panel.y, panel.width, panel.height);
        pCtx.clip();
        pCtx.globalAlpha = panel.imageOpacity ?? 1;
        pCtx.drawImage(img,
          panel.x + (panel.imageX || 0),
          panel.y + (panel.imageY || 0),
          (panel.originalImageWidth || img.width) * sx,
          (panel.originalImageHeight || img.height) * sy
        );
        pCtx.restore();
      } catch {}
    }

    children.push({
      name: panel.name || `Case ${i + 1}`,
      canvas: panelCanvas,
      left: 0, top: 0, right: width, bottom: height,
      opacity: 1,
      hidden: false,
    });
  }

  // Layer 3: All drawings (baked canvas = merged strokes)
  if (bakedCanvas) {
    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = width;
    drawCanvas.height = height;
    const dCtx = drawCanvas.getContext('2d');
    dCtx.drawImage(bakedCanvas, 0, 0);

    children.push({
      name: 'Dessin (Ink)',
      canvas: drawCanvas,
      left: 0, top: 0, right: width, bottom: height,
      opacity: 1,
      hidden: false,
    });
  }

  // Layer 4: Bubbles text (rendered as raster)
  if (page.bubbles && page.bubbles.length > 0) {
    const bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.width = width;
    bubbleCanvas.height = height;
    const bCtx = bubbleCanvas.getContext('2d');

    for (const bubble of page.bubbles) {
      // Simple text rendering for PSD export
      bCtx.fillStyle = bubble.backgroundColor || '#ffffff';
      bCtx.globalAlpha = 0.9;
      bCtx.beginPath();
      bCtx.ellipse(
        bubble.x + bubble.width / 2,
        bubble.y + bubble.height / 2,
        bubble.width / 2,
        bubble.height / 2,
        0, 0, Math.PI * 2
      );
      bCtx.fill();
      bCtx.strokeStyle = bubble.borderColor || '#000000';
      bCtx.lineWidth = bubble.borderWidth || 2;
      bCtx.stroke();
      bCtx.globalAlpha = 1;

      if (bubble.text) {
        bCtx.fillStyle = bubble.textColor || '#000000';
        bCtx.font = `${bubble.fontWeight || 'normal'} ${bubble.fontSize || 16}px ${bubble.fontFamily || 'sans-serif'}`;
        bCtx.textAlign = bubble.textAlign || 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(bubble.text, bubble.x + bubble.width / 2, bubble.y + bubble.height / 2, bubble.width - 20);
      }
    }

    children.push({
      name: 'Bulles (Text)',
      canvas: bubbleCanvas,
      left: 0, top: 0, right: width, bottom: height,
      opacity: 1,
      hidden: false,
    });
  }

  // Build PSD document
  const psd = {
    width,
    height,
    children,
  };

  // Write PSD binary
  const psdBuffer = writePsd(psd);

  // Download
  const blob = new Blob([psdBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName || 'SumiWire-Export'}.psd`;
  a.click();
  URL.revokeObjectURL(url);

  return children.length;
}
