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
    "2026-11": 17
  }
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

// Conjunto de feriados Nacionais, Estaduais (SP) e Municipais (São Carlos - SP)
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

// Retorna a data do 4º dia útil de um mês/ano específico
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

// Calcula todos os detalhes de VA e VR para um mês selecionado
export function getMonthlyBenefitDetails(state, targetMonthKey = null) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const currentMonthKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const monthKey = targetMonthKey && targetMonthKey !== 'todos' ? targetMonthKey : currentMonthKey;

  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10) || now.getFullYear();
  const month = parseInt(monthStr, 10) || (now.getMonth() + 1);

  const config = getBenefitsConfig(state);
  const vaFixed = Number(config.vaFixedAmount) || 2050.00;
  const vrDaily = Number(config.vrDailyAmount) || 65.00;

  // Dias trabalhados: busca override manual do mês ou padrão
  let vrDays = 17;
  if (config.monthlyDays && config.monthlyDays[monthKey] !== undefined) {
    vrDays = Number(config.monthlyDays[monthKey]);
  } else {
    // Padrão: se for 2026-11, o usuário trabalha 17 dias (referente a outubro).
    // Nos demais meses, calcula os dias úteis do mês anterior ou 17
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthWorkingDays = getWorkingDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);
    vrDays = prevMonthWorkingDays > 0 ? prevMonthWorkingDays : 17;
  }

  const vrTotal = Math.round(vrDays * vrDaily * 100) / 100;
  const vaTotal = Math.round(vaFixed * 100) / 100;
  const totalBenefit = Math.round((vaTotal + vrTotal) * 100) / 100;

  // 4º dia útil deste mês
  const fourthDayInfo = getFourthBusinessDay(year, month);

  // Calcula gastos no mês por forma de pagamento
  const purchases = (state.comprasRegistros || []).filter(p => {
    const pMonthKey = p.monthKey || (p.date ? p.date.substring(0, 7) : '');
    return pMonthKey === monthKey;
  });

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

  // Arredonda valores
  Object.keys(paymentBreakdown).forEach(k => {
    paymentBreakdown[k] = Math.round(paymentBreakdown[k] * 100) / 100;
  });

  const vaSpent = paymentBreakdown.va;
  const vrSpent = paymentBreakdown.vr;
  const vaBalance = Math.round((vaTotal - vaSpent) * 100) / 100;
  const vrBalance = Math.round((vrTotal - vrSpent) * 100) / 100;
  const totalFoodSpent = Math.round((vaSpent + vrSpent) * 100) / 100;
  const totalFoodBalance = Math.round((totalBenefit - totalFoodSpent) * 100) / 100;

  const vaUsagePercent = vaTotal > 0 ? Math.min(100, Math.round((vaSpent / vaTotal) * 100)) : 0;
  const vrUsagePercent = vrTotal > 0 ? Math.min(100, Math.round((vrSpent / vrTotal) * 100)) : 0;
  const totalUsagePercent = totalBenefit > 0 ? Math.min(100, Math.round((totalFoodSpent / totalBenefit) * 100)) : 0;

  return {
    monthKey,
    year,
    month,
    vaFixed,
    vaTotal,
    vaSpent,
    vaBalance,
    vaUsagePercent,
    vrDaily,
    vrDays,
    vrTotal,
    vrSpent,
    vrBalance,
    vrUsagePercent,
    totalBenefit,
    totalFoodSpent,
    totalFoodBalance,
    totalUsagePercent,
    creditDay: fourthDayInfo ? fourthDayInfo.day : 4,
    creditDateFormatted: fourthDayInfo ? fourthDayInfo.formatted : `04/${pad(month)}/${year}`,
    paymentBreakdown,
    city: config.city || "São Carlos - SP"
  };
}

export function updateMonthlyBenefitsConfig(state, monthKey, { vrDays, vaFixed, vrDaily }) {
  const config = getBenefitsConfig(state);
  if (!config.monthlyDays) config.monthlyDays = {};
  if (vrDays !== undefined) config.monthlyDays[monthKey] = Number(vrDays);
  if (vaFixed !== undefined) config.vaFixedAmount = Number(vaFixed);
  if (vrDaily !== undefined) config.vrDailyAmount = Number(vrDaily);
  return getMonthlyBenefitDetails(state, monthKey);
}
