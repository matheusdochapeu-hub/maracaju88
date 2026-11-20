import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildShoppingListExportText } from '../js/shopping.js';
import { getInitialState } from '../js/storage.js';

function makeState(compras) {
  const state = getInitialState();
  state.compras = compras;
  return state;
}

const itens = [
  { id: 'c1', name: 'Banana Prata', quantity: '12 unidades', unitPrice: 1.2, bought: false, category: 'hortifruti' },
  { id: 'c2', name: 'Arroz 5kg', quantity: '1 un', unitPrice: 27.9, bought: false, category: 'mercearia' },
  { id: 'c3', name: 'Feijão', quantity: '2 un', unitPrice: 8.9, bought: true, category: 'mercearia' }
];

test('Exportar lista: checklist só com pendentes, agrupado e com total', () => {
  const text = buildShoppingListExportText(makeState(itens), 'checklist');

  assert.ok(text.includes('🛒 *Lista de Mercado — Casa Maracaju*'));
  assert.ok(text.includes('⬜ Banana Prata — 12 unidades — R$ 14,40'));
  assert.ok(text.includes('⬜ Arroz 5kg — 1 un — R$ 27,90'));
  assert.ok(text.includes('*Total estimado:* R$ 42,30'));
  assert.equal(text.includes('Feijão'), false, 'Item comprado não pode entrar');
  assert.ok(text.includes('2 itens pendentes'));
});

test('Exportar lista: opção de esconder preços', () => {
  const text = buildShoppingListExportText(makeState(itens), 'checklist', { includePrices: false });
  assert.ok(text.includes('⬜ Banana Prata — 12 unidades'));
  assert.equal(text.includes('R$ 1,20'), false);
  assert.equal(text.includes('Total estimado'), false);
});

test('Exportar lista: enquete numera opções e respeita o limite de 12', () => {
  const muitos = Array.from({ length: 15 }, (_, i) => ({
    id: `p${i}`, name: `Item ${i + 1}`, quantity: '1 un', unitPrice: 1, bought: false, category: 'outros'
  }));
  const text = buildShoppingListExportText(makeState(muitos), 'poll');

  assert.ok(text.includes('📊 *Enquete da lista'));
  assert.ok(text.includes('1. Item 1 — 1 un'));
  assert.ok(text.includes('12. Item 12 — 1 un'));
  assert.equal(text.includes('13. Item 13'), false, 'Acima de 12 opções não entra na enquete');
  assert.ok(text.includes('3 itens ficaram de fora'));
  assert.ok(text.includes('Permitir várias respostas'));
});

test('Exportar lista: lista vazia e nomes com marcadores do WhatsApp', () => {
  const vazia = buildShoppingListExportText(makeState([]), 'checklist');
  assert.ok(vazia.includes('Todos os itens da lista já foram comprados'));

  const comMarcadores = buildShoppingListExportText(makeState([
    { id: 'x', name: '*Oferta* _do_ dia', quantity: '1 un', unitPrice: 5, bought: false, category: 'outros' }
  ]), 'checklist');
  assert.ok(comMarcadores.includes('⬜ Oferta do dia'));
  assert.equal(comMarcadores.includes('*Oferta*'), false);
});
