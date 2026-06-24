// ============================================
// SumiWire PRO - Bubble Component
// V11 : Fixed pointerEvents for selection
// ============================================
import React, { useRef, useEffect } from 'react';
import { useStudio, ACTIONS } from '../../../context/StudioContext';
import { BUBBLE, cn } from '../../../styles/tailwind';
import { useBubbleHandlers } from './useBubbleHandlers';
import BubbleShape from './BubbleShape';
import BubbleText from './BubbleText';
import ResizeHandles from './ResizeHandles';
import TailHandle from './TailHandle';
import ImageHandles from './ImageHandles';
import { pointOnEllipse } from '../../../utils/helpers';

const Bubble = ({ bubble, pageWidth, pageHeight }) => {
  const { state, dispatch } = useStudio();
  const bubbleRef = useRef(null);

  // Auto-balloon sizing: resize bubble to fit text
  useEffect(() => {
    if (!bubble.autoSize || !bubble.text) return;
    const measure = document.createElement('div');
    measure.style.cssText = `position:absolute;visibility:hidden;white-space:pre-wrap;font-family:${bubble.fontFamily};font-size:${bubble.fontSize}px;font-weight:${bubble.fontWeight || 'normal'};font-style:${bubble.fontStyle || 'normal'};line-height:${bubble.lineHeight || 1.3};max-width:300px;padding:8px;`;
    measure.textContent = bubble.text;
    document.body.appendChild(measure);
    const pad = 40;
    const newW = Math.max(80, measure.offsetWidth + pad);
    const newH = Math.max(50, measure.offsetHeight + pad);
    document.body.removeChild(measure);
    if (Math.abs(newW - bubble.width) > 8 || Math.abs(newH - bubble.height) > 8) {
      dispatch({ type: ACTIONS.UPDATE_BUBBLE, payload: { id: bubble.id, updates: { width: newW, height: newH }, skipHistory: true } });
    }
  }, [bubble.text, bubble.fontSize, bubble.fontFamily, bubble.fontWeight, bubble.fontStyle, bubble.lineHeight, bubble.autoSize]);
  const isSelected = state.selectedBubbleIds.includes(bubble.id);
  const isEditingImage = state.editingImageId === bubble.id;

  const {
    isDragging,
    handleSelect,
    handleMouseDown,
    handleResizeStart,
    handleImageResizeStart,
    handleTailMouseDown,
    handleTextMouseDown,
    handleDoubleClick,
  } = useBubbleHandlers(bubble, pageWidth, pageHeight, bubbleRef, isSelected, isEditingImage);

  const getTailPosition = () => {
    const cx = bubble.width / 2;
    const cy = bubble.height / 2;
    const rx = bubble.width / 2;
    const ry = bubble.height / 2;
    const angle = bubble.tailAngle || 180;
    const tipPoint = pointOnEllipse(cx, cy, rx + (bubble.tailLength || 50), ry + (bubble.tailLength || 50), angle);
    return { tipPoint };
  };

  const { tipPoint } = getTailPosition();
  const isFlipped = bubble.flipped;

  return (
    <div
      ref={bubbleRef}
      className={cn(BUBBLE.container, isSelected && !isEditingImage && BUBBLE.selected)}
      style={{
        left: bubble.x,
        top: bubble.y,
        width: bubble.width,
        height: bubble.height,
        zIndex: bubble.zIndex || 10,
        // ✅ CORRIGÉ : pointerEvents auto pour permettre les interactions
        pointerEvents: 'auto',
        transform: 'translate3d(0,0,0)',
      }}
      onClick={handleSelect}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Wrapper pour BubbleShape - aussi avec pointerEvents auto */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          transform: isFlipped ? 'scaleX(-1)' : 'none',
          // ✅ CORRIGÉ : permettre les clics sur la shape
          pointerEvents: 'auto',
          zIndex: 0,
        }}
      >
        <BubbleShape bubble={bubble} />
        {isSelected && !isEditingImage && bubble.type !== 'narration' && (
          <TailHandle bubble={bubble} onMouseDown={handleTailMouseDown} />
        )}
      </div>

      {/* Texte de la bulle */}
      <BubbleText
        bubble={bubble}
        onMouseDown={handleTextMouseDown}
        isDragging={isDragging}
        isEditingImage={isEditingImage}
      />

      {/* Poignées de redimensionnement de la bulle */}
      {isSelected && !isEditingImage && (
        <ResizeHandles onResizeStart={handleResizeStart} />
      )}

      {/* Poignées de redimensionnement de l'image */}
      {isEditingImage && bubble.image && (
        <ImageHandles bubble={bubble} onImageResizeStart={handleImageResizeStart} />
      )}
    </div>
  );
};

export default Bubble;