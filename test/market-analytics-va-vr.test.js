import test from 'node:test';
import assert from 'node:assert/strict';

import { getMarketAnalytics } from '../js/shopping.js';
import { setOnStateSavedListener, saveState } from '../js/storage.js';

test('Análise de Mercado: Separação VA vs VR e Cálculo do Ticket Médio de Cada Um', () => {
  // Simulação dos dados exatos da tela do usuário:
  // VA Total = 461,47 (4 compras) -> Ticket Médio = 115,37
  // VR Total = 299,75 (2 compras) -> Ticket Médio = 149,88
  // Total Geral = 761,22 (6 compras) -> Ticket Médio Geral = 126,87
  const state = {
    comprasRegistros: [
      { id: '1', marketName: 'Carrefour', total: 280.66, paymentMethod: 'va', date: '2026-11-03' },
      { id: '2', marketName: 'Padaria e Mercearia Irmãos Araújo', total: 71.06, paymentMethod: 'va', date: '2026-11-07' },
      { id: '3', marketName: 'Açougue Fumaça', total: 62.79, paymentMethod: 'va', date: '2026-11-04' },
      { id: '4', marketName: 'Mercadinho da Esquina', total: 46.96, paymentMethod: 'va', date: '2026-11-02' },
      { id: '5', marketName: 'Burgoo', total: 197.45, paymentMethod: 'vr', date: '2026-11-05' },
      { id: '6', marketName: 'Padock Bar', total: 102.30, paymentMethod: 'vr', date: '2026-11-06' }
    ]
  };

  const analytics = getMarketAnalytics(state, '2026-11');

  // Totais Gerais
  assert.equal(analytics.total, 761.22);
  assert.equal(analytics.count, 6);
  assert.equal(analytics.avgTicket, 126.87);

  // Vale Alimentação (VA)
  assert.equal(analytics.vaTotal, 461.47);
  assert.equal(analytics.vaCount, 4);
  assert.equal(analytics.vaAvgTicket, 115.37);

  // Vale Refeição (VR)
  assert.equal(analytics.vrTotal, 299.75);
  assert.equal(analytics.vrCount, 2);
  assert.equal(analytics.vrAvgTicket, 149.88);

  // Vales Combinados
  assert.equal(analytics.foodBenefitsTotal, 761.22);

  // Detalhamento por método no breakdown
  assert.equal(analytics.paymentMethodStats.va.total, 461.47);
  assert.equal(analytics.paymentMethodStats.va.avgTicket, 115.37);
  assert.equal(analytics.paymentMethodStats.va.count, 4);

  assert.equal(analytics.paymentMethodStats.vr.total, 299.75);
  assert.equal(analytics.paymentMethodStats.vr.avgTicket, 149.88);
  assert.equal(analytics.paymentMethodStats.vr.count, 2);
});

test('Análise de Mercado: Separação por Mês (Mês Vigente Primeiro e Anteriores Acessíveis)', () => {
  const state = {
    comprasRegistros: [
      { id: 'nov_1', marketName: 'Carrefour', total: 100.00, paymentMethod: 'va', date: '2026-11-07', monthKey: '2026-11' },
      { id: 'oct_1', marketName: 'Atacadão', total: 200.00, paymentMethod: 'va', date: '2026-10-15', monthKey: '2026-10' },
      { id: 'oct_2', marketName: 'Restaurante Sabor', total: 50.00, paymentMethod: 'vr', date: '2026-10-20', monthKey: '2026-10' },
      { id: 'sep_1', marketName: 'Pão de Açúcar', total: 300.00, paymentMethod: 'va', date: '2026-09-10', monthKey: '2026-09' }
    ]
  };

  const analytics = getMarketAnalytics(state);

  // Lista de meses disponíveis com mês atual primeiro
  assert.ok(Array.isArray(analytics.availableMonths));
  assert.ok(analytics.availableMonths.length >= 3);
  assert.equal(analytics.availableMonths[0].key, '2026-11');
  assert.equal(analytics.availableMonths[0].isCurrent, true);
  assert.equal(analytics.availableMonths[1].key, '2026-10');
  assert.equal(analytics.availableMonths[2].key, '2026-09');

  // Consulta mês anterior (Outubro)
  const octAnalytics = getMarketAnalytics(state, '2026-10');
  assert.equal(octAnalytics.total, 250.00);
  assert.equal(octAnalytics.count, 2);
  assert.equal(octAnalytics.vaTotal, 200.00);
  assert.equal(octAnalytics.vaAvgTicket, 200.00);
  assert.equal(octAnalytics.vaCount, 1);
  assert.equal(octAnalytics.vrTotal, 50.00);
  assert.equal(octAnalytics.vrAvgTicket, 50.00);
  assert.equal(octAnalytics.vrCount, 1);
});

test('Auto-Backup & Sync: saveState aciona automaticamente o listener registrado para a nuvem', () => {
  let syncTriggered = false;
  setOnStateSavedListener(() => {
    syncTriggered = true;
  });

  const state = { version: '2.5.4', lastUpdated: null };
  saveState(state);

  assert.equal(syncTriggered, true, 'saveState deve disparar o listener de auto-sync');
});
