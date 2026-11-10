import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addPet,
  deletePet,
  addPetPhoto,
  removePetPhoto,
  deduplicatePets,
  getPetAvatarUrl
} from '../js/pets.js';
import { applyCloudBackup } from '../js/sheets.js';
import { loadState, saveState, getInitialState } from '../js/storage.js';

// Polyfill minimal localStorage for Node test runner
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

test('Pets: deduplicatePets funde 2 Mandiocas em 1 mantendo registros e nascimento real', () => {
  mockStorage.clear();
  const state = {
    deletedPetIds: [],
    pets: [
      {
        id: 'pet_mandioca',
        nome: 'Mandioca',
        especie: 'cachorro',
        dataNascimento: '2022-04-10',
        apelido: 'Dioca',
        sexo: 'femea',
        raca: 'Vira-lata (SRD)',
        racao: [{ id: 'racao_1', marca: 'Premier', quantidadeKg: 15 }],
        higiene: [{ id: 'banho_1', local: 'Pet Shop Bicho Mimado', valor: 75 }],
        vacinas: [{ id: 'vac_1', vacina: 'V10' }],
        fotos: []
      },
      {
        id: 'pet_1794017084949_bgjn',
        nome: 'Mandioca',
        especie: 'cachorro',
        dataNascimento: '2019-11-15',
        apelido: 'Boizin',
        sexo: 'femea',
        raca: 'SRD',
        racao: [],
        higiene: [],
        vacinas: [],
        fotos: []
      },
      {
        id: 'pet_sagu',
        nome: 'Sagu',
        especie: 'gato',
        dataNascimento: '2018-05-25'
      }
    ]
  };

  const changed = deduplicatePets(state);
  assert.equal(changed, true, 'Deve ter detectado e corrigido duplicidade');
  assert.equal(state.pets.length, 2, 'Devem restar apenas Mandioca e Sagu');

  const mandioca = state.pets.find(p => p.id === 'pet_mandioca');
  assert.ok(mandioca, 'Mandioca primária deve ser mantida');
  assert.equal(mandioca.dataNascimento, '2019-11-15', 'Deve adotar a data de nascimento real (2019-11-15)');
  assert.equal(mandioca.apelido, 'Boizin', 'Deve adotar o apelido Boizin');
  assert.equal(mandioca.racao.length, 1, 'Registros de ração devem ser preservados');
  assert.equal(mandioca.higiene.length, 1, 'Registros de banho devem ser preservados');
  assert.equal(mandioca.vacinas.length, 1, 'Registros de vacina devem ser preservados');

  assert.ok(
    state.deletedPetIds.includes('pet_1794017084949_bgjn'),
    'O ID secundário deve ser incluído em deletedPetIds para não ressuscitar'
  );
});

test('Pets: deletePet inclui ID em deletedPetIds e limpa avatar local', () => {
  mockStorage.clear();
  const state = {
    deletedPetIds: [],
    pets: [
      { id: 'pet_teste_1', nome: 'Totó', especie: 'cachorro' }
    ]
  };

  addPetPhoto(state, 'pet_teste_1', 'data:image/jpeg;base64,totoPhoto');
  assert.equal(mockStorage.get('MARACAJU_PET_AVATAR_pet_teste_1'), 'data:image/jpeg;base64,totoPhoto');

  const deleted = deletePet(state, 'pet_teste_1');
  assert.equal(deleted.id, 'pet_teste_1');
  assert.equal(state.pets.length, 0);
  assert.ok(state.deletedPetIds.includes('pet_teste_1'), 'ID deve constar em deletedPetIds');
  assert.equal(mockStorage.has('MARACAJU_PET_AVATAR_pet_teste_1'), false, 'Avatar deve ser removido');
});

test('Sheets: applyCloudBackup não ressuscita pet excluído presente na nuvem', () => {
  mockStorage.clear();
  const localState = {
    deletedPetIds: ['pet_1794017084949_bgjn'],
    pets: [
      { id: 'pet_mandioca', nome: 'Mandioca', dataNascimento: '2019-11-15' }
    ]
  };

  const cloudData = {
    deletedPetIds: [],
    pets: [
      { id: 'pet_mandioca', nome: 'Mandioca', dataNascimento: '2022-04-10' },
      { id: 'pet_1794017084949_bgjn', nome: 'Mandioca', dataNascimento: '2019-11-15' },
      { id: 'pet_sagu', nome: 'Sagu', especie: 'gato' }
    ]
  };

  const merged = applyCloudBackup(localState, cloudData);

  const foundZombie = merged.pets.find(p => p.id === 'pet_1794017084949_bgjn');
  assert.equal(foundZombie, undefined, 'Pet excluído não pode ser ressuscitado pelo backup');
  assert.equal(merged.pets.filter(p => p.nome.toLowerCase() === 'mandioca').length, 1, 'Deve haver apenas 1 Mandioca');
});

test('Pets: foto do pet persiste via localStorage mesmo quando backup nuvem vier sem imagens', () => {
  mockStorage.clear();
  mockStorage.set('MARACAJU_PET_AVATAR_pet_mandioca', 'data:image/jpeg;base64,mandiocaAvatarResiliente');

  const pet = { id: 'pet_mandioca', nome: 'Mandioca', fotos: [] };
  const avatarUrl = getPetAvatarUrl(pet);
  assert.equal(avatarUrl, 'data:image/jpeg;base64,mandiocaAvatarResiliente', 'Avatar deve ser recuperado do localStorage');

  const localState = {
    deletedPetIds: [],
    pets: [{ id: 'pet_mandioca', nome: 'Mandioca', fotos: [] }]
  };

  const cloudData = {
    pets: [{ id: 'pet_mandioca', nome: 'Mandioca', fotos: [] }]
  };

  const merged = applyCloudBackup(localState, cloudData);
  const mandioca = merged.pets.find(p => p.id === 'pet_mandioca');
  assert.ok(mandioca.fotos && mandioca.fotos.length > 0, 'Fotos devem ser restauradas a partir do avatar local');
  assert.equal(mandioca.fotos[0], 'data:image/jpeg;base64,mandiocaAvatarResiliente');
});
