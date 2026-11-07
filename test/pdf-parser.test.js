import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { parseNfceDanfeText, suggestPopularName, detectCategoryFromItemName, reconstructSpatialLines } from '../js/pdf-parser.js';
import {
  ensureCatalog,
  upsertCatalogProduct,
  registerInvoiceInCatalog,
  getProductPriceComparison,
  addCatalogProductToShoppingList,
  addPhotoToCatalogProduct,
  updateCatalogProductDetails,
  searchCatalogProducts
} from '../js/catalog.js';

const CARREFOUR_SAMPLE_TEXT = `
CARREFOUR COMERCIO E INDUSTRIA LTDA
CNPJ: 45.543.915/0280-00
RUA MUNICIPAL , 252 , , IPIRANGA , RIBEIRAO PRETO , SP
ACUCAR REF CARAVELAS (Código: SS010604 )
Qtde.:1 UN: un9 Vl. Unit.: 3,19
Vl. Total
3,19
CHA MATE LEAO LIMA T (Código: SS012261 )
Qtde.:1 UN: un9 Vl. Unit.: 18,29
Vl. Total
18,29
MAIONESE RECEITA CAS (Código: SS013381 )
Qtde.:2 UN: un9 Vl. Unit.: 12,29
Vl. Total
24,58
MEL ORG CARREFOUR BI (Código: SS014682 )
Qtde.:1 UN: un9 Vl. Unit.: 21,59
Vl. Total
21,59
TOMATE GRAPE CRFO ME (Código: SS016283 )
Qtde.:1 UN: un9 Vl. Unit.: 14,89
Vl. Total
14,89
ABACAXI PEROLA CRFO (Código: SS028678 )
Qtde.:1 UN: un9 Vl. Unit.: 8,99
Vl. Total
8,99
CHA CAMOMILA DR OETK (Código: SS032018 )
Qtde.:1 UN: un9 Vl. Unit.: 10,99
Vl. Total
10,99
BEB LAC ZL PROFORCE (Código: SS038128 )
Qtde.:4 UN: un9 Vl. Unit.: 8,79
Vl. Total
35,16
BEB LAC ZL PROFORCE (Código: SS038146 )
Qtde.:4 UN: un9 Vl. Unit.: 8,79
Vl. Total
35,16
OVO GDE BRANCO BULNE (Código: SS045293 )
Qtde.:1 UN: un9 Vl. Unit.: 13,29
Vl. Total
13,29
MAMAO FORMOSA ORG (Código: SS044641 )
Qtde.:1,335 UN: kg9 Vl. Unit.: 8,99
Vl. Total
12,00
BANANA NANICA CRF Kg (Código: SS028686 )
Qtde.:0,865 UN: kg9 Vl. Unit.: 7,49
Vl. Total
6,48
QJ MUSSARELA INTERFO (Código: SS049427 )
Qtde.:0,29 UN: kg9 Vl. Unit.: 66,99
Vl. Total
19,43
QJ MUSSARELA INTERFO (Código: SS049427 )
Qtde.:0,308 UN: kg9 Vl. Unit.: 66,99
Vl. Total
20,63
ESPONJA DE ACO BOMBR (Código: SS005161 )
Qtde.:1 UN: un9 Vl. Unit.: 2,79
Vl. Total
2,79
MIX FOLHAS LA VITA (Código: SS053386 )
Qtde.:1 UN: un9 Vl. Unit.: 12,39
Vl. Total
12,39
BEB LAC ZL PROFORCE (Código: SS006326 )
Qtde.:4 UN: un9 Vl. Unit.: 8,79
Vl. Total
35,16
REQUEIJAO CREMOSO LI (Código: SS006531 )
Qtde.:2 UN: un9 Vl. Unit.: 8,89
Vl. Total
17,78
Qtd. total de itens:
18
Valor total R$:
312,79
Descontos R$:
32,13
Valor a pagar R$:
280,66
Forma de pagamento:
Vale Alimentação
Número: 161500 Série: 11 Emissão: 03/11/2026 09:41:43 - Via Consumidor
Chave de acesso:
3526 1145 5439 1502 8000 6501 1000 1615 0017 4886 5489
`;

