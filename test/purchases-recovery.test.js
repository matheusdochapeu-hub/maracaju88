import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureRecoveredPurchases,
  RECOVERABLE_PURCHASES,
  getInitialState
} from '../js/storage.js';
import { applyCloudBackup } from '../js/sheets.js';
import { getMarketAnalytics } from '../js/shopping.js';

test('Recuperação de Notas: ensureRecoveredPurchases adiciona Padaria Araújo e Carrefour se ausentes', () => {
  const emptyState = { comprasRegistros: [] };
  ensureRecoveredPurchases(emptyState);

  assert.equal(emptyState.comprasRegistros.length, 2);

  const padaria = emptyState.comprasRegistros.find(p => p.nfeNumber === '50504');
  assert.ok(padaria, 'Nota da Padaria Araújo deve estar presente');
  assert.equal(padaria.total, 71.06);
  assert.equal(padaria.paymentMethod, 'credito');
  assert.equal(padaria.items.length, 4);

  const carrefour = emptyState.comprasRegistros.find(p => p.marketName === 'Carrefour');
  assert.ok(carrefour, 'Nota do Carrefour deve estar presente');
  assert.equal(carrefour.total, 280.66);
  assert.equal(carrefour.paymentMethod, 'va');
  assert.equal(carrefour.items.length, 18);
});

test('Recuperação de Notas: Idempotência evita registros duplicados', () => {
  const state = { comprasRegistros: [] };
  ensureRecoveredPurchases(state);
  assert.equal(state.comprasRegistros.length, 2);

  // Executa novamente
  ensureRecoveredPurchases(state);
  assert.equal(state.comprasRegistros.length, 2, 'Não deve duplicar notas existentes');
});

test('Recuperação de Notas: applyCloudBackup preserva notas recuperadas mesmo se nuvem só tiver Carrefour', () => {
  const safeCurrent = {
    ...getInitialState(),
    comprasRegistros: [
      {
        id: 'nfe_padaria_araujo_50504',
        marketName: 'Padaria e Mercearia Irmãos Araújo',
        nfeKey: '35261150489095000127650010000505041101032350',
        total: 71.06,
        paymentMethod: 'credito',
        date: '2026-11-07',
        items: []
      }
    ]
  };

  const cloudOnlyCarrefour = {
    comprasRegistros: [
      {
        id: 'nfe_carrefour_161500',
        marketName: 'Carrefour',
        nfeKey: '35261145543915028000650110001615001748865489',
        total: 280.66,
        paymentMethod: 'va',
        date: '2026-11-03',
        items: []
      }
    ]
  };

  const merged = applyCloudBackup(safeCurrent, cloudOnlyCarrefour);

  assert.ok(merged.comprasRegistros.length >= 2, 'Deve manter tanto o Carrefour da nuvem quanto a Padaria Araújo recuperada');
  const hasPadaria = merged.comprasRegistros.some(p => p.nfeKey === '35261150489095000127650010000505041101032350');
  const hasCarrefour = merged.comprasRegistros.some(p => p.marketName === 'Carrefour');
  assert.ok(hasPadaria, 'Padaria Araújo deve continuar no estado mesclado');
  assert.ok(hasCarrefour, 'Carrefour deve continuar no estado mesclado');
});

test('Recuperação de Notas: Análise de Gastos totaliza R$ 351,72 em 2 compras', () => {
  const state = getInitialState();
  ensureRecoveredPurchases(state);

  const analytics = getMarketAnalytics(state);
  assert.equal(analytics.count, 2);
  assert.equal(analytics.total, 351.72);
  assert.equal(analytics.avgTicket, 175.86);
  assert.equal(analytics.recurrentMarkets.length, 2);
  assert.equal(analytics.recurrentMarkets[0].marketName, 'Carrefour');
  assert.equal(analytics.recurrentMarkets[1].marketName, 'Padaria e Mercearia Irmãos Araújo');
});
