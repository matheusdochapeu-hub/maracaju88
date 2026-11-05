// ============================================================
//  MARACAJU - GOOGLE SHEETS SYNC & BACKUP CLIENT
// ============================================================

export async function testSheetsConnection(url, token, timeoutMs = 10000) {
  if (!url || !url.trim()) {
    throw new Error("Por favor, informe a URL do Google Apps Script.");
  }

  const endpoint = new URL(url.trim());
  endpoint.searchParams.set("action", "ping");
  if (token) {
    endpoint.searchParams.set("token", token.trim());
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Erro na conexão HTTP: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.status !== "success") {
      throw new Error(json.message || "Falha ao validar token do Google Sheets.");
    }

    return json;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error("Tempo limite excedido ao testar conexão (timeout de 10s).");
    }
    throw err;
  }
}

export async function backupToSheets(state, overrideUrl = null, overrideToken = null, timeoutMs = 15000) {
  const url = overrideUrl || (state && state.settings && state.settings.sheetsUrl);
  const token = overrideToken !== null ? overrideToken : (state && state.settings && state.settings.sheetsToken);

  if (!url || !url.trim()) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  const payload = {
    action: "backup",
    token: token ? token.trim() : "",
    data: {
      version: state.version,
      lastUpdated: new Date().toISOString(),
      activeUserId: state.activeUserId,
      users: state.users,
      gamification: state.gamification,
      tasks: state.tasks || [],
      history: state.history || {},
      carro: state.carro || [],
      reformas: state.reformas || [],
      sonhos: state.sonhos || [],
      compras: state.compras || [],
      comprasRegistros: state.comprasRegistros || [],
      catalog: state.catalog || [],
      categories: state.categories || {},
      userPasswords: state.userPasswords || {}
    }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Usamos text/plain para evitar bloqueios de CORS pré-flight (OPTIONS) no Apps Script
    const response = await fetch(url.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timer);

    let result;
    try {
      result = await response.json();
    } catch (err) {
      // Caso o Apps Script responda redirect ou texto simples
      result = { status: "success", message: "Backup enviado para processamento." };
    }

    if (result && result.status === "error") {
      throw new Error(result.message || "Erro desconhecido ao gravar no Google Sheets.");
    }

    if (state && state.settings) {
      state.settings.lastSyncTimestamp = new Date().toISOString();
    }
    return result;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error("Tempo limite excedido ao salvar na nuvem (timeout de 15s).");
    }
    throw err;
  }
}

