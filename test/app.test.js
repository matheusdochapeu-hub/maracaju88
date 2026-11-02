// ============================================================
//  MARACAJU 88 - TESTES UNITÁRIOS DE REGRAS DE NEGÓCIO (v1.1.0)
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { getCoupleTotalXp, getCurrentLevel } from '../js/gamification.js';
import {
  getLocalDateString,
  toggleTaskDone,
  isTaskDoneOnDate,
  getTasksProgressByFrequency,
  getAllFrequenciesSummary,
  addTask,
  deleteTask
} from '../js/tasks.js';
import { getHistoryForDate, getRecentDaysSummary } from '../js/history.js';
import {
  addCarroItem,
  getCarroSummary,
  addPhotoToCarro,
  removePhotoFromCarro,
  addLinkToCarro,
  removeLinkFromCarro,
  toggleCarroChecklistItem
} from '../js/carro.js';
import { addReforma, getReformasSummary, toggleReformaChecklistItem } from '../js/reformas.js';
import { addSonho, getSonhosSummary, toggleSonhoMilestone } from '../js/sonhos.js';

function createMockState() {
  return {
    version: "1.1.0",
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
      { id: "task_d1", title: "Lavar louça", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria" },
      { id: "task_s1", title: "Lavar banheiro", room: "banheiros", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal" },
      { id: "task_m1", title: "Limpar geladeira", room: "cozinha", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "mensal" },
      { id: "task_a1", title: "Lavar cortinas", room: "sala", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual" }
    ],
    history: {},
    carro: [],
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

test('Tasks: Frequências Diárias, Semanais, Mensais e Anuais', () => {
  const state = createMockState();
  const today = getLocalDateString();

  // 1. Concluir tarefa diária
  const resD = toggleTaskDone(state, "task_d1", today, "matheus");
  assert.equal(resD.status, "completed");
  assert.equal(resD.xpAwarded, 25);
  assert.equal(isTaskDoneOnDate(state, "task_d1", today), true);

  // 2. Concluir tarefa semanal
  const resS = toggleTaskDone(state, "task_s1", today, "esposa");
  assert.equal(resS.status, "completed");
  assert.equal(resS.xpAwarded, 50);
  assert.equal(isTaskDoneOnDate(state, "task_s1", today), true);

  // 3. Concluir tarefa mensal
  const resM = toggleTaskDone(state, "task_m1", today, "matheus");
  assert.equal(resM.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_m1", today), true);

  // 4. Concluir tarefa anual
  const resA = toggleTaskDone(state, "task_a1", today, "esposa");
  assert.equal(resA.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_a1", today), true);

  // Progresso por frequência
  const progD = getTasksProgressByFrequency(state, 'diaria', today);
  assert.equal(progD.total, 1);
  assert.equal(progD.completed, 1);
  assert.equal(progD.percent, 100);

  const progS = getTasksProgressByFrequency(state, 'semanal', today);
  assert.equal(progS.total, 1);
  assert.equal(progS.completed, 1);

  const allFreq = getAllFrequenciesSummary(state, today);
  assert.equal(allFreq.diaria.completed, 1);
  assert.equal(allFreq.semanal.completed, 1);
  assert.equal(allFreq.mensal.completed, 1);
  assert.equal(allFreq.anual.completed, 1);

  // Desmarcar tarefa semanal
  const uncheckS = toggleTaskDone(state, "task_s1", today, "esposa");
  assert.equal(uncheckS.status, "uncompleted");
  assert.equal(isTaskDoneOnDate(state, "task_s1", today), false);
});

test('History: Verificação detalhada de tarefas feitas e pendentes no dia', () => {
  const state = createMockState();
  const today = getLocalDateString();

  toggleTaskDone(state, "task_d1", today, "matheus");

  const hist = getHistoryForDate(state, today);
  assert.equal(hist.doneCount, 1);
  assert.equal(hist.pendingCount, 3);
  assert.equal(hist.tasksDone[0].task.id, "task_d1");
  assert.equal(hist.userStats.matheus.count, 1);
  assert.equal(hist.userStats.matheus.xp, 25);

  const recent = getRecentDaysSummary(state, 7);
  assert.equal(recent.length, 7);
  assert.equal(recent[recent.length - 1].doneCount, 1);
});

test('Carro: Cadastrar manutenção, adicionar fotos, links e checklist', () => {
  const state = createMockState();
  const item = addCarroItem(state, {
    title: "Troca de óleo e filtro",
    category: "oleo_revisao",
    status: "orcamento",
    estimatedCost: 350,
    actualCost: 120,
    targetKm: 80000,
    checklist: [{ id: "c1", title: "Comprar óleo", done: false }]
  });

  assert.equal(state.carro.length, 1);
  assert.equal(item.estimatedCost, 350);

  // Adicionar foto
  const photoAdded = addPhotoToCarro(state, item.id, "data:image/jpeg;base64,sample123");
  assert.equal(photoAdded, true);
  assert.equal(item.photos.length, 1);

  // Remover foto
  removePhotoFromCarro(state, item.id, 0);
  assert.equal(item.photos.length, 0);

  // Adicionar link
  const linkAdded = addLinkToCarro(state, item.id, { url: "mercadolivre.com.br/peca", title: "Filtro no ML" });
  assert.ok(linkAdded.url.startsWith("https://"));
  assert.equal(item.links.length, 1);

  // Remover link
  removeLinkFromCarro(state, item.id, linkAdded.id);
  assert.equal(item.links.length, 0);

  // Checklist
  const isDone = toggleCarroChecklistItem(state, item.id, "c1");
  assert.equal(isDone, true);

  const summary = getCarroSummary(state);
  assert.equal(summary.totalEstimated, 350);
  assert.equal(summary.totalActual, 120);
  assert.equal(summary.byStatus.orcamento, 1);
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
