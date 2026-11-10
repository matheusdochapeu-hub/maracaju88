import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addPet,
  addPetRacaoPurchase,
  updatePetRacaoPurchase,
  deletePetRacaoPurchase,
  addPetAreiaPurchase,
  updatePetAreiaPurchase,
  deletePetAreiaPurchase,
  addPetBanho,
  updatePetBanho,
  deletePetBanho,
  addPetVacina,
  updatePetVacina,
  deletePetVacina,
  addPetVermifugo,
  updatePetVermifugo,
  deletePetVermifugo,
  addPetExame,
  updatePetExame,
  deletePetExame,
  addPetItem,
  updatePetItem,
  deletePetItem
} from '../js/pets.js';

function createInitialState() {
  const state = {
    pets: [
      {
        id: 'pet_mandioca',
        nome: 'Mandioca',
        especie: 'cachorro',
        raca: 'Golden Retriever',
        pesoKg: 32,
        dataNascimento: '2023-01-10',
        racao: [],
        areia: [],
        higiene: [],
        vacinas: [],
        vermifugos: [],
        exames: [],
        itens: []
      },
      {
        id: 'pet_sagu',
        nome: 'Sagu',
        especie: 'gato',
        raca: 'Frajola',
        pesoKg: 4.5,
        dataNascimento: '2024-03-15',
        racao: [],
        areia: [],
        higiene: [],
        vacinas: [],
        vermifugos: [],
        exames: [],
        itens: []
      }
    ]
  };
  return state;
}

test('Edição de compra de Ração atualiza dados, recalcula duração e suporta troca de pet', () => {
  const state = createInitialState();
  const entry = addPetRacaoPurchase(state, 'pet_mandioca', {
    dataCompra: '2026-10-15',
    marca: 'Premier',
    quantidadeKg: 15,
    consumoDiarioGramas: 250,
    duracaoDiasEstimada: 60,
    valor: 250.0,
    notas: 'Saco grande'
  });

  assert.equal(entry.marca, 'Premier');
  assert.equal(entry.duracaoDias, 60);

  // Atualiza ração com novos valores
  const updated = updatePetRacaoPurchase(state, 'pet_mandioca', entry.id, {
    marca: 'Golden Especial',
    quantidadeKg: 20,
    consumoDiarioG: 250,
    duracaoDias: 80,
    valor: 280.0,
    notas: 'Promoção Cobasi'
  });

  assert.equal(updated.marca, 'Golden Especial');
  assert.equal(updated.quantidadeKg, 20);
  assert.equal(updated.duracaoDias, 80);
  assert.equal(updated.valor, 280.0);
  assert.equal(updated.notas, 'Promoção Cobasi');

  // Reatribui para o Sagu
  updatePetRacaoPurchase(state, 'pet_mandioca', entry.id, {
    petId: 'pet_sagu'
  });

  assert.equal(state.pets[0].racao.length, 0);
  assert.equal(state.pets[1].racao.length, 1);
  assert.equal(state.pets[1].racao[0].id, entry.id);
});

test('Edição de compra de Areia atualiza dados e suporta troca de pet', () => {
  const state = createInitialState();
  const entry = addPetAreiaPurchase(state, 'pet_sagu', {
    dataCompra: '2026-10-20',
    marca: 'Pipicat',
    quantidadeKg: 4,
    duracaoDiasEstimada: 20,
    valor: 35.0,
    notas: 'Granulado fino'
  });

  const updated = updatePetAreiaPurchase(state, 'pet_sagu', entry.id, {
    marca: 'Viva Verde',
    quantidadeKg: 8,
    duracaoDias: 40,
    valor: 90.0,
    notas: 'Areia biodegradável'
  });

  assert.equal(updated.marca, 'Viva Verde');
  assert.equal(updated.quantidadeKg, 8);
  assert.equal(updated.duracaoDias, 40);
  assert.equal(updated.valor, 90.0);
  assert.equal(updated.notas, 'Areia biodegradável');
});

test('Edição de Banho & Higiene atualiza dados e local', () => {
  const state = createInitialState();
  const entry = addPetBanho(state, 'pet_mandioca', {
    data: '2026-10-25',
    tipo: 'casa',
    local: 'Em Casa',
    valor: 0,
    notas: 'Banho tranquilo com shampoo neutro'
  });

  const updated = updatePetBanho(state, 'pet_mandioca', entry.id, {
    tipo: 'petshop',
    local: 'Pet Shop Bicho Mimado',
    valor: 85.0,
    tosa: true,
    notas: 'Banho com tosa higiênica e corte de unhas'
  });

  assert.equal(updated.tipo, 'petshop');
  assert.equal(updated.local, 'Pet Shop Bicho Mimado');
  assert.equal(updated.valor, 85.0);
  assert.equal(updated.tosa, true);
});

