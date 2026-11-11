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
import { deduplicatePets } from './pets.js';
import { getMonthlyBenefitDetails, getCurrentBenefitCycleKey } from './benefits.js';
import { parseCurrency } from './currency.js';
import { formatMonthKey } from './shopping.js';

// ============================================================
//  TÚMULOS DE EXCLUSÃO (tombstones)
// ------------------------------------------------------------
// A sincronização mescla listas por união (local ∪ nuvem). Sem um registro
// de "isto foi apagado", o item excluído no celular voltava na próxima
// leitura da planilha (a cada 30s / ao voltar o foco) — era o bug de não
// conseguir excluir tarefas, itens do mercado e compras. Guardamos o id
// apagado com data; o merge descarta esse id dos dois lados.
// ============================================================

export const TOMBSTONE_COLLECTIONS = [
  'tasks',
  'compras',
  'comprasRegistros',
  'carro',
  'reformas',
  'sonhos',
  'shoppingWishlist',
  'catalog',
  'categories'
];

const TOMBSTONE_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 dias
const TOMBSTONE_MAX_PER_COLLECTION = 1000;

export function ensureDeletedIds(state) {
  if (!state) return {};
  if (!state.deletedIds || typeof state.deletedIds !== 'object' || Array.isArray(state.deletedIds)) {
    state.deletedIds = {};
  }
  TOMBSTONE_COLLECTIONS.forEach(col => {
    const value = state.deletedIds[col];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      state.deletedIds[col] = {};
    }
  });
  return state.deletedIds;
}

function pruneDeletedIds(state) {
  const map = ensureDeletedIds(state);
  const now = Date.now();
  Object.keys(map).forEach(col => {
    const entries = map[col] || {};
    const kept = Object.entries(entries)
      .filter(([, ts]) => Number.isFinite(Number(ts)) && (now - Number(ts)) < TOMBSTONE_TTL_MS)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, TOMBSTONE_MAX_PER_COLLECTION);
    map[col] = Object.fromEntries(kept);
  });
}

export function markDeleted(state, collection, id) {
  if (!state || !collection || id === undefined || id === null || id === '') return;
  const map = ensureDeletedIds(state);
  if (!map[collection]) map[collection] = {};
  map[collection][String(id)] = Date.now();
  pruneDeletedIds(state);
}

export function clearDeleted(state, collection, id) {
  if (!state || !collection || id === undefined || id === null) return;
  const map = ensureDeletedIds(state);
  if (map[collection]) delete map[collection][String(id)];
}

export function isDeleted(state, collection, id) {
  if (!state || !collection || id === undefined || id === null) return false;
  const col = state.deletedIds && state.deletedIds[collection];
  return !!(col && Object.prototype.hasOwnProperty.call(col, String(id)));
}

export function mergeDeletedIds(target, source) {
  const merged = {};
  TOMBSTONE_COLLECTIONS.forEach(col => { merged[col] = {}; });
  const absorb = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    Object.keys(obj).forEach(col => {
      const entries = obj[col];
      if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return;
      if (!merged[col]) merged[col] = {};
      Object.entries(entries).forEach(([id, ts]) => {
        const prev = merged[col][id];
        const value = Number(ts) || Date.now();
        merged[col][id] = prev ? Math.max(Number(prev) || 0, value) : value;
      });
    });
  };
  absorb(target);
  absorb(source);
  return merged;
}

export function filterDeletedFromState(state) {
  if (!state) return state;
  ensureDeletedIds(state);
  const keep = (col, id) => !isDeleted(state, col, id);
  if (Array.isArray(state.tasks)) state.tasks = state.tasks.filter(i => keep('tasks', i && i.id));
  if (Array.isArray(state.compras)) state.compras = state.compras.filter(i => keep('compras', i && i.id));
  if (Array.isArray(state.comprasRegistros)) state.comprasRegistros = state.comprasRegistros.filter(i => keep('comprasRegistros', i && i.id));
  if (Array.isArray(state.carro)) state.carro = state.carro.filter(i => keep('carro', i && i.id));
  if (Array.isArray(state.reformas)) state.reformas = state.reformas.filter(i => keep('reformas', i && i.id));
  if (Array.isArray(state.sonhos)) state.sonhos = state.sonhos.filter(i => keep('sonhos', i && i.id));
  if (Array.isArray(state.shoppingWishlist)) state.shoppingWishlist = state.shoppingWishlist.filter(i => keep('shoppingWishlist', i && i.id));
  if (Array.isArray(state.catalog)) state.catalog = state.catalog.filter(i => keep('catalog', i && (i.id || i.code || i.rawName)));

  if (state.categories && typeof state.categories === 'object') {
    Object.keys(state.categories).forEach(mod => {
      const list = state.categories[mod];
      if (Array.isArray(list)) {
        state.categories[mod] = list.filter(c => keep('categories', c && `${mod}:${c.id}`));
      }
    });
  }
  return state;
}

