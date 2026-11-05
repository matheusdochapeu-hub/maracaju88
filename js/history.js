// ============================================================
//  MARACAJU - HISTÓRICO & VERIFICAÇÃO DIÁRIA
//  "O que foi feito (e por quem) em cada dia"
// ============================================================

import { getLocalDateString, isTaskDoneOnDate, isTaskScheduledForDate } from './tasks.js';

export function getHistoryForDate(state, dateStr = getLocalDateString()) {
  const tasks = state.tasks || [];
  const dayLog = (state.history && state.history[dateStr]) || {};
  const userStats = { matheus: { count: 0 }, scarlet: { count: 0 } };

  // Tudo o que foi concluído neste dia (qualquer periodicidade)
  const tasksDone = Object.entries(dayLog)
    .filter(([, entry]) => entry && entry.done)
    .map(([taskId, entry]) => {
      const task = tasks.find(t => t.id === taskId) || {
        id: taskId, title: entry.title || 'Tarefa removida', room: entry.room, frequency: entry.frequency
      };
      const uid = (entry.userId === 'scarlet' || entry.userId === 'esposa') ? 'scarlet' : 'matheus';
      userStats[uid].count++;
      return { task, entry };
    })
    .sort((a, b) => (a.entry.completedAt || '').localeCompare(b.entry.completedAt || ''));

  // Tarefas que ainda não foram concluídas no dia
  const tasksPending = tasks.filter(t => {
    if (isTaskDoneOnDate(state, t.id, dateStr)) return false;
    if (t.frequency === 'diaria') return isTaskScheduledForDate(t, dateStr);
    return true;
  });

  const total = tasks.length;
  const doneCount = tasksDone.length;
  const pendingCount = tasksPending.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return {
    date: dateStr,
    total,
    doneCount,
    pendingCount,
    percent,
    userStats,
    tasksDone,
    tasksPending
  };
}

export function getRecentDaysSummary(state, daysCount = 7, endDate = new Date()) {
  const result = [];
  const baseDate = typeof endDate === 'string' ? new Date(endDate + 'T12:00:00') : new Date(endDate);
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const h = getHistoryForDate(state, dateStr);
    result.push({
      dateStr,
      dayNumber: d.getDate(),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      doneCount: h.doneCount,
      percent: h.percent,
      status: h.percent === 100 ? 'complete' : (h.doneCount > 0 ? 'partial' : 'empty')
    });
  }
  return result;
}
