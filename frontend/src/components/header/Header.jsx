// ============================================
// SumiWire PRO - Header with Navbar
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { HEADER, cn } from '../../styles/tailwind';
import { VIEW_MODES } from '../../utils/constants';
import { saveProjectWithDialog, readFileAsJSON, saveToStorage, exportAsImage } from '../../utils/helpers';
import { listProjects, loadProject, deleteProject, deserializeState } from '../../utils/api';
import { importPsdFile } from '../../utils/psdImport';
import { exportAsPsd } from '../../utils/psdExport';
import { useHeaderShortcuts } from './useHeaderShortcuts';
import ProjectListDialog from './ProjectListDialog';

const Header = () => {
  const { state, dispatch, canUndo, canRedo, theme, doBackendSave } = useStudio();
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const psdInputRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // --- ACTIONS DE SAUVEGARDE ---

  // 1. Sauvegarde rapide (Ctrl + S) → backend + localStorage
  const handleSave = async () => {
    saveToStorage(state);
    try {
      await doBackendSave();
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2000);
    } catch {
      // localStorage fallback already done
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 2000);
    }
  };

  // 2. Enregistrer sous... (Ouvre la boite de dialogue système)
  const handleDownloadProject = async () => {
    const projectData = {
      name: state.projectName,
      pages: state.pages,
      version: '2.0',
      savedAt: new Date().toISOString(),
    };

    await saveProjectWithDialog(projectData, state.projectName || 'projet');
    setActiveMenu(null);
  };

  // 3. Exporter en Image (PNG)
  const handleExportImage = () => {
    exportAsImage('canvas-export-area', `${state.projectName || 'export'}.png`);
    setActiveMenu(null);
  };

  // 4. Ouvrir le dialogue de projets sauvegardés
  const handleOpenProjectDialog = async () => {
    setActiveMenu(null);
    setLoadingProjects(true);
    setShowProjectDialog(true);
    try {
      const projects = await listProjects();
      setProjectList(projects);
    } catch (err) {
      console.warn('Impossible de charger les projets:', err.message);
      setProjectList([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // 5. Charger un projet depuis le backend
  const handleLoadFromBackend = async (projectId) => {
    try {
      const project = await loadProject(projectId);
      const parsedState = deserializeState(project.stateJson);
      if (parsedState) {
        dispatch({
          type: ACTIONS.LOAD_PROJECT,
          payload: { ...parsedState, projectId: project.id },
        });
      } else {
        alert('Erreur: le projet est corrompu.');
      }
    } catch (err) {
      alert('Erreur chargement projet: ' + err.message);
    }
    setShowProjectDialog(false);
  };

  // 6. Supprimer un projet du backend
  const handleDeleteFromBackend = async (projectId, projectName) => {
    if (!confirm(`Supprimer le projet "${projectName}" ?`)) return;
    try {
      await deleteProject(projectId);
      setProjectList(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      alert('Erreur suppression: ' + err.message);
    }
  };

  const handleOpen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readFileAsJSON(file);
      dispatch({ type: ACTIONS.LOAD_PROJECT, payload: data });
    } catch (err) { alert('Erreur chargement fichier'); }
    e.target.value = '';
    setActiveMenu(null);
  };

  const handleNew = () => {
    if (confirm('Créer un nouveau projet ?')) {
      dispatch({ type: ACTIONS.NEW_PROJECT });
    }
    setActiveMenu(null);
  };

  const handleExportPsd = async () => {
    setActiveMenu(null);
    try {
      const currentPage = state.pages[state.activePageIndex];
      // Find the baked canvas in the DOM
      const bakedCanvas = document.querySelector('canvas[width]');
      const layerCount = await exportAsPsd(currentPage, currentPage.format, bakedCanvas, state.projectName);
      alert(`PSD exporté avec ${layerCount} layers !`);
    } catch (err) {
      console.error('PSD export error:', err);
      alert(`Erreur export PSD: ${err.message}`);
    }
  };

  const handleOpenPsd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { page, info } = await importPsdFile(file);
      // Add as new page with imported layers
      dispatch({ type: ACTIONS.ADD_PAGE });
      // Replace the new page's content with PSD data
      const newPageIndex = state.pages.length; // the page we just added
      dispatch({
        type: ACTIONS.LOAD_PROJECT,
        payload: {
          ...state,
          pages: [...state.pages, page],
          activePageIndex: state.pages.length,
          projectName: file.name.replace(/\.psd$/i, ''),
        }
      });
      alert(`PSD importé !\n${info}`);
    } catch (err) {
      console.error('PSD import error:', err);
      alert(`Erreur import PSD: ${err.message}`);
    }
    e.target.value = '';
    setActiveMenu(null);
  };

  // Raccourcis clavier globaux (référence handleSave/handleNew définis ci-dessus)
  useHeaderShortcuts({ state, dispatch, canUndo, canRedo, handleSave, handleNew, fileInputRef });

  const menus = {
    file: {
      label: 'Fichier',
      items: [
        { label: 'Nouveau', shortcut: 'Ctrl+N', action: handleNew },
        { label: 'Ouvrir (fichier)...', shortcut: 'Ctrl+O', action: () => fileInputRef.current?.click() },
        { label: 'Ouvrir PSD (Adobe/Fresco)...', action: () => psdInputRef.current?.click() },
        { label: 'Ouvrir (projets)...', action: handleOpenProjectDialog },
        { divider: true },
        { label: 'Enregistrer', shortcut: 'Ctrl+S', action: handleSave },
        { label: 'Enregistrer sous...', action: handleDownloadProject },
        { label: 'Exporter (Image)...', action: handleExportImage },
        { label: 'Exporter PSD (Adobe)...', action: handleExportPsd },
        { divider: true },
        { label: 'Paramètres', action: () => { dispatch({ type: ACTIONS.TOGGLE_SETTINGS }); setActiveMenu(null); } },
      ],
    },
    edit: {
      label: 'Édition',
      items: [
        { label: 'Annuler', shortcut: 'Ctrl+Z', action: () => dispatch({ type: ACTIONS.UNDO }), disabled: !canUndo },
        { label: 'Rétablir', shortcut: 'Ctrl+Y', action: () => dispatch({ type: ACTIONS.REDO }), disabled: !canRedo },
        { divider: true },
        { label: 'Copier', shortcut: 'Ctrl+C', action: () => dispatch({ type: ACTIONS.COPY }) },
        { label: 'Coller', shortcut: 'Ctrl+V', action: () => dispatch({ type: ACTIONS.PASTE }), disabled: !state.clipboard },
        { divider: true },
        { label: 'Supprimer', shortcut: 'Suppr', action: () => {
          dispatch({ type: ACTIONS.DELETE_PANELS });
          dispatch({ type: ACTIONS.DELETE_BUBBLES });
        }, disabled: state.selectedPanelIds.length === 0 && state.selectedBubbleIds.length === 0 },
        { label: 'Tout sélectionner', shortcut: 'Ctrl+A', action: () => {
          const currentPage = state.pages[state.activePageIndex];
          dispatch({ type: ACTIONS.SET_SELECTION, payload: { panelIds: currentPage.panels.map(p => p.id), bubbleIds: currentPage.bubbles.map(b => b.id) } });
        }},
      ],
    },
    view: {
      label: 'Affichage',
      items: [
        { label: 'Page unique', shortcut: '1', action: () => dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'single' }), checked: state.viewMode === 'single' },
        { label: 'Double page', shortcut: '2', action: () => dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'spread' }), checked: state.viewMode === 'spread' },
        { label: 'Toutes les pages', shortcut: '3', action: () => dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: 'all' }), checked: state.viewMode === 'all' },
        { divider: true },
        { label: 'Grille', shortcut: 'G', action: () => dispatch({ type: ACTIONS.TOGGLE_GRID }), checked: state.showGrid },
        { label: 'Guides', shortcut: 'Maj+G', action: () => dispatch({ type: ACTIONS.TOGGLE_GUIDES }), checked: state.showGuides },
        { label: 'Magnétisme', shortcut: 'S', action: () => dispatch({ type: ACTIONS.TOGGLE_SNAP }), checked: state.snapToGrid },
        { divider: true },
        { label: 'Zoom 100%', shortcut: 'Ctrl+0', action: () => dispatch({ type: ACTIONS.SET_ZOOM, payload: 1 }) },
      ],
    },
    help: {
      label: 'Aide',
      items: [
        { label: 'Raccourcis', action: () => { dispatch({ type: ACTIONS.TOGGLE_HELP }); setActiveMenu(null); } },
        { label: 'À propos', action: () => alert('SumiWire Pro v2.0') },
      ],
    },
  };

  // Style pour les boutons de menu actifs
  const getActiveStyle = (isActive) => ({
    color: isActive ? theme.primary : theme.text,
    backgroundColor: isActive ? theme.selection : 'transparent',
    transition: 'all 0.1s ease'
  });

  // Style pour les items de dropdown avec hover
  const getDropdownItemStyle = (itemKey, isDisabled) => ({
    backgroundColor: !isDisabled && hoveredItem === itemKey ? theme.selection : 'transparent',
    transition: 'background-color 0.1s ease',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  });

  return (
    <>
    <header className={HEADER.container} style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }} ref={menuRef}>
      <div className="font-bold text-sm mr-4 flex items-center gap-2">
        <span className="text-lg" style={{ filter: `drop-shadow(0 0 4px ${theme.glow || 'rgba(0,136,170,0.4)'})` }}>⬡</span>
        <span style={{ fontFamily: state.isDarkMode ? "'Orbitron', sans-serif" : "'Segoe UI', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: state.isDarkMode ? '3px' : '1px', color: theme.primary, textShadow: state.isDarkMode ? `0 0 8px ${theme.glow}` : 'none' }}>{state.isDarkMode ? 'SUMIWIRE' : 'SumiWire'}</span>
      </div>

      {/* Menus */}
      {Object.entries(menus).map(([key, menu]) => (
        <div key={key} className="relative">
          <button
            className={HEADER.menuButton}
            onClick={() => setActiveMenu(activeMenu === key ? null : key)}
            onMouseEnter={() => activeMenu && setActiveMenu(key)}
            style={getActiveStyle(activeMenu === key)}
          >
            {menu.label}
          </button>

          {activeMenu === key && (
            <div className={HEADER.dropdown} style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              {menu.items.map((item, i) => {
                const itemKey = `${key}-${i}`;

                if (item.divider) {
                  return <div key={i} className={HEADER.dropdownDivider} style={{ borderColor: theme.border }} />;
                }

                return (
                  <div
                    key={i}
                    className={cn(HEADER.dropdownItem, item.disabled && HEADER.dropdownItemDisabled)}
                    style={getDropdownItemStyle(itemKey, item.disabled)}
                    onMouseEnter={() => !item.disabled && setHoveredItem(itemKey)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      if (!item.disabled && item.action) {
                        item.action();
                        setActiveMenu(null);
                      }
                    }}
                  >
                    {item.checked !== undefined && <span className="w-4 text-xs">{item.checked ? '●' : ''}</span>}
                    <span>{item.label}</span>
                    {item.shortcut && <span className={HEADER.dropdownShortcut}>{item.shortcut}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className={HEADER.spacer} />

      {/* Barre Titre + Indicateur Sauvegarde */}
      <div className="flex items-center gap-2">
        <input
            type="text"
            value={state.projectName}
            onChange={(e) => dispatch({ type: ACTIONS.SET_PROJECT_NAME, payload: e.target.value })}
            className="px-2 py-1 text-sm bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-current rounded text-center w-40"
            style={{ color: theme.textSecondary }}
        />
        {/* CHECKMARK VERT */}
        <span
            className={`font-bold transition-opacity duration-500 ${showSaveConfirm ? 'opacity-100' : 'opacity-0'}`}
            style={{ color: theme.success, textShadow: `0 0 8px ${theme.success}` }}
            title="Sauvegardé"
        >
            ✔
        </span>
      </div>

      <div className={HEADER.toolGroup} style={{ borderColor: theme.border }}>
        {Object.entries(VIEW_MODES).map(([key, mode]) => (
          <button
            key={key}
            className={HEADER.viewButton}
            onClick={() => dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: key })}
            title={mode.name}
            style={getActiveStyle(state.viewMode === key)}
          >
            {mode.icon}
          </button>
        ))}
      </div>

      <button
        className={HEADER.viewButton}
        onClick={() => dispatch({ type: ACTIONS.TOGGLE_DARK_MODE })}
        title="Thème"
        style={{ color: theme.text }}
      >
        {state.isDarkMode ? '☀️' : '🌙'}
      </button>

      <input ref={fileInputRef} type="file" accept=".manga,.json" onChange={handleOpen} className="hidden" />
      <input ref={psdInputRef} type="file" accept=".psd" onChange={handleOpenPsd} className="hidden" />
    </header>

    {/* Project List Dialog */}
    <ProjectListDialog
      show={showProjectDialog}
      loading={loadingProjects}
      projects={projectList}
      onLoad={handleLoadFromBackend}
      onDelete={handleDeleteFromBackend}
      onClose={() => setShowProjectDialog(false)}
      theme={theme}
    />
    </>
  );
};

export default Header;