test('PDF Parser: Extrai com perfeição a nota fiscal Carrefour enviada pelo usuário', () => {
  const result = parseNfceDanfeText(CARREFOUR_SAMPLE_TEXT);

  assert.equal(result.marketName, 'Carrefour');
  assert.equal(result.date, '2026-11-03');
  assert.equal(result.total, 280.66);
  assert.equal(result.nfeKey, '35261145543915028000650110001615001748865489');
  assert.equal(result.items.length, 18);

  // Valida primeiro item (Açúcar)
  const item1 = result.items[0];
  assert.equal(item1.rawName, 'ACUCAR REF CARAVELAS');
  assert.equal(item1.code, 'SS010604');
  assert.equal(item1.unitPrice, 3.19);
  assert.equal(item1.totalPrice, 3.19);
  assert.equal(item1.alias, 'Açúcar Refinado Caravelas');
  assert.equal(item1.category, 'mercearia');

  // Valida item de Chá Mate com Limão
  const itemCha = result.items.find(i => i.code === 'SS012261');
  assert.ok(itemCha);
  assert.equal(itemCha.rawName, 'CHA MATE LEAO LIMA T');
  assert.equal(itemCha.unitPrice, 18.29);
  assert.equal(itemCha.alias, 'Chá Matte Leão Limão');
  assert.equal(itemCha.category, 'bebidas');

  // Valida item por peso (Mamão Formosa)
  const itemMamao = result.items.find(i => i.code === 'SS044641');
  assert.ok(itemMamao);
  assert.equal(itemMamao.qty, '1,335');
  assert.equal(itemMamao.unitPrice, 8.99);
  assert.equal(itemMamao.totalPrice, 12.00);
  assert.equal(itemMamao.alias, 'Mamão Formosa Orgânico');
  assert.equal(itemMamao.category, 'hortifruti');

  // Valida queijo mussarela
  const itemQueijo = result.items.find(i => i.rawName.includes('QJ MUSSARELA'));
  assert.ok(itemQueijo);
  assert.equal(itemQueijo.alias, 'Queijo Mussarela Interfolhado');
  assert.equal(itemQueijo.category, 'frios');
});

test('PDF Parser: Extrai com perfeição o texto real fragmentado extraído do PDF do Carrefour', () => {
  const realText = fs.readFileSync(new URL('./real-extracted-text.txt', import.meta.url), 'utf8');
  const result = parseNfceDanfeText(realText);

  assert.equal(result.marketName, 'Carrefour');
  assert.equal(result.date, '2026-11-03');
  assert.equal(result.total, 280.66);
  assert.equal(result.nfeKey, '35261145543915028000650110001615001748865489');
  assert.equal(result.items.length, 18);

  const item1 = result.items[0];
  assert.equal(item1.rawName, 'ACUCAR REF CARAVELAS');
  assert.equal(item1.code, 'SS010604');
  assert.equal(item1.unitPrice, 3.19);
  assert.equal(item1.totalPrice, 3.19);
  assert.equal(item1.alias, 'Açúcar Refinado Caravelas');
  assert.equal(item1.category, 'mercearia');

  const cha = result.items.find(i => i.code === 'SS012261');
  assert.ok(cha);
  assert.equal(cha.unitPrice, 18.29);
  assert.equal(cha.totalPrice, 18.29);

  const mamao = result.items.find(i => i.code === 'SS044641');
  assert.ok(mamao);
  assert.equal(mamao.qty, '1,335');
  assert.equal(mamao.unitPrice, 8.99);
  assert.equal(mamao.totalPrice, 12.00);
});

