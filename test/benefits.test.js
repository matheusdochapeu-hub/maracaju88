import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEasterDate,
  getHolidaysSaoCarlos,
  getNationalBankingHolidays,
  isBusinessDay,
  getFourthBusinessDay,
  getFourthBankingDay,
  getBenefitCreditDate,
  getBenefitCycleKey,
  getCurrentBenefitCycleKey,
  getBenefitCycleRange,
  getBenefitsHistory,
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

  const fourthDayNov2026 = getFourthBusinessDay(2026, 11);
  assert.ok(fourthDayNov2026);
  assert.equal(fourthDayNov2026.day, 9);
  assert.equal(fourthDayNov2026.formatted, '09/11/2026');

  // 4º dia útil bancário nacional (depósito dos benefícios de novembro no dia 06/11):
  const fourthBankingNov2026 = getFourthBankingDay(2026, 11);
  assert.ok(fourthBankingNov2026);
  assert.equal(fourthBankingNov2026.day, 6);
  assert.equal(fourthBankingNov2026.formatted, '06/11/2026');
});

test('Benefícios: VA R$ 2.050,00 fixo e VR R$ 65,00/dia trabalhado (17 dias = R$ 1.105,00)', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vaDeposit, 2050.00);
  assert.equal(details.vrDaily, 65.00);
  assert.equal(details.vrDays, 17);
  assert.equal(details.vrDeposit, 1105.00);
});

test('Formas de Pagamento e Rollover: Sobras de Outubro (VA R$ 9,84 e VR R$ 0,16) somadas a Novembro (R$ 2.059,84 e R$ 1.105,16)', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  // 1. Compra Carrefour em 03/11
  addMarketPurchase(state, {
    marketName: 'Carrefour 03/11',
    date: '2026-11-03',
    total: '270,41',
    paymentMethod: 'va'
  });

  // 2. Padaria em 04/11
  addMarketPurchase(state, {
    marketName: 'Padaria Estrela',
    date: '2026-11-04',
    total: '35,00',
    paymentMethod: 'va'
  });

  // 3. Açougue em 05/11
  addMarketPurchase(state, {
    marketName: 'Açougue Central',
    date: '2026-11-05',
    total: '85,00',
    paymentMethod: 'va'
  });

  // Total lançado recente em VA = 270.41 + 35.00 + 85.00 = 390.41
  // Ciclo de Outubro (encerra em 05/11):
  const detailsOutubro = getMonthlyBenefitDetails(state, '2026-10');
  // O saldo final de Outubro foi de exatamente R$ 9,84 de VA e R$ 0,16 de VR:
  assert.equal(detailsOutubro.vaBalance, 9.84);
  assert.equal(detailsOutubro.vrBalance, 0.16);
  assert.equal(detailsOutubro.vaSpent, 2040.16);
  assert.equal(detailsOutubro.vrSpent, 1104.84);

  // Ciclo de Novembro (inicia em 06/11 com crédito + sobras acumuladas):
  const detailsNovembro = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(detailsNovembro.vaDeposit, 2050.00);
  assert.equal(detailsNovembro.vaRollover, 9.84);
  assert.equal(detailsNovembro.vaTotal, 2059.84); // 2050 + 9,84 = 2059,84
  assert.equal(detailsNovembro.vaBalance, 2059.84);

  assert.equal(detailsNovembro.vrDeposit, 1105.00);
  assert.equal(detailsNovembro.vrRollover, 0.16);
  assert.equal(detailsNovembro.vrTotal, 1105.16); // 1105 + 0,16 = 1105,16
  assert.equal(detailsNovembro.vrBalance, 1105.16);

  assert.equal(detailsNovembro.totalBenefit, 3165.00); // 2059,84 + 1105,16 = 3165,00
  assert.equal(detailsNovembro.totalFoodBalance, 3165.00);
});

test('Formas de Pagamento: Todas as opções suportadas', () => {
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'va'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'vr'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'pix'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'credito'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'debito'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'dinheiro'));
});

test('Histórico de Benefícios VA e VR: getBenefitsHistory consolida ciclos passados e futuros com rollover', () => {
  const state = {
    settings: {},
    comprasRegistros: [
      { id: '1', marketName: 'Mercado 03/11', date: '2026-11-03', total: 100, paymentMethod: 'va' },
      { id: '2', marketName: 'Mercado 06/11', date: '2026-11-06', total: 50, paymentMethod: 'va' }
    ]
  };

  const history = getBenefitsHistory(state);
  assert.ok(Array.isArray(history));
  assert.ok(history.length >= 2);

  const octCycle = history.find(c => c.cycleKey === '2026-10');
  assert.ok(octCycle);
  assert.equal(octCycle.vaBalance, 9.84);
  assert.equal(octCycle.vrBalance, 0.16);

  const novCycle = history.find(c => c.cycleKey === '2026-11');
  assert.ok(novCycle);
  assert.equal(novCycle.vaRollover, 9.84);
  assert.equal(novCycle.vrRollover, 0.16);
  assert.equal(novCycle.vaTotal, 2059.84);
  assert.equal(novCycle.vrTotal, 1105.16);
});

test('Ajuste de Benefícios do mês: Personalizar dias ou valores e rollover', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  updateMonthlyBenefitsConfig(state, '2026-11', {
    vrDays: 20,
    vaFixed: 2050,
    vrDaily: 65,
    vaRollover: 15.50,
    vrRollover: 5.00
  });

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vrDays, 20);
  assert.equal(details.vrDeposit, 1300.00);
  assert.equal(details.vrRollover, 5.00);
  assert.equal(details.vrTotal, 1305.00);
  assert.equal(details.vaDeposit, 2050.00);
  assert.equal(details.vaRollover, 15.50);
  assert.equal(details.vaTotal, 2065.50);
  assert.equal(details.totalBenefit, 3370.50);
});

test('HTML: Modais de Compra, Ajuste e Histórico de Benefícios com Rollover', async () => {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="modal-edit-purchase"'));
  assert.ok(html.includes('id="purchase-edit-payment-method"'));
  assert.ok(html.includes('id="manual-purchase-payment-method"'));
  assert.ok(html.includes('id="modal-adjust-benefits"'));
  assert.ok(html.includes('id="benefits-input-va-rollover"'));
  assert.ok(html.includes('id="benefits-input-vr-rollover"'));
  assert.ok(html.includes('id="modal-benefits-history"'));
  assert.ok(html.includes('id="benefits-history-content"'));
});
