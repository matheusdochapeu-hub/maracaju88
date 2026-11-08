import test from 'node:test';
import assert from 'node:assert/strict';

import { getMarketAnalytics } from '../js/shopping.js';
import { setOnStateSavedListener, saveState } from '../js/storage.js';

test('Análise de Mercado: Separação VA vs VR e Cálculo do Ticket Médio de Cada Um', () => {
  // Simulação dos dados exatos da tela do usuário em Todo o Histórico:
  // VA Total = 461,47 (4 compras) -> Ticket Médio = 115,37
  // VR Total = 299,75 (2 compras) -> Ticket Médio = 149,88
  // Total Geral = 761,22 (6 compras) -> Ticket Médio Geral = 126,87
  const state = {
    settings: {
      benefits: {
        monthlyCreditDates: {
          '2026-10': '2026-10-06',
          '2026-11': '2026-11-06',
          '2026-12': '2026-12-04'
        }
      }
    },
    comprasRegistros: [
      { id: '1', marketName: 'Carrefour', total: 280.66, paymentMethod: 'va', date: '2026-11-03' },
      { id: '2', marketName: 'Padaria e Mercearia Irmãos Araújo', total: 71.06, paymentMethod: 'va', date: '2026-11-07' },
      { id: '3', marketName: 'Açougue Fumaça', total: 62.79, paymentMethod: 'va', date: '2026-11-04' },
      { id: '4', marketName: 'Mercadinho da Esquina', total: 46.96, paymentMethod: 'va', date: '2026-11-02' },
      { id: '5', marketName: 'Burgoo', total: 197.45, paymentMethod: 'vr', date: '2026-11-05' },
      { id: '6', marketName: 'Padock Bar', total: 102.30, paymentMethod: 'vr', date: '2026-11-06' }
    ]
  };

  // 1. Em Todo o Histórico ('todos'): Consolida todas as 6 compras
  const analyticsTodos = getMarketAnalytics(state, 'todos');
  assert.equal(analyticsTodos.total, 761.22);
  assert.equal(analyticsTodos.count, 6);
  assert.equal(analyticsTodos.avgTicket, 126.87);
  assert.equal(analyticsTodos.vaTotal, 461.47);
  assert.equal(analyticsTodos.vaCount, 4);
  assert.equal(analyticsTodos.vaAvgTicket, 115.37);
  assert.equal(analyticsTodos.vrTotal, 299.75);
  assert.equal(analyticsTodos.vrCount, 2);
  assert.equal(analyticsTodos.vrAvgTicket, 149.88);
  assert.equal(analyticsTodos.foodBenefitsTotal, 761.22);

  // 2. Separação por Ciclos: Carrefour (03/11) e Fumaça (04/11) pertencem estritamente ao Ciclo Anterior (Outubro/2026)
  const analyticsCicloAnterior = getMarketAnalytics(state, '2026-10');
  assert.equal(analyticsCicloAnterior.total, 587.86);
  assert.equal(analyticsCicloAnterior.count, 4);
  const marketsAnterior = analyticsCicloAnterior.recurrentMarkets.map(m => m.marketName);
  assert.ok(marketsAnterior.includes('Carrefour'), 'Carrefour deve estar no ciclo anterior');
  assert.ok(marketsAnterior.includes('Açougue Fumaça'), 'Açougue Fumaça deve estar no ciclo anterior');

  // 3. Ciclo Vigente (Novembro/2026 - compras a partir de 06/11):
  // Carrefour e Fumaça NÃO devem aparecer em Novembro
  const analyticsCicloAtual = getMarketAnalytics(state, '2026-11');
  assert.equal(analyticsCicloAtual.total, 173.36);
  assert.equal(analyticsCicloAtual.count, 2);
  const marketsAtual = analyticsCicloAtual.recurrentMarkets.map(m => m.marketName);
  assert.ok(!marketsAtual.includes('Carrefour'), 'Carrefour não pertence ao ciclo de Novembro');
  assert.ok(!marketsAtual.includes('Açougue Fumaça'), 'Açougue Fumaça não pertence ao ciclo de Novembro');
  assert.ok(marketsAtual.includes('Padaria e Mercearia Irmãos Araújo'));
  assert.ok(marketsAtual.includes('Padock Bar'));
});

test('Análise de Mercado: Separação por Mês/Ciclo (Ciclo Vigente Primeiro e Anteriores Acessíveis)', () => {
  const state = {
    settings: {
      benefits: {
        monthlyCreditDates: {
          '2026-10': '2026-10-06',
          '2026-11': '2026-11-06',
          '2026-12': '2026-12-04'
        }
      }
    },
    comprasRegistros: [
      { id: 'nov_1', marketName: 'Carrefour', total: 100.00, paymentMethod: 'va', date: '2026-11-07', monthKey: '2026-11' },
      { id: 'oct_1', marketName: 'Atacadão', total: 200.00, paymentMethod: 'va', date: '2026-10-15', monthKey: '2026-10' },
      { id: 'oct_2', marketName: 'Restaurante Sabor', total: 50.00, paymentMethod: 'vr', date: '2026-10-20', monthKey: '2026-10' },
      { id: 'sep_1', marketName: 'Pão de Açúcar', total: 300.00, paymentMethod: 'va', date: '2026-09-10', monthKey: '2026-09' }
    ]
  };

  const analytics = getMarketAnalytics(state);

  // Lista de ciclos disponíveis com ciclo atual primeiro
  assert.ok(Array.isArray(analytics.availableCycles));
  assert.ok(analytics.availableCycles.length >= 3);
  assert.equal(analytics.availableCycles[0].key, '2026-11');
  assert.equal(analytics.availableCycles[0].isCurrent, true);
  assert.equal(analytics.availableCycles[1].key, '2026-10');
  assert.equal(analytics.availableCycles[2].key, '2026-09');

  // Consulta ciclo anterior (Outubro)
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