test('Catálogo: Memoriza produtos, apelidos, histórico de preços e fotos vinculadas', () => {
  const state = {
    catalog: [],
    compras: []
  };

  const invoiceParsed = parseNfceDanfeText(CARREFOUR_SAMPLE_TEXT);
  const registered = registerInvoiceInCatalog(state, invoiceParsed);

  assert.equal(state.catalog.length, 17); // 18 itens na nota, 1 repetição (Queijo Mussarela) agrupada por código/nome

  const cha = state.catalog.find(p => p.alias === 'Chá Matte Leão Limão');
  assert.ok(cha);
  assert.equal(cha.lastPrice, 18.29);
  assert.equal(cha.lastMarket, 'Carrefour');

  // Simula compra posterior no Pão de Açúcar com preço menor
  upsertCatalogProduct(state, {
    code: 'SS012261',
    rawName: 'CHA MATE LEAO LIMA T',
    unitPrice: 16.90
  }, {
    marketName: 'Pão de Açúcar',
    date: '2026-11-04'
  });

  const comparison = getProductPriceComparison(cha);
  assert.equal(comparison.lastPrice, 16.90);
  assert.equal(comparison.minPrice, 16.90);
  assert.equal(comparison.maxPrice, 18.29);
  assert.equal(comparison.priceDiff, -1.39);
  assert.equal(comparison.history.length, 2);

  // Adiciona foto ao produto no catálogo
  addPhotoToCatalogProduct(state, cha.id, 'data:image/jpeg;base64,TEST_PHOTO');
  assert.equal(cha.photos.length, 1);

  // Adiciona produto do catálogo na lista de compras do mês
  const itemCriado = addCatalogProductToShoppingList(state, cha.id, { qty: '2 unidades' });
  assert.equal(itemCriado.name, 'Chá Matte Leão Limão');
  assert.equal(itemCriado.category, 'bebidas');
  assert.equal(itemCriado.unitPrice, 16.90);
  assert.equal(itemCriado.photos.length, 1);
  assert.equal(state.compras.length, 1);

  // Atualiza apelido popular personalizado
  updateCatalogProductDetails(state, cha.id, { alias: 'Meu Chá Matte Gelado' });
  assert.equal(cha.alias, 'Meu Chá Matte Gelado');
  assert.equal(state.compras[0].name, 'Meu Chá Matte Gelado'); // Propagou para a lista

  // Busca no catálogo por apelido ou nome estranho da nota
  const search1 = searchCatalogProducts(state, 'cha');
  assert.ok(search1.length >= 1);
  const search2 = searchCatalogProducts(state, 'SS012261');
  assert.equal(search2.length, 1);
});

test('PDF Parser: Suporta formatos flexíveis sem código e com variações de pontuação', () => {
  const genericText = `
MERCADO DO BAIRRO LTDA
CNPJ: 12.345.678/0001-90
Emissao: 04/11/2026
ARROZ BRANCO 5KG
Qtde: 2 UN: un Vl. Unit: 28,50 57,00
FEIJAO CARIOCA 1KG
Qtd: 3 UN: un Vl Unit: 8,90 26,70
Valor a pagar R$: 83,70
`;
  const result = parseNfceDanfeText(genericText);
  assert.equal(result.items.length, 2);
  assert.equal(result.total, 83.70);
  assert.equal(result.items[0].rawName, 'ARROZ BRANCO 5KG');
  assert.equal(result.items[0].unitPrice, 28.50);
  assert.equal(result.items[0].totalPrice, 57.00);
  assert.equal(result.items[1].rawName, 'FEIJAO CARIOCA 1KG');
  assert.equal(result.items[1].unitPrice, 8.90);
  assert.equal(result.items[1].totalPrice, 26.70);
});

test('Catálogo: Auto-backfill e syncPurchasesIntoCatalog garantem que Já Comprados nunca fique vazio', async () => {
  const { syncPurchasesIntoCatalog } = await import('../js/catalog.js');
  const state = {
    catalog: [],
    comprasRegistros: [
      {
        id: 'compra_1',
        marketName: 'Carrefour',
        date: '2026-11-03',
        nfeKey: '35261145543915028000650110001615001748865489',
        total: 280.66,
        items: [
          { code: 'SS010604', rawName: 'ACUCAR REF CARAVELAS', alias: 'Açúcar Refinado Caravelas', category: 'mercearia', qty: '1', unit: 'un', unitPrice: 3.19, totalPrice: 3.19 },
          { code: 'SS012261', rawName: 'CHA MATE LEAO LIMA T', alias: 'Chá Matte Leão Limão', category: 'bebidas', qty: '1', unit: 'un', unitPrice: 18.29, totalPrice: 18.29 }
        ]
      }
    ]
  };

  // Estado inicial: catálogo vazio
  assert.equal(state.catalog.length, 0);

  // syncPurchasesIntoCatalog executado ao abrir "Já Comprados"
  syncPurchasesIntoCatalog(state);
  assert.equal(state.catalog.length, 2);
  assert.equal(state.catalog[0].alias, 'Açúcar Refinado Caravelas');
  assert.equal(state.catalog[1].alias, 'Chá Matte Leão Limão');

  // Segunda chamada é idempotente (não duplica)
  syncPurchasesIntoCatalog(state);
  assert.equal(state.catalog.length, 2);
  assert.equal(state.catalog[0].priceHistory.length, 1);
});

