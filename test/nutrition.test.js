import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_NUTRITION_MEALS,
  COOKING_FACTORS,
  getDailyNutritionSummary,
  calculateMarmitasPlan,
  parseNutritionDiaryText,
  getEffectiveNutritionMeals,
  getNutritionState,
  calculateCustomQuantityConversion
} from '../js/nutrition.js';
import { applyCloudBackup } from '../js/sheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
  assert.ok(mockHtml.includes('input-nutrition-pdf-matheus'));
  assert.ok(mockHtml.includes('input-nutrition-pdf-scarlet'));
  assert.ok(mockHtml.includes('data-marmitas-edit-diary="matheus"'));
  assert.ok(mockHtml.includes('data-marmitas-edit-diary="scarlet"'));
});

test('Diário Alimentar: parseNutritionDiaryText extrai refeições e quantidades de PDF/texto sem duplicar opções "ou"', () => {
  const textoMatheus = `
    Café da Manhã - 07:30
    01 fruta e 01 pão com 2 ovos e 20g de requeijão
    ou
    01 fruta e 01 pão com 2 fatias de queijo e requeijão

    Almoço:
    150g de arroz cozido
    100g de feijão
    180g de frango grelhado

    Lanche da Tarde:
    01 fruta
    01 YoPRO líquido

    Jantar:
    01 pão com 140g de carne moída
  `;

  const parsed = parseNutritionDiaryText(textoMatheus, 'matheus');
  assert.equal(parsed.detectedMealsCount, 4);
  assert.equal(parsed.meals.manha.paes, 1, 'Não deve dobrar pães por causa da opção "ou"');
  assert.equal(parsed.meals.manha.frutas, 1, 'Não deve dobrar frutas por causa da opção "ou"');
  assert.equal(parsed.meals.manha.ovos, 2);
  assert.equal(parsed.meals.manha.requeijaoG, 20);
  assert.equal(parsed.meals.almoco.arrozProntoG, 150);
  assert.equal(parsed.meals.almoco.feijaoProntoG, 100);
  assert.equal(parsed.meals.almoco.carneProntaG, 180);
  assert.equal(parsed.meals.tarde.yopro, 1);
  assert.equal(parsed.meals.noite.carneProntaG, 140);
});

test('Diário Alimentar: separa automaticamente texto único contendo Matheus e Scarlet', () => {
  const textoCasal = `
    Matheus
    Café da manhã: 01 pão e 01 banana
    Almoço: 120g de arroz, 90g de feijão, 150g de carne
    Tarde: 01 maçã e 01 YoPRO
    Noite: 01 pão com 160g de carne

    Scarlet
    Café da manhã: 01 pão e 01 maçã
    Almoço: 80g de arroz, 70g de feijão, 110g de frango
    Tarde: 01 banana e 35g de whey protein com leite em pó
    Noite: 01 pão com 100g de carne
  `;

  const m = parseNutritionDiaryText(textoCasal, 'matheus');
  const s = parseNutritionDiaryText(textoCasal, 'scarlet');

  assert.equal(m.meals.almoco.arrozProntoG, 120);
  assert.equal(m.meals.almoco.carneProntaG, 150);
  assert.equal(s.meals.almoco.arrozProntoG, 80);
  assert.equal(s.meals.almoco.carneProntaG, 110);
  assert.equal(s.meals.tarde.wheyG, 35);
});

test('Diário Alimentar: getEffectiveNutritionMeals e calculadora respeitam diário personalizado por pessoa e consolidação', () => {
  const customState = {
    nutrition: {
      matheus: {
        sourceName: 'Dieta_Matheus_Nov.pdf',
        rawText: 'Almoço: 200g arroz',
        updatedAt: '2026-11-20T12:00:00.000Z',
        meals: {
          almoco: { descricao: '200g arroz + 100g feijão + 150g carne', arrozProntoG: 200, feijaoProntoG: 100, carneProntaG: 150 },
          noite: { descricao: '150g carne', paes: 1, carneProntaG: 150 }
        }
      }
    }
  };

  const meals = getEffectiveNutritionMeals(customState);
  assert.equal(meals.matheus.almoco.arrozProntoG, 200);
  assert.equal(meals.scarlet.almoco.arrozProntoG, 90);

  const planMatheus = calculateMarmitasPlan(7, 'almoco', meals, COOKING_FACTORS, 'matheus');
  assert.equal(planMatheus.totaisProntos.arrozProntoG, 1400); // 200g * 7

  const planCasal = calculateMarmitasPlan(7, 'almoco', meals, COOKING_FACTORS, 'casal');
  assert.equal(planCasal.totaisProntos.arrozProntoG, 2030); // (200 + 90) * 7
});

