// ============================================================
//  MARACAJU - CALENDÁRIO ATIVO EM SEGUNDO PLANO
//  Monitora datas, dias úteis bancários e ciclos de benefícios
//  Roda silenciosamente sem necessidade de interface visual.
// ============================================================

import {
  getHolidaysSaoCarlos,
  getNationalBankingHolidays,
  isBusinessDay,
  getBenefitCycleKey,
  getCurrentBenefitCycleKey
} from './benefits.js';

const DAY_NAMES = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

let activeCalendarState = null;
let calendarIntervalId = null;
let visibilityHandler = null;
let focusHandler = null;

/**
 * Retorna a data local de hoje no formato YYYY-MM-DD, evitando desvios de fuso UTC.
 */
export function getTodayLocalIso() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Formata YYYY-MM-DD para DD/MM/YYYY.
 */
export function formatLocalDateBr(isoStr) {
  if (!isoStr) return '';
  const clean = String(isoStr).slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return clean;
}

/**
 * Retorna informações completas de calendário para uma data específica.
 */
export function getCalendarDayInfo(dateInput = new Date(), state = null) {
  let d;
  if (typeof dateInput === 'string') {
    const [y, m, day] = dateInput.slice(0, 10).split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    d = new Date();
  }

  const pad = n => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dateIso = `${year}-${pad(month)}-${pad(day)}`;
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const nationalHolidays = getNationalBankingHolidays(year);
  const localHolidays = getHolidaysSaoCarlos(year);

  const isNationalHoliday = nationalHolidays.has(dateIso);
  const isLocalHoliday = localHolidays.has(dateIso);
  const isBusinessDayCity = isBusinessDay(d, localHolidays);
  const isBankingDay = isBusinessDay(d, nationalHolidays);

  const cycleKey = getBenefitCycleKey(dateIso, state);

  return {
    dateIso,
    formatted: `${pad(day)}/${pad(month)}/${year}`,
    year,
    month,
    day,
    dayOfWeek,
    dayOfWeekName: DAY_NAMES[dayOfWeek],
    isWeekend,
    isNationalHoliday,
    isLocalHoliday,
    isBusinessDay: isBusinessDayCity,
    isBankingDay,
    cycleKey
  };
}

/**
 * Retorna o estado atual do calendário ativo.
 */
export function getActiveCalendar(state = null) {
  if (!activeCalendarState) {
    activeCalendarState = getCalendarDayInfo(new Date(), state);
  }
  return activeCalendarState;
}

/**
 * Verifica se a data atual mudou em relação ao cache em memória (virada de meia-noite ou retorno ao app).
 * Se mudou, atualiza o cache e aciona o callback e o evento customizado.
 */
export function checkCalendarRollover(state = null, onDayChange = null) {
  const currentTodayIso = getTodayLocalIso();
  const previousState = activeCalendarState;

  if (!previousState || previousState.dateIso !== currentTodayIso) {
    const updated = getCalendarDayInfo(new Date(), state);
    activeCalendarState = updated;

    const eventDetail = {
      previousDate: previousState ? previousState.dateIso : null,
      currentDate: updated.dateIso,
      previousCycle: previousState ? previousState.cycleKey : null,
      currentCycle: updated.cycleKey,
      calendar: updated
    };

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('maracaju:calendar-daychange', { detail: eventDetail }));
      } catch (e) {
        // Ignora erros de evento em ambientes restritos
      }
    }

    if (typeof onDayChange === 'function') {
      try {
        onDayChange(eventDetail);
      } catch (e) {
        console.warn('[Maracaju:Calendar] Erro no callback onDayChange:', e);
      }
    }

    return { changed: true, ...eventDetail };
  }

  return { changed: false, calendar: activeCalendarState };
}

/**
 * Inicializa o motor de calendário ativo em segundo plano.
 * Monitora transições de dia, foco na janela e visibilidade da tela.
 */
export function initActiveCalendar(state = null, { onDayChange = null, intervalMs = 60000 } = {}) {
  // Inicialização inicial
  activeCalendarState = getCalendarDayInfo(new Date(), state);

  // Limpa instâncias anteriores se houver
  stopActiveCalendar();

  // Verificação periódica silenciosa (a cada 60 segundos por padrão)
  if (typeof setInterval === 'function') {
    calendarIntervalId = setInterval(() => {
      checkCalendarRollover(state, onDayChange);
    }, intervalMs);
  }

  // Listener para retorno de aba ou desbloqueio de tela
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        checkCalendarRollover(state, onDayChange);
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  // Listener para foco de janela
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    focusHandler = () => {
      checkCalendarRollover(state, onDayChange);
    };
    window.addEventListener('focus', focusHandler);
  }

  return stopActiveCalendar;
}

/**
 * Encerra o monitoramento em segundo plano do calendário ativo.
 */
export function stopActiveCalendar() {
  if (calendarIntervalId) {
    clearInterval(calendarIntervalId);
    calendarIntervalId = null;
  }
  if (typeof document !== 'undefined' && visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  if (typeof window !== 'undefined' && focusHandler) {
    window.removeEventListener('focus', focusHandler);
    focusHandler = null;
  }
}
