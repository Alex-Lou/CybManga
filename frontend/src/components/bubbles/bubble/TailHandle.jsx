// frontend/src/components/bubbles/bubble/TailHandle.jsx
import React from 'react';
import { BUBBLE } from '../../../styles/tailwind';
import { pointOnEllipse } from '../../../utils/helpers';

const TailHandle = ({ bubble, onMouseDown }) => {
  const getTailPosition = () => {
    const cx = bubble.width / 2;
    const cy = bubble.height / 2;
    const rx = bubble.width / 2;
    const ry = bubble.height / 2;
    const angle = bubble.tailAngle || 180;

    const length = bubble.tailLength !== undefined ? bubble.tailLength : 50;
    const tipPoint = pointOnEllipse(cx, cy, rx + length, ry + length, angle);
    return { tipPoint };
  };

  const { tipPoint } = getTailPosition();
  const isFlipped = bubble.flipped;

  return (
    <div
      className={BUBBLE.tailHandle}
      style={{
        left: tipPoint.x - 8, top: tipPoint.y - 8,
        pointerEvents: 'auto', cursor: 'crosshair',
        transform: isFlipped ? 'scaleX(-1)' : 'none'
      }}
      onMouseDown={onMouseDown}
      title="Tirer pour allonger ou tourner la queue"
    />
  );
};

export default TailHandle;