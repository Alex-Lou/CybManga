// ============================================
// SumiWire PRO - Menu contextuel & overlay de renommage d'une case (portails)
// ============================================

import React from 'react';
import { createPortal } from 'react-dom';

const PanelContextMenu = ({
  contextMenu, isRenaming, theme, renameValue, renameInputRef,
  onRenameStart, onRenameChange, onRenameKeyDown, onRenameConfirm, onRenameCancel,
}) => {
  return (
    <>
      {/* Context menu — portal to body */}
      {contextMenu && createPortal(
        <div
          className="fixed py-1.5 rounded-lg shadow-2xl border min-w-44"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 99999,
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            className="px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer rounded-md mx-1 transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.selection}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={onRenameStart}
          >
            <span>✏️</span>
            <span>Renommer</span>
          </div>
        </div>,
        document.body
      )}

      {/* Rename overlay — portal to body */}
      {isRenaming && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 99998, backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onRenameConfirm();
          }}
        >
          <div
            className="rounded-xl shadow-2xl p-4 flex flex-col gap-3 items-center"
            style={{ backgroundColor: theme.surface, borderColor: theme.border, border: `1px solid ${theme.border}`, minWidth: 260 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-semibold" style={{ color: theme.text }}>
              Renommer la case
            </span>
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={onRenameKeyDown}
              className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-40"
              style={{
                backgroundColor: theme.bg,
                borderColor: theme.border,
                color: theme.text,
              }}
              placeholder="Nom de la case..."
            />
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors"
                style={{ borderColor: theme.border, color: theme.textSecondary }}
                onPointerDown={(e) => { e.stopPropagation(); onRenameCancel(); }}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-3 py-1.5 text-sm rounded-lg text-white transition-colors"
                style={{ backgroundColor: theme.primary }}
                onPointerDown={(e) => { e.stopPropagation(); onRenameConfirm(); }}
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PanelContextMenu;
