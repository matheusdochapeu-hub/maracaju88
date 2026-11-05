// ============================================================
//  MARACAJU - TAREFAS DA CASA & PERIODICIDADE
//  Diárias ☀️, Semanais 📅, Mensais 🗓️ e Anuais 🎯
// ============================================================

export const FREQUENCY_IDS = ['diaria', 'semanal', 'mensal', 'anual'];

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Intervalo [segunda, domingo] da semana de uma data
export function getWeekBoundaries(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const dayOfWeek = target.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(target);
  monday.setDate(target.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { startStr: getLocalDateString(monday), endStr: getLocalDateString(sunday) };
}

// Datas do histórico que pertencem ao período da tarefa (dia/semana/mês/ano)
function datesInPeriod(history, frequency, dateStr) {
  const all = Object.keys(history);
  if (frequency === 'semanal') {
    const { startStr, endStr } = getWeekBoundaries(dateStr);
    return all.filter(d => d >= startStr && d <= endStr);
  }
  if (frequency === 'mensal') return all.filter(d => d.startsWith(dateStr.substring(0, 7)));
  if (frequency === 'anual') return all.filter(d => d.startsWith(dateStr.substring(0, 4)));
  return all.filter(d => d === dateStr);
}

export function getTaskHistoryEntry(state, taskId, dateStr = getLocalDateString()) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return null;
  const history = state.history || {};
  const dates = datesInPeriod(history, task.frequency || 'diaria', dateStr).sort().reverse();
  for (const d of dates) {
    const entry = history[d] && history[d][taskId];
    if (entry && entry.done) return { ...entry, completedOnDate: d };
  }
  return null;
}

export function isTaskDoneOnDate(state, taskId, dateStr = getLocalDateString()) {
  return !!getTaskHistoryEntry(state, taskId, dateStr);
}

function resolveUser(state, userId) {
  const isScarlet = userId === 'scarlet' || userId === 'esposa';
  const user = isScarlet ? state.users?.user2 : state.users?.user1;
  return { id: isScarlet ? 'scarlet' : 'matheus', name: user?.name || (isScarlet ? 'Scarlet' : 'Matheus') };
}

// Marca/desmarca a tarefa no período. Retorna { status: 'completed' | 'uncompleted', doneBy }
export function toggleTaskDone(state, taskId, dateStr = getLocalDateString(), userId = null) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return null;
  if (!state.history) state.history = {};

  const existing = getTaskHistoryEntry(state, taskId, dateStr);
  if (existing) {
    const day = state.history[existing.completedOnDate];
    if (day) {
      delete day[taskId];
      if (Object.keys(day).length === 0) delete state.history[existing.completedOnDate];
    }
    return { status: 'uncompleted' };
  }

  const user = resolveUser(state, userId || state.activeUserId || 'matheus');
  const now = new Date();
  if (!state.history[dateStr]) state.history[dateStr] = {};
  state.history[dateStr][taskId] = {
    done: true,
    doneBy: user.name,
    userId: user.id,
    title: task.title,
    room: task.room,
    frequency: task.frequency || 'diaria',
    completedAt: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  };
  return { status: 'completed', doneBy: user.name };
}

export function getTasksProgressByFrequency(state, frequency = 'diaria', dateStr = getLocalDateString()) {
  const tasks = (state.tasks || []).filter(t => (t.frequency || 'diaria') === frequency);
  const completed = tasks.filter(t => isTaskDoneOnDate(state, t.id, dateStr)).length;
  const total = tasks.length;
  return { frequency, total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function getAllFrequenciesSummary(state, dateStr = getLocalDateString()) {
  const out = {};
  FREQUENCY_IDS.forEach(f => { out[f] = getTasksProgressByFrequency(state, f, dateStr); });
  return out;
}

function normalizeFrequency(f) {
  return FREQUENCY_IDS.includes(f) ? f : 'diaria';
}

export function addTask(state, data) {
  const title = (data.title || '').trim();
  if (!title) throw new Error('O título da tarefa é obrigatório.');
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    room: data.room || 'geral',
    assignedTo: data.assignedTo || 'ambos',
    effort: data.effort || 'media',
    frequency: normalizeFrequency(data.frequency),
    notes: data.notes ? data.notes.trim() : '',
    createdAt: new Date().toISOString()
  };
  if (!state.tasks) state.tasks = [];
  state.tasks.push(newTask);
  return newTask;
}

export function updateTask(state, taskId, data) {
  const task = (state.tasks || []).find(t => t.id === taskId);
  if (!task) return null;
  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) throw new Error('O título da tarefa é obrigatório.');
    task.title = title;
  }
  if (data.room !== undefined) task.room = data.room;
  if (data.frequency !== undefined) task.frequency = normalizeFrequency(data.frequency);
  if (data.effort !== undefined) task.effort = data.effort;
  if (data.assignedTo !== undefined) task.assignedTo = data.assignedTo;
  if (data.notes !== undefined) task.notes = (data.notes || '').trim();
  task.updatedAt = new Date().toISOString();
  return task;
}

export function deleteTask(state, taskId) {
  const index = (state.tasks || []).findIndex(t => t.id === taskId);
  return index !== -1 ? state.tasks.splice(index, 1)[0] : null;
}
