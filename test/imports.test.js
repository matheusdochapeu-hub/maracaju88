import { test } from 'node:test';
import assert from 'node:assert/strict';

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
    '../js/nfce.js',
    '../js/history.js',
    '../js/carro.js',
    '../js/reformas.js',
    '../js/sonhos.js',
    '../js/sheets.js',
    '../js/ui.js'
  ];

  for (const f of files) {
    const mod = await import(f);
    assert.ok(mod, `O módulo ${f} deve ser carregado com sucesso.`);
  }
});
