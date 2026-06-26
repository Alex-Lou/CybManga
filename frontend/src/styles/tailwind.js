// ============================================
// SumiWire PRO - CYBERPUNK / NEON SCI-FI Styles
// Dark-first design, neon cyan/magenta accents
// ============================================

// === LAYOUT ===
export const LAYOUT = {
  appContainer: 'h-dvh w-full flex flex-col overflow-hidden max-h-screen',
  mainContent: 'flex flex-1 min-h-0 overflow-hidden relative',
  sidebar: 'w-56 lg:w-64 flex-shrink-0 flex flex-col border-r overflow-hidden',
  sidebarSection: 'p-2.5 border-b',
  sidebarTitle: 'text-xs font-semibold uppercase tracking-widest mb-2 opacity-60',
  sidebarContent: 'flex-1 overflow-y-auto',
  canvasContainer: 'flex-1 min-w-0 relative overflow-hidden',
  canvasWrapper: 'absolute inset-0',
  propertiesPanel: 'w-64 lg:w-72 flex-shrink-0 border-l flex flex-col overflow-hidden hidden md:flex',
  propertiesPanelContent: 'flex-1 overflow-y-auto p-3 space-y-3',
};

// === HEADER ===
export const HEADER = {
  container: 'h-11 flex-shrink-0 flex items-center border-b px-3 gap-1.5',
  menuButton: 'px-2.5 py-1.5 text-sm font-medium rounded transition-all duration-200 relative hover:opacity-90',
  menuButtonActive: 'font-semibold',
  dropdown: 'absolute top-full left-0 mt-1 py-1.5 rounded-lg shadow-xl border min-w-48 z-50',
  dropdownItem: 'px-3.5 py-2 text-sm flex items-center gap-2.5 transition-all duration-150 cursor-pointer',
  dropdownItemDisabled: 'opacity-40 cursor-not-allowed',
  dropdownDivider: 'my-1 border-t',
  dropdownShortcut: 'ml-auto text-xs opacity-50 font-mono',
  spacer: 'flex-1',
  toolGroup: 'flex items-center gap-1.5 px-2.5 border-l border-r',
  viewButton: 'p-1.5 rounded text-lg transition-all duration-200',
  viewButtonActive: 'font-semibold',
};

// === TOOLBAR ===
export const TOOLBAR = {
  container: 'flex-shrink-0 flex items-center gap-1.5 p-2 border-b',
  group: 'flex items-center gap-1',
  groupDivider: 'w-px h-6 mx-2 opacity-30',
  button: 'p-2 rounded text-lg transition-all duration-200 hover:opacity-80 active:scale-95',
  buttonActive: 'shadow-inner',
  buttonDisabled: 'opacity-30 cursor-not-allowed hover:opacity-30',
  dropdown: 'relative',
  dropdownMenu: 'absolute top-full left-0 mt-1 py-2 rounded-lg shadow-xl border min-w-44 z-50',
  dropdownItem: 'px-3.5 py-2 flex items-center gap-2.5 transition-all duration-150 cursor-pointer text-sm',
  colorSwatch: 'w-8 h-8 rounded border-2 cursor-pointer hover:scale-110 transition-transform',
  slider: 'w-24 h-1.5 rounded-full appearance-none cursor-pointer',
  sliderLabel: 'text-xs opacity-70 font-mono',
};

// === SIDEBAR ===
export const SIDEBAR = {
  container: 'w-56 lg:w-60 flex-shrink-0 flex flex-col border-r',
  pagesHeader: 'p-2 flex items-center justify-between border-b',
  pagesTitle: 'text-sm font-semibold uppercase tracking-wider',
  pagesActions: 'flex gap-1',
  pagesActionBtn: 'p-1.5 rounded transition-all duration-200 text-base hover:opacity-80',
  pagesList: 'flex-1 overflow-y-auto p-2 space-y-2',
  pageThumb: 'relative rounded border-2 cursor-pointer transition-all duration-200 overflow-hidden group',
  pageThumbActive: 'ring-2',
  pageThumbNumber: 'absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded font-mono',
  pageThumbDelete: 'absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
  layersHeader: 'p-2 flex items-center justify-between border-b border-t',
  layerItem: 'p-2 flex items-center gap-2 rounded cursor-pointer transition-all duration-200 text-sm hover:opacity-90',
  layerItemActive: '',
  layerIcon: 'text-lg',
  layerName: 'flex-1 text-sm truncate',
  layerActions: 'flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
};

