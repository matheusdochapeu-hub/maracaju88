// ============================================================
//  MARACAJU 88 - CONTROLE DE TAREFAS & PERIODICIDADE
//  Divisão por: Diárias ☀️, Semanais 📅, Mensais 🗓️ e Anuais 🎯
// ============================================================

import { calculateStreaks, evaluateBadges } from './gamification.js';

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Retorna o intervalo [segunda-feira, domingo] da semana para uma data
export function getWeekBoundaries(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const dayOfWeek = target.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(target);
  monday.setDate(target.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startStr: getLocalDateString(monday),
    endStr: getLocalDateString(sunday)
  };
}

// Verifica se uma tarefa está concluída no período correspondente à sua frequência
export function isTaskDoneOnDate(state, taskId, dateStr = getLocalDateString()) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return false;

  const freq = task.frequency || 'diaria';
  const history = state.history || {};

  if (freq === 'diaria') {
    return !!(history[dateStr] && history[dateStr][taskId] && history[dateStr][taskId].done);
  }

  if (freq === 'semanal') {
    const { startStr, endStr } = getWeekBoundaries(dateStr);
    const dates = Object.keys(history).filter(d => d >= startStr && d <= endStr);
    return dates.some(d => history[d] && history[d][taskId] && history[d][taskId].done);
  }

  if (freq === 'mensal') {
    const monthPrefix = dateStr.substring(0, 7); // "YYYY-MM"
    const dates = Object.keys(history).filter(d => d.startsWith(monthPrefix));
    return dates.some(d => history[d] && history[d][taskId] && history[d][taskId].done);
  }

  if (freq === 'anual') {
    const yearPrefix = dateStr.substring(0, 4); // "YYYY"
    const dates = Object.keys(history).filter(d => d.startsWith(yearPrefix));
    return dates.some(d => history[d] && history[d][taskId] && history[d][taskId].done);
  }

  return !!(history[dateStr] && history[dateStr][taskId] && history[dateStr][taskId].done);
}

// Encontra o registro de histórico de conclusão da tarefa para o período
export function getTaskHistoryEntry(state, taskId, dateStr = getLocalDateString()) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return null;

  const freq = task.frequency || 'diaria';
  const history = state.history || {};

  if (freq === 'diaria') {
    return (history[dateStr] && history[dateStr][taskId]) || null;
  }

  if (freq === 'semanal') {
    const { startStr, endStr } = getWeekBoundaries(dateStr);
    const dates = Object.keys(history).filter(d => d >= startStr && d <= endStr).sort().reverse();
    for (const d of dates) {
      if (history[d] && history[d][taskId] && history[d][taskId].done) {
        return { ...history[d][taskId], completedOnDate: d };
      }
    }
    return null;
  }

  if (freq === 'mensal') {
    const monthPrefix = dateStr.substring(0, 7);
    const dates = Object.keys(history).filter(d => d.startsWith(monthPrefix)).sort().reverse();
    for (const d of dates) {
      if (history[d] && history[d][taskId] && history[d][taskId].done) {
        return { ...history[d][taskId], completedOnDate: d };
      }
    }
    return null;
  }

  if (freq === 'anual') {
    const yearPrefix = dateStr.substring(0, 4);
    const dates = Object.keys(history).filter(d => d.startsWith(yearPrefix)).sort().reverse();
    for (const d of dates) {
      if (history[d] && history[d][taskId] && history[d][taskId].done) {
        return { ...history[d][taskId], completedOnDate: d };
      }
    }
    return null;
  }

  return (history[dateStr] && history[dateStr][taskId]) || null;
}

