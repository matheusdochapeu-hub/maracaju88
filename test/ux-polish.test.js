import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf-8');

const html = read('index.html');
const appJs = read('js/app.js');
const uiJs = read('js/ui.js');
const variablesCss = read('css/variables.css');
const baseCss = read('css/base.css');
const componentsCss = read('css/components.css');

test('UX: --brand-forest existe (sem ela os textos verdes caíam para a cor padrão)', () => {
  assert.match(variablesCss, /--brand-forest:\s*#[0-9a-f]{6}/i);
  // E o alias é usado de verdade no app.
  assert.ok((componentsCss + uiJs + html).includes('var(--brand-forest)'));
});

test('UX mobile: barra inferior rola na horizontal e não trunca os 9 rótulos', () => {
  assert.match(baseCss, /@media \(max-width: 767px\)[\s\S]{0,600}\.nav-item\s*\{[\s\S]{0,200}flex:\s*0 0 auto/);
  assert.match(baseCss, /\.nav-item[\s\S]{0,200}min-width:\s*56px/);
  assert.match(appJs, /scrollWidth > nav\.clientWidth/);
});

test('UX: cards "não incluídos" mantêm leitura (sem opacity 0.46 no card inteiro)', () => {
  const cssSemComentarios = componentsCss.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal(/\.marmitas-nutri-card\.is-muted\s*\{[^}]*opacity:\s*0?\.46/.test(cssSemComentarios), false);
  assert.match(cssSemComentarios, /\.marmitas-nutri-card\.is-muted\s*\{[^}]*background:\s*var\(--bg-surface\)/);
});

test('A11y: modal do diário é dialog, feedback tem aria-live e o ✕ foi estilizado', () => {
  assert.match(html, /id="modal-nutrition-diary"[^>]*role="dialog"/);
  assert.match(html, /id="modal-nutrition-diary"[^>]*aria-modal="true"/);
  assert.match(html, /id="modal-nutrition-diary"[^>]*aria-labelledby="nutrition-diary-modal-title"/);
  assert.match(html, /id="nutrition-diary-parse-feedback"[^>]*aria-live="polite"/);
  assert.match(html, /id="btn-remove-nutrition-photo"[^>]*aria-label=/);
  assert.match(componentsCss, /\.modal-close\s*\{[\s\S]{0,300}width:\s*40px/);
});

test('A11y: alternadores da calculadora expõem aria-pressed e o foco é devolvido', () => {
  assert.match(appJs, /aria-pressed/);
  assert.match(appJs, /function syncMarmitasAria|const syncMarmitasAria/);
  assert.match(appJs, /preventScroll: true/);
  assert.match(componentsCss, /\.nutrition-diary-actions\s*\{[\s\S]{0,200}position:\s*sticky/);
});

test('UX: trocar de aparelho/recarregar não cai na aba Tarefas arquivada', () => {
  assert.match(appJs, /savedTab === 'tarefas'\) savedTab = 'compras'/);
  assert.equal(/ACTIVE_TAB_ORDER\.includes\(savedTab\) \|\| TAB_ORDER\.includes\(savedTab\)/.test(appJs), false);
});

test('UX: ação "Padrão" do diário pede confirmação antes de apagar', () => {
  assert.match(appJs, /Restaurar o diário de \$\{label\}/);
  assert.match(appJs, /if \(!confirm\(`Restaurar o diário/);
});

test('UX: escolher o mesmo arquivo duas vezes volta a disparar o change', () => {
  assert.match(appJs, /e\.target\.value = ''/);
});

test('UX: enviar marmitas atualiza unitPrice/totalPrice do item já existente', () => {
  assert.match(appJs, /existing\.unitPrice = item\.estimatedUnitPrice/);
  assert.match(appJs, /existing\.totalPrice = 0/);
});

test('Exportar lista: botão na Lista de Mercado, modal e envio pelo WhatsApp', () => {
  assert.match(html, /id="btn-export-shopping-list"/);
  assert.match(html, /id="modal-export-shopping"/);
  assert.match(html, /id="export-shopping-text"/);
  assert.match(html, /data-export-format="checklist"/);
  assert.match(html, /data-export-format="poll"/);
  assert.match(appJs, /function initShoppingListExport/);
  assert.match(appJs, /buildShoppingListExportText/);
  assert.match(appJs, /wa\.me\/\?text=/);
  // wa.me sem texto devolve 400 e não abre o app; o chat vazio usa api.whatsapp.
  assert.match(appJs, /api\.whatsapp\.com\/send\?text=/);
  assert.equal(/window\.open\('https:\/\/wa\.me\/'/.test(appJs), false);
  // Modo Enquete no celular usa share sheet (window.open é bloqueado na PWA).
  assert.match(appJs, /Enquete da lista — o que já compramos/);
  assert.match(appJs, /function openExternalLink|const openExternalLink/);
  assert.equal(/window\.open\('https:\/\/api\.whatsapp/.test(appJs), false);
  assert.match(appJs, /navigator\.share/);
  assert.match(read('js/shopping.js'), /export function buildShoppingListExportText/);
});
