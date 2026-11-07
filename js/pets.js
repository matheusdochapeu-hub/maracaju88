// ============================================================
//  MARACAJU - MÓDULO DE PETS (Animais de Estimação da Família)
//  Cadastros, Idades, Ração, Areia, Higiene, Vacinas & Exames
// ============================================================

import { parseCurrency } from './currency.js';

/**
 * Calcula a idade do pet em anos e meses com precisão.
 * @param {string} birthDateStr Formato 'YYYY-MM-DD'
 * @param {Date|string} referenceDate Data de referência (padrão: hoje)
 * @returns {string} Ex: "3 anos e 2 meses", "8 meses", "1 ano"
 */
export function calculatePetAge(birthDateStr, referenceDate = new Date()) {
  if (!birthDateStr) return '';
  const birth = new Date(birthDateStr + 'T12:00:00');
  if (isNaN(birth.getTime())) return '';

  const now = referenceDate instanceof Date ? referenceDate : new Date(referenceDate + 'T12:00:00');
  if (isNaN(now.getTime())) return '';

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return 'Recém-nascido';

  if (years === 0) {
    if (months === 0) {
      const diffMs = now.getTime() - birth.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      if (diffDays <= 1) return 'Recém-nascido';
      return `${diffDays} dias`;
    }
    return months === 1 ? '1 mês' : `${months} meses`;
  }

  const yearStr = years === 1 ? '1 ano' : `${years} anos`;
  if (months === 0) return yearStr;
  const monthStr = months === 1 ? '1 mês' : `${months} meses`;
  return `${yearStr} e ${monthStr}`;
}

/**
 * Adiciona dias a uma data no formato 'YYYY-MM-DD'
 */
export function addDaysToDateStr(dateStr, days) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Math.round(Number(days) || 0));
  return d.toISOString().split('T')[0];
}

/**
 * Diferença de dias entre duas datas (targetDate - fromDate)
 */