test('Diário Alimentar: HTML possui inputs separados de PDF e modal #modal-nutrition-diary + sync nuvem preserva por updatedAt', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(html.includes('id="input-nutrition-pdf-matheus"'));
  assert.ok(html.includes('id="input-nutrition-pdf-scarlet"'));
  assert.ok(html.includes('id="input-nutrition-pdf-modal"'));
  assert.ok(html.includes('id="modal-nutrition-diary"'));
  assert.ok(html.includes('id="form-nutrition-diary"'));
  assert.ok(html.includes('id="nutrition-diary-raw-text"'));

  const local = {
    tasks: [],
    nutrition: {
      matheus: { sourceName: 'Local.pdf', updatedAt: '2026-11-20T12:00:00.000Z', meals: { almoco: { arrozProntoG: 140 } } }
    }
  };
  const cloud = {
    tasks: [],
    nutrition: {
      matheus: { sourceName: 'Antigo.pdf', updatedAt: '2026-11-19T10:00:00.000Z', meals: { almoco: { arrozProntoG: 100 } } },
      scarlet: { sourceName: 'Scarlet.pdf', updatedAt: '2026-11-20T11:00:00.000Z', meals: { almoco: { arrozProntoG: 95 } } }
    }
  };

  const merged = applyCloudBackup(local, cloud);
  assert.equal(merged.nutrition.matheus.sourceName, 'Local.pdf');
  assert.equal(merged.nutrition.scarlet.sourceName, 'Scarlet.pdf');
});

test('Diário Alimentar: suporte a foto (anexo, renderização e preservação na nuvem)', async () => {
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

  const stateWithPhoto = {
    nutrition: {
      scarlet: {
        sourceName: 'foto_dieta.jpg',
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        updatedAt: '2026-11-20T12:20:00.000Z',
        meals: {}
      }
    }
  };

  ui.renderMarmitasTab(stateWithPhoto, 'casal', 7, 'completo');
  assert.ok(mockHtml.includes('data-pick-file="input-nutrition-photo-camera-matheus"'));
  assert.ok(mockHtml.includes('data-pick-file="input-nutrition-photo-gallery-scarlet"'));
  assert.ok(mockHtml.includes('data-marmitas-view-photo="scarlet"'));
  assert.ok(mockHtml.includes('Foto do diário anexada'));

  // Preserva foto local quando a nuvem retorna mais recente sem base64
  const merged = applyCloudBackup(
    { tasks: [], nutrition: stateWithPhoto.nutrition },
    { tasks: [], nutrition: { scarlet: { sourceName: 'foto_dieta.jpg', photo: '', updatedAt: '2026-11-20T12:25:00.000Z' } } }
  );
  assert.equal(merged.nutrition.scarlet.photo, 'data:image/jpeg;base64,/9j/4AAQSkZJRg==');
});

