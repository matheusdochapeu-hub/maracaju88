// ============================================================
//  MARACAJU 88 - SISTEMA DE GAMIFICAÇÃO & PLACAR
// ============================================================

import { LEVELS, BADGES } from './config.js';

export function getCoupleTotalXp(state) {
  const u1 = state.users.user1 ? state.users.user1.xp || 0 : 0;
  const u2 = state.users.user2 ? state.users.user2.xp || 0 : 0;
  return u1 + u2;
}

export function getCurrentLevel(totalXp) {
  let current = LEVELS[0];
  let next = LEVELS[1] || null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (totalXp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    } else {
      break;
    }
  }

  let progressPercent = 100;
  let xpNeeded = 0;

  if (next) {
    const range = next.minXp - current.minXp;
    const currentInRange = totalXp - current.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
    xpNeeded = next.minXp - totalXp;
  }

  return {
    level: current.level,
    title: current.title,
    icon: current.icon,
    minXp: current.minXp,
    totalXp,
    nextTitle: next ? next.title : null,
    nextMinXp: next ? next.minXp : null,
    progressPercent,
    xpNeeded
  };
}

export function calculateStreaks(history) {
  // history: { "YYYY-MM-DD": { [taskId]: { done: true, ... } } }
  const today = new Date();
  const formatDate = (d) => d.toISOString().split("T")[0];

  let streak = 0;
  let checkDate = new Date(today);

  // Verifica se hoje tem alguma tarefa concluída
  const todayStr = formatDate(today);
  const todayHasTasks = history[todayStr] && Object.values(history[todayStr]).some(t => t.done);

  if (!todayHasTasks) {
    // Se hoje ainda não concluiu, verifica a partir de ontem para não quebrar a sequência antes do fim do dia
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = formatDate(checkDate);
    const dayData = history[dateStr];
    const hasCompleted = dayData && Object.values(dayData).some(t => t.done);

    if (hasCompleted) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function evaluateBadges(state) {
  const unlocked = new Set(state.gamification.unlockedBadges || []);
  const newlyUnlocked = [];

  // Estatísticas agregadas
  let totalCompletedTasks = 0;
  let cozinhaTasks = 0;

  Object.values(state.history || {}).forEach(day => {
    Object.values(day).forEach(entry => {
      if (entry && entry.done) {
        totalCompletedTasks++;
        if (entry.room === 'cozinha') cozinhaTasks++;
      }
    });
  });

  const streak = state.gamification.streak || 0;
  const reformasCount = (state.reformas || []).length;
  const sonhosCount = (state.sonhos || []).length;

  BADGES.forEach(badge => {
    if (unlocked.has(badge.id)) return;

    let conditionMet = false;
    switch (badge.reqType) {
      case 'tasks_count':
        conditionMet = totalCompletedTasks >= badge.reqValue;
        break;
      case 'streak':
        conditionMet = streak >= badge.reqValue;
        break;
      case 'room_cozinha':
        conditionMet = cozinhaTasks >= badge.reqValue;
        break;
      case 'reformas_count':
        conditionMet = reformasCount >= badge.reqValue;
        break;
      case 'sonhos_count':
        conditionMet = sonhosCount >= badge.reqValue;
        break;
    }

    if (conditionMet) {
      unlocked.add(badge.id);
      newlyUnlocked.push(badge);
    }
  });

  state.gamification.unlockedBadges = Array.from(unlocked);
  return newlyUnlocked;
}
