// ============================================================
//  MARACAJU - CÁLCULO NUTRICIONAL & PLANEJAMENTO DE MARMITAS
// ============================================================

/**
 * Cardápio base prescrito pela nutricionista para Matheus e Scarlet
 */
export const DEFAULT_NUTRITION_MEALS = {
  matheus: {
    nome: "Matheus",
    avatar: "👨‍💻",
    manha: {
      descricao: "01 fruta + 01 pão com queijo e requeijão (ou 2 ovos)",
      paes: 1,
      frutas: 1,
      ovos: 0, // preferência habitual queijo
      queijoG: 40,
      requeijaoG: 20
    },
    almoco: {
      descricao: "100g arroz cozido + 90g feijão cozido + 130g carne cozida + legumes/salada",
      arrozProntoG: 100,
      feijaoProntoG: 90,
      carneProntaG: 130
    },
    tarde: {
      descricao: "01 fruta + 01 YoPRO líquido (Piracanjuba 15-22g proteína)",
      frutas: 1,
      yopro: 1
    },
    noite: {
      descricao: "01 pão com 160g de carne cozida",
      paes: 1,
      carneProntaG: 160
    }
  },
  scarlet: {
    nome: "Scarlet",
    avatar: "👩‍💼",
    manha: {
      descricao: "01 fruta + 01 pão com 2 ovos e requeijão (ou queijo)",
      paes: 1,
      frutas: 1,
      ovos: 2,
      queijoG: 0,
      requeijaoG: 20
    },
    almoco: {
      descricao: "90g arroz cozido + 80g feijão cozido + 130g carne cozida + legumes/salada",
      arrozProntoG: 90,
      feijaoProntoG: 80,
      carneProntaG: 130
    },
    tarde: {
      descricao: "01 fruta + 30g whey protein com leite em pó (liquidificador portátil)",
      frutas: 1,
      wheyG: 30,
      leiteEmPoG: 20
    },
    noite: {
      descricao: "01 pão com 120g de carne cozida",
      paes: 1,
      carneProntaG: 120
    }
  }
};

/**
 * Fatores de Cocção & Rendimento (Tabela Ornellas / UAN & medidas práticas do casal):
 * - Carne vermelha (bovina): ~60% rendimento térmico -> 540g pronta ≈ 900g crua (x1.67)
 * - Carne suína (lombo/bisteca): ~68% rendimento térmico -> 100g crua ≈ 68g pronta (x1.47)
 * - Frango (peito grelhado/cozido): ~72% rendimento térmico -> 100g cru ≈ 72g pronto (x1.39)
 * - Arroz: 100g cru rende 220g cozido (x2.2)
 * - Feijão: 100g cru rende 260g cozido (x2.6)
 * - Macarrão: 100g cru rende ~250g cozido (x2.5 média al dente/macia; Ornellas 2.4–3.0)
 * - Batata-doce: compra bruta com casca (~15% perda descasque, +5% cocção) -> 100g com casca ≈ 90g cozida (0.90x)
 */
export const COOKING_FACTORS = {
  carneCruaMult: 900 / 540, // ~1.66667 (Carne vermelha / padrão)
  carneVermelhaCruaMult: 900 / 540, // ~1.66667 (rend. 60%)
  carneSuinaCruaMult: 1 / 0.68, // ~1.47059 (rend. 68%)
  frangoCruaMult: 1 / 0.72, // ~1.38889 (rend. 72%)
  arrozCruDiv: 2.2,
  feijaoCruDiv: 2.6,
  macarraoCruDiv: 2.5,
  batataDoceBrutaRend: 0.90
};

/**
 * Normaliza e mescla os diários alimentares salvos no estado do app
 * com o cardápio padrão de Matheus e Scarlet.
 */
export function getNutritionState(state) {
  const saved = (state && state.nutrition && typeof state.nutrition === 'object') ? state.nutrition : {};

  const normalizePerson = (key) => {
    const base = DEFAULT_NUTRITION_MEALS[key];
    const custom = (saved[key] && typeof saved[key] === 'object') ? saved[key] : {};
    const isReset = custom.reset === true;
    const customMeals = (!isReset && custom.meals && typeof custom.meals === 'object') ? custom.meals : {};
    // A foto vem de localStorage/backup importado: só aceita data URL de imagem
    // (evita injeção de atributo no `src` do card, ex.: `x" onerror="...`).
    const isSafePhoto = (value) => typeof value === 'string' &&
      /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(value);
    const photo = (!isReset && isSafePhoto(custom.photo)) ? custom.photo : '';
    const sourceName = (!isReset && typeof custom.sourceName === 'string') ? custom.sourceName : '';
    const rawText = (!isReset && typeof custom.rawText === 'string') ? custom.rawText : '';

    return {
      nome: base.nome,
      avatar: base.avatar,
      sourceName,
      rawText,
      photo,
      updatedAt: custom.updatedAt || null,
      isCustom: !isReset && !!(custom.updatedAt || sourceName || rawText || photo || Object.keys(customMeals).length),
      meals: {
        nome: base.nome,
        avatar: base.avatar,
        manha: { ...base.manha, ...(customMeals.manha || {}) },
        almoco: {
          macarraoProntoG: 0,
          batataDoceProntaG: 0,
          legumesProntoG: 0,
          ...base.almoco,
          ...(customMeals.almoco || {})
        },
        tarde: { ...base.tarde, ...(customMeals.tarde || {}) },
        noite: { ...base.noite, ...(customMeals.noite || {}) }
      }
    };
  };

  const prepChecklist = (saved.prepChecklist && typeof saved.prepChecklist === 'object' && !Array.isArray(saved.prepChecklist))
    ? { ...saved.prepChecklist }
    : {};

  return {
    matheus: normalizePerson('matheus'),
    scarlet: normalizePerson('scarlet'),
    prepChecklist
  };
}

/**
 * Reconstrói automaticamente as descrições legíveis das 4 refeições a partir das gramaturas/unidades
 * quando o usuário edita rapidamente os valores direto no cartão.
 */
export function buildAutoMealDescriptions(meals, person = 'matheus') {
  const base = DEFAULT_NUTRITION_MEALS[person] || DEFAULT_NUTRITION_MEALS.matheus;
  const m = meals || base;

  // Manhã
  const manhaParts = [];
  if ((m.manha?.frutas || 0) > 0) manhaParts.push(`${String(m.manha.frutas).padStart(2, '0')} ${m.manha.frutas === 1 ? 'fruta' : 'frutas'}`);
  if ((m.manha?.paes || 0) > 0) {
    const acompanhamento = [];
    if ((m.manha?.ovos || 0) > 0) acompanhamento.push(`${m.manha.ovos} ${m.manha.ovos === 1 ? 'ovo' : 'ovos'}`);
    if ((m.manha?.queijoG || 0) > 0) acompanhamento.push(`${m.manha.queijoG}g queijo`);
    if ((m.manha?.requeijaoG || 0) > 0) acompanhamento.push(`${m.manha.requeijaoG}g requeijão`);
    const acompStr = acompanhamento.length > 0 ? ` com ${acompanhamento.join(' e ')}` : '';
    manhaParts.push(`${String(m.manha.paes).padStart(2, '0')} ${m.manha.paes === 1 ? 'pão' : 'pães'}${acompStr}`);
  } else {
    if ((m.manha?.ovos || 0) > 0) manhaParts.push(`${m.manha.ovos} ${m.manha.ovos === 1 ? 'ovo' : 'ovos'}`);
    if ((m.manha?.queijoG || 0) > 0) manhaParts.push(`${m.manha.queijoG}g queijo`);
    if ((m.manha?.requeijaoG || 0) > 0) manhaParts.push(`${m.manha.requeijaoG}g requeijão`);
  }

  // Almoço
  const almocoParts = [];
  if ((m.almoco?.arrozProntoG || 0) > 0) almocoParts.push(`${m.almoco.arrozProntoG}g arroz cozido`);
  if ((m.almoco?.macarraoProntoG || 0) > 0) almocoParts.push(`${m.almoco.macarraoProntoG}g macarrão cozido`);
  if ((m.almoco?.batataDoceProntaG || 0) > 0) almocoParts.push(`${m.almoco.batataDoceProntaG}g batata-doce cozida`);
  if ((m.almoco?.feijaoProntoG || 0) > 0) almocoParts.push(`${m.almoco.feijaoProntoG}g feijão cozido`);
  if ((m.almoco?.carneProntaG || 0) > 0) almocoParts.push(`${m.almoco.carneProntaG}g carne cozida`);
  if ((m.almoco?.legumesProntoG || 0) > 0) {
    almocoParts.push(`${m.almoco.legumesProntoG}g legumes/salada`);
  } else {
    almocoParts.push('legumes/salada');
  }

  // Tarde
  const tardeParts = [];
  if ((m.tarde?.frutas || 0) > 0) tardeParts.push(`${String(m.tarde.frutas).padStart(2, '0')} ${m.tarde.frutas === 1 ? 'fruta' : 'frutas'}`);
  if ((m.tarde?.yopro || 0) > 0) tardeParts.push(`${String(m.tarde.yopro).padStart(2, '0')} YoPRO líquido`);
  if ((m.tarde?.wheyG || 0) > 0) {
    const leiteStr = (m.tarde?.leiteEmPoG || 0) > 0 ? ` com ${m.tarde.leiteEmPoG}g leite em pó` : '';
    tardeParts.push(`${m.tarde.wheyG}g whey protein${leiteStr}`);
  } else if ((m.tarde?.leiteEmPoG || 0) > 0) {
    tardeParts.push(`${m.tarde.leiteEmPoG}g leite em pó`);
  }

  // Noite
  const noiteParts = [];
  if ((m.noite?.paes || 0) > 0 && (m.noite?.carneProntaG || 0) > 0) {
    noiteParts.push(`${String(m.noite.paes).padStart(2, '0')} ${m.noite.paes === 1 ? 'pão' : 'pães'} com ${m.noite.carneProntaG}g de carne cozida`);
  } else {
    if ((m.noite?.paes || 0) > 0) noiteParts.push(`${String(m.noite.paes).padStart(2, '0')} ${m.noite.paes === 1 ? 'pão' : 'pães'}`);
    if ((m.noite?.carneProntaG || 0) > 0) noiteParts.push(`${m.noite.carneProntaG}g de carne cozida`);
  }

  return {
    manha: manhaParts.length > 0 ? manhaParts.join(' + ') : base.manha.descricao,
    almoco: almocoParts.length > 0 ? almocoParts.join(' + ') : base.almoco.descricao,
    tarde: tardeParts.length > 0 ? tardeParts.join(' + ') : base.tarde.descricao,
    noite: noiteParts.length > 0 ? noiteParts.join(' + ') : base.noite.descricao
  };
}

export function getEffectiveNutritionMeals(state) {
  const ns = getNutritionState(state);
  return {
    matheus: ns.matheus.meals,
    scarlet: ns.scarlet.meals
  };
}

function ptNumberToFloat(token) {
  if (token === null || token === undefined) return 0;
  const low = String(token).toLowerCase().trim();
  const map = {
    um: 1, uma: 1, dois: 2, duas: 2, tres: 3, 'três': 3, quatro: 4,
    cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10
  };
  if (map[low] !== undefined) return map[low];

  let normalized = low.replace(/\s/g, '');
  // Milhar com ponto: "1.500" / "1.500,5" (antes o parseFloat lia 1,5 e 2)
  if (/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(normalized)) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = normalized.replace(',', '.');
  }
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Aceita "120", "0,5", "1.500" e nunca começa no meio de um decimal.
const NUMBER_TOKEN = '(?<![\\d.,])(\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:[.,]\\d+)?)';
// Para unidades caseiras/contagens também aceita numerais por extenso.
const COUNT_TOKEN = '(?<![\\d.,])(\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:[.,]\\d+)?|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)';

