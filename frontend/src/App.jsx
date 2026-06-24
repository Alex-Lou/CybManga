// ============================================
// SumiWire PRO - Main App Component
// Navigator, Reference Panel, Radial Menu
// ============================================

import React, { useState, useCallback } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import Header from './components/header/Header';
import Toolbar from './components/toolbar/Toolbar';
import Sidebar from './components/sidebar/Sidebar';
import Canvas from './components/canvas/Canvas';
import PropertiesPanel from './components/properties/PropertiesPanel';
import SettingsModal from './components/modals/SettingsModal';
import NavigatorPanel from './components/navigator/NavigatorPanel';
import ReferencePanel from './components/reference/ReferencePanel';
import RadialMenu from './components/radial/RadialMenu';
import { LAYOUT } from './styles/tailwind';

const AppContent = () => {
  const { state, theme } = useStudio();
  const [showRefPanel, setShowRefPanel] = useState(false);
  const [radialMenu, setRadialMenu] = useState(null); // { x, y } or null

  const hasSelection = state.selectedPanelIds.length > 0 || state.selectedBubbleIds.length > 0;

  // Right-click → radial menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    setRadialMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      className={`${LAYOUT.appContainer}${state.isDarkMode ? ' scanlines' : ''}`}
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: state.isDarkMode
          ? "'Exo 2', -apple-system, BlinkMacSystemFont, sans-serif"
          : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onContextMenu={handleContextMenu}
    >
      <Header />
      <Toolbar onToggleRefPanel={() => setShowRefPanel(v => !v)} showRefPanel={showRefPanel} />
      <div className={LAYOUT.mainContent}>
        <Sidebar />
        <Canvas />
        {hasSelection && <PropertiesPanel />}
      </div>

      {/* Floating panels */}
      <NavigatorPanel />
      <ReferencePanel visible={showRefPanel} onClose={() => setShowRefPanel(false)} />

      {/* Radial menu */}
      {radialMenu && (
        <RadialMenu x={radialMenu.x} y={radialMenu.y} onClose={() => setRadialMenu(null)} />
      )}

      {/* Modals */}
      <SettingsModal />
    </div>
  );
};

const App = () => (
  <StudioProvider>
    <AppContent />
  </StudioProvider>
);

export default App;
