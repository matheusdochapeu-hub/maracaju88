// ============================================================
//  MARACAJU - GESTÃO DE BENEFÍCIOS (VA & VR - SÃO CARLOS / SP)
// ============================================================

export const DEFAULT_BENEFITS_CONFIG = {
  vaFixedAmount: 2050.00,
  vrDailyAmount: 65.00,
  creditBusinessDay: 4,
  city: "São Carlos - SP",
  monthlyDays: {
    // Referente a Outubro (crédito no 4º dia útil de Novembro): 17 dias = R$ 1.105,00
    "2026-10": 17,
    "2026-11": 17
  },
  monthlyCreditDates: {
    // Crédito de outubro (06/10/2026) e novembro (06/11/2026)
    "2026-10": "2026-10-06",
    "2026-11": "2026-11-06"
  },
  monthlyEndingBalances: {
    // Ciclo de Outubro encerrado: sobrou R$ 9,84 de VA e R$ 0,16 de VR
    "2026-10": {
      vaEndingBalance: 9.84,
      vrEndingBalance: 0.16
    }
  },
  monthlyRolloverOverrides: {}
};

export const PAYMENT_METHODS = [
  { id: 'va', label: 'Vale Alimentação (VA)', shortLabel: 'VA', icon: '🥗', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  { id: 'vr', label: 'Vale Refeição (VR)', shortLabel: 'VR', icon: '🍽️', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.12)' },
  { id: 'pix', label: 'Pix', shortLabel: 'Pix', icon: '💠', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
  { id: 'credito', label: 'Cartão de Crédito', shortLabel: 'Crédito', icon: '💳', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
  { id: 'debito', label: 'Cartão de Débito', shortLabel: 'Débito', icon: '💳', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.12)' },
  { id: 'dinheiro', label: 'Dinheiro', shortLabel: 'Dinheiro', icon: '💵', color: '#65a30d', bg: 'rgba(101, 163, 13, 0.12)' },
  { id: 'outro', label: 'Outro', shortLabel: 'Outro', icon: '🏷️', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)' }
];

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function getMonthNamePt(monthNum) {
  const idx = (parseInt(monthNum, 10) - 1) % 12;
  return MONTH_NAMES_PT[idx] || '';
}

export function getPaymentMethodInfo(methodId) {
  return PAYMENT_METHODS.find(m => m.id === methodId) || {
    id: methodId || 'outro',
    label: 'Outro',
    shortLabel: 'Outro',
    icon: '🏷️',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.12)'
  };
}

// Algoritmo de Meeus/Jones/Butcher para data da Páscoa
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Feriados Nacionais Bancários (FEBRABAN) - utilizados para compensação de benefícios e folha
export function getNationalBankingHolidays(year) {
  const holidays = new Set();
  const pad = n => String(n).padStart(2, '0');
  const addDate = (m, d) => holidays.add(`${year}-${pad(m)}-${pad(d)}`);

  addDate(1, 1);   // Ano Novo
  addDate(4, 21);  // Tiradentes
  addDate(5, 1);   // Dia do Trabalho
  addDate(9, 7);   // Independência do Brasil
  addDate(10, 12); // Nossa Senhora Aparecida
  addDate(11, 2);  // Finados
  addDate(11, 15); // Proclamação da República
  addDate(11, 20); // Dia da Consciência Negra
  addDate(12, 25); // Natal

  const easter = getEasterDate(year);
  const addOffset = (days) => {
    const d = new Date(easter.getTime());
    d.setDate(d.getDate() + days);
    holidays.add(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  addOffset(-47); // Carnaval (terça-feira)
  addOffset(-2);  // Sexta-feira Santa
  addOffset(60);  // Corpus Christi

  return holidays;
}

// Conjunto completo de feriados Nacionais, Estaduais (SP) e Municipais (São Carlos - SP)
export function getHolidaysSaoCarlos(year) {
  const holidays = new Set();
  const pad = n => String(n).padStart(2, '0');
  const addDate = (m, d) => holidays.add(`${year}-${pad(m)}-${pad(d)}`);

  // Feriados Nacionais e Estaduais SP Fixos
  addDate(1, 1);   // Ano Novo
  addDate(4, 21);  // Tiradentes
  addDate(5, 1);   // Dia do Trabalho
  addDate(7, 9);   // Rev. Constitucionalista (Estadual SP)
  addDate(8, 15);  // Nossa Senhora da Babilônia (Municipal São Carlos SP)
  addDate(9, 7);   // Independência do Brasil
  addDate(10, 12); // Nossa Senhora Aparecida
  addDate(11, 2);  // Finados
  addDate(11, 4);  // Aniversário de São Carlos (Municipal São Carlos SP)
  addDate(11, 15); // Proclamação da República
  addDate(11, 20); // Dia da Consciência Negra (Nacional)
  addDate(12, 25); // Natal

  // Feriados Móveis baseados na Páscoa
  const easter = getEasterDate(year);
  const addOffset = (days) => {
    const d = new Date(easter.getTime());
    d.setDate(d.getDate() + days);
    holidays.add(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  addOffset(-47); // Carnaval (terça-feira)
  addOffset(-2);  // Sexta-feira Santa
  addOffset(60);  // Corpus Christi (quinta-feira)

  return holidays;
}

export function isBusinessDay(date, holidaysSet) {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Sábado ou Domingo
  const pad = n => String(n).padStart(2, '0');
  const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return !holidaysSet.has(iso);
}

// Retorna a data do 4º dia útil bancário nacional (padrão de depósito de benefícios)
export function getFourthBankingDay(year, month) {
  const holidays = getNationalBankingHolidays(year);
  let count = 0;
  const pad = n => String(n).padStart(2, '0');

  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getMonth() !== month - 1) break;
    if (isBusinessDay(date, holidays)) {
      count++;
      if (count === 4) {
        return {
          day: d,
          date,
          dateString: `${year}-${pad(month)}-${pad(d)}`,
          formatted: `${pad(d)}/${pad(month)}/${year}`
        };
      }
    }
  }
  return null;
}

// Retorna a data do 4º dia útil (mantém compatibilidade com calendário municipal)
export function getFourthBusinessDay(year, month) {
  const holidays = getHolidaysSaoCarlos(year);
  let businessDayCount = 0;
  const pad = n => String(n).padStart(2, '0');

  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getMonth() !== month - 1) break;
    if (isBusinessDay(date, holidays)) {
      businessDayCount++;
      if (businessDayCount === 4) {
        return {
          day: d,
          date,
          dateString: `${year}-${pad(month)}-${pad(d)}`,
          formatted: `${pad(d)}/${pad(month)}/${year}`
        };
      }
    }
  }
  return null;
}

// Retorna a data efetiva de crédito do benefício para um mês/ano
export function getBenefitCreditDate(year, month, state = null) {
  const pad = n => String(n).padStart(2, '0');
  const monthKey = `${year}-${pad(month)}`;
  const configured = state?.settings?.benefits?.monthlyCreditDates?.[monthKey];
  if (configured) {
    const [y, m, d] = configured.split('-').map(Number);
    return {
      day: d,
      date: new Date(y, m - 1, d),
      dateString: configured,
      formatted: `${pad(d)}/${pad(m)}/${y}`
    };
  }
  // Padrão: 4º dia útil bancário nacional
  return getFourthBankingDay(year, month) || getFourthBusinessDay(year, month);
}

// Conta o total de dias úteis em um mês/ano na cidade de São Carlos SP
export function getWorkingDaysInMonth(year, month) {
  const holidays = getHolidaysSaoCarlos(year);
  let count = 0;
  for (let d = 1; d <= 31; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getMonth() !== month - 1) break;
    if (isBusinessDay(date, holidays)) {
      count++;
    }
  }
  return count;
}

// Garante e recupera a configuração de benefícios do state
export function getBenefitsConfig(state) {
  if (!state.settings) state.settings = {};
  if (!state.settings.benefits) {
    state.settings.benefits = JSON.parse(JSON.stringify(DEFAULT_BENEFITS_CONFIG));
  }
  return state.settings.benefits;
}

/**
 * Determina o ciclo de benefícios de uma compra com base na data do crédito.
 * Se uma compra for efetuada antes da data do crédito do mês (ex: 03/11 antes de 06/11),
 * ela pertence ao ciclo do mês ANTERIOR (Outubro)!
 */
export function getBenefitCycleKey(dateStr, state = null) {
  if (!dateStr) return getCurrentBenefitCycleKey(state);
  const clean = String(dateStr).substring(0, 10);
  const [yStr, mStr] = clean.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  if (isNaN(year) || isNaN(month)) return getCurrentBenefitCycleKey(state);

  const creditInfo = getBenefitCreditDate(year, month, state);
  if (creditInfo && clean < creditInfo.dateString) {
    // A compra ocorreu ANTES da disponibilização do benefício deste mês.
    // Pertence ao saldo do ciclo do mês anterior!
    const prevDate = new Date(year, month - 2, 1);
    const pad = n => String(n).padStart(2, '0');
    return `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;
  }

  const pad = n => String(n).padStart(2, '0');
  return `${year}-${pad(month)}`;
}

/**
 * Retorna o ciclo de benefícios atualmente em vigor hoje.
 */
export function getCurrentBenefitCycleKey(state = null) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return getBenefitCycleKey(todayStr, state);
}

/**
 * Retorna as datas de início e fim de um ciclo de benefícios.
 */
export function getBenefitCycleRange(cycleKey, state = null) {
  const [yStr, mStr] = cycleKey.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const pad = n => String(n).padStart(2, '0');

  const startCredit = getBenefitCreditDate(year, month, state);
  const nextMonthDate = new Date(year, month, 1);
  const nextY = nextMonthDate.getFullYear();
  const nextM = nextMonthDate.getMonth() + 1;
  const nextCredit = getBenefitCreditDate(nextY, nextM, state);

  // O ciclo encerra no dia imediatamente anterior ao próximo crédito
  const endLimitDate = new Date(nextCredit.date.getTime() - 24 * 60 * 60 * 1000);
  const endIso = `${endLimitDate.getFullYear()}-${pad(endLimitDate.getMonth() + 1)}-${pad(endLimitDate.getDate())}`;
  const endFormatted = `${pad(endLimitDate.getDate())}/${pad(endLimitDate.getMonth() + 1)}/${endLimitDate.getFullYear()}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const isCurrent = todayStr >= startCredit.dateString && todayStr <= endIso;
  const isUpcoming = todayStr < startCredit.dateString;
  const isPast = todayStr > endIso;

  const monthName = getMonthNamePt(month);
  const label = `Ciclo ${monthName}/${year}`;

  return {
    cycleKey,
    year,
    month,
    monthName,
    label,
    startIso: startCredit.dateString,
    startFormatted: startCredit.formatted,
    endIso,
    endFormatted,
    rangeFormatted: `${startCredit.formatted} a ${endFormatted}`,
    isCurrent,
    isUpcoming,
    isPast,
    nextCreditFormatted: nextCredit.formatted
  };
}

// Calcula todos os detalhes de VA e VR para um ciclo selecionado
export function getMonthlyBenefitDetails(state, targetMonthKey = null) {
  const cycleKey = targetMonthKey && targetMonthKey !== 'todos'
    ? targetMonthKey
    : getCurrentBenefitCycleKey(state);

  const [yearStr, monthStr] = cycleKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const pad = n => String(n).padStart(2, '0');

  const config = getBenefitsConfig(state);
  const vaBaseFixed = Number(config.vaFixedAmount) || 2050.00;
  const vrDaily = Number(config.vrDailyAmount) || 65.00;

  // Dias trabalhados
  let vrDays = 17;
  if (config.monthlyDays && config.monthlyDays[cycleKey] !== undefined) {
    vrDays = Number(config.monthlyDays[cycleKey]);
  } else {
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthWorkingDays = getWorkingDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);
    vrDays = prevMonthWorkingDays > 0 ? prevMonthWorkingDays : 17;
  }

  const vrDeposit = Math.round(vrDays * vrDaily * 100) / 100;
  const vaDeposit = Math.round(vaBaseFixed * 100) / 100;

  // Saldo Acumulado do Mês Anterior (Rollover para o mês subsequente)
  let vaRollover = 0;
  let vrRollover = 0;

  if (config.monthlyRolloverOverrides && config.monthlyRolloverOverrides[cycleKey]) {
    const ov = config.monthlyRolloverOverrides[cycleKey];
    if (ov.vaRollover !== undefined) vaRollover = Number(ov.vaRollover);
    if (ov.vrRollover !== undefined) vrRollover = Number(ov.vrRollover);
  } else {
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevCycleKey = `${prevMonthDate.getFullYear()}-${pad(prevMonthDate.getMonth() + 1)}`;
    if (config.monthlyEndingBalances && config.monthlyEndingBalances[prevCycleKey]) {
      const prevEnding = config.monthlyEndingBalances[prevCycleKey];
      if (prevEnding.vaEndingBalance !== undefined) vaRollover = Number(prevEnding.vaEndingBalance);
      if (prevEnding.vrEndingBalance !== undefined) vrRollover = Number(prevEnding.vrEndingBalance);
    }
  }

  const vaTotal = Math.round((vaDeposit + vaRollover) * 100) / 100;
  const vrTotal = Math.round((vrDeposit + vrRollover) * 100) / 100;
  const totalBenefit = Math.round((vaTotal + vrTotal) * 100) / 100;

  const cycleRange = getBenefitCycleRange(cycleKey, state);

  // Filtra as compras computadas neste ciclo de benefícios (gastos que abatem deste ciclo)
  const purchases = (state.comprasRegistros || []).filter(p => {
    const pCycle = getBenefitCycleKey(p.date || p.createdAt, state);
    return pCycle === cycleKey;
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const paymentBreakdown = {
    va: 0,
    vr: 0,
    pix: 0,
    credito: 0,
    debito: 0,
    dinheiro: 0,
    outro: 0
  };

  purchases.forEach(p => {
    const method = (p.paymentMethod || 'va').toLowerCase();
    const val = Number(p.total) || 0;
    if (paymentBreakdown[method] !== undefined) {
      paymentBreakdown[method] += val;
    } else {
      paymentBreakdown.outro += val;
    }
  });

  Object.keys(paymentBreakdown).forEach(k => {
    paymentBreakdown[k] = Math.round(paymentBreakdown[k] * 100) / 100;
  });

  let vaSpent = paymentBreakdown.va;
  let vrSpent = paymentBreakdown.vr;
  let vaBalance = 0;
  let vrBalance = 0;

  // Se o ciclo tiver saldo residual/final fixado (ex: Outubro/2026 com R$ 9,84 de VA e R$ 0,16 de VR):
  const fixedEnding = config.monthlyEndingBalances && config.monthlyEndingBalances[cycleKey];
  if (fixedEnding && fixedEnding.vaEndingBalance !== undefined) {
    vaBalance = Math.round(Number(fixedEnding.vaEndingBalance) * 100) / 100;
    vaSpent = Math.max(vaSpent, Math.round((vaTotal - vaBalance) * 100) / 100);
  } else {
    vaBalance = Math.round((vaTotal - vaSpent) * 100) / 100;
  }

  if (fixedEnding && fixedEnding.vrEndingBalance !== undefined) {
    vrBalance = Math.round(Number(fixedEnding.vrEndingBalance) * 100) / 100;
    vrSpent = Math.max(vrSpent, Math.round((vrTotal - vrBalance) * 100) / 100);
  } else {
    vrBalance = Math.round((vrTotal - vrSpent) * 100) / 100;
  }

  const totalFoodSpent = Math.round((vaSpent + vrSpent) * 100) / 100;
  const totalFoodBalance = Math.round((vaBalance + vrBalance) * 100) / 100;

  const vaUsagePercent = vaTotal > 0 ? Math.min(100, Math.round((vaSpent / vaTotal) * 100)) : 0;
  const vrUsagePercent = vrTotal > 0 ? Math.min(100, Math.round((vrSpent / vrTotal) * 100)) : 0;
  const totalUsagePercent = totalBenefit > 0 ? Math.min(100, Math.round((totalFoodSpent / totalBenefit) * 100)) : 0;

  return {
    monthKey: cycleKey,
    cycleKey,
    cycleLabel: cycleRange.label,
    cycleRange: cycleRange.rangeFormatted,
    year,
    month,
    monthName: cycleRange.monthName,
    isCurrentCycle: cycleRange.isCurrent,
    isUpcomingCycle: cycleRange.isUpcoming,
    isPastCycle: cycleRange.isPast,
    creditDay: cycleRange.startIso ? parseInt(cycleRange.startIso.slice(8, 10), 10) : 4,
    creditDateFormatted: cycleRange.startFormatted,
    nextCreditDateFormatted: cycleRange.nextCreditFormatted,
    vaBaseFixed,
    vaDeposit,
    vaRollover,
    vaTotal,
    vaSpent,
    vaBalance,
    vaUsagePercent,
    vrDaily,
    vrDays,
    vrDeposit,
    vrRollover,
    vrTotal,
    vrSpent,
    vrBalance,
    vrUsagePercent,
    totalDeposit: Math.round((vaDeposit + vrDeposit) * 100) / 100,
    totalRollover: Math.round((vaRollover + vrRollover) * 100) / 100,
    totalBenefit,
    totalFoodSpent,
    totalFoodBalance,
    totalUsagePercent,
    paymentBreakdown,
    purchases,
    cyclePurchases: purchases,
    city: config.city || "São Carlos - SP"
  };
}

/**
 * Retorna o histórico consolidado de todos os ciclos de benefícios (passados, atual e próximo).
 */
export function getBenefitsHistory(state) {
  const currentKey = getCurrentBenefitCycleKey(state);
  const [curY, curM] = currentKey.split('-').map(Number);
  const pad = n => String(n).padStart(2, '0');

  const nextMonthDate = new Date(curY, curM, 1);
  const nextKey = `${nextMonthDate.getFullYear()}-${pad(nextMonthDate.getMonth() + 1)}`;

  const prevMonthDate = new Date(curY, curM - 2, 1);
  const prevKey = `${prevMonthDate.getFullYear()}-${pad(prevMonthDate.getMonth() + 1)}`;

  const keysSet = new Set(['2026-10', '2026-11', currentKey, nextKey, prevKey]);

  (state.comprasRegistros || []).forEach(p => {
    if (p.date) {
      keysSet.add(getBenefitCycleKey(p.date, state));
    }
  });

  const config = getBenefitsConfig(state);
  if (config.monthlyDays) {
    Object.keys(config.monthlyDays).forEach(k => keysSet.add(k));
  }

  const sortedKeys = Array.from(keysSet).sort().reverse();
  return sortedKeys.map(k => getMonthlyBenefitDetails(state, k));
}

export function updateMonthlyBenefitsConfig(state, monthKey, {
  vrDays,
  vaFixed,
  vrDaily,
  creditDate,
  vaRollover,
  vrRollover,
  vaEndingBalance,
  vrEndingBalance
}) {
  const config = getBenefitsConfig(state);
  if (!config.monthlyDays) config.monthlyDays = {};
  if (vrDays !== undefined) config.monthlyDays[monthKey] = Number(vrDays);
  if (vaFixed !== undefined) config.vaFixedAmount = Number(vaFixed);
  if (vrDaily !== undefined) config.vrDailyAmount = Number(vrDaily);
  if (creditDate !== undefined) {
    if (!config.monthlyCreditDates) config.monthlyCreditDates = {};
    config.monthlyCreditDates[monthKey] = creditDate;
  }
  if (vaRollover !== undefined || vrRollover !== undefined) {
    if (!config.monthlyRolloverOverrides) config.monthlyRolloverOverrides = {};
    if (!config.monthlyRolloverOverrides[monthKey]) config.monthlyRolloverOverrides[monthKey] = {};
    if (vaRollover !== undefined) config.monthlyRolloverOverrides[monthKey].vaRollover = Number(vaRollover);
    if (vrRollover !== undefined) config.monthlyRolloverOverrides[monthKey].vrRollover = Number(vrRollover);
  }
  if (vaEndingBalance !== undefined || vrEndingBalance !== undefined) {
    if (!config.monthlyEndingBalances) config.monthlyEndingBalances = {};
    if (!config.monthlyEndingBalances[monthKey]) config.monthlyEndingBalances[monthKey] = {};
    if (vaEndingBalance !== undefined) config.monthlyEndingBalances[monthKey].vaEndingBalance = Number(vaEndingBalance);
    if (vrEndingBalance !== undefined) config.monthlyEndingBalances[monthKey].vrEndingBalance = Number(vrEndingBalance);
  }
  return getMonthlyBenefitDetails(state, monthKey);
}