function extractGramsFor(text, ingredientRegex, unitFallback = null) {
  if (!text) return null;
  // Padrão 1: "100g de arroz" / "100 g arroz" / "100gr de arroz"
  const beforeRe = new RegExp(`${NUMBER_TOKEN}\\s*(?:g|gr|gramas?)\\s*(?:de\\s+)?(?:${ingredientRegex})`, 'i');
  const m1 = text.match(beforeRe);
  if (m1) return Math.round(ptNumberToFloat(m1[1]));

  // Padrão 2a: "arroz cozido: 100g" / "arroz (100g)"
  const afterColonRe = new RegExp(`(?:${ingredientRegex})[^\\n:;]{0,30}?[:;(]\\s*${NUMBER_TOKEN}\\s*(?:g|gr|gramas?)`, 'i');
  const m2a = text.match(afterColonRe);
  if (m2a) return Math.round(ptNumberToFloat(m2a[1]));

  // Padrão 2b: "arroz 100g" (só quando o número vem logo depois do alimento).
  // A janela antiga de 35 caracteres atravessava " e " e roubava as gramas do
  // ingrediente seguinte ("pão com queijo e 20g de requeijão" → queijo 20g).
  const afterRe = new RegExp(`(?:${ingredientRegex})\\s+${NUMBER_TOKEN}\\s*(?:g|gr|gramas?)`, 'i');
  const m2 = text.match(afterRe);
  if (m2) return Math.round(ptNumberToFloat(m2[1]));

  // Padrão 3: fallback por medida caseira (ex: fatia, colher, concha, scoop)
  if (unitFallback) {
    const unitRe = new RegExp(`${COUNT_TOKEN}\\s*(?:${unitFallback.unitPattern})\\s*(?:de\\s+)?(?:${ingredientRegex})`, 'i');
    const m3 = text.match(unitRe);
    if (m3) return Math.round(ptNumberToFloat(m3[1]) * unitFallback.gramsPerUnit);
  }

  // Null = quantidade não encontrada (diferente de 0g explícito). O chamador
  // decide entre o valor do cardápio padrão e 0 quando o item nem é citado.
  return null;
}

function extractCountFor(text, ingredientRegex) {
  if (!text) return null;
  const countRe = new RegExp(`${COUNT_TOKEN}\\s*(?:un(?:idades?)?\\s*(?:de\\s*)?|caixinha[s]?\\s*(?:de\\s*)?|por[cç][aãõ]e?s?\\s*(?:de\\s*)?)?(?:${ingredientRegex})`, 'i');
  const m = text.match(countRe);
  if (m) return Math.round(ptNumberToFloat(m[1]));

  // Se o alimento foi citado sem quantidade numérica explícita, assume 1 unidade
  const bareRe = new RegExp(`(?:^|[\\s,(;])(?:${ingredientRegex})(?=$|[\\s,.;:)])`, 'i');
  if (bareRe.test(text)) return 1;
  return null;
}

function stripAltOptionsForQuantities(blockText) {
  if (!blockText) return '';
  // Quebra antes de linhas ou marcadores "ou" / "opção 2" / "substituição" para não somar porções alternativas em dobro
  const parts = blockText.split(/\n\s*(?:ou|op[cç][aã]o\s*2|substitui[cç][aã]o)\b/i);
  const firstPart = parts[0] || blockText;
  // Também trata " ou " na mesma linha quando separa duas opções completas
  const inlineParts = firstPart.split(/\s+ou\s+(?=\d+\s*(?:fruta|p[aã]o|ovo|fatia))/i);
  return inlineParts[0] || firstPart;
}

function extractPersonSectionFromText(rawText, person) {
  if (!rawText) return '';

  const lines = rawText.split(/\r?\n/);
  const buckets = { matheus: [], scarlet: [] };
  // Aceita "Matheus", "Paciente: Matheus Silva" e "Matheus - Almoço: ...".
  const headerRe = /^\s*(?:(?:card[aá]pio|di[aá]rio(?:\s+alimentar)?|paciente|cliente)\s*(?:do|da)?\s*:?\s*)?(matheus|scarlet)\b\s*(.*)$/i;
  const mealHintRe = /(?:caf[eé]|almo[cç]o|lanche|jantar|noite|tarde|manh[aã]|refei[cç][aã]o|desjejum|ceia)/i;
  let current = null;
  let foundHeader = false;

  for (const line of lines) {
    const m = line.match(headerRe);
    if (m) {
      foundHeader = true;
      current = m[1].toLowerCase();
      let rest = (m[2] || '').replace(/^[\s\-–:]+/, '').trim();
      // "Matheus Silva" / "Scarlet Souza": sobrenome não é conteúdo da dieta.
      if (rest && !mealHintRe.test(rest) && !/\d/.test(rest) && rest.split(/\s+/).length <= 2) {
        rest = '';
      }
      if (rest) buckets[current].push(rest);
      continue;
    }
    if (current) buckets[current].push(line);
  }

  if (!foundHeader) return rawText;

  const own = buckets[person] || [];
  if (own.length > 0) return own.join('\n');

  // Se o documento foi separado por pessoa mas a seção pedida ficou vazia,
  // NÃO devolve o texto inteiro: antes o diário do Matheus era aplicado na
  // Scarlet silenciosamente. Vazio = usa o cardápio padrão dela.
  const other = person === 'matheus' ? buckets.scarlet : buckets.matheus;
  return other.length > 0 ? '' : rawText;
}

/**
 * Interpreta o texto extraído de um PDF ou texto colado do diário alimentar da nutricionista.
 * Separa em Manhã, Almoço, Tarde e Noite e extrai as quantidades em gramas/unidades.
 */
export function parseNutritionDiaryText(rawText, person = 'matheus') {
  const base = DEFAULT_NUTRITION_MEALS[person] || DEFAULT_NUTRITION_MEALS.matheus;
  const scopedText = extractPersonSectionFromText(String(rawText || ''), person);
  const lines = scopedText
    .split(/\r?\n/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const buckets = {
    manha: [],
    almoco: [],
    tarde: [],
    noite: []
  };

  let activeMeal = null;

  const detectMealHeader = (line) => {
    const clean = line.replace(/^[\-•*\d.)\s]+/, '').trim();
    // Cabeçalhos curtos ou com dois-pontos no início da linha
    const isLikelyHeader = clean.length <= 55 || /[:\-–]/.test(clean);
    if (!isLikelyHeader) return null;

    const headPart = clean.split(/[:\-–]/)[0].trim();
    if (/^(?:caf[eé]\s*(?:da\s*)?manh[aã]|desjejum|manh[aã]|1[ªa°]?\s*refei[cç][aã]o)(?=$|[\s:,\-–.)])/i.test(headPart)) {
      return 'manha';
    }
    if (/^(?:almo[cç]o)(?=$|[\s:,\-–.)])/i.test(headPart)) {
      return 'almoco';
    }
    if (/^(?:lanche(?:\s*da)?\s*tarde|lanche|col[aá][cç][aã]o|caf[eé]\s*(?:da\s*)?tarde|tarde|pr[eé][\s-]?treino|p[oó]s[\s-]?treino)(?=$|[\s:,\-–.)])/i.test(headPart)) {
      return 'tarde';
    }
    if (/^(?:jantar|janta|noite|ceia|lanche(?:\s*da)?\s*noite)(?=$|[\s:,\-–.)])/i.test(headPart)) {
      return 'noite';
    }
    return null;
  };

  for (const line of lines) {
    const detected = detectMealHeader(line);
    if (detected) {
      activeMeal = detected;
      // Se houver conteúdo na mesma linha após ":" ou "-", preserva como item da refeição
      const afterSep = line.replace(/^[^:\-–]+[:\-–]\s*/, '').trim();
      if (afterSep && afterSep !== line && !/^\d{1,2}[:h]\d{2}$/i.test(afterSep)) {
        buckets[activeMeal].push(afterSep);
      }
      continue;
    }

    if (activeMeal) {
      // Ignora rodapés comuns de PDF de nutricionista
      if (/^(?:p[aá]gina\s+\d+|crn[\s:\-]*\d+|assinatura|observa[cç][oõ]es\s+gerais)/i.test(line)) {
        continue;
      }
      buckets[activeMeal].push(line);
    }
  }

  const formatDesc = (arr, fallbackDesc) => {
    if (!arr || arr.length === 0) return fallbackDesc;
    return arr.join(' • ').replace(/\s*•\s*ou\s*•\s*/gi, ' ou ');
  };

  const manhaText = buckets.manha.join('\n');
  const almocoText = buckets.almoco.join('\n');
  const tardeText = buckets.tarde.join('\n');
  const noiteText = buckets.noite.join('\n');

  const manhaPrimary = stripAltOptionsForQuantities(manhaText);
  const almocoPrimary = stripAltOptionsForQuantities(almocoText);
  const tardePrimary = stripAltOptionsForQuantities(tardeText);
  const noitePrimary = stripAltOptionsForQuantities(noiteText);

  const meatWords = 'carnes?(?:\\s+(?:bovina|su[ií]na|magra|mo[ií]da))?|frango|peito\\s+de\\s+frango|patinho|alcatra|bife[s]?|peixe|til[aá]pia|salm[aã]o|fil[eé](?:\\s+de\\s+(?:frango|peixe|til[aá]pia))?|prote[ií]na';

  const mentioned = (text, pattern) => !!text && new RegExp(`(?:${pattern})`, 'i').test(text);

  // Regra: refeição descrita mas item não citado => 0 (a nutri tirou do plano).
  // Item citado sem quantidade => mantém a quantidade prescrita do cardápio.
  const gramsField = (text, pattern, baseValue, unitFallback = null) => {
    if (!text) return baseValue;
    if (!mentioned(text, pattern)) return 0;
    const value = extractGramsFor(text, pattern, unitFallback);
    return value === null ? baseValue : value;
  };

  const countField = (text, pattern, baseValue) => {
    if (!text) return baseValue;
    if (!mentioned(text, pattern)) return 0;
    const value = extractCountFor(text, pattern);
    return value === null ? baseValue : value;
  };

  const paesPattern = 'p[aã](?:o|es)(?:\\s+(?:franc[eê]s|de\\s+forma|integral))?';
  const frutasPattern = 'frutas?|banana[s]?|ma[cç][aã]s?|mam[aã]o|laranja[s]?|pera[s]?|mel[aã]o';

  const parsedMeals = {
    nome: base.nome,
    avatar: base.avatar,
    manha: {
      descricao: formatDesc(buckets.manha, base.manha.descricao),
      paes: countField(manhaPrimary, paesPattern, base.manha.paes),
      frutas: countField(manhaPrimary, frutasPattern, base.manha.frutas),
      ovos: countField(manhaPrimary, 'ovos?', base.manha.ovos),
      queijoG: gramsField(manhaPrimary, 'queijo(?:\\s+(?:mussarela|minas|prato|cottage|ricota|fatiado))?', base.manha.queijoG, { unitPattern: 'fatia[s]?', gramsPerUnit: 20 }),
      requeijaoG: gramsField(manhaPrimary, 'requeij[aã]o|cream\\s*cheese', base.manha.requeijaoG, { unitPattern: 'colher(?:es)?(?:\\s+de\\s+(?:sopa|sobremesa))?', gramsPerUnit: 20 })
    },
    almoco: {
      descricao: formatDesc(buckets.almoco, base.almoco.descricao),
      arrozProntoG: gramsField(almocoPrimary, 'arroz(?:\\s+(?:branco|integral|cozido|parboilizado))?', base.almoco.arrozProntoG, { unitPattern: 'colher(?:es)?(?:\\s+de\\s+sopa)?', gramsPerUnit: 25 }),
      feijaoProntoG: gramsField(almocoPrimary, 'feij[aã]o(?:\\s+(?:carioca|preto|cozido))?', base.almoco.feijaoProntoG, { unitPattern: 'concha[s]?', gramsPerUnit: 80 }),
      carneProntaG: gramsField(almocoPrimary, meatWords, base.almoco.carneProntaG),
      macarraoProntoG: mentioned(almocoPrimary, 'macarr[aã]o|massa|espaguete|penne')
        ? (extractGramsFor(almocoPrimary, 'macarr[aã]o|massa|espaguete|penne') ?? 120)
        : 0,
      batataDoceProntaG: mentioned(almocoPrimary, 'batata[\\s-]*doce|mandioca|aipim|inhame')
        ? (extractGramsFor(almocoPrimary, 'batata[\\s-]*doce|mandioca|aipim|inhame') ?? 120)
        : 0,
      legumesProntoG: mentioned(almocoPrimary, 'legumes?|cenoura|abobrinha|br[oó]colis|beterraba|vagem|chuchu')
        ? (extractGramsFor(almocoPrimary, 'legumes?|cenoura|abobrinha|br[oó]colis|beterraba|vagem|chuchu') ?? 0)
        : 0
    },
    tarde: {
      descricao: formatDesc(buckets.tarde, base.tarde.descricao),
      frutas: countField(tardePrimary, frutasPattern, base.tarde.frutas),
      yopro: countField(tardePrimary, 'yo\\s*-?\\s*pro', base.tarde.yopro || 0),
      wheyG: gramsField(tardePrimary, 'whey(?:\\s+protein)?', base.tarde.wheyG || 0, { unitPattern: 'scoop[s]?|medidor(?:es)?|dosador(?:es)?', gramsPerUnit: 30 }),
      leiteEmPoG: gramsField(tardePrimary, 'leite\\s*(?:em\\s*)?p[oó]', base.tarde.leiteEmPoG || 0, { unitPattern: 'colher(?:es)?(?:\\s+de\\s+sopa)?', gramsPerUnit: 10 })
    },
    noite: {
      descricao: formatDesc(buckets.noite, base.noite.descricao),
      paes: countField(noitePrimary, paesPattern, base.noite.paes),
      carneProntaG: gramsField(noitePrimary, meatWords, base.noite.carneProntaG)
    }
  };

  const detectedMealsCount = Object.values(buckets).filter(b => b.length > 0).length;

  return {
    meals: parsedMeals,
    detectedMealsCount,
    rawText: scopedText.trim()
  };
}

