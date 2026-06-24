// ============================================
// SumiWire PRO — Quick Radial Menu
// Right-click → circular menu with 8 tool/action slots
// Animated open/close, cyberpunk styling
// ============================================

import React, { useEffect, useRef } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';

const MENU_ITEMS = [
  { icon: '✏️', label: 'Crayon', action: (d) => { d({ type: ACTIONS.SET_TOOL, payload: 'draw' }); d({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'pencil' } }); } },
  { icon: '🖌️', label: 'Pinceau', action: (d) => { d({ type: ACTIONS.SET_TOOL, payload: 'draw' }); d({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'brush' } }); } },
  { icon: '🧽', label: 'Gomme', action: (d) => { d({ type: ACTIONS.SET_TOOL, payload: 'draw' }); d({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'eraser' } }); } },
  { icon: '💉', label: 'Pipette', action: (d) => { d({ type: ACTIONS.SET_TOOL, payload: 'draw' }); d({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'eyedropper' } }); } },
  { icon: '🪣', label: 'Remplissage', action: (d) => { d({ type: ACTIONS.SET_TOOL, payload: 'draw' }); d({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: 'fill' } }); } },
  { icon: '↩️', label: 'Annuler', action: (d) => d({ type: ACTIONS.UNDO }) },
  { icon: '↪️', label: 'Rétablir', action: (d) => d({ type: ACTIONS.REDO }) },
  { icon: '🖱️', label: 'Sélection', action: (d) => d({ type: ACTIONS.SET_TOOL, payload: 'select' }) },
];

const RadialMenu = ({ x, y, onClose }) => {
  const { dispatch, theme } = useStudio();
  const menuRef = useRef(null);
  const radius = 85;

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleAction = (item) => {
    item.action(dispatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>

        {/* Center dot */}
        <div className="absolute rounded-full"
          style={{
            width: 12, height: 12, left: -6, top: -6,
            backgroundColor: theme.primary,
            boxShadow: `0 0 12px ${theme.primary}, 0 0 24px ${theme.glow}`,
          }} />

        {/* Menu items in a circle */}
        {MENU_ITEMS.map((item, i) => {
          const angle = (i / MENU_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
          const ix = Math.cos(angle) * radius;
          const iy = Math.sin(angle) * radius;

          return (
            <button key={i}
              className="absolute flex flex-col items-center justify-center rounded-full transition-all duration-200 hover:scale-115"
              style={{
                left: ix - 24, top: iy - 24,
                width: 48, height: 48,
                backgroundColor: theme.surface,
                border: `1.5px solid ${theme.border}`,
                boxShadow: `0 0 8px ${theme.glow || 'rgba(0,247,255,0.15)'}`,
                color: theme.text,
                animationDelay: `${i * 30}ms`,
              }}
              onClick={(e) => { e.stopPropagation(); handleAction(item); }}
              title={item.label}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[7px] font-mono mt-0.5 opacity-60 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* Connecting lines from center to each item */}
        <svg style={{ position: 'absolute', left: -radius - 30, top: -radius - 30, width: (radius + 30) * 2, height: (radius + 30) * 2, pointerEvents: 'none' }}>
          {MENU_ITEMS.map((_, i) => {
            const angle = (i / MENU_ITEMS.length) * Math.PI * 2 - Math.PI / 2;
            const ix = Math.cos(angle) * radius + radius + 30;
            const iy = Math.sin(angle) * radius + radius + 30;
            const cx = radius + 30, cy = radius + 30;
            return (
              <line key={i} x1={cx} y1={cy} x2={ix} y2={iy}
                stroke={theme.primary} strokeWidth="0.5" opacity="0.2" />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RadialMenu;
