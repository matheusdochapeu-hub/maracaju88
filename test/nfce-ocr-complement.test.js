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

test('NFC-e / SAT QR Code: Decodifica formatos SAT CF-e e pipe com dia exato e valor', () => {
  // SAT CF-e de São Paulo (padrão muito comum em padarias e mercados)
  const satQrText = '35261150489095000127650010000505041101032350|20261107103235|71.06|50489095000127|ASSINATURA';
  const parsedSat = parseNfceQrCodeText(satQrText);
  assert.equal(parsedSat.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(parsedSat.date, '2026-11-07');
  assert.equal(parsedSat.time, '10:32:35');
  assert.equal(parsedSat.total, 71.06);
  assert.equal(parsedSat.marketName, 'Padaria e Mercearia Irmãos Araújo');

  // NFC-e padrão com dia do mês no pipeParts[3]
  const nfcePipe = 'https://www.nfce.fazenda.sp.gov.br/qrcode?p=35261150489095000127650010000505041101032350|2|1|7|71,06|DIGVAL';
  const parsedNfce = parseNfceQrCodeText(nfcePipe);
  assert.equal(parsedNfce.accessKey, '35261150489095000127650010000505041101032350');
  assert.equal(parsedNfce.date, '2026-11-07');
  assert.equal(parsedNfce.total, 71.06);
});

test('PDF / Cupom Parser: Suporta variações de TOTAL R$, TOTAL: e itens sem código de barras', () => {
  const cupomVariado = `
SUPERMERCADO CENTRAL
CNPJ: 12.345.678/0001-99
RUA SAO PAULO 100
001 LEITE INTEGRAL 2 UN X 4.50 9.00
002 ARROZ TIO JOAO 5KG 1 UN 28.90 28.90
003 BANANA PRATA 1.5KG 6.00 9.00
TOTAL R$ 46,90
DINHEIRO 50.00
TROCO 3.10
08/11/2026 14:20:00
  `;

  const parsed = parseNfceDanfeText(cupomVariado);
  assert.equal(parsed.total, 46.90);
  assert.equal(parsed.date, '2026-11-08');
  assert.equal(parsed.time, '14:20:00');
  assert.equal(parsed.items.length, 3);
  assert.equal(parsed.items[0].rawName, 'LEITE INTEGRAL');
  assert.ok(parsed.items[1].rawName.includes('ARROZ TIO JOAO'));
  assert.equal(parsed.items[2].rawName, 'BANANA PRATA');
});

test('PDF / Cupom Parser: Extrai cupom SAT Carrefour com Extrato e código de barras sem poluir produtos', () => {
  const satCupomCarrefour = `
CARREFOUR COMERCIO E INDUSTRIA LTDA
AVENIDA SAO CARLOS, 1000 - CENTRO
CNPJ: 45.543.915/0001-81
Extrato No. 045123
CUPOM FISCAL ELETRONICO - SAT
CPF do Consumidor: 123.456.789-00
#|COD|DESC|QTD|UN|VL UN R$|(VL TR R$)*|VL ITEM R$
001 789123456 ARROZ TIO JOAO 5KG 1 UN X 29,90 29,90
002 789654321 FEIJAO CARIOCA CAMIL 1KG 2 UN X 8,50 17,00
003 789999999 LEITE INTEGRAL PIRACANJUBA 1L 6 UN X 4,89 29,34
Total bruto de itens 76,24
TOTAL R$ 76,24
Cartao de Credito 76,24
Numero 045123 Serie 001 08/11/2026 14:30:15
3526 1145 5439 1500 0181 5900 0451 2314 3015 6789
  `;

  const parsed = parseNfceDanfeText(satCupomCarrefour);
  assert.equal(parsed.marketName, 'Carrefour');
  assert.equal(parsed.cnpj, '45.543.915/0001-81');
  assert.equal(parsed.total, 76.24);
  assert.equal(parsed.date, '2026-11-08');
  assert.equal(parsed.items.length, 3, 'Deve extrair exatamente os 3 produtos reais');
  assert.equal(parsed.items[0].rawName, 'ARROZ TIO JOAO 5KG');
  assert.equal(parsed.items[0].totalPrice, 29.90);
  assert.equal(parsed.items[1].rawName, 'FEIJAO CARIOCA CAMIL 1KG');
  assert.equal(parsed.items[1].totalPrice, 17.00);
  assert.equal(parsed.items[2].rawName, 'LEITE INTEGRAL PIRACANJUBA 1L');
  assert.equal(parsed.items[2].totalPrice, 29.34);
});

test('PDF / Cupom Parser: Extrai com perfeição texto cru de OCR térmico com ruídos de impressão e caracteres especiais', () => {
  const ocrTermicoReal = `
DOCUNENTO RUXTLIAR DA WHA TISCAL CONSUNIDOR FLETROWIES
IT. (CODIGHIDESCRICRO MERLADUATAS OT DE 1UN UNI TAR TOI TOTAL
OCT S000 CAFE DA 4ANHA O,442K6 59,90 26.48
002 S076 SUCG HIX JARRA TUN 17,99 17.90
003 7079 CAPPUCLING GELADO CON UN 13,50 13.50
064 S000 CAFE DA YANHA 0,22K5 59,90 13.18
Qtde. tote] ae itens: 4
Valor Totel R$ 71.06
Velor @ Pagar KS 71.06
FORMS PAGANENTO VALOR PAGO Rs
Carteo de Credit 71.06
Consulte pela chave de acesso eg
nttes://wow.nfce. fazends so. gav.br/cansulta :
3526 1150 4890 9500 0127 6500 1000 0505 0411 0103 2350
CONSUMIDOR HAD IDENTIFICARG
  `;

  const parsed = parseNfceDanfeText(ocrTermicoReal);
  assert.equal(parsed.total, 71.06, 'Total deve ser R$ 71.06');
  assert.equal(parsed.paymentMethod, 'credito', 'Forma de pagamento deve ser crédito');
  assert.equal(parsed.nfeKey, '35261150489095000127650010000505041101032350');
  assert.equal(parsed.items.length, 4, 'Deve extrair os 4 produtos do cupom');
  assert.ok(parsed.items[0].rawName.includes('CAFE DA MANHA'));
  assert.equal(parsed.items[0].totalPrice, 26.48);
  assert.ok(parsed.items[1].rawName.includes('SUCO MIX JARRA'));
  assert.equal(parsed.items[1].totalPrice, 17.90);
  assert.ok(parsed.items[2].rawName.includes('CAPPUCCINO GELADO'));
  assert.equal(parsed.items[2].totalPrice, 13.50);
  assert.ok(parsed.items[3].rawName.includes('CAFE DA MANHA'));
  assert.equal(parsed.items[3].totalPrice, 13.18);
});
