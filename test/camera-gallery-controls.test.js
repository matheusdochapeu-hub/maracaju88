import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Câmera vs Galeria: Todos os botões e inputs estão corretamente pareados e configurados', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  // Mapeamento dos pares oficiais
  const pairs = [
    { name: 'Compra Manual', camId: 'manual-purchase-camera', galId: 'manual-purchase-gallery' },
    { name: 'OCR Cupom', camId: 'input-ocr-cupom-camera', galId: 'input-ocr-cupom-gallery' },
    { name: 'QR Complementar OCR', camId: 'input-qr-complement-ocr', galId: 'input-qr-complement-gallery' },
    { name: 'Cadastrar Pet', camId: 'add-pet-camera', galId: 'add-pet-gallery' },
    { name: 'Editar Pet', camId: 'edit-pet-camera', galId: 'edit-pet-gallery' },
    { name: 'Exame Pet', camId: 'pet-exame-camera', galId: 'pet-exame-gallery' },
    { name: 'Item Pet', camId: 'pet-item-camera', galId: 'pet-item-gallery' },
    { name: 'Shopping Item', camId: 'shopping-input-camera', galId: 'shopping-input-gallery' },
  ];

  for (const pair of pairs) {
    // 1. Verifica existência do input de câmera com capture="environment"
    const camRegex = new RegExp(`<input[^>]*id=["']${pair.camId}["'][^>]*>`, 'i');
    const camMatch = html.match(camRegex);
    assert.ok(camMatch, `Input de câmera #${pair.camId} (${pair.name}) deve existir no HTML`);
    assert.match(camMatch[0], /capture=["']environment["']/i, `Input #${pair.camId} deve ter capture="environment" para abrir câmera nativa`);

    // 2. Verifica existência do input de galeria SEM atributo capture
    const galRegex = new RegExp(`<input[^>]*id=["']${pair.galId}["'][^>]*>`, 'i');
    const galMatch = html.match(galRegex);
    assert.ok(galMatch, `Input de galeria #${pair.galId} (${pair.name}) deve existir no HTML`);
    assert.doesNotMatch(galMatch[0], /capture/i, `Input #${pair.galId} NÃO pode ter capture para abrir estritamente a galeria`);

    // 3. Verifica que existem botões com data-pick-file apontando para os inputs
    assert.ok(html.includes(`data-pick-file="${pair.camId}"`), `Deve existir botão data-pick-file="${pair.camId}"`);
    assert.ok(html.includes(`data-pick-file="${pair.galId}"`), `Deve existir botão data-pick-file="${pair.galId}"`);
  }
});

test('Visual: Barra de navegação não permite quebra de linha (nowrap) e botões flutuantes não colidem', () => {
  const baseCss = fs.readFileSync(path.join(rootDir, 'css', 'base.css'), 'utf8');
  const compCss = fs.readFileSync(path.join(rootDir, 'css', 'components.css'), 'utf8');

  // Nav não deve permitir quebra no desktop
  assert.ok(baseCss.includes('flex-wrap: nowrap !important;'), 'bottom-nav deve ter flex-wrap: nowrap !important');
  assert.ok(baseCss.includes('overflow-x: auto !important;'), 'bottom-nav deve ter overflow-x: auto !important');

  // FAB Stack deve ter posicionamento relativo sem sobreposição de botões
  assert.ok(compCss.includes('.fab-stack .fab-btn'), 'Deve existir estilo para .fab-stack .fab-btn');
  assert.ok(compCss.includes('position: relative !important;'), 'fab-btn dentro de fab-stack deve ser position: relative !important');
  assert.ok(compCss.includes('gap: 0.75rem !important;'), 'fab-stack deve ter gap mínimo de 0.75rem');
});
