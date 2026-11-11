import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchNfceDetailsOnline, parseNfceQrCodeText } from '../js/nfce.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleHtml = fs.readFileSync(path.join(__dirname, 'nfce-sp-sample.html'), 'utf8');

const QR_URL = 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx?p=35261150489095000127650010000505041101032350|2|1|1|7324E472702739EBCBDA34407C169BEB60221465';
const SHEETS_URL = 'https://script.google.com/macros/s/fake/exec';

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'ERR',
    json: async () => payload,
    text: async () => JSON.stringify(payload)
  };
}

function installFetchMock(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const request = typeof input === 'string' ? input : input.url;
    calls.push({ url: request, method: (init.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase(), body: init.body || '' });
    return handler(request, init);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test('NFC-e online: POST desatualizado na ponte não impede o sucesso via GET (paralelo)', async () => {
  const { calls, restore } = installFetchMock(async (request, init) => {
    const method = (init.method || 'GET').toUpperCase();
    if (request.startsWith(SHEETS_URL) && method === 'POST') {
      // Deploy antigo: devolve o backup em vez do HTML da nota
      return jsonResponse({ status: 'success', data: { tasks: [] } });
    }
    if (request.startsWith(SHEETS_URL) && method === 'GET') {
      return jsonResponse({ status: 'success', html: sampleHtml });
    }
    throw new Error('rede indisponível no teste');
  });

  try {
    const result = await fetchNfceDetailsOnline(QR_URL, { sheetsUrl: SHEETS_URL, sheetsToken: 't' });
    assert.equal(result.success, true);
    assert.equal(result.source, 'apps-script');
    assert.equal(result.items.length, 4);
    assert.equal(result.total, 71.06);
    assert.match(result.marketName, /PADARIA/i);
  } finally {
    restore();
  }

  const bridgeCalls = calls.filter(c => c.url.startsWith(SHEETS_URL));
  assert.ok(bridgeCalls.some(c => c.method === 'GET'), 'A corrente GET deve ser tentada mesmo com POST desatualizado.');
});

test('NFC-e online: a URL enviada à ponte tem os pipes percent-encoded (%7C)', async () => {
  const { calls, restore } = installFetchMock(async (request, init) => {
    const method = (init.method || 'GET').toUpperCase();
    if (request.startsWith(SHEETS_URL)) {
      if (method === 'POST') {
        const body = JSON.parse(init.body || '{}');
        assert.ok(body.url.includes('%7C'), 'O corpo POST deve enviar %7C.');
        assert.ok(!/[^%]7C?\|/.test(body.url), 'Não deve enviar pipe cru.');
        return jsonResponse({ status: 'success', html: sampleHtml });
      }
      return jsonResponse({ status: 'success', html: sampleHtml });
    }
    throw new Error('rede indisponível no teste');
  });

  try {
    const result = await fetchNfceDetailsOnline(QR_URL, { sheetsUrl: SHEETS_URL, sheetsToken: 't' });
    assert.equal(result.success, true);
    assert.equal(result.items.length, 4);
  } finally {
    restore();
  }
});

test('NFC-e online: quando tudo falha devolve needsManualPaste e os erros (sem travar)', async () => {
  const { restore } = installFetchMock(async () => {
    throw new Error('sem rede');
  });

  try {
    const result = await fetchNfceDetailsOnline(QR_URL, { sheetsUrl: SHEETS_URL, sheetsToken: 't' });
    assert.equal(result.success, true);
    assert.equal(result.needsManualPaste, true);
    assert.ok(Array.isArray(result.fetchErrors) && result.fetchErrors.length > 0, 'Deve registrar os erros das tentativas.');
    assert.equal(result.nfeKey, '35261150489095000127650010000505041101032350', 'Os dados do QR devem ser preservados.');
  } finally {
    restore();
  }
});

test('QR: parser aceita URL com pipe cru e com %7C e preserva a chave', () => {
  const comPipe = parseNfceQrCodeText(QR_URL);
  const comEncoded = parseNfceQrCodeText(QR_URL.replace(/\|/g, '%7C'));

  assert.equal(comPipe.nfeKey, '35261150489095000127650010000505041101032350');
  assert.equal(comEncoded.nfeKey, '35261150489095000127650010000505041101032350');
  assert.equal(comPipe.rawUrl, QR_URL);
  assert.equal(comEncoded.rawUrl, QR_URL.replace(/\|/g, '%7C'));
});
