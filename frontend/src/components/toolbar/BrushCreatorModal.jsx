// ============================================
// SumiWire PRO - Modal de création de brush (présentationnel)
// ============================================

import React from 'react';

const BrushCreatorModal = ({ show, newBrush, setNewBrush, onCreate, onClose, theme }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="rounded-xl shadow-2xl w-96 p-5" style={{ backgroundColor: theme.surface, color: theme.text }}
        onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-4">✨ Créer une brush</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs opacity-70 block mb-1">Nom</label>
            <input type="text" value={newBrush.name} onChange={(e) => setNewBrush({ ...newBrush, name: e.target.value })}
              placeholder="Ma super brush" className="w-full px-3 py-2 text-sm rounded border"
              style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }} />
          </div>

          <div>
            <label className="text-xs opacity-70 block mb-1">Forme</label>
            <select value={newBrush.shape} onChange={(e) => setNewBrush({ ...newBrush, shape: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border"
              style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
              <option value="circle">Cercle</option>
              <option value="square">Carré</option>
              <option value="ellipse">Ellipse</option>
              <option value="rectangle">Rectangle</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70 block mb-1">Angle ({newBrush.angle}°)</label>
              <input type="range" min="0" max="180" value={newBrush.angle}
                onChange={(e) => setNewBrush({ ...newBrush, angle: parseInt(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="text-xs opacity-70 block mb-1">Ratio ({newBrush.ratio})</label>
              <input type="range" min="0.05" max="1" step="0.05" value={newBrush.ratio}
                onChange={(e) => setNewBrush({ ...newBrush, ratio: parseFloat(e.target.value) })} className="w-full" />
            </div>
          </div>

          <div>
            <label className="text-xs opacity-70 block mb-1">Douceur ({newBrush.softness})</label>
            <input type="range" min="0" max="1" step="0.05" value={newBrush.softness}
              onChange={(e) => setNewBrush({ ...newBrush, softness: parseFloat(e.target.value) })} className="w-full" />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newBrush.pressureSize}
                onChange={(e) => setNewBrush({ ...newBrush, pressureSize: e.target.checked })} />
              Pression → Taille
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newBrush.pressureOpacity}
                onChange={(e) => setNewBrush({ ...newBrush, pressureOpacity: e.target.checked })} />
              Pression → Opacité
            </label>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-3">
            <div className="relative" style={{ width: 60, height: 60 }}>
              <div style={{
                width: 40,
                height: 40 * (newBrush.ratio || 1),
                borderRadius: newBrush.shape === 'circle' || newBrush.shape === 'ellipse' ? '50%' : '0',
                backgroundColor: theme.text,
                transform: `rotate(${newBrush.angle || 0}deg)`,
                position: 'absolute',
                top: '50%', left: '50%',
                marginTop: -20 * (newBrush.ratio || 1),
                marginLeft: -20,
                opacity: newBrush.softness > 0 ? 0.5 : 1,
                filter: newBrush.softness > 0 ? `blur(${newBrush.softness * 8}px)` : 'none',
              }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 text-sm rounded-lg border" style={{ borderColor: theme.border }}
            onClick={onClose}>Annuler</button>
          <button className="px-4 py-2 text-sm rounded-lg text-white" style={{ backgroundColor: theme.primary }}
            onClick={onCreate}>Créer</button>
        </div>
      </div>
    </div>
  );
};

export default BrushCreatorModal;
