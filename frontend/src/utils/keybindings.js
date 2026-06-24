// ============================================
// SumiWire PRO - Keybinding System
// Customizable shortcuts + tablet presets
// ============================================

const STORAGE_KEY = 'sumiwire-keybindings';

// Default keybinding map: actionId → { key, ctrl, shift, alt, label }
export const DEFAULT_KEYBINDINGS = {
  select:       { key: 'v', ctrl: false, shift: false, alt: false, label: 'Sélection' },
  pan:          { key: 'h', ctrl: false, shift: false, alt: false, label: 'Main (Pan)' },
  draw:         { key: 'd', ctrl: false, shift: false, alt: false, label: 'Dessin' },
  undo:         { key: 'z', ctrl: true,  shift: false, alt: false, label: 'Annuler' },
  redo:         { key: 'y', ctrl: true,  shift: false, alt: false, label: 'Rétablir' },
  redoAlt:      { key: 'z', ctrl: true,  shift: true,  alt: false, label: 'Rétablir (Alt)' },
  save:         { key: 's', ctrl: true,  shift: false, alt: false, label: 'Sauvegarder' },
  newProject:   { key: 'n', ctrl: true,  shift: false, alt: false, label: 'Nouveau projet' },
  open:         { key: 'o', ctrl: true,  shift: false, alt: false, label: 'Ouvrir' },
  copy:         { key: 'c', ctrl: true,  shift: false, alt: false, label: 'Copier' },
  paste:        { key: 'v', ctrl: true,  shift: false, alt: false, label: 'Coller' },
  selectAll:    { key: 'a', ctrl: true,  shift: false, alt: false, label: 'Tout sélectionner' },
  delete:       { key: 'Delete', ctrl: false, shift: false, alt: false, label: 'Supprimer' },
  deleteAlt:    { key: 'Backspace', ctrl: false, shift: false, alt: false, label: 'Supprimer (Alt)' },
  toggleGrid:   { key: 'g', ctrl: false, shift: false, alt: false, label: 'Grille' },
  toggleGuides: { key: 'g', ctrl: false, shift: true,  alt: false, label: 'Guides' },
  toggleSnap:   { key: 's', ctrl: false, shift: false, alt: false, label: 'Magnétisme' },
  viewSingle:   { key: '1', ctrl: false, shift: false, alt: false, label: 'Vue page' },
  viewSpread:   { key: '2', ctrl: false, shift: false, alt: false, label: 'Vue double' },
  viewAll:      { key: '3', ctrl: false, shift: false, alt: false, label: 'Vue toutes' },
  zoomReset:    { key: '0', ctrl: true,  shift: false, alt: false, label: 'Zoom 100%' },
  zoomIn:       { key: '+', ctrl: true,  shift: false, alt: false, label: 'Zoom +' },
  zoomOut:      { key: '-', ctrl: true,  shift: false, alt: false, label: 'Zoom -' },
  brushSize1:   { key: '[', ctrl: false, shift: false, alt: false, label: 'Taille -' },
  brushSize2:   { key: ']', ctrl: false, shift: false, alt: false, label: 'Taille +' },
  eraser:       { key: 'e', ctrl: false, shift: false, alt: false, label: 'Gomme' },
  brush:        { key: 'b', ctrl: false, shift: false, alt: false, label: 'Pinceau' },
  flipH:        { key: 'h', ctrl: false, shift: true,  alt: false, label: 'Retourner H' },
  flipV:        { key: 'v', ctrl: false, shift: true,  alt: false, label: 'Retourner V' },
};

