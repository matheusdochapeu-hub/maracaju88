// ============================================================
//  MARACAJU 88 - TESTES UNITÁRIOS DE REGRAS DE NEGÓCIO
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { getCoupleTotalXp, getCurrentLevel, calculateStreaks, evaluateBadges } from '../js/gamification.js';
import { getLocalDateString, toggleTaskDone, getDailyTaskProgress, addTask, deleteTask } from '../js/tasks.js';
import { getHistoryForDate, getRecentDaysSummary } from '../js/history.js';
import { addReforma, getReformasSummary, toggleReformaChecklistItem } from '../js/reformas.js';
import { addSonho, getSonhosSummary, toggleSonhoMilestone } from '../js/sonhos.js';

function createMockState() {
  return {
    version: "1.0.0",
    activeUserId: "matheus",
    users: {
      user1: { id: "matheus", name: "Matheus", xp: 0 },
      user2: { id: "esposa", name: "Esposa", xp: 0 }
    },
    gamification: {
      streak: 0,
      bestStreak: 0,
      unlockedBadges: []
    },
    tasks: [
      { id: "task_1", title: "Lavar louça", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos" },
      { id: "task_2", title: "Arrumar cama", room: "quartos", effort: "leve", xp: 10, assignedTo: "ambos" }
    ],
    history: {},
    reformas: [],
    sonhos: [],
    settings: {
      soundEnabled: true,
      autoSync: false
    }
  };
}

test('Gamification: Cálculo de Nível e XP Total do Casal', () => {
  const state = createMockState();
  state.users.user1.xp = 100;
  state.users.user2.xp = 80;

  const total = getCoupleTotalXp(state);
  assert.equal(total, 180);

  const lvl = getCurrentLevel(total);
  assert.equal(lvl.level, 2);
  assert.equal(lvl.title, "Dupla Organizada");
  assert.ok(lvl.progressPercent >= 0 && lvl.progressPercent <= 100);
});

test('Tasks: Concluir tarefa diária, pontuar XP e atualizar streak', () => {
  const state = createMockState();
  const today = getLocalDateString();

  const res = toggleTaskDone(state, "task_1", today, "matheus");
  assert.equal(res.status, "completed");
  assert.equal(res.xpAwarded, 25);
  assert.equal(state.users.user1.xp, 25);
  assert.equal(state.gamification.streak, 1);

  // Progresso do dia
  const progress = getDailyTaskProgress(state, today);
  assert.equal(progress.completed, 1);
  assert.equal(progress.total, 2);
  assert.equal(progress.percent, 50);
  assert.equal(progress.xpEarnedToday, 25);

  // Desmarcar tarefa
  const uncheckRes = toggleTaskDone(state, "task_1", today, "matheus");
  assert.equal(uncheckRes.status, "uncompleted");
  assert.equal(state.users.user1.xp, 0);

  const progressAfter = getDailyTaskProgress(state, today);
  assert.equal(progressAfter.completed, 0);
  assert.equal(progressAfter.percent, 0);
});

test('History: Verificação detalhada de tarefas feitas e pendentes no dia', () => {
  const state = createMockState();
  const today = getLocalDateString();

  toggleTaskDone(state, "task_1", today, "matheus");

  const hist = getHistoryForDate(state, today);
  assert.equal(hist.doneCount, 1);
  assert.equal(hist.pendingCount, 1);
  assert.equal(hist.tasksDone[0].task.id, "task_1");
  assert.equal(hist.tasksPending[0].id, "task_2");
  assert.equal(hist.userStats.matheus.count, 1);
  assert.equal(hist.userStats.matheus.xp, 25);

  const recent = getRecentDaysSummary(state, 7);
  assert.equal(recent.length, 7);
  assert.equal(recent[recent.length - 1].doneCount, 1);
});

test('Reformas: Adicionar projeto, alternar checklist e totalizar orçamento', () => {
  const state = createMockState();
  const ref = addReforma(state, {
    title: "Pintura da Sala",
    room: "sala",
    status: "orcamento",
    estimatedCost: 800,
    actualCost: 150,
    checklist: [{ id: "c1", title: "Comprar tinta", done: false }]
  });

  assert.equal(state.reformas.length, 1);
  assert.equal(ref.estimatedCost, 800);

  // Alternar checklist
  const isDone = toggleReformaChecklistItem(state, ref.id, "c1");
  assert.equal(isDone, true);

  const summary = getReformasSummary(state);
  assert.equal(summary.totalEstimated, 800);
  assert.equal(summary.totalActual, 150);
  assert.equal(summary.byStatus.orcamento, 1);
});

test('Sonhos: Adicionar sonho do casal, marcos e metas', () => {
  const state = createMockState();
  const s = addSonho(state, {
    title: "Viagem Itália",
    category: "viagem",
    targetAmount: 12000,
    status: "sonhando",
    milestones: [{ id: "m1", title: "Passaporte", done: false }]
  });

  assert.equal(state.sonhos.length, 1);
  assert.equal(s.targetAmount, 12000);

  const isDone = toggleSonhoMilestone(state, s.id, "m1");
  assert.equal(isDone, true);

  const summary = getSonhosSummary(state);
  assert.equal(summary.count, 1);
  assert.equal(summary.totalTargetAmount, 12000);
  assert.equal(summary.byCategory.viagem, 1);
});
