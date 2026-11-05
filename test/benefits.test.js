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

test('Formas de Pagamento e Ciclos: Compras antes do crédito (03/11, padaria, açougue) abatem do ciclo de Outubro e não de Novembro', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  // 1. Compra em mercado no dia 03/11 paga com VA (antes do crédito de 06/11) -> Abate de Outubro
  addMarketPurchase(state, {
    marketName: 'Carrefour 03/11',
    date: '2026-11-03',
    total: '150,00',
    paymentMethod: 'va'
  });

  // 2. Padaria no dia 04/11 paga com VA -> Abate de Outubro
  addMarketPurchase(state, {
    marketName: 'Padaria Estrela',
    date: '2026-11-04',
    total: '35,00',
    paymentMethod: 'va'
  });

  // 3. Açougue no dia 05/11 pago com VA -> Abate de Outubro
  addMarketPurchase(state, {
    marketName: 'Açougue Central',
    date: '2026-11-05',
    total: '85,00',
    paymentMethod: 'va'
  });

  // 4. VR usado em 25/10 -> Abate de Outubro
  addMarketPurchase(state, {
    marketName: 'Restaurante Central',
    date: '2026-10-25',
    total: '65,00',
    paymentMethod: 'vr'
  });

  // 5. Compra futura em 06/11 (após disponibilização do benefício) -> Abate de Novembro
  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-06',
    total: '200,00',
    paymentMethod: 'va'
  });

  // Ciclo de Outubro (06/10 a 05/11):
  const detailsOutubro = getMonthlyBenefitDetails(state, '2026-10');
  // VA gasto em Outubro: 150 (03/11) + 35 (04/11) + 85 (05/11) = 270,00
  assert.equal(detailsOutubro.vaSpent, 270.00);
  assert.equal(detailsOutubro.vaBalance, 1780.00); // 2050 - 270 = 1780
  assert.equal(detailsOutubro.vrSpent, 65.00);
  assert.equal(detailsOutubro.vrBalance, 1040.00); // 1105 - 65 = 1040
  assert.equal(detailsOutubro.cyclePurchases.length, 4);

  // Ciclo de Novembro (a partir de 06/11):
  const detailsNovembro = getMonthlyBenefitDetails(state, '2026-11');
  // Os gastos de 03/11, padaria e açougue NÃO abatem de Novembro!
  // Apenas a compra de 06/11 abate de Novembro:
  assert.equal(detailsNovembro.vaSpent, 200.00);
  assert.equal(detailsNovembro.vaBalance, 1850.00); // 2050 - 200 = 1850
  assert.equal(detailsNovembro.vrSpent, 0.00);
  assert.equal(detailsNovembro.vrBalance, 1105.00);
  assert.equal(detailsNovembro.cyclePurchases.length, 1);
});

test('Formas de Pagamento: Todas as opções suportadas', () => {
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'va'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'vr'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'pix'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'credito'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'debito'));
  assert.ok(PAYMENT_METHODS.some(m => m.id === 'dinheiro'));
});

test('Histórico de Benefícios VA e VR: getBenefitsHistory consolida ciclos passados e futuros', () => {
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
  assert.equal(octCycle.vaSpent, 100);

  const novCycle = history.find(c => c.cycleKey === '2026-11');
  assert.ok(novCycle);
  assert.equal(novCycle.vaSpent, 50);
});

test('Ajuste de Benefícios do mês: Personalizar dias ou valores', () => {
  const state = {
    settings: {},
    comprasRegistros: []
  };

  updateMonthlyBenefitsConfig(state, '2026-11', {
    vrDays: 20,
    vaFixed: 2050,
    vrDaily: 65
  });

  const details = getMonthlyBenefitDetails(state, '2026-11');
  assert.equal(details.vrDays, 20);
  assert.equal(details.vrTotal, 1300.00);
  assert.equal(details.vaTotal, 2050.00);
  assert.equal(details.totalBenefit, 3350.00);
});

test('HTML: Modais de Compra, Ajuste e Histórico de Benefícios', async () => {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.ok(html.includes('id="modal-edit-purchase"'));
  assert.ok(html.includes('id="purchase-edit-payment-method"'));
  assert.ok(html.includes('id="manual-purchase-payment-method"'));
  assert.ok(html.includes('id="modal-adjust-benefits"'));
  assert.ok(html.includes('id="modal-benefits-history"'));
  assert.ok(html.includes('id="benefits-history-content"'));
});
