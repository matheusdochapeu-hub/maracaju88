// ============================================================
//  MARACAJU 88 - STORAGE & PERSISTÊNCIA LOCAL
// ============================================================

import {
  APP_CONFIG,
  DEFAULT_USERS,
  INITIAL_TASKS,
  INITIAL_REFORMAS,
  INITIAL_SONHOS
} from './config.js';

export function getInitialState() {
  return {
    version: APP_CONFIG.version,
    lastUpdated: new Date().toISOString(),
    activeUserId: "matheus",
    users: { ...DEFAULT_USERS },
    gamification: {
      streak: 0,
      bestStreak: 0,
      lastStreakDate: null,
      unlockedBadges: []
    },
    tasks: [...INITIAL_TASKS],
    // history format: { "2026-11-01": { [taskId]: { done: true, doneBy: "matheus", xp: 25, completedAt: "14:30" } } }
    history: {},
    reformas: [...INITIAL_REFORMAS],
    sonhos: [...INITIAL_SONHOS],
    settings: {
      sheetsUrl: "",
      sheetsToken: "Maracaju88CasalSegredo2026!",
      autoSync: false,
      soundEnabled: true,
      lastSyncTimestamp: null
    }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) {
      const initial = getInitialState();
      saveState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);
    const initial = getInitialState();

    // Migração e mesclagem defensiva de campos caso novas versões adicionem propriedades
    const merged = {
      ...initial,
      ...parsed,
      users: { ...initial.users, ...(parsed.users || {}) },
      gamification: { ...initial.gamification, ...(parsed.gamification || {}) },
      settings: { ...initial.settings, ...(parsed.settings || {}) },
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : initial.tasks,
      history: parsed.history || {},
      reformas: Array.isArray(parsed.reformas) ? parsed.reformas : initial.reformas,
      sonhos: Array.isArray(parsed.sonhos) ? parsed.sonhos : initial.sonhos
    };

    return merged;
  } catch (err) {
    console.error("Erro ao carregar estado do localStorage:", err);
    return getInitialState();
  }
}

export function saveState(state) {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error("Erro ao salvar estado no localStorage:", err);
    return false;
  }
}

export function exportBackupJson(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `maracaju88-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackupJson(file, currentState, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || (!parsed.tasks && !parsed.history)) {
        throw new Error("Arquivo de backup inválido.");
      }
      const merged = {
        ...getInitialState(),
        ...parsed,
        users: { ...DEFAULT_USERS, ...(parsed.users || {}) },
        gamification: { ...getInitialState().gamification, ...(parsed.gamification || {}) },
        settings: { ...currentState.settings, ...(parsed.settings || {}) }
      };
      saveState(merged);
      callback(null, merged);
    } catch (err) {
      callback(err, null);
    }
  };
  reader.readAsText(file);
}
