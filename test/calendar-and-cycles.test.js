import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getInitialState } from '../js/storage.js';
import { addMarketPurchase, getMarketAnalytics } from '../js/shopping.js';
import {
  getMonthlyBenefitDetails,
  getBenefitCycleKey,
  getBenefitCycleStatus,
  getCurrentBenefitCycleKey
} from '../js/benefits.js';
import {
  getTodayLocalIso,
  formatLocalDateBr,
  getCalendarDayInfo,
  getActiveCalendar,
  checkCalendarRollover,
  initActiveCalendar,
  stopActiveCalendar
} from '../js/calendar.js';
import {
  renderComprasTab,
  setBenefitsCycle,
  getActiveBenefitsCycle,
  setAnalyticsPeriod,
  getAnalyticsPeriod
} from '../js/ui.js';

test('Calendário Ativo em Segundo Plano: Informações do dia, feriados e dias úteis', () => {
  const todayIso = getTodayLocalIso();
  assert.match(todayIso, /^\d{4}-\d{2}-\d{2}$/);

  assert.equal(formatLocalDateBr('2026-11-06'), '06/11/2026');

  // Teste 06/11/2026: 4º dia útil de Novembro (Sexta-feira)
  const infoNov6 = getCalendarDayInfo('2026-11-06');
  assert.equal(infoNov6.year, 2026);
  assert.equal(infoNov6.month, 11);
  assert.equal(infoNov6.day, 6);
  assert.equal(infoNov6.dayOfWeekName, 'Sexta-feira');
  assert.equal(infoNov6.isWeekend, false);
  assert.equal(infoNov6.isBankingDay, true);
  assert.equal(infoNov6.cycleKey, '2026-11');

  // Teste 02/11/2026: Finados (Feriado Nacional Bancário)
  const infoFinados = getCalendarDayInfo('2026-11-02');
  assert.equal(infoFinados.isNationalHoliday, true);
  assert.equal(infoFinados.isBankingDay, false);

  // Teste 04/11/2026: Aniversário de São Carlos SP (Feriado Municipal em São Carlos, mas dia útil bancário nacional)
  const infoSaoCarlos = getCalendarDayInfo('2026-11-04');
  assert.equal(infoSaoCarlos.isLocalHoliday, true);
  assert.equal(infoSaoCarlos.isNationalHoliday, false);
});

test('Calendário Ativo: Inicialização, ciclo e transição de dias silenciosa', () => {
  const state = getInitialState();
  const activeCal = getActiveCalendar(state);
  assert.ok(activeCal);
  assert.ok(activeCal.dateIso);

  let notified = false;
  const stop = initActiveCalendar(state, {
    intervalMs: 100000,
    onDayChange: (detail) => {
      notified = true;
    }
  });

  // checkCalendarRollover sem alteração de data
  const checkSame = checkCalendarRollover(state);
  assert.equal(checkSame.changed, false);

  stop();
  stopActiveCalendar();
});

test('Ciclo Novembro/2026: Dinamicamente Ativo a partir de 06/11', () => {
  const state = getInitialState();
  const novStatus = getBenefitCycleStatus('2026-11', state);
  const octStatus = getBenefitCycleStatus('2026-10', state);

  // Hoje é 06/11/2026, data do crédito de Novembro
  assert.equal(novStatus.status, 'active');
  assert.equal(novStatus.isActive, true);
  assert.equal(novStatus.badgeText, 'Ativo');
  assert.equal(novStatus.badgeFormatted, '(Ativo)');

  // Outubro já encerrou (vigência 06/10 a 05/11)
  assert.equal(octStatus.status, 'ended');
  assert.equal(octStatus.isEnded, true);
  assert.equal(octStatus.badgeText, 'Encerrado');
  assert.equal(octStatus.badgeFormatted, '(Encerrado)');
});

