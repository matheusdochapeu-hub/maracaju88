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
 * Fatores de Cocção & Rendimento estabelecidos pelo casal:
 * - Carne: 540g pronta ≈ 900g crua (fator 1.6667x)
 * - Arroz: 100g cru rende 220g pronto (fator 2.2x -> cru = pronto / 2.2)
 * - Feijão: 100g cru rende 260g pronto (fator 2.6x -> cru = pronto / 2.6)
 */
export const COOKING_FACTORS = {
  carneCruaMult: 900 / 540, // ~1.66667
  arrozCruDiv: 2.2,
  feijaoCruDiv: 2.6
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
    const photo = (!isReset && typeof custom.photo === 'string') ? custom.photo : '';
    const sourceName = (!isReset && typeof custom.sourceName === 'string') ? custom.sourceName : '';
    const rawText = (!isReset && typeof custom.rawText === 'string') ? custom.rawText : '';

    return {
      nome: base.nome,
      avatar: base.avatar,
      sourceName,
      rawText,
      photo,
      updatedAt: custom.updatedAt || null,
      isCustom: !isReset && !!(custom.updatedAt || sourceName || rawText || photo),
      meals: {
        nome: base.nome,
        avatar: base.avatar,
        manha: { ...base.manha, ...(customMeals.manha || {}) },
        almoco: { ...base.almoco, ...(customMeals.almoco || {}) },
        tarde: { ...base.tarde, ...(customMeals.tarde || {}) },
        noite: { ...base.noite, ...(customMeals.noite || {}) }
      }
    };
  };

  return {
    matheus: normalizePerson('matheus'),
    scarlet: normalizePerson('scarlet')
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
  if (!token) return 0;
  const low = String(token).toLowerCase().trim();
  const map = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, 'três': 3, quatro: 4, cinco: 5 };
  if (map[low] !== undefined) return map[low];
  const parsed = parseFloat(low.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractGramsFor(text, ingredientRegex, unitFallback = null) {
  if (!text) return 0;
  // Padrão 1: "100g de arroz" / "100 g arroz" / "100gr de arroz"
  const beforeRe = new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(?:g|gr|gramas?)\\s*(?:de\\s+)?(?:${ingredientRegex})`, 'i');
  const m1 = text.match(beforeRe);
  if (m1) return Math.round(ptNumberToFloat(m1[1]));

  // Padrão 2: "arroz cozido: 100g" / "arroz (100g)"
  const afterRe = new RegExp(`(?:${ingredientRegex})[^\\n;,.]{0,35}?(\\d+(?:[.,]\\d+)?)\\s*(?:g|gr|gramas?)`, 'i');
  const m2 = text.match(afterRe);
  if (m2) return Math.round(ptNumberToFloat(m2[1]));

  // Padrão 3: fallback por medida caseira (ex: fatia, colher, concha, scoop)
  if (unitFallback) {
    const unitRe = new RegExp(`(\\d+|um|uma|dois|duas|tr[eê]s|quatro)\\s*(?:${unitFallback.unitPattern})\\s*(?:de\\s+)?(?:${ingredientRegex})`, 'i');
    const m3 = text.match(unitRe);
    if (m3) return Math.round(ptNumberToFloat(m3[1]) * unitFallback.gramsPerUnit);
  }

  return 0;
}

function extractCountFor(text, ingredientRegex) {
  if (!text) return 0;
  const countRe = new RegExp(`(\\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco)\\s*(?:un(?:idades?)?\\s*(?:de\\s*)?|caixinha[s]?\\s*(?:de\\s*)?|por[cç][aãõ]e?s?\\s*(?:de\\s*)?)?(?:${ingredientRegex})`, 'i');
  const m = text.match(countRe);
  if (m) return Math.round(ptNumberToFloat(m[1]));

  // Se o alimento foi citado sem quantidade numérica explícita, assume 1 unidade
  const bareRe = new RegExp(`(?:^|[\\s,(;])(?:${ingredientRegex})(?=$|[\\s,.;:)])`, 'i');
  if (bareRe.test(text)) return 1;
  return 0;
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
  const hasMatheus = /(?:^|\n)\s*(?:card[aá]pio\s*(?:do\s*)?|di[aá]rio(?:\s*alimentar)?\s*(?:do\s*)?|paciente\s*:?\s*)?matheus\b/i.test(rawText);
  const hasScarlet = /(?:^|\n)\s*(?:card[aá]pio\s*(?:da\s*)?|di[aá]rio(?:\s*alimentar)?\s*(?:da\s*)?|paciente\s*:?\s*)?scarlet\b/i.test(rawText);

  if (!(hasMatheus && hasScarlet)) {
    return rawText;
  }

  const lines = rawText.split(/\r?\n/);
  const matheusLines = [];
  const scarletLines = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(?:card[aá]pio\s*(?:do\s*)?|di[aá]rio(?:\s*alimentar)?\s*(?:do\s*)?|paciente\s*:?\s*)?matheus\b[:\-]?$/i.test(trimmed) || /^matheus\s*[-:]/i.test(trimmed)) {
      current = 'matheus';
      continue;
    }
    if (/^(?:card[aá]pio\s*(?:da\s*)?|di[aá]rio(?:\s*alimentar)?\s*(?:da\s*)?|paciente\s*:?\s*)?scarlet\b[:\-]?$/i.test(trimmed) || /^scarlet\s*[-:]/i.test(trimmed)) {
      current = 'scarlet';
      continue;
    }
    if (current === 'matheus') matheusLines.push(line);
    else if (current === 'scarlet') scarletLines.push(line);
  }

  if (person === 'matheus' && matheusLines.length >= 2) return matheusLines.join('\n');
  if (person === 'scarlet' && scarletLines.length >= 2) return scarletLines.join('\n');
  return rawText;
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
    if (/^(?:lanche(?:\s*da)?\s*tarde|caf[eé]\s*(?:da\s*)?tarde|tarde|pr[eé][\s-]?treino|p[oó]s[\s-]?treino)(?=$|[\s:,\-–.)])/i.test(headPart)) {
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

  const parsedMeals = {
    nome: base.nome,
    avatar: base.avatar,
    manha: {
      descricao: formatDesc(buckets.manha, base.manha.descricao),
      paes: manhaText ? extractCountFor(manhaPrimary, 'p[aã](?:o|es)(?:\\s+(?:franc[eê]s|de\\s+forma|integral))?') : base.manha.paes,
      frutas: manhaText ? extractCountFor(manhaPrimary, 'frutas?|banana[s]?|ma[cç][aã]s?|mam[aã]o|laranja[s]?|pera[s]?|mel[aã]o') : base.manha.frutas,
      ovos: manhaText ? extractCountFor(manhaPrimary, 'ovos?') : base.manha.ovos,
      queijoG: manhaText ? extractGramsFor(manhaPrimary, 'queijo(?:\\s+(?:mussarela|minas|prato|cottage|ricota|fatiado))?', { unitPattern: 'fatia[s]?', gramsPerUnit: 20 }) : base.manha.queijoG,
      requeijaoG: manhaText ? extractGramsFor(manhaPrimary, 'requeij[aã]o|cream\\s*cheese', { unitPattern: 'colher(?:es)?(?:\\s+de\\s+(?:sopa|sobremesa))?', gramsPerUnit: 20 }) : base.manha.requeijaoG
    },
    almoco: {
      descricao: formatDesc(buckets.almoco, base.almoco.descricao),
      arrozProntoG: almocoText ? (extractGramsFor(almocoPrimary, 'arroz(?:\\s+(?:branco|integral|cozido|parboilizado))?', { unitPattern: 'colher(?:es)?(?:\\s+de\\s+sopa)?', gramsPerUnit: 25 }) || base.almoco.arrozProntoG) : base.almoco.arrozProntoG,
      feijaoProntoG: almocoText ? (extractGramsFor(almocoPrimary, 'feij[aã]o(?:\\s+(?:carioca|preto|cozido))?', { unitPattern: 'concha[s]?', gramsPerUnit: 80 }) || base.almoco.feijaoProntoG) : base.almoco.feijaoProntoG,
      carneProntaG: almocoText ? (extractGramsFor(almocoPrimary, meatWords) || base.almoco.carneProntaG) : base.almoco.carneProntaG
    },
    tarde: {
      descricao: formatDesc(buckets.tarde, base.tarde.descricao),
      frutas: tardeText ? extractCountFor(tardePrimary, 'frutas?|banana[s]?|ma[cç][aã]s?|mam[aã]o|laranja[s]?|pera[s]?') : base.tarde.frutas,
      yopro: tardeText ? extractCountFor(tardePrimary, 'yo\\s*-?\\s*pro') : (base.tarde.yopro || 0),
      wheyG: tardeText ? extractGramsFor(tardePrimary, 'whey(?:\\s+protein)?', { unitPattern: 'scoop[s]?|medidor(?:es)?|dosador(?:es)?', gramsPerUnit: 30 }) : (base.tarde.wheyG || 0),
      leiteEmPoG: tardeText ? (extractGramsFor(tardePrimary, 'leite\\s*(?:em\\s*)?p[oó]', { unitPattern: 'colher(?:es)?(?:\\s+de\\s+sopa)?', gramsPerUnit: 10 }) || (/leite\s*(?:em\s*)?p[oó]/i.test(tardePrimary) ? 20 : 0)) : (base.tarde.leiteEmPoG || 0)
    },
    noite: {
      descricao: formatDesc(buckets.noite, base.noite.descricao),
      paes: noiteText ? extractCountFor(noitePrimary, 'p[aã](?:o|es)(?:\\s+(?:franc[eê]s|de\\s+forma|integral))?') : base.noite.paes,
      carneProntaG: noiteText ? (extractGramsFor(noitePrimary, meatWords) || 0) : base.noite.carneProntaG
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

  // Conversão In Natura (Cru / Seco)
  const carneAlmocoCruaG = Math.round(carneAlmocoProntaG * factors.carneCruaMult); // ~433g
  const carneNoiteCruaG = Math.round(carneNoiteProntaG * factors.carneCruaMult); // ~467g
  const carneTotalCruaG = Math.round(carneTotalProntaG * factors.carneCruaMult); // ~900g

  const arrozCruG = Math.round(arrozAlmocoProntoG / factors.arrozCruDiv); // ~86g
  const feijaoCruG = Math.round(feijaoAlmocoProntoG / factors.feijaoCruDiv); // ~65g

  return {
    prontoDiario: {
      arrozAlmocoProntoG,
      feijaoAlmocoProntoG,
      carneAlmocoProntaG,
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
      carneAlmocoCruaG,
      carneNoiteCruaG,
      carneTotalCruaG
    }
  };
}

export const MARMITAS_ITEM_GROUPS = ['carne', 'arroz', 'feijao', 'paes_frutas', 'laticinios'];

/**
 * Calcula o planejamento completo de compras e marmitas para N dias (ex: 3, 7, 15, 30 dias)
 * e permite filtrar por grupos específicos (ex: só carne, só feijão, ou combinação).
 */
export function calculateMarmitasPlan(dias = 7, escopo = 'completo', meals = DEFAULT_NUTRITION_MEALS, factors = COOKING_FACTORS, person = 'casal', selectedItems = null) {
  const safeDias = Math.max(1, Math.min(365, Math.round(Number(dias) || 7)));
  const daily = getDailyNutritionSummary(meals, factors, person);
  const isAlmocoOnly = escopo === 'almoco';

  // Carnes
  const carneProntaG = (isAlmocoOnly ? daily.prontoDiario.carneAlmocoProntaG : daily.prontoDiario.carneTotalProntaG) * safeDias;
  const carneCruaG = (isAlmocoOnly ? daily.inNaturaDiario.carneAlmocoCruaG : daily.inNaturaDiario.carneTotalCruaG) * safeDias;
  const carneCruaKg = (carneCruaG / 1000).toFixed(2);

  // Arroz e Feijão (sempre do almoço)
  const arrozProntoG = daily.prontoDiario.arrozAlmocoProntoG * safeDias;
  const arrozCruG = daily.inNaturaDiario.arrozCruG * safeDias;
  const arrozCruKg = (arrozCruG / 1000).toFixed(2);
  const arrozPacotes1Kg = Math.ceil(arrozCruG / 1000);

  const feijaoProntoG = daily.prontoDiario.feijaoAlmocoProntoG * safeDias;
  const feijaoCruG = daily.inNaturaDiario.feijaoCruG * safeDias;
  const feijaoCruKg = (feijaoCruG / 1000).toFixed(2);
  const feijaoPacotes1Kg = Math.ceil(feijaoCruG / 1000);

  // Outros itens (se escopo completo)
  const paes = isAlmocoOnly ? 0 : daily.prontoDiario.paesTotal * safeDias;
  const frutas = isAlmocoOnly ? 0 : daily.prontoDiario.frutasTotal * safeDias;
  const yopro = isAlmocoOnly ? 0 : daily.prontoDiario.yoproTotal * safeDias;
  const wheyG = isAlmocoOnly ? 0 : daily.prontoDiario.wheyTotalG * safeDias;
  const leiteEmPoG = isAlmocoOnly ? 0 : daily.prontoDiario.leiteEmPoTotalG * safeDias;
  const ovos = isAlmocoOnly ? 0 : daily.prontoDiario.ovosTotal * safeDias;
  const queijoG = isAlmocoOnly ? 0 : daily.prontoDiario.queijoTotalG * safeDias;
  const requeijaoG = isAlmocoOnly ? 0 : daily.prontoDiario.requeijaoTotalG * safeDias;

  // Itens sugeridos para a Lista de Mercado
  const allShoppingItems = [
    {
      groupKey: 'carne',
      title: `Carne / Frango in natura (${carneCruaKg} kg)`,
      name: `Carne / Frango in natura`,
      category: 'carnes',
      quantity: `${carneCruaKg} kg`,
      notes: `Para ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} (${isAlmocoOnly ? 'apenas marmitas de almoço' : 'almoço + pão da noite'}). Rende ~${(carneProntaG / 1000).toFixed(2)} kg pronto.`,
      estimatedUnitPrice: 38.00
    },
    {
      groupKey: 'arroz',
      title: `Arroz in natura (${arrozPacotes1Kg} pct de 1kg)`,
      name: `Arroz in natura`,
      category: 'mercado',
      quantity: `${arrozPacotes1Kg} kg`,
      notes: `Consumo exato: ${arrozCruG}g cru para ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} de marmita (${arrozProntoG}g pronto).`,
      estimatedUnitPrice: 6.50
    },
    {
      groupKey: 'feijao',
      title: `Feijão in natura (${feijaoPacotes1Kg} pct de 1kg)`,
      name: `Feijão in natura`,
      category: 'mercado',
      quantity: `${feijaoPacotes1Kg} kg`,
      notes: `Consumo exato: ${feijaoCruG}g cru para ${safeDias} ${safeDias === 1 ? 'dia' : 'dias'} de marmita (${feijaoProntoG}g pronto).`,
      estimatedUnitPrice: 8.90
    }
  ];

  const targetLabel = person === 'matheus' ? 'para Matheus' : (person === 'scarlet' ? 'para Scarlet' : 'para o casal');

  if (!isAlmocoOnly) {
    if (paes > 0) {
      allShoppingItems.push({
        groupKey: 'paes_frutas',
        title: `Pães franceses / forma (${paes} un)`,
        name: `Pão`,
        category: 'padaria',
        quantity: `${paes} un`,
        notes: `${daily.prontoDiario.paesTotal} pães por dia ${targetLabel} (café da manhã + lanche da noite).`,
        estimatedUnitPrice: 0.90
      });
    }

    if (frutas > 0) {
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

    // Vegetais para o período
    allShoppingItems.push({
      groupKey: 'paes_frutas',
      title: `Legumes para marmitas (cenoura, abobrinha, beterraba)`,
      name: `Legumes cozidos para marmita`,
      category: 'hortifruti',
      quantity: `${Math.max(1, Math.round(safeDias / 7))} kit`,
      notes: `Deixar cozidos e porcionados com arroz, feijão e carne.`,
      estimatedUnitPrice: 18.00
    });
    allShoppingItems.push({
      groupKey: 'paes_frutas',
      title: `Verduras / Saladas (alface, tomate, repolho, couve)`,
      name: `Saladas da semana`,
      category: 'hortifruti',
      quantity: `${Math.max(1, Math.round(safeDias / 7))} kit`,
      notes: `Saladas frescas para o período.`,
      estimatedUnitPrice: 15.00
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
    totaisProntos: {
      carneProntaG,
      arrozProntoG,
      feijaoProntoG,
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
      feijaoPacotes1Kg
    },
    shoppingItems,
    allShoppingItems
  };
}

/**
 * Converte uma quantidade específica avulsa entre alimento pronto (cozido) e in natura (cru/seco),
 * calculando também quantas marmitas do almoço essa quantidade rende segundo o cardápio atual.
 */
export function calculateCustomQuantityConversion({
  item = 'carne',
  mode = 'pronto_para_cru',
  grams = 500,
  meals = DEFAULT_NUTRITION_MEALS,
  factors = COOKING_FACTORS,
  person = 'casal'
} = {}) {
  const safeGrams = Math.max(1, Math.round(Number(grams) || 0));
  const daily = getDailyNutritionSummary(meals, factors, person);

  const metaMap = {
    carne: {
      label: 'Carne / Frango',
      icon: '🥩',
      category: 'carnes',
      unitPrice: 38.00,
      factorLabel: 'x1.67 cru/pronto',
      dailyLunchG: daily.prontoDiario.carneAlmocoProntaG || 260,
      toCru: (p) => Math.round(p * factors.carneCruaMult),
      toPronto: (c) => Math.round(c / factors.carneCruaMult)
    },
    arroz: {
      label: 'Arroz',
      icon: '🍚',
      category: 'mercado',
      unitPrice: 6.50,
      factorLabel: 'rende 2.2x cozido',
      dailyLunchG: daily.prontoDiario.arrozAlmocoProntoG || 190,
      toCru: (p) => Math.round(p / factors.arrozCruDiv),
      toPronto: (c) => Math.round(c * factors.arrozCruDiv)
    },
    feijao: {
      label: 'Feijão',
      icon: '🫘',
      category: 'mercado',
      unitPrice: 8.90,
      factorLabel: 'rende 2.6x cozido',
      dailyLunchG: daily.prontoDiario.feijaoAlmocoProntoG || 170,
      toCru: (p) => Math.round(p / factors.feijaoCruDiv),
      toPronto: (c) => Math.round(c * factors.feijaoCruDiv)
    }
  };

  const info = metaMap[item] || metaMap.carne;
  const isCruInput = mode === 'cru_para_pronto';
  const cruG = isCruInput ? safeGrams : info.toCru(safeGrams);
  const prontoG = isCruInput ? info.toPronto(safeGrams) : safeGrams;

  const cruKgStr = (cruG / 1000).toFixed(2);
  const prontoKgStr = (prontoG / 1000).toFixed(2);
  const pac1Kg = Math.ceil(cruG / 1000);
  const almoçosEquivalentes = info.dailyLunchG > 0 ? +(prontoG / info.dailyLunchG).toFixed(1) : 0;

  const shoppingQty = item === 'carne'
    ? (cruG >= 1000 ? `${cruKgStr} kg` : `${cruG}g`)
    : `${cruG}g (~${pac1Kg} pct 1kg)`;

  return {
    item,
    mode,
    inputGrams: safeGrams,
    cruG,
    cruKg: parseFloat(cruKgStr),
    cruKgStr,
    prontoG,
    prontoKgStr,
    pacotes1Kg: pac1Kg,
    almocosEquivalentes: almoçosEquivalentes,
    label: info.label,
    icon: info.icon,
    factorLabel: info.factorLabel,
    shoppingItem: {
      groupKey: item,
      title: `${info.label} in natura (${cruG >= 1000 ? `${cruKgStr} kg` : `${cruG}g`})`,
      name: `${info.label} in natura`,
      category: info.category,
      quantity: shoppingQty,
      notes: `Cálculo específico: ${cruG}g in natura rendem ~${prontoG}g pronto (~${almoçosEquivalentes} almoços).`,
      estimatedUnitPrice: info.unitPrice
    }
  };
}
