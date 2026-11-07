import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  calculatePetAge,
  addDaysToDateStr,
  diffDaysBetweenDates,
  formatPetDoseVermifugo,
  getPetRacaoStatus,
  getPetAreiaStatus,
  getPetHigieneStatus,
  getPetVaccinesStatus,
  getPetSummary,
  addPet,
  updatePet,
  deletePet,
  addPetPhoto,
  removePetPhoto,
  addPetRacaoPurchase,
  deletePetRacaoPurchase,
  addPetAreiaPurchase,
  deletePetAreiaPurchase,
  addPetBanho,
  deletePetBanho,
  addPetVacina,
  deletePetVacina,
  addPetVermifugo,
  deletePetVermifugo,
  addPetExame,
  deletePetExame
} from '../js/pets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Pets: Cálculo de Idade do Pet em Anos e Meses', () => {
  // Cenário 1: Pet com mais de 3 anos (ex: Mandioca)
  const age1 = calculatePetAge('2022-04-10', '2026-11-06');
  assert.equal(age1, '4 anos e 6 meses');

  // Cenário 2: Filhote com menos de 1 ano
  const age2 = calculatePetAge('2026-03-06', '2026-11-06');
  assert.equal(age2, '8 meses');

  // Cenário 3: Exatamente 1 ano
  const age3 = calculatePetAge('2025-11-06', '2026-11-06');
  assert.equal(age3, '1 ano');

  // Cenário 4: 1 ano e 1 mês
  const age4 = calculatePetAge('2025-10-06', '2026-11-06');
  assert.equal(age4, '1 ano e 1 mês');

  // Cenário 5: Recém-nascido
  const age5 = calculatePetAge('2026-11-05', '2026-11-06');
  assert.equal(age5, 'Recém-nascido');
});

test('Pets: Controle de Ração (Cálculo de Duração, Previsão da Próxima Compra e Alertas)', () => {
  const pet = {
    id: 'pet_mandioca',
    nome: 'Mandioca',
    especie: 'cachorro',
    pesoKg: 14.5,
    racao: [
      {
        id: 'r_1',
        dataCompra: '2026-10-15',
        marca: 'Premier',
        quantidadeKg: 15,
        consumoDiarioG: 250,
        duracaoDias: 60, // 15.000g / 250g = 60 dias
        dataPrevisaoFim: '2026-12-14'
      }
    ]
  };

  // Avalia em 06/11/2026 (compra foi 15/10/2026, 22 dias passados, restam 38 dias)
  const status1 = getPetRacaoStatus(pet, '2026-11-06');
  assert.equal(status1.hasData, true);
  assert.equal(status1.status, 'ok');
  assert.ok(status1.diasRestantes > 30);
  assert.equal(status1.dataPrevisaoFim, '2026-12-14');

  // Avalia próximo ao fim (08/12/2026 - restam 6 dias => alerta urgente)
  const status2 = getPetRacaoStatus(pet, '2026-12-08');
  assert.equal(status2.status, 'urgente');
  assert.equal(status2.badgeClass, 'warn');
  assert.ok(status2.badgeText.includes('Comprar Ração'));

  // Avalia após o fim (16/12/2026 => alerta crítico)
  const status3 = getPetRacaoStatus(pet, '2026-12-16');
  assert.equal(status3.status, 'critico');
  assert.equal(status3.badgeClass, 'danger');
  assert.ok(status3.badgeText.includes('acabou'));
});

test('Pets: Controle de Areia (Gatos - Data da Última Compra e Previsão da Próxima)', () => {
  const cat = {
    id: 'pet_gato_1',
    nome: 'Mingau',
    especie: 'gato',
    areia: [
      {
        id: 'a_1',
        dataCompra: '2026-10-20',
        marca: 'Viva Verde',
        quantidadeKg: 4,
        duracaoDias: 25,
        dataPrevisaoFim: '2026-11-14'
      }
    ]
  };

  const status = getPetAreiaStatus(cat, '2026-11-06');
  assert.equal(status.hasData, true);
  assert.equal(status.dataUltimaCompra, '2026-10-20');
  assert.equal(status.dataProximaCompra, '2026-11-14');
  assert.equal(status.diasRestantes, 8);
  assert.equal(status.badgeClass, 'ok');
});