test('Compras & Análise de Mercado por Ciclo: Gastos de Outubro somem ao trocar para Novembro e reaparecem ao voltar', () => {
  const state = getInitialState();

  // Lançamentos retroativos em Outubro (dia 03/11 pertence ao ciclo de Outubro)
  addMarketPurchase(state, {
    marketName: 'Carrefour',
    date: '2026-11-03',
    total: 390.41,
    paymentMethod: 'va',
    notes: 'Mercado do ciclo de Outubro'
  });

  addMarketPurchase(state, {
    marketName: 'Padaria Estrela',
    date: '2026-11-03',
    total: 45.00,
    paymentMethod: 'vr',
    notes: 'Padaria retroativa de Outubro'
  });

  // Lançamento do novo ciclo de Novembro (feito hoje, 06/11)
  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-06',
    total: 215.30,
    paymentMethod: 'va',
    notes: 'Primeira compra do Ciclo de Novembro'
  });

  // Setup DOM mock
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

  // 1. Ao selecionar Novembro:
  setBenefitsCycle('2026-11');
  setAnalyticsPeriod('cycle');
  renderComprasTab(state, 'todas', 'notas');

  const novHtml = elements['market-purchases-container'].innerHTML;
  // Apenas a compra de Novembro deve aparecer; as compras de Outubro (03/11) devem "sumir"
  assert.ok(novHtml.includes('Atacadão'), 'Compra de Novembro deve aparecer');
  assert.ok(!novHtml.includes('Carrefour'), 'Carrefour de Outubro deve sumir em Novembro');
  assert.ok(!novHtml.includes('Padaria Estrela'), 'Padaria de Outubro deve sumir em Novembro');

  // Análise de mercado sincronizada com o ciclo de Novembro
  const novAnalytics = getMarketAnalytics(state, 'cycle', '2026-11');
  assert.equal(novAnalytics.count, 1);
  assert.equal(novAnalytics.total, 215.30);
  assert.equal(novAnalytics.vaTotal, 215.30);
  assert.equal(novAnalytics.vrTotal, 0);

  // 2. Ao selecionar Outubro:
  setBenefitsCycle('2026-10');
  setAnalyticsPeriod('cycle');
  renderComprasTab(state, 'todas', 'notas');

  const octHtml = elements['market-purchases-container'].innerHTML;
  // As compras de Outubro reaparecem! A de Novembro não deve aparecer
  assert.ok(octHtml.includes('Carrefour'), 'Carrefour de Outubro deve reaparecer');
  assert.ok(octHtml.includes('Padaria Estrela'), 'Padaria de Outubro deve reaparecer');
  assert.ok(!octHtml.includes('Atacadão'), 'Atacadão de Novembro não deve aparecer em Outubro');

  // Análise de mercado sincronizada com o ciclo de Outubro
  const octAnalytics = getMarketAnalytics(state, 'cycle', '2026-10');
  assert.equal(octAnalytics.count, 2);
  assert.equal(octAnalytics.total, 435.41);
  assert.equal(octAnalytics.vaTotal, 390.41);
  assert.equal(octAnalytics.vrTotal, 45.00);
  assert.equal(octAnalytics.foodBenefitsTotal, 435.41);
});

test('Botões de Análise de Gastos: Mês Vigente, Últimos 12 Meses e Ano Todo', () => {
  const state = getInitialState();

  addMarketPurchase(state, {
    marketName: 'Carrefour',
    date: '2026-11-03', // Ciclo Outubro/2026
    total: 390.41,
    paymentMethod: 'va'
  });
  addMarketPurchase(state, {
    marketName: 'Padaria Estrela',
    date: '2026-11-03', // Ciclo Outubro/2026
    total: 45.00,
    paymentMethod: 'vr'
  });
  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-06', // Ciclo Novembro/2026
    total: 215.30,
    paymentMethod: 'va'
  });

  // Mês Vigente (Novembro)
  const cycleAnalytics = getMarketAnalytics(state, 'cycle', '2026-11');
  assert.equal(cycleAnalytics.total, 215.30);
  assert.equal(cycleAnalytics.count, 1);
  assert.equal(cycleAnalytics.vaTotal, 215.30);

  // Ano Todo (2026) - Soma todas as compras do ano
  const yearAnalytics = getMarketAnalytics(state, 'year', 2026);
  assert.equal(yearAnalytics.count, 3);
  assert.equal(yearAnalytics.total, 650.71);
  assert.equal(yearAnalytics.vaTotal, 605.71);
  assert.equal(yearAnalytics.vrTotal, 45.00);
  assert.equal(yearAnalytics.foodBenefitsTotal, 650.71);

  // Últimos 12 Meses
  const months12Analytics = getMarketAnalytics(state, '12months');
  assert.equal(months12Analytics.count, 3);
  assert.equal(months12Analytics.total, 650.71);
  assert.equal(months12Analytics.foodBenefitsTotal, 650.71);
});
