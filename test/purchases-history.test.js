import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getInitialState } from '../js/storage.js';
import { addMarketPurchase } from '../js/shopping.js';
import {
  renderComprasTab,
  setBenefitsCycle,
  setPurchaseCollapsed,
  setAllPurchasesCollapsed
} from '../js/ui.js';
import { backupToSheets } from '../js/sheets.js';

test('Mercado: Histórico de Compras e Notas com Ordenação e Expansão de Itens', () => {
  const state = getInitialState();

  // Add 3 different purchases (1 with PDF/NFe items, 1 manual, 1 with items)
  addMarketPurchase(state, {
    marketName: 'Carrefour',
    date: '2026-11-03',
    total: 280.66,
    nfeKey: '35261145543915028000650110001615001748865489',
    notes: '18 itens (importados via PDF)',
    items: [
      { rawName: 'ACUCAR REF CARAVELAS', alias: 'Açúcar Refinado Caravelas', qty: 1, unit: 'un', unitPrice: 3.19, totalPrice: 3.19 },
      { rawName: 'CHA MATE LEAO', alias: 'Chá Matte Leão', qty: 1, unit: 'un', unitPrice: 18.29, totalPrice: 18.29 }
    ]
  });

  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-01',
    total: 150.00,
    notes: 'Lançamento manual sem nota',
    items: [
      { rawName: 'Arroz 5kg', alias: 'Arroz Tipo 1 5kg', qty: 2, unit: 'un', unitPrice: 32.50, totalPrice: 65.00 }
    ]
  });

  addMarketPurchase(state, {
    marketName: 'Pão de Açúcar',
    date: '2026-11-05',
    total: 89.90,
    notes: 'Compra rápida',
    items: [
      { rawName: 'Vinho Tinto', alias: 'Vinho Tinto Chileno', qty: 1, unit: 'un', unitPrice: 89.90, totalPrice: 89.90 }
    ]
  });

  assert.equal(state.comprasRegistros.length, 3);

  const elements = {};
  global.document = {
    getElementById: (id) => {
      if (!elements[id]) {
        elements[id] = {
          id,
          innerHTML: '',
          style: {},
          classList: { toggle: () => {}, add: () => {}, remove: () => {} },
          setAttribute: () => {},
          getAttribute: () => null
        };
      }
      return elements[id];
    },
    querySelectorAll: () => []
  };

  setBenefitsCycle('2026-10');
  // 1. Render in 'notas' view (default: date-desc)
  assert.doesNotThrow(() => {
    renderComprasTab(state, 'todas', 'notas', 'date-desc');
  });

  const html = elements['market-purchases-container'].innerHTML;
  assert.ok(html.includes('Carrefour'), 'Must include Carrefour');
  assert.ok(html.includes('Atacadão'), 'Must include Atacadão');
  assert.ok(html.includes('Pão de Açúcar'), 'Must include Pão de Açúcar');
  assert.ok(html.includes('Nota Fiscal'), 'Must include origin tag Nota Fiscal');
  assert.ok(html.includes('Lançamento Manual'), 'Must include origin tag Lançamento Manual');
  assert.ok(html.includes('market-receipt-items-details'), 'Must include expandable details for items');
  assert.ok(html.includes('btn-expand-all-purchases'), 'Must include expand all button');
  assert.ok(html.includes('btn-collapse-all-purchases'), 'Must include collapse all button');
  assert.ok(html.includes('purchases-sort-select'), 'Must include sort select');

  // Check ordering: Pão de Açúcar (Nov 5) should appear before Carrefour (Nov 3) in date-desc
  const idxPao = html.indexOf('Pão de Açúcar');
  const idxCarrefour = html.indexOf('Carrefour');
  const idxAtacadao = html.indexOf('Atacadão');
  assert.ok(idxPao < idxCarrefour, 'Pão de Açúcar (Nov 5) must come before Carrefour (Nov 3)');
  assert.ok(idxCarrefour < idxAtacadao, 'Carrefour (Nov 3) must come before Atacadão (Nov 1)');

  // 2. Test sorting by Market Name (A-Z)
  renderComprasTab(state, 'todas', 'notas', 'market-asc');
  const htmlMarket = elements['market-purchases-container'].innerHTML;
  const idxAtacadaoAz = htmlMarket.indexOf('Atacadão');
  const idxCarrefourAz = htmlMarket.indexOf('Carrefour');
  const idxPaoAz = htmlMarket.indexOf('Pão de Açúcar');
  assert.ok(idxAtacadaoAz < idxCarrefourAz, 'Atacadão (A) must come before Carrefour (C)');
  assert.ok(idxCarrefourAz < idxPaoAz, 'Carrefour (C) must come before Pão de Açúcar (P)');

  // 3. Test search filter
  renderComprasTab(state, 'todas', 'notas', 'date-desc', 'Vinho');
  const htmlSearch = elements['market-purchases-container'].innerHTML;
  assert.ok(htmlSearch.includes('Pão de Açúcar'), 'Search for Vinho must include Pão de Açúcar');
  assert.ok(!htmlSearch.includes('Carrefour'), 'Search for Vinho must exclude Carrefour');

  // 4. Test collapse / expand persistence and fallback de name/quantity
  const ids = state.comprasRegistros.map(r => r.id);
  setAllPurchasesCollapsed(ids, true);
  renderComprasTab(state, 'todas', 'notas', 'date-desc');
  const htmlCollapsed = elements['market-purchases-container'].innerHTML;
  assert.ok(!htmlCollapsed.includes('" open>'), 'Itens recolhidos não devem renderizar atributo open');

  setPurchaseCollapsed(ids[0], false);
  setAllPurchasesCollapsed([], false);
  renderComprasTab(state, 'todas', 'notas', 'date-desc');
  const htmlExpanded = elements['market-purchases-container'].innerHTML;
  assert.ok(htmlExpanded.includes('open>'), 'Todos os itens devem voltar expostos após expandir');
});