// === CANVAS ===
export const CANVAS = {
  container: 'flex-1 min-w-0 min-h-0 relative overflow-auto',
  wrapper: 'relative min-w-max min-h-max',
  inner: 'relative min-w-full min-h-full flex items-center justify-center p-4',
  page: 'relative shadow-2xl transition-shadow manga-page',
  pageContent: 'absolute inset-0 overflow-hidden',
  safeArea: 'absolute pointer-events-none border-2 border-dashed',
  bleedArea: 'absolute pointer-events-none border-2 border-dashed',
  grid: 'absolute inset-0 pointer-events-none opacity-15',
  singleView: 'flex items-center justify-center',
  spreadView: 'flex items-center justify-center gap-1',
  allView: 'flex flex-wrap gap-4 p-4 items-start content-start',
};

// === PANELS (Cases) ===
export const PANEL = {
  container: 'absolute cursor-move transition-shadow',
  selected: 'ring-2 ring-offset-2',
  locked: 'cursor-not-allowed opacity-80',
  handles: 'absolute inset-0 pointer-events-none',
  handle: 'absolute w-3 h-3 border-2 rounded-sm pointer-events-auto cursor-pointer transition-transform hover:scale-125',
  handleN: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize',
  handleS: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize',
  handleE: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-e-resize',
  handleW: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-w-resize',
  handleNE: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize',
  handleNW: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize',
  handleSE: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize',
  handleSW: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize',
};

// === BUBBLES ===
export const BUBBLE = {
  container: 'absolute cursor-move',
  selected: 'ring-2 ring-offset-1',
  content: 'relative w-full h-full flex items-center justify-center overflow-visible',
  textWrapper: 'absolute inset-0 flex items-center justify-center p-2 pointer-events-none',
  text: 'text-center break-words pointer-events-auto cursor-text',
  textUnlocked: 'cursor-move border border-dashed',
  tailHandle: 'absolute w-3.5 h-3.5 rounded-full cursor-move border-2 shadow-lg hover:scale-125 transition-transform z-20',
  handle: 'absolute w-3 h-3 border-2 rounded-sm pointer-events-auto cursor-pointer transition-transform hover:scale-125',
};

// === PROPERTIES PANEL ===
export const PROPERTIES = {
  container: 'w-64 lg:w-72 flex-shrink-0 border-l flex flex-col h-full',
  header: 'p-2.5 border-b font-semibold text-sm uppercase tracking-wider',
  content: 'flex-1 overflow-y-auto p-3 space-y-3',
  section: 'space-y-2',
  sectionTitle: 'text-xs font-semibold uppercase tracking-widest opacity-50',
  row: 'flex items-center gap-2',
  label: 'text-xs opacity-70 w-16 shrink-0 font-mono',
  input: 'flex-1 px-2.5 py-1.5 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-30 transition-all',
  inputSmall: 'w-16 px-2 py-1.5 text-xs rounded border text-center font-mono',
  select: 'flex-1 px-2.5 py-1.5 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-30 appearance-none cursor-pointer',
  colorInput: 'w-7 h-7 rounded border cursor-pointer',
  checkbox: 'w-4 h-4 rounded border cursor-pointer',
  checkboxLabel: 'text-sm',
  button: 'flex-1 px-2.5 py-1.5 text-sm rounded border transition-all duration-200',
  buttonPrimary: 'text-white hover:opacity-90',
  buttonDanger: 'hover:opacity-90',
  slider: 'flex-1 h-1.5 rounded-full appearance-none cursor-pointer',
};

// === MODALS ===
export const MODAL = {
  overlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50',
  container: 'rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col',
  header: 'p-4 border-b flex items-center justify-between',
  title: 'text-lg font-semibold uppercase tracking-wider',
  closeBtn: 'p-1.5 rounded transition-all duration-200 text-lg hover:opacity-70',
  content: 'p-4 flex-1 overflow-y-auto',
  footer: 'p-4 border-t flex justify-end gap-2',
  button: 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
  buttonPrimary: 'text-white hover:opacity-90',
  buttonSecondary: 'border hover:opacity-80',
};

// === DRAWING CANVAS ===
export const DRAWING = {
  canvas: 'absolute inset-0 pointer-events-auto',
  cursor: 'fixed pointer-events-none z-50 rounded-full',
};

// === COMMON ===
export const COMMON = {
  btnIcon: 'p-2 rounded transition-all duration-200 hover:opacity-80',
  btnIconActive: '',
  btnIconSm: 'p-1.5 rounded transition-all duration-200 text-base hover:opacity-80',
  inputBase: 'px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm',
  tooltip: 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono',
  badge: 'px-1.5 py-0.5 text-xs rounded-full font-mono',
  badgePrimary: '',
  badgeSuccess: '',
  badgeWarning: '',
  dividerH: 'w-full h-px opacity-20',
  dividerV: 'w-px h-full opacity-20',
  textMuted: 'opacity-60',
  textSmall: 'text-sm',
};

// === UTILITY ===
export const cn = (...classes) => classes.filter(Boolean).join(' ');
