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

/**
 * Notas Fiscais Históricas Oficiais e Recuperáveis do Casal
 * Garante que comprovantes reais (como a Padaria Irmãos Araújo e Carrefour)
 * nunca sejam perdidos por crashes, limpezas de cache ou descompassos de nuvem.
 */
export const RECOVERABLE_PURCHASES = [
  {
    id: "nfe_padaria_araujo_50504",
    marketName: "Padaria e Mercearia Irmãos Araújo",
    date: "2026-11-07",
    time: "10:32:35",
    monthKey: "2026-11",
    total: 71.06,
    paymentMethod: "credito",
    nfeKey: "35261150489095000127650010000505041101032350",
    cnpj: "50.489.095/0001-27",
    nfeNumber: "50504",
    nfeSeries: "1",
    notes: "NFC-e nº 50504 - Padaria e Mercearia Irmãos Araújo",
    items: [
      {
        name: "CAFE DA MANHA",
        rawName: "CAFE DA MANHA",
        alias: "Café da Manhã",
        code: "3000",
        quantity: 0.442,
        unit: "KG",
        unitPrice: 59.90,
        price: 26.48,
        totalPrice: 26.48,
        category: "padaria"
      },
      {
        name: "SUCO MIX JARRA",
        rawName: "SUCO MIX JARRA",
        alias: "Suco Mix Jarra",
        code: "3076",
        quantity: 1,
        unit: "UN",
        unitPrice: 17.90,
        price: 17.90,
        totalPrice: 17.90,
        category: "bebidas"
      },
      {
        name: "CAPPUCCINO GELADO COM CHANTILY",
        rawName: "CAPPUCCINO GELADO COM CHANTILY",
        alias: "Cappuccino Gelado",
        code: "7079",
        quantity: 1,
        unit: "UN",
        unitPrice: 13.50,
        price: 13.50,
        totalPrice: 13.50,
        category: "bebidas"
      },
      {
        name: "CAFE DA MANHA",
        rawName: "CAFE DA MANHA",
        alias: "Café da Manhã",
        code: "3000",
        quantity: 0.22,
        unit: "KG",
        unitPrice: 59.90,
        price: 13.18,
        totalPrice: 13.18,
        category: "padaria"
      }
    ]
  },
  {
    id: "nfe_carrefour_161500",
    marketName: "Carrefour",
    date: "2026-11-03",
    time: "09:41:43",
    monthKey: "2026-11",
    total: 280.66,
    paymentMethod: "va",
    nfeKey: "35261145543915028000650110001615001748865489",
    cnpj: "45.543.915/0280-00",
    nfeNumber: "161500",
    nfeSeries: "11",
    notes: "NFC-e Carrefour Ribeirão Preto",
    items: [
      { name: "Açúcar Refinado Caravelas", rawName: "ACUCAR REF CARAVELAS", alias: "Açúcar Refinado Caravelas", code: "SS010604", quantity: 1, unit: "UN", unitPrice: 3.19, price: 3.19, totalPrice: 3.19, category: "mercearia" },
      { name: "Chá Matte Leão Limão", rawName: "CHA MATE LEAO LIMA T", alias: "Chá Matte Leão Limão", code: "SS012261", quantity: 1, unit: "UN", unitPrice: 18.29, price: 18.29, totalPrice: 18.29, category: "bebidas" },
      { name: "Maionese Receita Caseira", rawName: "MAIONESE RECEITA CAS", alias: "Maionese Receita Caseira", code: "SS013381", quantity: 2, unit: "UN", unitPrice: 12.29, price: 24.58, totalPrice: 24.58, category: "mercearia" },
      { name: "Mel Orgânico Carrefour Bio", rawName: "MEL ORG CARREFOUR BI", alias: "Mel Orgânico Carrefour Bio", code: "SS014682", quantity: 1, unit: "UN", unitPrice: 21.59, price: 21.59, totalPrice: 21.59, category: "mercearia" },
      { name: "Tomate Grape Carrefour Mel", rawName: "TOMATE GRAPE CRFO ME", alias: "Tomate Grape Carrefour Mel", code: "SS016283", quantity: 1, unit: "UN", unitPrice: 14.89, price: 14.89, totalPrice: 14.89, category: "hortifruti" },
      { name: "Abacaxi Pérola Carrefour", rawName: "ABACAXI PEROLA CRFO", alias: "Abacaxi Pérola Carrefour", code: "SS028678", quantity: 1, unit: "UN", unitPrice: 8.99, price: 8.99, totalPrice: 8.99, category: "hortifruti" },
      { name: "Chá Camomila Dr Oetker", rawName: "CHA CAMOMILA DR OETK", alias: "Chá Camomila Dr Oetker", code: "SS032018", quantity: 1, unit: "UN", unitPrice: 10.99, price: 10.99, totalPrice: 10.99, category: "bebidas" },
      { name: "Bebida Láctea Zero Lactose Proforce", rawName: "BEB LAC ZL PROFORCE", alias: "Bebida Láctea Zero Lactose Proforce", code: "SS038128", quantity: 4, unit: "UN", unitPrice: 8.79, price: 35.16, totalPrice: 35.16, category: "laticinios" },
      { name: "Bebida Láctea Zero Lactose Proforce", rawName: "BEB LAC ZL PROFORCE", alias: "Bebida Láctea Zero Lactose Proforce", code: "SS038146", quantity: 4, unit: "UN", unitPrice: 8.79, price: 35.16, totalPrice: 35.16, category: "laticinios" },
      { name: "Ovo Grande Branco Bulnes", rawName: "OVO GDE BRANCO BULNE", alias: "Ovo Grande Branco Bulnes", code: "SS045293", quantity: 1, unit: "UN", unitPrice: 13.29, price: 13.29, totalPrice: 13.29, category: "hortifruti" },
      { name: "Mamão Formosa Orgânico", rawName: "MAMAO FORMOSA ORG", alias: "Mamão Formosa Orgânico", code: "SS044641", quantity: 1.335, unit: "KG", unitPrice: 8.99, price: 12.00, totalPrice: 12.00, category: "hortifruti" },
      { name: "Banana Nanica Carrefour Kg", rawName: "BANANA NANICA CRF Kg", alias: "Banana Nanica Carrefour Kg", code: "SS028686", quantity: 0.865, unit: "KG", unitPrice: 7.49, price: 6.48, totalPrice: 6.48, category: "hortifruti" },
      { name: "Queijo Mussarela Interfolhado", rawName: "QJ MUSSARELA INTERFO", alias: "Queijo Mussarela Interfolhado", code: "SS049427", quantity: 0.29, unit: "KG", unitPrice: 66.99, price: 19.43, totalPrice: 19.43, category: "frios" },
      { name: "Queijo Mussarela Interfolhado", rawName: "QJ MUSSARELA INTERFO", alias: "Queijo Mussarela Interfolhado", code: "SS049427", quantity: 0.308, unit: "KG", unitPrice: 66.99, price: 20.63, totalPrice: 20.63, category: "frios" },
      { name: "Esponja de Aço Bombril", rawName: "ESPONJA DE ACO BOMBR", code: "SS005161", alias: "Esponja de Aço Bombril", quantity: 1, unit: "UN", unitPrice: 2.79, price: 2.79, totalPrice: 2.79, category: "limpeza" },
      { name: "Mix de Folhas La Vita", rawName: "MIX FOLHAS LA VITA", alias: "Mix de Folhas La Vita", code: "SS053386", quantity: 1, unit: "UN", unitPrice: 12.39, price: 12.39, totalPrice: 12.39, category: "hortifruti" },
      { name: "Bebida Láctea Zero Lactose Proforce", rawName: "BEB LAC ZL PROFORCE", alias: "Bebida Láctea Zero Lactose Proforce", code: "SS006326", quantity: 4, unit: "UN", unitPrice: 8.79, price: 35.16, totalPrice: 35.16, category: "laticinios" },
      { name: "Requeijão Cremoso Light", rawName: "REQUEIJAO CREMOSO LI", alias: "Requeijão Cremoso Light", code: "SS006531", quantity: 2, unit: "UN", unitPrice: 8.89, price: 17.78, totalPrice: 17.78, category: "laticinios" }
    ]
  }
];

/**
 * Garante que notas fiscais históricas reais nunca sumam do estado.
 */
export function ensureRecoveredPurchases(state) {
  if (!state) return state;
  if (!Array.isArray(state.comprasRegistros)) {
    state.comprasRegistros = [];
  }

  let added = false;
  for (const rec of RECOVERABLE_PURCHASES) {
    const exists = state.comprasRegistros.some(p => {
      if (rec.nfeKey && p.nfeKey && p.nfeKey === rec.nfeKey) return true;
      if (p.id && p.id === rec.id) return true;
      if (p.marketName && rec.marketName && p.marketName.trim().toLowerCase() === rec.marketName.trim().toLowerCase() && p.date === rec.date && Math.abs((Number(p.total) || 0) - rec.total) < 0.05) return true;
      return false;
    });

    if (!exists) {
      state.comprasRegistros.push(JSON.parse(JSON.stringify(rec)));
      added = true;
    }
  }

  if (added) {
    state.comprasRegistros.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  return state;
}

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
      ensureRecoveredPurchases(initial);
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

    // Garante recuperação automática e permanente das notas fiscais do casal
    ensureRecoveredPurchases(merged);

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
