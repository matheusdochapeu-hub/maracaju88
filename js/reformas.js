// ============================================================
//  MARACAJU 88 - REFORMAS & MELHORIAS NA CASA
// ============================================================

export function addReforma(state, data) {
  if (!state.reformas) state.reformas = [];

  const newReforma = {
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    room: data.room || 'geral',
    priority: data.priority || 'media',
    status: data.status || 'ideia',
    estimatedCost: parseFloat(data.estimatedCost) || 0,
    actualCost: parseFloat(data.actualCost) || 0,
    targetDate: data.targetDate || '',
    description: data.description ? data.description.trim() : '',
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
    createdAt: new Date().toISOString()
  };

  state.reformas.push(newReforma);
  return newReforma;
}

export function updateReforma(state, id, data) {
  const item = (state.reformas || []).find(r => r.id === id);
  if (!item) return null;

  if (data.title !== undefined) item.title = data.title.trim();
  if (data.room !== undefined) item.room = data.room;
  if (data.priority !== undefined) item.priority = data.priority;
  if (data.status !== undefined) item.status = data.status;
  if (data.estimatedCost !== undefined) item.estimatedCost = parseFloat(data.estimatedCost) || 0;
  if (data.actualCost !== undefined) item.actualCost = parseFloat(data.actualCost) || 0;
  if (data.targetDate !== undefined) item.targetDate = data.targetDate;
  if (data.description !== undefined) item.description = data.description.trim();

  return item;
}

export function deleteReforma(state, id) {
  const idx = (state.reformas || []).findIndex(r => r.id === id);
  if (idx !== -1) {
    return state.reformas.splice(idx, 1)[0];
  }
  return null;
}

export function toggleReformaChecklistItem(state, reformaId, checkId) {
  const item = (state.reformas || []).find(r => r.id === reformaId);
  if (!item || !item.checklist) return false;

  const check = item.checklist.find(c => c.id === checkId);
  if (check) {
    check.done = !check.done;
    return check.done;
  }
  return false;
}

export function addReformaChecklistItem(state, reformaId, title) {
  const item = (state.reformas || []).find(r => r.id === reformaId);
  if (!item) return null;
  if (!item.checklist) item.checklist = [];

  const newCheck = {
    id: `chk_${Date.now()}`,
    title: title.trim(),
    done: false
  };

  item.checklist.push(newCheck);
  return newCheck;
}

export function getReformasSummary(state) {
  const list = state.reformas || [];
  let totalEstimated = 0;
  let totalActual = 0;
  const byStatus = {
    ideia: 0,
    orcamento: 0,
    andamento: 0,
    concluido: 0
  };

  list.forEach(r => {
    totalEstimated += (r.estimatedCost || 0);
    totalActual += (r.actualCost || 0);
    const st = r.status || 'ideia';
    if (byStatus[st] !== undefined) byStatus[st]++;
  });

  return {
    count: list.length,
    totalEstimated,
    totalActual,
    byStatus
  };
}
