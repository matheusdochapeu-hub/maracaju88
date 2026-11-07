import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseNfceQrCodeText,
  parseNfceHtml,
  formatCnpj,
  mapPaymentMethodToApp,
  guessMarketNameFromCnpj
} from '../js/nfce.js';
import { addMarketPurchase } from '../js/shopping.js';
import { registerInvoiceInCatalog, searchCatalogProducts, ensureCatalog } from '../js/catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('NFC-e QR Code: Decodificação da Chave de Acesso e URL da SEFAZ SP', () => {
  const urlSefazSp = 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx?p=35261150489095000127650010000505041101032350|2|1|1|7324E472702739EBCBDA34407C169BEB60221465';

  const result = parseNfceQrCodeText(urlSefazSp);

  assert.equal(result.success, true);
  assert.equal(result.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(result.nfeKey, '35261150489095000127650010000505041101032350');
  assert.equal(result.cnpj, '50.489.095/0001-27');
  assert.equal(result.nfeNumber, '50504');
  assert.equal(result.nfeSeries, '1');
  assert.equal(result.marketName, 'Padaria e Mercearia Irmãos Araújo');
  assert.match(result.date, /^2026-11-/);
});

test('NFC-e HTML: Extração completa de dados, estabelecimento, total e itens da SEFAZ SP', () => {
  const samplePath = path.join(__dirname, 'nfce-sp-sample.html');
  const htmlContent = fs.readFileSync(samplePath, 'utf-8');

  const parsed = parseNfceHtml(htmlContent);

  assert.equal(parsed.success, true);
  assert.equal(parsed.marketName, 'PADARIA E MERCEARIA IRMAOS ARAUJO LTDA');
  assert.equal(parsed.cnpj, '50.489.095/0001-27');
  assert.equal(parsed.date, '2026-11-07');
  assert.equal(parsed.time, '10:32:35');
  assert.equal(parsed.nfeNumber, '50504');
  assert.equal(parsed.nfeSeries, '1');
  assert.equal(parsed.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(parsed.total, 71.06);
  assert.equal(parsed.totalAmount, 71.06);
  assert.equal(parsed.paymentMethod, 'credito');
  assert.equal(parsed.paymentMethodName, 'Cartão de Crédito');

  // Validação dos 4 itens da foto do cupom
  assert.equal(parsed.items.length, 4);

  const item1 = parsed.items[0];
  assert.equal(item1.name, 'CAFE DA MANHA');
  assert.equal(item1.code, '3000');
  assert.equal(item1.quantity, 0.442);
  assert.equal(item1.unit, 'KG');
  assert.equal(item1.unitPrice, 59.90);
  assert.equal(item1.price, 26.48);

  const item2 = parsed.items[1];
  assert.equal(item2.name, 'SUCO MIX JARRA');
  assert.equal(item2.code, '3076');
  assert.equal(item2.quantity, 1);
  assert.equal(item2.unit, 'UN');
  assert.equal(item2.unitPrice, 17.90);
  assert.equal(item2.price, 17.90);

  const item3 = parsed.items[2];
  assert.equal(item3.name, 'CAPPUCCINO GELADO COM CHANTILY');
  assert.equal(item3.code, '7079');
  assert.equal(item3.quantity, 1);
  assert.equal(item3.unit, 'UN');
  assert.equal(item3.unitPrice, 13.50);
  assert.equal(item3.price, 13.50);

  const item4 = parsed.items[3];
  assert.equal(item4.name, 'CAFE DA MANHA');
  assert.equal(item4.code, '3000');
  assert.equal(item4.quantity, 0.22);
  assert.equal(item4.unit, 'KG');
  assert.equal(item4.unitPrice, 59.90);
  assert.equal(item4.price, 13.18);

  // Soma exata dos itens
  const sum = parsed.items.reduce((acc, it) => acc + it.price, 0);
  assert.equal(Math.round(sum * 100) / 100, 71.06);
});

test('NFC-e & Catálogo: Registro integrado da nota alimenta Compras, Catálogo e Já Comprados', () => {
  const samplePath = path.join(__dirname, 'nfce-sp-sample.html');
  const htmlContent = fs.readFileSync(samplePath, 'utf-8');
  const invoiceData = parseNfceHtml(htmlContent);

  const state = {
    version: 1,
    comprasRegistros: [],
    catalog: [],
    settings: { soundEnabled: false }
  };

  // 1. Salva compra no histórico do mês
  const purchase = addMarketPurchase(state, {
    marketName: invoiceData.marketName,
    date: invoiceData.date,
    total: invoiceData.total,
    paymentMethod: invoiceData.paymentMethod,
    nfeKey: invoiceData.nfeKey,
    items: invoiceData.items
  });

  assert.equal(state.comprasRegistros.length, 1);
  assert.equal(purchase.total, 71.06);
  assert.equal(purchase.paymentMethod, 'credito');
  assert.equal(purchase.items.length, 4);

  // 2. Registra itens no Catálogo Inteligente
  registerInvoiceInCatalog(state, invoiceData);

  assert.ok(ensureCatalog(state).length >= 3);

  // 3. Verifica busca no catálogo e Já Comprados
  const cafe = searchCatalogProducts(state, 'CAFE DA MANHA');
  assert.ok(cafe.length > 0);
  assert.equal(cafe[0].lastMarket, 'PADARIA E MERCEARIA IRMAOS ARAUJO LTDA');
  assert.equal(cafe[0].lastPrice, 59.90);

  const suco = searchCatalogProducts(state, 'SUCO MIX JARRA');
  assert.ok(suco.length > 0);
  assert.equal(suco[0].lastPrice, 17.90);

  const cappuccino = searchCatalogProducts(state, 'CAPPUCCINO');
  assert.ok(cappuccino.length > 0);
  assert.equal(cappuccino[0].lastPrice, 13.50);
});

test('Formas de Pagamento NFC-e: Mapeamento preciso para o enum do app', () => {
  assert.equal(mapPaymentMethodToApp('Cartão de Crédito'), 'credito');
  assert.equal(mapPaymentMethodToApp('Cartao de Debito'), 'debito');
  assert.equal(mapPaymentMethodToApp('Dinheiro em Espécie'), 'dinheiro');
  assert.equal(mapPaymentMethodToApp('Pagamento Instantâneo (PIX)'), 'pix');
  assert.equal(mapPaymentMethodToApp('Vale Alimentação / VR Card'), 'va');
  assert.equal(mapPaymentMethodToApp('Vale Refeição'), 'vr');
  assert.equal(mapPaymentMethodToApp('Outros'), 'va');
});

test('NFC-e OCR & Cupom: Extrai cupom impresso em papel com itens, valores e forma de pagamento', async () => {
  const { parseNfceDanfeText } = await import('../js/pdf-parser.js');

  const cupomRealText = [
    'PADARIA E MERCEARIA IRMAOS ARAUJO LTDA',
    'CNPJ: 50.489.095/0001-27 IE: 582124501110 IM: 428201',
    'R. CONSTITUICAO, 1365 VILA TIBERIO',
    'RIBEIRAO PRETO CEP: 14050470',
    'DOCUMENTO AUXILIAR DA NOTA FISCAL CONSUMIDOR ELETRONICA',
    'IT. COD DESCRICAO MERCADORIA QTD. UN UNITARIO TOTAL',
    '001 3000 CAFE DA MANHA 0.442KG 59,90 26.48',
    '002 3076 SUCO MIX JARRA 1UN 17.90 17.90',
    '003 7079 CAPPUCCINO GELADO COM 1UN 13.50 13.50',
    '004 3000 CAFE DA MANHA 0.22KG 59.90 13.18',
    'Qtde. total de itens: 4',
    'Valor Total R$ 71.06',
    'Valor a Pagar R$ 71.06',
    'FORMA PAGAMENTO VALOR PAGO R$',
    'Cartao de Credit 71.06',
    'Consulte pela chave de acesso em https://www.nfce.fazenda.sp.gov.br/consulta',
    '3526 1150 4890 9500 0127 6500 1000 0505 0411 0103 2350',
    'NFC-e No. 000050504 Serie 1 07/11/2026 10:32:35'
  ].join('\n');

  const parsed = parseNfceDanfeText(cupomRealText);

  assert.equal(parsed.success, true);
  assert.equal(parsed.marketName, 'Padaria e Mercearia Irmãos Araújo');
  assert.equal(parsed.cnpj, '50.489.095/0001-27');
  assert.equal(parsed.total, 71.06);
  assert.equal(parsed.paymentMethod, 'credito');
  assert.equal(parsed.nfeKey, '35261150489095000127650010000505041101032350');
  assert.equal(parsed.items.length, 4);

  // Café da manhã
  assert.equal(parsed.items[0].rawName, 'CAFE DA MANHA');
  assert.equal(parsed.items[0].totalPrice, 26.48);

  // Suco mix jarra
  assert.equal(parsed.items[1].rawName, 'SUCO MIX JARRA');
  assert.equal(parsed.items[1].totalPrice, 17.90);

  // Cappuccino gelado
  assert.equal(parsed.items[2].rawName, 'CAPPUCCINO GELADO COM');
  assert.equal(parsed.items[2].totalPrice, 13.50);

  // Café da manhã 2
  assert.equal(parsed.items[3].rawName, 'CAFE DA MANHA');
  assert.equal(parsed.items[3].totalPrice, 13.18);
});

test('NFC-e UI: Leitor Universal possui jsQR embutido, abas de câmera, OCR e colar da área de transferência', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf-8');

  // 1. Script do jsQR presente no head
  assert.ok(indexHtml.includes('js/vendor/jsqr.min.js'), 'index.html deve carregar jsqr.min.js');

  // 2. Abas presentes no modal
  assert.ok(indexHtml.includes('id="tab-btn-qr-cam"'), 'Aba Câmera QR deve existir');
  assert.ok(indexHtml.includes('id="tab-btn-qr-ocr"'), 'Aba OCR Foto Cupom deve existir');
  assert.ok(indexHtml.includes('id="tab-btn-qr-paste"'), 'Aba Colar/Arquivo deve existir');

  // 3. Botão de colar automático presente
  assert.ok(indexHtml.includes('id="btn-qr-clipboard-paste"'), 'Botão de colar automático da área de transferência deve existir');

  // 4. Integração do fallback jsQR em app.js
  assert.ok(appJs.includes('window.jsQR'), 'app.js deve utilizar fallback universal jsQR');
  assert.ok(appJs.includes('navigator.clipboard.readText'), 'app.js deve ler a área de transferência');
});
