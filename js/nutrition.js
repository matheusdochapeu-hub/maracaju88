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
 * Calcula o resumo diário consolidado do casal (pronto e cru)
 */
export function getDailyNutritionSummary(meals = DEFAULT_NUTRITION_MEALS, factors = COOKING_FACTORS) {
  const m = meals.matheus;
  const s = meals.scarlet;

  // Pronto diário
  const arrozAlmocoProntoG = (m.almoco.arrozProntoG || 0) + (s.almoco.arrozProntoG || 0); // 190g
  const feijaoAlmocoProntoG = (m.almoco.feijaoProntoG || 0) + (s.almoco.feijaoProntoG || 0); // 170g
  const carneAlmocoProntaG = (m.almoco.carneProntaG || 0) + (s.almoco.carneProntaG || 0); // 260g
  const carneNoiteProntaG = (m.noite.carneProntaG || 0) + (s.noite.carneProntaG || 0); // 280g
  const carneTotalProntaG = carneAlmocoProntaG + carneNoiteProntaG; // 540g

  const paesTotal = (m.manha.paes || 0) + (s.manha.paes || 0) + (m.noite.paes || 0) + (s.noite.paes || 0); // 4
  const frutasTotal = (m.manha.frutas || 0) + (s.manha.frutas || 0) + (m.tarde.frutas || 0) + (s.tarde.frutas || 0); // 4
  const yoproTotal = (m.tarde.yopro || 0) + (s.tarde.yopro || 0); // 1
  const wheyTotalG = (m.tarde.wheyG || 0) + (s.tarde.wheyG || 0); // 30
  const leiteEmPoTotalG = (m.tarde.leiteEmPoG || 0) + (s.tarde.leiteEmPoG || 0); // 20
  const ovosTotal = (m.manha.ovos || 0) + (s.manha.ovos || 0); // 2 a 4
  const queijoTotalG = (m.manha.queijoG || 0) + (s.manha.queijoG || 0); // ~40
  const requeijaoTotalG = (m.manha.requeijaoG || 0) + (s.manha.requeijaoG || 0); // ~40

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

/**
 * Calcula o planejamento completo de compras e marmitas para N dias (ex: 7, 15, 30 dias)
 * @param {number} dias Quantidade de dias (ex: 7 ou 15)
 * @param {'almoco' | 'completo'} escopo 'almoco' calcula apenas marmitas de almoço; 'completo' inclui dia todo
 */
export function calculateMarmitasPlan(dias = 7, escopo = 'completo', meals = DEFAULT_NUTRITION_MEALS, factors = COOKING_FACTORS) {
  const daily = getDailyNutritionSummary(meals, factors);
  const isAlmocoOnly = escopo === 'almoco';

  // Carnes
  const carneProntaG = (isAlmocoOnly ? daily.prontoDiario.carneAlmocoProntaG : daily.prontoDiario.carneTotalProntaG) * dias;
  const carneCruaG = (isAlmocoOnly ? daily.inNaturaDiario.carneAlmocoCruaG : daily.inNaturaDiario.carneTotalCruaG) * dias;
  const carneCruaKg = (carneCruaG / 1000).toFixed(2);

  // Arroz e Feijão (sempre do almoço)
  const arrozProntoG = daily.prontoDiario.arrozAlmocoProntoG * dias;
  const arrozCruG = daily.inNaturaDiario.arrozCruG * dias;
  const arrozCruKg = (arrozCruG / 1000).toFixed(2);
  const arrozPacotes1Kg = Math.ceil(arrozCruG / 1000);

  const feijaoProntoG = daily.prontoDiario.feijaoAlmocoProntoG * dias;
  const feijaoCruG = daily.inNaturaDiario.feijaoCruG * dias;
  const feijaoCruKg = (feijaoCruG / 1000).toFixed(2);
  const feijaoPacotes1Kg = Math.ceil(feijaoCruG / 1000);

  // Outros itens (se escopo completo)
  const paes = isAlmocoOnly ? 0 : daily.prontoDiario.paesTotal * dias;
  const frutas = isAlmocoOnly ? 0 : daily.prontoDiario.frutasTotal * dias;
  const yopro = isAlmocoOnly ? 0 : daily.prontoDiario.yoproTotal * dias;
  const wheyG = isAlmocoOnly ? 0 : daily.prontoDiario.wheyTotalG * dias;
  const leiteEmPoG = isAlmocoOnly ? 0 : daily.prontoDiario.leiteEmPoTotalG * dias;
  const ovos = isAlmocoOnly ? 0 : daily.prontoDiario.ovosTotal * dias;
  const queijoG = isAlmocoOnly ? 0 : daily.prontoDiario.queijoTotalG * dias;
  const requeijaoG = isAlmocoOnly ? 0 : daily.prontoDiario.requeijaoTotalG * dias;

  // Itens sugeridos para a Lista de Mercado
  const shoppingItems = [
    {
      title: `Carne / Frango in natura (${carneCruaKg} kg)`,
      name: `Carne / Frango in natura`,
      category: 'carnes',
      quantity: `${carneCruaKg} kg`,
      notes: `Para ${dias} dias (${isAlmocoOnly ? 'apenas marmitas de almoço' : 'almoço + pão da noite'}). Rende ~${(carneProntaG / 1000).toFixed(2)} kg pronto.`,
      estimatedUnitPrice: 38.00
    },
    {
      title: `Arroz in natura (${arrozPacotes1Kg} pct de 1kg)`,
      name: `Arroz in natura`,
      category: 'mercado',
      quantity: `${arrozPacotes1Kg} kg`,
      notes: `Consumo exato: ${arrozCruG}g cru para ${dias} dias de marmita (${arrozProntoG}g pronto).`,
      estimatedUnitPrice: 6.50
    },
    {
      title: `Feijão in natura (${feijaoPacotes1Kg} pct de 1kg)`,
      name: `Feijão in natura`,
      category: 'mercado',
      quantity: `${feijaoPacotes1Kg} kg`,
      notes: `Consumo exato: ${feijaoCruG}g cru para ${dias} dias de marmita (${feijaoProntoG}g pronto).`,
      estimatedUnitPrice: 8.90
    }
  ];

  if (!isAlmocoOnly) {
    if (paes > 0) {
      shoppingItems.push({
        title: `Pães franceses / forma (${paes} un)`,
        name: `Pão`,
        category: 'padaria',
        quantity: `${paes} un`,
        notes: `4 pães por dia para o casal (café da manhã + pão com carne à noite).`,
        estimatedUnitPrice: 0.90
      });
    }

    if (frutas > 0) {
      shoppingItems.push({
        title: `Frutas da semana (banana, maçã) (${frutas} un)`,
        name: `Frutas variadas`,
        category: 'hortifruti',
        quantity: `${frutas} un`,
        notes: `4 frutas ao dia para o casal (Matheus manhã/tarde, Scarlet manhã/tarde).`,
        estimatedUnitPrice: 1.20
      });
    }

    if (yopro > 0) {
      shoppingItems.push({
        title: `YoPRO Piracanjuba Líquido 15-22g (${yopro} caixinhas)`,
        name: `YoPRO Piracanjuba Líquido`,
        category: 'bebidas',
        quantity: `${yopro} un`,
        notes: `1 por dia para Matheus no trabalho à tarde.`,
        estimatedUnitPrice: 9.90
      });
    }

    if (wheyG > 0) {
      shoppingItems.push({
        title: `Whey Protein em Pó (${wheyG}g)`,
        name: `Whey Protein`,
        category: 'mercado',
        quantity: `${Math.ceil(wheyG)}g`,
        notes: `30g/dia para Scarlet à tarde no liquidificador portátil.`,
        estimatedUnitPrice: 0.12
      });
    }

    if (ovos > 0) {
      const cartelas = Math.ceil(ovos / 30);
      shoppingItems.push({
        title: `Ovos (${ovos} un / ~${cartelas} cartela)`,
        name: `Ovos`,
        category: 'mercado',
        quantity: `${ovos} un`,
        notes: `Café da manhã do casal.`,
        estimatedUnitPrice: 0.80
      });
    }

    if (requeijaoG > 0) {
      const potes = Math.ceil(requeijaoG / 200);
      shoppingItems.push({
        title: `Requeijão cremoso (${potes} pote${potes > 1 ? 's' : ''} de 200g)`,
        name: `Requeijão`,
        category: 'frios',
        quantity: `${potes} un`,
        notes: `Consumo: ${requeijaoG}g em ${dias} dias.`,
        estimatedUnitPrice: 8.50
      });
    }

    if (queijoG > 0) {
      shoppingItems.push({
        title: `Queijo fatiado (${queijoG}g)`,
        name: `Queijo fatiado`,
        category: 'frios',
        quantity: `${queijoG}g`,
        notes: `Café da manhã do Matheus e Scarlet.`,
        estimatedUnitPrice: 0.05
      });
    }

    // Vegetais para a semana
    shoppingItems.push({
      title: `Legumes para marmitas (cenoura, abobrinha, beterraba)`,
      name: `Legumes cozidos para marmita`,
      category: 'hortifruti',
      quantity: `1 kit semanal`,
      notes: `Deixar cozidos e porcionados com arroz, feijão e carne.`,
      estimatedUnitPrice: 18.00
    });
    shoppingItems.push({
      title: `Verduras / Saladas (alface, tomate, repolho, couve)`,
      name: `Saladas da semana`,
      category: 'hortifruti',
      quantity: `1 kit semanal`,
      notes: `Saladas frescas para a semana.`,
      estimatedUnitPrice: 15.00
    });
  }

  return {
    dias,
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
    shoppingItems
  };
}
