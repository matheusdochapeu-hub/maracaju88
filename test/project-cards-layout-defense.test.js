import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatDescriptionWithLinks } from '../js/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Defesa de Layout: formatDescriptionWithLinks sanitiza HTML e formata URLs', () => {
  const input = 'Opcional: comprar mangueira na https://www.amazon.com.br/dp/B0F92XZ7F8?ref=123 e <script>alert(1)</script>';
  const output = formatDescriptionWithLinks(input);

  // Deve sanitizar tags HTML
  assert.ok(!output.includes('<script>'), 'Não deve conter tags de script');
  assert.ok(output.includes('&lt;script&gt;'), 'Deve escapar tags');

  // Deve converter URL em link com target _blank e word-break
  assert.ok(output.includes('href="https://www.amazon.com.br/dp/B0F92XZ7F8?ref=123"'), 'Deve conter link formatado');
  assert.ok(output.includes('target="_blank"'), 'Deve abrir em nova aba');
  assert.ok(output.includes('word-break: break-all'), 'Link deve ter word-break defensivo');
});

test('Defesa de Layout: URLs longas sem protocolo (ex: mercadolivre ou shopee) são reconhecidas', () => {
  const input = 'Veja em shopee.com.br/produto-especial-irrigacao-123456';
  const output = formatDescriptionWithLinks(input);
  assert.ok(output.includes('href="https://shopee.com.br/produto-especial-irrigacao-123456"'), 'Deve adicionar https');
});

test('Defesa de Layout: CSS de Grid e Cards possui minmax(0, 1fr), min-width 0 e overflow-wrap anywhere', () => {
  const cssPath = path.join(__dirname, '..', 'css', 'components.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Grid defensivo que não estoura com links longos
  assert.ok(
    cssContent.includes('.carro-grid, .reformas-grid, .sonhos-grid, .cards-grid') &&
    cssContent.includes('minmax(0, 1fr)'),
    'Grids devem usar minmax(0, 1fr) para impedir blowout por conteúdo extenso'
  );

  // Project card defensivo
  assert.ok(
    cssContent.includes('.project-card') &&
    cssContent.includes('overflow-wrap: anywhere') &&
    cssContent.includes('word-break: break-word') &&
    cssContent.includes('min-width: 0'),
    'project-card deve possuir min-width: 0, word-break e overflow-wrap anywhere'
  );
});

test('Defesa de Layout: renderReformasTab e renderSonhosTab usam formatDescriptionWithLinks e word-break', () => {
  const uiPath = path.join(__dirname, '..', 'js', 'ui.js');
  const uiContent = fs.readFileSync(uiPath, 'utf8');

  assert.ok(
    uiContent.includes('formatDescriptionWithLinks(ref.description)'),
    'renderReformasTab deve aplicar formatDescriptionWithLinks'
  );

  assert.ok(
    uiContent.includes('formatDescriptionWithLinks(sonho.description)'),
    'renderSonhosTab deve aplicar formatDescriptionWithLinks'
  );

  assert.ok(
    uiContent.includes('formatDescriptionWithLinks(item.notes)'),
    'renderCarroTab deve aplicar formatDescriptionWithLinks'
  );
});
