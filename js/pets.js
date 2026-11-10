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
  // Formata pelos componentes locais: toISOString() converte para UTC e pode
  // devolver o dia anterior em fusos positivos (ex: UTC+13).
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    itens: [],
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
/**
 * Exclui um pet do estado registrando o ID na lista de excluídos para evitar
 * ressurreição ao sincronizar com backup antigo da nuvem.
 */
export function deletePet(state, petId) {
  if (!state.pets) return null;
  state.deletedPetIds = Array.isArray(state.deletedPetIds) ? state.deletedPetIds : [];
  if (!state.deletedPetIds.includes(petId)) {
    state.deletedPetIds.push(petId);
  }
  const idx = state.pets.findIndex(p => p.id === petId);
  if (idx !== -1) {
    const deleted = state.pets.splice(idx, 1)[0];
    if (typeof localStorage !== 'undefined' && deleted) {
      try {
        localStorage.removeItem('MARACAJU_PET_AVATAR_' + deleted.id);
      } catch (e) {}
    }
    return deleted;
  }
  return null;
}

/**
 * Retorna o data URL da foto/avatar do pet consultando as propriedades do objeto
 * e com fallback direto ao armazenamento local persistente.
 */
export function getPetAvatarUrl(pet) {
  if (!pet) return null;
  const direct = (Array.isArray(pet.fotos) && pet.fotos.length > 0 && pet.fotos[0]) ||
                 (Array.isArray(pet.photos) && pet.photos.length > 0 && pet.photos[0]) ||
                 pet.foto || pet.photo || pet.photoUrl;
  if (direct) return direct;

  if (typeof localStorage !== 'undefined') {
    try {
      if (pet.id) {
        const byId = localStorage.getItem('MARACAJU_PET_AVATAR_' + pet.id);
        if (byId) return byId;
      }
      if (pet.nome) {
        const byName = localStorage.getItem('MARACAJU_PET_AVATAR_' + pet.nome.trim().toLowerCase());
        if (byName) return byName;
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Adiciona uma foto ao pet (coloca no início para ser o avatar ativo) e garante
 * persistência no localStorage para nunca sumir em sincronizações com a nuvem.
 */
export function addPetPhoto(state, petId, photoDataUrl) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.fotos) pet.fotos = [];
  pet.fotos.unshift(photoDataUrl);
  pet.photos = pet.fotos;
  pet.foto = photoDataUrl;
  pet.photo = photoDataUrl;
  pet.photoUrl = photoDataUrl;
  pet.updatedAt = new Date().toISOString();

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('MARACAJU_PET_AVATAR_' + pet.id, photoDataUrl);
      if (pet.nome) {
        localStorage.setItem('MARACAJU_PET_AVATAR_' + pet.nome.trim().toLowerCase(), photoDataUrl);
      }
    } catch (e) {
      console.warn('[Pets] LocalStorage quota excedida ao salvar avatar:', e);
    }
  }
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
    if (pet.fotos.length === 0) {
      delete pet.foto;
      delete pet.photo;
      delete pet.photoUrl;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem('MARACAJU_PET_AVATAR_' + pet.id);
          if (pet.nome) localStorage.removeItem('MARACAJU_PET_AVATAR_' + pet.nome.trim().toLowerCase());
        } catch (e) {}
      }
    } else {
      pet.foto = pet.fotos[0];
      pet.photo = pet.fotos[0];
      pet.photoUrl = pet.fotos[0];
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('MARACAJU_PET_AVATAR_' + pet.id, pet.fotos[0]);
          if (pet.nome) localStorage.setItem('MARACAJU_PET_AVATAR_' + pet.nome.trim().toLowerCase(), pet.fotos[0]);
        } catch (e) {}
      }
    }
    pet.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
}

/**
 * Deduplica pets por espécie e nome normalizado (ex: duas "Mandiocas").
 * Mescla sub-registros (ração, banhos, vacinas, exames, itens) e fotos na ficha
 * primária e registra o ID secundário na lista de excluídos para bloquear ressurreição.
 */