/**
 * Calcula o resumo diário consolidado do casal (pronto e cru), ou individual (matheus / scarlet)
 */
export function getDailyNutritionSummary(meals = DEFAULT_NUTRITION_MEALS, factors = COOKING_FACTORS, person = 'casal') {
  const m = meals.matheus;
  const s = meals.scarlet;
  const useMatheus = person === 'casal' || person === 'matheus';
  const useScarlet = person === 'casal' || person === 'scarlet';
  const pick = (mVal, sVal) => (useMatheus ? (Number(mVal) || 0) : 0) + (useScarlet ? (Number(sVal) || 0) : 0);

  // Pronto diário
  const arrozAlmocoProntoG = pick(m.almoco.arrozProntoG, s.almoco.arrozProntoG); // 190g
  const feijaoAlmocoProntoG = pick(m.almoco.feijaoProntoG, s.almoco.feijaoProntoG); // 170g
  const carneAlmocoProntaG = pick(m.almoco.carneProntaG, s.almoco.carneProntaG); // 260g
  const macarraoAlmocoProntoG = pick(m.almoco.macarraoProntoG, s.almoco.macarraoProntoG); // 0g padrão
  const batataDoceAlmocoProntaG = pick(m.almoco.batataDoceProntaG, s.almoco.batataDoceProntaG); // 0g padrão
  const legumesAlmocoProntoG = pick(m.almoco.legumesProntoG, s.almoco.legumesProntoG); // 0g padrão
  const carneNoiteProntaG = pick(m.noite.carneProntaG, s.noite.carneProntaG); // 280g
  const carneTotalProntaG = carneAlmocoProntaG + carneNoiteProntaG; // 540g

  const paesTotal = pick(m.manha.paes, s.manha.paes) + pick(m.noite.paes, s.noite.paes); // 4
  const frutasTotal = pick(m.manha.frutas, s.manha.frutas) + pick(m.tarde.frutas, s.tarde.frutas); // 4
  const yoproTotal = pick(m.tarde.yopro, s.tarde.yopro); // 1
  const wheyTotalG = pick(m.tarde.wheyG, s.tarde.wheyG); // 30
  const leiteEmPoTotalG = pick(m.tarde.leiteEmPoG, s.tarde.leiteEmPoG); // 20
  const ovosTotal = pick(m.manha.ovos, s.manha.ovos); // 2 a 4
  const queijoTotalG = pick(m.manha.queijoG, s.manha.queijoG); // ~40
  const requeijaoTotalG = pick(m.manha.requeijaoG, s.manha.requeijaoG); // ~40

  // Conversão In Natura (Cru / Seco). Fallbacks evitam NaN quando um chamador
  // passa um objeto parcial de fatores (a UI sempre passa COOKING_FACTORS).
  const carneMult = factors.carneCruaMult || (900 / 540);
  const arrozDiv = factors.arrozCruDiv || 2.2;
  const feijaoDiv = factors.feijaoCruDiv || 2.6;
  const macDiv = factors.macarraoCruDiv || 2.5;
  const batRend = factors.batataDoceBrutaRend || 0.90;
  const carneAlmocoCruaG = Math.round(carneAlmocoProntaG * carneMult); // ~433g
  const carneNoiteCruaG = Math.round(carneNoiteProntaG * carneMult); // ~467g
  const carneTotalCruaG = Math.round(carneTotalProntaG * carneMult); // ~900g

  const arrozCruG = Math.round(arrozAlmocoProntoG / arrozDiv); // ~86g
  const feijaoCruG = Math.round(feijaoAlmocoProntoG / feijaoDiv); // ~65g
  const macarraoCruG = Math.round(macarraoAlmocoProntoG / macDiv);
  const batataDoceCruaG = Math.round(batataDoceAlmocoProntaG / batRend);
  const legumesCruG = Math.round(legumesAlmocoProntoG / 0.85);

  return {
    prontoDiario: {
      arrozAlmocoProntoG,
      feijaoAlmocoProntoG,
      carneAlmocoProntaG,
      macarraoAlmocoProntoG,
      batataDoceAlmocoProntaG,
      legumesAlmocoProntoG,
      carneNoiteProntaG,
      carneTotalProntaG,
      paesTotal,
      frutasTotal,
      yoproTotal,
      wheyTotalG,
      leiteEmPoTotalG,
      ovosTotal,
      queijoTotalG,
      requeijaoTotalG
    },
    inNaturaDiario: {
      arrozCruG,
      feijaoCruG,
      macarraoCruG,
      batataDoceCruaG,
      legumesCruG,
      carneAlmocoCruaG,
      carneNoiteCruaG,
      carneTotalCruaG
    }
  };
}

export const MARMITAS_ITEM_GROUPS = ['carne', 'arroz', 'feijao', 'paes_frutas', 'laticinios'];

/**
 * Catálogo real de Saladas, Legumes para Cozinhar e Frutas Semanais do casal (Matheus & Scarlet)
 */
export const HORTIFRUTI_WEEKLY_CATALOG = [
  // --- SALADAS FRESCAS ---
  {
    id: 'alface',
    name: 'Alface',
    icon: '🥬',
    section: 'saladas',
    defaultChecked: true,
    optional: false,
    unitPrice: 4.50,
    calcQty: (dias) => {
      const weeks = Math.max(1, Math.round(dias / 7));
      const pes = Math.max(1, weeks * 2);
      return { qtyNum: pes, qtyText: `${pes} ${pes === 1 ? 'pé' : 'pés'}`, label: `Alface (${pes} ${pes === 1 ? 'pé' : 'pés'})` };
    },
    notes: 'Salada fresca da semana'
  },
  {
    id: 'tomate',
    name: 'Tomate',
    icon: '🍅',
    section: 'saladas',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.50,
    calcQty: (dias) => {
      const un = Math.max(2, Math.round((dias / 7) * 6));
      return { qtyNum: un, qtyText: `${un} un`, label: `Tomate (${un} un)` };
    },
    notes: 'Salada do dia a dia'
  },
  {
    id: 'tomate_cereja',
    name: 'Tomate Cereja',
    icon: '🍒',
    section: 'saladas',
    defaultChecked: true,
    optional: false,
    unitPrice: 8.90,
    calcQty: (dias) => {
      const bdj = Math.max(1, Math.round(dias / 7));
      return { qtyNum: bdj, qtyText: `${bdj} ${bdj === 1 ? 'bandeja' : 'bandejas'}`, label: `Tomate Cereja (${bdj} ${bdj === 1 ? 'bandeja' : 'bandejas'})` };
    },
    notes: 'Salada rápida e acompanhamento das marmitas'
  },
  // --- LEGUMES PARA COZINHAR (MARMITAS) ---
  {
    id: 'cenoura',
    name: 'Cenoura para cozinhar',
    icon: '🥕',
    section: 'legumes',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.40,
    calcQty: (dias) => {
      const un = Math.max(2, Math.round((dias / 7) * 4));
      const g = un * 150;
      return { qtyNum: un, qtyText: `${un} un (~${g}g)`, label: `Cenoura para cozinhar (${un} un / ~${g}g)` };
    },
    notes: 'Cozinhar e porcionar nas marmitas de almoço'
  },
  {
    id: 'beterraba',
    name: 'Beterraba para cozinhar',
    icon: '🟣',
    section: 'legumes',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.50,
    calcQty: (dias) => {
      const un = Math.max(2, Math.round((dias / 7) * 3));
      const g = un * 160;
      return { qtyNum: un, qtyText: `${un} un (~${g}g)`, label: `Beterraba para cozinhar (${un} un / ~${g}g)` };
    },
    notes: 'Cozinhar e porcionar nas marmitas de almoço'
  },
  {
    id: 'chuchu',
    name: 'Chuchu para cozinhar',
    icon: '🥒',
    section: 'legumes',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.30,
    calcQty: (dias) => {
      const un = Math.max(2, Math.round((dias / 7) * 3));
      const g = un * 180;
      return { qtyNum: un, qtyText: `${un} un (~${g}g)`, label: `Chuchu para cozinhar (${un} un / ~${g}g)` };
    },
    notes: 'Cozinhar e porcionar nas marmitas de almoço'
  },
  // --- FRUTAS SEMANAIS DO CASAL ---
  {
    id: 'banana',
    name: 'Banana',
    icon: '🍌',
    section: 'frutas',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.10,
    calcQty: (dias, person = 'casal') => {
      const perDay = person === 'casal' ? 2 : 1; // 1 pra cada por dia
      const un = Math.max(1, dias * perDay);
      return { qtyNum: un, qtyText: `${un} un`, label: `Banana (${un} un — 1/dia ${person === 'casal' ? 'para cada' : ''})`.replace(/\s+\)/, ')') };
    },
    notes: '1 unidade para cada por dia'
  },
  {
    id: 'maca',
    name: 'Maçã',
    icon: '🍎',
    section: 'frutas',
    defaultChecked: true,
    optional: false,
    unitPrice: 1.80,
    calcQty: (dias, person = 'casal') => {
      if (person === 'scarlet') {
        const unS = Math.max(2, Math.round((dias / 7) * 3));
        return { qtyNum: unS, qtyText: `${unS} un`, label: `Maçã (${unS} un)` };
      }
      // 1 por dia para o Matheus (às vezes menos -> ~6 por semana de 7d)
      const un = Math.max(1, Math.round((dias / 7) * 6));
      return { qtyNum: un, qtyText: `${un} un`, label: `Maçã (${un} un — Matheus ~1/dia)` };
    },
    notes: '1 por dia para o Matheus (às vezes menos)'
  },
  {
    id: 'uva',
    name: 'Uvas (Caixa 500g)',
    icon: '🍇',
    section: 'frutas',
    defaultChecked: true,
    optional: false,
    unitPrice: 11.90,
    calcQty: (dias) => {
      const cx = Math.max(1, Math.round(dias / 7));
      return { qtyNum: cx, qtyText: `${cx} ${cx === 1 ? 'caixa 500g' : 'caixas 500g'}`, label: `Uvas (${cx} ${cx === 1 ? 'caixa de 500g' : 'caixas de 500g'})` };
    },
    notes: '1 caixa de 500g dá para a semana'
  },
  {
    id: 'mamao',
    name: 'Mamão Papaia Grande',
    icon: '🍈',
    section: 'frutas',
    defaultChecked: true,
    optional: false,
    unitPrice: 9.50,
    calcQty: (dias) => {
      const un = Math.max(1, Math.round(dias / 7));
      return { qtyNum: un, qtyText: `${un} un grande`, label: `Mamão Papaia Grande (${un} un)` };
    },
    notes: '1 papaia grande é suficiente para a semana'
  },
  {
    id: 'morango_congelado',
    name: 'Morango Congelado',
    icon: '🍓',
    section: 'frutas',
    defaultChecked: false,
    optional: true,
    unitPrice: 16.90,
    calcQty: (dias) => {
      const pct = Math.max(1, Math.round(dias / 15));
      return { qtyNum: pct, qtyText: `${pct} ${pct === 1 ? 'pacote' : 'pacotes'}`, label: `Morango Congelado (${pct} ${pct === 1 ? 'pacote' : 'pacotes'})` };
    },
    notes: 'Opcional — às vezes deixamos no freezer para bater com whey/vitamina'
  },
  {
    id: 'melancia',
    name: 'Melancia (1/4 a 1/2)',
    icon: '🍉',
    section: 'frutas',
    defaultChecked: false,
    optional: true,
    unitPrice: 14.00,
    calcQty: (dias) => {
      const un = Math.max(1, Math.round(dias / 7));
      return { qtyNum: un, qtyText: `${un} banda (1/4 a 1/2)`, label: `Melancia — 1/4 a 1/2 (${un} un)` };
    },
    notes: 'Opcional — às vezes pegamos 1/4 a 1/2 melancia na semana'
  }
];