test('PDF Parser: Extrai itens mesmo com tokens crus multilinha (stream de palavras soltas)', () => {
  const rawTokenText = `
CARREFOUR COMERCIO E INDUSTRIA LTDA
CNPJ: 45.543.915/0280-00
ACUCAR REF CARAVELAS
(C
ó
digo: SS010604 )
Qtde.:
1
UN:
un9
Vl. Unit.:
3,19
Vl. Total
3,19
CHA MATE LEAO LIMA T
(C
ó
digo: SS012261 )
Qtde.:
2
UN:
un9
Vl. Unit.:
18,29
Vl. Total
36,58
Valor a pagar R$: 39,77
`;
  const result = parseNfceDanfeText(rawTokenText);
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].rawName, 'ACUCAR REF CARAVELAS');
  assert.equal(result.items[0].code, 'SS010604');
  assert.equal(result.items[0].unitPrice, 3.19);
  assert.equal(result.items[0].totalPrice, 3.19);
  assert.equal(result.items[1].rawName, 'CHA MATE LEAO LIMA T');
  assert.equal(result.items[1].code, 'SS012261');
  assert.equal(result.items[1].unitPrice, 18.29);
  assert.equal(result.items[1].totalPrice, 36.58);
});

test('PDF Parser: Extrai itens com dados combinados na mesma linha horizontal', () => {
  const mergedLineText = `
CARREFOUR COMERCIO E INDUSTRIA LTDA
CNPJ: 45.543.915/0280-00
ACUCAR REF CARAVELAS (C ó digo: SS010604 ) Vl. Total Qtde.: 1 UN: un9 Vl. Unit.: 3,19 3,19
CHA MATE LEAO LIMA T (C ó digo: SS012261 ) Vl. Total Qtde.: 1 UN: un9 Vl. Unit.: 18,29 18,29
Valor a pagar R$: 21,48
`;
  const result = parseNfceDanfeText(mergedLineText);
  assert.equal(result.items.length, 2);
  assert.equal(result.items[0].rawName, 'ACUCAR REF CARAVELAS');
  assert.equal(result.items[0].unitPrice, 3.19);
  assert.equal(result.items[1].rawName, 'CHA MATE LEAO LIMA T');
  assert.equal(result.items[1].unitPrice, 18.29);
});

test('PDF Parser: Extrai itens em formato simples (nome e preco ao final da linha)', () => {
  const linePriceText = `
MERCADINHO DA ESQUINA
CNPJ: 11.222.333/0001-44
Data: 06/11/2026
ARROZ TIO JOAO 5KG 25,90
FEIJAO CARIOCA 1KG 8,50
LEITE INTEGRAL PIRACANJUBA 4,89
Valor Total R$: 39,29
`;
  const result = parseNfceDanfeText(linePriceText);
  assert.equal(result.items.length, 3);
  assert.equal(result.total, 39.29);
  assert.ok(result.items[0].rawName.includes('ARROZ TIO JOAO'));
  assert.equal(result.items[0].unitPrice, 25.90);
  assert.ok(result.items[1].rawName.includes('FEIJAO CARIOCA'));
  assert.ok(result.items[2].rawName.includes('LEITE INTEGRAL PIRACANJUBA'));
});

test('PDF Parser: Garante item consolidado quando total existe mas itens vieram atípicos', () => {
  const atypicalText = `
COMPROVANTE FISCAL
CNPJ: 99.888.777/0001-66
SUPERMERCADO DIA
Emissao: 05/11/2026
Valor a pagar R$: 150,75
`;
  const result = parseNfceDanfeText(atypicalText);
  assert.equal(result.total, 150.75);
  assert.equal(result.items.length, 1);
  assert.ok(result.items[0].rawName.toLowerCase().includes('supermercado'));
  assert.equal(result.items[0].totalPrice, 150.75);
});
