// ============================================
// SumiWire PRO - Géométrie de bulle (pure) : queue, ellipse, dimensions image
// ============================================

import { pointOnEllipse } from '../../../utils/helpers';

// Dimensions et position de l'image clippée dans la bulle.
const getImageDimensions = (bubble, naturalSize) => {
  const { width, height, imageScaleX, imageScaleY, imageX, imageY } = bubble;
  const origW = naturalSize?.w || bubble.originalImageWidth || width;
  const origH = naturalSize?.h || bubble.originalImageHeight || height;
  const scaleX = imageScaleX || 1;
  const scaleY = imageScaleY || 1;

  const displayW = origW * scaleX;
  const displayH = origH * scaleY;

  const imgX = (width / 2) - (displayW / 2) + (imageX || 0);
  const imgY = (height / 2) - (displayH / 2) + (imageY || 0);

  return { imgX, imgY, displayW, displayH };
};

/**
 * Calcule toute la géométrie d'une bulle à partir de ses props (et des
 * dimensions naturelles de l'image éventuelle). Fonction pure, sans React.
 */
export const getBubbleGeometry = (bubble, naturalSize) => {
  const {
    width, height, backgroundColor, type, image,
    tailAngle, tailWidth, tailLength,
  } = bubble;

  // === CONSTANTES ===
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const angle = tailAngle || 180;
  const tLength = tailLength !== undefined ? tailLength : 50;
  const tWidth = tailWidth || 20;

  const bgColor = type === 'narration' && backgroundColor === '#ffffff' ? '#fef9c3' : backgroundColor;
  const offset = type === 'narration' ? 0 : 250;
  const clipId = `clip-bubble-${bubble.id}`;

  // === CALCUL DE LA QUEUE ===
  const angleRad = angle * (Math.PI / 180);
  const perpAngle = angleRad + Math.PI / 2;

  // Point sur le bord de l'ellipse
  const edgePoint = pointOnEllipse(cx, cy, rx * 0.95, ry * 0.95, angle);
  // Point de la pointe de la queue
  const tipPoint = pointOnEllipse(cx, cy, rx + tLength, ry + tLength, angle);

  // Points de base de la queue (sur le bord de la forme)
  const base1 = {
    x: edgePoint.x + (tWidth / 2) * Math.cos(perpAngle),
    y: edgePoint.y + (tWidth / 2) * Math.sin(perpAngle)
  };
  const base2 = {
    x: edgePoint.x - (tWidth / 2) * Math.cos(perpAngle),
    y: edgePoint.y - (tWidth / 2) * Math.sin(perpAngle)
  };

  // === IMAGE DIMENSIONS ===
  const imageDims = image ? getImageDimensions(bubble, naturalSize) : null;

  // === SVG DIMENSIONS ===
  const svgWidth = width + (type === 'narration' ? 0 : 500);
  const svgHeight = height + (type === 'narration' ? 0 : 500);

  return {
    cx, cy, rx, ry, offset, clipId, bgColor,
    edgePoint, tipPoint, base1, base2, perpAngle,
    svgWidth, svgHeight, imageDims,
  };
};