// Tablet presets — common button mappings
export const TABLET_PRESETS = {
  wacom_intuos: {
    name: 'Wacom Intuos',
    brand: 'Wacom',
    buttons: [
      { id: 'pen_button1', label: 'Bouton stylet 1', defaultAction: 'eraser' },
      { id: 'pen_button2', label: 'Bouton stylet 2', defaultAction: 'pan' },
      { id: 'tablet_1', label: 'Touche tablette 1', defaultAction: 'undo' },
      { id: 'tablet_2', label: 'Touche tablette 2', defaultAction: 'redo' },
      { id: 'tablet_3', label: 'Touche tablette 3', defaultAction: 'brushSize1' },
      { id: 'tablet_4', label: 'Touche tablette 4', defaultAction: 'brushSize2' },
    ],
  },
  wacom_cintiq: {
    name: 'Wacom Cintiq',
    brand: 'Wacom',
    buttons: [
      { id: 'pen_button1', label: 'Bouton stylet 1', defaultAction: 'eraser' },
      { id: 'pen_button2', label: 'Bouton stylet 2', defaultAction: 'pan' },
      { id: 'express_1', label: 'ExpressKey 1', defaultAction: 'undo' },
      { id: 'express_2', label: 'ExpressKey 2', defaultAction: 'redo' },
      { id: 'express_3', label: 'ExpressKey 3', defaultAction: 'brush' },
      { id: 'express_4', label: 'ExpressKey 4', defaultAction: 'eraser' },
      { id: 'express_5', label: 'ExpressKey 5', defaultAction: 'zoomIn' },
      { id: 'express_6', label: 'ExpressKey 6', defaultAction: 'zoomOut' },
    ],
  },
  xppen_deco: {
    name: 'XP-Pen Deco',
    brand: 'XP-Pen',
    buttons: [
      { id: 'pen_button1', label: 'Bouton stylet 1', defaultAction: 'eraser' },
      { id: 'pen_button2', label: 'Bouton stylet 2', defaultAction: 'pan' },
      { id: 'k1', label: 'Touche K1', defaultAction: 'undo' },
      { id: 'k2', label: 'Touche K2', defaultAction: 'redo' },
      { id: 'k3', label: 'Touche K3', defaultAction: 'brush' },
      { id: 'k4', label: 'Touche K4', defaultAction: 'eraser' },
      { id: 'k5', label: 'Touche K5', defaultAction: 'brushSize1' },
      { id: 'k6', label: 'Touche K6', defaultAction: 'brushSize2' },
    ],
  },
  xppen_artist: {
    name: 'XP-Pen Artist',
    brand: 'XP-Pen',
    buttons: [
      { id: 'pen_button1', label: 'Bouton stylet 1', defaultAction: 'eraser' },
      { id: 'pen_button2', label: 'Bouton stylet 2', defaultAction: 'pan' },
      { id: 'k1', label: 'Touche K1', defaultAction: 'undo' },
      { id: 'k2', label: 'Touche K2', defaultAction: 'redo' },
      { id: 'k3', label: 'Touche K3', defaultAction: 'select' },
      { id: 'k4', label: 'Touche K4', defaultAction: 'draw' },
      { id: 'k5', label: 'Touche K5', defaultAction: 'zoomIn' },
      { id: 'k6', label: 'Touche K6', defaultAction: 'zoomOut' },
      { id: 'dial_cw', label: 'Molette ↻', defaultAction: 'brushSize2' },
      { id: 'dial_ccw', label: 'Molette ↺', defaultAction: 'brushSize1' },
    ],
  },
  huion_kamvas: {
    name: 'Huion Kamvas',
    brand: 'Huion',
    buttons: [
      { id: 'pen_button1', label: 'Bouton stylet 1', defaultAction: 'eraser' },
      { id: 'pen_button2', label: 'Bouton stylet 2', defaultAction: 'pan' },
      { id: 'k1', label: 'Touche K1', defaultAction: 'undo' },
      { id: 'k2', label: 'Touche K2', defaultAction: 'redo' },
      { id: 'k3', label: 'Touche K3', defaultAction: 'brush' },
      { id: 'k4', label: 'Touche K4', defaultAction: 'eraser' },
      { id: 'k5', label: 'Touche K5', defaultAction: 'brushSize1' },
      { id: 'k6', label: 'Touche K6', defaultAction: 'brushSize2' },
    ],
  },
};

// Format a keybinding for display
export const formatKeybinding = (binding) => {
  if (!binding) return '—';
  const parts = [];
  if (binding.ctrl) parts.push('Ctrl');
  if (binding.shift) parts.push('Maj');
  if (binding.alt) parts.push('Alt');
  const keyDisplay = binding.key.length === 1 ? binding.key.toUpperCase() : binding.key;
  parts.push(keyDisplay);
  return parts.join('+');
};

// Check if a keyboard event matches a binding
export const matchesBinding = (e, binding) => {
  if (!binding) return false;
  const ctrl = e.ctrlKey || e.metaKey;
  return (
    e.key.toLowerCase() === binding.key.toLowerCase() &&
    ctrl === !!binding.ctrl &&
    e.shiftKey === !!binding.shift &&
    e.altKey === !!binding.alt
  );
};

// Load custom keybindings from localStorage
export const loadKeybindings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_KEYBINDINGS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_KEYBINDINGS };
};

// Save keybindings to localStorage
export const saveKeybindings = (bindings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  } catch { /* ignore */ }
};

// Load tablet preset from localStorage
export const loadTabletPreset = () => {
  try {
    const saved = localStorage.getItem('sumiwire-tablet-preset');
    return saved || null;
  } catch { return null; }
};

export const saveTabletPreset = (presetId) => {
  try {
    localStorage.setItem('sumiwire-tablet-preset', presetId);
  } catch { /* ignore */ }
};
