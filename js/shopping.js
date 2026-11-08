// ============================================================
//  MARACAJU - LISTA DE COMPRAS DO MERCADO
//  Os dois vão adicionando itens durante o mês, conforme lembram.
// ============================================================

import { parseCurrency } from './currency.js';
import { makeId } from './projects.js';
import { getBenefitCycleKey, getCurrentBenefitCycleKey } from './benefits.js';

function list(state) {
  if (!Array.isArray(state.compras)) state.compras = [];
  return state.compras;
}

function normalizeName(name) {
  return (name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function parseQuantity(raw) {
  if (raw === null || raw === undefined) return { text: '1 unidade', count: 1, unit: 'unidade' };
  const str = String(raw).trim();
  if (!str) return { text: '1 unidade', count: 1, unit: 'unidade' };

  // Apenas dígitos ou com vírgula/ponto (ex: '6', '1', '6.5', '2,5') -> normaliza para '6 unidades'
  if (/^[\d]+([.,]\d+)?$/.test(str)) {
    const num = parseFloat(str.replace(',', '.'));
    const safeNum = isNaN(num) || num <= 0 ? 1 : num;
    const unitLabel = safeNum === 1 ? 'unidade' : 'unidades';
    return { text: `${str} ${unitLabel}`, count: safeNum, unit: unitLabel };
  }

  // Número seguido da unidade: '6 un', '6 unidades', '2 kg', '500g', '3 caixas'
  const match = str.match(/^([\d]+(?:[.,]\d+)?)\s*(.*)$/i);
  if (match) {
    const num = parseFloat(match[1].replace(',', '.'));
    const safeNum = isNaN(num) || num <= 0 ? 1 : num;
    const unitRaw = match[2].trim();
    const unitLower = unitRaw.toLowerCase();

    // Se a unidade for gramas ou mililitros com valor alto (ex: 500g de café, 200ml de molho), é 1 embalagem
    if (/^(g|gr|gramas|ml|mls)$/i.test(unitLower) && safeNum > 20) {
      return { text: str, count: 1, unit: unitRaw };
    }

    return { text: str, count: safeNum, unit: unitRaw || (safeNum === 1 ? 'unidade' : 'unidades') };
  }

  return { text: str, count: 1, unit: '' };
}

export function getItemTotalPrice(item) {
  if (!item) return 0;
  if (typeof item.totalPrice === 'number' && item.totalPrice > 0) {
    return Math.round(item.totalPrice * 100) / 100;
  }
  const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
  const { count } = parseQuantity(item.quantity || item.qty);
  return Math.round(unitPrice * count * 100) / 100;
}

// Retorna { item, merged } — se já existir um item pendente com o mesmo nome, não duplica
export function addShoppingItem(state, data, userId = 'matheus') {
  const name = (data.name || data.title || '').trim();
  if (!name) throw new Error('Digite o nome do item.');

  const existing = list(state).find(i => !i.bought && normalizeName(i.name || i.title) === normalizeName(name));
  const parsedQty = parseQuantity(data.qty || data.quantity);
  const qty = parsedQty.text;
  const unitPrice = parseCurrency(data.unitPrice !== undefined ? data.unitPrice : data.price);
  const totalPrice = Math.round(unitPrice * parsedQty.count * 100) / 100;
  const suggested = data.suggestedBy || userId;

  if (existing) {
    if (data.qty !== undefined || data.quantity !== undefined) {
      existing.qty = qty;
      existing.quantity = qty;
    }
    if (data.category) existing.category = data.category;
    if (data.price !== undefined || data.unitPrice !== undefined) {
      existing.unitPrice = unitPrice;
      existing.price = unitPrice;
    }
    const curQty = parseQuantity(existing.quantity || existing.qty);
    const curUPrice = existing.unitPrice !== undefined ? existing.unitPrice : (existing.price || 0);
    existing.totalPrice = Math.round(curUPrice * curQty.count * 100) / 100;

    if (data.suggestedBy) existing.suggestedBy = data.suggestedBy;
    if (data.notes) existing.notes = data.notes.trim();
    return { item: existing, merged: true };
  }

  const item = {
    id: makeId('cmp'),
    name,
    title: name,
    catalogId: data.catalogId || null,
    qty,
    quantity: qty,
    category: data.category || 'outros',
    unitPrice,
    price: unitPrice,
    totalPrice,
    notes: (data.notes || '').trim(),
    bought: false,
    addedBy: userId,
    suggestedBy: suggested,
    boughtBy: null,
    createdAt: new Date().toISOString(),
    boughtAt: null,
    photos: Array.isArray(data.photos) ? data.photos : []
  };
  list(state).push(item);
  return { item, merged: false };
}

export function updateShoppingItem(state, id, data) {
  const item = list(state).find(i => i.id === id);
  if (!item) return null;
  const name = data.name !== undefined ? data.name : data.title;
  if (name !== undefined) {
    const n = name.trim();
    if (!n) throw new Error('Digite o nome do item.');
    item.name = n;
    item.title = n;
  }
  if (data.qty !== undefined || data.quantity !== undefined) {
    const parsedQty = parseQuantity(data.qty !== undefined ? data.qty : data.quantity);
    item.qty = parsedQty.text;
    item.quantity = parsedQty.text;
  }
  if (data.category !== undefined) item.category = data.category;
  if (data.notes !== undefined) item.notes = data.notes.trim();
  if (data.price !== undefined || data.unitPrice !== undefined) {
    const uPrice = parseCurrency(data.unitPrice !== undefined ? data.unitPrice : data.price);
    item.unitPrice = uPrice;
    item.price = uPrice;
  }
  const curQty = parseQuantity(item.quantity || item.qty);
  const curUPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
  item.totalPrice = Math.round(curUPrice * curQty.count * 100) / 100;

  if (data.suggestedBy !== undefined) item.suggestedBy = data.suggestedBy;
  if (data.photos !== undefined) item.photos = data.photos;
  return item;
}

export function addPhotoToShoppingItem(state, id, photoUrl) {
  const item = list(state).find(i => i.id === id);
  if (!item) return false;
  if (!Array.isArray(item.photos)) item.photos = [];
  item.photos.push(photoUrl);
  return true;
}

export function removePhotoFromShoppingItem(state, id, index) {
  const item = list(state).find(i => i.id === id);
  if (!item || !Array.isArray(item.photos) || index < 0 || index >= item.photos.length) return false;
  item.photos.splice(index, 1);
  return true;
}

export function toggleShoppingItem(state, id, userId = 'matheus') {
  const item = list(state).find(i => i.id === id);
  if (!item) return null;
  item.bought = !item.bought;
  item.boughtBy = item.bought ? userId : null;
  item.boughtAt = item.bought ? new Date().toISOString() : null;
  return item;
}

export function deleteShoppingItem(state, id) {
  const arr = list(state);
  const idx = arr.findIndex(i => i.id === id);
  return idx !== -1 ? arr.splice(idx, 1)[0] : null;
}

export function clearBoughtItems(state) {
  const before = list(state).length;
  state.compras = list(state).filter(i => !i.bought);
  return before - state.compras.length;
}

// Reabre todos os comprados (útil para reaproveitar a lista do mês anterior)
export function restoreBoughtItems(state) {
  let count = 0;
  list(state).forEach(i => {
    if (i.bought) { i.bought = false; i.boughtBy = null; i.boughtAt = null; count++; }
  });
  return count;
}

export function getShoppingSummary(state) {
  const arr = list(state);
  const pending = arr.filter(i => !i.bought);
  const bought = arr.filter(i => i.bought);
  const sum = (items) => Math.round(items.reduce((acc, i) => acc + getItemTotalPrice(i), 0) * 100) / 100;
  return {
    total: arr.length,
    totalCount: arr.length,
    pendingCount: pending.length,
    boughtCount: bought.length,
    pendingTotal: sum(pending),
    boughtTotal: sum(bought),
    estimatedTotal: sum(arr)
  };
}

// -------------------------------------------------------------
// REGISTROS DE COMPRAS DE MERCADO / NOTAS FISCAIS POR MÊS
// -------------------------------------------------------------
function purchasesList(state) {
  if (!Array.isArray(state.comprasRegistros)) state.comprasRegistros = [];
  return state.comprasRegistros;
}

export function formatMonthKey(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const clean = String(dateStr).substring(0, 7);
  return /^\d{4}-\d{2}$/.test(clean) ? clean : formatMonthKey(null);
}

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthLabel(monthKey) {
  if (!monthKey || !monthKey.includes('-')) return 'Mês Atual';
  const [year, month] = monthKey.split('-').map(Number);
  const mName = MONTH_NAMES_PT[month - 1] || `Mês ${month}`;
  return `${mName} de ${year}`;
}

export function addMarketPurchase(state, data, userId = 'matheus') {
  const marketName = (data.marketName || 'Supermercado').trim();
  const dateStr = data.date ? String(data.date).substring(0, 10) : new Date().toISOString().substring(0, 10);
  const monthKey = formatMonthKey(dateStr);
  const total = parseCurrency(data.total);
  const paymentMethod = (data.paymentMethod || 'va').toLowerCase();

  const purchase = {
    id: makeId('nfe'),
    marketName,
    date: dateStr,
    monthKey,
    total,
    paymentMethod,
    items: Array.isArray(data.items) ? data.items : [],
    photos: Array.isArray(data.photos) ? data.photos : [],
    nfeKey: (data.nfeKey || '').trim(),
    nfeUrl: (data.nfeUrl || '').trim(),
    notes: (data.notes || '').trim(),
    registeredBy: userId || 'matheus',
    createdAt: new Date().toISOString()
  };

  purchasesList(state).push(purchase);
  return purchase;
}

export function addPhotoToMarketPurchase(state, id, photoUrl) {
  const p = purchasesList(state).find(item => item.id === id);
  if (!p) return false;
  if (!Array.isArray(p.photos)) p.photos = [];
  p.photos.push(photoUrl);
  return true;
}

export function removePhotoFromMarketPurchase(state, id, index) {
  const p = purchasesList(state).find(item => item.id === id);
  if (!p || !Array.isArray(p.photos) || index < 0 || index >= p.photos.length) return false;
  p.photos.splice(index, 1);
  return true;
}

export function updateMarketPurchase(state, id, data) {
  const p = purchasesList(state).find(item => item.id === id);
  if (!p) return null;
  if (data.marketName !== undefined) p.marketName = data.marketName.trim() || 'Supermercado';
  if (data.date !== undefined) {
    p.date = String(data.date).substring(0, 10);
    p.monthKey = formatMonthKey(p.date);
  }
  if (data.total !== undefined) p.total = parseCurrency(data.total);
  if (data.paymentMethod !== undefined) p.paymentMethod = String(data.paymentMethod).toLowerCase();
  if (data.notes !== undefined) p.notes = data.notes.trim();
  p.updatedAt = new Date().toISOString();
  return p;
}

export function deleteMarketPurchase(state, id) {
  const arr = purchasesList(state);
  const idx = arr.findIndex(p => p.id === id);
  return idx !== -1 ? arr.splice(idx, 1)[0] : null;
}

export function getMarketPurchasesByMonth(state) {
  const arr = purchasesList(state);
  const groups = {};

  arr.forEach(p => {
    const m = p.monthKey || formatMonthKey(p.date);
    if (!groups[m]) groups[m] = [];
    groups[m].push(p);
  });

  const sortedMonthKeys = Object.keys(groups).sort().reverse();
  const result = [];

  sortedMonthKeys.forEach(mKey => {
    const items = groups[mKey].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const monthTotal = Math.round(items.reduce((sum, item) => sum + (item.total || 0), 0) * 100) / 100;
    result.push({
      monthKey: mKey,
      monthLabel: getMonthLabel(mKey),
      total: monthTotal,
      count: items.length,
      purchases: items
    });
  });

  return result;
}

export function getMarketAnalytics(state, periodOrCycle = null, targetCycleKey = null) {
  const allPurchases = purchasesList(state);
  const now = new Date();
  const currentYear = now.getFullYear();
  const pad = n => String(n).padStart(2, '0');

  let selectedPeriod = periodOrCycle;
  let cycleKey = targetCycleKey;

  let purchases = allPurchases;

  if (selectedPeriod === 'cycle') {
    if (!cycleKey) {
      cycleKey = (state && state._activeBenefitsCycle) || getCurrentBenefitCycleKey(state);
    }
    purchases = allPurchases.filter(p => {
      const pCycle = getBenefitCycleKey(p.date || p.createdAt, state);
      return pCycle === cycleKey;
    });
  } else if (selectedPeriod === '12months') {
    const cutoff = new Date(currentYear - 1, now.getMonth(), now.getDate());
    const cutoffIso = `${cutoff.getFullYear()}-${pad(cutoff.getMonth() + 1)}-${pad(cutoff.getDate())}`;
    purchases = allPurchases.filter(p => {
      const pDate = (p.date || p.createdAt || '').slice(0, 10);
      return pDate >= cutoffIso;
    });
  } else if (selectedPeriod === 'year') {
    const targetY = String(targetCycleKey || currentYear);
    purchases = allPurchases.filter(p => {
      const pDate = (p.date || p.createdAt || '').slice(0, 10);
      return pDate.startsWith(targetY);
    });
  } else if (selectedPeriod && selectedPeriod !== 'todos' && selectedPeriod !== 'all') {
    purchases = allPurchases.filter(p => (p.monthKey || formatMonthKey(p.date)) === selectedPeriod);
  }

  const total = Math.round(purchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0) * 100) / 100;
  const count = purchases.length;
  const avgTicket = count > 0 ? Math.round((total / count) * 100) / 100 : 0;

  // Gastos e frequência por Mercado (Mercados Recorrentes)
  const marketMap = {};
  purchases.forEach(p => {
    const rawName = (p.marketName || 'Supermercado').trim();
    const name = rawName || 'Supermercado';
    if (!marketMap[name]) {
      marketMap[name] = { marketName: name, total: 0, count: 0, lastDate: p.date };
    }
    marketMap[name].total = Math.round((marketMap[name].total + (Number(p.total) || 0)) * 100) / 100;
    marketMap[name].count += 1;
    if (p.date && (!marketMap[name].lastDate || p.date > marketMap[name].lastDate)) {
      marketMap[name].lastDate = p.date;
    }
  });

  const recurrentMarkets = Object.values(marketMap)
    .map(m => ({
      ...m,
      percentage: total > 0 ? Math.round((m.total / total) * 1000) / 10 : 0,
      avgTicket: m.count > 0 ? Math.round((m.total / m.count) * 100) / 100 : 0
    }))
    .sort((a, b) => b.total - a.total);

  // Lista única de nomes de mercados cadastrados em todo o histórico (para autocomplete / datalist)
  const uniqueMarketsList = Array.from(new Set(allPurchases.map(p => (p.marketName || '').trim()).filter(Boolean)));

  // Total de itens registrados
  const itemsCount = purchases.reduce((sum, p) => sum + (Array.isArray(p.items) ? p.items.length : 0), 0);

  // Resumo por Forma de Pagamento
  const paymentBreakdown = {
    va: 0,
    vr: 0,
    pix: 0,
    credito: 0,
    debito: 0,
    dinheiro: 0,
    outro: 0
  };
  purchases.forEach(p => {
    const m = (p.paymentMethod || 'va').toLowerCase();
    const val = Number(p.total) || 0;
    if (paymentBreakdown[m] !== undefined) {
      paymentBreakdown[m] += val;
    } else {
      paymentBreakdown.outro += val;
    }
  });
  Object.keys(paymentBreakdown).forEach(k => {
    paymentBreakdown[k] = Math.round(paymentBreakdown[k] * 100) / 100;
  });

  // Separação específica VA e VR com cálculo de ticket médio
  const vaPurchases = purchases.filter(p => (p.paymentMethod || 'va').toLowerCase() === 'va');
  const vaTotal = Math.round(vaPurchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0) * 100) / 100;
  const vaCount = vaPurchases.length;
  const vaAvgTicket = vaCount > 0 ? Math.round((vaTotal / vaCount) * 100) / 100 : 0;

  const vrPurchases = purchases.filter(p => (p.paymentMethod || '').toLowerCase() === 'vr');
  const vrTotal = Math.round(vrPurchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0) * 100) / 100;
  const vrCount = vrPurchases.length;
  const vrAvgTicket = vrCount > 0 ? Math.round((vrTotal / vrCount) * 100) / 100 : 0;

  const otherPurchases = purchases.filter(p => !['va', 'vr'].includes((p.paymentMethod || '').toLowerCase()));
  const otherTotal = Math.round(otherPurchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0) * 100) / 100;
  const otherCount = otherPurchases.length;
  const otherAvgTicket = otherCount > 0 ? Math.round((otherTotal / otherCount) * 100) / 100 : 0;

  const foodBenefitsTotal = Math.round((vaTotal + vrTotal) * 100) / 100;

  // Detalhamento estatístico por método de pagamento (ticket médio e contagem)
  const paymentMethodStats = {};
  Object.keys(paymentBreakdown).forEach(mId => {
    const pList = purchases.filter(p => (p.paymentMethod || 'va').toLowerCase() === mId);
    const mTotal = Math.round(pList.reduce((sum, p) => sum + (Number(p.total) || 0), 0) * 100) / 100;
    const mCount = pList.length;
    const mAvg = mCount > 0 ? Math.round((mTotal / mCount) * 100) / 100 : 0;
    paymentMethodStats[mId] = {
      total: mTotal,
      count: mCount,
      avgTicket: mAvg
    };
  });

  // Lista de meses disponíveis ordenada (mês vigente primeiro, depois anteriores)
  const currentMonthKey = formatMonthKey(new Date());
  const monthsSet = new Set();
  monthsSet.add(currentMonthKey);
  allPurchases.forEach(p => {
    const mKey = p.monthKey || formatMonthKey(p.date || p.createdAt);
    if (mKey) monthsSet.add(mKey);
  });
  const availableMonths = Array.from(monthsSet).sort().reverse().map(mKey => ({
    key: mKey,
    label: getMonthLabel(mKey),
    isCurrent: mKey === currentMonthKey
  }));

  return {
    total,
    count,
    avgTicket,
    itemsCount,
    recurrentMarkets,
    uniqueMarketsList,
    selectedMonthKey: selectedPeriod === 'cycle' ? cycleKey : (selectedPeriod || 'todos'),
    period: selectedPeriod || 'all',
    cycleKey,
    paymentBreakdown,
    paymentMethodStats,
    vaTotal,
    vaCount,
    vaAvgTicket,
    vrTotal,
    vrCount,
    vrAvgTicket,
    otherTotal,
    otherCount,
    otherAvgTicket,
    availableMonths,
    currentMonthKey,
    foodBenefitsTotal,
    purchases
  };
}