export const DEFAULT_HORTIFRUTI_IDS = HORTIFRUTI_WEEKLY_CATALOG
  .filter(it => it.defaultChecked)
  .map(it => it.id);

export function resolveSelectedHortifruti(selectedHortifruti = null) {
  if (!Array.isArray(selectedHortifruti)) {
    return new Set(DEFAULT_HORTIFRUTI_IDS);
  }
  return new Set(selectedHortifruti);
}

/**
 * Calcula a distribuição de dias entre Carne Bovina, Frango e Suína para o período selecionado.
 * Presets:
 * - 'padrao': sem divisão separada (100% fator padrão x1.67)
 * - 'misto': ~3/7 Bovina, ~3/7 Frango, ~1/7 Suína
 * - 'bovina_frango': 50% Bovina, 50% Frango
 * - 'so_frango': 100% Frango
 * - 'so_bovina': 100% Bovina
 * - 'so_suina': 100% Suína
 * - 'custom': usa os dias { bovina, frango, suina } informados pelo usuário
 */
export function resolveMeatDaysSplit(dias = 7, meatSplit = null) {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  if (!meatSplit || typeof meatSplit !== 'object' || !meatSplit.mode || meatSplit.mode === 'padrao') {
    return {
      mode: 'padrao',
      isSplitActive: false,
      bovinaDays: safeDias,
      frangoDays: 0,
      suinaDays: 0,
      totalDays: safeDias
    };
  }

  const mode = meatSplit.mode;
  let bovinaDays = 0;
  let frangoDays = 0;
  let suinaDays = 0;

  if (mode === 'misto') {
    bovinaDays = Math.round((safeDias * 3) / 7);
    suinaDays = safeDias >= 4 ? Math.max(1, Math.round((safeDias * 1) / 7)) : 0;
    frangoDays = Math.max(0, safeDias - bovinaDays - suinaDays);
  } else if (mode === 'bovina_frango') {
    bovinaDays = Math.ceil(safeDias / 2);
    frangoDays = Math.max(0, safeDias - bovinaDays);
    suinaDays = 0;
  } else if (mode === 'so_frango') {
    bovinaDays = 0;
    frangoDays = safeDias;
    suinaDays = 0;
  } else if (mode === 'so_bovina') {
    bovinaDays = safeDias;
    frangoDays = 0;
    suinaDays = 0;
  } else if (mode === 'so_suina') {
    bovinaDays = 0;
    frangoDays = 0;
    suinaDays = safeDias;
  } else {
    bovinaDays = Math.max(0, Math.round(Number(meatSplit.bovinaDays ?? meatSplit.bovina ?? 0)));
    frangoDays = Math.max(0, Math.round(Number(meatSplit.frangoDays ?? meatSplit.frango ?? 0)));
    suinaDays = Math.max(0, Math.round(Number(meatSplit.suinaDays ?? meatSplit.suina ?? 0)));
    if (bovinaDays === 0 && frangoDays === 0 && suinaDays === 0) {
      bovinaDays = safeDias;
    }
  }

  return {
    mode,
    isSplitActive: true,
    bovinaDays,
    frangoDays,
    suinaDays,
    totalDays: bovinaDays + frangoDays + suinaDays
  };
}

/**
 * Calcula a distribuição de dias entre Arroz, Macarrão e Batata-Doce para o período selecionado.
 * Presets:
 * - 'padrao': 100% Arroz (fator padrão /2.2)
 * - 'misto': ~3/7 Arroz, ~2/7 Macarrão, ~2/7 Batata-Doce
 * - 'arroz_macarrao': 50% Arroz, 50% Macarrão
 * - 'arroz_batata': 50% Arroz, 50% Batata-Doce
 * - 'so_macarrao': 100% Macarrão (/2.5)
 * - 'so_batata_doce': 100% Batata-Doce (0.90x c/ casca)
 * - 'so_arroz': 100% Arroz (/2.2)
 * - 'custom': usa os dias { arrozDays, macarraoDays, batataDoceDays } informados pelo usuário
 */
export function resolveCarbDaysSplit(dias = 7, carbSplit = null) {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  if (!carbSplit || typeof carbSplit !== 'object' || !carbSplit.mode || carbSplit.mode === 'padrao') {
    return {
      mode: 'padrao',
      isSplitActive: false,
      arrozDays: safeDias,
      macarraoDays: 0,
      batataDoceDays: 0,
      totalDays: safeDias
    };
  }

  const mode = carbSplit.mode;
  let arrozDays = 0;
  let macarraoDays = 0;
  let batataDoceDays = 0;

  if (mode === 'misto') {
    arrozDays = Math.round((safeDias * 3) / 7);
    batataDoceDays = safeDias >= 3 ? Math.max(1, Math.round((safeDias * 2) / 7)) : 0;
    macarraoDays = Math.max(0, safeDias - arrozDays - batataDoceDays);
  } else if (mode === 'arroz_macarrao') {
    arrozDays = Math.ceil(safeDias / 2);
    macarraoDays = Math.max(0, safeDias - arrozDays);
    batataDoceDays = 0;
  } else if (mode === 'arroz_batata') {
    arrozDays = Math.ceil(safeDias / 2);
    macarraoDays = 0;
    batataDoceDays = Math.max(0, safeDias - arrozDays);
  } else if (mode === 'so_macarrao') {
    arrozDays = 0;
    macarraoDays = safeDias;
    batataDoceDays = 0;
  } else if (mode === 'so_batata_doce') {
    arrozDays = 0;
    macarraoDays = 0;
    batataDoceDays = safeDias;
  } else if (mode === 'so_arroz') {
    arrozDays = safeDias;
    macarraoDays = 0;
    batataDoceDays = 0;
  } else {
    arrozDays = Math.max(0, Math.round(Number(carbSplit.arrozDays ?? carbSplit.arroz ?? 0)));
    macarraoDays = Math.max(0, Math.round(Number(carbSplit.macarraoDays ?? carbSplit.macarrao ?? 0)));
    batataDoceDays = Math.max(0, Math.round(Number(carbSplit.batataDoceDays ?? carbSplit.batataDoce ?? 0)));
    if (arrozDays === 0 && macarraoDays === 0 && batataDoceDays === 0) {
      arrozDays = safeDias;
    }
  }

  return {
    mode,
    isSplitActive: true,
    arrozDays,
    macarraoDays,
    batataDoceDays,
    totalDays: arrozDays + macarraoDays + batataDoceDays
  };
}

/**
 * Calcula e permite editar a quantidade de pães no período para Matheus e Scarlet
 * (ex: quando a Scarlet não come pão na semana, come apenas 1/dia ou quando o casal
 * quer digitar uma quantidade personalizada de pães para a lista de compras).
 * Presets:
 * - 'padrao': usa a prescrição diária do cardápio (Matheus 2/dia + Scarlet 2/dia = 28 pães em 7d)
 * - 'scarlet_sem_pao': Scarlet 0 pães no período, Matheus mantém o padrão (14 pães em 7d)
 * - 'scarlet_1_pao': Scarlet 1 pão/dia (7 pães em 7d), Matheus mantém o padrão (21 pães em 7d)
 * - 'sem_pao': 0 pães para ambos
 * - 'custom': permite ajustar individualmente { matheusPaes, scarletPaes } ou { totalPaes }
 */
export function resolveBreadPlan(dias = 7, meals = DEFAULT_NUTRITION_MEALS, person = 'casal', breadOpt = null, escopo = 'completo') {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  const m = (meals && meals.matheus) || DEFAULT_NUTRITION_MEALS.matheus;
  const s = (meals && meals.scarlet) || DEFAULT_NUTRITION_MEALS.scarlet;
  const isJantarOnly = escopo === 'jantar';

  const matheusPaesDia = (isJantarOnly ? 0 : (Number(m?.manha?.paes) || 0)) + (Number(m?.noite?.paes) || 0);
  const scarletPaesDia = (isJantarOnly ? 0 : (Number(s?.manha?.paes) || 0)) + (Number(s?.noite?.paes) || 0);

  const includeMatheus = person === 'casal' || person === 'matheus';
  const includeScarlet = person === 'casal' || person === 'scarlet';

  const defaultMatheusPaes = includeMatheus ? (matheusPaesDia * safeDias) : 0;
  const defaultScarletPaes = includeScarlet ? (scarletPaesDia * safeDias) : 0;
  const defaultTotalPaes = defaultMatheusPaes + defaultScarletPaes;

  if (!breadOpt || typeof breadOpt !== 'object' || !breadOpt.mode || breadOpt.mode === 'padrao') {
    return {
      mode: 'padrao',
      isCustom: false,
      matheusPaes: defaultMatheusPaes,
      scarletPaes: defaultScarletPaes,
      totalPaes: defaultTotalPaes,
      defaultMatheusPaes,
      defaultScarletPaes,
      defaultTotalPaes,
      effectivePerDay: +(defaultTotalPaes / safeDias).toFixed(1)
    };
  }

  const mode = breadOpt.mode;
  let matheusPaes = defaultMatheusPaes;
  let scarletPaes = defaultScarletPaes;

  if (mode === 'scarlet_sem_pao') {
    scarletPaes = 0;
  } else if (mode === 'scarlet_1_pao') {
    scarletPaes = includeScarlet ? safeDias : 0;
  } else if (mode === 'sem_pao') {
    matheusPaes = 0;
    scarletPaes = 0;
  } else {
    if (breadOpt.totalPaes !== undefined && breadOpt.totalPaes !== null && breadOpt.matheusPaes === undefined && breadOpt.scarletPaes === undefined) {
      const targetTotal = Math.max(0, Math.round(Number(breadOpt.totalPaes) || 0));
      if (!includeMatheus) {
        matheusPaes = 0;
        scarletPaes = targetTotal;
      } else if (!includeScarlet) {
        matheusPaes = targetTotal;
        scarletPaes = 0;
      } else {
        // Prioriza manter os pães do Matheus e ajusta a diferença na Scarlet (já que ela às vezes não come pão)
        matheusPaes = Math.min(defaultMatheusPaes, targetTotal);
        scarletPaes = Math.max(0, targetTotal - matheusPaes);
      }
    } else {
      matheusPaes = includeMatheus ? Math.max(0, Math.round(Number(breadOpt.matheusPaes ?? defaultMatheusPaes))) : 0;
      scarletPaes = includeScarlet ? Math.max(0, Math.round(Number(breadOpt.scarletPaes ?? defaultScarletPaes))) : 0;
    }
  }

  const totalPaes = matheusPaes + scarletPaes;
  return {
    mode,
    isCustom: true,
    matheusPaes,
    scarletPaes,
    totalPaes,
    defaultMatheusPaes,
    defaultScarletPaes,
    defaultTotalPaes,
    effectivePerDay: +(totalPaes / safeDias).toFixed(1)
  };
}