test('Pets: Higiene da Mandioca (Banhos em Casa ou Pet Shop)', () => {
  const pet = {
    id: 'pet_mandioca',
    nome: 'Mandioca',
    especie: 'cachorro',
    higiene: [
      {
        id: 'b_1',
        data: '2026-10-28',
        tipo: 'petshop',
        local: 'Pet Shop Bicho Mimado',
        valor: 75.00
      },
      {
        id: 'b_2',
        data: '2026-10-12',
        tipo: 'casa',
        local: 'Em Casa',
        valor: 0
      }
    ]
  };

  const status = getPetHigieneStatus(pet, '2026-11-06');
  assert.equal(status.hasData, true);
  assert.equal(status.ultimoBanho.tipo, 'petshop');
  assert.equal(status.diasDesdeUltimo, 9);
  assert.ok(status.badgeText.includes('Pet Shop Bicho Mimado'));
});

test('Pets: Vacinações e Vermifugação (V10 para cão, V4 para gato, Antirrábica e dose por peso)', () => {
  // Teste de cálculo de dose por peso
  assert.equal(formatPetDoseVermifugo(5), '1/2 comprimido (base: 10 kg)');
  assert.equal(formatPetDoseVermifugo(10), '1 comprimido (base: 10 kg)');
  assert.equal(formatPetDoseVermifugo(14.5), '1 e 1/2 comprimido (base: 10 kg)');
  assert.equal(formatPetDoseVermifugo(20), '2 comprimidos (base: 10 kg)');

  // Cachorro com V10 e Antirrábica em dia
  const dog = {
    id: 'pet_mandioca',
    nome: 'Mandioca',
    especie: 'cachorro',
    vacinas: [
      { id: 'v1', vacina: 'V10 (Décupla Canina)', dataAplicacao: '2026-05-10', dataProximaDose: '2027-05-10' },
      { id: 'v2', vacina: 'Antirrábica', dataAplicacao: '2026-05-10', dataProximaDose: '2027-05-10' }
    ]
  };
  const dogStatus = getPetVaccinesStatus(dog, '2026-11-06');
  assert.equal(dogStatus.emDia, true);
  assert.equal(dogStatus.badgeClass, 'ok');

  // Gato sem V4 (apenas antirrábica)
  const cat = {
    id: 'pet_gato_1',
    nome: 'Mingau',
    especie: 'gato',
    vacinas: [
      { id: 'v3', vacina: 'Antirrábica', dataAplicacao: '2026-05-10', dataProximaDose: '2027-05-10' }
    ]
  };
  const catStatus = getPetVaccinesStatus(cat, '2026-11-06');
  assert.equal(catStatus.emDia, false);
  assert.ok(catStatus.pendencias.some(p => p.includes('V4')));
});