// -------------------------------------------------------------
// CONCILIAÇÃO INTELIGENTE DE ITENS COMPRADOS COM A LISTA
// -------------------------------------------------------------

const RECONCILIATION_STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'com', 'sem', 'para', 'por', 'e', 'a', 'o',
  'kg', 'g', 'gr', 'gramas', 'l', 'lt', 'litro', 'litros', 'ml', 'un', 'unidade', 'unidades', 'und',
  'pct', 'pacote', 'cx', 'caixa', 'fd', 'fardo', 'tp', 'uht', 't1', 'tipo', '1kg', '5kg', '1l', '500g', '200g'
]);

function normalizeReconciliationStr(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractReconciliationTokens(str) {
  return normalizeReconciliationStr(str)
    .split(' ')
    .filter(w => w.length >= 2 && !RECONCILIATION_STOPWORDS.has(w));
}

export function computeTextSimilarity(s1, s2) {
  const norm1 = normalizeReconciliationStr(s1);
  const norm2 = normalizeReconciliationStr(s2);

  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  // Substring direta (ex: "arroz" em "arroz tio joao")
  if (norm2.includes(norm1) || norm1.includes(norm2)) {
    return 0.90;
  }

  const tokens1 = extractReconciliationTokens(s1);
  const tokens2 = extractReconciliationTokens(s2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  if (tokens1.length === 1) {
    const t = tokens1[0];
    const match = tokens2.some(t2 => t2 === t || (t.length >= 4 && (t2.startsWith(t) || t.startsWith(t2))));
    if (match) return 0.85;
  }

  let matchCount = 0;
  tokens1.forEach(t1 => {
    const found = tokens2.some(t2 => t2 === t1 || (t1.length >= 4 && (t2.startsWith(t1) || t1.startsWith(t2))));
    if (found) matchCount++;
  });

  const ratio = matchCount / tokens1.length;
  if (ratio >= 0.5) {
    return Math.max(0.65, ratio);
  }

  return 0;
}

/**
 * Compara os itens da compra efetuada (ou notas) com os itens pendentes da lista de compras.
 * Retorna lista de similaridades encontradas para confirmação pelo usuário.
 */
export function findMatchingShoppingItems(state, purchaseData) {
  if (!state || !Array.isArray(state.compras)) return [];

  // Considera apenas itens da lista que ainda NÃO foram comprados
  const pendingItems = state.compras.filter(item => !item.bought);
  if (pendingItems.length === 0) return [];

  // Coleta os textos/itens da compra efetuada
  const purchaseTexts = [];

  if (Array.isArray(purchaseData?.items)) {
    purchaseData.items.forEach(it => {
      const name = it.name || it.title || it.rawName || it.description;
      if (name) purchaseTexts.push(String(name).trim());
    });
  }

  if (purchaseData?.notes) {
    const noteLines = String(purchaseData.notes).split(/[\n,;]+/);
    noteLines.forEach(l => {
      const trimmed = l.trim();
      if (trimmed.length >= 3) purchaseTexts.push(trimmed);
    });
  }

  if (purchaseTexts.length === 0) return [];

  const matched = [];
  const matchedShoppingIds = new Set();

  pendingItems.forEach(shopItem => {
    if (matchedShoppingIds.has(shopItem.id)) return;
    const shopName = shopItem.name || shopItem.title || '';
    if (!shopName) return;

    let bestMatch = null;
    let bestScore = 0;

    for (const purText of purchaseTexts) {
      const score = computeTextSimilarity(shopName, purText);
      if (score >= 0.55 && score > bestScore) {
        bestScore = score;
        bestMatch = purText;
      }
    }

    if (bestMatch && bestScore >= 0.55) {
      matchedShoppingIds.add(shopItem.id);
      matched.push({
        shoppingItem: shopItem,
        matchedWith: bestMatch,
        score: Math.round(bestScore * 100) / 100
      });
    }
  });

  return matched;
}

/**
 * Marca como comprados os itens da lista informados
 */
export function markShoppingItemsAsBought(state, itemIds, userId = 'matheus') {
  if (!Array.isArray(state.compras) || !Array.isArray(itemIds) || itemIds.length === 0) return 0;
  const idSet = new Set(itemIds);
  let count = 0;
  const now = new Date().toISOString();
  state.compras.forEach(item => {
    if (idSet.has(item.id)) {
      item.bought = true;
      item.boughtAt = now;
      item.boughtBy = userId;
      count++;
    }
  });
  return count;
}

/**
 * Exclui permanentemente da lista de compras os itens informados
 */
export function removeShoppingItemsFromList(state, itemIds) {
  if (!Array.isArray(state.compras) || !Array.isArray(itemIds) || itemIds.length === 0) return 0;
  const idSet = new Set(itemIds);
  const before = state.compras.length;
  state.compras = state.compras.filter(item => !idSet.has(item.id));
  return before - state.compras.length;
}
