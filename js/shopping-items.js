// ============================================================
//  MARACAJU - SHOPPING, ROUPAS, ELETRODOMÉSTICOS & DESEJOS
//  Lista de compras gerais do casal: roupas, calçados, tech,
//  eletrodomésticos, casa e itens desejados com fotos e preços.
// ============================================================

import { parseCurrency } from './currency.js';
import { makeId } from './projects.js';
import { getLocalDateString } from './dates.js';

/**
 * Retorna a lista de itens de shopping do estado com garantia de array
 */
export function listShoppingItems(state) {
  if (!state) return [];
  if (!Array.isArray(state.shoppingWishlist)) {
    state.shoppingWishlist = [];
  }
  return state.shoppingWishlist;
}

/**
 * Adiciona um novo item à lista de shopping
 */
export function addShoppingWishlistItem(state, data, userId = 'matheus') {
  const title = (data.title || data.name || '').trim();
  if (!title) {
    throw new Error('O título do item de shopping é obrigatório.');
  }

  const price = parseCurrency(data.price || data.estimatedCost || 0);
  const item = {
    id: makeId('shop'),
    title,
    category: data.category || 'roupas_calcados',
    price,
    store: (data.store || data.brand || '').trim(),
    link: (data.link || '').trim(),
    forWhom: data.forWhom || 'casal', // 'casal' | 'matheus' | 'scarlet'
    priority: data.priority || 'media', // 'baixa' | 'media' | 'alta' | 'urgente'
    status: data.status || 'desejado', // 'desejado' | 'pesquisando' | 'comprado'
    notes: (data.notes || data.description || '').trim(),
    photos: Array.isArray(data.photos) ? [...data.photos] : (data.photo ? [data.photo] : []),
    purchasedPrice: data.status === 'comprado' ? (parseCurrency(data.purchasedPrice) || price) : 0,
    purchasedAt: data.status === 'comprado' ? (data.purchasedAt || getLocalDateString()) : null,
    createdBy: userId || 'matheus',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  listShoppingItems(state).unshift(item);
  return item;
}

/**
 * Atualiza um item existente de shopping
 */
export function updateShoppingWishlistItem(state, id, data) {
  const item = listShoppingItems(state).find(it => it.id === id);
  if (!item) return null;

  if (data.title !== undefined) {
    const t = String(data.title).trim();
    if (!t) throw new Error('O título do item não pode ser vazio.');
    item.title = t;
  }
  if (data.category !== undefined) item.category = data.category;
  if (data.price !== undefined) item.price = parseCurrency(data.price);
  if (data.store !== undefined) item.store = String(data.store).trim();
  if (data.link !== undefined) item.link = String(data.link).trim();
  if (data.forWhom !== undefined) item.forWhom = data.forWhom;
  if (data.priority !== undefined) item.priority = data.priority;
  if (data.notes !== undefined) item.notes = String(data.notes).trim();

  if (data.status !== undefined) {
    item.status = data.status;
    if (data.status === 'comprado') {
      if (!item.purchasedAt) item.purchasedAt = getLocalDateString();
      if (!item.purchasedPrice) item.purchasedPrice = item.price;
    } else {
      item.purchasedAt = null;
      item.purchasedPrice = 0;
    }
  }

  if (data.purchasedPrice !== undefined) {
    item.purchasedPrice = parseCurrency(data.purchasedPrice);
  }
  if (data.purchasedAt !== undefined) {
    item.purchasedAt = data.purchasedAt;
  }

  if (Array.isArray(data.photos)) {
    item.photos = [...data.photos];
  }

  item.updatedAt = new Date().toISOString();
  return item;
}

/**
 * Remove um item de shopping pelo ID
 */
export function deleteShoppingWishlistItem(state, id) {
  const items = listShoppingItems(state);
  const idx = items.findIndex(it => it.id === id);
  if (idx < 0) return false;
  items.splice(idx, 1);
  return true;
}

/**
 * Alterna status de comprado do item de shopping
 */
export function toggleShoppingItemBought(state, id, purchasedPrice = null) {
  const item = listShoppingItems(state).find(it => it.id === id);
  if (!item) return null;

  if (item.status === 'comprado') {
    item.status = 'desejado';
    item.purchasedAt = null;
    item.purchasedPrice = 0;
  } else {
    item.status = 'comprado';
    item.purchasedAt = getLocalDateString();
    item.purchasedPrice = purchasedPrice !== null ? parseCurrency(purchasedPrice) : item.price;
  }

  item.updatedAt = new Date().toISOString();
  return item;
}

/**
 * Adiciona foto ao item
 */
export function addPhotoToShoppingItem(state, id, photoUrl) {
  const item = listShoppingItems(state).find(it => it.id === id);
  if (!item) return false;
  if (!Array.isArray(item.photos)) item.photos = [];
  item.photos.push(photoUrl);
  item.updatedAt = new Date().toISOString();
  return true;
}

/**
 * Remove foto do item pelo índice
 */
export function removePhotoFromShoppingItem(state, id, index) {
  const item = listShoppingItems(state).find(it => it.id === id);
  if (!item || !Array.isArray(item.photos) || index < 0 || index >= item.photos.length) return false;
  item.photos.splice(index, 1);
  item.updatedAt = new Date().toISOString();
  return true;
}

/**
 * Calcula resumo e métricas da aba Shopping
 */
export function getShoppingSummary(state) {
  const items = listShoppingItems(state);
  const totalItems = items.length;
  const activeList = items.filter(it => it.status !== 'comprado');
  const boughtList = items.filter(it => it.status === 'comprado');

  const totalEstimatedActive = activeList.reduce((acc, it) => acc + (it.price || 0), 0);
  const totalPurchased = boughtList.reduce((acc, it) => acc + (it.purchasedPrice || it.price || 0), 0);

  return {
    totalItems,
    activeCount: activeList.length,
    boughtCount: boughtList.length,
    totalEstimatedActive: Math.round(totalEstimatedActive * 100) / 100,
    totalPurchased: Math.round(totalPurchased * 100) / 100
  };
}

/**
 * Filtra e busca itens de shopping com múltiplos critérios
 */
export function filterShoppingItems(state, {
  query = '',
  category = 'todos',
  status = 'todos',
  forWhom = 'todos',
  sort = 'priority'
} = {}) {
  const items = listShoppingItems(state);
  const normQuery = String(query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const priorityWeights = {
    urgente: 4,
    alta: 3,
    media: 2,
    baixa: 1
  };

  return items.filter(it => {
    // Filtro por Categoria
    if (category && category !== 'todos' && it.category !== category) {
      return false;
    }

    // Filtro por Status
    if (status && status !== 'todos') {
      if (status === 'ativos' && it.status === 'comprado') return false;
      if (status !== 'ativos' && it.status !== status) return false;
    }

    // Filtro por Destinatário (Casal / Matheus / Scarlet)
    if (forWhom && forWhom !== 'todos' && it.forWhom !== forWhom) {
      return false;
    }

    // Busca por Texto
    if (normQuery) {
      const matchTitle = (it.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normQuery);
      const matchStore = (it.store || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normQuery);
      const matchNotes = (it.notes || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normQuery);
      if (!matchTitle && !matchStore && !matchNotes) return false;
    }

    return true;
  }).sort((a, b) => {
    // Itens não comprados vêm primeiro por padrão
    if (a.status === 'comprado' && b.status !== 'comprado') return 1;
    if (a.status !== 'comprado' && b.status === 'comprado') return -1;

    if (sort === 'priority') {
      const wA = priorityWeights[a.priority] || 0;
      const wB = priorityWeights[b.priority] || 0;
      if (wB !== wA) return wB - wA;
      return (b.price || 0) - (a.price || 0);
    }
    if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sort === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sort === 'alpha') return (a.title || '').localeCompare(b.title || '');

    // Default: mais recentes primeiro
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}
