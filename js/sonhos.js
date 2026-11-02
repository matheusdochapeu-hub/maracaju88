// ============================================================
//  MARACAJU 88 - MURAL DOS SONHOS & METAS DO CASAL
// ============================================================

export function addSonho(state, data) {
  if (!state.sonhos) state.sonhos = [];

  const newSonho = {
    id: `sonho_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    category: data.category || 'viagem',
    status: data.status || 'sonhando',
    targetAmount: parseFloat(data.targetAmount) || 0,
    targetDate: data.targetDate || '',
    description: data.description ? data.description.trim() : '',
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    createdAt: new Date().toISOString()
  };

  state.sonhos.push(newSonho);
  return newSonho;
}

export function updateSonho(state, id, data) {
  const item = (state.sonhos || []).find(s => s.id === id);
  if (!item) return null;

  if (data.title !== undefined) item.title = data.title.trim();
  if (data.category !== undefined) item.category = data.category;
  if (data.status !== undefined) item.status = data.status;
  if (data.targetAmount !== undefined) item.targetAmount = parseFloat(data.targetAmount) || 0;
  if (data.targetDate !== undefined) item.targetDate = data.targetDate;
  if (data.description !== undefined) item.description = data.description.trim();

  return item;
}

export function deleteSonho(state, id) {
  const idx = (state.sonhos || []).findIndex(s => s.id === id);
  if (idx !== -1) {
    return state.sonhos.splice(idx, 1)[0];
  }
  return null;
}

export function toggleSonhoMilestone(state, sonhoId, milestoneId) {
  const item = (state.sonhos || []).find(s => s.id === sonhoId);
  if (!item || !item.milestones) return false;

  const milestone = item.milestones.find(m => m.id === milestoneId);
  if (milestone) {
    milestone.done = !milestone.done;
    return milestone.done;
  }
  return false;
}

export function addSonhoMilestone(state, sonhoId, title) {
  const item = (state.sonhos || []).find(s => s.id === sonhoId);
  if (!item) return null;
  if (!item.milestones) item.milestones = [];

  const newMilestone = {
    id: `m_${Date.now()}`,
    title: title.trim(),
    done: false
  };

  item.milestones.push(newMilestone);
  return newMilestone;
}

export function getSonhosSummary(state) {
  const list = state.sonhos || [];
  let totalTargetAmount = 0;
  const byCategory = {
    viagem: 0,
    casa: 0,
    bens: 0,
    experiencia: 0
  };

  list.forEach(s => {
    totalTargetAmount += (s.targetAmount || 0);
    const cat = s.category || 'viagem';
    if (byCategory[cat] !== undefined) byCategory[cat]++;
  });

  return {
    count: list.length,
    totalTargetAmount,
    byCategory
  };
}
