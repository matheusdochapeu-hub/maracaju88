import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNfceDanfeText, suggestPopularName, detectCategoryFromItemName } from '../js/pdf-parser.js';
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
