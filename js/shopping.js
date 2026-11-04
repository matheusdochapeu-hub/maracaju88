// ============================================================
//  MARACAJU - LISTA DE COMPRAS DO MERCADO
//  Os dois vão adicionando itens durante o mês, conforme lembram.
// ============================================================

import { parseCurrency } from './currency.js';
import { makeId } from './projects.js';

function list(state) {
  if (!Array.isArray(state.compras)) state.compras = [];
  return state.compras;
}

function normalizeName(name) {
  return (name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Retorna { item, merged } — se já existir um item pendente com o mesmo nome, não duplica
export function addShoppingItem(state, data, userId = 'matheus') {
  const name = (data.name || '').trim();
  if (!name) throw new Error('Digite o nome do item.');

  const existing = list(state).find(i => !i.bought && normalizeName(i.name) === normalizeName(name));
  if (existing) {
    if (data.qty) existing.qty = data.qty.trim();
    if (data.category) existing.category = data.category;
    if (data.price !== undefined && data.price !== '') existing.price = parseCurrency(data.price);
    return { item: existing, merged: true };
  }

  const item = {
    id: makeId('cmp'),
    name,
    qty: (data.qty || '').trim(),
    category: data.category || 'mercearia',
    price: parseCurrency(data.price),
    notes: (data.notes || '').trim(),
    bought: false,
    addedBy: userId,
    boughtBy: null,
    createdAt: new Date().toISOString(),
    boughtAt: null
  };
  list(state).push(item);
  return { item, merged: false };
}

export function updateShoppingItem(state, id, data) {
  const item = list(state).find(i => i.id === id);
  if (!item) return null;
  if (data.name !== undefined) {
    const n = data.name.trim();
    if (!n) throw new Error('Digite o nome do item.');
    item.name = n;
  }
  if (data.qty !== undefined) item.qty = data.qty.trim();
  if (data.category !== undefined) item.category = data.category;
  if (data.notes !== undefined) item.notes = data.notes.trim();
  if (data.price !== undefined) item.price = parseCurrency(data.price);
  return item;
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
  const sum = (items) => Math.round(items.reduce((acc, i) => acc + (i.price || 0), 0) * 100) / 100;
  return {
    total: arr.length,
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

  const purchase = {
    id: makeId('nfe'),
    marketName,
    date: dateStr,
    monthKey,
    total,
    items: Array.isArray(data.items) ? data.items : [],
    nfeKey: (data.nfeKey || '').trim(),
    nfeUrl: (data.nfeUrl || '').trim(),
    notes: (data.notes || '').trim(),
    registeredBy: userId || 'matheus',
    createdAt: new Date().toISOString()
  };

  purchasesList(state).push(purchase);
  return purchase;
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
      purchases: items
    });
  });

  return result;
}
