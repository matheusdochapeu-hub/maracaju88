// ============================================================
//  MARACAJU - MÓDULO DO CARRO & MANUTENÇÃO
// ============================================================

export function addCarroItem(state, data) {
  if (!state.carro) state.carro = [];

  const newItem = {
    id: `car_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    category: data.category || 'mecanica',
    status: data.status || 'pendente',
    priority: data.priority || 'media',
    estimatedCost: parseFloat(data.estimatedCost) || 0,
    actualCost: parseFloat(data.actualCost) || 0,
    currentKm: parseInt(data.currentKm, 10) || 0,
    targetKm: parseInt(data.targetKm, 10) || 0,
    targetDate: data.targetDate || '',
    notes: data.notes ? data.notes.trim() : '',
    photos: Array.isArray(data.photos) ? data.photos : [],
    links: Array.isArray(data.links) ? data.links : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : [],
    createdAt: new Date().toISOString()
  };

  state.carro.push(newItem);
  return newItem;
}

export function updateCarroItem(state, id, data) {
  const item = (state.carro || []).find(c => c.id === id);
  if (!item) return null;

  if (data.title !== undefined) item.title = data.title.trim();
  if (data.category !== undefined) item.category = data.category;
  if (data.status !== undefined) item.status = data.status;
  if (data.priority !== undefined) item.priority = data.priority;
  if (data.estimatedCost !== undefined) item.estimatedCost = parseFloat(data.estimatedCost) || 0;
  if (data.actualCost !== undefined) item.actualCost = parseFloat(data.actualCost) || 0;
  if (data.currentKm !== undefined) item.currentKm = parseInt(data.currentKm, 10) || 0;
  if (data.targetKm !== undefined) item.targetKm = parseInt(data.targetKm, 10) || 0;
  if (data.targetDate !== undefined) item.targetDate = data.targetDate;
  if (data.notes !== undefined) item.notes = data.notes.trim();

  return item;
}

export function deleteCarroItem(state, id) {
  const idx = (state.carro || []).findIndex(c => c.id === id);
  if (idx !== -1) {
    return state.carro.splice(idx, 1)[0];
  }
  return null;
}

export function addPhotoToCarro(state, id, photoDataUrl) {
  const item = (state.carro || []).find(c => c.id === id);
  if (!item) return false;
  if (!item.photos) item.photos = [];

  item.photos.push(photoDataUrl);
  return true;
}

export function removePhotoFromCarro(state, id, photoIndex) {
  const item = (state.carro || []).find(c => c.id === id);
  if (!item || !item.photos) return false;

  if (photoIndex >= 0 && photoIndex < item.photos.length) {
    item.photos.splice(photoIndex, 1);
    return true;
  }
  return false;
}

export function addLinkToCarro(state, id, linkData) {
  const item = (state.carro || []).find(c => c.id === id);
  if (!item) return null;
  if (!item.links) item.links = [];

  let url = (linkData.url || '').trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const newLink = {
    id: `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    title: (linkData.title || '').trim() || url,
    url
  };

  item.links.push(newLink);
  return newLink;
}

export function removeLinkFromCarro(state, id, linkId) {
  const item = (state.carro || []).find(c => c.id === id);
  if (!item || !item.links) return false;

  const idx = item.links.findIndex(l => l.id === linkId);
  if (idx !== -1) {
    item.links.splice(idx, 1);
    return true;
  }
  return false;
}

export function toggleCarroChecklistItem(state, carroId, checkId) {
  const item = (state.carro || []).find(c => c.id === carroId);
  if (!item || !item.checklist) return false;

  const check = item.checklist.find(chk => chk.id === checkId);
  if (check) {
    check.done = !check.done;
    return check.done;
  }
  return false;
}

export function addCarroChecklistItem(state, carroId, title) {
  const item = (state.carro || []).find(c => c.id === carroId);
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

export function getCarroSummary(state) {
  const list = state.carro || [];
  let totalEstimated = 0;
  let totalActual = 0;
  const byStatus = {
    pendente: 0,
    orcamento: 0,
    andamento: 0,
    concluido: 0
  };

  list.forEach(c => {
    totalEstimated += (c.estimatedCost || 0);
    totalActual += (c.actualCost || 0);
    const st = c.status || 'pendente';
    if (byStatus[st] !== undefined) byStatus[st]++;
  });

  return {
    count: list.length,
    totalEstimated,
    totalActual,
    byStatus
  };
}

// -------------------------------------------------------------
// COMPRESSÃO DE IMAGENS CLIENT-SIDE (Canvas Nativo)
// Converte fotos grandes para WebP/JPEG leve de até 800px (~40-70KB)
// -------------------------------------------------------------
export function compressImageFile(file, maxWidth = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
