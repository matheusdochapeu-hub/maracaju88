// ============================================================
//  MARACAJU 88 - CONTROLE DE TAREFAS DIÁRIAS
// ============================================================

import { calculateStreaks, evaluateBadges } from './gamification.js';

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskDoneOnDate(state, taskId, dateStr) {
  if (!state.history || !state.history[dateStr]) return false;
  const entry = state.history[dateStr][taskId];
  return !!(entry && entry.done);
}

export function getTaskHistoryEntry(state, taskId, dateStr) {
  if (!state.history || !state.history[dateStr]) return null;
  return state.history[dateStr][taskId] || null;
}

export function toggleTaskDone(state, taskId, dateStr = getLocalDateString(), userOverride = null) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return null;

  if (!state.history) state.history = {};
  if (!state.history[dateStr]) state.history[dateStr] = {};

  const currentEntry = state.history[dateStr][taskId];
  const isCurrentlyDone = currentEntry && currentEntry.done;

  if (!isCurrentlyDone) {
    // Marcar como concluída
    const activeId = userOverride || state.activeUserId || "matheus";
    const userKey = activeId === "esposa" ? "user2" : "user1";
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
    // Desmarcar tarefa
    const previousXp = currentEntry.xp || task.xp || 10;
    const userId = currentEntry.userId || "matheus";
    const userKey = userId === "esposa" ? "user2" : "user1";

    if (state.users[userKey]) {
      state.users[userKey].xp = Math.max(0, (state.users[userKey].xp || 0) - previousXp);
    }

    delete state.history[dateStr][taskId];

    // Recalcula streak
    state.gamification.streak = calculateStreaks(state.history);

    return {
      status: 'uncompleted',
      xpRemoved: previousXp
    };
  }
}

export function getDailyTaskProgress(state, dateStr = getLocalDateString()) {
  const tasks = state.tasks || [];
  const dayHistory = (state.history && state.history[dateStr]) || {};

  let completedCount = 0;
  let xpEarnedToday = 0;
  const byUser = {
    matheus: { count: 0, xp: 0 },
    esposa: { count: 0, xp: 0 }
  };

  tasks.forEach(task => {
    const entry = dayHistory[task.id];
    if (entry && entry.done) {
      completedCount++;
      const xp = entry.xp || task.xp || 10;
      xpEarnedToday += xp;

      const uid = entry.userId === 'esposa' ? 'esposa' : 'matheus';
      byUser[uid].count++;
      byUser[uid].xp += xp;
    }
  });

  const total = tasks.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    total,
    completed: completedCount,
    percent,
    xpEarnedToday,
    byUser
  };
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
  const index = state.tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    const removed = state.tasks.splice(index, 1)[0];
    return removed;
  }
  return null;
}
