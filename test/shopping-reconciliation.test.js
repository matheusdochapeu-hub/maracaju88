import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  findMatchingShoppingItems,
  markShoppingItemsAsBought,
  removeShoppingItemsFromList,
  computeTextSimilarity,
  addShoppingItem
} from '../js/shopping.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Conciliação de Compras: computeTextSimilarity identifica correspondências com variações de texto e unidades', () => {
  // Substring direta
  assert.ok(computeTextSimilarity('Arroz', 'ARROZ TIO JOAO T1 5KG') >= 0.85);
  assert.ok(computeTextSimilarity('Leite Integral', 'LEITE UHT INTEGRAL PIRACANJUBA 1L') >= 0.85);

  // Variação de pontuação e abreviação
  assert.ok(computeTextSimilarity('Detergente Ypê', 'DETERG LIQ YPE NEUTRO 500ML') >= 0.65);
  assert.ok(computeTextSimilarity('Café Pilão', 'CAFE PILAO TRAD 500G') >= 0.85);
  assert.ok(computeTextSimilarity('Pão Francês', 'PAO FRANCES KG') >= 0.85);

  // Não correspondência
  assert.equal(computeTextSimilarity('Cerveja Heineken', 'COCA COLA LATA 350ML'), 0);
  assert.equal(computeTextSimilarity('Sabão em pó', 'BANANA PRATA KG'), 0);
});

test('Conciliação de Compras: findMatchingShoppingItems cruza nota fiscal ou compra manual com itens pendentes da lista', () => {
  const state = {
    compras: [
      { id: 'c1', name: 'Arroz Tio João', quantity: '1 pacote', bought: false },
      { id: 'c2', name: 'Leite Integral', quantity: '6 unidades', bought: false },
      { id: 'c3', name: 'Detergente Ypê', quantity: '2 frascos', bought: false },
      { id: 'c4', name: 'Vinho Tinto', quantity: '1 garrafa', bought: false },
      { id: 'c5', name: 'Feijão Carioca', quantity: '1 kg', bought: true } // Já comprado anteriormente
    ]
  };

  const invoicePurchase = {
    marketName: 'Carrefour São Carlos',
    date: '2026-11-05',
    items: [
      { name: 'ARROZ TIO JOAO T1 5KG', totalPrice: 29.90 },
      { name: 'LEITE UHT INTEGRAL PIRACANJUBA 1L', totalPrice: 5.49 },
      { name: 'DETERG LIQ YPE NEUTRO 500ML', totalPrice: 2.79 },
      { name: 'SABONETE DOVE ORIGINAL 90G', totalPrice: 4.19 }
    ]
  };

  const matches = findMatchingShoppingItems(state, invoicePurchase);

  assert.equal(matches.length, 3);

  const matchedIds = matches.map(m => m.shoppingItem.id);
  assert.ok(matchedIds.includes('c1'));
  assert.ok(matchedIds.includes('c2'));
  assert.ok(matchedIds.includes('c3'));
  assert.ok(!matchedIds.includes('c4')); // Vinho não estava na nota
  assert.ok(!matchedIds.includes('c5')); // Feijão já estava comprado

  // Teste de compra manual com anotações / texto simples
  const manualPurchase = {
    marketName: 'Adega Central',
    date: '2026-11-05',
    notes: 'Comprei Vinho Tinto e refrigerante para o jantar'
  };

  const manualMatches = findMatchingShoppingItems(state, manualPurchase);
  assert.equal(manualMatches.length, 1);
  assert.equal(manualMatches[0].shoppingItem.id, 'c4');
});

test('Conciliação de Compras: markShoppingItemsAsBought marca os itens selecionados como comprados', () => {
  const state = {
    compras: [
      { id: 'i1', name: 'Maçã Fuji', bought: false },
      { id: 'i2', name: 'Banana Prata', bought: false },
      { id: 'i3', name: 'Laranja Lima', bought: false }
    ]
  };

  const count = markShoppingItemsAsBought(state, ['i1', 'i2'], 'matheus');
  assert.equal(count, 2);

  const i1 = state.compras.find(i => i.id === 'i1');
  const i2 = state.compras.find(i => i.id === 'i2');
  const i3 = state.compras.find(i => i.id === 'i3');

  assert.equal(i1.bought, true);
  assert.equal(i1.boughtBy, 'matheus');
  assert.ok(i1.boughtAt);

  assert.equal(i2.bought, true);
  assert.equal(i2.boughtBy, 'matheus');

  assert.equal(i3.bought, false);
});

test('Conciliação de Compras: removeShoppingItemsFromList exclui da lista os itens selecionados', () => {
  const state = {
    compras: [
      { id: 'i1', name: 'Maçã Fuji', bought: false },
      { id: 'i2', name: 'Banana Prata', bought: false },
      { id: 'i3', name: 'Laranja Lima', bought: false }
    ]
  };

  const removedCount = removeShoppingItemsFromList(state, ['i1', 'i2']);
  assert.equal(removedCount, 2);
  assert.equal(state.compras.length, 1);
  assert.equal(state.compras[0].id, 'i3');
});

test('HTML: Modal de Conciliação e Botões Flutuantes atualizados', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // Verifica Modal de Conciliação
  assert.ok(html.includes('id="modal-match-shopping-items"'));
  assert.ok(html.includes('id="match-shopping-items-list"'));
  assert.ok(html.includes('id="btn-match-mark-bought"'));
  assert.ok(html.includes('id="btn-match-delete-items"'));

  // Verifica Botões Flutuantes (FABs)
  assert.ok(html.includes('Novo Item na Lista de Mercado'));
  assert.ok(html.includes('Lançar Compra'));
  assert.ok(html.includes('Ler QR Code'));
  assert.ok(html.includes('id="btn-scan-nfce-qr-fab"'));
  assert.ok(html.includes('class="fab-stack"'));
});