test('Sheets Backup: preserva itens e nfeKey das compras mesmo quando JSON ultrapassa 44.000 caracteres', async () => {
  const state = getInitialState();
  state.settings.sheetsUrl = 'https://script.google.com/macros/s/test/exec';
  state.catalog = Array.from({ length: 400 }, (_, i) => ({
    id: `cat_${i}`,
    rawName: `PRODUTO CATALOGO EXTENSO ${i} `.repeat(3),
    alias: `Produto ${i}`
  }));

  addMarketPurchase(state, {
    marketName: 'Carrefour 18/11',
    date: '2026-11-18',
    total: 63.16,
    nfeKey: '35261145543915028000650110001615009999999999',
    notes: '4 itens (importados via NFC-e)',
    items: [
      { rawName: 'CAFE', alias: 'Café 500g', qty: 1, unit: 'un', unitPrice: 18.50, totalPrice: 18.50 },
      { rawName: 'LEITE', alias: 'Leite Integral', qty: 2, unit: 'un', unitPrice: 5.50, totalPrice: 11.00 }
    ]
  });

  let sentPayload = null;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (_url, opts) => {
    sentPayload = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ status: 'success' }) };
  };

  try {
    await backupToSheets(state);
  } finally {
    globalThis.fetch = origFetch;
  }

  assert.ok(sentPayload && sentPayload.data, 'Payload deve ter sido enviado');
  assert.equal(sentPayload.data.catalog.length, 0, 'Catálogo transitório deve ser sacrificado primeiro');
  assert.equal(sentPayload.data.comprasRegistros[0].nfeKey, '35261145543915028000650110001615009999999999', 'nfeKey precisa sobreviver ao backup');
  assert.equal(sentPayload.data.comprasRegistros[0].items.length, 2, 'Itens da compra precisam ser preservados na nuvem');
});
