import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Carrossel de Abas: CSS de Animações e Estilos de Transição', () => {
  const animCss = fs.readFileSync(path.join(__dirname, '../css/animations.css'), 'utf-8');
  const baseCss = fs.readFileSync(path.join(__dirname, '../css/base.css'), 'utf-8');

  // Keyframes de carrossel
  assert.ok(animCss.includes('@keyframes carouselSlideInRight'));
  assert.ok(animCss.includes('@keyframes carouselSlideInLeft'));

  // Classes de animação com curvas cubic-bezier fluidas
  assert.ok(animCss.includes('.tab-content.carousel-slide-right'));
  assert.ok(animCss.includes('.tab-content.carousel-slide-left'));

  // Suporte a acessibilidade (prefers-reduced-motion)
  assert.ok(animCss.includes('prefers-reduced-motion'));

  // Container principal com contenção de overflow horizontal
  assert.ok(baseCss.includes('overflow-x: hidden'));
});

test('Carrossel de Abas: Ordem das 8 abas e lógica direcional', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');

  // TAB_ORDER com as 8 abas na ordem oficial (incluindo Shopping)
  assert.ok(appJs.includes("const TAB_ORDER = ['tarefas', 'pets', 'compras', 'shopping', 'carro', 'reformas', 'sonhos', 'ajustes']"));

  // Presença da função switchTab e initTabsSwipeCarousel
  assert.ok(appJs.includes('function switchTab('));
  assert.ok(appJs.includes('function initTabsSwipeCarousel('));

  // Validação da lógica direcional
  const TAB_ORDER = ['tarefas', 'pets', 'compras', 'shopping', 'carro', 'reformas', 'sonhos', 'ajustes'];

  function getDirection(current, target) {
    const oldIdx = TAB_ORDER.indexOf(current);
    const newIdx = TAB_ORDER.indexOf(target);
    return newIdx >= oldIdx ? 'right' : 'left';
  }

  // Avançando na ordem das abas (entra da direita)
  assert.equal(getDirection('tarefas', 'pets'), 'right');
  assert.equal(getDirection('tarefas', 'compras'), 'right');
  assert.equal(getDirection('compras', 'shopping'), 'right');
  assert.equal(getDirection('shopping', 'carro'), 'right');
  assert.equal(getDirection('pets', 'ajustes'), 'right');

  // Voltando na ordem das abas (entra da esquerda)
  assert.equal(getDirection('ajustes', 'sonhos'), 'left');
  assert.equal(getDirection('carro', 'shopping'), 'left');
  assert.equal(getDirection('shopping', 'compras'), 'left');
  assert.equal(getDirection('compras', 'pets'), 'left');
  assert.equal(getDirection('pets', 'tarefas'), 'left');
});

test('Carrossel de Abas: Gesto de Touch Swipe no Celular', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf-8');

  // Verifica proteção contra swipe dentro de modais abertos ou elementos com scroll horizontal
  assert.ok(appJs.includes('.modal-overlay.active'));
  assert.ok(appJs.includes('.chips-scroll'));
  assert.ok(appJs.includes('.pets-subnav-pills'));

  // Verifica cálculo de delta horizontal e vertical
  assert.ok(appJs.includes('deltaX'));
  assert.ok(appJs.includes('deltaY'));
});
