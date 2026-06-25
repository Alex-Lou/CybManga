// ============================================
// SumiWire PRO - Main Toolbar
// Pro tools: eyedropper, fill, flip, stabilizer
// Color swatches & brush creator
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { TOOLBAR, cn } from '../../styles/tailwind';
import {
  LAYOUT_TEMPLATES, PANEL_TYPES, BUBBLE_TYPES, DRAWING_TOOLS,
} from '../../utils/constants';
import { readFileAsDataURL, saveBrushesToStorage } from '../../utils/helpers';
import ColorPickerContent from './ColorPickerContent';
import DrawingToolOptions from './DrawingToolOptions';
import BrushCreatorModal from './BrushCreatorModal';
import ToolbarViewControls from './ToolbarViewControls';

const Toolbar = ({ onToggleRefPanel, showRefPanel }) => {
  const { state, dispatch, theme } = useStudio();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [zoomInput, setZoomInput] = useState(Math.round(state.zoom * 100));
  const [showBrushCreator, setShowBrushCreator] = useState(false);
  const [newBrush, setNewBrush] = useState({ name: '', shape: 'circle', angle: 0, ratio: 1, softness: 0, pressureSize: true, pressureOpacity: false });
  const [activePalette, setActivePalette] = useState('manga');
  const [harmonyColors, setHarmonyColors] = useState(null);
  const [harmonyMood, setHarmonyMood] = useState(null);

  const dropdownTimeoutRef = useRef(null);
  const brushInputRef = useRef(null);
  const brushExportRef = useRef(null);

  useEffect(() => { setZoomInput(Math.round(state.zoom * 100)); }, [state.zoom]);

  const handleDropdownEnter = (name) => {
    if (dropdownTimeoutRef.current) { clearTimeout(dropdownTimeoutRef.current); dropdownTimeoutRef.current = null; }
    setOpenDropdown(name);
  };
  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 300);
  };
  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const handleDropdownMenuEnter = () => { if (dropdownTimeoutRef.current) { clearTimeout(dropdownTimeoutRef.current); dropdownTimeoutRef.current = null; } };

  useEffect(() => () => { if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current); }, []);

  const tools = [
    { id: 'select', icon: '🖱️', label: 'Sélection (V)' },
    { id: 'pan', icon: '✋', label: 'Main (H)' },
    { id: 'draw', icon: '✏️', label: 'Dessin (D)' },
  ];

  const handleApplyLayout = (key) => { dispatch({ type: ACTIONS.APPLY_LAYOUT, payload: key }); setOpenDropdown(null); };
  const handleAddPanel = (type) => { dispatch({ type: ACTIONS.ADD_PANEL, payload: { type, x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 } }); setOpenDropdown(null); };
  const handleAddBubble = (type) => { dispatch({ type: ACTIONS.ADD_BUBBLE, payload: { type, x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 } }); setOpenDropdown(null); };

  const handleZoomCommit = () => {
    let val = parseInt(zoomInput);
    if (isNaN(val)) { setZoomInput(Math.round(state.zoom * 100)); return; }
    val = Math.max(10, Math.min(500, val));
    dispatch({ type: ACTIONS.SET_ZOOM, payload: val / 100 });
    setZoomInput(val);
  };
  const handleZoomKeyDown = (e) => { if (e.key === 'Enter') { handleZoomCommit(); e.target.blur(); } };

  // === COLOR management ===
  const addRecentColor = (color) => {
    const recent = state.drawing.recentColors || [];
    const updated = [color, ...recent.filter(c => c !== color)].slice(0, 12);
    dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { recentColors: updated } });
  };

  const handleColorChange = (color) => {
    dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { color } });
    addRecentColor(color);
  };

  // === BRUSH IMPORT ===
  const handleImportBrush = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      // Import brush settings JSON
      try {
        const text = await file.text();
        const brushData = JSON.parse(text);
        if (brushData.name && brushData.shape) {
          dispatch({ type: ACTIONS.ADD_BRUSH, payload: brushData });
          const updatedBrushes = [...(state.brushes || []), brushData];
          saveBrushesToStorage(updatedBrushes);
          dispatch({ type: ACTIONS.SET_ACTIVE_BRUSH, payload: brushData.id || Date.now().toString() });
        }
      } catch { alert('Fichier brush JSON invalide.'); }
    } else if (file.type.startsWith('image/')) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        const brushName = file.name.replace(/\.[^/.]+$/, '');
        const newBr = { id: Date.now().toString(), name: brushName, type: 'texture', textureData: dataUrl, icon: '🖼️', pressureSize: true, pressureOpacity: false };
        dispatch({ type: ACTIONS.ADD_BRUSH, payload: newBr });
        saveBrushesToStorage([...(state.brushes || []), newBr]);
        dispatch({ type: ACTIONS.SET_ACTIVE_BRUSH, payload: newBr.id });
        setOpenDropdown(null);
      } catch { alert("Erreur lors de l'import de la brush"); }
    } else {
      alert('Formats acceptés: Image (PNG, JPG) ou JSON (.json)');
    }
    e.target.value = '';
  };

  // === BRUSH EXPORT ===
  const handleExportBrush = (brush) => {
    const exportData = { ...brush };
    delete exportData.builtin;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brush.name || 'brush'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // === BRUSH CREATOR ===
  const handleCreateBrush = () => {
    if (!newBrush.name.trim()) { alert('Donnez un nom à votre brush'); return; }
    const created = {
      id: Date.now().toString(),
      ...newBrush,
      type: 'shape',
      icon: newBrush.shape === 'circle' ? '●' : newBrush.shape === 'square' ? '■' : newBrush.shape === 'ellipse' ? '◆' : '▬',
    };
    dispatch({ type: ACTIONS.ADD_BRUSH, payload: created });
    saveBrushesToStorage([...(state.brushes || []), created]);
    dispatch({ type: ACTIONS.SET_ACTIVE_BRUSH, payload: created.id });
    setShowBrushCreator(false);
    setNewBrush({ name: '', shape: 'circle', angle: 0, ratio: 1, softness: 0, pressureSize: true, pressureOpacity: false });
  };

  const handleDeleteBrush = (brushId) => {
    if (confirm('Supprimer cette brush ?')) {
      dispatch({ type: ACTIONS.DELETE_BRUSH, payload: brushId });
      saveBrushesToStorage((state.brushes || []).filter(b => b.id !== brushId));
    }
  };

  const handleSelectBrush = (brushId) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_BRUSH, payload: brushId });
    setOpenDropdown(null);
  };

  const getActiveStyle = (isActive) => ({
    color: isActive ? theme.primary : theme.text,
    backgroundColor: isActive ? theme.selection : 'transparent',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    transition: 'all 0.1s ease'
  });

  const getDropdownItemStyle = (itemId) => ({
    backgroundColor: hoveredItem === itemId ? theme.selection : 'transparent',
    transition: 'background-color 0.15s ease',
  });

  const DropdownButton = ({ id, icon, label, children, wide }) => (
    <div className="relative" onMouseEnter={() => handleDropdownEnter(id)} onMouseLeave={handleDropdownLeave}>
      <button className={TOOLBAR.button} title={label} style={getActiveStyle(openDropdown === id)}
        onClick={(e) => { e.stopPropagation(); toggleDropdown(id); }}>
        {icon}<span className="text-xs ml-0.5">▾</span>
      </button>
      {openDropdown === id && (
        <>
          <div className="absolute left-0 right-0 h-3 top-full" onMouseEnter={handleDropdownMenuEnter} />
          <div className={TOOLBAR.dropdownMenu}
            style={{ backgroundColor: theme.surface, borderColor: theme.border, minWidth: wide ? '320px' : '220px', maxHeight: '500px', overflowY: 'auto', zIndex: 9999, position: 'absolute', top: '110%', left: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            onMouseEnter={handleDropdownMenuEnter} onMouseLeave={handleDropdownLeave}>
            {children}
          </div>
        </>
      )}
    </div>
  );

  const DropdownItem = ({ id, icon, label, onClick, disabled, extraClass = '', rightContent }) => (
    <div className={cn(TOOLBAR.dropdownItem, disabled && 'opacity-50 cursor-not-allowed', extraClass)}
      style={getDropdownItemStyle(id)} onMouseEnter={() => setHoveredItem(id)} onMouseLeave={() => setHoveredItem(null)}
      onClick={disabled ? undefined : onClick}>
      <span className="text-lg w-6 flex justify-center">{icon}</span>
      <span className="flex-1 truncate mx-2">{label}</span>
      {rightContent}
    </div>
  );

  return (
    <div className={TOOLBAR.container} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}>
      {/* Tool selection */}
      <div className={TOOLBAR.group}>
        {tools.map(t => (
          <button key={t.id} className={TOOLBAR.button} onClick={() => dispatch({ type: ACTIONS.SET_TOOL, payload: t.id })}
            title={t.label} style={getActiveStyle(state.activeTool === t.id)}>
            {t.icon}
          </button>
        ))}
      </div>

      <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

      {/* Layout / Panel / Bubble dropdowns */}
      <DropdownButton id="layout" icon="📐" label="Layouts">
        <div className="px-2 py-1 text-xs font-semibold opacity-50 uppercase">Templates de page</div>
        <DropdownItem id="layout-lock" icon={state.layoutLocked ? '🔒' : '🔓'} label={state.layoutLocked ? 'Layout verrouillé' : 'Layout déverrouillé'}
          onClick={() => dispatch({ type: ACTIONS.TOGGLE_LAYOUT_LOCK })} extraClass="border-b mb-1" />
        {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
          <DropdownItem key={key} id={`layout-${key}`} icon={template.icon} label={template.name}
            onClick={() => handleApplyLayout(key)} disabled={state.layoutLocked} />
        ))}
      </DropdownButton>

      <DropdownButton id="panel" icon="⬜" label="Cases">
        <div className="px-2 py-1 text-xs font-semibold opacity-50 uppercase">Ajouter une case</div>
        {Object.entries(PANEL_TYPES).map(([key, type]) => (
          <DropdownItem key={key} id={`panel-${key}`} icon={type.icon} label={type.name} onClick={() => handleAddPanel(key)} />
        ))}
      </DropdownButton>

      <DropdownButton id="bubble" icon="💬" label="Bulles">
        <div className="px-2 py-1 text-xs font-semibold opacity-50 uppercase">Ajouter une bulle</div>
        {Object.entries(BUBBLE_TYPES).map(([key, type]) => (
          <DropdownItem key={key} id={`bubble-${key}`} icon={type.icon} label={type.name} onClick={() => handleAddBubble(key)} />
        ))}
      </DropdownButton>

      <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

      {/* === DRAWING TOOLS (when draw active) === */}
      {state.activeTool === 'draw' && (
        <>
          {/* Drawing tool buttons */}
          <div className={TOOLBAR.group}>
            {Object.entries(DRAWING_TOOLS).map(([key, t]) => (
              <button key={key} className={TOOLBAR.button}
                onClick={() => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { tool: key } })}
                title={t.name} style={getActiveStyle(state.drawing.tool === key)}>
                {t.icon}
              </button>
            ))}
          </div>

          <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

          {/* BRUSH SELECTOR */}
          <DropdownButton id="brush" icon="🖌️" label="Brushes">
            <div className="px-2 py-1 text-xs font-semibold opacity-50 uppercase">Brushes</div>
            <DropdownItem id="brush-import" icon="📥" label="Importer (Image/JSON)..."
              onClick={() => brushInputRef.current?.click()} extraClass="border-b mb-1" />
            <DropdownItem id="brush-create" icon="✨" label="Créer une brush..."
              onClick={() => { setShowBrushCreator(true); setOpenDropdown(null); }} extraClass="border-b mb-1" />

            {(state.brushes || []).map((brush) => (
              <DropdownItem key={brush.id} id={`brush-${brush.id}`}
                icon={brush.type === 'texture' ? '🖼️' : (brush.icon || '🖌️')} label={brush.name}
                onClick={() => handleSelectBrush(brush.id)}
                rightContent={
                  <div className="flex items-center gap-1">
                    {state.drawing.brushId === brush.id && <span className="text-xs text-green-500 font-bold">✓</span>}
                    <button className="text-xs opacity-40 hover:opacity-100 p-1" title="Exporter"
                      onClick={(e) => { e.stopPropagation(); handleExportBrush(brush); }}>💾</button>
                    {!brush.builtin && (
                      <button className="text-xs text-gray-400 hover:text-red-500 p-1"
                        onClick={(e) => { e.stopPropagation(); handleDeleteBrush(brush.id); }} title="Supprimer">✕</button>
                    )}
                  </div>
                }
              />
            ))}
          </DropdownButton>

          <input ref={brushInputRef} type="file" accept="image/*,.json" onChange={handleImportBrush} className="hidden" />

          <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

          {/* COLOR PICKER PRO */}
          <DropdownButton id="colors" icon={
            <div className="w-5 h-5 rounded border" style={{ backgroundColor: state.drawing.color, borderColor: theme.border }} />
          } label="Couleurs" wide>
            <ColorPickerContent
              drawing={state.drawing}
              theme={theme}
              activePalette={activePalette}
              setActivePalette={setActivePalette}
              harmonyMood={harmonyMood}
              setHarmonyMood={setHarmonyMood}
              harmonyColors={harmonyColors}
              setHarmonyColors={setHarmonyColors}
              onColorChange={handleColorChange}
            />
          </DropdownButton>

          <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

          {/* Size slider */}
          <div className={TOOLBAR.group + ' gap-2'}>
            <span className={TOOLBAR.sliderLabel}>Taille:</span>
            <input type="range" min="1" max="100" value={state.drawing.size}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { size: parseInt(e.target.value) } })}
              className={TOOLBAR.slider} />
            <span className={TOOLBAR.sliderLabel} style={{ minWidth: '30px' }}>{state.drawing.size}px</span>
          </div>

          {/* Opacity slider */}
          <div className={TOOLBAR.group + ' gap-2'}>
            <span className={TOOLBAR.sliderLabel}>Opacité:</span>
            <input type="range" min="0.1" max="1" step="0.1" value={state.drawing.opacity}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { opacity: parseFloat(e.target.value) } })}
              className={TOOLBAR.slider} />
            <span className={TOOLBAR.sliderLabel} style={{ minWidth: '30px' }}>{Math.round(state.drawing.opacity * 100)}%</span>
          </div>

          {/* Stabilization slider */}
          <div className={TOOLBAR.group + ' gap-2'}>
            <span className={TOOLBAR.sliderLabel} title="Stabilisation du trait (lissage)">Stab:</span>
            <input type="range" min="0" max="10" value={state.drawing.stabilization ?? 5}
              onChange={(e) => dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { stabilization: parseInt(e.target.value) } })}
              className={TOOLBAR.slider} />
            <span className={TOOLBAR.sliderLabel} style={{ minWidth: '18px' }}>{state.drawing.stabilization ?? 5}</span>
          </div>

          <div className={TOOLBAR.groupDivider} style={{ backgroundColor: theme.border }} />

          {/* === TIER 1 PRO TOOLS === */}

          {/* Symmetry mode */}
          <DropdownButton id="symmetry" icon="🪞" label="Symétrie">
            <div className="px-2 py-1 text-xs font-semibold opacity-50 uppercase">Mode symétrie</div>
            {[
              { id: 'off', label: 'Désactivé', icon: '✕' },
              { id: 'vertical', label: 'Vertical ↕', icon: '│' },
              { id: 'horizontal', label: 'Horizontal ↔', icon: '─' },
              { id: 'both', label: 'Les deux ✚', icon: '┼' },
            ].map(m => (
              <DropdownItem key={m.id} id={`sym-${m.id}`} icon={m.icon} label={m.label}
                onClick={() => { dispatch({ type: ACTIONS.SET_DRAWING_SETTINGS, payload: { symmetryMode: m.id } }); setOpenDropdown(null); }}
                rightContent={state.drawing.symmetryMode === m.id ? <span className="text-xs font-bold" style={{ color: theme.primary }}>✓</span> : null}
              />
            ))}
          </DropdownButton>

          {/* Outils par outil (shape, alpha, gap/speed/focus/screentone/gradient) */}
          <DrawingToolOptions drawing={state.drawing} dispatch={dispatch} theme={theme} getActiveStyle={getActiveStyle} />

          {/* Rotation controls */}
          <div className={TOOLBAR.group + ' gap-1'}>
            <button className={TOOLBAR.button}
              onClick={() => dispatch({ type: ACTIONS.SET_CANVAS_ROTATION, payload: (state.canvasRotation || 0) - 15 })}
              title="Rotation -15°" style={{ fontSize: '12px' }}>↺</button>
            <button className={TOOLBAR.button}
              onClick={() => dispatch({ type: ACTIONS.SET_CANVAS_ROTATION, payload: (state.canvasRotation || 0) + 15 })}
              title="Rotation +15°" style={{ fontSize: '12px' }}>↻</button>
            {state.canvasRotation !== 0 && (
              <button className={TOOLBAR.button}
                onClick={() => dispatch({ type: ACTIONS.SET_CANVAS_ROTATION, payload: 0 })}
                title="Reset rotation" style={{ fontSize: '10px', color: theme.accent }}>
                {Math.round(state.canvasRotation)}°
              </button>
            )}
          </div>
        </>
      )}

      <div className="flex-1" />

      <ToolbarViewControls
        state={state}
        dispatch={dispatch}
        theme={theme}
        getActiveStyle={getActiveStyle}
        zoomInput={zoomInput}
        setZoomInput={setZoomInput}
        onZoomCommit={handleZoomCommit}
        onZoomKeyDown={handleZoomKeyDown}
        onToggleRefPanel={onToggleRefPanel}
        showRefPanel={showRefPanel}
      />

      {/* === BRUSH CREATOR MODAL === */}
      <BrushCreatorModal
        show={showBrushCreator}
        newBrush={newBrush}
        setNewBrush={setNewBrush}
        onCreate={handleCreateBrush}
        onClose={() => setShowBrushCreator(false)}
        theme={theme}
      />
    </div>
  );
};

export default Toolbar;