/**
 * Calcula o planejamento completo de compras e marmitas para N dias (ex: 3, 7, 15, 30 dias),
 * permite filtrar por grupos específicos e suporta divisão de carnes (Bovina, Frango, Suína),
 * substituição/divisão de carboidratos (Arroz, Macarrão, Batata-Doce) e ajuste de pães.
 */
export function calculateMarmitasPlan(dias = 7, escopo = 'completo', meals = DEFAULT_NUTRITION_MEALS, factors = COOKING_FACTORS, person = 'casal', selectedItems = null, meatSplitOpt = null, selectedHortifruti = null, carbSplitOpt = null, breadOpt = null) {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  const daily = getDailyNutritionSummary(meals, factors, person);
  const isAlmocoOnly = escopo === 'almoco';
  const isJantarOnly = escopo === 'jantar';

  const dailyCarneProntaG = isAlmocoOnly
    ? daily.prontoDiario.carneAlmocoProntaG
    : (isJantarOnly ? daily.prontoDiario.carneNoiteProntaG : daily.prontoDiario.carneTotalProntaG);
  const dailyCarneCruaPadraoG = isAlmocoOnly
    ? daily.inNaturaDiario.carneAlmocoCruaG
    : (isJantarOnly ? daily.inNaturaDiario.carneNoiteCruaG : daily.inNaturaDiario.carneTotalCruaG);

  const bovMult = factors.carneVermelhaCruaMult || factors.carneCruaMult || (900 / 540);
  const frangoMult = factors.frangoCruaMult || (1 / 0.72);
  const suinaMult = factors.carneSuinaCruaMult || (1 / 0.68);

  const rawMeatMode = (meatSplitOpt && typeof meatSplitOpt === 'object') ? meatSplitOpt.mode : 'padrao';
  const isSplitByMeal = !isAlmocoOnly && !isJantarOnly && Boolean(
    meatSplitOpt && (
      meatSplitOpt.splitByMeal === true ||
      rawMeatMode === 'almoco_frango_janta_bovina' ||
      rawMeatMode === 'almoco_bovina_janta_frango' ||
      rawMeatMode === 'split_meal'
    )
  );

  const buildMealMeatDetails = (dailyMealProntaG, mealSplitObj) => {
    const bp = dailyMealProntaG * mealSplitObj.bovinaDays;
    const bc = Math.round(bp * bovMult);
    const fp = dailyMealProntaG * mealSplitObj.frangoDays;
    const fc = Math.round(fp * frangoMult);
    const sp = dailyMealProntaG * mealSplitObj.suinaDays;
    const sc = Math.round(sp * suinaMult);
    return {
      mode: mealSplitObj.mode,
      totalDays: mealSplitObj.totalDays,
      dailyProntaG: dailyMealProntaG,
      bovina: { days: mealSplitObj.bovinaDays, prontaG: bp, cruaG: bc, cruaKg: parseFloat((bc / 1000).toFixed(2)), cruaKgStr: (bc / 1000).toFixed(2) },
      frango: { days: mealSplitObj.frangoDays, prontaG: fp, cruaG: fc, cruaKg: parseFloat((fc / 1000).toFixed(2)), cruaKgStr: (fc / 1000).toFixed(2) },
      suina: { days: mealSplitObj.suinaDays, prontaG: sp, cruaG: sc, cruaKg: parseFloat((sc / 1000).toFixed(2)), cruaKgStr: (sc / 1000).toFixed(2) }
    };
  };

  let split;
  let almocoMeatDetails = null;
  let jantarMeatDetails = null;
  let bovinaProntaG = 0;
  let bovinaCruaG = 0;
  let frangoProntaG = 0;
  let frangoCruaG = 0;
  let suinaProntaG = 0;
  let suinaCruaG = 0;

  if (isSplitByMeal) {
    const defaultAlmocoOpt = rawMeatMode === 'almoco_bovina_janta_frango'
      ? { mode: 'so_bovina' }
      : { mode: 'so_frango' };
    const defaultJantarOpt = rawMeatMode === 'almoco_bovina_janta_frango'
      ? { mode: 'so_frango' }
      : { mode: 'so_bovina' };

    const almocoSplit = resolveMeatDaysSplit(
      safeDias,
      (rawMeatMode === 'almoco_frango_janta_bovina' || rawMeatMode === 'almoco_bovina_janta_frango')
        ? defaultAlmocoOpt
        : (meatSplitOpt.almoco || defaultAlmocoOpt)
    );
    const jantarSplit = resolveMeatDaysSplit(
      safeDias,
      (rawMeatMode === 'almoco_frango_janta_bovina' || rawMeatMode === 'almoco_bovina_janta_frango')
        ? defaultJantarOpt
        : (meatSplitOpt.jantar || defaultJantarOpt)
    );

    almocoMeatDetails = buildMealMeatDetails(daily.prontoDiario.carneAlmocoProntaG, almocoSplit);
    jantarMeatDetails = buildMealMeatDetails(daily.prontoDiario.carneNoiteProntaG, jantarSplit);

    bovinaProntaG = almocoMeatDetails.bovina.prontaG + jantarMeatDetails.bovina.prontaG;
    bovinaCruaG = almocoMeatDetails.bovina.cruaG + jantarMeatDetails.bovina.cruaG;
    frangoProntaG = almocoMeatDetails.frango.prontaG + jantarMeatDetails.frango.prontaG;
    frangoCruaG = almocoMeatDetails.frango.cruaG + jantarMeatDetails.frango.cruaG;
    suinaProntaG = almocoMeatDetails.suina.prontaG + jantarMeatDetails.suina.prontaG;
    suinaCruaG = almocoMeatDetails.suina.cruaG + jantarMeatDetails.suina.cruaG;

    split = {
      mode: rawMeatMode || 'split_meal',
      isSplitActive: true,
      splitByMeal: true,
      bovinaDays: Math.max(almocoSplit.bovinaDays, jantarSplit.bovinaDays),
      frangoDays: Math.max(almocoSplit.frangoDays, jantarSplit.frangoDays),
      suinaDays: Math.max(almocoSplit.suinaDays, jantarSplit.suinaDays),
      totalDays: safeDias
    };
  } else {
    split = resolveMeatDaysSplit(safeDias, meatSplitOpt);
    bovinaProntaG = dailyCarneProntaG * split.bovinaDays;
    bovinaCruaG = split.isSplitActive
      ? Math.round(bovinaProntaG * bovMult)
      : dailyCarneCruaPadraoG * safeDias;
    frangoProntaG = dailyCarneProntaG * split.frangoDays;
    frangoCruaG = Math.round(frangoProntaG * frangoMult);
    suinaProntaG = dailyCarneProntaG * split.suinaDays;
    suinaCruaG = Math.round(suinaProntaG * suinaMult);
  }

  // Carnes consolidadas
  const carneProntaG = split.isSplitActive
    ? (bovinaProntaG + frangoProntaG + suinaProntaG)
    : (dailyCarneProntaG * safeDias);
  const carneCruaG = split.isSplitActive
    ? (bovinaCruaG + frangoCruaG + suinaCruaG)
    : (dailyCarneCruaPadraoG * safeDias);
  const carneCruaKg = (carneCruaG / 1000).toFixed(2);

  const meatBreakdown = {
    mode: split.mode,
    isSplitActive: split.isSplitActive,
    splitByMeal: isSplitByMeal,
    totalDays: split.totalDays,
    almoco: almocoMeatDetails,
    jantar: jantarMeatDetails,
    bovina: {
      days: split.bovinaDays,
      almocoDays: almocoMeatDetails ? almocoMeatDetails.bovina.days : split.bovinaDays,
      jantarDays: jantarMeatDetails ? jantarMeatDetails.bovina.days : split.bovinaDays,
      prontaG: bovinaProntaG,
      cruaG: bovinaCruaG,
      cruaKg: parseFloat((bovinaCruaG / 1000).toFixed(2)),
      cruaKgStr: (bovinaCruaG / 1000).toFixed(2)
    },
    frango: {
      days: split.frangoDays,
      almocoDays: almocoMeatDetails ? almocoMeatDetails.frango.days : split.frangoDays,
      jantarDays: jantarMeatDetails ? jantarMeatDetails.frango.days : split.frangoDays,
      prontaG: frangoProntaG,
      cruaG: frangoCruaG,
      cruaKg: parseFloat((frangoCruaG / 1000).toFixed(2)),
      cruaKgStr: (frangoCruaG / 1000).toFixed(2)
    },
    suina: {
      days: split.suinaDays,
      almocoDays: almocoMeatDetails ? almocoMeatDetails.suina.days : split.suinaDays,
      jantarDays: jantarMeatDetails ? jantarMeatDetails.suina.days : split.suinaDays,
      prontaG: suinaProntaG,
      cruaG: suinaCruaG,
      cruaKg: parseFloat((suinaCruaG / 1000).toFixed(2)),
      cruaKgStr: (suinaCruaG / 1000).toFixed(2)
    }
  };

  // Arroz, Feijão e substituição/divisão de carboidrato do almoço (zerados quando escopo === 'jantar')
  const arrozDiv = factors.arrozCruDiv || 2.2;
  const macDiv = factors.macarraoCruDiv || 2.5;
  const batRend = factors.batataDoceBrutaRend || 0.90;

  const cSplit = resolveCarbDaysSplit(safeDias, carbSplitOpt);
  const dailyCarboBaseProntoG = isJantarOnly
    ? 0
    : ((daily.prontoDiario.arrozAlmocoProntoG || 0)
      + (daily.prontoDiario.macarraoAlmocoProntoG || 0)
      + (daily.prontoDiario.batataDoceAlmocoProntaG || 0));

  const arrozProntoG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? (dailyCarboBaseProntoG * cSplit.arrozDays)
      : (daily.prontoDiario.arrozAlmocoProntoG * safeDias));
  const arrozCruG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? Math.round(arrozProntoG / arrozDiv)
      : (daily.inNaturaDiario.arrozCruG * safeDias));
  const arrozCruKg = (arrozCruG / 1000).toFixed(2);
  const arrozPacotes1Kg = arrozCruG > 0 ? Math.ceil(arrozCruG / 1000) : 0;

  const feijaoProntoG = isJantarOnly ? 0 : (daily.prontoDiario.feijaoAlmocoProntoG * safeDias);
  const feijaoCruG = isJantarOnly ? 0 : (daily.inNaturaDiario.feijaoCruG * safeDias);
  const feijaoCruKg = (feijaoCruG / 1000).toFixed(2);
  const feijaoPacotes1Kg = feijaoCruG > 0 ? Math.ceil(feijaoCruG / 1000) : 0;

  const macarraoProntoG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? (dailyCarboBaseProntoG * cSplit.macarraoDays)
      : ((daily.prontoDiario.macarraoAlmocoProntoG || 0) * safeDias));
  const macarraoCruG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? Math.round(macarraoProntoG / macDiv)
      : ((daily.inNaturaDiario.macarraoCruG || 0) * safeDias));

  const batataDoceProntaG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? (dailyCarboBaseProntoG * cSplit.batataDoceDays)
      : ((daily.prontoDiario.batataDoceAlmocoProntaG || 0) * safeDias));
  const batataDoceCruaG = isJantarOnly
    ? 0
    : (cSplit.isSplitActive
      ? Math.round(batataDoceProntaG / batRend)
      : ((daily.inNaturaDiario.batataDoceCruaG || 0) * safeDias));

  const legumesProntoG = isJantarOnly ? 0 : ((daily.prontoDiario.legumesAlmocoProntoG || 0) * safeDias);
  const legumesCruG = isJantarOnly ? 0 : ((daily.inNaturaDiario.legumesCruG || 0) * safeDias);

  const fullPeriodCarboProntoG = dailyCarboBaseProntoG * safeDias;
  const equivArrozCruG = isJantarOnly
    ? 0
    : (daily.inNaturaDiario.arrozCruG > 0
      ? (daily.inNaturaDiario.arrozCruG * safeDias)
      : Math.round(fullPeriodCarboProntoG / arrozDiv));
  const equivMacarraoCruG = isJantarOnly ? 0 : Math.round(fullPeriodCarboProntoG / macDiv);
  const equivBatataCruaG = isJantarOnly ? 0 : Math.round(fullPeriodCarboProntoG / batRend);

  const carbBreakdown = {
    mode: cSplit.mode,
    isSplitActive: cSplit.isSplitActive,
    totalDays: cSplit.totalDays,
    totalProntoG: arrozProntoG + macarraoProntoG + batataDoceProntaG,
    totalCruG: arrozCruG + macarraoCruG + batataDoceCruaG,
    equivFullPeriod: {
      arrozCruG: equivArrozCruG,
      macarraoCruG: equivMacarraoCruG,
      batataDoceCruaG: equivBatataCruaG,
      batataDoceCruaKgStr: (equivBatataCruaG / 1000).toFixed(2)
    },
    arroz: {
      days: cSplit.arrozDays,
      prontoG: arrozProntoG,
      cruG: arrozCruG,
      pacotes1Kg: arrozPacotes1Kg
    },
    macarrao: {
      days: cSplit.macarraoDays,
      prontoG: macarraoProntoG,
      cruG: macarraoCruG,
      pacotes500g: macarraoCruG > 0 ? Math.max(1, Math.ceil(macarraoCruG / 500)) : 0
    },
    batataDoce: {
      days: cSplit.batataDoceDays,
      prontaG: batataDoceProntaG,
      cruaG: batataDoceCruaG,
      cruaKg: parseFloat((batataDoceCruaG / 1000).toFixed(2)),
      cruaKgStr: (batataDoceCruaG / 1000).toFixed(2)
    }
  };

  // Outros itens (se escopo completo ou jantar)
  const breadBreakdown = resolveBreadPlan(safeDias, meals, person, breadOpt, escopo);
  const paes = isAlmocoOnly ? 0 : breadBreakdown.totalPaes;
  const frutas = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.frutasTotal * safeDias;
  const yopro = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.yoproTotal * safeDias;
  const wheyG = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.wheyTotalG * safeDias;
  const leiteEmPoG = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.leiteEmPoTotalG * safeDias;
  const ovos = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.ovosTotal * safeDias;
  const queijoG = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.queijoTotalG * safeDias;
  const requeijaoG = (isAlmocoOnly || isJantarOnly) ? 0 : daily.prontoDiario.requeijaoTotalG * safeDias;

  // Itens sugeridos para a Lista de Mercado (só entram os que têm consumo > 0;
  // antes um dia sem carne gerava "Carne 0.00 kg" por R$ 38 no mercado).
  const allShoppingItems = [];

  const buildMeatNotes = (typeKey, labelName, itemInfo) => {
    if (isSplitByMeal && almocoMeatDetails && jantarMeatDetails) {
      const a = almocoMeatDetails[typeKey];
      const j = jantarMeatDetails[typeKey];
      const parts = [];
      if (a.cruaG > 0) parts.push(`Almoço: ${a.cruaKgStr}kg (${a.days}d)`);
      if (j.cruaG > 0) parts.push(`Jantar: ${j.cruaKgStr}kg (${j.days}d)`);
      return `${parts.join(' + ')}. Rende ~${(itemInfo.prontaG / 1000).toFixed(2)} kg pronta.`;
    }
    const mealScopeText = isAlmocoOnly ? 'almoço' : (isJantarOnly ? 'jantar/noite' : 'almoço + noite');
    return `Para ${itemInfo.days} ${itemInfo.days === 1 ? 'dia' : 'dias'} de ${labelName} (${mealScopeText}). Rende ~${(itemInfo.prontaG / 1000).toFixed(2)} kg pronta.`;
  };

  if (carneCruaG > 0) {
    if (split.isSplitActive) {
      if (meatBreakdown.bovina.cruaG > 0) {
        allShoppingItems.push({
          groupKey: 'carne',
          title: `Carne Bovina in natura (${meatBreakdown.bovina.cruaKgStr} kg)`,
          name: `Carne Bovina in natura`,
          category: 'carnes',
          quantity: `${meatBreakdown.bovina.cruaKgStr} kg`,
          notes: buildMeatNotes('bovina', 'carne vermelha', meatBreakdown.bovina),
          estimatedUnitPrice: 42.00
        });
      }
      if (meatBreakdown.frango.cruaG > 0) {
        allShoppingItems.push({
          groupKey: 'carne',
          title: `Peito de Frango in natura (${meatBreakdown.frango.cruaKgStr} kg)`,
          name: `Peito de Frango in natura`,
          category: 'carnes',
          quantity: `${meatBreakdown.frango.cruaKgStr} kg`,
          notes: buildMeatNotes('frango', 'frango', meatBreakdown.frango),
          estimatedUnitPrice: 22.00
        });
      }
      if (meatBreakdown.suina.cruaG > 0) {
        allShoppingItems.push({
          groupKey: 'carne',
          title: `Carne Suína in natura (${meatBreakdown.suina.cruaKgStr} kg)`,
          name: `Carne Suína in natura`,
          category: 'carnes',
          quantity: `${meatBreakdown.suina.cruaKgStr} kg`,
          notes: buildMeatNotes('suina', 'carne suína', meatBreakdown.suina),
          estimatedUnitPrice: 24.00
        });
      }
    } else {
      const mealScopeDesc = isAlmocoOnly ? 'apenas marmitas de almoço' : (isJantarOnly ? 'apenas pães com carne do jantar' : 'almoço + pão da noite');
      allShoppingItems.push({
        groupKey: 'carne',
        title: `Carne / Frango in natura (${carneCruaKg} kg)`,
        name: `Carne / Frango in natura`,
        category: 'carnes',
        quantity: `${carneCruaKg} kg`,
        notes: `Para ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} (${mealScopeDesc}). Rende ~${(carneProntaG / 1000).toFixed(2)} kg pronto.`,
        estimatedUnitPrice: 38.00
      });
    }
  }

  if (arrozCruG > 0) {
    const arrozDiasVal = cSplit.isSplitActive ? cSplit.arrozDays : safeDias;
    allShoppingItems.push({
      groupKey: 'arroz',
      title: `Arroz in natura (${arrozPacotes1Kg} pct de 1kg)`,
      name: `Arroz in natura`,
      category: 'mercado',
      quantity: `${arrozPacotes1Kg} kg`,
      notes: `Consumo exato: ${arrozCruG}g cru para ${arrozDiasVal} ${arrozDiasVal === 1 ? 'dia' : 'dias'} de marmita (${arrozProntoG}g pronto).`,
      estimatedUnitPrice: 6.50
    });
  }

  if (macarraoCruG > 0) {
    const pct500 = Math.max(1, Math.ceil(macarraoCruG / 500));
    const macDiasVal = cSplit.isSplitActive ? cSplit.macarraoDays : safeDias;
    allShoppingItems.push({
      groupKey: 'arroz',
      title: `Macarrão in natura (${macarraoCruG}g / ~${pct500} pct 500g)`,
      name: `Macarrão in natura`,
      category: 'mercado',
      quantity: `${pct500} pct`,
      notes: `Consumo exato: ${macarraoCruG}g cru para ${macDiasVal} ${macDiasVal === 1 ? 'dia' : 'dias'} (${macarraoProntoG}g cozido).`,
      estimatedUnitPrice: 5.50
    });
  }

  if (batataDoceCruaG > 0) {
    const batKg = (batataDoceCruaG / 1000).toFixed(2);
    const batDiasVal = cSplit.isSplitActive ? cSplit.batataDoceDays : safeDias;
    allShoppingItems.push({
      groupKey: 'arroz',
      title: `Batata-Doce in natura (${batKg} kg)`,
      name: `Batata-Doce in natura`,
      category: 'hortifruti',
      quantity: `${batKg} kg`,
      notes: `Compra com casca: ${batataDoceCruaG}g para render ${batataDoceProntaG}g cozida em ${batDiasVal} ${batDiasVal === 1 ? 'dia' : 'dias'}.`,
      estimatedUnitPrice: 6.00
    });
  }

  if (feijaoCruG > 0) {
    allShoppingItems.push({
      groupKey: 'feijao',
      title: `Feijão in natura (${feijaoPacotes1Kg} pct de 1kg)`,
      name: `Feijão in natura`,
      category: 'mercado',
      quantity: `${feijaoPacotes1Kg} kg`,
      notes: `Consumo exato: ${feijaoCruG}g cru para ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} de marmita (${feijaoProntoG}g pronto).`,
      estimatedUnitPrice: 8.90
    });
  }

  const targetLabel = person === 'matheus' ? 'para Matheus' : (person === 'scarlet' ? 'para Scarlet' : 'para o casal');
  const hortiSet = resolveSelectedHortifruti(selectedHortifruti);
  const hortifrutiItems = HORTIFRUTI_WEEKLY_CATALOG.map(entry => {
    const q = entry.calcQty(safeDias, person);
    return {
      ...entry,
      selected: hortiSet.has(entry.id),
      qtyNum: q.qtyNum,
      qtyText: q.qtyText,
      label: q.label
    };
  });

  if (!isAlmocoOnly && !isJantarOnly) {
    if (paes > 0) {
      const breadDetailNotes = breadBreakdown.isCustom
        ? `Ajustado: Matheus ${breadBreakdown.matheusPaes} un • Scarlet ${breadBreakdown.scarletPaes} un (${safeDias} ${safeDias === 1 ? 'dia' : 'dias'}).`
        : `${daily.prontoDiario.paesTotal} pães por dia ${targetLabel} (Matheus ${breadBreakdown.matheusPaes} un + Scarlet ${breadBreakdown.scarletPaes} un).`;
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        title: `Pães franceses / forma (${paes} un)`,
        name: `Pão`,
        category: 'padaria',
        quantity: `${paes} un`,
        notes: breadDetailNotes,
        estimatedUnitPrice: 0.90
      });
    }

    // Frutas semanais reais selecionadas pelo casal (Banana, Maçã, Uvas 500g, Mamão Papaia, e opcionais Morango Congelado / Melancia)
    const selectedFruits = hortifrutiItems.filter(it => it.section === 'frutas' && it.selected);
    if (selectedFruits.length > 0) {
      selectedFruits.forEach(fr => {
        allShoppingItems.push({
          groupKey: 'paes_frutas',
          hortiId: fr.id,
          title: fr.label,
          name: fr.name,
          category: 'hortifruti',
          quantity: fr.qtyText,
          notes: `${fr.notes} (${safeDias} ${safeDias === 1 ? 'dia' : 'dias'}).`,
          estimatedUnitPrice: fr.unitPrice
        });
      });
    } else if (frutas > 0 && !Array.isArray(selectedHortifruti)) {
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        title: `Frutas da semana (banana, maçã) (${frutas} un)`,
        name: `Frutas variadas`,
        category: 'hortifruti',
        quantity: `${frutas} un`,
        notes: `${daily.prontoDiario.frutasTotal} frutas ao dia ${targetLabel}.`,
        estimatedUnitPrice: 1.20
      });
    }

    if (yopro > 0) {
      allShoppingItems.push({
        groupKey: 'laticinios',
        title: `YoPRO Piracanjuba Líquido 15-22g (${yopro} caixinhas)`,
        name: `YoPRO Piracanjuba Líquido`,
        category: 'bebidas',
        quantity: `${yopro} un`,
        notes: `${daily.prontoDiario.yoproTotal} por dia ${targetLabel} à tarde.`,
        estimatedUnitPrice: 9.90
      });
    }

    if (wheyG > 0) {
      allShoppingItems.push({
        groupKey: 'laticinios',
        title: `Whey Protein em Pó (${wheyG}g)`,
        name: `Whey Protein`,
        category: 'mercado',
        quantity: `${Math.ceil(wheyG)}g`,
        notes: `${daily.prontoDiario.wheyTotalG}g/dia ${targetLabel} à tarde.`,
        estimatedUnitPrice: 0.12
      });
    }

    if (ovos > 0) {
      const cartelas = Math.ceil(ovos / 30);
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        title: `Ovos (${ovos} un / ~${cartelas} cartela)`,
        name: `Ovos`,
        category: 'mercado',
        quantity: `${ovos} un`,
        notes: `Café da manhã ${targetLabel}.`,
        estimatedUnitPrice: 0.80
      });
    }

    if (requeijaoG > 0) {
      const potes = Math.ceil(requeijaoG / 200);
      allShoppingItems.push({
        groupKey: 'laticinios',
        title: `Requeijão cremoso (${potes} pote${potes > 1 ? 's' : ''} de 200g)`,
        name: `Requeijão`,
        category: 'frios',
        quantity: `${potes} un`,
        notes: `Consumo: ${requeijaoG}g em ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'}.`,
        estimatedUnitPrice: 8.50
      });
    }

    if (queijoG > 0) {
      allShoppingItems.push({
        groupKey: 'laticinios',
        title: `Queijo fatiado (${queijoG}g)`,
        name: `Queijo fatiado`,
        category: 'frios',
        quantity: `${queijoG}g`,
        notes: `Café da manhã ${targetLabel}.`,
        estimatedUnitPrice: 0.05
      });
    }

    // Legumes para cozinhar nas marmitas (Cenoura, Beterraba, Chuchu) e Saladas (Alface, Tomate, Tomate Cereja)
    const selectedVeggiesAndSalads = hortifrutiItems.filter(it => (it.section === 'legumes' || it.section === 'saladas') && it.selected);
    selectedVeggiesAndSalads.forEach(vg => {
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        hortiId: vg.id,
        title: vg.label,
        name: vg.name,
        category: 'hortifruti',
        quantity: vg.qtyText,
        notes: `${vg.notes} (${safeDias} ${safeDias === 1 ? 'dia' : 'dias'}).`,
        estimatedUnitPrice: vg.unitPrice
      });
    });
  } else if (isJantarOnly) {
    if (paes > 0) {
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        title: `Pães para o jantar (${paes} un)`,
        name: `Pão`,
        category: 'padaria',
        quantity: `${paes} un`,
        notes: `Pães do jantar: Matheus ${breadBreakdown.matheusPaes} un • Scarlet ${breadBreakdown.scarletPaes} un (${safeDias} ${safeDias === 1 ? 'noite' : 'noites'}).`,
        estimatedUnitPrice: 0.90
      });
    }
  } else {
    // Mesmo no modo "Só Marmitas de Almoço", inclui os legumes para cozinhar nas marmitas (Cenoura, Beterraba, Chuchu) se o grupo paes_frutas estiver ativo
    const selectedCookingVeggies = hortifrutiItems.filter(it => it.section === 'legumes' && it.selected);
    selectedCookingVeggies.forEach(vg => {
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        hortiId: vg.id,
        title: vg.label,
        name: vg.name,
        category: 'hortifruti',
        quantity: vg.qtyText,
        notes: `${vg.notes} (${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} de marmita).`,
        estimatedUnitPrice: vg.unitPrice
      });
    });
  }

  const activeSet = selectedItems
    ? new Set(Array.isArray(selectedItems) ? selectedItems : Array.from(selectedItems))
    : null;
  const shoppingItems = activeSet
    ? allShoppingItems.filter(it => activeSet.has(it.groupKey))
    : allShoppingItems;

  return {
    dias: safeDias,
    escopo,
    meatBreakdown,
    carbBreakdown,
    breadBreakdown,
    hortifrutiItems,
    totaisProntos: {
      carneProntaG,
      arrozProntoG,
      feijaoProntoG,
      macarraoProntoG,
      batataDoceProntaG,
      legumesProntoG,
      paes,
      frutas,
      yopro,
      wheyG,
      leiteEmPoG,
      ovos,
      queijoG,
      requeijaoG
    },
    totaisInNatura: {
      carneCruaG,
      carneCruaKg: parseFloat(carneCruaKg),
      arrozCruG,
      arrozCruKg: parseFloat(arrozCruKg),
      arrozPacotes1Kg,
      feijaoCruG,
      feijaoCruKg: parseFloat(feijaoCruKg),
      feijaoPacotes1Kg,
      macarraoCruG,
      batataDoceCruaG,
      legumesCruG
    },
    shoppingItems,
    allShoppingItems
  };
}

