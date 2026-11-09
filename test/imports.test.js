import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Módulos ES: Todos os arquivos JS do app importam sem erros sintáticos ou faltas de export', async () => {
  const files = [
    '../js/config.js',
    '../js/currency.js',
    '../js/categories.js',
    '../js/projects.js',
    '../js/auth.js',
    '../js/storage.js',
    '../js/audio.js',
    '../js/gamification.js',
    '../js/tasks.js',
    '../js/shopping.js',
    '../js/shopping-items.js',
    '../js/nfce.js',
    '../js/history.js',
    '../js/carro.js',
    '../js/reformas.js',
    '../js/sonhos.js',
    '../js/pets.js',
    '../js/sheets.js',
    '../js/ui.js'
  ];

  for (const f of files) {
    const mod = await import(f);
    assert.ok(mod, `O módulo ${f} deve ser carregado com sucesso.`);
  }
});

test('Validação de Sintaxe: Todos os arquivos JavaScript do app compilam perfeitamente sem SyntaxError', () => {
  const jsDir = path.resolve(__dirname, '../js');
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  
  for (const file of jsFiles) {
    const fullPath = path.join(jsDir, file);
    assert.doesNotThrow(() => {
      execSync(`"${process.execPath}" --check "${fullPath}"`);
    }, `Arquivo ${file} deve compilar sem erro de sintaxe`);
  }

  // Verifica também o Service Worker
  const swPath = path.resolve(__dirname, '../sw.js');
  assert.doesNotThrow(() => {
    execSync(`"${process.execPath}" --check "${swPath}"`);
  }, 'sw.js deve compilar sem erro de sintaxe');
});
