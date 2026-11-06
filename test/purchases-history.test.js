import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getInitialState } from '../js/storage.js';
import { addMarketPurchase } from '../js/shopping.js';
import { renderComprasTab, setBenefitsCycle } from '../js/ui.js';

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
});
