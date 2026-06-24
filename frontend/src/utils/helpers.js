// ============================================
// SumiWire PRO - Helper Functions
// ============================================

// === ID GENERATION ===
export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// === DEEP CLONE ===
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// === LOCAL STORAGE ===
const STORAGE_KEY = 'sumiwire-project';
const BRUSHES_STORAGE_KEY = 'sumiwire-brushes';

// Shared list of persistable keys (DRY: used by saveToStorage + api.serializeState)
export const PERSISTABLE_KEYS = [
  'projectName', 'pages', 'activePageIndex', 'isDarkMode', 'viewMode',
  'zoom', 'panOffset', 'showGrid', 'showGuides', 'snapToGrid',
  'layoutLocked', 'drawing',
];

export const extractPersistableState = (state) => {
  const data = {};
  for (const key of PERSISTABLE_KEYS) {
    if (state[key] !== undefined) data[key] = state[key];
  }
  return data;
};

export const saveToStorage = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(extractPersistableState(state)));
    return true;
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
    return false;
  }
};

export const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Erreur chargement:', err);
    return null;
  }
};

// === BRUSHES STORAGE ===
export const saveBrushesToStorage = (brushes) => {
  try {
    // Only save custom brushes (not builtin)
    const customBrushes = brushes.filter(b => !b.builtin);
    localStorage.setItem(BRUSHES_STORAGE_KEY, JSON.stringify(customBrushes));
    return true;
  } catch (err) {
    console.error('Erreur sauvegarde brushes:', err);
    return false;
  }
};

export const loadBrushesFromStorage = () => {
  try {
    const data = localStorage.getItem(BRUSHES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Erreur chargement brushes:', err);
    return [];
  }
};

// === FILE OPERATIONS ===
export const readFileAsJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const readFileAsImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// === SAVE PROJECT WITH DIALOG ===
export const saveProjectWithDialog = async (projectData, defaultName) => {
  try {
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${defaultName}.manga`,
        types: [{
          description: 'SumiWire Project',
          accept: { 'application/json': ['.manga', '.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(projectData, null, 2));
      await writable.close();
      return true;
    } else {
      // Fallback for browsers without File System Access API
      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${defaultName}.manga`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Erreur sauvegarde:', err);
    }
    return false;
  }
};

// === EXPORT AS IMAGE ===
export const exportAsImage = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } catch (err) {
    console.error('Export error:', err);
    alert('Erreur lors de l\'export. Vérifiez la console.');
  }
};

// === SNAP TO GRID ===
export const snapToGrid = (value, gridSize = 10, threshold = 5) => {
  const remainder = value % gridSize;
  if (remainder < threshold) return value - remainder;
  if (gridSize - remainder < threshold) return value + (gridSize - remainder);
  return value;
};

// === CLAMP ===
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// === ANGLE BETWEEN POINTS ===
export const angleBetweenPoints = (cx, cy, ex, ey) => {
  const dy = ey - cy;
  const dx = ex - cx;
  const theta = Math.atan2(dy, dx); 
  return theta * (180 / Math.PI);
};

// === POINT ON ELLIPSE ===
export const pointOnEllipse = (cx, cy, rx, ry, angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
        x: cx + rx * Math.cos(rad),
        y: cy + ry * Math.sin(rad)
    };
};