import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeNfceComplementary, parseNfceQrCodeText } from '../js/nfce.js';
import { parseNfceDanfeText } from '../js/pdf-parser.js';

test('NFC-e Híbrido: mergeNfceComplementary preserva dados do QR Code e complementa com OCR', () => {
  // Dados vindos do QR Code da SEFAZ SP (sem itens, nome genérico)
  const qrData = {
    accessKey: '35261150489095000127650010000505041101032350',
    nfeKey: '35261150489095000127650010000505041101032350',
    cnpj: '50.489.095/0001-27',
    rawUrl: 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35261150489095000127650010000505041101032350|2|1|1|71.06',
    marketName: 'Padaria e Mercearia Irmãos Araújo',
    total: 71.06,
    totalAmount: 71.06,
    date: '2026-11-07',
    paymentMethod: 'va', // Padrão
    items: []
  };

  // Dados extraídos via OCR do papel da mesma foto
  const ocrData = {
    marketName: 'PADARIA E MERCEARIA IRMAOS ARAUJO LTDA',
    cnpj: '50.489.095/0001-27',
    date: '2026-11-07',
    time: '10:32:35',
    total: 71.06,
    paymentMethod: 'credito',
    items: [
      { code: '3000', rawName: 'CAFE DA MANHA', qty: '0.442', unit: 'kg', unitPrice: 59.90, totalPrice: 26.48 },
      { code: '3076', rawName: 'SUCO MIX JARRA', qty: '1', unit: 'un', unitPrice: 17.90, totalPrice: 17.90 },
      { code: '7079', rawName: 'CAPPUCCINO GELADO COM', qty: '1', unit: 'un', unitPrice: 13.50, totalPrice: 13.50 },
      { code: '3000', rawName: 'CAFE DA MANHA', qty: '0.22', unit: 'kg', unitPrice: 59.90, totalPrice: 13.18 }
    ]
  };

  const merged = mergeNfceComplementary(qrData, ocrData);

  // Chave oficial do QR Code foi mantida intacta
  assert.equal(merged.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(merged.rawUrl, qrData.rawUrl);

  // Itens foram preenchidos pelo OCR
  assert.equal(merged.items.length, 4);
  assert.equal(merged.items[0].rawName, 'CAFE DA MANHA');
  assert.equal(merged.items[1].rawName, 'SUCO MIX JARRA');

  // Hora foi complementada pelo OCR
  assert.equal(merged.time, '10:32:35');

  // Forma de pagamento refinada pelo OCR
  assert.equal(merged.paymentMethod, 'credito');

  // Total preservado
  assert.equal(merged.total, 71.06);
});

test('NFC-e Híbrido: OCR preenche total, data, hora e mercado quando QR Code veio incompleto', () => {
  const qrIncompleto = {
    accessKey: '35261150489095000127650010000505041101032350',
    marketName: 'Supermercado',
    items: []
  };

  const ocrCompleto = {
    marketName: 'Padaria Irmãos Araújo',
    cnpj: '50.489.095/0001-27',
    date: '2026-11-07',
    time: '10:32',
    total: 71.06,
    paymentMethod: 'credito',
    items: [
      { rawName: 'CAFE DA MANHA', totalPrice: 26.48 },
      { rawName: 'SUCO MIX JARRA', totalPrice: 17.90 }
    ]
  };

  const merged = mergeNfceComplementary(qrIncompleto, ocrCompleto);

  assert.equal(merged.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(merged.marketName, 'Padaria Irmãos Araújo');
  assert.equal(merged.cnpj, '50.489.095/0001-27');
  assert.equal(merged.date, '2026-11-07');
  assert.equal(merged.time, '10:32');
  assert.equal(merged.total, 71.06);
  assert.equal(merged.items.length, 2);
  assert.equal(merged.paymentMethod, 'credito');
});

test('PDF / Cupom Parser: Extrai data e hora corretamente do texto impresso', () => {
  const sampleCupom = `
PADARIA E MERCEARIA IRMAOS ARAUJO LTDA
CNPJ:50.489.095/0001-27 IE:582124501110 IM:428201
R. CONSTITUICAO, 1365 VILA TIBERIO RIBEIRAO PRETO CEP:14050470
DOCUMENTO AUXILIAR DA NOTA FISCAL CONSUMIDOR ELETRONICA
IT. COD DESCRICAO MERCADORIAS QTDE. UN UNITARIO TOTAL
001 3000 CAFE DA MANHA 0.442KG 59,90 26.48
002 3076 SUCO MIX JARRA 1UN 17,90 17.90
003 7079 CAPPUCCINO GELADO COM 1UN 13,50 13.50
004 3000 CAFE DA MANHA 0.22KG 59,90 13.18
Qtde. total de itens: 4
Valor Total R$ 71.06
Valor a Pagar R$ 71.06
FORMA PAGAMENTO VALOR PAGO R$
Cartao de Credit 71.06
Consulte pela chave de acesso em
https://www.nfce.fazenda.sp.gov.br/consulta
3526 1150 4890 9500 0127 6500 1000 0505 0411 0103 2350
CONSUMIDOR NAO IDENTIFICADO
NFC-e No.000050504 Serie 1 07/11/2026 10:32:35
Protocolo de Autorizacao: 13526007664984907
  `;

  const parsed = parseNfceDanfeText(sampleCupom);
  assert.equal(parsed.date, '2026-11-07');
  assert.ok(parsed.time.startsWith('10:32'), `Hora esperada 10:32 mas recebeu ${parsed.time}`);
  assert.equal(parsed.total, 71.06);
  assert.equal(parsed.paymentMethod, 'credito');
  assert.equal(parsed.nfeKey, '35261150489095000127650010000505041101032350');
  assert.ok(parsed.items.length >= 3, `Deveria ter extraído os itens do cupom, achou ${parsed.items.length}`);
});
