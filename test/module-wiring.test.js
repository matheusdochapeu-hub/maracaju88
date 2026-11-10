// Detecta identificadores usados em ui.js/app.js que são exportados por outro
// módulo mas não foram importados (erro de ReferenceError em runtime).
//
// Caso real: getPetAvatarUrl passou a ser usado em ui.js (render dos cards de pet)
// sem entrar no import de pets.js — a aba "Nossos Pets" ficava em branco.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsDir = path.resolve(__dirname, '../js');

const read = (file) => fs.readFileSync(path.join(jsDir, file), 'utf8');

function collectExports() {
  const modules = fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'));
  const exportsByModule = new Map();
  for (const mod of modules) {
    const src = read(mod);
    const names = new Set();
    for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
    for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
      m[1].split(',').forEach((part) => {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (name) names.add(name);
      });
    }
    exportsByModule.set(mod, names);
  }
  return exportsByModule;
}

function collectImportedAndDeclared(src) {
  const names = new Set();
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from/g)) {
    m[1].split(',').forEach((part) => {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    });
  }
  for (const m of src.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]);
  }
  // funções declaradas dentro de funções/objetos também contam
  for (const m of src.matchAll(/(?:^|\n)\s+function\s+([A-Za-z_$][\w$]*)/g)) names.add(m[1]);
  for (const m of src.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)) names.add(m[1]);
  return names;
}

test('Importações: ui.js e app.js não usam função exportada sem importar (evita ReferenceError em runtime)', () => {
  const exportsByModule = collectExports();
  const problems = [];

  for (const target of ['ui.js', 'app.js']) {
    const src = read(target);
    const known = collectImportedAndDeclared(src);
    const used = new Set();
    for (const m of src.matchAll(/(?:^|[^\w.$])([A-Za-z_$][\w$]*)\s*\(/g)) used.add(m[1]);

    for (const [mod, names] of exportsByModule) {
      if (mod === target) continue;
      for (const name of names) {
        if (used.has(name) && !known.has(name)) {
          problems.push(`${target} usa ${name}() mas não importa de ${mod}`);
        }
      }
    }
  }

  assert.deepEqual(problems, [], `Referências sem import encontradas:\n${problems.join('\n')}`);
});

test('Pets: renderPetsTab renderiza os cards de "Nossos Pets" (sem ReferenceError)', async () => {
  const { renderPetsTab } = await import('../js/ui.js');

  const container = { innerHTML: '', querySelectorAll: () => [] };
  const previousDocument = globalThis.document;
  globalThis.document = {
    getElementById: (id) => (id === 'pets-content-view' || id === 'pets-subnav-pills' ? container : null)
  };

  try {
    const state = {
      pets: [
        {
          id: 'pet_teste',
          nome: 'Mandioca',
          especie: 'cachorro',
          raca: 'SRD',
          sexo: 'femea',
          dataNascimento: '2019-11-15',
          pesoKg: 14.5,
          racao: [],
          areia: [],
          higiene: [],
          vacinas: [],
          vermifugos: [],
          exames: [],
          itens: []
        }
      ]
    };

    renderPetsTab(state, 'pets', null, 'todos', '');

    assert.match(container.innerHTML, /Mandioca/, 'O nome do pet deve aparecer no card.');
    assert.match(container.innerHTML, /pet-card-pet_teste/, 'O card do pet deve ser renderizado.');
    assert.match(container.innerHTML, /data-nav-pet-subtab="racao"/, 'O card deve ter os atalhos para as outras abas.');
  } finally {
    globalThis.document = previousDocument;
  }
});

test('Pets: Pasta do Pet renderiza a aba "Itens & Acessórios"', async () => {
  const { renderPetFolderModal } = await import('../js/ui.js');

  const body = { innerHTML: '' };
  const previousDocument = globalThis.document;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'modal-pet-folder') return {};
      if (id === 'pet-folder-header' || id === 'pet-folder-tabs-nav') return { innerHTML: '' };
      if (id === 'pet-folder-body') return body;
      return null;
    }
  };

  try {
    const state = {
      pets: [
        {
          id: 'pet_teste',
          nome: 'Sagu',
          especie: 'gato',
          raca: 'SRD',
          sexo: 'macho',
          dataNascimento: '2024-03-15',
          pesoKg: 4.5,
          racao: [],
          areia: [],
          higiene: [],
          vacinas: [],
          vermifugos: [],
          exames: [],
          itens: [
            { id: 'item_1', nome: 'Comedouro duplo', tipo: 'comedouro', dataCompra: '2026-10-01', valor: 45, loja: 'Cobasi', fotos: [] }
          ]
        }
      ]
    };

    renderPetFolderModal(state, 'pet_teste', 'itens');

    assert.match(body.innerHTML, /Comedouro duplo/, 'O item deve aparecer na aba Itens.');
    assert.match(body.innerHTML, /data-action-add-item="pet_teste"/, 'Deve haver o botão de lançar item.');
    assert.match(body.innerHTML, /data-edit-pet-item="item_1"/, 'Deve haver o botão de editar o item.');
  } finally {
    globalThis.document = previousDocument;
  }
});
