// frontend/src/components/bubbles/bubble/ResizeHandles.jsx
import React from 'react';
import { BUBBLE, PANEL } from '../../../styles/tailwind';

const ResizeHandles = ({ onResizeStart }) => {
  const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <div className={PANEL.handles} style={{zIndex: 20, pointerEvents: 'none'}}>
      {handles.map(handle => (
        <div
          key={handle}
          className={BUBBLE.handle}
          onPointerDown={(e) => onResizeStart(e, handle)}
          style={{
            pointerEvents: 'auto',
            touchAction: 'none',
            top: handle.includes('n') ? 0 : handle.includes('s') ? '100%' : '50%',
            left: handle.includes('w') ? 0 : handle.includes('e') ? '100%' : '50%',
            transform: `translate(${handle.includes('e') ? '50%' : handle.includes('w') ? '-50%' : '-50%'}, ${handle.includes('s') ? '50%' : handle.includes('n') ? '-50%' : '-50%'})`,
            cursor: `${handle}-resize`,
          }}
        />
      ))}
    </div>
  );
};

export default ResizeHandles;