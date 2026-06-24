// ============================================
// SumiWire PRO — Reference Image Panel
// Drag & drop images, floating, session-only
// Proper cleanup: URL.revokeObjectURL on remove/unmount
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStudio } from '../../context/StudioContext';

const ReferencePanel = ({ visible, onClose }) => {
  const { theme } = useStudio();
  const [images, setImages] = useState([]); // { id, objectUrl, opacity }
  const [isDragOver, setIsDragOver] = useState(false);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ x: 80, y: 80 });
  const dragStartRef = useRef(null);

  // Cleanup all ObjectURLs on unmount or when panel closes
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.objectUrl));
    };
  }, []);

  const addImage = useCallback((file) => {
    if (!file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    const id = Date.now() + '-' + Math.random().toString(36).slice(2);
    setImages(prev => [...prev, { id, objectUrl, opacity: 1 }]);
  }, []);

  const removeImage = useCallback((id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.objectUrl);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const updateOpacity = useCallback((id, opacity) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, opacity: parseFloat(opacity) } : i));
  }, []);

  // Drag & drop
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    files.forEach(addImage);
  }, [addImage]);

  // Panel dragging
  const handleTitleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX - panelPos.x, y: e.clientY - panelPos.y };
    const move = (me) => setPanelPos({ x: me.clientX - dragStartRef.current.x, y: me.clientY - dragStartRef.current.y });
    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [panelPos]);

  // File input fallback
  const fileInputRef = useRef(null);

  if (!visible) return null;

  return (
    <div ref={panelRef}
      className="fixed rounded-lg shadow-2xl border z-50 flex flex-col"
      style={{
        left: panelPos.x, top: panelPos.y,
        width: 280, maxHeight: 500,
        backgroundColor: theme.surface, borderColor: theme.border,
      }}>

      {/* Title bar — draggable */}
      <div className="px-3 py-2 border-b cursor-move flex items-center justify-between select-none"
        style={{ borderColor: theme.border }}
        onMouseDown={handleTitleMouseDown}>
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: theme.primary }}>
          References
        </span>
        <div className="flex gap-1">
          <button onClick={() => fileInputRef.current?.click()}
            className="text-xs px-1.5 py-0.5 rounded transition-all hover:opacity-80"
            style={{ color: theme.text, border: `1px solid ${theme.border}` }}>+</button>
          <button onClick={onClose}
            className="text-xs px-1.5 py-0.5 rounded transition-all hover:opacity-80"
            style={{ color: theme.textSecondary }}>✕</button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { Array.from(e.target.files).forEach(addImage); e.target.value = ''; }} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2"
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        style={{ minHeight: 120, backgroundColor: isDragOver ? `${theme.primary}15` : 'transparent' }}>

        {images.length === 0 && (
          <div className="text-center py-8 text-xs" style={{ color: theme.textMuted }}>
            <div className="text-2xl mb-2">🖼️</div>
            <p>Glissez des images ici</p>
            <p>ou cliquez +</p>
          </div>
        )}

        {images.map(img => (
          <div key={img.id} className="rounded border overflow-hidden" style={{ borderColor: theme.border }}>
            <img src={img.objectUrl} alt="ref"
              className="w-full object-cover"
              style={{ opacity: img.opacity, maxHeight: 200 }} />
            <div className="flex items-center gap-1 p-1" style={{ backgroundColor: theme.bg }}>
              <input type="range" min="0.1" max="1" step="0.1" value={img.opacity}
                onChange={(e) => updateOpacity(img.id, e.target.value)}
                className="flex-1 h-1" />
              <span className="text-xs font-mono" style={{ color: theme.textSecondary }}>
                {Math.round(img.opacity * 100)}%
              </span>
              <button onClick={() => removeImage(img.id)}
                className="text-xs px-1 rounded hover:opacity-70"
                style={{ color: theme.error }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencePanel;