export function toggleTaskDone(state, taskId, dateStr = getLocalDateString(), userOverride = null) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return null;

  if (!state.history) state.history = {};

  const isCurrentlyDone = isTaskDoneOnDate(state, taskId, dateStr);

  if (!isCurrentlyDone) {
    // Marcar como concluída na data informada
    if (!state.history[dateStr]) state.history[dateStr] = {};

    const activeId = userOverride || state.activeUserId || "matheus";
    const userKey = (activeId === "esposa" || activeId === "scarlet") ? "user2" : "user1";
    const userObj = state.users[userKey] || { name: activeId, xp: 0 };

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    state.history[dateStr][taskId] = {
      done: true,
      doneBy: userObj.name,
      userId: activeId,
      xp: task.xp || 10,
      title: task.title,
      room: task.room,
      frequency: task.frequency || 'diaria',
      completedAt: timeStr
    };

    // Incrementa XP do usuário
    userObj.xp = (userObj.xp || 0) + (task.xp || 10);
    state.users[userKey] = userObj;

    // Atualiza Streak
    const currentStreak = calculateStreaks(state.history);
    state.gamification.streak = currentStreak;
    if (currentStreak > (state.gamification.bestStreak || 0)) {
      state.gamification.bestStreak = currentStreak;
    }

    // Avalia Conquistas
    const newlyUnlocked = evaluateBadges(state);

    return {
      status: 'completed',
      xpAwarded: task.xp || 10,
      doneBy: userObj.name,
      newlyUnlocked
    };

  } else {
    // Desmarcar tarefa: busca a data onde foi gravada a conclusão
    const entry = getTaskHistoryEntry(state, taskId, dateStr);
    const recordedDate = (entry && entry.completedOnDate) || dateStr;

    if (state.history[recordedDate] && state.history[recordedDate][taskId]) {
      const prev = state.history[recordedDate][taskId];
      const previousXp = prev.xp || task.xp || 10;
      const userId = prev.userId || "matheus";
      const userKey = (userId === "esposa" || userId === "scarlet") ? "user2" : "user1";

      if (state.users[userKey]) {
        state.users[userKey].xp = Math.max(0, (state.users[userKey].xp || 0) - previousXp);
      }

      delete state.history[recordedDate][taskId];
      state.gamification.streak = calculateStreaks(state.history);

      return {
        status: 'uncompleted',
        xpRemoved: previousXp
      };
    }

    return { status: 'uncompleted', xpRemoved: 0 };
  }
}

// Progresso das tarefas filtradas por frequência (diária, semanal, mensal, anual)
export function getTasksProgressByFrequency(state, frequency = 'diaria', dateStr = getLocalDateString()) {
  const allTasks = state.tasks || [];
  const tasks = allTasks.filter(t => (t.frequency || 'diaria') === frequency);

  let completedCount = 0;
  let xpEarned = 0;

  tasks.forEach(t => {
    if (isTaskDoneOnDate(state, t.id, dateStr)) {
      completedCount++;
      xpEarned += (t.xp || 10);
    }
  });

  const total = tasks.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    frequency,
    total,
    completed: completedCount,
    percent,
    xpEarned
  };
}

// Resumo geral com contagem para cada uma das 4 abas de frequência
export function getAllFrequenciesSummary(state, dateStr = getLocalDateString()) {
  return {
    diaria: getTasksProgressByFrequency(state, 'diaria', dateStr),
    semanal: getTasksProgressByFrequency(state, 'semanal', dateStr),
    mensal: getTasksProgressByFrequency(state, 'mensal', dateStr),
    anual: getTasksProgressByFrequency(state, 'anual', dateStr)
  };
}

export function getDailyTaskProgress(state, dateStr = getLocalDateString()) {
  return getTasksProgressByFrequency(state, 'diaria', dateStr);
}

export function addTask(state, taskData) {
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: taskData.title.trim(),
    room: taskData.room || 'geral',
    effort: taskData.effort || 'media',
    xp: taskData.xp || (taskData.effort === 'pesada' ? 50 : (taskData.effort === 'leve' ? 10 : 25)),
    assignedTo: taskData.assignedTo || 'ambos',
    frequency: taskData.frequency || 'diaria',
    notes: taskData.notes ? taskData.notes.trim() : '',
    createdAt: new Date().toISOString()
  };

  state.tasks.push(newTask);
  return newTask;
}

export function deleteTask(state, taskId) {
  const index = (state.tasks || []).findIndex(t => t.id === taskId);
  if (index !== -1) {
    return state.tasks.splice(index, 1)[0];
  }
  return null;
}