test('Edição de Vacina atualiza nome, datas e recalcula status de imunização', () => {
  const state = createInitialState();
  const entry = addPetVacina(state, 'pet_mandioca', {
    tipoVacina: 'V8',
    dataAplicacao: '2026-05-10',
    proximaData: '2027-05-10',
    lote: 'L-123',
    clinica: 'Vet Center',
    notas: 'Sem reações'
  });

  const updated = updatePetVacina(state, 'pet_mandioca', entry.id, {
    vacina: 'V10 (Décupla Canina)',
    dataAplicacao: '2026-06-15',
    dataProximaDose: '2027-06-15',
    lote: 'L-999',
    clinica: 'Hospital Veterinário',
    notas: 'Dose completa reforçada'
  });

  assert.equal(updated.vacina, 'V10 (Décupla Canina)');
  assert.equal(updated.dataAplicacao, '2026-06-15');
  assert.equal(updated.dataProximaDose, '2027-06-15');
  assert.equal(updated.lote, 'L-999');
  // Adiciona antirrábica para deixar a carteira 100% em dia
  addPetVacina(state, 'pet_mandioca', {
    tipoVacina: 'Antirrábica',
    dataAplicacao: '2026-06-15',
    proximaData: '2027-06-15',
    lote: 'L-RAB',
    clinica: 'Hospital Veterinário'
  });
  assert.equal(state.pets[0].vacinacaoEmDia, true);
});

test('Edição de Vermífugo atualiza dose e peso do animal', () => {
  const state = createInitialState();
  const entry = addPetVermifugo(state, 'pet_mandioca', {
    medicamento: 'Vermífugo Amplo Espectro',
    dataAplicacao: '2026-08-01',
    pesoKg: 30,
    dose: '3 comprimidos',
    proximaData: '2027-02-01',
    notas: 'Tomou bem'
  });

  const updated = updatePetVermifugo(state, 'pet_mandioca', entry.id, {
    nome: 'Drontal Plus',
    pesoAnimalKg: 32,
    dose: '3 e 1/2 comprimidos',
    notas: 'Tomou com sachê'
  });

  assert.equal(updated.nome, 'Drontal Plus');
  assert.equal(updated.pesoAnimalKg, 32);
  assert.equal(updated.dose, '3 e 1/2 comprimidos');
  assert.equal(updated.notas, 'Tomou com sachê');
});

test('Edição de Consulta / Exame atualiza laudo, pendências e fotos', () => {
  const state = createInitialState();
  const entry = addPetExame(state, 'pet_mandioca', {
    data: '2026-09-10',
    tipo: 'Consulta de Rotina',
    clinica: 'Vet Mais',
    veterinario: 'Dra. Paula',
    descricao: 'Checkup anual geral',
    pendencias: 'Nenhuma'
  });

  const updated = updatePetExame(state, 'pet_mandioca', entry.id, {
    tipo: 'Exame de Sangue (Hemograma)',
    descricao: 'Hemograma completo com dosagem de plaquetas',
    pendencias: 'Retorno em 10 dias com resultados',
    fotos: ['data:image/png;base64,sample1', 'data:image/png;base64,sample2']
  });

  assert.equal(updated.tipo, 'Exame de Sangue (Hemograma)');
  assert.equal(updated.descricao, 'Hemograma completo com dosagem de plaquetas');
  assert.equal(updated.pendencias, 'Retorno em 10 dias com resultados');
  assert.equal(updated.fotos.length, 2);
});

test('Edição de Item / Acessório atualiza valor, loja e fotos', () => {
  const state = createInitialState();
  const entry = addPetItem(state, 'pet_mandioca', {
    nome: 'Comedouro Inox',
    tipo: 'comedouro',
    dataCompra: '2026-10-01',
    valor: 45.0,
    loja: 'Cobasi',
    observacoes: 'Tamanho G'
  });

  const updated = updatePetItem(state, 'pet_mandioca', entry.id, {
    nome: 'Comedouro Elevado Inox Duplo',
    valor: 95.0,
    observacoes: 'Ajustável para postura ergonômica',
    fotos: ['data:image/png;base64,comedouro']
  });

  assert.equal(updated.nome, 'Comedouro Elevado Inox Duplo');
  assert.equal(updated.valor, 95.0);
  assert.equal(updated.observacoes, 'Ajustável para postura ergonômica');
  assert.equal(updated.fotos.length, 1);
});