/**
 * Planejador de Produção e Montagem de Marmitas (Potes da Semana):
 * Calcula quantos potes montar para Matheus e para Scarlet, a pesagem exata por pote
 * na balança, a divisão de potes por tipo de carne (Bovina, Frango, Suína) e o checklist da fornada.
 */
export function calculateMarmitasProductionPlan({
  dias = 7,
  meals = DEFAULT_NUTRITION_MEALS,
  factors = COOKING_FACTORS,
  meatSplit = null,
  carbSplit = null,
  person = 'casal'
} = {}) {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  const rawMeatMode = (meatSplit && typeof meatSplit === 'object') ? meatSplit.mode : 'padrao';
  const effectiveLunchMeatSplit = (meatSplit && (meatSplit.splitByMeal || rawMeatMode === 'almoco_frango_janta_bovina' || rawMeatMode === 'almoco_bovina_janta_frango' || rawMeatMode === 'split_meal'))
    ? (rawMeatMode === 'almoco_bovina_janta_frango'
      ? { mode: 'so_bovina' }
      : (rawMeatMode === 'almoco_frango_janta_bovina'
        ? { mode: 'so_frango' }
        : (meatSplit.almoco || { mode: 'so_frango' })))
    : meatSplit;
  const split = resolveMeatDaysSplit(safeDias, effectiveLunchMeatSplit);
  const effDays = split.isSplitActive ? Math.max(1, split.totalDays) : safeDias;
  const cSplit = resolveCarbDaysSplit(effDays, carbSplit);

  const bovMult = factors.carneVermelhaCruaMult || factors.carneCruaMult || (900 / 540);
  const frangoMult = factors.frangoCruaMult || (1 / 0.72);
  const suinaMult = factors.carneSuinaCruaMult || (1 / 0.68);
  const arrozDiv = factors.arrozCruDiv || 2.2;
  const feijaoDiv = factors.feijaoCruDiv || 2.6;
  const macDiv = factors.macarraoCruDiv || 2.5;
  const batRend = factors.batataDoceBrutaRend || 0.90;

  const buildPersonPot = (key, pMeals) => {
    const alm = (pMeals && pMeals.almoco) || {};
    const noi = (pMeals && pMeals.noite) || {};
    const arrozG = Number(alm.arrozProntoG) || 0;
    const feijaoG = Number(alm.feijaoProntoG) || 0;
    const carneG = Number(alm.carneProntaG) || 0;
    const macarraoG = Number(alm.macarraoProntoG) || 0;
    const batataDoceG = Number(alm.batataDoceProntaG) || 0;
    const legumesG = Number(alm.legumesProntoG) || 0;
    const carboBaseG = arrozG + macarraoG + batataDoceG;
    const totalPoteG = arrozG + feijaoG + carneG + macarraoG + batataDoceG + legumesG;
    const carneNoiteG = Number(noi.carneProntaG) || 0;

    return {
      key,
      nome: pMeals?.nome || (key === 'scarlet' ? 'Scarlet' : 'Matheus'),
      avatar: pMeals?.avatar || (key === 'scarlet' ? '👩‍💼' : '👨‍💻'),
      potesCount: effDays,
      porPote: {
        arrozG,
        feijaoG,
        carneG,
        macarraoG,
        batataDoceG,
        carboBaseG,
        legumesG,
        totalPoteG
      },
      potesPorCarne: {
        bovina: split.bovinaDays,
        frango: split.frangoDays,
        suina: split.suinaDays
      },
      potesPorCarbo: {
        arroz: cSplit.arrozDays,
        macarrao: cSplit.macarraoDays,
        batataDoce: cSplit.batataDoceDays
      },
      carneNoiteDiariaG: carneNoiteG
    };
  };

  const matheusPot = buildPersonPot('matheus', meals.matheus || DEFAULT_NUTRITION_MEALS.matheus);
  const scarletPot = buildPersonPot('scarlet', meals.scarlet || DEFAULT_NUTRITION_MEALS.scarlet);

  const includeMatheus = person === 'casal' || person === 'matheus';
  const includeScarlet = person === 'casal' || person === 'scarlet';
  const activePersons = [
    ...(includeMatheus ? [matheusPot] : []),
    ...(includeScarlet ? [scarletPot] : [])
  ];

  const totalPotes = activePersons.reduce((acc, p) => acc + p.potesCount, 0);
  const dailyAlmocoCarneG = activePersons.reduce((acc, p) => acc + p.porPote.carneG, 0);
  const dailyNoiteCarneG = activePersons.reduce((acc, p) => acc + p.carneNoiteDiariaG, 0);
  const dailyArrozG = activePersons.reduce((acc, p) => acc + p.porPote.arrozG, 0);
  const dailyFeijaoG = activePersons.reduce((acc, p) => acc + p.porPote.feijaoG, 0);
  const dailyMacarraoG = activePersons.reduce((acc, p) => acc + p.porPote.macarraoG, 0);
  const dailyBatataDoceG = activePersons.reduce((acc, p) => acc + p.porPote.batataDoceG, 0);
  const dailyCarboBaseG = activePersons.reduce((acc, p) => acc + p.porPote.carboBaseG, 0);
  const dailyLegumesG = activePersons.reduce((acc, p) => acc + p.porPote.legumesG, 0);

  const fornadaArrozProntoG = cSplit.isSplitActive ? (dailyCarboBaseG * cSplit.arrozDays) : (dailyArrozG * effDays);
  const fornadaMacarraoProntoG = cSplit.isSplitActive ? (dailyCarboBaseG * cSplit.macarraoDays) : (dailyMacarraoG * effDays);
  const fornadaBatataDoceProntaG = cSplit.isSplitActive ? (dailyCarboBaseG * cSplit.batataDoceDays) : (dailyBatataDoceG * effDays);

  const fornada = {
    arrozProntoG: fornadaArrozProntoG,
    arrozCruG: Math.round(fornadaArrozProntoG / arrozDiv),
    feijaoProntoG: dailyFeijaoG * effDays,
    feijaoCruG: Math.round((dailyFeijaoG * effDays) / feijaoDiv),
    macarraoProntoG: fornadaMacarraoProntoG,
    macarraoCruG: Math.round(fornadaMacarraoProntoG / macDiv),
    batataDoceProntaG: fornadaBatataDoceProntaG,
    batataDoceCruaG: Math.round(fornadaBatataDoceProntaG / batRend),
    legumesProntoG: dailyLegumesG * effDays,
    carneAlmocoProntaG: dailyAlmocoCarneG * effDays,
    carneNoiteProntaG: dailyNoiteCarneG * effDays,
    bovina: {
      days: split.bovinaDays,
      potesTotal: split.bovinaDays * activePersons.length,
      almocoProntaG: dailyAlmocoCarneG * split.bovinaDays,
      almocoCruaG: Math.round(dailyAlmocoCarneG * split.bovinaDays * bovMult)
    },
    frango: {
      days: split.frangoDays,
      potesTotal: split.frangoDays * activePersons.length,
      almocoProntaG: dailyAlmocoCarneG * split.frangoDays,
      almocoCruaG: Math.round(dailyAlmocoCarneG * split.frangoDays * frangoMult)
    },
    suina: {
      days: split.suinaDays,
      potesTotal: split.suinaDays * activePersons.length,
      almocoProntaG: dailyAlmocoCarneG * split.suinaDays,
      almocoCruaG: Math.round(dailyAlmocoCarneG * split.suinaDays * suinaMult)
    }
  };
  fornada.carneAlmocoCruaTotalG = fornada.bovina.almocoCruaG + fornada.frango.almocoCruaG + fornada.suina.almocoCruaG;

  const carboTitleParts = [
    fornada.arrozProntoG > 0 ? `${fornada.arrozCruG}g arroz cru → ~${fornada.arrozProntoG}g cozido` : '',
    fornada.macarraoProntoG > 0 ? `${fornada.macarraoCruG}g macarrão cru → ~${fornada.macarraoProntoG}g cozido` : '',
    fornada.batataDoceProntaG > 0 ? `${fornada.batataDoceCruaG}g batata-doce → ~${fornada.batataDoceProntaG}g cozida` : ''
  ].filter(Boolean);

  const checklistSteps = [
    {
      id: 'prep_carnes_descongelar',
      icon: '🥩',
      title: `Separar e temperar carnes das marmitas (${(fornada.carneAlmocoCruaTotalG / 1000).toFixed(2)} kg crua p/ almoço)`,
      detail: [
        fornada.bovina.days > 0 ? `🥩 Bovina: ${fornada.bovina.almocoCruaG}g crua → ${fornada.bovina.almocoProntaG}g pronta (${fornada.bovina.potesTotal} potes)` : '',
        fornada.frango.days > 0 ? `🍗 Frango: ${fornada.frango.almocoCruaG}g cru → ${fornada.frango.almocoProntaG}g pronto (${fornada.frango.potesTotal} potes)` : '',
        fornada.suina.days > 0 ? `🐷 Suína: ${fornada.suina.almocoCruaG}g crua → ${fornada.suina.almocoProntaG}g pronta (${fornada.suina.potesTotal} potes)` : ''
      ].filter(Boolean).join(' • ') || 'Sem carne no almoço'
    },
    {
      id: 'prep_arroz_carbo',
      icon: '🍚',
      title: `Cozinhar base de carboidrato (${carboTitleParts.join(' + ') || '0g'})`,
      detail: [
        fornada.arrozProntoG > 0 ? `🍚 Arroz (${cSplit.arrozDays}d): ${matheusPot.porPote.carboBaseG}g/pote Matheus • ${scarletPot.porPote.carboBaseG}g/pote Scarlet` : '',
        fornada.macarraoProntoG > 0 ? `🍝 Macarrão (${cSplit.macarraoDays}d): ${fornada.macarraoCruG}g cru → ${fornada.macarraoProntoG}g cozido` : '',
        fornada.batataDoceProntaG > 0 ? `🍠 Batata-doce (${cSplit.batataDoceDays}d): ${fornada.batataDoceCruaG}g bruta → ${fornada.batataDoceProntaG}g cozida` : ''
      ].filter(Boolean).join(' • ') || 'Carboidrato zerado'
    },
    {
      id: 'prep_feijao',
      icon: '🫘',
      title: `Cozinhar feijão na pressão (${fornada.feijaoCruG}g cru → ~${fornada.feijaoProntoG}g cozido)`,
      detail: `Porcionar ${matheusPot.porPote.feijaoG}g/pote Matheus e ${scarletPot.porPote.feijaoG}g/pote Scarlet`
    },
    {
      id: 'prep_grelhar_carnes',
      icon: '🍳',
      title: `Grelhar / assar as carnes (~${(fornada.carneAlmocoProntaG / 1000).toFixed(2)} kg prontas p/ almoço)`,
      detail: `Porcionar ${matheusPot.porPote.carneG}g/pote Matheus e ${scarletPot.porPote.carneG}g/pote Scarlet`
    },
    {
      id: 'prep_legumes',
      icon: '🥕',
      title: `Cozinhar legumes das marmitas (Cenoura, Beterraba e Chuchu) + higienizar saladas (Alface, Tomate e Tomate Cereja)`,
      detail: fornada.legumesProntoG > 0
        ? `Total da fornada: ${fornada.legumesProntoG}g prontos (${matheusPot.porPote.legumesG}g Matheus • ${scarletPot.porPote.legumesG}g Scarlet)`
        : 'Cozinhar cenoura, beterraba e chuchu para os potes e lavar alface/tomate/tomate cereja'
    },
    {
      id: 'prep_pesar_potes',
      icon: '⚖️',
      title: `Pesar na balança, etiquetar e fechar os ${totalPotes} potes (${effDays} dias)`,
      detail: includeMatheus && includeScarlet
        ? `${matheusPot.potesCount} potes Matheus (${matheusPot.porPote.totalPoteG}g/pote) + ${scarletPot.potesCount} potes Scarlet (${scarletPot.porPote.totalPoteG}g/pote)`
        : `${totalPotes} potes montados e prontos para geladeira/freezer`
    }
  ];

  return {
    dias: effDays,
    person,
    totalPotes,
    matheus: matheusPot,
    scarlet: scarletPot,
    fornada,
    checklistSteps
  };
}

