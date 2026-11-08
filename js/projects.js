// ============================================================
//  MARACAJU - PROJETOS (base comum de Carro e Reformas)
//  Fotos, links, checklist e valores com centavos.
// ============================================================

import { parseCurrency } from './currency.js';

function list(state, key) {
  if (!Array.isArray(state[key])) state[key] = [];
  return state[key];
}

export function findProject(state, key, id) {
  return list(state, key).find(i => i.id === id) || null;
}

export function normalizeUrl(raw) {
  let url = (raw || '').trim();
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

export function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

// fields: lista de campos de texto específicos do módulo (ex: category/room, notes/description)
export function createProject(state, key, prefix, data, defaults = {}) {
  const title = (data.title || '').trim();
  if (!title) throw new Error('O título é obrigatório.');
  const item = {
    ...defaults,
    ...data,
    id: makeId(prefix),
    title,
    estimatedCost: parseCurrency(data.estimatedCost),
    actualCost: parseCurrency(data.actualCost),
    photos: Array.isArray(data.photos) ? data.photos : [],
    links: Array.isArray(data.links) ? data.links : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
    createdAt: new Date().toISOString()
  };
  list(state, key).push(item);
  return item;
}

export function updateProject(state, key, id, data) {
  const item = findProject(state, key, id);
  if (!item) return null;
  Object.entries(data).forEach(([field, value]) => {
    if (value === undefined || field === 'id') return;
    if (field === 'estimatedCost' || field === 'actualCost') item[field] = parseCurrency(value);
    else if (field === 'targetKm') item[field] = parseInt(String(value).replace(/\D/g, ''), 10) || 0;
    else if (field === 'title') {
      const t = String(value).trim();
      if (!t) throw new Error('O título é obrigatório.');
      item.title = t;
    } else if (typeof value === 'string') item[field] = value.trim();
    else item[field] = value;
  });
  item.updatedAt = new Date().toISOString();
  return item;
}

export function deleteProject(state, key, id) {
  const arr = list(state, key);
  const idx = arr.findIndex(i => i.id === id);
  return idx !== -1 ? arr.splice(idx, 1)[0] : null;
}

export function addPhoto(state, key, id, dataUrl) {
  const item = findProject(state, key, id);
  if (!item) return false;
  if (!item.photos) item.photos = [];
  item.photos.push(dataUrl);
  return true;
}

export function removePhoto(state, key, id, index) {
  const item = findProject(state, key, id);
  if (!item || !item.photos || index < 0 || index >= item.photos.length) return false;
  item.photos.splice(index, 1);
  return true;
}

export function addLink(state, key, id, { url, title }) {
  const item = findProject(state, key, id);
  const cleanUrl = normalizeUrl(url);
  if (!item || !cleanUrl) return null;
  if (!item.links) item.links = [];
  const link = { id: makeId('lnk'), title: (title || '').trim() || cleanUrl, url: cleanUrl };
  item.links.push(link);
  return link;
}

export function removeLink(state, key, id, linkId) {
  const item = findProject(state, key, id);
  if (!item || !item.links) return false;
  const idx = item.links.findIndex(l => l.id === linkId);
  if (idx === -1) return false;
  item.links.splice(idx, 1);
  return true;
}

export function addChecklistItem(state, key, id, title) {
  const item = findProject(state, key, id);
  const t = (title || '').trim();
  if (!item || !t) return null;
  if (!item.checklist) item.checklist = [];
  const check = { id: makeId('chk'), title: t, done: false };
  item.checklist.push(check);
  return check;
}

export function toggleChecklistItem(state, key, id, checkId) {
  const item = findProject(state, key, id);
  const check = item && (item.checklist || []).find(c => c.id === checkId);
  if (!check) return false;
  check.done = !check.done;
  return check.done;
}

export function removeChecklistItem(state, key, id, checkId) {
  const item = findProject(state, key, id);
  if (!item || !item.checklist) return false;
  const before = item.checklist.length;
  item.checklist = item.checklist.filter(c => c.id !== checkId);
  return item.checklist.length < before;
}

export function getProjectsSummary(state, key, statusIds) {
  const arr = list(state, key);
  const byStatus = Object.fromEntries(statusIds.map(s => [s, 0]));
  let totalEstimated = 0;
  let totalActual = 0;
  arr.forEach(i => {
    totalEstimated += i.estimatedCost || 0;
    totalActual += i.actualCost || 0;
    if (byStatus[i.status] !== undefined) byStatus[i.status]++;
  });
  return {
    count: arr.length,
    totalEstimated: Math.round(totalEstimated * 100) / 100,
    totalActual: Math.round(totalActual * 100) / 100,
    byStatus
  };
}

// Compressão de imagens no navegador (até 800px no maior lado, JPEG ~70%)
export function compressImageFile(file, maxWidth = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = maxWidth || 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