export async function restoreFromSheets(state, overrideUrl = null, overrideToken = null, timeoutMs = 12000) {
  const url = overrideUrl || (state && state.settings && state.settings.sheetsUrl);
  const token = overrideToken !== null ? overrideToken : (state && state.settings && state.settings.sheetsToken);

  if (!url || !url.trim()) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  const endpoint = new URL(url.trim());
  endpoint.searchParams.set("action", "restore");
  if (token) {
    endpoint.searchParams.set("token", token.trim());
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Erro ao conectar: ${res.status}`);
    }

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (parseErr) {
      throw new Error("Resposta da planilha inválida (esperava JSON). Verifique se o Apps Script está publicado corretamente.");
    }

    if (json.status !== "success" || !json.data) {
      throw new Error(json.message || "Nenhum dado encontrado para restaurar.");
    }

    return json.data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error("Tempo limite excedido ao ler a planilha (timeout de 12s).");
    }
    throw err;
  }
}

/**
 * Aplica os dados do backup na nuvem com prioridade máxima sobre o estado local,
 * preservando credenciais locais e garantindo compatibilidade e integridade das estruturas.
 */
export function applyCloudBackup(currentState, cloudData) {
  if (!cloudData || typeof cloudData !== 'object') {
    return currentState;
  }

  const safeCurrent = currentState || {};
  const safeCurrentSettings = safeCurrent.settings || {};
  const safeCloudSettings = (cloudData.settings && typeof cloudData.settings === 'object') ? cloudData.settings : {};

  // Preserva URL e Token locais se já configurados no dispositivo
  const preservedSheetsUrl = safeCurrentSettings.sheetsUrl || safeCloudSettings.sheetsUrl || "";
  const preservedSheetsToken = safeCurrentSettings.sheetsToken || safeCloudSettings.sheetsToken || "Maracaju88CasalSegredo2026!";

  const merged = {
    ...safeCurrent,
    ...cloudData,
    version: cloudData.version || safeCurrent.version,
    lastUpdated: cloudData.lastUpdated || new Date().toISOString(),
    activeUserId: safeCurrent.activeUserId || cloudData.activeUserId || "matheus",
    users: { ...(safeCurrent.users || {}), ...(cloudData.users || {}) },
    gamification: { ...(safeCurrent.gamification || {}), ...(cloudData.gamification || {}) },
    tasks: (() => {
      const cloudList = Array.isArray(cloudData.tasks) ? cloudData.tasks : [];
      const localList = Array.isArray(safeCurrent.tasks) ? safeCurrent.tasks : [];
      if (cloudList.length === 0) return localList;

      const sanitizeTask = (t) => {
        if (!t || typeof t !== 'object') return null;
        let freq = t.frequency || 'diaria';
        if (freq === 'dias_alternados') freq = 'diaria';
        return {
          id: t.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: t.title || 'Tarefa sem nome',
          room: t.room || 'cozinha',
          effort: t.effort || 'media',
          xp: t.xp || 20,
          assignedTo: t.assignedTo || 'ambos',
          frequency: freq,
          weekDays: Array.isArray(t.weekDays) ? t.weekDays : (t.frequency === 'dias_alternados' ? [1, 3, 5] : []),
          notes: t.notes || '',
          createdAt: t.createdAt || new Date().toISOString()
        };
      };

      const map = new Map();
      localList.forEach(item => {
        const clean = sanitizeTask(item);
        if (clean && clean.id) map.set(clean.id, clean);
      });
      cloudList.forEach(item => {
        const clean = sanitizeTask(item);
        if (clean && clean.id) {
          const existing = map.get(clean.id);
          if (existing && Array.isArray(existing.weekDays) && existing.weekDays.length > 0 && (!clean.weekDays || clean.weekDays.length === 0)) {
            clean.weekDays = existing.weekDays;
          }
          map.set(clean.id, clean);
        }
      });
      return Array.from(map.values());
    })(),
    history: (() => {
      const localHist = (safeCurrent.history && typeof safeCurrent.history === 'object') ? safeCurrent.history : {};
      const cloudHist = (cloudData.history && typeof cloudData.history === 'object') ? cloudData.history : {};
      const mergedHist = { ...localHist };
      for (const [dateKey, dayData] of Object.entries(cloudHist)) {
        if (typeof dayData === 'object' && dayData !== null) {
          mergedHist[dateKey] = { ...(mergedHist[dateKey] || {}), ...dayData };
        }
      }
      return mergedHist;
    })(),
    carro: (() => {
      const cloudList = Array.isArray(cloudData.carro) ? cloudData.carro : [];
      const localList = Array.isArray(safeCurrent.carro) ? safeCurrent.carro : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      return Array.from(map.values());
    })(),
    reformas: (() => {
      const cloudList = Array.isArray(cloudData.reformas) ? cloudData.reformas : [];
      const localList = Array.isArray(safeCurrent.reformas) ? safeCurrent.reformas : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      return Array.from(map.values());
    })(),
    sonhos: (() => {
      const cloudList = Array.isArray(cloudData.sonhos) ? cloudData.sonhos : [];
      const localList = Array.isArray(safeCurrent.sonhos) ? safeCurrent.sonhos : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      return Array.from(map.values());
    })(),
    compras: (() => {
      const cloudList = Array.isArray(cloudData.compras) ? cloudData.compras : [];
      const localList = Array.isArray(safeCurrent.compras) ? safeCurrent.compras : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      return Array.from(map.values());
    })(),
    comprasRegistros: (() => {
      const cloudList = Array.isArray(cloudData.comprasRegistros) ? cloudData.comprasRegistros : [];
      const localList = Array.isArray(safeCurrent.comprasRegistros) ? safeCurrent.comprasRegistros : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(p => { if (p && p.id) map.set(p.id, p); });
      cloudList.forEach(p => { if (p && p.id) map.set(p.id, p); });
      return Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    })(),
    catalog: (() => {
      const cloudList = Array.isArray(cloudData.catalog) ? cloudData.catalog : [];
      const localList = Array.isArray(safeCurrent.catalog) ? safeCurrent.catalog : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => {
        const key = item.id || item.code || item.rawName;
        if (key) map.set(key, item);
      });
      cloudList.forEach(item => {
        const key = item.id || item.code || item.rawName;
        if (key) {
          const existing = map.get(key);
          if (!existing) {
            map.set(key, item);
          } else {
            const mergedItem = { ...existing, ...item };
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!item.photos || item.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.alias && !item.alias) {
              mergedItem.alias = existing.alias;
            }
            map.set(key, mergedItem);
          }
        }
      });
      return Array.from(map.values());
    })(),
    categories: {
      tarefas: (cloudData.categories && Array.isArray(cloudData.categories.tarefas) && cloudData.categories.tarefas.length > 0)
        ? cloudData.categories.tarefas
        : ((safeCurrent.categories && safeCurrent.categories.tarefas) || []),
      carro: (cloudData.categories && Array.isArray(cloudData.categories.carro) && cloudData.categories.carro.length > 0)
        ? cloudData.categories.carro
        : ((safeCurrent.categories && safeCurrent.categories.carro) || []),
      reformas: (cloudData.categories && Array.isArray(cloudData.categories.reformas) && cloudData.categories.reformas.length > 0)
        ? cloudData.categories.reformas
        : ((safeCurrent.categories && safeCurrent.categories.reformas) || []),
      sonhos: (cloudData.categories && Array.isArray(cloudData.categories.sonhos) && cloudData.categories.sonhos.length > 0)
        ? cloudData.categories.sonhos
        : ((safeCurrent.categories && safeCurrent.categories.sonhos) || []),
      compras: (cloudData.categories && Array.isArray(cloudData.categories.compras) && cloudData.categories.compras.length > 0)
        ? cloudData.categories.compras
        : ((safeCurrent.categories && safeCurrent.categories.compras) || [])
    },
    userPasswords: {
      ...(safeCurrent.userPasswords || {}),
      ...(cloudData.userPasswords || {})
    },
    settings: {
      ...safeCurrentSettings,
      ...safeCloudSettings,
      sheetsUrl: preservedSheetsUrl,
      sheetsToken: preservedSheetsToken,
      autoSync: true,
      lastSyncTimestamp: new Date().toISOString()
    }
  };

  return merged;
}
