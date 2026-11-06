import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAYMENT_METHODS, getPaymentMethodInfo } from '../js/benefits.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Formas de Pagamento Simplificadas: Apenas VA, VR, PIX, CREDITO, DEBITO, DINHEIRO', () => {
  const expectedLabels = ['VA', 'VR', 'PIX', 'CREDITO', 'DEBITO', 'DINHEIRO'];

  expectedLabels.forEach(label => {
    const pm = PAYMENT_METHODS.find(m => m.label === label);
    assert.ok(pm, `Deveria existir a forma de pagamento com label "${label}"`);
    assert.equal(pm.label, label);
    assert.equal(pm.shortLabel, label);
  });

  const va = getPaymentMethodInfo('va');
  assert.equal(va.label, 'VA');

  const vr = getPaymentMethodInfo('vr');
  assert.equal(vr.label, 'VR');
});

test('HTML: Todos os selects de pagamento contêm estritamente as 6 opções solicitadas', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // Select no modal de compra manual
  assert.ok(html.includes('id="manual-purchase-payment-method"'));

  // Select no modal de edição de compra
  assert.ok(html.includes('id="purchase-edit-payment-method"'));

  // Select no modal de confirmação de PDF
  assert.ok(html.includes('id="pdf-invoice-payment-method"'));

  // Verifica que não há emojis ou textos longos como "Vale Alimentação (VA)" dentro das opções dos selects
  const selectMatches = html.match(/<select[^>]*payment-method[^>]*>[\s\S]*?<\/select>/g);
  assert.ok(selectMatches && selectMatches.length >= 3);

  selectMatches.forEach(sel => {
    assert.ok(sel.includes('<option value="va">VA</option>'));
    assert.ok(sel.includes('<option value="vr">VR</option>'));
    assert.ok(sel.includes('<option value="pix">PIX</option>'));
    assert.ok(sel.includes('<option value="credito">CREDITO</option>'));
    assert.ok(sel.includes('<option value="debito">DEBITO</option>'));
    assert.ok(sel.includes('<option value="dinheiro">DINHEIRO</option>'));
    assert.ok(!sel.includes('Vale Alimentação'));
    assert.ok(!sel.includes('Vale Refeição'));
    assert.ok(!sel.includes('Cartão de'));
  });
});

test('JS: app.js possui interceptação de popstate para o botão Voltar do celular fechar modais', () => {
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

  assert.ok(appJs.includes("window.addEventListener('popstate'"));
  assert.ok(appJs.includes('activeModalStack'));
  assert.ok(appJs.includes('history.pushState'));
});
