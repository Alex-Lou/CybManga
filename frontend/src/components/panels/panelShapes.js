// ============================================
// SumiWire PRO - Générateur de path SVG des formes de case (pur, sans React)
// ============================================

export const getPanelShapePath = (width, height, type) => {
  const w = width;
  const h = height;

  switch (type) {
    case 'trapezoid': return `M ${w * 0.2},0 L ${w * 0.8},0 L ${w},${h} L 0,${h} Z`;
    case 'parallelogram': return `M ${w * 0.25},0 L ${w},0 L ${w * 0.75},${h} L 0,${h} Z`;
    case 'hexagon': return `M ${w * 0.25},0 L ${w * 0.75},0 L ${w},${h / 2} L ${w * 0.75},${h} L ${w * 0.25},${h} L 0,${h / 2} Z`;
    case 'octagon':
      const s = Math.min(w, h) * 0.3;
      return `M ${s},0 L ${w - s},0 L ${w},${s} L ${w},${h - s} L ${w - s},${h} L ${s},${h} L 0,${h - s} L 0,${s} Z`;
    case 'star': {
      const cx = w / 2; const cy = h / 2;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius / 2.5;
      let path = '';
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        path += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
      }
      return path + ' Z';
    }
    case 'burst':
    case 'shout':
    case 'explosion': {
      const bcx = w / 2; const bcy = h / 2;
      const bOuter = Math.min(w, h) / 2;
      const bInner = bOuter * 0.6;
      let bPath = '';
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
        const r = i % 2 === 0 ? bOuter : bInner;
        const x = bcx + Math.cos(angle) * r;
        const y = bcy + Math.sin(angle) * r;
        bPath += (i === 0 ? `M ${x},${y}` : ` L ${x},${y}`);
      }
      return bPath + ' Z';
    }
    case 'cloud':
      return `M ${w*0.2},${h*0.8} Q ${w*0.1},${h*0.5} ${w*0.3},${h*0.4} Q ${w*0.4},${h*0.1} ${w*0.6},${h*0.4} Q ${w*0.9},${h*0.3} ${w*0.9},${h*0.6} Q ${w},${h*0.9} ${w*0.7},${h*0.9} Q ${w*0.4},${h} ${w*0.2},${h*0.8} Z`;
    case 'torn':
      let tPath = `M 0,0 L ${w},0 L ${w},${h*0.85} `;
      const steps = 12;
      const stepW = w / steps;
      for(let i=1; i<=steps; i++) {
         const x = w - (i * stepW);
         const y = (i % 2 === 0) ? h * 0.85 : h;
         tPath += `L ${x},${y} `;
      }
      return tPath + `L 0,${h*0.85} Z`;
    case 'diagonal-left': return `M ${w * 0.15},0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    case 'diagonal-right': return `M 0,0 L ${w * 0.85},0 L ${w},${h} L 0,${h} Z`;
    default: return null;
  }
};
