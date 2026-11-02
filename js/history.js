// ============================================================
//  MARACAJU - HISTÓRICO & VERIFICAÇÃO DIÁRIA
// ============================================================

import { getLocalDateString } from './tasks.js';

export function getHistoryForDate(state, dateStr = getLocalDateString()) {
  const tasks = state.tasks || [];
  const dayLog = (state.history && state.history[dateStr]) || {};

  const tasksDone = [];
  const tasksPending = [];

  let totalXp = 0;
  const userStats = {
    matheus: { count: 0, xp: 0 },
    scarlet: { count: 0, xp: 0 }
  };

  tasks.forEach(task => {
    const entry = dayLog[task.id];
    if (entry && entry.done) {
      tasksDone.push({
        task,
        entry
      });
      const xp = entry.xp || task.xp || 10;
      totalXp += xp;

      const uid = (entry.userId === 'esposa' || entry.userId === 'scarlet') ? 'scarlet' : 'matheus';
      userStats[uid].count++;
      userStats[uid].xp += xp;
    } else {
      tasksPending.push(task);
    }
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
    totalXp,
    userStats,
    tasksDone,
    tasksPending
  };
}

export function getRecentDaysSummary(state, daysCount = 7) {
  const result = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);

    const history = (state.history && state.history[dateStr]) || {};
    const tasks = state.tasks || [];
    const doneCount = Object.values(history).filter(e => e && e.done).length;
    const total = tasks.length;
    const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    let status = 'empty';
    if (percent === 100) status = 'complete';
    else if (percent > 0) status = 'partial';

    result.push({
      dateStr,
      dayNumber: d.getDate(),
      weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      doneCount,
      total,
      percent,
      status
    });
  }

  return result;
}
