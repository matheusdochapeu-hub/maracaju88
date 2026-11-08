import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyCloudBackup } from '../js/sheets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Fotos: applyCloudBackup preserva fotos locais quando backup da nuvem chega sem imagens', () => {
  const localState = {
    carro: [
      { id: 'car-1', title: 'Troca de Óleo', photos: ['data:image/jpeg;base64,carPhoto123'], photoUrl: 'data:image/jpeg;base64,carPhoto123' }
    ],
    reformas: [
      { id: 'ref-1', title: 'Pintura Sala', photos: ['data:image/jpeg;base64,refPhoto456'], photoUrl: 'data:image/jpeg;base64,refPhoto456' }
    ],
    sonhos: [
      { id: 'sonho-1', title: 'Sofá Retrátil', photos: ['data:image/jpeg;base64,sonhoPhoto789'], imageUrl: 'data:image/jpeg;base64,sonhoPhoto789' }
    ],
    compras: [
      { id: 'item-1', name: 'Arroz 5kg', photos: ['data:image/jpeg;base64,arrozPhoto'] }
    ],
    comprasRegistros: [
      {
        id: 'compra-1',
        marketName: 'Carrefour',
        photos: ['data:image/jpeg;base64,cupomCarrefour'],
        items: [
          { name: 'Feijão Carioca', photos: ['data:image/jpeg;base64,feijaoPhoto'] }
        ]
      }
    ],
    pets: [
      {
        id: 'pet-1',
        name: 'Mandioca',
        foto: 'data:image/jpeg;base64,petMandioca',
        photos: ['data:image/jpeg;base64,petMandiocaExtra'],
        exames: [
          { id: 'ex-1', title: 'Hemograma', fotos: ['data:image/jpeg;base64,examePhoto'] }
        ],
        itens: [
          { id: 'it-1', title: 'Coleira', foto: 'data:image/jpeg;base64,coleiraPhoto' }
        ]
      }
    ],
    catalog: [
      { id: 'cat-1', name: 'Café Melitta', photos: ['data:image/jpeg;base64,cafePhoto'] }
    ]
  };

  // Nuvem chega sem fotos (porque backupToSheets remove base64 para respeitar limite do Google Sheets)
  const cloudData = {
    carro: [
      { id: 'car-1', title: 'Troca de Óleo', notes: 'Sintético 5W30' }
    ],
    reformas: [
      { id: 'ref-1', title: 'Pintura Sala', budget: 1200 }
    ],
    sonhos: [
      { id: 'sonho-1', title: 'Sofá Retrátil', cost: 3500 }
    ],
    compras: [
      { id: 'item-1', name: 'Arroz 5kg', checked: true }
    ],
    comprasRegistros: [
      {
        id: 'compra-1',
        marketName: 'Carrefour',
        total: 280.66,
        items: [
          { name: 'Feijão Carioca', price: 9.80 }
        ]
      }
    ],
    pets: [
      {
        id: 'pet-1',
        name: 'Mandioca',
        idade: '6 anos',
        exames: [
          { id: 'ex-1', title: 'Hemograma', data: '2026-11-08' }
        ],
        itens: [
          { id: 'it-1', title: 'Coleira', status: 'OK' }
        ]
      }
    ],
    catalog: [
      { id: 'cat-1', name: 'Café Melitta', barcode: '789123456789' }
    ]
  };

  const merged = applyCloudBackup(localState, cloudData);

  // Carro
  const mergedCar = merged.carro.find(c => c.id === 'car-1');
  assert.ok(mergedCar, 'Carro deve existir após merge');
  assert.equal(mergedCar.photos[0], 'data:image/jpeg;base64,carPhoto123', 'Foto do carro deve ser preservada');
  assert.equal(mergedCar.photoUrl, 'data:image/jpeg;base64,carPhoto123', 'photoUrl do carro deve ser preservada');

  // Reformas
  const mergedRef = merged.reformas.find(r => r.id === 'ref-1');
  assert.equal(mergedRef.photos[0], 'data:image/jpeg;base64,refPhoto456', 'Foto da reforma deve ser preservada');

  // Sonhos
  const mergedSonho = merged.sonhos.find(s => s.id === 'sonho-1');
  assert.equal(mergedSonho.photos[0], 'data:image/jpeg;base64,sonhoPhoto789', 'Foto do sonho deve ser preservada');
  assert.equal(mergedSonho.imageUrl, 'data:image/jpeg;base64,sonhoPhoto789', 'imageUrl do sonho deve ser preservada');

  // Compras (Lista de Mercado)
  const mergedItem = merged.compras.find(i => i.id === 'item-1');
  assert.equal(mergedItem.photos[0], 'data:image/jpeg;base64,arrozPhoto', 'Foto do item do mercado deve ser preservada');
  assert.equal(mergedItem.checked, true, 'Propriedades da nuvem também devem ser atualizadas');

  // Compras Registros (Notas / Cupons Fiscais e Itens da Compra)
  const mergedCompra = merged.comprasRegistros.find(p => p.id === 'compra-1');
  assert.equal(mergedCompra.photos[0], 'data:image/jpeg;base64,cupomCarrefour', 'Foto do cupom fiscal deve ser preservada');
  assert.equal(mergedCompra.items[0].photos[0], 'data:image/jpeg;base64,feijaoPhoto', 'Foto do item da nota deve ser preservada');
  assert.equal(mergedCompra.total, 280.66, 'Total da compra da nuvem preservado');

  // Pets
  const mergedPet = merged.pets.find(p => p.id === 'pet-1');
  assert.equal(mergedPet.foto, 'data:image/jpeg;base64,petMandioca', 'Foto principal do pet deve ser preservada');
  assert.equal(mergedPet.photos[0], 'data:image/jpeg;base64,petMandiocaExtra', 'Fotos adicionais do pet preservadas');
  assert.equal(mergedPet.exames[0].fotos[0], 'data:image/jpeg;base64,examePhoto', 'Foto do exame preservada');
  assert.equal(mergedPet.itens[0].foto, 'data:image/jpeg;base64,coleiraPhoto', 'Foto do acessório preservada');

  // Catálogo
  const mergedCat = merged.catalog.find(c => c.id === 'cat-1');
  assert.equal(mergedCat.photos[0], 'data:image/jpeg;base64,cafePhoto', 'Foto do catálogo preservada');
});

test('UI: Todos os botões dinâmicos de Câmera possuem capture="environment" e Galeria não possui capture', () => {
  const uiJs = fs.readFileSync(path.join(rootDir, 'js', 'ui.js'), 'utf8');

  // Carro
  assert.match(uiJs, /class="input-carro-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-carro-add-photo"/);
  // Reforma
  assert.match(uiJs, /class="input-reforma-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-reforma-add-photo"/);
  // Sonho
  assert.match(uiJs, /class="input-sonho-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-sonho-add-photo"/);
  // Shopping
  assert.match(uiJs, /class="input-shopping-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-shopping-add-photo"/);
  // Purchase
  assert.match(uiJs, /class="input-purchase-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-purchase-add-photo"/);
  // Catalog
  assert.match(uiJs, /class="input-catalog-add-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-catalog-add-photo"/);
  // PDF Item
  assert.match(uiJs, /class="input-pdf-item-photo"[^>]*capture="environment"|capture="environment"[^>]*class="input-pdf-item-photo"/);
});
