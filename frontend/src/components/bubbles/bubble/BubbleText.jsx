// frontend/src/components/bubbles/bubble/BubbleText.jsx
import React from 'react';
import { BUBBLE } from '../../../styles/tailwind';

const BubbleText = ({ bubble, onMouseDown, isDragging }) => {
  return (
    <div
      className={BUBBLE.textWrapper}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
        transform: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        direction: 'ltr'
      }}
    >
      <div
        className={BUBBLE.text}
        onMouseDown={onMouseDown}
        style={{
          pointerEvents: 'auto',
          fontFamily: bubble.fontFamily,
          fontSize: bubble.fontSize,
          fontWeight: bubble.fontWeight,
          fontStyle: bubble.fontStyle,
          textAlign: bubble.textAlign || 'center',
          color: bubble.textColor,
          lineHeight: bubble.lineHeight,
          minWidth: 20,
          maxWidth: bubble.width - 30,
          transform: `translate(${bubble.textOffsetX || 0}px, ${bubble.textOffsetY || 0}px)`,
          userSelect: 'none',
          whiteSpace: 'pre-wrap',
          cursor: isDragging ? 'grabbing' : 'grab',
          unicodeBidi: 'plaintext'
        }}
      >
        {bubble.text || "Double-clic pour éditer"}
      </div>
    </div>
  );
};

export default BubbleText;