/**
 * Converte valores monetários que vieram da planilha como texto ("264,33")
 * para número. Sem isso `Number("264,33")` virava NaN e a compra era somada
 * como R$ 0 no saldo de VA/VR.
 */
export function normalizePurchaseRecord(purchase) {
  if (!purchase || typeof purchase !== 'object') return purchase;
  const date = String(purchase.date || purchase.createdAt || '').slice(0, 10);
  purchase.total = parseCurrency(purchase.total !== undefined ? purchase.total : purchase.valor);
  if (date) purchase.date = date;
  purchase.monthKey = formatMonthKey(date || purchase.monthKey);
  if (Array.isArray(purchase.items)) {
    purchase.items = purchase.items.map(item => {
      if (!item || typeof item !== 'object') return item;
      if (item.unitPrice !== undefined) item.unitPrice = parseCurrency(item.unitPrice);
      if (item.price !== undefined) item.price = parseCurrency(item.price);
      if (item.totalPrice !== undefined) item.totalPrice = parseCurrency(item.totalPrice);
      return item;
    });
  }
  return purchase;
}

export function normalizePurchasesInState(state) {
  if (!state) return state;
  if (Array.isArray(state.comprasRegistros)) {
    state.comprasRegistros = state.comprasRegistros
      .filter(p => p && typeof p === 'object')
      .map(normalizePurchaseRecord);
  }
  if (Array.isArray(state.compras)) {
    state.compras = state.compras.map(item => {
      if (!item || typeof item !== 'object') return item;
      if (item.unitPrice !== undefined) item.unitPrice = parseCurrency(item.unitPrice);
      if (item.price !== undefined) item.price = parseCurrency(item.price);
      if (item.totalPrice !== undefined) item.totalPrice = parseCurrency(item.totalPrice);
      return item;
    });
  }
  return state;
}

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
 * Não ressuscita o que o usuário excluiu: ids com túmulo em `deletedIds`
 * são respeitados. `restoreDeleted: true` (botão "Recuperar Notas Fiscais")
 * limpa os túmulos desses ids e força a volta.
 */
