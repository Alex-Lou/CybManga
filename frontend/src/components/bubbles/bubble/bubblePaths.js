// ============================================
// SumiWire PRO - Générateurs de path SVG de bulles (purs, sans React)
// ============================================

// Path nuage pour pensée
export const cloudPath = (centerX, centerY, radiusX, radiusY, bumps = 10) => {
  let d = '';
  const bumpSize = 0.15;

  for (let i = 0; i < bumps; i++) {
    const angle1 = (i / bumps) * Math.PI * 2;
    const angle2 = ((i + 1) / bumps) * Math.PI * 2;
    const midAngle = (angle1 + angle2) / 2;

    const x1 = centerX + radiusX * Math.cos(angle1);
    const y1 = centerY + radiusY * Math.sin(angle1);
    const x2 = centerX + radiusX * Math.cos(angle2);
    const y2 = centerY + radiusY * Math.sin(angle2);

    // Point de contrôle pour la bosse
    const cpX = centerX + radiusX * (1 + bumpSize) * Math.cos(midAngle);
    const cpY = centerY + radiusY * (1 + bumpSize) * Math.sin(midAngle);

    if (i === 0) {
      d = `M ${x1} ${y1}`;
    }
    d += ` Q ${cpX} ${cpY} ${x2} ${y2}`;
  }
  d += ' Z';
  return d;
};

// Path zigzag pour cri
export const shoutPath = (centerX, centerY, radiusX, radiusY, spikes = 12) => {
  let d = '';
  const spikeDepth = 0.25;

  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const isSpike = i % 2 === 0;
    const r = isSpike ? 1 + spikeDepth : 1 - spikeDepth * 0.3;

    const x = centerX + radiusX * r * Math.cos(angle);
    const y = centerY + radiusY * r * Math.sin(angle);

    if (i === 0) {
      d = `M ${x} ${y}`;
    } else {
      d += ` L ${x} ${y}`;
    }
  }
  d += ' Z';
  return d;
};

// Path ondulé pour chant
export const wavyPath = (centerX, centerY, radiusX, radiusY, waves = 6) => {
  const segments = waves * 8;
  let d = '';

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const waveOffset = Math.sin(angle * waves * 2) * 0.06;
    const r = 1 + waveOffset;

    const x = centerX + radiusX * r * Math.cos(angle);
    const y = centerY + radiusY * r * Math.sin(angle);

    if (i === 0) {
      d = `M ${x} ${y}`;
    } else {
      d += ` L ${x} ${y}`;
    }
  }
  d += ' Z';
  return d;
};
