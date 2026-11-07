import { DEFAULT_ROOM_CATEGORIES } from './categories.js';
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
      pets: state.pets || [],
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
      // 1. Carrega registros vindos da nuvem
      cloudList.forEach(p => { if (p && p.id) map.set(p.id, p); });
      // 2. Mescla registros locais (preservando lançamentos novos e edições recentes de pagamento/totais)
      localList.forEach(localItem => {
        if (localItem && localItem.id) {
          const cloudItem = map.get(localItem.id);
          if (!cloudItem) {
            map.set(localItem.id, localItem);
          } else {
            map.set(localItem.id, {
              ...cloudItem,
              ...localItem,
              paymentMethod: localItem.paymentMethod || cloudItem.paymentMethod || 'va',
              total: (localItem.total !== undefined && localItem.total !== null) ? localItem.total : cloudItem.total,
              notes: localItem.notes || cloudItem.notes || '',
              date: localItem.date || cloudItem.date
            });
          }
        }
      });
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
    pets: (() => {
      const cloudList = Array.isArray(cloudData.pets) ? cloudData.pets : [];
      const localList = Array.isArray(safeCurrent.pets) ? safeCurrent.pets : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      cloudList.forEach(p => { if (p && p.id) map.set(p.id, p); });
      localList.forEach(p => {
        if (p && p.id) {
          const cloudP = map.get(p.id);
          map.set(p.id, { ...(cloudP || {}), ...p });
        }
      });
      return Array.from(map.values());
    })(),
    categories: (() => {
      const mergedCats = {};
      const allModules = ['tarefas', 'carro', 'reformas', 'sonhos', 'compras'];
      const legacyRoomIds = new Set(['quartos', 'banheiros', 'cuidados', 'varanda', 'geral']);

      allModules.forEach(mod => {
        const isRoomModule = (mod === 'tarefas' || mod === 'reformas');
        const localList = (safeCurrent.categories && Array.isArray(safeCurrent.categories[mod])) ? safeCurrent.categories[mod] : [];
        const cloudList = (cloudData.categories && Array.isArray(cloudData.categories[mod])) ? cloudData.categories[mod] : [];

        const map = new Map();

        // Se for módulo de cômodos (tarefas/reformas), inicia com os 11 cômodos padrão
        if (isRoomModule) {
          DEFAULT_ROOM_CATEGORIES.forEach(c => map.set(c.id, { ...c }));
        }

        // Adiciona categorias da nuvem (filtrando IDs legados obsoletos)
        cloudList.forEach(c => {
          if (c && c.id) {
            if (isRoomModule && legacyRoomIds.has(c.id)) return;
            map.set(c.id, c);
          }
        });

        // Adiciona categorias locais (prioridade para personalizações recentes)
        localList.forEach(c => {
          if (c && c.id) {
            if (isRoomModule && legacyRoomIds.has(c.id)) return;
            map.set(c.id, c);
          }
        });

        mergedCats[mod] = Array.from(map.values());
      });

      return mergedCats;
    })(),
    userPasswords: {
      ...(safeCurrent.userPasswords || {}),
      ...(cloudData.userPasswords || {})
    },
    settings: {
      ...safeCurrentSettings,
      ...safeCloudSettings,
      benefits: {
        ...(safeCloudSettings.benefits || {}),
        ...(safeCurrentSettings.benefits || {}),
        monthlyDays: {
          ...((safeCloudSettings.benefits && safeCloudSettings.benefits.monthlyDays) || {}),
          ...((safeCurrentSettings.benefits && safeCurrentSettings.benefits.monthlyDays) || {})
        },
        monthlyCreditDates: {
          ...((safeCloudSettings.benefits && safeCloudSettings.benefits.monthlyCreditDates) || {}),
          ...((safeCurrentSettings.benefits && safeCurrentSettings.benefits.monthlyCreditDates) || {})
        },
        monthlyEndingBalances: {
          ...((safeCloudSettings.benefits && safeCloudSettings.benefits.monthlyEndingBalances) || {}),
          ...((safeCurrentSettings.benefits && safeCurrentSettings.benefits.monthlyEndingBalances) || {})
        },
        monthlyRolloverOverrides: {
          ...((safeCloudSettings.benefits && safeCloudSettings.benefits.monthlyRolloverOverrides) || {}),
          ...((safeCurrentSettings.benefits && safeCurrentSettings.benefits.monthlyRolloverOverrides) || {})
        }
      },
      sheetsUrl: preservedSheetsUrl,
      sheetsToken: preservedSheetsToken,
      autoSync: true,
      lastSyncTimestamp: new Date().toISOString()
    }
  };

  return merged;
}


/**
 * Busca o HTML de uma NFC-e via backend do Google Apps Script (contorna restrições de CORS)
 */
export async function fetchNfceHtmlViaAppsScript(url, token, nfceUrl, timeoutMs = 15000) {
  if (!url || !url.trim() || !nfceUrl) {
    throw new Error("URL do Google Apps Script ou link da NFC-e não fornecido.");
  }

  const endpoint = new URL(url.trim());
  endpoint.searchParams.set("action", "fetchNfce");
  endpoint.searchParams.set("url", nfceUrl);
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
    if (json.status !== "success" || !json.html) {
      throw new Error(json.message || "Falha ao obter HTML da NFC-e via Apps Script.");
    }

    return json.html;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