export const SPECIFIC_QUANTITY_ITEMS = [
  'carne_vermelha',
  'suina',
  'frango',
  'arroz',
  'feijao',
  'macarrao',
  'batata_doce'
];

/**
 * Converte uma quantidade específica avulsa entre alimento pronto (cozido) e in natura (cru/seco),
 * calculando também quantas marmitas do almoço essa quantidade rende segundo o cardápio atual.
 */
export function calculateCustomQuantityConversion({
  item = 'carne_vermelha',
  mode = 'pronto_para_cru',
  grams = 500,
  meals = DEFAULT_NUTRITION_MEALS,
  factors = COOKING_FACTORS,
  person = 'casal'
} = {}) {
  const safeGrams = Math.max(1, Math.round(Number(grams) || 0));
  const daily = getDailyNutritionSummary(meals, factors, person);
  const normalizedItem = item === 'carne' ? 'carne_vermelha' : item;

  const bovMult = factors.carneVermelhaCruaMult || factors.carneCruaMult || (900 / 540);
  const suinaMult = factors.carneSuinaCruaMult || (1 / 0.68);
  const frangoMult = factors.frangoCruaMult || (1 / 0.72);
  const arrozDiv = factors.arrozCruDiv || 2.2;
  const feijaoDiv = factors.feijaoCruDiv || 2.6;
  const macDiv = factors.macarraoCruDiv || 2.5;
  const batRend = factors.batataDoceBrutaRend || 0.90;

  const metaMap = {
    carne_vermelha: {
      label: 'Carne Vermelha',
      icon: '🥩',
      category: 'carnes',
      unitPrice: 42.00,
      qtyStyle: 'weight',
      factorLabel: 'rend. ~60% (x1.67 cru/pronto)',
      dailyLunchG: daily.prontoDiario.carneAlmocoProntaG ?? 260,
      toCru: (p) => Math.round(p * bovMult),
      toPronto: (c) => Math.round(c / bovMult)
    },
    suina: {
      label: 'Carne Suína',
      icon: '🐷',
      category: 'carnes',
      unitPrice: 24.00,
      qtyStyle: 'weight',
      factorLabel: 'rend. ~68% (x1.47 cru/pronto)',
      dailyLunchG: daily.prontoDiario.carneAlmocoProntaG ?? 260,
      toCru: (p) => Math.round(p * suinaMult),
      toPronto: (c) => Math.round(c / suinaMult)
    },
    frango: {
      label: 'Frango',
      icon: '🍗',
      category: 'carnes',
      unitPrice: 22.00,
      qtyStyle: 'weight',
      factorLabel: 'rend. ~72% (x1.39 cru/pronto)',
      dailyLunchG: daily.prontoDiario.carneAlmocoProntaG ?? 260,
      toCru: (p) => Math.round(p * frangoMult),
      toPronto: (c) => Math.round(c / frangoMult)
    },
    arroz: {
      label: 'Arroz',
      icon: '🍚',
      category: 'mercado',
      unitPrice: 6.50,
      qtyStyle: 'pack1kg',
      factorLabel: 'rende 2.2x cozido',
      dailyLunchG: daily.prontoDiario.arrozAlmocoProntoG ?? 190,
      toCru: (p) => Math.round(p / arrozDiv),
      toPronto: (c) => Math.round(c * arrozDiv)
    },
    feijao: {
      label: 'Feijão',
      icon: '🫘',
      category: 'mercado',
      unitPrice: 8.90,
      qtyStyle: 'pack1kg',
      factorLabel: 'rende 2.6x cozido',
      dailyLunchG: daily.prontoDiario.feijaoAlmocoProntoG ?? 170,
      toCru: (p) => Math.round(p / feijaoDiv),
      toPronto: (c) => Math.round(c * feijaoDiv)
    },
    macarrao: {
      label: 'Macarrão',
      icon: '🍝',
      category: 'mercado',
      unitPrice: 5.50,
      qtyStyle: 'pack500g',
      factorLabel: 'rende ~2.5x cozido',
      dailyLunchG: daily.prontoDiario.arrozAlmocoProntoG ?? 190,
      toCru: (p) => Math.round(p / macDiv),
      toPronto: (c) => Math.round(c * macDiv)
    },
    batata_doce: {
      label: 'Batata-Doce',
      icon: '🍠',
      category: 'hortifruti',
      unitPrice: 6.00,
      qtyStyle: 'weight',
      factorLabel: 'c/ casca rende ~0.90x cozida',
      dailyLunchG: daily.prontoDiario.arrozAlmocoProntoG ?? 190,
      toCru: (p) => Math.round(p / batRend),
      toPronto: (c) => Math.round(c * batRend)
    }
  };

  const info = metaMap[normalizedItem] || metaMap.carne_vermelha;
  const isCruInput = mode === 'cru_para_pronto';
  const cruG = isCruInput ? safeGrams : info.toCru(safeGrams);
  const prontoG = isCruInput ? info.toPronto(safeGrams) : safeGrams;

  const cruKgStr = (cruG / 1000).toFixed(2);
  const prontoKgStr = (prontoG / 1000).toFixed(2);
  const pac1Kg = Math.ceil(cruG / 1000);
  const pac500g = Math.ceil(cruG / 500);
  const almocosEquivalentes = info.dailyLunchG > 0 ? +(prontoG / info.dailyLunchG).toFixed(1) : 0;

  let shoppingQty = `${cruG}g (~${pac1Kg} pct 1kg)`;
  if (info.qtyStyle === 'weight') {
    shoppingQty = cruG >= 1000 ? `${cruKgStr} kg` : `${cruG}g`;
  } else if (info.qtyStyle === 'pack500g') {
    shoppingQty = `${cruG}g (~${pac500g} pct 500g)`;
  }

  return {
    item: normalizedItem,
    mode,
    inputGrams: safeGrams,
    cruG,
    cruKg: parseFloat(cruKgStr),
    cruKgStr,
    prontoG,
    prontoKgStr,
    pacotes1Kg: pac1Kg,
    pacotes500g: pac500g,
    almocosEquivalentes,
    label: info.label,
    icon: info.icon,
    factorLabel: info.factorLabel,
    shoppingItem: {
      groupKey: normalizedItem,
      title: `${info.label} in natura (${cruG >= 1000 ? `${cruKgStr} kg` : `${cruG}g`})`,
      name: `${info.label} in natura`,
      category: info.category,
      quantity: shoppingQty,
      notes: `Cálculo específico (${info.factorLabel}): ${cruG}g in natura rendem ~${prontoG}g pronto (~${almocosEquivalentes} almoços).`,
      estimatedUnitPrice: info.unitPrice
    }
  };
}
