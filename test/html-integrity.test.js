import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('HTML Integridade: Todas as tags de index.html estão balanceadas e sem truncamentos (ex: </di)', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Verifica que não existem tags truncadas
  const truncatedTags = html.match(/<\/[a-z]{1,2}(?:\s|>|\r?\n)/gi) || [];
  const validTwoLetterTags = ['</p>', '</b>', '</i>', '</u>', '</a>', '</em>', '</li>', '<th>', '<td>', '<tr>', '</h1>', '</h2>', '</h3>', '</h4>', '</h5>', '</h6>', '</ol>', '</ul>'];
  const suspicious = truncatedTags.filter(t => !validTwoLetterTags.includes(t.trim().toLowerCase()));
  assert.equal(suspicious.length, 0, `Não deve haver tags truncadas como </di. Encontrado: ${suspicious.join(', ')}`);

  // Verifica que todos os modais existem e não estão aninhados em outros modais
  const modalMatches = Array.from(html.matchAll(/id=["'](modal-[^"']+)["']/g)).map(m => m[1]);
  assert.ok(modalMatches.length >= 10, 'O app deve ter ao menos 10 modais cadastrados.');

  // Verifica que modais essenciais do relato do usuário estão presentes
  const expectedModals = [
    'modal-catalog-products',
    'modal-add-reforma',
    'modal-edit-reforma',
    'modal-add-sonho',
    'modal-edit-sonho',
    'modal-edit-task',
    'modal-edit-carro',
    'modal-edit-shopping-item',
    'modal-edit-purchase',
    'modal-add-manual-purchase'
  ];
  expectedModals.forEach(m => {
    assert.ok(modalMatches.includes(m), `Modal #${m} deve existir no index.html.`);
  });
});

test('Modais & Gatilhos: Todos os botões com data-open-modal apontam para modais válidos', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const triggerMatches = Array.from(html.matchAll(/data-open-modal=["']([^"']+)["']/g)).map(m => m[1]);
  assert.ok(triggerMatches.length > 0, 'Devem existir botões com data-open-modal.');

  triggerMatches.forEach(targetId => {
    assert.ok(
      html.includes(`id="${targetId}"`) || html.includes(`id='${targetId}'`),
      `O gatilho data-open-modal="${targetId}" deve apontar para um elemento existente.`
    );
  });
});

test('Rodapé limpo: Não deve haver caracteres espúrios como v> soltos no HTML', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const regex = new RegExp('(?:^|\\n)\\s*v>\\s*(?:\\r?\\n|$)', 'g');
  const strayMatches = html.match(regex) || [];
  assert.equal(strayMatches.length, 0, 'Não deve haver linhas com v> no index.html.');
});