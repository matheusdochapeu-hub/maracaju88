// ============================================================
//  MARACAJU - CATÁLOGO DE PRODUTOS & HISTÓRICO DE PREÇOS
//  Memória persistente de compras, apelidos populares, fotos
//  e comparativo de preços entre mercados e datas.
// ============================================================

import { addShoppingItem } from './shopping.js';

/**
 * Normaliza strings para busca sem acentos e minúscula
 */
export function normalizeSearchTerm(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Garante inicialização da coleção de catálogo no estado
 */
export function ensureCatalog(state) {
  if (!state.catalog || !Array.isArray(state.catalog)) {
    state.catalog = [];
  }
  return state.catalog;
}

/**
 * Localiza um produto no catálogo por ID, código da nota ou nome
 */
export function findCatalogProduct(state, criteria = {}) {
  const catalog = ensureCatalog(state);
  const { id, code, rawName, alias } = criteria;

  if (id) {
    const found = catalog.find(p => p.id === id);
    if (found) return found;
  }

  const normCode = code ? String(code).trim().toUpperCase() : '';
  if (normCode) {
    const found = catalog.find(p => p.code && p.code.trim().toUpperCase() === normCode);
    if (found) return found;
    // Se o critério especificou um código explícito e não encontrou no catálogo por código,
    // não mescla com outros produtos para preservar variações de sabores/código
    return null;
  }

  const normRaw = normalizeSearchTerm(rawName);
  const normAlias = normalizeSearchTerm(alias);

  if (normRaw || normAlias) {
    return catalog.find(p => {
      if (p.code) return false; // Produto catalogado por código mantém identidade estrita
      const pRaw = normalizeSearchTerm(p.rawName);
      const pAlias = normalizeSearchTerm(p.alias);
      if (normRaw && (pRaw === normRaw || pAlias === normRaw)) return true;
      if (normAlias && (pAlias === normAlias || pRaw === normAlias)) return true;
      return false;
    });
  }

  return null;
}

/**
 * Atualiza ou insere um produto no catálogo inteligente de mercado
 */
export function upsertCatalogProduct(state, itemData, purchaseInfo = {}) {
  const catalog = ensureCatalog(state);
  let product = findCatalogProduct(state, {
    id: itemData.id,
    code: itemData.code,
    rawName: itemData.rawName,
    alias: itemData.alias
  });

  const now = new Date().toISOString();
  const purchaseDate = purchaseInfo.date || now.substring(0, 10);
  const market = purchaseInfo.marketName || 'Supermercado';
  const unitPrice = Number(itemData.unitPrice || itemData.price || 0);
  const qty = itemData.qty || '1';

  if (!product) {
    product = {
      id: itemData.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      code: itemData.code || '',
      rawName: itemData.rawName || itemData.name || '',
      alias: itemData.alias || itemData.name || itemData.rawName || 'Produto',
      category: itemData.category || 'mercearia',
      unit: itemData.unit || 'un',
      photos: Array.isArray(itemData.photos) ? [...itemData.photos] : (itemData.photo ? [itemData.photo] : []),
      lastPrice: unitPrice,
      minPrice: unitPrice > 0 ? unitPrice : 0,
      maxPrice: unitPrice > 0 ? unitPrice : 0,
      lastMarket: market,
      lastDate: purchaseDate,
      timesBought: 1,
      createdAt: now,
      updatedAt: now,
      priceHistory: []
    };

    if (unitPrice > 0) {
      product.priceHistory.push({
        date: purchaseDate,
        market,
        unitPrice,
        qty,
        totalPrice: Number(itemData.totalPrice || unitPrice),
        nfeKey: purchaseInfo.nfeKey || ''
      });
    }

    catalog.push(product);
  } else {
    // Atualiza dados e histórico do produto existente
    if (itemData.alias && itemData.alias.trim()) {
      product.alias = itemData.alias.trim();
    }
    if (itemData.category) {
      product.category = itemData.category;
    }
    if (itemData.code && !product.code) {
      product.code = itemData.code;
    }

    // Mescla fotos sem duplicatas
    if (Array.isArray(itemData.photos)) {
      itemData.photos.forEach(ph => {
        if (!product.photos.includes(ph)) product.photos.push(ph);
      });
    } else if (itemData.photo && !product.photos.includes(itemData.photo)) {
      product.photos.push(itemData.photo);
    }

    if (unitPrice > 0) {
      product.lastPrice = unitPrice;
      product.lastMarket = market;
      product.lastDate = purchaseDate;
      product.minPrice = product.minPrice > 0 ? Math.min(product.minPrice, unitPrice) : unitPrice;
      product.maxPrice = Math.max(product.maxPrice || 0, unitPrice);

      product.priceHistory.push({
        date: purchaseDate,
        market,
        unitPrice,
        qty,
        totalPrice: Number(itemData.totalPrice || unitPrice),
        nfeKey: purchaseInfo.nfeKey || ''
      });
    }

    product.timesBought = (product.timesBought || 0) + 1;
    product.updatedAt = now;
  }

  return product;
}

/**
 * Salva todos os itens de uma nota fiscal no catálogo de produtos
 */
export function registerInvoiceInCatalog(state, invoiceData) {
  const purchaseInfo = {
    marketName: invoiceData.marketName || 'Supermercado',
    date: invoiceData.date || new Date().toISOString().substring(0, 10),
    nfeKey: invoiceData.nfeKey || ''
  };

  const processed = [];
  (invoiceData.items || []).forEach(item => {
    const prod = upsertCatalogProduct(state, item, purchaseInfo);
    processed.push(prod);
  });

  return processed;
}

/**
 * Calcula métricas comparativas de preço para um produto do catálogo
 */
export function getProductPriceComparison(product) {
  if (!product) return null;

  const history = Array.isArray(product.priceHistory) ? product.priceHistory : [];
  const prices = history.map(h => h.unitPrice).filter(p => p > 0);

  const lastPrice = product.lastPrice || (prices.length > 0 ? prices[prices.length - 1] : 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : lastPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : lastPrice;
  const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length) : lastPrice;

  let previousPrice = null;
  let priceDiff = 0;
  let priceDiffPercent = 0;

  if (prices.length >= 2) {
    previousPrice = prices[prices.length - 2];
    priceDiff = Math.round((lastPrice - previousPrice) * 100) / 100;
    if (previousPrice > 0) {
      priceDiffPercent = Math.round(((lastPrice - previousPrice) / previousPrice) * 1000) / 10;
    }
  }

  return {
    lastPrice,
    previousPrice,
    minPrice,
    maxPrice,
    avgPrice: Math.round(avgPrice * 100) / 100,
    priceDiff,
    priceDiffPercent,
    history: [...history].reverse(),
    totalPurchases: history.length
  };
}

/**
 * Adiciona um produto do catálogo diretamente à lista de compras do mês
 */
export function addCatalogProductToShoppingList(state, catalogId, options = {}) {
  const catalog = ensureCatalog(state);
  const product = catalog.find(p => p.id === catalogId);
  if (!product) {
    throw new Error('Produto não encontrado no catálogo.');
  }

  const res = addShoppingItem(state, {
    name: product.alias || product.rawName,
    category: product.category || 'mercearia',
    quantity: options.qty || '1',
    price: product.lastPrice || 0,
    unitPrice: product.lastPrice || 0,
    catalogId: product.id,
    notes: product.rawName && product.rawName !== product.alias ? `Nota: ${product.rawName}` : ''
  });

  const item = res.item || res;

  // Copia as fotos do produto para o item da lista
  if (product.photos && product.photos.length > 0) {
    item.photos = [...product.photos];
  }

  return item;
}

/**
 * Adiciona uma foto a um produto do catálogo e propaga para itens da lista
 */
export function addPhotoToCatalogProduct(state, catalogId, photoDataUrl) {
  const catalog = ensureCatalog(state);
  const product = catalog.find(p => p.id === catalogId);
  if (!product) return null;

  if (!product.photos) product.photos = [];
  product.photos.push(photoDataUrl);
  product.updatedAt = new Date().toISOString();

  // Atualiza também itens da lista de compras do mês que apontam para este produto
  if (Array.isArray(state.compras)) {
    state.compras.forEach(item => {
      if (item.catalogId === catalogId || item.name === product.alias || item.name === product.rawName) {
        if (!item.photos) item.photos = [];
        if (!item.photos.includes(photoDataUrl)) {
          item.photos.push(photoDataUrl);
        }
      }
    });
  }

  return product;
}

/**
 * Atualiza o apelido popular e a categoria de um produto no catálogo
 */
export function updateCatalogProductDetails(state, catalogId, details = {}) {
  const catalog = ensureCatalog(state);
  const product = catalog.find(p => p.id === catalogId);
  if (!product) return null;

  if (details.alias !== undefined && details.alias.trim()) {
    product.alias = details.alias.trim();
  }
  if (details.category) {
    product.category = details.category;
  }
  if (details.unit) {
    product.unit = details.unit;
  }
  product.updatedAt = new Date().toISOString();

  // Propaga o novo apelido para itens não concluídos na lista de compras
  if (Array.isArray(state.compras) && product.alias) {
    state.compras.forEach(item => {
      if (item.catalogId === catalogId && !item.bought) {
        item.name = product.alias;
        if (details.category) item.category = details.category;
      }
    });
  }

  return product;
}

/**
 * Busca produtos do catálogo com filtros de texto e categoria
 */
export function searchCatalogProducts(state, query = '', category = '') {
  const catalog = ensureCatalog(state);
  const normQuery = normalizeSearchTerm(query);

  return catalog.filter(p => {
    if (category && category !== 'todos' && p.category !== category) {
      return false;
    }
    if (!normQuery) return true;

    const normAlias = normalizeSearchTerm(p.alias);
    const normRaw = normalizeSearchTerm(p.rawName);
    const normCode = normalizeSearchTerm(p.code);

    return normAlias.includes(normQuery) || normRaw.includes(normQuery) || normCode.includes(normQuery);
  }).sort((a, b) => (b.timesBought || 0) - (a.timesBought || 0));
}
