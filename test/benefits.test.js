import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEasterDate,
  getHolidaysSaoCarlos,
  isBusinessDay,
  getFourthBusinessDay,
  getWorkingDaysInMonth,
  getMonthlyBenefitDetails,
  updateMonthlyBenefitsConfig,
  PAYMENT_METHODS,
  getPaymentMethodInfo
} from '../js/benefits.js';
import { addMarketPurchase, getMarketAnalytics } from '../js/shopping.js';

test('Benefícios: Feriados e cálculo do 4º dia útil em São Carlos SP', () => {
  const holidays2026 = getHolidaysSaoCarlos(2026);
  assert.ok(holidays2026.has('2026-01-01')); // Ano novo
  assert.ok(holidays2026.has('2026-04-21')); // Tiradentes
  assert.ok(holidays2026.has('2026-07-09')); // Rev. Constitucionalista SP
  assert.ok(holidays2026.has('2026-08-15')); // N. Sra. da Babilônia (São Carlos)
  assert.ok(holidays2026.has('2026-10-12')); // N. Sra. Aparecida
  assert.ok(holidays2026.has('2026-11-02')); // Finados
  assert.ok(holidays2026.has('2026-11-04')); // Aniversário de São Carlos
  assert.ok(holidays2026.has('2026-11-15')); // Proclamação da República
  assert.ok(holidays2026.has('2026-11-20')); // Consciência Negra
  assert.ok(holidays2026.has('2026-12-25')); // Natal

  // Em novembro de 2026:
  // 01/11 (Dom)
  // 02/11 (Seg - Finados - feriado)
  // 03/11 (Ter - 1º dia útil)
  // 04/11 (Qua - Aniversário de São Carlos - feriado)
  // 05/11 (Qui - 2º dia útil)
  // 06/11 (Sex - 3º dia útil)
  // 07/11 (Sáb)
  // 08/11 (Dom)
  // 09/11 (Seg - 4º dia útil)
  const fourthDayNov2026 = getFourthBusinessDay(2026, 11);
  assert.ok(fourthDayNov2026);
  assert.equal(fourthDayNov2026.day, 9);
  assert.equal(fourthDayNov2026.formatted, '09/11/2026');
});

test('Benefícios: VA R$ 2.050,00 fixo e VR R$ 65,00/dia trabalhado (17 dias = R$ 1.105,00)', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vaTotal, 2050.00);
  assert.equal(details.vrDaily, 65.00);
  assert.equal(details.vrDays, 17);
  assert.equal(details.vrTotal, 1105.00);
  assert.equal(details.totalBenefit, 3155.00);
  assert.equal(details.vaSpent, 0);
  assert.equal(details.vrSpent, 0);
  assert.equal(details.vaBalance, 2050.00);
  assert.equal(details.vrBalance, 1105.00);
});

test('Formas de Pagamento: Lançamentos abatem saldos de VA e VR e alimentam Analytics', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  // 1. Compra de R$ 450,00 paga com VA (Vale Alimentação)
  addMarketPurchase(state, {
    marketName: 'Carrefour',
    date: '2026-11-02',
    total: '450,00',
    paymentMethod: 'va'
  });

  // 2. Almoço / compra de R$ 65,00 paga com VR (Vale Refeição)
  addMarketPurchase(state, {
    marketName: 'Restaurante Central',
    date: '2026-11-03',
    total: '65,00',
    paymentMethod: 'vr'
  });

  // 3. Compra de R$ 120,00 paga com Pix
  addMarketPurchase(state, {
    marketName: 'Açougue Central',
    date: '2026-11-04',
    total: '120,00',
    paymentMethod: 'pix'
  });

  // 4. Compra de R$ 200,00 paga com Cartão de Crédito
  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-05',
    total: '200,00',
    paymentMethod: 'credito'
  });

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vaSpent, 450.00);
  assert.equal(details.vaBalance, 1600.00); // 2050 - 450 = 1600
  assert.equal(details.vrSpent, 65.00);
  assert.equal(details.vrBalance, 1040.00); // 1105 - 65 = 1040

  assert.equal(details.paymentBreakdown.va, 450.00);
  assert.equal(details.paymentBreakdown.vr, 65.00);
  assert.equal(details.paymentBreakdown.pix, 120.00);
  assert.equal(details.paymentBreakdown.credito, 200.00);

  // Analytics de gastos do mercado
  const analytics = getMarketAnalytics(state, '2026-11');
  assert.equal(analytics.total, 835.00);
  assert.equal(analytics.paymentBreakdown.va, 450.00);
  assert.equal(analytics.paymentBreakdown.vr, 65.00);
  assert.equal(analytics.paymentBreakdown.pix, 120.00);
  assert.equal(analytics.paymentBreakdown.credito, 200.00);
});

test('Formas de Pagamento: Todas as opções suportadas', () => {
  const ids = PAYMENT_METHODS.map(m => m.id);
  assert.ok(ids.includes('va'));
  assert.ok(ids.includes('vr'));
  assert.ok(ids.includes('pix'));
  assert.ok(ids.includes('credito'));
  assert.ok(ids.includes('debito'));
  assert.ok(ids.includes('dinheiro'));

  const infoVa = getPaymentMethodInfo('va');
  assert.equal(infoVa.shortLabel, 'VA');
  assert.equal(infoVa.icon, '🥗');

  const infoVr = getPaymentMethodInfo('vr');
  assert.equal(infoVr.shortLabel, 'VR');
  assert.equal(infoVr.icon, '🍽️');
});

test('Ajuste de Benefícios do mês: Personalizar dias ou valores', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  // Ajusta novembro para 20 dias trabalhados a R$ 65,00
  updateMonthlyBenefitsConfig(state, '2026-11', {
    vrDays: 20,
    vaFixed: 2050,
    vrDaily: 65
  });

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vrDays, 20);
  assert.equal(details.vrTotal, 1300.00); // 20 * 65 = 1300
  assert.equal(details.vaTotal, 2050.00);
  assert.equal(details.totalBenefit, 3350.00);
});
