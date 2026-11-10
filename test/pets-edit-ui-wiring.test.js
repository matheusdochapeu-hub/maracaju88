import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addDaysToDateStr } from '../js/pets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

test('Editar Pet: botão de remover foto está ligado ao id que existe no HTML', () => {
  const html = read('index.html');
  const app = read('js/app.js');

  assert.ok(
    html.includes('id="edit-pet-remove-photo"'),
    'O modal de edição do pet deve conter o botão #edit-pet-remove-photo.'
  );
  assert.ok(
    app.includes("getElementById('edit-pet-remove-photo')"),
    'O app.js deve buscar o botão de remover foto pelo id #edit-pet-remove-photo.'
  );
  assert.ok(
    !app.includes("'btn-remove-edit-pet-photo'"),
    'Não deve existir referência ao id inexistente #btn-remove-edit-pet-photo.'
  );
  assert.match(
    app,
    /btnRemoveEditPhoto\.style\.display = 'none'/,
    'Ao remover a foto o botão de remover deve ser escondido.'
  );
});

test('Pasta do Pet: aba "Itens & Acessórios" tem renderizador com lançar, editar e excluir', () => {
  const ui = read('js/ui.js');
  const folderStart = ui.indexOf('export function renderPetFolderModal');
  assert.ok(folderStart !== -1, 'renderPetFolderModal deve existir em js/ui.js.');
  const folderBody = ui.slice(folderStart);
  const itensBranchStart = folderBody.indexOf("if (activeFolderTab === 'itens')");
  assert.ok(itensBranchStart !== -1, 'A pasta do pet deve renderizar a aba "itens".');

  const itensBranch = folderBody.slice(
    itensBranchStart,
    folderBody.indexOf("activeFolderTab === 'cadastrais'", itensBranchStart)
  );
  assert.match(itensBranch, /data-action-add-item=/, 'A aba de itens deve permitir lançar um novo item.');
  assert.match(itensBranch, /data-edit-pet-item=/, 'A aba de itens deve permitir editar cada item.');
  assert.match(itensBranch, /data-del-pet-item=/, 'A aba de itens deve permitir excluir cada item.');
});

test('Inputs monetários dos pets usam teclado decimal (inputmode="decimal")', () => {
  const html = read('index.html');
  const requiredIds = [
    'pet-racao-valor',
    'pet-areia-valor',
    'pet-banho-valor',
    'edit-pet-racao-valor',
    'edit-pet-areia-valor',
    'edit-pet-banho-valor',
    'qr-res-total-input'
  ];

  requiredIds.forEach((id) => {
    const tagMatch = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
    assert.ok(tagMatch, `O input #${id} deve existir no index.html.`);
    assert.match(tagMatch[0], /inputmode="decimal"/, `O input #${id} deve declarar inputmode="decimal".`);
  });
});

test('addDaysToDateStr devolve a data no fuso local mantendo o formato YYYY-MM-DD', () => {
  assert.equal(addDaysToDateStr('2026-10-15', 60), '2026-12-14');
  assert.equal(addDaysToDateStr('2026-02-28', 1), '2026-03-01');
  assert.equal(addDaysToDateStr('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysToDateStr('', 5), '');
});

test('openModal empilha apenas um estado de histórico por modal aberto', () => {
  const app = read('js/app.js');
  const start = app.indexOf('function openModal(id)');
  const end = app.indexOf('function closeModal(id');
  assert.ok(start !== -1 && end > start, 'As funções openModal e closeModal devem existir.');
  const openModalBody = app.slice(start, end);

  assert.match(openModalBody, /const alreadyOpen = existingIdx !== -1/, 'openModal deve detectar modal já aberto.');
  assert.match(openModalBody, /if \(!alreadyOpen\) \{[\s\S]*?history\.pushState/, 'O pushState deve ocorrer só na primeira abertura.');
});
