// ============================================================
//  MARACAJU - REFORMAS & MELHORIAS NA CASA
// ============================================================

import * as P from './projects.js';

const KEY = 'reformas';
export const REFORMA_STATUS_IDS = ['ideia', 'orcamento', 'andamento', 'concluido'];

export function addReforma(state, data) {
  return P.createProject(state, KEY, 'ref', {
    ...data,
    description: (data.description || '').trim()
  }, { room: 'geral', status: 'ideia', priority: 'media', targetDate: '' });
}

export const updateReforma = (state, id, data) => P.updateProject(state, KEY, id, data);
export const deleteReforma = (state, id) => P.deleteProject(state, KEY, id);
export const addPhotoToReforma = (state, id, url) => P.addPhoto(state, KEY, id, url);
export const removePhotoFromReforma = (state, id, idx) => P.removePhoto(state, KEY, id, idx);
export const addLinkToReforma = (state, id, link) => P.addLink(state, KEY, id, link);
export const removeLinkFromReforma = (state, id, linkId) => P.removeLink(state, KEY, id, linkId);
export const addReformaChecklistItem = (state, id, title) => P.addChecklistItem(state, KEY, id, title);
export const toggleReformaChecklistItem = (state, id, checkId) => P.toggleChecklistItem(state, KEY, id, checkId);
export const getReformasSummary = (state) => P.getProjectsSummary(state, KEY, REFORMA_STATUS_IDS);
