// ============================================
// SumiWire PRO - Sidebar
// Page thumbnails, layers management
// DRAG & DROP pages to canvas in "all" view
// ============================================

import React, { useState, useCallback } from 'react';
import { useStudio, ACTIONS } from '../../context/StudioContext';
import { SIDEBAR, cn } from '../../styles/tailwind';
import { PAGE_FORMATS } from '../../utils/constants';

const Sidebar = () => {
  const { state, dispatch, theme } = useStudio();
  const [draggedPage, setDraggedPage] = useState(null);
  const [isDraggingToCanvas, setIsDraggingToCanvas] = useState(false);
  
  // Add new page
  const handleAddPage = useCallback(() => {
    dispatch({ type: ACTIONS.ADD_PAGE });
  }, [dispatch]);
  
  // Delete page
  const handleDeletePage = useCallback((index, e) => {
    e.stopPropagation();
    if (state.pages.length <= 1) {
      alert('Vous devez garder au moins une page');
      return;
    }
    if (confirm(`Supprimer la page ${index + 1} ?`)) {
      dispatch({ type: ACTIONS.DELETE_PAGE, payload: index });
    }
  }, [dispatch, state.pages.length]);
  
  // Duplicate page
  const handleDuplicatePage = useCallback((index, e) => {
    e.stopPropagation();
    dispatch({ type: ACTIONS.DUPLICATE_PAGE, payload: index });
  }, [dispatch]);
  
  // Select page
  const handleSelectPage = useCallback((index) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_PAGE, payload: index });
  }, [dispatch]);
  
  // Drag and drop - START
  const handleDragStart = useCallback((e, index) => {
    setDraggedPage(index);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set data for canvas drop (in "all" view mode)
    e.dataTransfer.setData('application/x-sumiwire-page', index.toString());
    
    // Use the thumbnail as drag image
    if (e.target) {
      e.dataTransfer.setDragImage(e.target, 50, 50);
    }
    
    // Check if we're in "all" view mode
    if (state.viewMode === 'all') {
      setIsDraggingToCanvas(true);
    }
  }, [state.viewMode]);
  
  // Drag over sidebar item (for reordering)
  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (draggedPage === null || draggedPage === index) return;
    
    // Only allow reordering within sidebar
    if (!isDraggingToCanvas) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, [draggedPage, isDraggingToCanvas]);
  
  // Drop on sidebar item (reorder)
  const handleDrop = useCallback((e, toIndex) => {
    e.preventDefault();
    if (draggedPage === null || draggedPage === toIndex) return;
    
    // Only reorder if dropping within sidebar
    if (!isDraggingToCanvas) {
      dispatch({
        type: ACTIONS.REORDER_PAGES,
        payload: { fromIndex: draggedPage, toIndex }
      });
    }
    
    setDraggedPage(null);
    setIsDraggingToCanvas(false);
  }, [draggedPage, dispatch, isDraggingToCanvas]);
  
  // Drag end
  const handleDragEnd = useCallback(() => {
    setDraggedPage(null);
    setIsDraggingToCanvas(false);
  }, []);
  
  // Render page thumbnail
  const renderPageThumb = (page, index) => {
    const isActive = index === state.activePageIndex;
    const format = PAGE_FORMATS[page.format];
    const thumbScale = 100 / format.width;
    const isDragging = draggedPage === index;
    
    return (
      <div
        key={page.id}
        className={cn(
          SIDEBAR.pageThumb,
          isActive && SIDEBAR.pageThumbActive,
          isDragging && 'opacity-50 ring-2 ring-blue-400',
          'group'
        )}
        style={{
          width: 100,
          height: 100 * (format.height / format.width),
          backgroundColor: theme.page,
          borderColor: isActive ? theme.primary : theme.border,
          cursor: state.viewMode === 'all' ? 'grab' : 'pointer',
        }}
        onClick={() => handleSelectPage(index)}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
      >
        {/* Mini preview of panels */}
        <div 
          style={{ 
            transform: `scale(${thumbScale})`, 
            transformOrigin: 'top left', 
            width: format.width, 
            height: format.height,
            pointerEvents: 'none',
          }}
        >
          {page.panels.map(panel => (
            <div
              key={panel.id}
              style={{
                position: 'absolute',
                left: panel.x,
                top: panel.y,
                width: panel.width,
                height: panel.height,
                border: `1px solid ${panel.borderColor}`,
                backgroundColor: panel.backgroundColor,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
        
        {/* Page number */}
        <span className={SIDEBAR.pageThumbNumber}>{index + 1}</span>
        
        {/* Drag hint for "all" view mode */}
        {state.viewMode === 'all' && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: `${theme.primary}15`,
            }}
          >
            <span className="text-xs font-medium px-1 rounded font-mono" style={{ color: theme.primary, backgroundColor: theme.surface }}>
              DRAG
            </span>
          </div>
        )}

        {/* Actions on hover */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            className="p-0.5 rounded text-xs transition-all"
            style={{ backgroundColor: theme.primary, color: theme.bg }}
            onClick={(e) => handleDuplicatePage(index, e)}
            title="Dupliquer"
          >
            📋
          </button>
          {state.pages.length > 1 && (
            <button
              className="p-0.5 rounded text-xs transition-all"
              style={{ backgroundColor: theme.error, color: '#fff' }}
              onClick={(e) => handleDeletePage(index, e)}
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <aside
      className={SIDEBAR.container}
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      {/* Pages section */}
      <div className={SIDEBAR.pagesHeader} style={{ borderColor: theme.border }}>
        <span className={SIDEBAR.pagesTitle}>📄 Pages ({state.pages.length})</span>
        <div className={SIDEBAR.pagesActions}>
          <button
            className={SIDEBAR.pagesActionBtn}
            onClick={handleAddPage}
            title="Ajouter une page"
          >
            ➕
          </button>
        </div>
      </div>
      
      {/* Page format selector for active page */}
      <div className="px-2.5 py-1.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <span className="text-xs opacity-60">Format:</span>
        <select
          className="flex-1 text-xs px-1.5 py-1 rounded border bg-transparent"
          style={{ borderColor: theme.border, color: theme.text }}
          value={state.pages[state.activePageIndex]?.format || 'a4'}
          onChange={(e) => dispatch({ type: ACTIONS.SET_PAGE_FORMAT, payload: { pageIndex: state.activePageIndex, format: e.target.value } })}
        >
          {Object.entries(PAGE_FORMATS).map(([key, fmt]) => (
            <option key={key} value={key}>{fmt.name}</option>
          ))}
        </select>
      </div>

      {/* Hint for "all" view mode */}
      {state.viewMode === 'all' && (
        <div
          className="px-2 py-1 text-xs text-center"
          style={{
            backgroundColor: theme.selection,
            color: theme.primary,
          }}
        >
          💡 Glissez les pages sur le canvas
        </div>
      )}
      
      <div className={SIDEBAR.pagesList}>
        {state.pages.map((page, index) => renderPageThumb(page, index))}
      </div>
      
      {/* Layers section */}
      <div className={SIDEBAR.layersHeader} style={{ borderColor: theme.border }}>
        <span className={SIDEBAR.pagesTitle}>🗂️ Éléments</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Current page panels */}
        {state.pages[state.activePageIndex]?.panels.map((panel, i) => (
          <div
            key={panel.id}
            className={cn(
              SIDEBAR.layerItem,
              state.selectedPanelIds.includes(panel.id) && SIDEBAR.layerItemActive,
              'group'
            )}
            style={{
              backgroundColor: state.selectedPanelIds.includes(panel.id) 
                ? theme.selection 
                : 'transparent',
            }}
            onClick={() => dispatch({
              type: ACTIONS.SET_SELECTION,
              payload: { panelIds: [panel.id], bubbleIds: [] }
            })}
          >
            <span className={SIDEBAR.layerIcon}>⬜</span>
            <span className={SIDEBAR.layerName}>{panel.name || `Case ${i + 1}`}</span>
          </div>
        ))}
        
        {/* Current page bubbles */}
        {state.pages[state.activePageIndex]?.bubbles.map((bubble, i) => (
          <div
            key={bubble.id}
            className={cn(
              SIDEBAR.layerItem,
              state.selectedBubbleIds.includes(bubble.id) && SIDEBAR.layerItemActive,
              'group'
            )}
            style={{
              backgroundColor: state.selectedBubbleIds.includes(bubble.id) 
                ? theme.selection 
                : 'transparent',
            }}
            onClick={() => dispatch({
              type: ACTIONS.SET_SELECTION,
              payload: { panelIds: [], bubbleIds: [bubble.id] }
            })}
          >
            <span className={SIDEBAR.layerIcon}>💬</span>
            <span className={SIDEBAR.layerName}>
              {bubble.text?.slice(0, 15) || `Bulle ${i + 1}`}
              {bubble.text?.length > 15 ? '...' : ''}
            </span>
          </div>
        ))}
        
        {/* Drawings count */}
        {/* Layers */}
        {(state.pages[state.activePageIndex]?.layers || []).map((layer, i) => {
          const strokeCount = (layer.strokes || []).length;
          const isActive = layer.id === state.pages[state.activePageIndex]?.activeLayerId;
          return (
            <div
              key={layer.id}
              className={cn(SIDEBAR.layerItem, 'group')}
              style={{
                backgroundColor: isActive ? theme.selection : 'transparent',
                opacity: layer.visible ? 1 : 0.4,
              }}
              onClick={() => dispatch({ type: ACTIONS.SET_ACTIVE_LAYER, payload: layer.id })}
            >
              <span
                className="cursor-pointer text-xs"
                onClick={(e) => { e.stopPropagation(); dispatch({ type: ACTIONS.TOGGLE_LAYER_VISIBILITY, payload: layer.id }); }}
                title={layer.visible ? 'Masquer' : 'Afficher'}
              >
                {layer.visible ? '👁️' : '👁️‍🗨️'}
              </span>
              <span className={SIDEBAR.layerIcon}>
                {layer.locked ? '🔒' : '🎨'}
              </span>
              <span className={SIDEBAR.layerName}>
                {layer.name}{strokeCount > 0 ? ` (${strokeCount})` : ''}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Lock indicator */}
      <div 
        className="p-2 border-t text-xs text-center"
        style={{ borderColor: theme.border, color: theme.textSecondary }}
      >
        Layout: {state.layoutLocked ? '🔒 Verrouillé' : '🔓 Déverrouillé'}
      </div>
    </aside>
  );
};

export default Sidebar;