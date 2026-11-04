// ============================================================
//  MARACAJU - HISTÓRICO & VERIFICAÇÃO DIÁRIA
//  "O que foi feito (e por quem) em cada dia"
// ============================================================

import { getLocalDateString, isTaskDoneOnDate } from './tasks.js';

export function getHistoryForDate(state, dateStr = getLocalDateString()) {
  const tasks = state.tasks || [];
  const dayLog = (state.history && state.history[dateStr]) || {};
  const userStats = { matheus: { count: 0, xp: 0 }, scarlet: { count: 0, xp: 0 } };

  // Tudo o que foi concluído neste dia (qualquer periodicidade)
  const tasksDone = Object.entries(dayLog)
    .filter(([, entry]) => entry && entry.done)
    .map(([taskId, entry]) => {
      const task = tasks.find(t => t.id === taskId) || {
        id: taskId, title: entry.title || 'Tarefa removida', room: entry.room, frequency: entry.frequency, xp: entry.xp || 10
      };
      const uid = (entry.userId === 'scarlet' || entry.userId === 'esposa') ? 'scarlet' : 'matheus';
      const xpVal = entry.xp || task.xp || 10;
      userStats[uid].count++;
      userStats[uid].xp = (userStats[uid].xp || 0) + xpVal;
      return { task, entry };
    })
    .sort((a, b) => (a.entry.completedAt || '').localeCompare(b.entry.completedAt || ''));

  // Tarefas que ainda não foram concluídas no dia
  const tasksPending = tasks.filter(t => !isTaskDoneOnDate(state, t.id, dateStr));

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
