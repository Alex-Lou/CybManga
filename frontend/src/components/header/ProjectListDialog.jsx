// ============================================
// SumiWire PRO - Dialogue des projets sauvegardés (présentationnel)
// ============================================

import React from 'react';

const ProjectListDialog = ({ show, loading, projects, onLoad, onDelete, onClose, theme }) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-lg shadow-xl p-6 w-[480px] max-h-[70vh] flex flex-col"
        style={{ backgroundColor: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Projets sauvegardés</h2>
          <button
            className="text-xl px-2 hover:opacity-70"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 opacity-60">Chargement...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 opacity-60">Aucun projet sauvegardé</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded hover:opacity-80 cursor-pointer"
                style={{ backgroundColor: theme.selection, border: `1px solid ${theme.border}` }}
              >
                <div
                  className="flex-1"
                  onClick={() => onLoad(project.id)}
                >
                  <div className="font-medium">{project.name || 'Sans titre'}</div>
                  <div className="text-xs opacity-60">
                    {project.updatedAt
                      ? new Date(project.updatedAt).toLocaleString('fr-FR')
                      : 'Date inconnue'}
                  </div>
                </div>
                <button
                  className="ml-2 px-2 py-1 text-xs rounded transition-all hover:opacity-80"
                  style={{ backgroundColor: theme.error, color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id, project.name);
                  }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListDialog;
