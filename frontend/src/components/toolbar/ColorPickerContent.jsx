// ============================================
// SumiWire PRO - Contenu du sélecteur de couleurs (présentationnel)
// ============================================

import React from 'react';
import { COLOR_PALETTES } from '../../utils/constants';
import { generateHarmonyPalette, MOOD_PROFILES } from '../../utils/colorHarmony';

const ColorPickerContent = ({
  drawing, theme, activePalette, setActivePalette,
  harmonyMood, setHarmonyMood, harmonyColors, setHarmonyColors, onColorChange,
}) => {
  return (
    <div className="p-3 space-y-3">
      {/* Main picker */}
      <div className="flex items-center gap-3">
        <input type="color" value={drawing.color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-10 h-10 rounded border-2 cursor-pointer" style={{ borderColor: theme.border }} />
        <div className="flex-1">
          <input type="text" value={drawing.color}
            onChange={(e) => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onColorChange(e.target.value); }}
            className="w-full px-2 py-1 text-xs font-mono rounded border"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }} />
        </div>
      </div>

      {/* Recent colors */}
      {(drawing.recentColors?.length > 0) && (
        <div>
          <div className="text-xs opacity-50 mb-1">Récentes</div>
          <div className="flex flex-wrap gap-1">
            {drawing.recentColors.map((c, i) => (
              <button key={i} className="w-5 h-5 rounded border hover:scale-125 transition-transform"
                style={{ backgroundColor: c, borderColor: theme.border }}
                onClick={() => onColorChange(c)} title={c} />
            ))}
          </div>
        </div>
      )}

      {/* Palette selector */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <select className="text-xs rounded border px-1 py-0.5 flex-1"
            style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
            value={activePalette} onChange={(e) => setActivePalette(e.target.value)}>
            {Object.entries(COLOR_PALETTES).map(([id, pal]) => (
              <option key={id} value={id}>{pal.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1">
          {COLOR_PALETTES[activePalette]?.colors.map((c, i) => (
            <button key={i} className="w-5 h-5 rounded border hover:scale-125 transition-transform"
              style={{ backgroundColor: c, borderColor: theme.border }}
              onClick={() => onColorChange(c)} title={c} />
          ))}
        </div>
      </div>
      {/* Harmony moods */}
      <div>
        <div className="text-xs opacity-50 mb-1">Harmonie par mood</div>
        <div className="flex flex-wrap gap-1 mb-1">
          {Object.entries(MOOD_PROFILES).map(([id, mood]) => (
            <button key={id}
              className="px-1.5 py-0.5 text-xs rounded border transition-all hover:opacity-80"
              style={{
                borderColor: harmonyMood === id ? theme.primary : theme.border,
                backgroundColor: harmonyMood === id ? `${theme.primary}20` : 'transparent',
                color: theme.text,
              }}
              onClick={() => { setHarmonyMood(id); setHarmonyColors(generateHarmonyPalette(id)); }}
              title={mood.name}>
              {mood.icon}
            </button>
          ))}
        </div>
        {harmonyColors && (
          <div className="flex gap-1">
            {harmonyColors.map((c, i) => (
              <button key={i} className="w-6 h-6 rounded border hover:scale-125 transition-transform"
                style={{ backgroundColor: c, borderColor: theme.border }}
                onClick={() => onColorChange(c)} title={c} />
            ))}
            <button className="text-xs px-1 rounded hover:opacity-70" style={{ color: theme.textSecondary }}
              onClick={() => setHarmonyColors(generateHarmonyPalette(harmonyMood))}>🔄</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPickerContent;
