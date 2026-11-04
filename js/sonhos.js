// ============================================================
//  MARACAJU - MURAL DOS SONHOS & METAS DO CASAL
// ============================================================

import { parseCurrency } from './currency.js';
import { makeId } from './projects.js';

function list(state) {
  if (!Array.isArray(state.sonhos)) state.sonhos = [];
  return state.sonhos;
}

export function addSonho(state, data) {
  const title = (data.title || '').trim();
  if (!title) throw new Error('O título do sonho é obrigatório.');
  const sonho = {
    id: makeId('sonho'),
    title,
    category: data.category || 'viagem',
    status: data.status || 'sonhando',
    targetAmount: parseCurrency(data.targetAmount),
    savedAmount: parseCurrency(data.savedAmount),
    targetDate: data.targetDate || '',
    description: (data.description || '').trim(),
    photos: Array.isArray(data.photos) ? data.photos : [],
    milestones: Array.isArray(data.milestones) ? data.milestones : [],
    createdAt: new Date().toISOString()
  };
  list(state).push(sonho);
  return sonho;
}

export function addPhotoToSonho(state, id, photoUrl) {
  const item = list(state).find(s => s.id === id);
  if (!item) return false;
  if (!Array.isArray(item.photos)) item.photos = [];
  item.photos.push(photoUrl);
  return true;
}

export function removePhotoFromSonho(state, id, index) {
  const item = list(state).find(s => s.id === id);
  if (!item || !Array.isArray(item.photos) || index < 0 || index >= item.photos.length) return false;
  item.photos.splice(index, 1);
  return true;
}

export function updateSonho(state, id, data) {
  const item = list(state).find(s => s.id === id);
  if (!item) return null;
  if (data.title !== undefined) {
    const t = data.title.trim();
    if (!t) throw new Error('O título do sonho é obrigatório.');
    item.title = t;
  }
  ['category', 'status', 'targetDate'].forEach(f => { if (data[f] !== undefined) item[f] = data[f]; });
  if (data.description !== undefined) item.description = (data.description || '').trim();
  if (data.targetAmount !== undefined) item.targetAmount = parseCurrency(data.targetAmount);
  if (data.savedAmount !== undefined) item.savedAmount = parseCurrency(data.savedAmount);
  item.updatedAt = new Date().toISOString();
  return item;
}

export function deleteSonho(state, id) {
  const arr = list(state);
  const idx = arr.findIndex(s => s.id === id);
  return idx !== -1 ? arr.splice(idx, 1)[0] : null;
}

export function toggleSonhoMilestone(state, sonhoId, milestoneId) {
  const item = list(state).find(s => s.id === sonhoId);
  const m = item && (item.milestones || []).find(x => x.id === milestoneId);
  if (!m) return false;
  m.done = !m.done;
  return m.done;
}

export function addSonhoMilestone(state, sonhoId, title) {
  const item = list(state).find(s => s.id === sonhoId);
  const t = (title || '').trim();
  if (!item || !t) return null;
  if (!item.milestones) item.milestones = [];
  const m = { id: makeId('m'), title: t, done: false };
  item.milestones.push(m);
  return m;
}

export function removeSonhoMilestone(state, sonhoId, milestoneId) {
  const item = list(state).find(s => s.id === sonhoId);
  if (!item || !item.milestones) return false;
  const before = item.milestones.length;
  item.milestones = item.milestones.filter(m => m.id !== milestoneId);
  return item.milestones.length < before;
}

export function getSonhoProgress(sonho) {
  if (!sonho.targetAmount) return 0;
  return Math.min(100, Math.round(((sonho.savedAmount || 0) / sonho.targetAmount) * 100));
}

export function getSonhosSummary(state) {
  const arr = list(state);
  const byCategory = {};
  let totalTargetAmount = 0;
  let totalSaved = 0;
  arr.forEach(s => {
    totalTargetAmount += s.targetAmount || 0;
    totalSaved += s.savedAmount || 0;
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  });
  return {
    count: arr.length,
    totalTargetAmount: Math.round(totalTargetAmount * 100) / 100,
    totalSaved: Math.round(totalSaved * 100) / 100,
    byCategory
  };
}