export function diffDaysBetweenDates(targetDateStr, fromDate = new Date()) {
  if (!targetDateStr) return 0;
  const target = new Date(targetDateStr + 'T12:00:00');
  const from = fromDate instanceof Date ? fromDate : new Date(fromDate + 'T12:00:00');
  if (isNaN(target.getTime()) || isNaN(from.getTime())) return 0;
  const diffMs = target.getTime() - from.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formata dose recomendada de vermífugo com base no peso do animal
 */
export function formatPetDoseVermifugo(pesoKg) {
  const peso = parseFloat(pesoKg) || 0;
  if (peso <= 0) return 'Dose conforme orientação veterinária';

  // Regra padrão de mercado (1 comprimido para cada 10 kg)
  const doses = peso / 10;
  if (doses <= 0.25) return '1/4 de comprimido (base: 10 kg)';
  if (doses <= 0.5) return '1/2 comprimido (base: 10 kg)';
  if (doses <= 0.75) return '3/4 de comprimido (base: 10 kg)';
  if (doses <= 1.1) return '1 comprimido (base: 10 kg)';
  if (doses <= 1.6) return '1 e 1/2 comprimido (base: 10 kg)';
  if (doses <= 2.1) return '2 comprimidos (base: 10 kg)';
  return `${doses.toFixed(1)} comprimidos (base: 10 kg)`;
}

/**
 * Analisa o controle de ração do animal e calcula previsão e alertas
 */
export function getPetRacaoStatus(pet, referenceDate = new Date()) {
  if (!pet || !Array.isArray(pet.racao) || pet.racao.length === 0) {
    return {
      hasData: false,
      status: 'sem_registro',
      badgeText: 'Sem registro de ração',
      badgeClass: 'neutral',
      diasRestantes: 0,
      dataPrevisaoFim: null,
      ultimaCompra: null
    };
  }

  // Ordena compras por data decrescente
  const sorted = [...pet.racao].sort((a, b) => (b.dataCompra || '').localeCompare(a.dataCompra || ''));
  const lastPurchase = sorted[0];

  let duracaoDias = Number(lastPurchase.duracaoDias) || 0;
  if (duracaoDias <= 0 && lastPurchase.quantidadeKg && lastPurchase.consumoDiarioG) {
    duracaoDias = Math.round((Number(lastPurchase.quantidadeKg) * 1000) / Number(lastPurchase.consumoDiarioG));
  }
  if (duracaoDias <= 0) duracaoDias = 30; // fallback padrão

  const dataPrevisaoFim = lastPurchase.dataPrevisaoFim || addDaysToDateStr(lastPurchase.dataCompra, duracaoDias);
  const diasRestantes = diffDaysBetweenDates(dataPrevisaoFim, referenceDate);

  let status = 'ok';
  let badgeClass = 'ok';
  let badgeText = `Ração: restam ${diasRestantes} dias`;

  if (diasRestantes <= 0) {
    status = 'critico';
    badgeClass = 'danger';
    badgeText = `🚨 Ração acabou! (Previsão: ${formatDisplayDate(dataPrevisaoFim)})`;
  } else if (diasRestantes <= 7) {
    status = 'urgente';
    badgeClass = 'warn';
    badgeText = `⚠️ Comprar Ração (${diasRestantes} dias restantes)`;
  } else {
    badgeText = `🥣 Ração: restam ${diasRestantes} dias (até ${formatDisplayDate(dataPrevisaoFim)})`;
  }

  return {
    hasData: true,
    status,
    badgeText,
    badgeClass,
    diasRestantes,
    dataPrevisaoFim,
    duracaoDias,
    ultimaCompra: lastPurchase
  };
}

/**
 * Analisa o controle de areia sanitária (gatos)
 */
export function getPetAreiaStatus(pet, referenceDate = new Date()) {
  if (!pet || !Array.isArray(pet.areia) || pet.areia.length === 0) {
    return {
      hasData: false,
      status: 'sem_registro',
      badgeText: 'Sem registro de areia',
      badgeClass: 'neutral',
      dataUltimaCompra: null,
      dataProximaCompra: null
    };
  }

  const sorted = [...pet.areia].sort((a, b) => (b.dataCompra || '').localeCompare(a.dataCompra || ''));
  const lastPurchase = sorted[0];

  // Calcula intervalo médio se houver mais de uma compra
  let duracaoDias = Number(lastPurchase.duracaoDias) || 0;
  if (duracaoDias <= 0 && sorted.length >= 2) {
    const d1 = new Date(sorted[0].dataCompra + 'T12:00:00');
    const d2 = new Date(sorted[1].dataCompra + 'T12:00:00');
    const diff = Math.round(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    if (diff > 5 && diff < 120) duracaoDias = diff;
  }
  if (duracaoDias <= 0) duracaoDias = 25; // 25 dias padrão para saco de areia

  const dataProximaCompra = lastPurchase.dataPrevisaoFim || addDaysToDateStr(lastPurchase.dataCompra, duracaoDias);
  const diasRestantes = diffDaysBetweenDates(dataProximaCompra, referenceDate);

  let badgeClass = 'ok';
  let badgeText = `🏖️ Areia: restam ${diasRestantes} dias`;
  let status = 'ok';

  if (diasRestantes <= 0) {
    status = 'critico';
    badgeClass = 'danger';
    badgeText = `🚨 Areia esgotando! (Previsão: ${formatDisplayDate(dataProximaCompra)})`;
  } else if (diasRestantes <= 5) {
    status = 'urgente';
    badgeClass = 'warn';
    badgeText = `⚠️ Comprar Areia (${diasRestantes} dias restantes)`;
  }

  return {
    hasData: true,
    status,
    badgeText,
    badgeClass,
    diasRestantes,
    dataUltimaCompra: lastPurchase.dataCompra,
    dataProximaCompra,
    ultimaCompra: lastPurchase
  };
}

/**
 * Analisa o histórico de banhos do pet (especialmente para a Mandioca)
 */
export function getPetHigieneStatus(pet, referenceDate = new Date()) {
  if (!pet || !Array.isArray(pet.higiene) || pet.higiene.length === 0) {
    return {
      hasData: false,
      ultimoBanho: null,
      diasDesdeUltimo: 0,
      badgeText: 'Nenhum banho registrado',
      badgeClass: 'neutral'
    };
  }

  const sorted = [...pet.higiene].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
  const ultimo = sorted[0];
  const diasDesde = -diffDaysBetweenDates(ultimo.data, referenceDate);

  const localStr = ultimo.tipo === 'casa' ? 'Em Casa 🏠' : (ultimo.local || 'Pet Shop 🛁');
  const badgeText = diasDesde === 0
    ? `🛁 Banho hoje (${localStr})`
    : `🛁 Último banho: há ${diasDesde} ${diasDesde === 1 ? 'dia' : 'dias'} (${localStr})`;

  const badgeClass = diasDesde > 25 ? 'warn' : 'ok';

  return {
    hasData: true,
    ultimoBanho: ultimo,
    diasDesdeUltimo: diasDesde,
    badgeText,
    badgeClass
  };
}

/**
 * Analisa o status vacinal do animal (V10 para cães, V4 para gatos e Antirrábica)
 */
export function getPetVaccinesStatus(pet, referenceDate = new Date()) {
  const vacinas = Array.isArray(pet.vacinas) ? pet.vacinas : [];
  const vermifugos = Array.isArray(pet.vermifugos) ? pet.vermifugos : [];

  if (vacinas.length === 0) {
    return {
      emDia: false,
      badgeText: '⚠️ Vacinas Pendentes',
      badgeClass: 'warn',
      pendencias: ['Nenhuma vacina registrada']
    };
  }

  const pendencias = [];
  const isCachorro = (pet.especie || 'cachorro').toLowerCase() === 'cachorro';
  const vacinaObrigatoria = isCachorro ? 'V10' : 'V4';

  // Verifica vacina múltipla (V10 / V8 ou V4 / V5)
  const temMultipla = vacinas.find(v => {
    const nome = (v.vacina || '').toUpperCase();
    return isCachorro ? (nome.includes('V10') || nome.includes('V8')) : (nome.includes('V4') || nome.includes('V5') || nome.includes('V3'));
  });

  // Verifica antirrábica
  const temAntirrabica = vacinas.find(v => {
    const nome = (v.vacina || '').toLowerCase();
    return nome.includes('antir') || nome.includes('raiva') || nome.includes('rabica');
  });

  if (!temMultipla) {
    pendencias.push(`Falta vacina ${vacinaObrigatoria}`);
  } else if (temMultipla.dataProximaDose && diffDaysBetweenDates(temMultipla.dataProximaDose, referenceDate) < 0) {
    pendencias.push(`${vacinaObrigatoria} vencida`);
  }

  if (!temAntirrabica) {
    pendencias.push('Falta vacina Antirrábica');
  } else if (temAntirrabica.dataProximaDose && diffDaysBetweenDates(temAntirrabica.dataProximaDose, referenceDate) < 0) {
    pendencias.push('Antirrábica vencida');
  }

  const emDia = pendencias.length === 0;

  return {
    emDia,
    badgeText: emDia ? '✓ Vacinas em Dia' : `⚠️ ${pendencias.join(', ')}`,
    badgeClass: emDia ? 'ok' : 'warn',
    pendencias,
    totalVacinas: vacinas.length,
    totalVermifugos: vermifugos.length
  };
}

/**
 * Retorna o sumário consolidado de um Pet
 */
export function getPetSummary(pet, referenceDate = new Date()) {
  const idade = calculatePetAge(pet.dataNascimento, referenceDate);
  const racao = getPetRacaoStatus(pet, referenceDate);
  const areia = getPetAreiaStatus(pet, referenceDate);
  const higiene = getPetHigieneStatus(pet, referenceDate);
  const vacinas = getPetVaccinesStatus(pet, referenceDate);

  return {
    id: pet.id,
    nome: pet.nome,
    idade,
    racao,
    areia,
    higiene,
    vacinas,
    examesCount: (pet.exames || []).length
  };
}

/**
 * Cria um novo pet no estado
 */
export function addPet(state, data) {
  if (!state.pets) state.pets = [];
  const nome = (data.nome || '').trim();
  if (!nome) throw new Error('O nome do pet é obrigatório.');

  const fotos = Array.isArray(data.fotos) && data.fotos.length > 0
    ? [...data.fotos]
    : (Array.isArray(data.photos) && data.photos.length > 0
      ? [...data.photos]
      : (data.foto ? [data.foto] : (data.photo ? [data.photo] : [])));

  const pesoKg = parseFloat(data.pesoKg !== undefined ? data.pesoKg : data.peso) || 0;

  const newPet = {
    id: `pet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nome,
    especie: (data.especie || 'cachorro').toLowerCase(),
    dataNascimento: data.dataNascimento || '',
    apelido: (data.apelido || '').trim(),
    sexo: (data.sexo || 'femea').toLowerCase(),
    raca: (data.raca || 'SRD').trim(),
    pesoKg,
    vacinacaoEmDia: data.vacinacaoEmDia !== false,
    fotos,
    photos: fotos,
    observacoes: (data.observacoes || '').trim(),
    racao: [],
    areia: [],
    higiene: [],
    vacinas: [],
    vermifugos: [],
    exames: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.pets.push(newPet);
  return newPet;
}

/**
 * Atualiza os dados cadastrais de um pet
 */
export function updatePet(state, petId, data) {
  if (!state.pets) state.pets = [];
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');

  if (data.nome !== undefined) {
    const nome = data.nome.trim();
    if (!nome) throw new Error('O nome do pet é obrigatório.');
    pet.nome = nome;
  }
  if (data.especie !== undefined) pet.especie = data.especie.toLowerCase();
  if (data.dataNascimento !== undefined) pet.dataNascimento = data.dataNascimento;
  if (data.apelido !== undefined) pet.apelido = data.apelido.trim();
  if (data.sexo !== undefined) pet.sexo = data.sexo.toLowerCase();
  if (data.raca !== undefined) pet.raca = data.raca.trim();
  if (data.pesoKg !== undefined || data.peso !== undefined) {
    pet.pesoKg = parseFloat(data.pesoKg !== undefined ? data.pesoKg : data.peso) || 0;
  }
  if (data.vacinacaoEmDia !== undefined) pet.vacinacaoEmDia = !!data.vacinacaoEmDia;
  if (data.observacoes !== undefined) pet.observacoes = data.observacoes.trim();

  const newFotos = Array.isArray(data.fotos)
    ? [...data.fotos]
    : (Array.isArray(data.photos)
      ? [...data.photos]
      : (data.foto ? [data.foto] : (data.photo ? [data.photo] : null)));
  if (newFotos !== null) {
    pet.fotos = newFotos;
    pet.photos = newFotos;
  }

  pet.updatedAt = new Date().toISOString();
  return pet;
}

/**
 * Exclui um pet do estado
 */
export function deletePet(state, petId) {
  if (!state.pets) return null;
  const idx = state.pets.findIndex(p => p.id === petId);
  if (idx !== -1) {
    return state.pets.splice(idx, 1)[0];
  }
  return null;
}

/**
 * Adiciona uma foto ao pet (coloca no início para ser o avatar ativo)
 */
export function addPetPhoto(state, petId, photoDataUrl) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.fotos) pet.fotos = [];
  pet.fotos.unshift(photoDataUrl);
  pet.photos = pet.fotos;
  pet.updatedAt = new Date().toISOString();
  return pet;
}

/**
 * Remove uma foto do pet
 */
export function removePetPhoto(state, petId, photoIdx) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.fotos) return false;
  if (photoIdx >= 0 && photoIdx < pet.fotos.length) {
    pet.fotos.splice(photoIdx, 1);
    pet.photos = pet.fotos;
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// OPERAÇÕES DE SUB-REGISTROS (Ração, Areia, Higiene, Vacinas, Exames)
// -------------------------------------------------------------

export function addPetRacaoPurchase(state, petId, racaoData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.racao) pet.racao = [];

  const quantidadeKg = parseFloat(racaoData.quantidadeKg) || 0;
  const consumoDiarioG = parseFloat(racaoData.consumoDiarioG) || 0;
  let duracaoDias = parseInt(racaoData.duracaoDias, 10) || 0;

  if (duracaoDias <= 0 && quantidadeKg > 0 && consumoDiarioG > 0) {
    duracaoDias = Math.round((quantidadeKg * 1000) / consumoDiarioG);
  }
  if (duracaoDias <= 0) duracaoDias = 30;

  const dataCompra = racaoData.dataCompra || new Date().toISOString().split('T')[0];
  const dataPrevisaoFim = racaoData.dataPrevisaoFim || addDaysToDateStr(dataCompra, duracaoDias);

  const entry = {
    id: `racao_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    dataCompra,
    marca: (racaoData.marca || '').trim() || 'Ração Padrão',
    quantidadeKg,
    consumoDiarioG,
    duracaoDias,
    dataPrevisaoFim,
    valor: parseCurrency(racaoData.valor || 0),
    notas: (racaoData.notas || '').trim(),
    createdAt: new Date().toISOString()
  };

  pet.racao.unshift(entry);
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetRacaoPurchase(state, petId, racaoId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.racao) return false;
  const idx = pet.racao.findIndex(r => r.id === racaoId);
  if (idx !== -1) {
    pet.racao.splice(idx, 1);
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function addPetAreiaPurchase(state, petId, areiaData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.areia) pet.areia = [];

  const duracaoDias = parseInt(areiaData.duracaoDias, 10) || 25;
  const dataCompra = areiaData.dataCompra || new Date().toISOString().split('T')[0];
  const dataPrevisaoFim = areiaData.dataPrevisaoFim || addDaysToDateStr(dataCompra, duracaoDias);

  const entry = {
    id: `areia_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    dataCompra,
    marca: (areiaData.marca || '').trim() || 'Areia Higiênica',
    quantidadeKg: parseFloat(areiaData.quantidadeKg) || 0,
    duracaoDias,
    dataPrevisaoFim,
    valor: parseCurrency(areiaData.valor || 0),
    notas: (areiaData.notas || '').trim(),
    createdAt: new Date().toISOString()
  };

  pet.areia.unshift(entry);
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetAreiaPurchase(state, petId, areiaId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.areia) return false;
  const idx = pet.areia.findIndex(a => a.id === areiaId);
  if (idx !== -1) {
    pet.areia.splice(idx, 1);
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function addPetBanho(state, petId, banhoData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.higiene) pet.higiene = [];

  const entry = {
    id: `banho_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    data: banhoData.data || new Date().toISOString().split('T')[0],
    tipo: banhoData.tipo === 'petshop' ? 'petshop' : 'casa',
    local: (banhoData.local || '').trim() || (banhoData.tipo === 'petshop' ? 'Pet Shop' : 'Em Casa'),
    valor: parseCurrency(banhoData.valor || 0),
    notas: (banhoData.notas || '').trim(),
    createdAt: new Date().toISOString()
  };

  pet.higiene.unshift(entry);
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetBanho(state, petId, banhoId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.higiene) return false;
  const idx = pet.higiene.findIndex(h => h.id === banhoId);
  if (idx !== -1) {
    pet.higiene.splice(idx, 1);
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function addPetVacina(state, petId, vacinaData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.vacinas) pet.vacinas = [];

  const vacinaNome = (vacinaData.vacina || vacinaData.nome || vacinaData.tipoVacina || '').trim();
  if (!vacinaNome) throw new Error('Informe o nome da vacina.');

  const dataAplicacao = vacinaData.dataAplicacao || new Date().toISOString().split('T')[0];
  // Vacinas são anuais por padrão (1 ano após aplicação)
  const dataProximaDose = vacinaData.dataProximaDose || addDaysToDateStr(dataAplicacao, 365);

  const entry = {
    id: `vac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    vacina: vacinaNome,
    tipoVacina: vacinaNome,
    nome: vacinaNome,
    dataAplicacao,
    dataProximaDose,
    lote: (vacinaData.lote || '').trim(),
    clinica: (vacinaData.clinica || '').trim(),
    veterinario: (vacinaData.veterinario || '').trim(),
    notas: (vacinaData.notas || '').trim(),
    createdAt: new Date().toISOString()
  };

  pet.vacinas.unshift(entry);
  // Atualiza flag vacinacaoEmDia
  pet.vacinacaoEmDia = getPetVaccinesStatus(pet).emDia;
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetVacina(state, petId, vacinaId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.vacinas) return false;
  const idx = pet.vacinas.findIndex(v => v.id === vacinaId);
  if (idx !== -1) {
    pet.vacinas.splice(idx, 1);
    pet.vacinacaoEmDia = getPetVaccinesStatus(pet).emDia;
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function addPetVermifugo(state, petId, vermifugoData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.vermifugos) pet.vermifugos = [];

  const dataAplicacao = vermifugoData.dataAplicacao || new Date().toISOString().split('T')[0];
  const intervaloDias = parseInt(vermifugoData.intervaloDias, 10) || 180; // semestral por padrão
  const dataProximaDose = vermifugoData.dataProximaDose || addDaysToDateStr(dataAplicacao, intervaloDias);
  const pesoAnimalKg = parseFloat(vermifugoData.pesoAnimalKg || pet.pesoKg) || 0;

  const entry = {
    id: `verm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nome: (vermifugoData.nome || 'Vermífugo Amplo Espectro / Ivermectina').trim(),
    dataAplicacao,
    dataProximaDose,
    pesoAnimalKg,
    dose: (vermifugoData.dose || formatPetDoseVermifugo(pesoAnimalKg)).trim(),
    notas: (vermifugoData.notas || '').trim(),
    createdAt: new Date().toISOString()
  };

  pet.vermifugos.unshift(entry);
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetVermifugo(state, petId, vermifugoId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.vermifugos) return false;
  const idx = pet.vermifugos.findIndex(v => v.id === vermifugoId);
  if (idx !== -1) {
    pet.vermifugos.splice(idx, 1);
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export function addPetExame(state, petId, exameData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.exames) pet.exames = [];

  const entry = {
    id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    data: exameData.data || new Date().toISOString().split('T')[0],
    tipo: (exameData.tipo || 'Consulta Veterinária').trim(),
    clinica: (exameData.clinica || '').trim(),
    veterinario: (exameData.veterinario || '').trim(),
    descricao: (exameData.descricao || '').trim(),
    pendencias: (exameData.pendencias || '').trim(),
    fotos: Array.isArray(exameData.fotos) ? exameData.fotos : [],
    createdAt: new Date().toISOString()
  };

  pet.exames.unshift(entry);
  pet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetExame(state, petId, exameId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !pet.exames) return false;
  const idx = pet.exames.findIndex(e => e.id === exameId);
  if (idx !== -1) {
    pet.exames.splice(idx, 1);
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// -------------------------------------------------------------
// GETTERS CONSOLIDADOS POR CATEGORIA (com ou sem filtro de Pet)
// -------------------------------------------------------------

export function getPetsRacaoList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.racao || []).forEach(r => {
      list.push({ ...r, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.dataCompra || '').localeCompare(a.dataCompra || ''));
}

export function getPetsAreiaList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.areia || []).forEach(a => {
      list.push({ ...a, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.dataCompra || '').localeCompare(a.dataCompra || ''));
}

export function getPetsHigieneList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.higiene || []).forEach(h => {
      list.push({ ...h, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

export function getPetsVacinasList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.vacinas || []).forEach(v => {
      list.push({ ...v, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.dataAplicacao || '').localeCompare(a.dataAplicacao || ''));
}

export function getPetsVermifugosList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.vermifugos || []).forEach(v => {
      list.push({ ...v, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.dataAplicacao || '').localeCompare(a.dataAplicacao || ''));
}

export function getPetsExamesList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(pet => {
    (pet.exames || []).forEach(e => {
      list.push({ ...e, petId: pet.id, petNome: pet.nome, petEspecie: pet.especie, petFoto: (pet.fotos && pet.fotos[0]) || (pet.photos && pet.photos[0]) || null });
    });
  });
  return list.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}
