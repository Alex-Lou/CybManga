// ============================================
// SumiWire PRO - Barre de raccourcis (footer discret)
// ============================================

import React from 'react';
import { useStudio } from '../context/StudioContext';

const StatusBar = () => {
  const { theme } = useStudio();

  const Kbd = ({ children }) => (
    <kbd
      className="px-1.5 py-px rounded text-[10px] font-mono leading-none"
      style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}`, color: theme.textSecondary }}
    >
      {children}
    </kbd>
  );

  const hints = [
    <><Kbd>Espace</Kbd>/<Kbd>Alt</Kbd> + glisser&nbsp;: déplacer</>,
    <><Kbd>Ctrl</Kbd> + molette&nbsp;: zoom</>,
    <><Kbd>Home</Kbd>&nbsp;: recentrer</>,
    <><Kbd>V</Kbd> sélection · <Kbd>D</Kbd> dessin · <Kbd>H</Kbd> main</>,
    <><Kbd>Suppr</Kbd>&nbsp;: supprimer</>,
    <><Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>&nbsp;: annuler</>,
  ];

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-[11px] select-none"
      style={{
        color: theme.textMuted,
        borderTop: `1px solid ${theme.border}`,
        padding: '7px 12px',
      }}
    >
      {hints.map((h, i) => (
        <span key={i} className="inline-flex items-center gap-1">{h}</span>
      ))}
    </div>
  );
};

export default StatusBar;