export function deduplicatePets(state) {
  if (!state || !Array.isArray(state.pets)) return false;
  let changed = false;
  state.deletedPetIds = Array.isArray(state.deletedPetIds) ? state.deletedPetIds : [];

  const survivingPets = [];
  const grouped = new Map();
  state.pets.forEach(pet => {
    if (!pet) return;
    const petNome = (pet.nome || pet.name || '').trim().toLowerCase();
    if (!petNome) {
      survivingPets.push(pet);
      return;
    }
    const key = `${(pet.especie || 'cachorro').trim().toLowerCase()}__${petNome}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(pet);
  });

  for (const [, petGroup] of grouped.entries()) {
    if (petGroup.length === 1) {
      survivingPets.push(petGroup[0]);
      continue;
    }

    // Duplicidade identificada!
    changed = true;
    let primary = petGroup.find(p => p.id === 'pet_mandioca');
    if (!primary) {
      primary = petGroup.reduce((best, curr) => {
        const countRecords = (p) =>
          (p.racao?.length || 0) + (p.areia?.length || 0) + (p.higiene?.length || 0) +
          (p.vacinas?.length || 0) + (p.vermifugos?.length || 0) + (p.exames?.length || 0) +
          (p.itens?.length || 0);
        return countRecords(curr) > countRecords(best) ? curr : best;
      }, petGroup[0]);
    }

    petGroup.forEach(other => {
      if (other.id === primary.id) return;

      // Adiciona o outro ID aos excluídos para que nunca ressuscite
      if (!state.deletedPetIds.includes(other.id)) {
        state.deletedPetIds.push(other.id);
      }

      // Prioriza a data de nascimento real e apelido autêntico do usuário
      if (other.dataNascimento && (other.dataNascimento === '2019-11-15' || primary.dataNascimento === '2022-04-10')) {
        primary.dataNascimento = other.dataNascimento;
      }
      if (other.apelido && (other.apelido.toLowerCase().includes('boizin') || !primary.apelido)) {
        primary.apelido = other.apelido;
      }
      if (other.raca && (!primary.raca || primary.raca === 'SRD')) {
        primary.raca = other.raca;
      }
      if (other.pesoKg && !primary.pesoKg) {
        primary.pesoKg = other.pesoKg;
      }
      if (other.observacoes && !primary.observacoes) {
        primary.observacoes = other.observacoes;
      }

      // Mescla fotos
      const otherPhotos = [...(other.fotos || []), ...(other.photos || [])];
      if (otherPhotos.length > 0) {
        primary.fotos = primary.fotos || [];
        otherPhotos.forEach(ph => {
          if (ph && !primary.fotos.includes(ph)) primary.fotos.push(ph);
        });
        primary.photos = primary.fotos;
      }

      // Mescla sub-registros sem duplicar IDs
      ['racao', 'areia', 'higiene', 'vacinas', 'vermifugos', 'exames', 'itens'].forEach(recKey => {
        if (Array.isArray(other[recKey]) && other[recKey].length > 0) {
          primary[recKey] = Array.isArray(primary[recKey]) ? primary[recKey] : [];
          other[recKey].forEach(item => {
            if (!primary[recKey].some(existing => existing.id === item.id)) {
              item.petId = primary.id;
              primary[recKey].push(item);
            }
          });
        }
      });
    });

    survivingPets.push(primary);
  }

  // Remove pets marcados como excluídos
  const deletedSet = new Set(state.deletedPetIds);
  state.pets = survivingPets.filter(p => !deletedSet.has(p.id));

  // Restaura avatar do localStorage caso o pet esteja sem fotos locais
  state.pets.forEach(p => {
    if (!p.foto && !p.photo && (!p.fotos || p.fotos.length === 0) && (!p.photos || p.photos.length === 0)) {
      const stored = getPetAvatarUrl(p);
      if (stored) {
        p.fotos = [stored];
        p.photos = [stored];
        p.foto = stored;
        p.photo = stored;
        p.photoUrl = stored;
      }
    }
  });

  return changed;
}

// -------------------------------------------------------------
// OPERAÇÕES DE SUB-REGISTROS (Ração, Areia, Higiene, Vacinas, Exames)
// -------------------------------------------------------------

export function addPetRacaoPurchase(state, petId, racaoData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!pet.racao) pet.racao = [];

  const quantidadeKg = parseFloat(racaoData.quantidadeKg) || 0;
  const consumoDiarioG = racaoData.consumoDiarioG !== undefined ? parseFloat(racaoData.consumoDiarioG) : (racaoData.consumoDiarioGramas !== undefined ? parseFloat(racaoData.consumoDiarioGramas) : 0);
  let duracaoDias = racaoData.duracaoDias !== undefined ? parseInt(racaoData.duracaoDias, 10) : (racaoData.duracaoDiasEstimada !== undefined ? parseInt(racaoData.duracaoDiasEstimada, 10) : 0);

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


export function updatePetRacaoPurchase(state, petId, racaoId, racaoData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.racao || []).some(r => r.id === racaoId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.racao || []).find(r => r.id === racaoId);
  if (!entry) throw new Error('Lançamento de ração não encontrado.');

  const newPetId = racaoData.petId || petId;
  const quantidadeKg = racaoData.quantidadeKg !== undefined ? parseFloat(racaoData.quantidadeKg) || 0 : entry.quantidadeKg;
  const consumoDiarioG = racaoData.consumoDiarioG !== undefined ? parseFloat(racaoData.consumoDiarioG) : (racaoData.consumoDiarioGramas !== undefined ? parseFloat(racaoData.consumoDiarioGramas) : entry.consumoDiarioG);
  let duracaoDias = racaoData.duracaoDias !== undefined ? parseInt(racaoData.duracaoDias, 10) : (racaoData.duracaoDiasEstimada !== undefined ? parseInt(racaoData.duracaoDiasEstimada, 10) : entry.duracaoDias);

  if ((duracaoDias === undefined || duracaoDias <= 0) && quantidadeKg > 0 && consumoDiarioG > 0) {
    duracaoDias = Math.round((quantidadeKg * 1000) / consumoDiarioG);
  }
  if (!duracaoDias || duracaoDias <= 0) duracaoDias = entry.duracaoDias || 30;

  const dataCompra = racaoData.dataCompra || entry.dataCompra || new Date().toISOString().split('T')[0];
  const dataPrevisaoFim = racaoData.dataPrevisaoFim || addDaysToDateStr(dataCompra, duracaoDias);

  entry.dataCompra = dataCompra;
  if (racaoData.marca !== undefined) entry.marca = (racaoData.marca || '').trim() || 'Ração Padrão';
  entry.quantidadeKg = quantidadeKg;
  entry.consumoDiarioG = consumoDiarioG || 0;
  entry.duracaoDias = duracaoDias;
  entry.dataPrevisaoFim = dataPrevisaoFim;
  if (racaoData.valor !== undefined) entry.valor = parseCurrency(racaoData.valor);
  if (racaoData.notas !== undefined) entry.notas = (racaoData.notas || '').trim();
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.racao) destPet.racao = [];
      targetPet.racao = targetPet.racao.filter(r => r.id !== racaoId);
      destPet.racao.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
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


export function updatePetAreiaPurchase(state, petId, areiaId, areiaData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.areia || []).some(a => a.id === areiaId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.areia || []).find(a => a.id === areiaId);
  if (!entry) throw new Error('Lançamento de areia não encontrado.');

  const newPetId = areiaData.petId || petId;
  const duracaoDias = areiaData.duracaoDias !== undefined ? parseInt(areiaData.duracaoDias, 10) : (areiaData.duracaoDiasEstimada !== undefined ? parseInt(areiaData.duracaoDiasEstimada, 10) : (entry.duracaoDias || 25));
  const dataCompra = areiaData.dataCompra || entry.dataCompra || new Date().toISOString().split('T')[0];
  const dataPrevisaoFim = areiaData.dataPrevisaoFim || addDaysToDateStr(dataCompra, duracaoDias);

  entry.dataCompra = dataCompra;
  if (areiaData.marca !== undefined) entry.marca = (areiaData.marca || '').trim() || 'Areia Higiênica';
  if (areiaData.quantidadeKg !== undefined) entry.quantidadeKg = parseFloat(areiaData.quantidadeKg) || 0;
  entry.duracaoDias = duracaoDias;
  entry.dataPrevisaoFim = dataPrevisaoFim;
  if (areiaData.valor !== undefined) entry.valor = parseCurrency(areiaData.valor);
  if (areiaData.notas !== undefined) entry.notas = (areiaData.notas || '').trim();
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.areia) destPet.areia = [];
      targetPet.areia = targetPet.areia.filter(a => a.id !== areiaId);
      destPet.areia.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
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


export function updatePetBanho(state, petId, banhoId, banhoData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.higiene || []).some(h => h.id === banhoId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.higiene || []).find(h => h.id === banhoId);
  if (!entry) throw new Error('Registro de banho não encontrado.');

  const newPetId = banhoData.petId || petId;
  if (banhoData.data !== undefined) entry.data = banhoData.data;
  if (banhoData.tipo !== undefined) entry.tipo = banhoData.tipo === 'petshop' ? 'petshop' : 'casa';
  if (banhoData.local !== undefined) entry.local = (banhoData.local || '').trim() || (entry.tipo === 'petshop' ? 'Pet Shop' : 'Em Casa');
  if (banhoData.valor !== undefined) entry.valor = parseCurrency(banhoData.valor);
  if (banhoData.notas !== undefined) entry.notas = (banhoData.notas || '').trim();
  if (banhoData.tosa !== undefined) entry.tosa = !!banhoData.tosa;
  if (banhoData.corteUnhas !== undefined) entry.corteUnhas = !!banhoData.corteUnhas;
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.higiene) destPet.higiene = [];
      targetPet.higiene = targetPet.higiene.filter(h => h.id !== banhoId);
      destPet.higiene.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
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


export function updatePetVacina(state, petId, vacinaId, vacinaData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.vacinas || []).some(v => v.id === vacinaId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.vacinas || []).find(v => v.id === vacinaId);
  if (!entry) throw new Error('Registro de vacina não encontrado.');

  const newPetId = vacinaData.petId || petId;
  const vacinaNome = (vacinaData.vacina || vacinaData.nome || vacinaData.tipoVacina || entry.vacina || '').trim();
  const dataAplicacao = vacinaData.dataAplicacao || entry.dataAplicacao || new Date().toISOString().split('T')[0];
  const dataProximaDose = vacinaData.dataProximaDose || vacinaData.proximaData || entry.dataProximaDose || addDaysToDateStr(dataAplicacao, 365);

  entry.vacina = vacinaNome;
  entry.tipoVacina = vacinaNome;
  entry.nome = vacinaNome;
  entry.dataAplicacao = dataAplicacao;
  entry.dataProximaDose = dataProximaDose;
  if (vacinaData.lote !== undefined) entry.lote = (vacinaData.lote || '').trim();
  if (vacinaData.clinica !== undefined) entry.clinica = (vacinaData.clinica || '').trim();
  if (vacinaData.veterinario !== undefined) entry.veterinario = (vacinaData.veterinario || '').trim();
  if (vacinaData.notas !== undefined) entry.notas = (vacinaData.notas || '').trim();
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.vacinas) destPet.vacinas = [];
      targetPet.vacinas = targetPet.vacinas.filter(v => v.id !== vacinaId);
      destPet.vacinas.unshift(entry);
      destPet.vacinacaoEmDia = getPetVaccinesStatus(destPet).emDia;
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.vacinacaoEmDia = getPetVaccinesStatus(targetPet).emDia;
  targetPet.updatedAt = new Date().toISOString();
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


export function updatePetVermifugo(state, petId, vermifugoId, vermifugoData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.vermifugos || []).some(v => v.id === vermifugoId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.vermifugos || []).find(v => v.id === vermifugoId);
  if (!entry) throw new Error('Registro de vermífugo não encontrado.');

  const newPetId = vermifugoData.petId || petId;
  const dataAplicacao = vermifugoData.dataAplicacao || entry.dataAplicacao || new Date().toISOString().split('T')[0];
  const intervaloDias = parseInt(vermifugoData.intervaloDias, 10) || 180;
  const dataProximaDose = vermifugoData.dataProximaDose || vermifugoData.proximaData || entry.dataProximaDose || addDaysToDateStr(dataAplicacao, intervaloDias);
  const pesoAnimalKg = parseFloat(vermifugoData.pesoAnimalKg || vermifugoData.pesoKg || entry.pesoAnimalKg || targetPet.pesoKg) || 0;

  if (vermifugoData.nome !== undefined || vermifugoData.medicamento !== undefined) {
    entry.nome = (vermifugoData.nome || vermifugoData.medicamento || entry.nome || '').trim();
  }
  entry.dataAplicacao = dataAplicacao;
  entry.dataProximaDose = dataProximaDose;
  entry.pesoAnimalKg = pesoAnimalKg;
  if (vermifugoData.dose !== undefined) entry.dose = (vermifugoData.dose || formatPetDoseVermifugo(pesoAnimalKg)).trim();
  if (vermifugoData.notas !== undefined) entry.notas = (vermifugoData.notas || '').trim();
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.vermifugos) destPet.vermifugos = [];
      targetPet.vermifugos = targetPet.vermifugos.filter(v => v.id !== vermifugoId);
      destPet.vermifugos.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
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


export function updatePetExame(state, petId, exameId, exameData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.exames || []).some(e => e.id === exameId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.exames || []).find(e => e.id === exameId);
  if (!entry) throw new Error('Registro de exame não encontrado.');

  const newPetId = exameData.petId || petId;
  if (exameData.data !== undefined) entry.data = exameData.data;
  if (exameData.tipo !== undefined) entry.tipo = (exameData.tipo || entry.tipo || '').trim();
  if (exameData.clinica !== undefined) entry.clinica = (exameData.clinica || '').trim();
  if (exameData.veterinario !== undefined) entry.veterinario = (exameData.veterinario || '').trim();
  if (exameData.descricao !== undefined) entry.descricao = (exameData.descricao || '').trim();
  if (exameData.pendencias !== undefined) entry.pendencias = (exameData.pendencias || '').trim();
  if (Array.isArray(exameData.fotos)) entry.fotos = exameData.fotos;
  else if (exameData.foto) {
    if (!Array.isArray(entry.fotos)) entry.fotos = [];
    entry.fotos.unshift(exameData.foto);
  }
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!destPet.exames) destPet.exames = [];
      targetPet.exames = targetPet.exames.filter(e => e.id !== exameId);
      destPet.exames.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
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

/**
 * Lança a compra de um item ou acessório para o pet (comedouro, coleira, brinquedo, etc.)
 */
export function addPetItem(state, petId, itemData) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet) throw new Error('Pet não encontrado.');
  if (!Array.isArray(pet.itens)) pet.itens = [];

  const nome = (itemData.nome || itemData.titulo || '').trim();
  if (!nome) throw new Error('O nome do item é obrigatório.');

  const item = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    petId: pet.id,
    nome,
    tipo: itemData.tipo || 'comedouro',
    dataCompra: itemData.dataCompra || new Date().toISOString().substring(0, 10),
    valor: Number(itemData.valor || 0),
    loja: (itemData.loja || '').trim(),
    observacoes: (itemData.observacoes || '').trim(),
    fotos: Array.isArray(itemData.fotos) ? [...itemData.fotos] : (itemData.foto ? [itemData.foto] : []),
    createdAt: new Date().toISOString()
  };

  pet.itens.unshift(item);
  pet.updatedAt = new Date().toISOString();
  return item;
}

/**
 * Exclui um item ou acessório do pet
 */

export function updatePetItem(state, petId, itemId, itemData) {
  let targetPet = (state.pets || []).find(p => p.id === petId);
  if (!targetPet) {
    targetPet = (state.pets || []).find(p => (p.itens || []).some(it => it.id === itemId));
  }
  if (!targetPet) throw new Error('Pet não encontrado.');

  const entry = (targetPet.itens || []).find(it => it.id === itemId);
  if (!entry) throw new Error('Item/acessório não encontrado.');

  const newPetId = itemData.petId || petId;
  if (itemData.nome !== undefined || itemData.titulo !== undefined) {
    entry.nome = (itemData.nome || itemData.titulo || entry.nome || '').trim();
  }
  if (itemData.tipo !== undefined) entry.tipo = itemData.tipo;
  if (itemData.dataCompra !== undefined) entry.dataCompra = itemData.dataCompra;
  if (itemData.valor !== undefined) entry.valor = Number(itemData.valor || 0);
  if (itemData.loja !== undefined) entry.loja = (itemData.loja || '').trim();
  if (itemData.observacoes !== undefined) entry.observacoes = (itemData.observacoes || '').trim();
  if (Array.isArray(itemData.fotos)) entry.fotos = [...itemData.fotos];
  else if (itemData.foto) {
    if (!Array.isArray(entry.fotos)) entry.fotos = [];
    entry.fotos.unshift(itemData.foto);
  }
  entry.updatedAt = new Date().toISOString();

  if (newPetId && newPetId !== targetPet.id) {
    const destPet = (state.pets || []).find(p => p.id === newPetId);
    if (destPet) {
      if (!Array.isArray(destPet.itens)) destPet.itens = [];
      targetPet.itens = targetPet.itens.filter(it => it.id !== itemId);
      entry.petId = destPet.id;
      destPet.itens.unshift(entry);
      destPet.updatedAt = new Date().toISOString();
    }
  }

  targetPet.updatedAt = new Date().toISOString();
  return entry;
}

export function deletePetItem(state, petId, itemId) {
  const pet = (state.pets || []).find(p => p.id === petId);
  if (!pet || !Array.isArray(pet.itens)) return false;
  const idx = pet.itens.findIndex(it => it.id === itemId);
  if (idx < 0) return false;
  pet.itens.splice(idx, 1);
  pet.updatedAt = new Date().toISOString();
  return true;
}

/**
 * Retorna a lista de todos os itens/acessórios cadastrados (filtrados ou não por pet)
 */
export function getPetsItensList(state, petId = null) {
  const pets = (state.pets || []).filter(p => !petId || p.id === petId);
  const list = [];
  pets.forEach(p => {
    (p.itens || []).forEach(it => {
      list.push({
        ...it,
        petId: p.id,
        petNome: p.nome,
        petEspecie: p.especie,
        petFoto: (p.fotos && p.fotos[0]) || (p.photos && p.photos[0]) || null
      });
    });
  });
  return list.sort((a, b) => (b.dataCompra || '').localeCompare(a.dataCompra || ''));
}
