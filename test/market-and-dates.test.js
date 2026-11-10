import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addMarketPurchase, getMarketAnalytics, formatMonthKey, updateMarketPurchase } from '../js/shopping.js';
import { getLocalDateString, getLocalMonthKey } from '../js/dates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('Datas: getLocalDateString/getLocalMonthKey usam o fuso local (não UTC)', () => {
  assert.equal(getLocalDateString(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
  assert.equal(getLocalDateString(new Date(2026, 11, 31, 22, 0)), '2026-12-31');
  assert.equal(getLocalMonthKey(new Date(2026, 0, 31, 23, 59)), '2026-01');
  assert.equal(getLocalMonthKey(new Date(2026, 11, 1, 0, 5)), '2026-12');
  assert.equal(getLocalDateString(new Date('inválida')), '');
});

test('Mercado: default de data é o dia local de hoje', () => {
  const state = { comprasRegistros: [] };
  const purchase = addMarketPurchase(state, { marketName: 'Teste', total: 10 });
  assert.equal(purchase.date, localToday());
  assert.equal(purchase.monthKey, formatMonthKey(localToday()));
});

test('Mercado: reescanear a mesma NFC-e não duplica a compra (VA/VR contaria duas vezes)', () => {
  const state = { comprasRegistros: [] };
  const key = '35261150489095000127650010000505041101032350';

  const first = addMarketPurchase(state, {
    marketName: 'Padaria',
    date: '2026-11-07',
    total: 71.06,
    paymentMethod: 'va',
    nfeKey: key,
    items: [{ name: 'Café', totalPrice: 26.48 }]
  });

  const second = addMarketPurchase(state, {
    marketName: 'Padaria Irmãos Araújo',
    date: '2026-11-07',
    total: 80.5,
    paymentMethod: 'vr',
    nfeKey: key
  });

  assert.equal(state.comprasRegistros.length, 1, 'Deve existir apenas um registro para a mesma chave.');
  assert.equal(second.id, first.id, 'O registro existente deve ser atualizado, não recriado.');
  assert.equal(second.total, 80.5, 'O total editado deve ser atualizado.');
  assert.equal(second.paymentMethod, 'vr');
  assert.equal(second.marketName, 'Padaria Irmãos Araújo');
  assert.equal(second.items.length, 1, 'Itens já registrados não devem ser apagados sem novos itens.');
});

test('Mercado: notas diferentes continuam sendo registros separados e somam no analytics', () => {
  const state = { comprasRegistros: [] };
  addMarketPurchase(state, { marketName: 'A', date: '2026-11-02', total: 100, paymentMethod: 'va', nfeKey: 'K1' });
  addMarketPurchase(state, { marketName: 'B', date: '2026-11-03', total: 50, paymentMethod: 'va', nfeKey: 'K2' });
  addMarketPurchase(state, { marketName: 'B', date: '2026-11-03', total: 50, paymentMethod: 'va', nfeKey: 'K2' });

  assert.equal(state.comprasRegistros.length, 2);

  const analytics = getMarketAnalytics(state, 'todos');
  assert.equal(analytics.count, 2);
  assert.equal(analytics.total, 150);
});

test('Mercado: editar a data da compra recalcula o monthKey (mês/ciclo de VA-VR)', () => {
  const state = { comprasRegistros: [] };
  const purchase = addMarketPurchase(state, { marketName: 'A', date: '2026-10-31', total: 10, nfeKey: 'K9' });
  assert.equal(purchase.monthKey, '2026-10');

  updateMarketPurchase(state, purchase.id, { date: '2026-11-01' });
  assert.equal(purchase.monthKey, '2026-11');
});

test('Conciliação NFC-e: app usa o modal existente (showMatchedShoppingItemsModal)', () => {
  const app = fs.readFileSync(path.join(rootDir, 'js/app.js'), 'utf8');

  assert.ok(!app.includes('openReconciliationModal'), 'Não deve chamar função inexistente.');
  assert.match(
    app,
    /^function showMatchedShoppingItemsModal\(/m,
    'O helper deve ser declarado no escopo do módulo (a confirmação da NFC-e roda em initQrCodeScanner).'
  );
  assert.ok(
    app.split('showMatchedShoppingItemsModal(').length > 2,
    'O helper de conciliação deve ser usado (definição + chamadas).'
  );
  assert.ok(app.includes("getElementById('match-shopping-items-list')"), 'O modal de conciliação deve ser populado.');
});