// ============================================
// SumiWire PRO - Rendu de la forme et du contenu d'une case (présentationnel)
// ============================================

import React from 'react';
import { getPanelShapePath } from './panelShapes';

const PanelShape = ({ panel, onImageLoad }) => {
  const renderPanelContent = () => {
    const { image, imageScaleX = 1, imageScaleY = 1, imageX = 0, imageY = 0, backgroundColor, imageOpacity = 1 } = panel;
    return (
      <div
        style={{
            width: '100%', height: '100%',
            backgroundColor, overflow: 'hidden', position: 'relative',
            pointerEvents: 'auto'
        }}
      >
        {image && (
          <img
            src={image}
            onLoad={onImageLoad}
            alt="Panel content"
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%, -50%) translate(${imageX}px, ${imageY}px) scale(${imageScaleX}, ${imageScaleY})`,
              maxWidth: 'none', pointerEvents: 'none', userSelect: 'none',
              opacity: imageOpacity
            }}
          />
        )}
      </div>
    );
  };

  const { type, width, height, borderWidth, borderColor, borderRadius, borderStyle, backgroundColor } = panel;
  const pathD = getPanelShapePath(width, height, type);

  if (!pathD) {
     let style = {
         width: '100%', height: '100%',
         border: `${borderWidth}px ${borderStyle || 'solid'} ${borderColor}`,
         overflow: 'hidden',
         backgroundColor: backgroundColor,
         pointerEvents: 'auto'
     };
     if (type === 'circle' || type === 'ellipse') style.borderRadius = '50%';
     if (type === 'rounded') style.borderRadius = borderRadius || 20;
     return <div style={style}>{renderPanelContent()}</div>;
  }

  return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <path d={pathD} fill={backgroundColor || 'white'} pointerEvents="auto" />
        </svg>
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}><defs><clipPath id={`clip-${panel.id}`}><path d={pathD} /></clipPath></defs></svg>
        <div style={{ width: '100%', height: '100%', clipPath: `url(#clip-${panel.id})`, pointerEvents: 'auto' }}>
           {renderPanelContent()}
        </div>
        <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <path d={pathD} fill="none" stroke={borderColor} strokeWidth={borderWidth} strokeDasharray={borderStyle === 'dashed' ? '10,5' : borderStyle === 'dotted' ? '3,3' : 'none'} />
        </svg>
      </div>
  );
};

export default PanelShape;
