// ============================================
// SumiWire PRO — Speed Lines & Focus Lines Generator
// ============================================

/**
 * Generate speed lines radiating from a point in a given direction.
 * Returns an array of line objects: { points, size, color, opacity }
 */
export function generateSpeedLines(originX, originY, dirAngle, length, params, pageW, pageH) {
  const { count = 80, spreadAngle = 30, minThick = 0.3, maxThick = 3, color = '#000000', opacity = 1 } = params;
  const spreadRad = (spreadAngle * Math.PI) / 180;
  const lines = [];

  for (let i = 0; i < Math.min(count, 500); i++) {
    const angle = dirAngle + (Math.random() - 0.5) * spreadRad;
    const lineLen = length * (0.3 + Math.random() * 0.9);
    const thick = minThick + Math.random() * (maxThick - minThick);

    const endX = originX + Math.cos(angle) * lineLen;
    const endY = originY + Math.sin(angle) * lineLen;

    // Tapered line: 3 points with decreasing pressure
    lines.push({
      points: [
        { x: originX, y: originY, pressure: 0.9 + Math.random() * 0.1 },
        { x: originX + Math.cos(angle) * lineLen * 0.5, y: originY + Math.sin(angle) * lineLen * 0.5, pressure: 0.5 },
        { x: endX, y: endY, pressure: 0.05 },
      ],
      size: thick,
      color,
      opacity,
    });
  }
  return lines;
}

/**
 * Generate focus/concentration lines radiating from a center point.
 * Lines go from innerRadius to the page edges.
 */
export function generateFocusLines(centerX, centerY, innerRadius, params, pageW, pageH) {
  const { count = 120, minThick = 0.3, maxThick = 2, color = '#000000', opacity = 1 } = params;
  const lines = [];
  const outerRadius = Math.max(pageW, pageH) * 1.2;

  for (let i = 0; i < Math.min(count, 500); i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI * 2 / count) * 0.6;
    const innerR = innerRadius + (Math.random() - 0.5) * innerRadius * 0.3;
    const outerR = outerRadius + (Math.random() - 0.5) * outerRadius * 0.1;
    const thick = minThick + Math.random() * (maxThick - minThick);

    const startX = centerX + Math.cos(angle) * innerR;
    const startY = centerY + Math.sin(angle) * innerR;
    const endX = centerX + Math.cos(angle) * outerR;
    const endY = centerY + Math.sin(angle) * outerR;

    lines.push({
      points: [
        { x: startX, y: startY, pressure: 0.9 },
        { x: centerX + Math.cos(angle) * (innerR + outerR) * 0.4, y: centerY + Math.sin(angle) * (innerR + outerR) * 0.4, pressure: 0.5 },
        { x: endX, y: endY, pressure: 0.05 },
      ],
      size: thick,
      color,
      opacity,
    });
  }
  return lines;
}
