import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseGhFotosTree,
  CATALOGO_PRODUTOS_ROTINA,
  identificarProdutoPorTextoOuId,
  analisarListaFotosArsenal,
  gerarPlanoRotinaDoArsenal
} from '../js/rotina-matheus.js';
import { applyCloudBackup, mergeCloudWithLocalPriority } from '../js/sheets.js';

test('parseGhFotosTree lista só as fotos de fotos/<categoria>/ e ordena da mais nova', () => {
  const tree = [
    { path: 'README.md', type: 'blob', sha: 'a' },
    { path: 'fotos', type: 'tree', sha: 'b' },
    { path: 'fotos/pele-perfumes/1795400000000-000-abcd.jpg', type: 'blob', sha: 'c', size: 1200 },
    { path: 'fotos/cremes-cabelo/1795500000000-001-efgh.jpg', type: 'blob', sha: 'd', size: 900 },
    { path: 'fotos/cremes-cabelo/sub/x.jpg', type: 'blob', sha: 'e' },
    { path: 'outros/y.jpg', type: 'blob', sha: 'f' }
  ];
  const list = parseGhFotosTree(tree);
  assert.equal(list.length, 2);
  assert.deepEqual(list.map(f => f.cat), ['cremes-cabelo', 'pele-perfumes']);
  assert.equal(list[0].id, '1795500000000-001-efgh');
  assert.equal(list[0].sha, 'd');
  assert.deepEqual(parseGhFotosTree(undefined), []);
});

test('CATALOGO_PRODUTOS_ROTINA reconhece todas as 26 fotos enviadas ao repositório GitHub e monta a rotina completa', () => {
  assert.equal(CATALOGO_PRODUTOS_ROTINA.length, 26);

  const fotosDoRepo = [
    // 11 cremes-cabelo
    { id: '1795571915034-000-w6p6', cat: 'cremes-cabelo' },
    { id: '1795572006556-000-a7dz', cat: 'cremes-cabelo' },
    { id: '1795572016292-000-bsou', cat: 'cremes-cabelo' },
    { id: '1795572027148-000-qdei', cat: 'cremes-cabelo' },
    { id: '1795572038284-000-rtbu', cat: 'cremes-cabelo' },
    { id: '1795572199358-000-zl1l', cat: 'cremes-cabelo' },
    { id: '1795572214673-000-i34d', cat: 'cremes-cabelo' },
    { id: '1795572225345-000-mhqt', cat: 'cremes-cabelo' },
    { id: '1795572236743-000-us4h', cat: 'cremes-cabelo' },
    { id: '1795572245691-000-wa1c', cat: 'cremes-cabelo' },
    { id: '1795572275880-000-py8h', cat: 'cremes-cabelo' },
    // 15 pele-perfumes
    { id: '1795571882555-000-uvfr', cat: 'pele-perfumes' },
    { id: '1795571897035-000-vadf', cat: 'pele-perfumes' },
    { id: '1795571905429-000-r8xz', cat: 'pele-perfumes' },
    { id: '1795571926049-000-srls', cat: 'pele-perfumes' },
    { id: '1795571949506-000-eoxp', cat: 'pele-perfumes' },
    { id: '1795571973296-000-6ccw', cat: 'pele-perfumes' },
    { id: '1795571978882-000-suwe', cat: 'pele-perfumes' },
    { id: '1795571986790-000-atc3', cat: 'pele-perfumes' },
    { id: '1795572049290-000-qpod', cat: 'pele-perfumes' },
    { id: '1795572056900-000-btp7', cat: 'pele-perfumes' },
    { id: '1795572071725-000-h08p', cat: 'pele-perfumes' },
    { id: '1795572081685-000-26nw', cat: 'pele-perfumes' },
    { id: '1795572094095-000-6m7d', cat: 'pele-perfumes' },
    { id: '1795572255299-000-208i', cat: 'pele-perfumes' },
    { id: '1795572264351-000-q249', cat: 'pele-perfumes' }
  ];

  const detectados = analisarListaFotosArsenal(fotosDoRepo);
  assert.equal(detectados.length, 26);

  const plano = gerarPlanoRotinaDoArsenal(detectados);
  assert.equal(plano.totalProdutos, 26);
  assert.equal(plano.totalCabelo, 11);
  assert.equal(plano.totalPele, 15);
  assert.ok(plano.manhaRosto.some(s => s.includes('Creamy Gel de Limpeza')));
  assert.ok(plano.manhaRosto.some(s => s.includes('Vitamina C')));
  assert.ok(plano.diasCorrida.some(s => s.includes('Ápice Nutri Waves')));
  assert.ok(plano.noiteRecuperacao.some(s => s.includes('Ceramide Skin Repair')));
  assert.equal(plano.cronogramaDomingo.length, 4);
});