test('Pets: CRUD Completo de Pet e Sub-registros (Ração, Areia, Banho, Vacina, Vermífugo e Exame)', () => {
  const state = { pets: [] };

  // Adicionar Pet
  const mandioca = addPet(state, {
    nome: 'Mandioca',
    especie: 'cachorro',
    dataNascimento: '2022-04-10',
    apelido: 'Dioca',
    sexo: 'femea',
    raca: 'Vira-lata (SRD)',
    pesoKg: 14.5
  });

  assert.equal(state.pets.length, 1);
  assert.equal(mandioca.nome, 'Mandioca');
  assert.equal(mandioca.pesoKg, 14.5);

  // Adicionar Ração
  const racao = addPetRacaoPurchase(state, mandioca.id, {
    dataCompra: '2026-10-15',
    marca: 'Premier Raças',
    quantidadeKg: 15,
    consumoDiarioG: 250
  });
  assert.equal(mandioca.racao.length, 1);
  assert.equal(racao.duracaoDias, 60);

  // Adicionar Banho
  const banho = addPetBanho(state, mandioca.id, {
    data: '2026-11-01',
    tipo: 'casa',
    notas: 'Banho no quintal'
  });
  assert.equal(mandioca.higiene.length, 1);
  assert.equal(banho.tipo, 'casa');

  // Adicionar Vacina
  const vacina = addPetVacina(state, mandioca.id, {
    vacina: 'V10',
    dataAplicacao: '2026-06-01'
  });
  assert.equal(mandioca.vacinas.length, 1);
  assert.equal(vacina.dataProximaDose, '2027-06-01');

  // Adicionar Vermífugo
  const verm = addPetVermifugo(state, mandioca.id, {
    dataAplicacao: '2026-08-01',
    nome: 'Ivermectina'
  });
  assert.equal(mandioca.vermifugos.length, 1);
  assert.equal(verm.dose, '1 e 1/2 comprimido (base: 10 kg)');

  // Adicionar Exame
  const exame = addPetExame(state, mandioca.id, {
    tipo: 'Exame de Sangue',
    clinica: 'VetCare',
    descricao: 'Hemograma completo',
    pendencias: 'Retorno em 15 dias'
  });
  assert.equal(mandioca.exames.length, 1);
  assert.equal(exame.pendencias, 'Retorno em 15 dias');

  // Atualizar Pet
  updatePet(state, mandioca.id, { pesoKg: 15.0, apelido: 'Mandi' });
  assert.equal(mandioca.pesoKg, 15.0);
  assert.equal(mandioca.apelido, 'Mandi');

  // Excluir Pet
  const deleted = deletePet(state, mandioca.id);
  assert.equal(deleted.id, mandioca.id);
  assert.equal(state.pets.length, 0);
});

test('Pets: Foto Adicionada vira Avatar do Pet e Getters de Categorias funcionam com/sem filtro', async () => {
  const state = { pets: [] };

  // Adiciona pet com photoUrl inicial
  const pet = addPet(state, {
    nome: 'Mandioca',
    especie: 'cachorro',
    dataNascimento: '2023-01-10',
    photos: ['data:image/jpeg;base64,foto1']
  });

  assert.equal(pet.fotos.length, 1);
  assert.equal(pet.fotos[0], 'data:image/jpeg;base64,foto1');
  assert.equal(pet.photos[0], 'data:image/jpeg;base64,foto1');

  // Adiciona nova foto (unshift para virar a foto principal imediatamente)
  addPetPhoto(state, pet.id, 'data:image/jpeg;base64,foto_recente');
  assert.equal(pet.fotos[0], 'data:image/jpeg;base64,foto_recente');
  assert.equal(pet.photos[0], 'data:image/jpeg;base64,foto_recente');
  assert.equal(pet.fotos.length, 2);

  // Adiciona registros para testar os getters por categoria
  addPetRacaoPurchase(state, pet.id, {
    dataCompra: '2026-11-01',
    marca: 'Premier',
    quantidadeKg: 15
  });

  addPetBanho(state, pet.id, {
    data: '2026-11-03',
    tipo: 'pet_shop',
    local: 'Bicho Mimado',
    valor: 80
  });

  addPetVacina(state, pet.id, {
    vacina: 'V10',
    dataAplicacao: '2026-11-04'
  });

  // Getters consolidados (importados dinamicamente)
  const { getPetsRacaoList, getPetsHigieneList, getPetsVacinasList } = await import('../js/pets.js');
  const racaoList = getPetsRacaoList(state, pet.id);
  assert.equal(racaoList.length, 1);
  assert.equal(racaoList[0].petNome, 'Mandioca');
  assert.equal(racaoList[0].petFoto, 'data:image/jpeg;base64,foto_recente');

  const banhoList = getPetsHigieneList(state);
  assert.equal(banhoList.length, 1);
  assert.equal(banhoList[0].local, 'Bicho Mimado');

  const vacinasList = getPetsVacinasList(state, pet.id);
  assert.equal(vacinasList.length, 1);
  assert.equal(vacinasList[0].tipoVacina, 'V10');
});
