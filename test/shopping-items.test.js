import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  listShoppingItems,
  addShoppingWishlistItem,
  updateShoppingWishlistItem,
  deleteShoppingWishlistItem,
  toggleShoppingItemBought,
  addPhotoToShoppingItem,
  removePhotoFromShoppingItem,
  getShoppingSummary,
  filterShoppingItems
} from '../js/shopping-items.js';
import { getInitialState } from '../js/storage.js';
import { applyCloudBackup } from '../js/sheets.js';

test('Shopping: Cadastrar item com foto, loja, preço e tamanho (Ex: Meia New Balance da foto)', () => {
  const state = getInitialState();

  const item = addShoppingWishlistItem(state, {
    title: 'Kit 3 Pares Meias New Balance',
    category: 'roupas_calcados',
    price: '39,90',
    store: 'New Balance',
    forWhom: 'matheus',
    priority: 'alta',
    status: 'desejado',
    notes: 'Tamanho M 34-38. Modelo Kit 3x1 Mei Med.',
    photos: ['data:image/jpeg;base64,/9j/4AAQSkZJRg...']
  }, 'matheus');

  assert.ok(item.id.startsWith('shop_'));
  assert.equal(item.title, 'Kit 3 Pares Meias New Balance');
  assert.equal(item.category, 'roupas_calcados');
  assert.equal(item.price, 39.90);
  assert.equal(item.store, 'New Balance');
  assert.equal(item.forWhom, 'matheus');
  assert.equal(item.priority, 'alta');
  assert.equal(item.status, 'desejado');
  assert.equal(item.photos.length, 1);
  assert.equal(state.shoppingWishlist.length, 1);
});

test('Shopping: Edição, alteração de preço, loja e notas', () => {
  const state = getInitialState();
  const item = addShoppingWishlistItem(state, {
    title: 'Air Fryer 4L',
    category: 'eletrodomesticos',
    price: 350.00,
    store: 'Amazon',
    forWhom: 'casal'
  });

  const updated = updateShoppingWishlistItem(state, item.id, {
    title: 'Air Fryer Digital 5L Inox',
    price: '429,90',
    store: 'Magazine Luiza',
    notes: 'Voltagem 110V preferencialmente'
  });

  assert.equal(updated.title, 'Air Fryer Digital 5L Inox');
  assert.equal(updated.price, 429.90);
  assert.equal(updated.store, 'Magazine Luiza');
  assert.equal(updated.notes, 'Voltagem 110V preferencialmente');
});

test('Shopping: Alternar status de comprado e calcular totais', () => {
  const state = getInitialState();

  const item1 = addShoppingWishlistItem(state, {
    title: 'Meias New Balance',
    category: 'roupas_calcados',
    price: 39.90
  });

  const item2 = addShoppingWishlistItem(state, {
    title: 'Robô Aspirador',
    category: 'eletrodomesticos',
    price: 800.00
  });

  let summary = getShoppingSummary(state);
  assert.equal(summary.totalItems, 2);
  assert.equal(summary.activeCount, 2);
  assert.equal(summary.boughtCount, 0);
  assert.equal(summary.totalEstimatedActive, 839.90);
  assert.equal(summary.totalPurchased, 0);

  // Marca item1 como comprado
  toggleShoppingItemBought(state, item1.id, 35.00);

  summary = getShoppingSummary(state);
  assert.equal(summary.activeCount, 1);
  assert.equal(summary.boughtCount, 1);
  assert.equal(summary.totalEstimatedActive, 800.00);
  assert.equal(summary.totalPurchased, 35.00);

  // Desfaz a compra
  toggleShoppingItemBought(state, item1.id);
  summary = getShoppingSummary(state);
  assert.equal(summary.activeCount, 2);
  assert.equal(summary.boughtCount, 0);
});

test('Shopping: Filtros por Categoria, Status, Destinatário e Busca Textual', () => {
  const state = getInitialState();

  addShoppingWishlistItem(state, {
    title: 'Tênis de Corrida',
    category: 'roupas_calcados',
    forWhom: 'matheus',
    priority: 'alta',
    status: 'desejado'
  });

  addShoppingWishlistItem(state, {
    title: 'Vestido de Festa',
    category: 'roupas_calcados',
    forWhom: 'scarlet',
    priority: 'media',
    status: 'desejado'
  });

  addShoppingWishlistItem(state, {
    title: 'Lava-louças 14 Serviços',
    category: 'eletrodomesticos',
    forWhom: 'casal',
    priority: 'urgente',
    status: 'pesquisando'
  });

  // Filtro por Categoria
  const roupas = filterShoppingItems(state, { category: 'roupas_calcados' });
  assert.equal(roupas.length, 2);

  const eletro = filterShoppingItems(state, { category: 'eletrodomesticos' });
  assert.equal(eletro.length, 1);

  // Filtro por Destinatário
  const deScarlet = filterShoppingItems(state, { forWhom: 'scarlet' });
  assert.equal(deScarlet.length, 1);
  assert.equal(deScarlet[0].title, 'Vestido de Festa');

  // Filtro por Status
  const pesquisando = filterShoppingItems(state, { status: 'pesquisando' });
  assert.equal(pesquisando.length, 1);

  // Busca textual
  const buscaTenis = filterShoppingItems(state, { query: 'corrida' });
  assert.equal(buscaTenis.length, 1);
  assert.equal(buscaTenis[0].title, 'Tênis de Corrida');
});

test('Shopping: Fotos (Adicionar, Exibir e Remover)', () => {
  const state = getInitialState();
  const item = addShoppingWishlistItem(state, { title: 'Fone Bluetooth' });

  addPhotoToShoppingItem(state, item.id, 'foto1.jpg');
  addPhotoToShoppingItem(state, item.id, 'foto2.jpg');

  assert.equal(item.photos.length, 2);

  removePhotoFromShoppingItem(state, item.id, 0);
  assert.equal(item.photos.length, 1);
  assert.equal(item.photos[0], 'foto2.jpg');
});

test('Shopping: Sincronização e applyCloudBackup preservam wishlist e fotos', () => {
  const localState = getInitialState();
  localState.shoppingWishlist = [
    { id: 'shop_local_1', title: 'Camiseta Básica', photos: ['local_photo.jpg'], price: 50.0 }
  ];

  const cloudData = {
    shoppingWishlist: [
      { id: 'shop_cloud_1', title: 'Ferro de Passar', price: 120.0 }
    ]
  };

  const merged = applyCloudBackup(localState, cloudData);

  assert.equal(merged.shoppingWishlist.length, 2);
  const localItem = merged.shoppingWishlist.find(it => it.id === 'shop_local_1');
  assert.ok(localItem);
  assert.equal(localItem.photos[0], 'local_photo.jpg');

  const cloudItem = merged.shoppingWishlist.find(it => it.id === 'shop_cloud_1');
  assert.ok(cloudItem);
  assert.equal(cloudItem.price, 120.0);
});
