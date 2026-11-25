import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseNfceQrCodeText } from '../js/nfce.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf-8');

const html = read('index.html');
const appJs = read('js/app.js');

test('QR: um único caminho de abertura (sem listeners duplicados no botão/FAB)', () => {
  assert.equal((appJs.match(/btnScan\.addEventListener/g) || []).length, 0);
  assert.match(appJs, /if \(modalQr && modalQr\.classList\.contains\('active'\)\) return;/);
  assert.match(appJs, /data-open-modal="modal-qr-scanner"/);
  // O FAB não pode abrir pelo handler genérico e pelo handler do QR ao mesmo tempo.
  assert.equal(/id="btn-scan-nfce-qr-fab"[^>]*data-open-modal/.test(html), false);
  assert.match(appJs, /modalId === 'modal-qr-scanner'\) return/);
});

test('QR: câmera tem token contra getUserMedia concorrente e para em qualquer fechamento', () => {
  assert.match(appJs, /cameraStartToken/);
  assert.match(appJs, /if \(myToken !== cameraStartToken\)/);
  assert.match(appJs, /new MutationObserver/);
  assert.match(appJs, /if \(!activeStream \|\| !videoEl \|\| videoEl\.readyState < 2\) return;/);
  assert.equal(/querySelectorAll\('#btn-close-qr-scanner, \[data-close-modal\]'\)/.test(appJs), false);
});

test('QR: itens são escapados e o item-fantasma COMPRA não vai ao catálogo', () => {
  assert.match(appJs, /function escapeQrText/);
  assert.match(appJs, /escapeQrText\(it\.name/);
  assert.match(appJs, /filter\(item => item && item\.code !== 'COMPRA'\)/);
  assert.match(appJs, /if \(finalTotal <= 0\)/);
  assert.match(appJs, /itemsTotal/);
  assert.match(appJs, /const totalNum = parseCurrency\(/);
  assert.match(appJs, /escapeHtmlText\(m\.shoppingItem\.name/);
  assert.match(appJs, /escapeHtmlText\(m\.matchedWith\)/);
});

test('QR: foto do cupom usa a URL do QR para buscar os itens na SEFAZ', () => {
  assert.equal(appJs.includes('isSampleKey'), false, 'Não pode voltar o bloco de dados de amostra');
  assert.match(appJs, /const qrHasDetailedItems/);
  assert.match(appJs, /QR Code detectado! Buscando automaticamente os itens na SEFAZ/);
});

test('QR: URL do QR com pipes codificados (%7C) captura chave, CNPJ e URL', () => {
  const key = '35261150489095000127650010000505041101032350';
  const parsed = parseNfceQrCodeText(
    `https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx?p=${key}%7C2%7C1%7C1%7C7324E472702739EBCBDA34407C169BEB60221465`
  );
  assert.equal(parsed.accessKey, key);
  assert.equal(parsed.nfeKey, key);
  assert.equal(parsed.cnpj, '50.489.095/0001-27');
  assert.ok(parsed.rawUrl.startsWith('https://'));
});

test('QR: botões do leitor continuam no HTML e o modal não usa handler genérico', () => {
  assert.match(html, /id="btn-scan-nfce-qr"/);
  assert.match(html, /id="btn-scan-nfce-qr-fab"/);
  assert.match(html, /id="modal-qr-scanner"/);
  assert.match(html, /id="qr-video"/);
  assert.match(html, /id="btn-qr-retry-fetch"/);
});
