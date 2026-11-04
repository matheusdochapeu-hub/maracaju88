// ============================================================
//  MARACAJU - CARRO & MANUTENÇÃO
// ============================================================

import * as P from './projects.js';

const KEY = 'carro';
export const CARRO_STATUS_IDS = ['pendente', 'orcamento', 'andamento', 'concluido'];

export function addCarroItem(state, data) {
  return P.createProject(state, KEY, 'car', {
    ...data,
    targetKm: parseInt(String(data.targetKm || '').replace(/\D/g, ''), 10) || 0,
    notes: (data.notes || '').trim()
  }, { category: 'mecanica', status: 'pendente', priority: 'media', targetDate: '' });
}

export const updateCarroItem = (state, id, data) => P.updateProject(state, KEY, id, data);
export const deleteCarroItem = (state, id) => P.deleteProject(state, KEY, id);
export const addPhotoToCarro = (state, id, url) => P.addPhoto(state, KEY, id, url);
export const removePhotoFromCarro = (state, id, idx) => P.removePhoto(state, KEY, id, idx);
export const addLinkToCarro = (state, id, link) => P.addLink(state, KEY, id, link);
export const removeLinkFromCarro = (state, id, linkId) => P.removeLink(state, KEY, id, linkId);
export const addCarroChecklistItem = (state, id, title) => P.addChecklistItem(state, KEY, id, title);
export const toggleCarroChecklistItem = (state, id, checkId) => P.toggleChecklistItem(state, KEY, id, checkId);
export const getCarroSummary = (state) => P.getProjectsSummary(state, KEY, CARRO_STATUS_IDS);
export { compressImageFile } from './projects.js';
