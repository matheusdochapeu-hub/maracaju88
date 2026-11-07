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
