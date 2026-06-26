// ============================================
// SumiWire PRO - Settings Modal
// Tabs: Appearance, Canvas, Keybindings, Tablet
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { MODAL, cn } from '../../styles/tailwind';
import {
  DEFAULT_KEYBINDINGS,
  TABLET_PRESETS,
  formatKeybinding,
  loadKeybindings,
  saveKeybindings,
  loadTabletPreset,
  saveTabletPreset,
} from '../../utils/keybindings';

const SettingsModal = () => {
  const { state, dispatch, theme } = useStudio();
  const [activeTab, setActiveTab] = useState('appearance');
  const [keybindings, setKeybindings] = useState(() => loadKeybindings());
  const [editingKey, setEditingKey] = useState(null);
  const [tabletPreset, setTabletPreset] = useState(() => loadTabletPreset());
  const captureRef = useRef(null);

  if (!state.showSettings) return null;

  const handleClose = () => dispatch({ type: ACTIONS.TOGGLE_SETTINGS });
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) handleClose(); };

  const Toggle = ({ checked, onChange }) => (
    <button
      className={cn('w-14 h-7 rounded-full transition-colors relative', checked ? 'bg-blue-500' : 'bg-gray-300')}
      onClick={onChange}
    >
      <span className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-transform shadow-sm', checked ? 'translate-x-8' : 'translate-x-1')} />
    </button>
  );

  // --- Keybinding capture ---
  const startCapture = (actionId) => {
    setEditingKey(actionId);
  };

  const handleKeyCapture = (e) => {
    if (!editingKey) return;
    e.preventDefault();
    e.stopPropagation();
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

    const newBinding = {
      ...keybindings[editingKey],
      key: e.key,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };
    const updated = { ...keybindings, [editingKey]: newBinding };
    setKeybindings(updated);
    saveKeybindings(updated);
    setEditingKey(null);
  };

  const resetKeybindings = () => {
    setKeybindings({ ...DEFAULT_KEYBINDINGS });
    saveKeybindings({ ...DEFAULT_KEYBINDINGS });
  };

  // --- Tablet ---
  const handleTabletPresetChange = (presetId) => {
    setTabletPreset(presetId);
    saveTabletPreset(presetId);
  };

  const tabs = [
    { id: 'appearance', label: '🎨 Apparence' },
    { id: 'canvas', label: '📐 Canvas' },
    { id: 'shortcuts', label: '⌨️ Raccourcis' },
    { id: 'tablet', label: '🖊️ Tablette' },
  ];

  // Visible keybinding actions for the settings panel
  const displayActions = [
    'select', 'pan', 'draw', 'brush', 'eraser',
    'undo', 'redo', 'save', 'copy', 'paste', 'selectAll', 'delete',
    'toggleGrid', 'toggleGuides', 'toggleSnap',
    'viewSingle', 'viewSpread', 'viewAll',
    'zoomReset', 'zoomIn', 'zoomOut',
    'brushSize1', 'brushSize2',
    'flipH', 'flipV',
  ];

  return (
    <div className={MODAL.overlay} onClick={handleBackdropClick} onKeyDown={editingKey ? handleKeyCapture : undefined}>
      <div
        className="rounded-xl shadow-2xl w-full mx-4 max-h-[85vh] flex flex-col"
        style={{ backgroundColor: theme.surface, color: theme.text, maxWidth: 760 }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
          <h2 className="text-lg font-semibold">⚙️ Paramètres</h2>
          <button className="p-1.5 rounded transition-colors text-lg" onClick={handleClose}>✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b px-2 gap-1" style={{ borderColor: theme.border }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="px-3 py-2.5 text-sm font-medium rounded-t transition-colors"
              style={{
                color: activeTab === tab.id ? theme.primary : theme.textSecondary,
                borderBottom: activeTab === tab.id ? `2px solid ${theme.primary}` : '2px solid transparent',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* === APPEARANCE === */}
          {activeTab === 'appearance' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm">Mode sombre</span>
                <Toggle checked={state.isDarkMode} onChange={() => dispatch({ type: ACTIONS.TOGGLE_DARK_MODE })} />
              </div>
            </section>
          )}

          {/* === CANVAS === */}
          {activeTab === 'canvas' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm">Afficher la grille</span>
                <Toggle checked={state.showGrid} onChange={() => dispatch({ type: ACTIONS.TOGGLE_GRID })} />
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm">Afficher les guides</span>
                <Toggle checked={state.showGuides} onChange={() => dispatch({ type: ACTIONS.TOGGLE_GUIDES })} />
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm">Magnétisme</span>
                <Toggle checked={state.snapToGrid} onChange={() => dispatch({ type: ACTIONS.TOGGLE_SNAP })} />
              </div>
            </section>
          )}

          {/* === SHORTCUTS === */}
          {activeTab === 'shortcuts' && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Cliquez sur un raccourci pour le modifier, puis appuyez sur la nouvelle touche.
                </p>
                <button
                  className="px-3 py-1.5 text-xs rounded-lg border transition-colors"
                  style={{ borderColor: theme.border, color: theme.textSecondary }}
                  onClick={resetKeybindings}
                >
                  Réinitialiser
                </button>
              </div>

              <div className="space-y-1">
                {displayActions.map(actionId => {
                  const binding = keybindings[actionId];
                  if (!binding) return null;
                  const isEditing = editingKey === actionId;
                  return (
                    <div
                      key={actionId}
                      className="flex items-center justify-between py-2 px-2 rounded transition-colors"
                      style={{ backgroundColor: isEditing ? theme.selection : 'transparent' }}
                    >
                      <span className="text-sm">{binding.label}</span>
                      <button
                        ref={isEditing ? captureRef : null}
                        className="px-3 py-1.5 rounded text-xs font-mono min-w-20 text-center transition-all"
                        style={{
                          backgroundColor: isEditing ? theme.primary : theme.bg,
                          color: isEditing ? '#fff' : theme.text,
                          border: `1px solid ${isEditing ? theme.primary : theme.border}`,
                        }}
                        onClick={() => startCapture(actionId)}
                        onKeyDown={isEditing ? handleKeyCapture : undefined}
                        tabIndex={0}
                      >
                        {isEditing ? '...' : formatKeybinding(binding)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* === TABLET === */}
          {activeTab === 'tablet' && (
            <section>
              <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
                Sélectionnez votre modèle de tablette pour voir les raccourcis recommandés.
                Les boutons physiques se configurent dans le pilote de votre tablette — ce guide vous montre quelles touches assigner.
              </p>

              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Modèle de tablette</label>
                <select
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
                  value={tabletPreset || ''}
                  onChange={(e) => handleTabletPresetChange(e.target.value || null)}
                >
                  <option value="">Aucun (souris)</option>
                  {Object.entries(TABLET_PRESETS).map(([id, preset]) => (
                    <option key={id} value={id}>{preset.brand} — {preset.name}</option>
                  ))}
                </select>
              </div>

              {tabletPreset && TABLET_PRESETS[tabletPreset] && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold mb-2">
                    Assignation recommandée — {TABLET_PRESETS[tabletPreset].name}
                  </h4>
                  <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
                    Dans le pilote {TABLET_PRESETS[tabletPreset].brand}, assignez ces touches clavier aux boutons de votre tablette :
                  </p>
                  {TABLET_PRESETS[tabletPreset].buttons.map(btn => {
                    const binding = keybindings[btn.defaultAction];
                    return (
                      <div
                        key={btn.id}
                        className="flex items-center justify-between py-2 px-2 rounded"
                        style={{ backgroundColor: theme.bg }}
                      >
                        <span className="text-sm">{btn.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: theme.textSecondary }}>
                            {binding?.label}
                          </span>
                          <kbd
                            className="px-2.5 py-1 rounded text-xs font-mono"
                            style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
                          >
                            {formatKeybinding(binding)}
                          </kbd>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!tabletPreset && (
                <div className="text-center py-8" style={{ color: theme.textMuted }}>
                  <div className="text-3xl mb-2">🖊️</div>
                  <p className="text-sm">Sélectionnez un modèle pour voir le guide de configuration</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: theme.border }}>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: theme.border, color: theme.text }}
            onClick={handleClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
