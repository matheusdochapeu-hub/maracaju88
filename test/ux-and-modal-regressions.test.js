import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

// localStorage mínimo para exercitar a persistência de avatar dos pets
function installFakeLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() { return store.size; }
  };
  return store;
}

test('Editar Pet: peso é pré-preenchido a partir de pesoKg e não é zerado ao salvar', () => {
  const app = read('js/app.js');
  assert.match(
    app,
    /pesoEl\.value = pet\.pesoKg \|\| pet\.peso \|\| ''/,
    'O modal de edição deve ler pet.pesoKg (o campo realmente persistido), senão o peso aparece vazio e é zerado ao salvar.'
  );
});

test('Pasta do Pet: botão "Remover" foto possui handler que limpa fotos e avatar persistido', () => {
  const app = read('js/app.js');
  assert.ok(
    app.includes("closest('[data-remove-pet-photo]')"),
    'O botão de remover foto da pasta do pet precisa de um handler delegado.'
  );
  assert.match(
    app,
    /removePetPhoto\(state, petId, 0\)/,
    'O handler deve chamar removePetPhoto para limpar a foto persistida.'
  );
});

test('Pets: updatePet com fotos vazias remove o avatar do pet e do localStorage', async () => {
  const store = installFakeLocalStorage();
  const { addPet, addPetPhoto, updatePet } = await import('../js/pets.js');

  const state = { pets: [] };
  const pet = addPet(state, { nome: 'Mandioca', especie: 'cachorro' });
  addPetPhoto(state, pet.id, 'data:image/png;base64,AAA');

  assert.ok(store.get('MARACAJU_PET_AVATAR_' + pet.id), 'A foto adicionada deve ir para o localStorage.');

  updatePet(state, pet.id, { fotos: [] });

  assert.deepEqual(pet.fotos, [], 'As fotos devem ser limpas.');
  assert.equal(pet.foto, undefined, 'pet.foto deve ser removido.');
  assert.equal(pet.photoUrl, undefined, 'pet.photoUrl deve ser removido.');
  assert.equal(
    store.get('MARACAJU_PET_AVATAR_' + pet.id),
    undefined,
    'Sem limpar o localStorage a foto removida voltaria no próximo load.'
  );

  delete globalThis.localStorage;
});

test('Pets: renomear o pet migra a chave de avatar por nome', async () => {
  const store = installFakeLocalStorage();
  const { addPet, addPetPhoto, updatePet } = await import('../js/pets.js');

  const state = { pets: [] };
  const pet = addPet(state, { nome: 'Mandioca', especie: 'cachorro' });
  addPetPhoto(state, pet.id, 'data:image/png;base64,BBB');

  updatePet(state, pet.id, { nome: 'Mandioca Boizin' });

  assert.equal(store.get('MARACAJU_PET_AVATAR_mandioca'), undefined, 'A chave antiga (por nome) deve ser removida.');
  assert.ok(store.get('MARACAJU_PET_AVATAR_mandioca boizin'), 'A chave nova deve existir.');

  delete globalThis.localStorage;
});

test('Pets: updatePetItem converte valores monetários com parseCurrency', async () => {
  const { addPet, addPetItem, updatePetItem } = await import('../js/pets.js');
  const state = { pets: [] };
  const pet = addPet(state, { nome: 'Sagu', especie: 'gato' });

  const item = addPetItem(state, pet.id, { nome: 'Comedouro', valor: 45 });
  const updated = updatePetItem(state, pet.id, item.id, { valor: 'R$ 1.250,50' });

  assert.equal(updated.valor, 1250.5, 'Valor deve ser convertido como moeda brasileira, não com Number().');
});

test('Shopping: busca e ordenação estão ligadas aos ids e valores reais da tela', () => {
  const html = read('index.html');
  const app = read('js/app.js');
  const items = read('js/shopping-items.js');

  assert.ok(html.includes('id="input-search-shopping"'), 'O campo de busca existe com esse id no HTML.');
  assert.ok(
    app.includes("getElementById('input-search-shopping')"),
    'O app precisa buscar o id que existe no HTML (antes buscava shopping-search-input e a busca era morta).'
  );
  assert.match(app, /shopping-sort-select/, 'O select de ordenação precisa de listener.');
  assert.match(
    html,
    /<option value="price_asc">/,
    'Os valores das opções devem casar com filterShoppingItems (price_asc).'
  );
  assert.match(items, /sort === 'price_asc'/, 'filterShoppingItems deve continuar entendendo price_asc.');
});

test('Shopping: FAB de novo item reseta o formulário antes de abrir', () => {
  const app = read('js/app.js');
  assert.match(
    app,
    /#btn-open-add-shopping-fab/,
    'O FAB do shopping deve estar na lista de botões que chamam openNewShoppingModal.'
  );
});

test('Ajustes: sincronização automática respeita o toggle e persiste entre sessões', () => {
  const storage = read('js/storage.js');
  const app = read('js/app.js');

  assert.match(
    storage,
    /autoSync: \(parsed\.settings && parsed\.settings\.autoSync !== undefined\)/,
    'O loadState não pode forçar autoSync: true por cima da preferência salva.'
  );
  assert.match(app, /state\.settings\.autoSync === false/, 'O auto-sync deve parar quando o toggle está desligado.');
});

test('Modais: scroll do fundo travado e popstate não fecha o modal de baixo', () => {
  const app = read('js/app.js');
  const css = read('css/components.css');

  assert.match(app, /function syncBodyScrollLock\(\)/, 'Deve existir helper de trava de scroll.');
  assert.match(app, /classList\.toggle\('modal-open'/, 'O helper deve alternar a classe modal-open no body.');
  assert.match(css, /body\.modal-open\s*\{[^}]*overflow:\s*hidden/, 'A classe modal-open deve travar o scroll do body.');
  assert.match(
    app,
    /stateModal === topModal/,
    'O popstate deve ignorar o retorno para um modal que continua aberto (senão a Pasta do Pet fecha ao salvar uma edição).'
  );
});

test('UX mobile: viewport permite zoom e inputs usam 16px para o iOS não dar zoom ao focar', () => {
  const html = read('index.html');
  const css = read('css/components.css');

  const viewport = html.match(/<meta name="viewport"[^>]*>/);
  assert.ok(viewport, 'A meta viewport deve existir.');
  assert.ok(!/user-scalable=no/.test(viewport[0]), 'Não bloqueie o zoom (acessibilidade).');
  assert.ok(!/maximum-scale=1\.0/.test(viewport[0]), 'Não limite o zoom a 1x.');

  assert.match(css, /font-size:\s*16px !important/, 'Inputs precisam de 16px no mobile para evitar auto-zoom do iOS.');
  assert.match(css, /:focus-visible/, 'Deve existir foco visível para navegação por teclado.');
});

test('Service Worker: fallback offline devolve Response válida (nunca undefined)', () => {
  const sw = read('sw.js');
  assert.match(sw, /function offlineHtmlResponse\(\)/, 'Deve existir uma resposta HTML de contingência offline.');
  assert.ok(
    !/caches\.match\('\.\/index\.html', \{ ignoreSearch: true \}\) \|\|/.test(sw),
    'Promise || Promise é sempre truthy e devolvia undefined para respondWith.'
  );
  assert.match(sw, /status: 504/, 'Fallback de JS/CSS deve devolver uma Response de erro.');
});
