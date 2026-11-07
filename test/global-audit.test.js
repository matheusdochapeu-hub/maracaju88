import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Auditoria Global: Todas as 8 abas oficiais existem e estão estruturadas', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

  const expectedTabs = [
    'tab-tarefas',
    'tab-pets',
    'tab-compras',
    'tab-shopping',
    'tab-carro',
    'tab-reformas',
    'tab-sonhos',
    'tab-ajustes'
  ];

  for (const tabId of expectedTabs) {
    assert.ok(indexHtml.includes(`id="${tabId}"`), `Aba ${tabId} deve existir no index.html`);
  }

  // Verifica botões da barra inferior de navegação
  const bottomNavData = ['tarefas', 'pets', 'compras', 'shopping', 'carro', 'reformas', 'sonhos', 'ajustes'];
  for (const navTab of bottomNavData) {
    assert.ok(
      indexHtml.includes(`data-tab="${navTab}"`),
      `Botão de navegação data-tab="${navTab}" deve existir na barra inferior`
    );
  }
});

test('Auditoria Global: Todos os modais possuem botões de fechamento e IDs válidos', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

  // Encontra todos os modais no HTML
  const modalMatches = Array.from(indexHtml.matchAll(/id="(modal-[^"]+)"/g)).map(m => m[1]);
  assert.ok(modalMatches.length >= 15, `Deve haver pelo menos 15 modais registrados, encontrados: ${modalMatches.length}`);

  for (const mId of modalMatches) {
    // Cada modal deve ter pelo menos um botão com data-close-modal ou classe modal-close
    const modalSection = indexHtml.substring(indexHtml.indexOf(`id="${mId}"`), indexHtml.indexOf(`id="${mId}"`) + 2500);
    assert.ok(
      modalSection.includes('data-close-modal') || modalSection.includes('modal-close'),
      `Modal ${mId} deve conter botão para fechar (data-close-modal)`
    );
  }
});

test('Auditoria Global: Sub-abas de Pets estão presentes no HTML e em ui.js', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const uiJs = fs.readFileSync(path.join(rootDir, 'js', 'ui.js'), 'utf-8');

  const petSubTabs = ['pets', 'racao', 'areia', 'higiene', 'vacinas', 'exames', 'itens'];
  for (const st of petSubTabs) {
    assert.ok(
      indexHtml.includes(`data-pet-subtab="${st}"`),
      `Sub-aba de pets data-pet-subtab="${st}" deve existir em index.html`
    );
  }

  assert.ok(uiJs.includes("subTab === 'itens'"), 'ui.js deve renderizar a sub-aba itens');
  assert.ok(uiJs.includes("activeFolderTab === 'itens'"), 'ui.js deve suportar aba itens na pasta do pet');
});
