// ============================================================
//  MARACAJU - STORAGE & PERSISTÊNCIA LOCAL
// ============================================================

import {
  APP_CONFIG,
  DEFAULT_USERS,
  INITIAL_TASKS,
  INITIAL_CARRO,
  INITIAL_REFORMAS,
  INITIAL_SONHOS,
  INITIAL_PETS
} from './config.js';
import { DEFAULT_CATEGORIES } from './categories.js';
import { getMonthlyBenefitDetails, getCurrentBenefitCycleKey } from './benefits.js';

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
    carro: [...INITIAL_CARRO],
    reformas: [...INITIAL_REFORMAS],
    sonhos: [...INITIAL_SONHOS],
    compras: [],
    comprasRegistros: [],
    pets: JSON.parse(JSON.stringify(INITIAL_PETS)),
    catalog: [],
    categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    settings: {
      sheetsUrl: "https://script.google.com/macros/s/AKfycbywJvIREiTE3wO1J_8dE-vSXWHk4SzsU2XCvL7ktlj1CkF5T24aXMvkLa3XCadNG0sxWg/exec",
      sheetsToken: "Maracaju88CasalSegredo2026!",
      autoSync: true,
      soundEnabled: true,
      lastSyncTimestamp: null
    }
  };
}

export function loadState() {
  try {
    let raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw && APP_CONFIG.legacyStorageKeys) {
      for (const legacyKey of APP_CONFIG.legacyStorageKeys) {
        const legacyData = localStorage.getItem(legacyKey);
        if (legacyData) {
          raw = legacyData;
          break;
        }
      }
    }

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
      settings: {
        ...initial.settings,
        ...(parsed.settings || {}),
        sheetsUrl: (parsed.settings && parsed.settings.sheetsUrl && parsed.settings.sheetsUrl.trim()) ? parsed.settings.sheetsUrl.trim() : initial.settings.sheetsUrl,
        sheetsToken: (parsed.settings && parsed.settings.sheetsToken && parsed.settings.sheetsToken.trim()) ? parsed.settings.sheetsToken.trim() : initial.settings.sheetsToken,
        autoSync: true
      },
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : initial.tasks,
      history: parsed.history || {},
      carro: Array.isArray(parsed.carro) ? parsed.carro : initial.carro,
      reformas: Array.isArray(parsed.reformas) ? parsed.reformas : initial.reformas,
      sonhos: Array.isArray(parsed.sonhos) ? parsed.sonhos : initial.sonhos,
      compras: Array.isArray(parsed.compras) ? parsed.compras : initial.compras,
      comprasRegistros: Array.isArray(parsed.comprasRegistros) ? parsed.comprasRegistros : initial.comprasRegistros,
      pets: Array.isArray(parsed.pets) ? parsed.pets : JSON.parse(JSON.stringify(INITIAL_PETS)),
      catalog: Array.isArray(parsed.catalog) ? parsed.catalog : [],
      categories: {
        tarefas: (parsed.categories && Array.isArray(parsed.categories.tarefas) && parsed.categories.tarefas.length > 0)
          ? parsed.categories.tarefas
          : initial.categories.tarefas,
        carro: (parsed.categories && Array.isArray(parsed.categories.carro) && parsed.categories.carro.length > 0)
          ? parsed.categories.carro
          : initial.categories.carro,
        reformas: (parsed.categories && Array.isArray(parsed.categories.reformas) && parsed.categories.reformas.length > 0)
          ? parsed.categories.reformas
          : initial.categories.reformas,
        sonhos: (parsed.categories && Array.isArray(parsed.categories.sonhos) && parsed.categories.sonhos.length > 0)
          ? parsed.categories.sonhos
          : initial.categories.sonhos,
        compras: (parsed.categories && Array.isArray(parsed.categories.compras) && parsed.categories.compras.length > 0)
          ? parsed.categories.compras
          : initial.categories.compras
      }
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
    try {
      if (!state.settings) state.settings = {};
      const curCycleKey = getCurrentBenefitCycleKey(state);
      const curDetails = getMonthlyBenefitDetails(state, curCycleKey);
      state.settings.benefitsSummary = {
        cycleKey: curDetails.cycleKey,
        vaTotal: curDetails.vaTotal,
        vaSpent: curDetails.vaSpent,
        vaBalance: curDetails.vaBalance,
        vrTotal: curDetails.vrTotal,
        vrSpent: curDetails.vrSpent,
        vrBalance: curDetails.vrBalance,
        updatedAt: state.lastUpdated
      };
    } catch (e) {}
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error("Erro ao salvar estado no localStorage:", err);
    return false;
  }
}
}

export function exportBackupJson(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `maracaju-backup-${dateStr}.json`;
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
