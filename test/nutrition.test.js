import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_NUTRITION_MEALS,
  COOKING_FACTORS,
  getDailyNutritionSummary,
  calculateMarmitasPlan
} from '../js/nutrition.js';

test('Nutrição & Marmitas: Totais diários prontos conferem com a prescrição da nutri', () => {
  const daily = getDailyNutritionSummary();

  // Arroz: 100g (Matheus) + 90g (Scarlet) = 190g
  assert.equal(daily.prontoDiario.arrozAlmocoProntoG, 190);

  // Feijão: 90g (Matheus) + 80g (Scarlet) = 170g
  assert.equal(daily.prontoDiario.feijaoAlmocoProntoG, 170);

  // Carne Almoço: 130g + 130g = 260g
  assert.equal(daily.prontoDiario.carneAlmocoProntaG, 260);

  // Carne Noite: 160g + 120g = 280g
  assert.equal(daily.prontoDiario.carneNoiteProntaG, 280);

  // Carne Total Pronto Dia = 540g
  assert.equal(daily.prontoDiario.carneTotalProntaG, 540);

  // Pães: 4 unidades ao dia
  assert.equal(daily.prontoDiario.paesTotal, 4);

  // Frutas: 4 unidades ao dia
  assert.equal(daily.prontoDiario.frutasTotal, 4);

  // YoPRO: 1 caixinha ao dia
  assert.equal(daily.prontoDiario.yoproTotal, 1);

  // Whey: 30g ao dia
  assert.equal(daily.prontoDiario.wheyTotalG, 30);
});

test('Nutrição & Marmitas: Fatores de cocção in natura convertem com precisão diária', () => {
  const daily = getDailyNutritionSummary();

  // 540g pronta ≈ 900g crua (900/540)
  assert.equal(daily.inNaturaDiario.carneTotalCruaG, 900);

  // 190g arroz pronto / 2.2 = 86g cru
  assert.equal(daily.inNaturaDiario.arrozCruG, 86);

  // 170g feijão pronto / 2.6 = 65g cru
  assert.equal(daily.inNaturaDiario.feijaoCruG, 65);
});

test('Nutrição & Marmitas: Planejamento para 7 dias (Semana)', () => {
  const plan = calculateMarmitasPlan(7, 'completo');

  // Carne crua total da semana: 900g * 7 = 6.300g (6,30 kg)
  assert.equal(plan.totaisInNatura.carneCruaKg, 6.3);

  // Arroz cru: 86g * 7 = 602g -> 1 pacote de 1kg
  assert.equal(plan.totaisInNatura.arrozPacotes1Kg, 1);

  // Feijão cru: 65g * 7 = 455g -> 1 pacote de 1kg
  assert.equal(plan.totaisInNatura.feijaoPacotes1Kg, 1);

  // Pães: 28
  assert.equal(plan.totaisProntos.paes, 28);

  // Frutas: 28
  assert.equal(plan.totaisProntos.frutas, 28);

  // YoPRO: 7 caixinhas
  assert.equal(plan.totaisProntos.yopro, 7);

  // Whey: 210g
  assert.equal(plan.totaisProntos.wheyG, 210);

  // Itens de mercado gerados
  assert.ok(plan.shoppingItems.length >= 8);
});

test('Nutrição & Marmitas: Planejamento para 15 dias (Quinzena)', () => {
  const planAlmoco = calculateMarmitasPlan(15, 'almoco');

  // Só marmitas de almoço para 15 dias:
  // Carne almoço crua: 433g * 15 = ~6.50 kg
  assert.equal(planAlmoco.totaisInNatura.carneCruaKg, 6.5);

  // Arroz cru para 15 dias: 86g * 15 = 1.290g -> 2 pacotes de 1kg
  assert.equal(planAlmoco.totaisInNatura.arrozPacotes1Kg, 2);

  // Feijão cru para 15 dias: 65g * 15 = 975g -> exatamente 1 pacote de 1kg!
  assert.equal(planAlmoco.totaisInNatura.feijaoPacotes1Kg, 1);
});

test('Nutrição & Marmitas: renderMarmitasTab renderiza cardápio, calculadora e botão de enviar', async () => {
  const ui = await import('../js/ui.js');
  let mockHtml = '';
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'marmitas-main-view') {
        return {
          set innerHTML(val) { mockHtml = val; },
          get innerHTML() { return mockHtml; }
        };
      }
      return null;
    }
  };

  ui.renderMarmitasTab({}, 'casal', 7, 'completo');

  assert.ok(mockHtml.includes('Cardápio & Marmitas da Nutri'));
  assert.ok(mockHtml.includes('6.30 kg')); // carne crua 7 dias
  assert.ok(mockHtml.includes('btn-send-marmitas-to-market'));
  assert.ok(mockHtml.includes('YoPRO'));
  assert.ok(mockHtml.includes('Whey'));
});

