// ============================================
// SumiWire PRO - API Service
// Communication avec le backend Spring Boot
// ============================================

import { extractPersistableState } from './helpers';

const API_BASE = '/api/v1';

/**
 * Liste tous les projets (sans state, juste id/name/dates).
 */
export const listProjects = async () => {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Erreur chargement projets');
  return res.json();
};

/**
 * Charge un projet complet depuis le backend.
 * Retourne { id, name, stateJson, createdAt, updatedAt }.
 */
export const loadProject = async (id) => {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Erreur chargement projet');
  return res.json();
};

/**
 * Crée un nouveau projet dans le backend.
 */
export const createProject = async (name, stateJson) => {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, stateJson }),
  });
  if (!res.ok) throw new Error('Erreur création projet');
  return res.json();
};

/**
 * Auto-save : sauvegarde rapide du state courant.
 * Crée le projet s'il n'existe pas encore (id=null).
 */
export const autosaveProject = async (id, name, stateJson) => {
  const res = await fetch(`${API_BASE}/projects/autosave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, stateJson }),
  });
  if (!res.ok) throw new Error('Erreur auto-save');
  return res.json();
};

/**
 * Supprime un projet.
 */
export const deleteProject = async (id) => {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur suppression projet');
};

/**
 * Sérialise le state frontend pour l'API.
 * Exclut les champs non-persistables (history, UI state, etc.).
 */
export const serializeState = (state) => JSON.stringify(extractPersistableState(state));

/**
 * Désérialise le stateJson du backend en state frontend.
 */
export const deserializeState = (stateJson) => {
  try {
    return JSON.parse(stateJson);
  } catch {
    return null;
  }
};