test('identificarProdutoPorTextoOuId reconhece produtos por texto OCR de novos uploads', () => {
  const byKnownOcr = identificarProdutoPorTextoOuId({
    id: 'foto-nova-123',
    cat: 'pele-perfumes',
    ocrText: 'creamy skincare WATERY LOTION loção aquosa Protetor solar FPS 60'
  });
  assert.ok(byKnownOcr);
  assert.equal(byKnownOcr.key, 'creamy_watery_lotion_fps60');
  assert.equal(byKnownOcr.matchedBy, 'ocr');

  const byCustomOcr = identificarProdutoPorTextoOuId({
    id: 'foto-futura-999',
    cat: 'cremes-cabelo',
    ocrText: 'Bio Extratus Mascara Reconstrutora Queratina 250g'
  });
  assert.ok(byCustomOcr);
  assert.equal(byCustomOcr.slot, 'mascara_nutricao');
  assert.equal(byCustomOcr.matchedBy, 'ocr_custom');
});

test('mergeCloudWithLocalPriority preserva lançamentos novos do celular e do PC sem sobrescrever edições locais pendentes', () => {
  const localState = {
    activeUserId: 'matheus',
    comprasRegistros: [
      { id: 'comp_local_1', marketName: 'Savegnago', date: '2026-11-26', total: 145.90, paymentMethod: 'va' }
    ],
    compras: [
      { id: 'item_shared', name: 'Café Torrado', qty: 3, bought: true },
      { id: 'item_only_local', name: 'Leite Integral', qty: 6, bought: false }
    ],
    carro: [
      { id: 'car_1', title: 'Troca de Óleo (Editado no PC)', status: 'concluido', estimatedCost: 320 }
    ]
  };

  const cloudData = {
    activeUserId: 'scarlet',
    comprasRegistros: [
      { id: 'comp_cloud_1', marketName: 'Carrefour', date: '2026-11-25', total: 89.50, paymentMethod: 'vr' }
    ],
    compras: [
      { id: 'item_shared', name: 'Café Torrado', qty: 1, bought: false },
      { id: 'item_only_cloud', name: 'Azeite', qty: 1, bought: false }
    ],
    carro: [
      { id: 'car_1', title: 'Troca de Óleo', status: 'pendente', estimatedCost: 280 },
      { id: 'car_2', title: 'Alinhamento lançado no celular', status: 'pendente', estimatedCost: 150 }
    ]
  };

  const merged = mergeCloudWithLocalPriority(localState, cloudData);

  // 1. Mantém lançamentos de compras dos dois aparelhos
  assert.equal(merged.comprasRegistros.length, 2);
  assert.ok(merged.comprasRegistros.some(r => r.id === 'comp_local_1'));
  assert.ok(merged.comprasRegistros.some(r => r.id === 'comp_cloud_1'));

  // 2. Mantém itens de lista de mercado de ambos, mas preserva a edição local no item compartilhado
  assert.equal(merged.compras.length, 3);
  const shared = merged.compras.find(i => i.id === 'item_shared');
  assert.equal(shared.qty, 3);
  assert.equal(shared.bought, true);

  // 3. Mantém o item novo do celular (car_2) E preserva a edição local do PC em car_1
  assert.equal(merged.carro.length, 2);
  const car1 = merged.carro.find(c => c.id === 'car_1');
  assert.equal(car1.status, 'concluido');
  assert.equal(car1.title, 'Troca de Óleo (Editado no PC)');
});
