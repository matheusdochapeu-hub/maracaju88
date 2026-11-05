import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ROOM_CATEGORIES,
  DEFAULT_CATEGORIES,
  ensureStateCategories,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  LEGACY_ROOM_MAP
} from '../js/categories.js';
import { ROOMS } from '../js/config.js';
import { applyCloudBackup } from '../js/sheets.js';

test('11 Cômodos Oficiais: Padrão para Tarefas e Reformas', () => {
  assert.equal(DEFAULT_ROOM_CATEGORIES.length, 11);

  const expectedRooms = [
    { id: 'suite', label: 'Suite', icon: '🛏️' },
    { id: 'corredor', label: 'Corredor', icon: '🚪' },
    { id: 'banheiro_azul', label: 'Banheiro Azul', icon: '🚿' },
    { id: 'banheiro_rosa', label: 'Banheiro Rosa', icon: '🧼' },
    { id: 'cozinha', label: 'Cozinha', icon: '🍳' },
    { id: 'lavanderia', label: 'Lavanderia', icon: '🧺' },
    { id: 'quintal', label: 'Quintal', icon: '🌿' },
    { id: 'sala', label: 'Sala', icon: '🛋️' },
    { id: 'escritorio', label: 'Escritório', icon: '💻' },
    { id: 'alpendre', label: 'Alpendre', icon: '🏡' },
    { id: 'area_externa_garagem', label: 'Área Externa - Garagem', icon: '🚗' }
  ];

  expectedRooms.forEach((exp, idx) => {
    assert.equal(DEFAULT_ROOM_CATEGORIES[idx].id, exp.id);
    assert.equal(DEFAULT_ROOM_CATEGORIES[idx].label, exp.label);
    assert.equal(DEFAULT_ROOM_CATEGORIES[idx].icon, exp.icon);
    assert.equal(ROOMS[idx].id, exp.id);
    assert.equal(ROOMS[idx].label, exp.label);
  });

  // DEFAULT_CATEGORIES.tarefas e reformas são idênticas a DEFAULT_ROOM_CATEGORIES
  assert.equal(DEFAULT_CATEGORIES.tarefas.length, 11);
  assert.equal(DEFAULT_CATEGORIES.reformas.length, 11);
  assert.deepEqual(DEFAULT_CATEGORIES.tarefas.map(c => c.id), expectedRooms.map(c => c.id));
  assert.deepEqual(DEFAULT_CATEGORIES.reformas.map(c => c.id), expectedRooms.map(c => c.id));
});

test('Migração de estado legado para os 11 novos cômodos', () => {
  const legacyState = {
    categories: {
      tarefas: [
        { id: 'cozinha', label: 'Cozinha', icon: '🍳' },
        { id: 'sala', label: 'Sala', icon: '🛋️' },
        { id: 'quartos', label: 'Quartos', icon: '🛏️' },
        { id: 'banheiros', label: 'Banheiros', icon: '🚿' }
      ]
    }
  };

  ensureStateCategories(legacyState);
  assert.equal(legacyState.categories.tarefas.length, 11);
  assert.equal(legacyState.categories.tarefas[0].id, 'suite');
  assert.equal(legacyState.categories.tarefas[1].id, 'corredor');
  assert.equal(legacyState.categories.tarefas[2].id, 'banheiro_azul');
  assert.equal(legacyState.categories.tarefas[3].id, 'banheiro_rosa');
});

test('applyCloudBackup: Garante os 11 cômodos e descarta cômodos obsoletos', () => {
  const localState = {
    settings: { sheetsUrl: 'https://test', sheetsToken: '123' },
    tasks: [],
    categories: { tarefas: [...DEFAULT_ROOM_CATEGORIES], reformas: [...DEFAULT_ROOM_CATEGORIES] }
  };

  const cloudBackupPayload = {
    tasks: [],
    categories: {
      tarefas: [
        { id: 'quartos', label: 'Quartos' },
        { id: 'geral', label: 'Geral' },
        { id: 'oficina_extra', label: 'Oficina do Casal', icon: '🔨' }
      ]
    }
  };

  const restored = applyCloudBackup(localState, cloudBackupPayload);
  const taskCats = restored.categories.tarefas;

  // Deve ter os 11 oficiais + a oficina_extra (12 categorias)
  assert.equal(taskCats.length, 12);
  assert.ok(taskCats.some(c => c.id === 'suite'));
  assert.ok(taskCats.some(c => c.id === 'corredor'));
  assert.ok(taskCats.some(c => c.id === 'banheiro_azul'));
  assert.ok(taskCats.some(c => c.id === 'banheiro_rosa'));
  assert.ok(taskCats.some(c => c.id === 'alpendre'));
  assert.ok(taskCats.some(c => c.id === 'area_externa_garagem'));
  assert.ok(taskCats.some(c => c.id === 'oficina_extra'));

  // Não deve conter categorias obsoletas
  assert.equal(taskCats.some(c => c.id === 'quartos'), false);
  assert.equal(taskCats.some(c => c.id === 'geral'), false);
});
