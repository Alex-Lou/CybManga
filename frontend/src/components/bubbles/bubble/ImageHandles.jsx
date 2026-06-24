// ============================================
// SumiWire PRO - ImageHandles Component
// V2 : 8 handles for free resizing (corners + sides)
// ============================================
import React from 'react';

const ImageHandles = ({ bubble, onImageResizeStart }) => {
  // 8 poignées : 4 coins + 4 côtés
  const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

  // Calculer les dimensions et position de l'image
  const origW = bubble.originalImageWidth || bubble.width;
  const origH = bubble.originalImageHeight || bubble.height;
  const scaleX = bubble.imageScaleX || 1;
  const scaleY = bubble.imageScaleY || 1;
  
  const iW = origW * scaleX;
  const iH = origH * scaleY;
  const iCenterX = (bubble.width / 2) + (bubble.imageX || 0);
  const iCenterY = (bubble.height / 2) + (bubble.imageY || 0);
  const iLeft = iCenterX - iW / 2;
  const iTop = iCenterY - iH / 2;

  // Curseurs selon la direction
  const getCursor = (handle) => {
    const cursors = {
      'n': 'ns-resize',
      's': 'ns-resize',
      'e': 'ew-resize',
      'w': 'ew-resize',
      'nw': 'nwse-resize',
      'ne': 'nesw-resize',
      'sw': 'nesw-resize',
      'se': 'nwse-resize',
    };
    return cursors[handle] || 'pointer';
  };

  // Position de chaque poignée
  const getHandlePosition = (handle) => {
    let top = iTop + iH / 2;
    let left = iLeft + iW / 2;
    
    if (handle.includes('n')) top = iTop;
    if (handle.includes('s')) top = iTop + iH;
    if (handle.includes('w')) left = iLeft;
    if (handle.includes('e')) left = iLeft + iW;
    
    return { top, left };
  };

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 30 }}
    >
      {/* Cadre jaune autour de l'image */}
      <div 
        className="absolute border-2 border-yellow-500 pointer-events-none" 
        style={{ 
          top: iTop, 
          left: iLeft, 
          width: iW, 
          height: iH,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
        }} 
      />
      
      {/* Poignées de redimensionnement */}
      {handles.map(handle => {
        const { top, left } = getHandlePosition(handle);
        const isCorner = handle.length === 2;
        
        return (
          <div
            key={`img-${handle}`}
            className={`absolute pointer-events-auto ${
              isCorner 
                ? 'w-3 h-3 bg-yellow-500 border-2 border-white' 
                : 'w-2.5 h-2.5 bg-yellow-400 border border-yellow-600'
            }`}
            style={{
              top,
              left,
              transform: 'translate(-50%, -50%)',
              cursor: getCursor(handle),
              borderRadius: isCorner ? '2px' : '50%',
            }}
            onMouseDown={(e) => onImageResizeStart(e, handle)}
          />
        );
      })}
    </div>
  );
};

export default ImageHandles;