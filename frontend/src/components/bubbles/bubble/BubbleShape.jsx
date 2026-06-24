// ============================================
// SumiWire PRO - BubbleShape Component
// V17 : Professional tails with proper fusion
// ============================================
import React, { useEffect, useState } from 'react';
import { useStudio, ACTIONS } from '../../../context/StudioContext';
import { pointOnEllipse } from '../../../utils/helpers';

const BubbleShape = ({ bubble }) => {
  const { dispatch } = useStudio();
  const { 
    width, height, backgroundColor, borderColor, borderWidth, type, 
    image, imageOpacity, imageX, imageY, imageScaleX, imageScaleY, 
    tailAngle, tailWidth: bubbleTailWidth, tailLength 
  } = bubble;

  // State local pour les dimensions de l'image
  const [naturalSize, setNaturalSize] = useState(null);

  // Charger les dimensions de l'image
  useEffect(() => {
    if (!image) {
      setNaturalSize(null);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setNaturalSize({ w, h });
      
      if (!bubble.originalImageWidth) {
        dispatch({
          type: ACTIONS.UPDATE_BUBBLE,
          payload: {
            id: bubble.id,
            updates: { originalImageWidth: w, originalImageHeight: h },
            skipHistory: true,
          }
        });
      }
    };
    img.src = image;
  }, [image, bubble.id, bubble.originalImageWidth, dispatch]);

  // === CONSTANTES ===
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2;
  const ry = height / 2;
  const angle = tailAngle || 180;
  const tLength = tailLength !== undefined ? tailLength : 50;
  const tWidth = bubbleTailWidth || 20;
  
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
  const getImageDimensions = () => {
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

  const imageDims = image ? getImageDimensions() : null;

  // === SVG DIMENSIONS ===
  const svgWidth = width + (type === 'narration' ? 0 : 500);
  const svgHeight = height + (type === 'narration' ? 0 : 500);

  // === GÉNÉRATION DES FORMES ===

  // Path nuage pour pensée
  const cloudPath = (centerX, centerY, radiusX, radiusY, bumps = 10) => {
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

  // Cercles de queue pour pensée
  const renderThoughtTail = () => {
    const circles = [];
    const numCircles = 3;
    
    for (let i = 0; i < numCircles; i++) {
      const t = 0.3 + (i * 0.25);
      const x = edgePoint.x + (tipPoint.x - edgePoint.x) * t;
      const y = edgePoint.y + (tipPoint.y - edgePoint.y) * t;
      const radius = 10 - i * 3;
      
      circles.push(
        <circle
          key={`thought-${i}`}
          cx={x + offset}
          cy={y + offset}
          r={Math.max(radius, 3)}
          fill={image ? 'transparent' : bgColor}
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      );
    }
    return circles;
  };

  // Path zigzag pour cri
  const shoutPath = (centerX, centerY, radiusX, radiusY, spikes = 12) => {
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
  const wavyPath = (centerX, centerY, radiusX, radiusY, waves = 6) => {
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

  // Queue éclair pour radio
  const lightningTailPath = () => {
    const mid1X = edgePoint.x + (tipPoint.x - edgePoint.x) * 0.4;
    const mid1Y = edgePoint.y + (tipPoint.y - edgePoint.y) * 0.4;
    const mid2X = edgePoint.x + (tipPoint.x - edgePoint.x) * 0.6;
    const mid2Y = edgePoint.y + (tipPoint.y - edgePoint.y) * 0.6;
    
    const perpX = Math.cos(perpAngle) * 6;
    const perpY = Math.sin(perpAngle) * 6;
    
    return `M ${base1.x + offset} ${base1.y + offset}
            L ${mid1X + perpX + offset} ${mid1Y + perpY + offset}
            L ${mid1X - perpX * 0.5 + offset} ${mid1Y - perpY * 0.5 + offset}
            L ${mid2X + perpX + offset} ${mid2Y + perpY + offset}
            L ${tipPoint.x + offset} ${tipPoint.y + offset}
            L ${mid2X - perpX + offset} ${mid2Y - perpY + offset}
            L ${mid2X + perpX * 0.5 + offset} ${mid2Y + perpY * 0.5 + offset}
            L ${mid1X - perpX + offset} ${mid1Y - perpY + offset}
            L ${base2.x + offset} ${base2.y + offset}
            Z`;
  };

  // === RENDU PAR TYPE ===
  const renderBubble = () => {
    const cxO = cx + offset;
    const cyO = cy + offset;

    switch (type) {
      // === PENSÉE ===
      case 'thought':
        return (
          <>
            {renderThoughtTail()}
            <path
              d={cloudPath(cxO, cyO, rx, ry, 10)}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
            />
          </>
        );

      // === CRI ===
      case 'shout':
        return (
          <>
            {/* Queue remplie */}
            <polygon
              points={`${base1.x + offset},${base1.y + offset} ${tipPoint.x + offset},${tipPoint.y + offset} ${base2.x + offset},${base2.y + offset}`}
              fill={image ? 'transparent' : bgColor}
              stroke="none"
            />
            <path
              d={shoutPath(cxO, cyO, rx, ry, 10)}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
            />
            {/* Contour queue */}
            <line x1={base1.x + offset} y1={base1.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
            <line x1={base2.x + offset} y1={base2.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
          </>
        );

      // === MURMURE ===
      case 'whisper':
        return (
          <>
            <polygon
              points={`${base1.x + offset},${base1.y + offset} ${tipPoint.x + offset},${tipPoint.y + offset} ${base2.x + offset},${base2.y + offset}`}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray="6 4"
            />
            <ellipse
              cx={cxO}
              cy={cyO}
              rx={rx}
              ry={ry}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray="6 4"
            />
          </>
        );

      // === NARRATION ===
      case 'narration':
        return (
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={image ? 'transparent' : bgColor}
            stroke={borderColor}
            strokeWidth={borderWidth}
          />
        );

      // === RADIO/TV ===
      case 'radio':
        return (
          <>
            <path
              d={lightningTailPath()}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
            />
            <rect
              x={offset}
              y={offset}
              width={width}
              height={height}
              rx={6}
              ry={6}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeDasharray="10 5"
            />
          </>
        );

      // === ROBOT ===
      case 'robot':
        return (
          <>
            {/* Queue remplie */}
            <polygon
              points={`${base1.x + offset},${base1.y + offset} ${tipPoint.x + offset},${tipPoint.y + offset} ${base2.x + offset},${base2.y + offset}`}
              fill={image ? 'transparent' : bgColor}
              stroke="none"
            />
            <rect
              x={offset}
              y={offset}
              width={width}
              height={height}
              rx={4}
              ry={4}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            {/* Contour queue */}
            <line x1={base1.x + offset} y1={base1.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
            <line x1={base2.x + offset} y1={base2.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
            {/* Détails mécaniques */}
            <circle cx={offset + 8} cy={offset + 8} r={3} fill={borderColor} />
            <circle cx={offset + width - 8} cy={offset + 8} r={3} fill={borderColor} />
            <circle cx={offset + 8} cy={offset + height - 8} r={3} fill={borderColor} />
            <circle cx={offset + width - 8} cy={offset + height - 8} r={3} fill={borderColor} />
          </>
        );

      // === CHANT ===
      case 'chant':
        return (
          <>
            {/* Queue remplie */}
            <polygon
              points={`${base1.x + offset},${base1.y + offset} ${tipPoint.x + offset},${tipPoint.y + offset} ${base2.x + offset},${base2.y + offset}`}
              fill={image ? 'transparent' : bgColor}
              stroke="none"
            />
            <path
              d={wavyPath(cxO, cyO, rx, ry, 5)}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
            />
            {/* Contour queue */}
            <line x1={base1.x + offset} y1={base1.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
            <line x1={base2.x + offset} y1={base2.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} />
            {/* Notes de musique */}
            <text x={offset + width - 20} y={offset + 20} fontSize="14" fill={borderColor} fontFamily="serif">♪</text>
          </>
        );

      // === DIALOGUE STANDARD ===
      case 'speech':
      default:
        return (
          <>
            {/* Queue remplie (sans contour pour fusion) */}
            <polygon
              points={`${base1.x + offset},${base1.y + offset} ${tipPoint.x + offset},${tipPoint.y + offset} ${base2.x + offset},${base2.y + offset}`}
              fill={image ? 'transparent' : bgColor}
              stroke="none"
            />
            {/* Ellipse principale */}
            <ellipse
              cx={cxO}
              cy={cyO}
              rx={rx}
              ry={ry}
              fill={image ? 'transparent' : bgColor}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            {/* Contour de la queue (seulement les côtés) */}
            <line x1={base1.x + offset} y1={base1.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
            <line x1={base2.x + offset} y1={base2.y + offset} x2={tipPoint.x + offset} y2={tipPoint.y + offset} stroke={borderColor} strokeWidth={borderWidth} strokeLinecap="round" />
          </>
        );
    }
  };

  // === CLIP PATH ===
  const renderClipPath = () => {
    const cxO = cx + offset;
    const cyO = cy + offset;

    switch (type) {
      case 'thought':
        return <path d={cloudPath(cxO, cyO, rx, ry, 10)} />;
      case 'shout':
        return <path d={shoutPath(cxO, cyO, rx, ry, 10)} />;
      case 'chant':
        return <path d={wavyPath(cxO, cyO, rx, ry, 5)} />;
      case 'narration':
        return <rect x={0} y={0} width={width} height={height} />;
      case 'radio':
      case 'robot':
        return <rect x={offset} y={offset} width={width} height={height} rx={4} ry={4} />;
      default:
        return <ellipse cx={cxO} cy={cyO} rx={rx} ry={ry} />;
    }
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{
        position: 'absolute',
        top: type === 'narration' ? 0 : -250,
        left: type === 'narration' ? 0 : -250,
        overflow: 'visible',
        pointerEvents: 'none'
      }}
    >
      <defs>
        <clipPath id={clipId}>
          {renderClipPath()}
        </clipPath>
      </defs>

      {/* Image */}
      {image && imageDims && (naturalSize || bubble.originalImageWidth) && (
        <image
          href={image}
          x={imageDims.imgX + offset}
          y={imageDims.imgY + offset}
          width={imageDims.displayW}
          height={imageDims.displayH}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="none"
          opacity={imageOpacity !== undefined ? imageOpacity : 1}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Forme de la bulle */}
      <g style={{ pointerEvents: 'auto', cursor: 'move' }}>
        {renderBubble()}
      </g>
    </svg>
  );
};

export default BubbleShape;