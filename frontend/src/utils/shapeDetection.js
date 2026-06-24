// ============================================
// SumiWire PRO — Smart Shape Detection & Correction
// Detects lines, circles, rectangles from raw strokes
// ============================================

/**
 * Detect shape from a raw stroke and return corrected points.
 * @param {Array<{x,y,pressure?}>} points - Raw stroke points
 * @returns {{ type: 'line'|'circle'|'rectangle'|'none', confidence: number, correctedPoints: Array }}
 */
export function detectShape(points) {
  if (!points || points.length < 3) return { type: 'none', confidence: 0, correctedPoints: points };

  // Performance guard: skip detection for very long strokes (>200 points = detailed drawing)
  if (points.length > 200) return { type: 'none', confidence: 0, correctedPoints: points };

  const lineResult = detectLine(points);
  const circleResult = detectCircle(points);
  const rectResult = detectRectangle(points);

  // Pick the highest confidence detection
  const candidates = [lineResult, circleResult, rectResult].filter(r => r.confidence > 0.75);
  if (candidates.length === 0) return { type: 'none', confidence: 0, correctedPoints: points };

  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}

function detectLine(points) {
  const first = points[0];
  const last = points[points.length - 1];
  const lineLen = Math.hypot(last.x - first.x, last.y - first.y);

  if (lineLen < 10) return { type: 'line', confidence: 0, correctedPoints: points };

  // Calculate perpendicular distance of each point from the line first→last
  let totalDeviation = 0;
  const dx = last.x - first.x;
  const dy = last.y - first.y;

  for (const p of points) {
    const dist = Math.abs(dy * p.x - dx * p.y + last.x * first.y - last.y * first.x) / lineLen;
    totalDeviation += dist;
  }

  const avgDeviation = totalDeviation / points.length;
  const confidence = Math.max(0, 1 - (avgDeviation / lineLen) * 10);

  return {
    type: 'line',
    confidence,
    correctedPoints: [
      { x: first.x, y: first.y, pressure: first.pressure ?? 0.5 },
      { x: last.x, y: last.y, pressure: last.pressure ?? 0.5 },
    ],
  };
}

function detectCircle(points) {
  // Compute centroid
  let cx = 0, cy = 0;
  for (const p of points) { cx += p.x; cy += p.y; }
  cx /= points.length;
  cy /= points.length;

  // Compute mean radius and standard deviation
  let totalR = 0;
  const radii = [];
  for (const p of points) {
    const r = Math.hypot(p.x - cx, p.y - cy);
    radii.push(r);
    totalR += r;
  }
  const meanR = totalR / points.length;

  if (meanR < 5) return { type: 'circle', confidence: 0, correctedPoints: points };

  let variance = 0;
  for (const r of radii) variance += (r - meanR) ** 2;
  const stddev = Math.sqrt(variance / points.length);

  // Check if stroke is closed (first and last point close together)
  const closedDist = Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);
  const isClosed = closedDist < meanR * 0.5;

  const radiusConsistency = 1 - stddev / meanR;
  const confidence = isClosed ? radiusConsistency : radiusConsistency * 0.6;

  // Generate corrected circle (64 points)
  const correctedPoints = [];
  const numPoints = 64;
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    correctedPoints.push({
      x: cx + Math.cos(angle) * meanR,
      y: cy + Math.sin(angle) * meanR,
      pressure: 0.5,
    });
  }

  return { type: 'circle', confidence: Math.max(0, confidence), correctedPoints };
}

function detectRectangle(points) {
  if (points.length < 8) return { type: 'rectangle', confidence: 0, correctedPoints: points };

  // Find corners: points where angle changes sharply
  const corners = [];
  const angleThreshold = Math.PI / 4; // 45 degrees

  for (let i = 2; i < points.length - 2; i++) {
    const prev = points[i - 2];
    const curr = points[i];
    const next = points[i + 2];

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let angleDiff = Math.abs(angle2 - angle1);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

    if (angleDiff > angleThreshold) {
      // Check not too close to previous corner
      if (corners.length === 0 || Math.hypot(curr.x - corners[corners.length - 1].x, curr.y - corners[corners.length - 1].y) > 15) {
        corners.push(curr);
      }
    }
  }

  if (corners.length < 3 || corners.length > 6) {
    return { type: 'rectangle', confidence: 0, correctedPoints: points };
  }

  // Take first 4 corners (or use bounding box if 3)
  const usedCorners = corners.slice(0, 4);

  if (usedCorners.length < 4) {
    // Fallback: use axis-aligned bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    usedCorners.length = 0;
    usedCorners.push({ x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY }, { x: minX, y: maxY });
  }

  // Check angles are roughly 90 degrees
  let angleScore = 0;
  for (let i = 0; i < 4; i++) {
    const p0 = usedCorners[i];
    const p1 = usedCorners[(i + 1) % 4];
    const p2 = usedCorners[(i + 2) % 4];
    const a1 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const a2 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    let diff = Math.abs(a2 - a1);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    angleScore += 1 - Math.abs(diff - Math.PI / 2) / (Math.PI / 2);
  }
  const confidence = angleScore / 4;

  // Check if stroke is closed
  const closedDist = Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);
  const avgSide = (Math.hypot(usedCorners[0].x - usedCorners[1].x, usedCorners[0].y - usedCorners[1].y) +
    Math.hypot(usedCorners[1].x - usedCorners[2].x, usedCorners[1].y - usedCorners[2].y)) / 2;
  const isClosed = closedDist < avgSide * 0.3;

  const finalConfidence = isClosed ? confidence : confidence * 0.5;

  const correctedPoints = [
    ...usedCorners.map(c => ({ x: c.x, y: c.y, pressure: 0.5 })),
    { x: usedCorners[0].x, y: usedCorners[0].y, pressure: 0.5 }, // close path
  ];

  return { type: 'rectangle', confidence: Math.max(0, finalConfidence), correctedPoints };
}