test('Calculadora Marmitas: dias personalizados, filtro só feijão/só carne e conversor de quantidade específica', async () => {
  // 10 dias personalizados só feijão
  const onlyBeans10 = calculateMarmitasPlan(10, 'completo', DEFAULT_NUTRITION_MEALS, COOKING_FACTORS, 'casal', ['feijao']);
  assert.equal(onlyBeans10.dias, 10);
  assert.equal(onlyBeans10.shoppingItems.length, 1);
  assert.equal(onlyBeans10.shoppingItems[0].groupKey, 'feijao');
  assert.equal(onlyBeans10.totaisInNatura.feijaoCruG, 650); // 65g * 10

  // Só carne para 5 dias
  const onlyMeat5 = calculateMarmitasPlan(5, 'almoco', DEFAULT_NUTRITION_MEALS, COOKING_FACTORS, 'casal', ['carne']);
  assert.equal(onlyMeat5.shoppingItems.length, 1);
  assert.equal(onlyMeat5.shoppingItems[0].groupKey, 'carne');

  // Conversor específico: 540g carne vermelha pronta -> 900g crua
  const convCarne = calculateCustomQuantityConversion({ item: 'carne', mode: 'pronto_para_cru', grams: 540 });
  assert.equal(convCarne.cruG, 900);
  assert.equal(convCarne.prontoG, 540);
  assert.equal(convCarne.shoppingItem.groupKey, 'carne_vermelha');

  // Frango (rend. 72% -> 720g pronto = 1000g cru)
  const convFrango = calculateCustomQuantityConversion({ item: 'frango', mode: 'cru_para_pronto', grams: 1000 });
  assert.equal(convFrango.prontoG, 720);

  // Carne suína (rend. 68% -> 1000g cru = 680g pronto)
  const convSuina = calculateCustomQuantityConversion({ item: 'suina', mode: 'cru_para_pronto', grams: 1000 });
  assert.equal(convSuina.prontoG, 680);

  // Macarrão (2.5x -> 200g cru = 500g pronto)
  const convMac = calculateCustomQuantityConversion({ item: 'macarrao', mode: 'cru_para_pronto', grams: 200 });
  assert.equal(convMac.prontoG, 500);

  // Batata-doce (compra com casca rend. 0.90x -> 1000g com casca = 900g cozida)
  const convBatata = calculateCustomQuantityConversion({ item: 'batata_doce', mode: 'cru_para_pronto', grams: 1000 });
  assert.equal(convBatata.prontoG, 900);

  // Conversor específico: 500g feijão cru -> 1300g pronto
  const convFeijao = calculateCustomQuantityConversion({ item: 'feijao', mode: 'cru_para_pronto', grams: 500 });
  assert.equal(convFeijao.cruG, 500);
  assert.equal(convFeijao.prontoG, 1300);

  // Render em modo período (10 dias, só feijão) e em modo específico
  const ui = await import('../js/ui.js');
  let mockHtml = '';
  globalThis.document = {
    getElementById: (id) => (id === 'marmitas-main-view'
      ? { set innerHTML(v) { mockHtml = v; }, get innerHTML() { return mockHtml; } }
      : null)
  };

  ui.renderMarmitasTab({}, 'casal', 10, 'completo', {}, { calcMode: 'periodo', selectedGroups: ['feijao'] });
  assert.ok(mockHtml.includes('id="input-marmitas-custom-days"'));
  assert.ok(mockHtml.includes('Adicionar 1 Item Selecionado à Lista de Mercado'));

  ui.renderMarmitasTab({}, 'casal', 7, 'completo', {}, { calcMode: 'especifico', specificItem: 'macarrao', specificDirection: 'cru_para_pronto', specificGrams: 200 });
  assert.ok(mockHtml.includes('id="input-marmitas-specific-grams"'));
  assert.ok(mockHtml.includes('data-marmitas-spec-item="carne_vermelha"'));
  assert.ok(mockHtml.includes('data-marmitas-spec-item="suina"'));
  assert.ok(mockHtml.includes('data-marmitas-spec-item="frango"'));
  assert.ok(mockHtml.includes('data-marmitas-spec-item="macarrao"'));
  assert.ok(mockHtml.includes('data-marmitas-spec-item="batata_doce"'));
  assert.ok(mockHtml.includes('500g'));
});

test('Diário Alimentar: vírgula decimal e ponto de milhar são lidos corretamente', () => {
  const p = (texto) => parseNutritionDiaryText(texto, 'matheus');

  // 0,5 concha de feijão = 40g (antes o parser lia "5" conchas = 400g)
  assert.equal(p('Almoço: 0,5 concha de feijão').meals.almoco.feijaoProntoG, 40);
  // 0,5 scoop de whey = 15g (antes 150g)
  assert.equal(p('Tarde: 0,5 scoop de whey').meals.tarde.wheyG, 15);
  // 1.500g é mil e quinhentos (antes virava 2g)
  assert.equal(p('Almoço: 1.500g de arroz').meals.almoco.arrozProntoG, 1500);
  // Numeral por extenso
  assert.equal(p('Café da manhã: seis ovos e um pão').meals.manha.ovos, 6);
});

