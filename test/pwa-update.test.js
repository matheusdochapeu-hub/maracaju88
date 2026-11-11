import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf-8');
const swJs = fs.readFileSync(path.join(rootDir, 'sw.js'), 'utf-8');

test('PWA: versão instalada é dinâmica (não fica presa em v2.5.7)', () => {
  assert.match(html, /id="app-version-label"/);
  assert.equal(html.includes('Maracaju v2.5.7'), false, 'A versão não pode ser hardcoded');
  assert.match(appJs, /APP_CONFIG\.version/);
  assert.match(appJs, /function updateVersionLabel/);
});

test('PWA: nova versão mostra banner "Atualizar agora" em vez de recarregar sozinho', () => {
  assert.match(html, /id="app-update-banner"/);
  assert.match(html, /id="btn-apply-update"/);
  assert.match(html, /maracaju:new-version/);
  assert.match(appJs, /function showUpdateBanner/);
  assert.match(appJs, /function initUpdateBanner/);
  assert.match(appJs, /addEventListener\('click', \(\) => window\.location\.reload\(\)\)/);
});

test('PWA: registration do Service Worker usa ?v= para furar o cache HTTP do Pages', () => {
  assert.match(appJs, /sw\.js\?v=\$\{encodeURIComponent\(APP_CONFIG\.version\)\}/);
  assert.match(appJs, /checkForUpdate/);
  assert.match(appJs, /visibilitychange/);
});

test('PWA: Service Worker continua com CACHE_NAME versionado', () => {
  assert.match(swJs, /const CACHE_NAME = 'maracaju-v\d+\.\d+\.\d+';/);
});
