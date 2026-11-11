import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getInitialState,
  markDeleted,
  markPurchaseDeleted,
  ensureRecoveredPurchases,
  normalizePurchasesInState
} from '../js/storage.js';
import { applyCloudBackup } from '../js/sheets.js';
import { addMarketPurchase, deleteMarketPurchase, getMarketAnalytics } from '../js/shopping.js';
import { getMonthlyBenefitDetails } from '../js/benefits.js';
import { fetchNfceDetailsOnline, parseNfceHtml } from '../js/nfce.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function baseState() {
  const state = getInitialState();
  state.settings.sheetsUrl = '';
  return state;
}

test('Exclusão: tarefa apagada não volta no merge da nuvem (tombstone)', () => {
  const state = baseState();
  state.tasks = [
    { id: 't1', title: 'Lavar louça', frequency: 'diaria' },
    { id: 't2', title: 'Varrer', frequency: 'diaria' }
  ];

  markDeleted(state, 'tasks', 't1');
  state.tasks = state.tasks.filter(t => t.id !== 't1');

  // A planilha ainda tem a tarefa (outro aparelho não sincronizou a exclusão).
  const cloud = {
    tasks: [
      { id: 't1', title: 'Lavar louça', frequency: 'diaria' },
      { id: 't2', title: 'Varrer', frequency: 'diaria' }
    ]
  };

  const merged = applyCloudBackup(state, cloud);
  assert.equal(merged.tasks.some(t => t.id === 't1'), false, 'Tarefa excluída não pode ressuscitar');
  assert.equal(merged.tasks.some(t => t.id === 't2'), true, 'Tarefa não excluída continua');
});

test('Exclusão: item de mercado apagado não volta no merge da nuvem', () => {
  const state = baseState();
  state.compras = [
    { id: 'c1', name: 'Arroz', bought: false },
    { id: 'c2', name: 'Feijão', bought: false }
  ];

  markDeleted(state, 'compras', 'c1');
  state.compras = state.compras.filter(i => i.id !== 'c1');

  const merged = applyCloudBackup(state, {
    compras: [
      { id: 'c1', name: 'Arroz', bought: false },
      { id: 'c2', name: 'Feijão', bought: false }
    ]
  });

  assert.equal(merged.compras.some(i => i.id === 'c1'), false);
  assert.equal(merged.compras.some(i => i.id === 'c2'), true);
});

test('Exclusão: compra do Carrefour (nota recuperável) não volta ao recarregar', () => {
  const state = baseState();
  state.comprasRegistros = [{
    id: 'nfe_1793844808958_e5k5',
    marketName: 'Carrefour',
    date: '2026-11-03',
    monthKey: '2026-11',
    total: '280,66',
    paymentMethod: 'va'
  }];

  normalizePurchasesInState(state);
  markPurchaseDeleted(state, 'nfe_1793844808958_e5k5');
  deleteMarketPurchase(state, 'nfe_1793844808958_e5k5');

  ensureRecoveredPurchases(state);

  const carrefour = state.comprasRegistros.filter(p =>
    String(p.marketName || '').toLowerCase() === 'carrefour' && Math.abs(Number(p.total) - 280.66) < 0.05
  );
  assert.equal(carrefour.length, 0, 'A nota excluída (e a cópia recuperável equivalente) não pode voltar');
});

test('Exclusão: recuperar notas é uma ação explícita e limpa o túmulo', () => {
  const state = baseState();
  state.comprasRegistros = [];
  markDeleted(state, 'comprasRegistros', 'nfe_carrefour_161500');

  ensureRecoveredPurchases(state);
  assert.equal(state.comprasRegistros.some(p => p.id === 'nfe_carrefour_161500'), false);

  ensureRecoveredPurchases(state, { restoreDeleted: true });
  assert.equal(state.comprasRegistros.some(p => p.id === 'nfe_carrefour_161500'), true);
});

test('Valores: total em texto da planilha ("264,33") é normalizado e soma no VA', () => {
  const state = baseState();
  const cloud = {
    comprasRegistros: [
      { id: 'p1', marketName: 'Carrefour', date: '2026-11-10', total: '264,33', paymentMethod: 'va' }
    ]
  };

  const merged = applyCloudBackup(state, cloud);
  assert.equal(merged.comprasRegistros[0].total, 264.33);

  const details = getMonthlyBenefitDetails(merged, '2026-11');
  assert.equal(details.paymentBreakdown.va, 264.33);
  assert.equal(details.vaSpent, 264.33);
});