export function ensureRecoveredPurchases(state, { restoreDeleted = false } = {}) {
  if (!state) return state;
  if (!Array.isArray(state.comprasRegistros)) {
    state.comprasRegistros = [];
  }
  ensureDeletedIds(state);

  let added = false;
  for (const rec of RECOVERABLE_PURCHASES) {
    if (restoreDeleted) {
      clearDeleted(state, 'comprasRegistros', rec.id);
    }
    if (isDeleted(state, 'comprasRegistros', rec.id)) continue;

    const recTotal = parseCurrency(rec.total);
    const exists = state.comprasRegistros.some(p => {
      if (!p) return false;
      if (rec.nfeKey && p.nfeKey && p.nfeKey === rec.nfeKey) return true;
      if (p.id && p.id === rec.id) return true;
      // Totais podem chegar da planilha como "280,66"; comparar com número.
      if (p.marketName && rec.marketName && p.marketName.trim().toLowerCase() === rec.marketName.trim().toLowerCase() && p.date === rec.date && Math.abs(parseCurrency(p.total) - recTotal) < 0.05) return true;
      return false;
    });

    if (!exists) {
      state.comprasRegistros.push(normalizePurchaseRecord(JSON.parse(JSON.stringify(rec))));
      added = true;
    }
  }

  // Limpa duplicatas antigas: a cópia "recuperável" (id fixo) que já existe
  // também como lançamento/importação real (mesmo mercado, data e total).
  const beforeDedupe = state.comprasRegistros.length;
  state.comprasRegistros = state.comprasRegistros.filter(p => {
    if (!p || !p.id) return !!p;
    const rec = RECOVERABLE_PURCHASES.find(r => r.id === p.id);
    if (!rec) return true;
    const recTotal = parseCurrency(rec.total);
    const hasEquivalent = state.comprasRegistros.some(other => {
      if (!other || other === p || !other.id || other.id === p.id) return false;
      if (other.nfeKey && rec.nfeKey && other.nfeKey === rec.nfeKey) return true;
      return other.marketName && rec.marketName &&
        other.marketName.trim().toLowerCase() === rec.marketName.trim().toLowerCase() &&
        other.date === rec.date &&
        Math.abs(parseCurrency(other.total) - recTotal) < 0.05;
    });
    return !hasEquivalent;
  });
  if (state.comprasRegistros.length !== beforeDedupe) added = true;

  if (added) {
    state.comprasRegistros.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  return state;
}

/**
 * Exclui uma compra registrando o túmulo. Se ela for equivalente a uma nota
 * "recuperável" (mesmo mercado/data/total), marca também o id fixo dessa nota
 * — senão a rotina de recuperação traria a cópia de volta no próximo load.
 */
export function markPurchaseDeleted(state, purchaseId) {
  if (!state || !purchaseId) return;
  const purchase = (state.comprasRegistros || []).find(p => p && p.id === purchaseId);
  markDeleted(state, 'comprasRegistros', purchaseId);
  if (!purchase) return;
  const total = parseCurrency(purchase.total);
  RECOVERABLE_PURCHASES.forEach(rec => {
    if (!rec.marketName || !purchase.marketName) return;
    const sameMarket = purchase.marketName.trim().toLowerCase() === rec.marketName.trim().toLowerCase();
    const sameDate = purchase.date === rec.date;
    const sameTotal = Math.abs(total - parseCurrency(rec.total)) < 0.05;
    if (sameMarket && sameDate && sameTotal) {
      markDeleted(state, 'comprasRegistros', rec.id);
    }
  });
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
    deletedIds: {},
    pets: JSON.parse(JSON.stringify(INITIAL_PETS)),
    deletedPetIds: [],
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
        autoSync: (parsed.settings && parsed.settings.autoSync !== undefined)
          ? !!parsed.settings.autoSync
          : (initial.settings.autoSync !== undefined ? initial.settings.autoSync : true)
      },
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : initial.tasks,
      history: parsed.history || {},
      carro: Array.isArray(parsed.carro) ? parsed.carro : initial.carro,
      reformas: Array.isArray(parsed.reformas) ? parsed.reformas : initial.reformas,
      sonhos: Array.isArray(parsed.sonhos) ? parsed.sonhos : initial.sonhos,
      compras: Array.isArray(parsed.compras) ? parsed.compras : initial.compras,
      comprasRegistros: Array.isArray(parsed.comprasRegistros) ? parsed.comprasRegistros : initial.comprasRegistros,
      pets: Array.isArray(parsed.pets) ? parsed.pets : JSON.parse(JSON.stringify(INITIAL_PETS)),
      deletedPetIds: Array.isArray(parsed.deletedPetIds) ? parsed.deletedPetIds : [],
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
    // (respeitando o que foi excluído) e normaliza valores vindos da planilha.
    ensureDeletedIds(merged);
    normalizePurchasesInState(merged);
    filterDeletedFromState(merged);
    ensureRecoveredPurchases(merged);

    deduplicatePets(merged);

    // Migração: remove a chave legada assim que o estado novo já existe no
    // localStorage. Antes ela ficava para sempre (com fotos em base64),
    // consumindo cota e podendo ressuscitar dados antigos.
    if (APP_CONFIG.legacyStorageKeys && APP_CONFIG.legacyStorageKeys.length > 0) {
      try {
        if (localStorage.getItem(APP_CONFIG.storageKey)) {
          APP_CONFIG.legacyStorageKeys.forEach(legacyKey => localStorage.removeItem(legacyKey));
        }
      } catch (e) {}
    }
    return merged;
  } catch (err) {
    console.error("Erro ao carregar estado do localStorage:", err);
    return getInitialState();
  }
}

let stateSavedListener = null;
let stateSaveErrorListener = null;

export function setOnStateSavedListener(fn) {
  stateSavedListener = fn;
}

/**
 * Registra um callback chamado quando o saveState falha (ex: cota do
 * localStorage cheia). Sem isso a alteração era perdida em silêncio,
 * com toast de sucesso na tela.
 */
export function setOnStateSaveErrorListener(fn) {
  stateSaveErrorListener = fn;
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
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
      } catch (storageErr) {
        console.warn("[Maracaju] Quota de localStorage atingida, salvando de forma defensiva...", storageErr);
        // Se a quota do localStorage for atingida, preserva compras, fotos e notas enxugando o catálogo transitório
        if (state.catalog && state.catalog.length > 50) {
          const trimmed = { ...state, catalog: state.catalog.slice(0, 30) };
          localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(trimmed));
        } else {
          throw storageErr;
        }
      }
    }

    if (typeof stateSavedListener === 'function') {
      try {
        stateSavedListener(state);
      } catch (e) {
        console.warn("[Maracaju] Erro no listener de auto-sync pós-salvamento:", e);
      }
    }

    return true;
  } catch (err) {
    console.error("Erro ao salvar estado no localStorage:", err);
    if (typeof stateSaveErrorListener === 'function') {
      try {
        stateSaveErrorListener(err);
      } catch (e) {}
    }
    return false;
  }
}

export function exportBackupJson(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