test('Diário Alimentar: cabeçalho com nome + sobrenome e nome + refeição na mesma linha', () => {
  const duo = `Paciente: Matheus Silva
Café da manhã: 1 pão
Almoço: 150g de arroz, 100g de feijão, 180g de frango
Scarlet Souza
Café da manhã: 1 pão
Almoço: 80g de arroz, 70g de feijão, 110g de frango`;

  const m = parseNutritionDiaryText(duo, 'matheus');
  const s = parseNutritionDiaryText(duo, 'scarlet');
  assert.equal(m.meals.almoco.arrozProntoG, 150);
  assert.equal(m.meals.almoco.carneProntaG, 180);
  assert.equal(s.meals.almoco.arrozProntoG, 80);
  assert.equal(s.meals.almoco.carneProntaG, 110);

  const inline = `Matheus - Café da manhã: 1 pão com 2 ovos e 20g de requeijão
Matheus - Almoço: 150g de arroz, 100g de feijão, 180g de frango
Scarlet - Almoço: 80g de arroz, 70g de feijão, 110g de carne`;
  assert.equal(parseNutritionDiaryText(inline, 'matheus').meals.manha.ovos, 2);
  assert.equal(parseNutritionDiaryText(inline, 'matheus').meals.almoco.arrozProntoG, 150);
  assert.equal(parseNutritionDiaryText(inline, 'scarlet').meals.almoco.carneProntaG, 110);
});

test('Diário Alimentar: seção da outra pessoa não vaza quando a pedida está vazia', () => {
  const soMatheus = `Matheus\nAlmoço: 150g de arroz, 180g de frango`;
  const scarlet = parseNutritionDiaryText(soMatheus, 'scarlet');
  assert.equal(scarlet.meals.almoco.arrozProntoG, DEFAULT_NUTRITION_MEALS.scarlet.almoco.arrozProntoG);
  assert.equal(scarlet.meals.almoco.carneProntaG, DEFAULT_NUTRITION_MEALS.scarlet.almoco.carneProntaG);
});

test('Diário Alimentar: "Lanche" isolado vira Tarde e item citado sem gramas usa o padrão', () => {
  const parsed = parseNutritionDiaryText('Almoço: 100g arroz\nLanche: 1 fruta', 'matheus');
  assert.equal(parsed.meals.tarde.frutas, 1);

  // Queijo citado sem gramas mantém a porção prescrita; requeijão não citado = 0.
  const cafe = parseNutritionDiaryText('Café da manhã: 1 pão com queijo', 'matheus');
  assert.equal(cafe.meals.manha.queijoG, DEFAULT_NUTRITION_MEALS.matheus.manha.queijoG);
  assert.equal(cafe.meals.manha.requeijaoG, 0);
});

test('Calculadora: dia sem carne não gera item de 0 kg e zero não vira 260g', () => {
  const semCarne = JSON.parse(JSON.stringify(DEFAULT_NUTRITION_MEALS));
  semCarne.matheus.almoco.carneProntaG = 0;
  semCarne.scarlet.almoco.carneProntaG = 0;
  semCarne.matheus.noite.carneProntaG = 0;
  semCarne.scarlet.noite.carneProntaG = 0;

  const plan = calculateMarmitasPlan(7, 'completo', semCarne, COOKING_FACTORS, 'casal');
  assert.equal(plan.totaisInNatura.carneCruaKg, 0);
  assert.equal(plan.shoppingItems.some(i => i.groupKey === 'carne'), false);

  const conv = calculateCustomQuantityConversion({ item: 'carne_vermelha', grams: 260, meals: semCarne, person: 'casal' });
  assert.equal(conv.almocosEquivalentes, 0);
});

test('Nutrição: estado com apenas meals é customizado e foto fora do padrão é descartada', () => {
  const mealsOnly = getNutritionState({ nutrition: { scarlet: { meals: { almoco: { arrozProntoG: 55 } } } } });
  assert.equal(mealsOnly.scarlet.isCustom, true, 'Sem o botão Padrão o usuário não conseguia desfazer');
  assert.equal(mealsOnly.scarlet.meals.almoco.arrozProntoG, 55);

  const xss = getNutritionState({ nutrition: { scarlet: { photo: 'x" onerror="alert(1)' } } });
  assert.equal(xss.scarlet.photo, '');
});

test('Nutrição: fatores parciais não geram NaN', () => {
  const plan = calculateMarmitasPlan(7, 'completo', DEFAULT_NUTRITION_MEALS, {});
  assert.ok(Number.isFinite(plan.totaisInNatura.arrozCruG));
  assert.ok(Number.isFinite(plan.totaisInNatura.feijaoCruG));
  assert.ok(Number.isFinite(plan.totaisInNatura.carneCruaG));

  const conv = calculateCustomQuantityConversion({ item: 'arroz', grams: 500, factors: {} });
  assert.ok(Number.isFinite(conv.cruG));
  assert.equal(conv.prontoG, 500);
});