test('Duplicata antiga: cópia recuperável do Carrefour é removida quando já existe a importada', () => {
  const state = baseState();
  state.comprasRegistros = [
    {
      id: 'nfe_1793844808958_e5k5',
      marketName: 'Carrefour',
      date: '2026-11-03',
      total: '280,66',
      paymentMethod: 'va',
      items: [{ name: 'Açúcar', totalPrice: 3.19 }]
    },
    {
      id: 'nfe_carrefour_161500',
      marketName: 'Carrefour',
      date: '2026-11-03',
      total: '280,66',
      paymentMethod: 'va',
      notes: 'NFC-e Carrefour Ribeirão Preto'
    }
  ];

  normalizePurchasesInState(state);
  ensureRecoveredPurchases(state);

  const iguais = state.comprasRegistros.filter(p =>
    String(p.marketName || '').toLowerCase() === 'carrefour' && Math.abs(Number(p.total) - 280.66) < 0.05
  );
  assert.equal(iguais.length, 1, 'Não pode manter duas cópias da mesma compra');
  assert.equal(iguais[0].id, 'nfe_1793844808958_e5k5', 'Mantém o registro real (com itens)');
});

test('Analytics: somas não viram NaN com totais em texto', () => {
  const state = { comprasRegistros: [] };
  addMarketPurchase(state, { marketName: 'A', date: '2026-11-10', total: '100,50', paymentMethod: 'va' });
  state.comprasRegistros[0].total = '100,50'; // simula planilha devolvendo texto

  const analytics = getMarketAnalytics(state, 'todos');
  assert.equal(analytics.total, 100.5);
  assert.equal(analytics.vaTotal, 100.5);
});

test('NFC-e: consulta automática usa leitor externo quando a SEFAZ bloqueia CORS', async () => {
  const sampleHtml = fs.readFileSync(path.join(__dirname, 'nfce-sp-sample.html'), 'utf-8');
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes('r.jina.ai')) {
      return new Response(sampleHtml, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    throw new Error('CORS bloqueado');
  };

  try {
    const result = await fetchNfceDetailsOnline(
      'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx?p=35261150489095000127650010000505041101032350|2|1|1|HASH',
      { baseInfo: {}, sheetsUrl: '' }
    );

    assert.equal(result.success, true);
    assert.equal(result.fetchedAutomatically, true);
    assert.equal(result.items.length, 4);
    assert.equal(result.total, 71.06);
    assert.equal(result.needsManualPaste, undefined);
    assert.ok(calls.some(u => u.includes('r.jina.ai')), 'Deve tentar o leitor automático');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('NFC-e: sem nenhuma fonte disponível, sinaliza colagem manual com o motivo', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };

  try {
    const result = await fetchNfceDetailsOnline(
      'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx?p=35261150489095000127650010000505041101032350|2|1|1|HASH',
      { baseInfo: {}, sheetsUrl: '' }
    );
    assert.equal(result.needsManualPaste, true);
    assert.ok(Array.isArray(result.fetchErrors) && result.fetchErrors.length > 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('NFC-e: cupom duplicado pelo leitor automático não conta os itens em dobro', () => {
  const sampleHtml = fs.readFileSync(path.join(__dirname, 'nfce-sp-sample.html'), 'utf-8');
  const doubled = `${sampleHtml}\n${sampleHtml}`;
  const parsed = parseNfceHtml(doubled);
  assert.equal(parsed.items.length, 4, 'O bloco repetido deve ser removido');
  assert.equal(parsed.total, 71.06, 'O total não pode dobrar');
});

test('UI/PWA: atualização do Service Worker não recarrega a página sozinha', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  assert.equal(/controllerchange[\s\S]{0,300}location\.reload/.test(html), false);
  assert.match(html, /data-maracaju-new-version/);
});

test('UI/Navegação: aba ativa é persistida para sobreviver a uma recarga', () => {
  const appJs = fs.readFileSync(path.join(rootDir, 'js', 'app.js'), 'utf-8');
  assert.match(appJs, /MARACAJU_ACTIVE_TAB_v1/);
  assert.match(appJs, /function saveActiveTab/);
  assert.match(appJs, /function applyTabVisibility/);
});
