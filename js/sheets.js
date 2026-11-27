import { deduplicatePets, getPetAvatarUrl } from './pets.js';
import { mergeRotinaMatheusState, CATALOGO_PRODUTOS_ROTINA } from './rotina-matheus.js';
import { DEFAULT_ROOM_CATEGORIES } from './categories.js';
import { getMonthlyBenefitDetails, getCurrentBenefitCycleKey } from './benefits.js';
import {
  ensureDeletedIds,
  mergeDeletedIds,
  filterDeletedFromState,
  normalizePurchasesInState
} from './storage.js';

const DEFAULT_ROTINA_ARSENAL_KEYS = new Set(
  (Array.isArray(CATALOGO_PRODUTOS_ROTINA) ? CATALOGO_PRODUTOS_ROTINA : []).map(p => p && p.key).filter(Boolean)
);

function getRecordTimestamp(rec) {
  if (!rec || typeof rec !== 'object') return 0;
  const raw = rec.updatedAt || rec.boughtAt || rec.createdAt;
  if (!raw) return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const ts = Date.parse(String(raw));
  return Number.isFinite(ts) ? ts : 0;
}

function mergeRecordByTimestamp(baseItem, incomingItem) {
  const baseTs = getRecordTimestamp(baseItem);
  const incTs = getRecordTimestamp(incomingItem);
  if (baseTs > 0 && incTs > 0 && baseTs !== incTs) {
    return baseTs > incTs ? { ...incomingItem, ...baseItem } : { ...baseItem, ...incomingItem };
  }
  return { ...baseItem, ...incomingItem };
}
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

export async function backupToSheets(state, overrideUrl = null, overrideToken = null, timeoutMs = 15000, options = {}) {
  const url = overrideUrl || (state && state.settings && state.settings.sheetsUrl);
  const token = overrideToken !== null ? overrideToken : (state && state.settings && state.settings.sheetsToken);

  if (!url || !url.trim()) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  const stripBase64 = (val) => (typeof val === 'string' && val.startsWith('data:image/')) ? '' : val;
  const stripPhotosArr = (arr) => Array.isArray(arr) ? arr.filter(p => typeof p === 'string' && !p.startsWith('data:image/')) : undefined;

  let benefitsSummary = undefined;
  let matrixBenefits = undefined;
  try {
    const curCycleKey = getCurrentBenefitCycleKey(state);
    const curDetails = getMonthlyBenefitDetails(state, curCycleKey);
    benefitsSummary = {
      cycleKey: curDetails.cycleKey,
      vaTotal: curDetails.vaTotal,
      vaSpent: curDetails.vaSpent,
      vaBalance: curDetails.vaBalance,
      vrTotal: curDetails.vrTotal,
      vrSpent: curDetails.vrSpent,
      vrBalance: curDetails.vrBalance,
      updatedAt: new Date().toISOString()
    };
    // Contrato explícito para o Matrix: ele NÃO recalcula VA/VR por dias úteis;
    // consome exatamente este retrato do ciclo vigente (regra de ouro do ecossistema).
    matrixBenefits = {
      origem: 'Maracaju 88',
      cycleKey: curDetails.cycleKey,
      cycleLabel: curDetails.cycleLabel,
      cycleRange: curDetails.cycleRange,
      creditDate: curDetails.creditDateFormatted,
      vaTotal: curDetails.vaTotal,
      vaSpent: curDetails.vaSpent,
      vaBalance: curDetails.vaBalance,
      vrTotal: curDetails.vrTotal,
      vrSpent: curDetails.vrSpent,
      vrBalance: curDetails.vrBalance,
      totalBenefit: curDetails.totalBenefit,
      totalFoodSpent: curDetails.totalFoodSpent,
      totalFoodBalance: curDetails.totalFoodBalance,
      updatedAt: new Date().toISOString()
    };
  } catch (e) {}

  const compactData = {
    version: state.version,
    lastUpdated: new Date().toISOString(),
    activeUserId: state.activeUserId,
    deletedIds: ensureDeletedIds(state),
    users: state.users,
    gamification: state.gamification,
    tasks: state.tasks || [],
    history: state.history || {},
    carro: (state.carro || []).map(c => ({
      ...c,
      photoUrl: stripBase64(c.photoUrl),
      photos: stripPhotosArr(c.photos)
    })),
    reformas: (state.reformas || []).map(r => ({
      ...r,
      photoUrl: stripBase64(r.photoUrl),
      photos: stripPhotosArr(r.photos)
    })),
    sonhos: (state.sonhos || []).map(s => ({
      ...s,
      imageUrl: stripBase64(s.imageUrl),
      photoUrl: stripBase64(s.photoUrl),
      photos: stripPhotosArr(s.photos)
    })),
    shoppingWishlist: (state.shoppingWishlist || []).map(s => ({
      ...s,
      photoUrl: stripBase64(s.photoUrl),
      photos: stripPhotosArr(s.photos)
    })),
    compras: (state.compras || []).map(c => ({
      ...c,
      imageUrl: stripBase64(c.imageUrl),
      photos: stripPhotosArr(c.photos)
    })),
    comprasRegistros: (state.comprasRegistros || []).map(r => ({
      ...r,
      photos: stripPhotosArr(r.photos),
      items: Array.isArray(r.items) ? r.items.map(it => ({
        ...it,
        photos: stripPhotosArr(it.photos)
      })) : []
    })),
    deletedPetIds: Array.isArray(state.deletedPetIds) ? state.deletedPetIds : [],
    pets: (state.pets || []).map(p => ({
      ...p,
      photoUrl: stripBase64(p.photoUrl),
      foto: stripBase64(p.foto),
      photo: stripBase64(p.photo),
      photos: stripPhotosArr(p.photos),
      fotos: stripPhotosArr(p.fotos),
      exames: Array.isArray(p.exames) ? p.exames.map(ex => ({
        ...ex,
        fotos: stripPhotosArr(ex.fotos),
        photos: stripPhotosArr(ex.photos)
      })) : undefined
    })),
    catalog: (state.catalog || []).map(it => ({
      ...it,
      photos: stripPhotosArr(it.photos)
    })),
    nutrition: (() => {
      const n = (state.nutrition && typeof state.nutrition === 'object') ? state.nutrition : {};
      const compactPerson = (p) => {
        if (!p || typeof p !== 'object') return undefined;
        return {
          ...p,
          photo: stripBase64(p.photo),
          rawText: typeof p.rawText === 'string' ? p.rawText.slice(0, 3500) : ''
        };
      };
      return {
        matheus: compactPerson(n.matheus),
        scarlet: compactPerson(n.scarlet)
      };
    })(),
    categories: state.categories || {},
    rotinaMatheus: state.rotinaMatheus ? {
      dias: state.rotinaMatheus.dias || {},
      ds: state.rotinaMatheus.ds || {},
      dsUpdatedAt: state.rotinaMatheus.dsUpdatedAt || {},
      subtab: 'hoje',
      updatedAt: state.rotinaMatheus.updatedAt || new Date().toISOString(),
      ocrMap: state.rotinaMatheus.ocrMap || {},
      autoRotinaFotos: state.rotinaMatheus.autoRotinaFotos !== false,
      // Envia apenas produtos customizados detectados via OCR (os 26 padrão já estão no código)
      arsenal: Array.isArray(state.rotinaMatheus.arsenal)
        ? state.rotinaMatheus.arsenal.filter(p => p && p.key && !DEFAULT_ROTINA_ARSENAL_KEYS.has(p.key))
        : []
    } : undefined,
    userPasswords: state.userPasswords || {},
    settings: {
      benefits: (state.settings && state.settings.benefits) ? state.settings.benefits : undefined,
      benefitsSummary,
      matrixBenefits
    }
  };

  // O Apps Script grava Backup_JSON fatiado em múltiplas colunas de 45.000 caracteres cada.
  // Só enxugamos campos secundários caso o payload passe de 88.000 caracteres (ou se forçado).
  const maxChars = (options && options.maxPayloadChars) || 88000;
  const buildPayload = (data) => ({
    action: "backup",
    token: token ? token.trim() : "",
    data
  });
  let payload = buildPayload(compactData);
  let payloadStr = JSON.stringify(payload);

  // Passo 1: enxuga catálogo transitório e texto bruto da nutrição
  if (payloadStr.length > maxChars) {
    compactData.catalog = [];
    if (compactData.nutrition) {
      if (compactData.nutrition.matheus) compactData.nutrition.matheus.rawText = '';
      if (compactData.nutrition.scarlet) compactData.nutrition.scarlet.rawText = '';
    }
    payload = buildPayload(compactData);
    payloadStr = JSON.stringify(payload);
  }

  // Passo 2: compacta campos redundantes em comprasRegistros mantendo nfeKey e lista de itens
  if (payloadStr.length > maxChars) {
    compactData.comprasRegistros = (compactData.comprasRegistros || []).map(r => ({
      id: r.id,
      marketName: r.marketName || r.establishment || r.estabelecimento || '',
      date: r.date,
      time: r.time || undefined,
      monthKey: r.monthKey,
      total: r.total,
      paymentMethod: r.paymentMethod || 'va',
      nfeKey: r.nfeKey || r.accessKey || undefined,
      notes: r.notes || '',
      items: Array.isArray(r.items) ? r.items.map(it => ({
        alias: it.alias || it.rawName || it.name || 'Produto',
        qty: it.qty !== undefined ? it.qty : (it.quantity !== undefined ? it.quantity : 1),
        unit: it.unit || 'un',
        unitPrice: it.unitPrice !== undefined ? it.unitPrice : (it.price || 0),
        totalPrice: it.totalPrice !== undefined ? it.totalPrice : (it.price || it.unitPrice || 0)
      })) : [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    payload = buildPayload(compactData);
    payloadStr = JSON.stringify(payload);
  }

  // Passo 3: limita histórico antigo de tarefas (> 45 dias) para priorizar itens de notas fiscais
  if (payloadStr.length > maxChars && compactData.history && typeof compactData.history === 'object') {
    const recentDates = Object.keys(compactData.history).sort().slice(-45);
    const trimmedHistory = {};
    recentDates.forEach(d => { trimmedHistory[d] = compactData.history[d]; });
    compactData.history = trimmedHistory;
    payload = buildPayload(compactData);
    payloadStr = JSON.stringify(payload);
  }

  // Passo 4 (último recurso): mantém itens nas 30 compras mais recentes e enxuga apenas as mais antigas
  if (payloadStr.length > maxChars) {
    compactData.comprasRegistros = (compactData.comprasRegistros || []).map((r, idx) => (
      idx < 30 ? r : { ...r, items: [] }
    ));
    payload = buildPayload(compactData);
    payloadStr = JSON.stringify(payload);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Usamos text/plain para evitar bloqueios de CORS pré-flight (OPTIONS) no Apps Script
    const fetchOpts = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: payloadStr,
      signal: controller.signal
    };
    if (options && options.keepalive && payloadStr.length < 60000) {
      fetchOpts.keepalive = true;
    }
    const response = await fetch(url.trim(), fetchOpts);

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

  // Exclusões são definitivas: a união das listas não pode ressuscitar
  // item/tarefa/compra apagada no outro aparelho.
  const mergedDeletedIds = mergeDeletedIds(safeCurrent.deletedIds, cloudData.deletedIds);

  const merged = {
    ...safeCurrent,
    ...cloudData,
    deletedIds: mergedDeletedIds,
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
          createdAt: t.createdAt || new Date().toISOString(),
          ...(t.updatedAt ? { updatedAt: t.updatedAt } : {})
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
          if (!existing) {
            map.set(clean.id, clean);
          } else {
            const mergedTask = mergeRecordByTimestamp(existing, clean);
            if (Array.isArray(existing.weekDays) && existing.weekDays.length > 0 && (!mergedTask.weekDays || mergedTask.weekDays.length === 0)) {
              mergedTask.weekDays = existing.weekDays;
            }
            map.set(clean.id, mergedTask);
          }
        }
      });
      return Array.from(map.values());
    })(),
    history: (() => {
      const localHist = (safeCurrent.history && typeof safeCurrent.history === 'object') ? safeCurrent.history : {};
      const cloudHist = (cloudData.history && typeof cloudData.history === 'object') ? cloudData.history : {};
      const mergedHist = {};
      const allDates = new Set([...Object.keys(localHist), ...Object.keys(cloudHist)]);
      allDates.forEach(dateKey => {
        const lDay = (localHist[dateKey] && typeof localHist[dateKey] === 'object') ? localHist[dateKey] : {};
        const cDay = (cloudHist[dateKey] && typeof cloudHist[dateKey] === 'object') ? cloudHist[dateKey] : {};
        const dayOut = {};
        const allTaskIds = new Set([...Object.keys(lDay), ...Object.keys(cDay)]);
        allTaskIds.forEach(tId => {
          const lEntry = lDay[tId];
          const cEntry = cDay[tId];
          if (lEntry && !cEntry) {
            dayOut[tId] = lEntry;
          } else if (cEntry && !lEntry) {
            dayOut[tId] = cEntry;
          } else if (lEntry && cEntry) {
            const lTs = getRecordTimestamp(lEntry);
            const cTs = getRecordTimestamp(cEntry);
            if (lTs > 0 || cTs > 0) {
              dayOut[tId] = lTs > cTs ? lEntry : cEntry;
            } else {
              dayOut[tId] = { ...lEntry, ...cEntry };
            }
          }
        });
        if (Object.keys(dayOut).length > 0) {
          mergedHist[dateKey] = dayOut;
        }
      });
      return mergedHist;
    })(),
    carro: (() => {
      const cloudList = Array.isArray(cloudData.carro) ? cloudData.carro : [];
      const localList = Array.isArray(safeCurrent.carro) ? safeCurrent.carro : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => {
        if (item && item.id) {
          const existing = map.get(item.id);
          if (!existing) {
            map.set(item.id, item);
          } else {
            const mergedItem = mergeRecordByTimestamp(existing, item);
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.photoUrl && !mergedItem.photoUrl) {
              mergedItem.photoUrl = existing.photoUrl;
            }
            map.set(item.id, mergedItem);
          }
        }
      });
      return Array.from(map.values());
    })(),
    reformas: (() => {
      const cloudList = Array.isArray(cloudData.reformas) ? cloudData.reformas : [];
      const localList = Array.isArray(safeCurrent.reformas) ? safeCurrent.reformas : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => {
        if (item && item.id) {
          const existing = map.get(item.id);
          if (!existing) {
            map.set(item.id, item);
          } else {
            const mergedItem = mergeRecordByTimestamp(existing, item);
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.photoUrl && !mergedItem.photoUrl) {
              mergedItem.photoUrl = existing.photoUrl;
            }
            map.set(item.id, mergedItem);
          }
        }
      });
      return Array.from(map.values());
    })(),
    sonhos: (() => {
      const cloudList = Array.isArray(cloudData.sonhos) ? cloudData.sonhos : [];
      const localList = Array.isArray(safeCurrent.sonhos) ? safeCurrent.sonhos : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => {
        if (item && item.id) {
          const existing = map.get(item.id);
          if (!existing) {
            map.set(item.id, item);
          } else {
            const mergedItem = mergeRecordByTimestamp(existing, item);
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.photoUrl && !mergedItem.photoUrl) {
              mergedItem.photoUrl = existing.photoUrl;
            }
            if (existing.imageUrl && !mergedItem.imageUrl) {
              mergedItem.imageUrl = existing.imageUrl;
            }
            map.set(item.id, mergedItem);
          }
        }
      });
      return Array.from(map.values());
    })(),
    shoppingWishlist: (() => {
      const cloudList = Array.isArray(cloudData.shoppingWishlist) ? cloudData.shoppingWishlist : [];
      const localList = Array.isArray(safeCurrent.shoppingWishlist) ? safeCurrent.shoppingWishlist : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => {
        if (item && item.id) {
          const existing = map.get(item.id);
          if (!existing) {
            map.set(item.id, item);
          } else {
            const mergedItem = mergeRecordByTimestamp(existing, item);
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.photoUrl && !mergedItem.photoUrl) {
              mergedItem.photoUrl = existing.photoUrl;
            }
            map.set(item.id, mergedItem);
          }
        }
      });
      return Array.from(map.values());
    })(),
    compras: (() => {
      const cloudList = Array.isArray(cloudData.compras) ? cloudData.compras : [];
      const localList = Array.isArray(safeCurrent.compras) ? safeCurrent.compras : [];
      if (cloudList.length === 0) return localList;
      if (localList.length === 0) return cloudList;
      const map = new Map();
      localList.forEach(item => { if (item && item.id) map.set(item.id, item); });
      cloudList.forEach(item => {
        if (item && item.id) {
          const existing = map.get(item.id);
          if (!existing) {
            map.set(item.id, item);
          } else {
            const mergedItem = mergeRecordByTimestamp(existing, item);
            // PRESERVAÇÃO DE FOTOS LOCAIS DO ITEM DE MERCADO
            if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = existing.photos;
            }
            if (existing.imageUrl && !mergedItem.imageUrl) {
              mergedItem.imageUrl = existing.imageUrl;
            }
            map.set(item.id, mergedItem);
          }
        }
      });
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
      // 2. Mescla registros locais (comparando updatedAt para que edições mais recentes feitas em outro aparelho vençam)
      localList.forEach(localItem => {
        if (localItem && localItem.id) {
          const cloudItem = map.get(localItem.id);
          if (!cloudItem) {
            map.set(localItem.id, localItem);
          } else {
            const localTs = getRecordTimestamp(localItem);
            const cloudTs = getRecordTimestamp(cloudItem);
            const cloudIsNewer = cloudTs > 0 && cloudTs > localTs;
            const primary = cloudIsNewer ? cloudItem : localItem;
            const secondary = cloudIsNewer ? localItem : cloudItem;

            const primaryItems = Array.isArray(primary.items) && primary.items.length > 0
              ? primary.items
              : (Array.isArray(secondary.items) ? secondary.items : []);
            const secondaryItems = Array.isArray(secondary.items) ? secondary.items : [];

            const mergedItems = primaryItems.map((it, idx) => {
              const secIt = secondaryItems[idx] || {};
              const itMerged = { ...secIt, ...it };
              if (Array.isArray(secIt.photos) && secIt.photos.length > 0 && (!itMerged.photos || itMerged.photos.length === 0)) {
                itMerged.photos = secIt.photos;
              }
              return itMerged;
            });

            const mergedItem = {
              ...secondary,
              ...primary,
              items: mergedItems,
              paymentMethod: primary.paymentMethod || secondary.paymentMethod || 'va',
              total: (primary.total !== undefined && primary.total !== null) ? primary.total : secondary.total,
              notes: primary.notes !== undefined ? primary.notes : (secondary.notes || ''),
              date: primary.date || secondary.date
            };

            // Preserva fotos do cupom fiscal / comprovante se a nuvem veio sem fotos
            if (Array.isArray(localItem.photos) && localItem.photos.length > 0 && (!mergedItem.photos || mergedItem.photos.length === 0)) {
              mergedItem.photos = localItem.photos;
            }

            map.set(localItem.id, mergedItem);
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
    deletedPetIds: (() => {
      const local = Array.isArray(safeCurrent.deletedPetIds) ? safeCurrent.deletedPetIds : [];
      const cloud = Array.isArray(cloudData.deletedPetIds) ? cloudData.deletedPetIds : [];
      return Array.from(new Set([...local, ...cloud]));
    })(),
    pets: (() => {
      const cloudList = Array.isArray(cloudData.pets) ? cloudData.pets : [];
      const localList = Array.isArray(safeCurrent.pets) ? safeCurrent.pets : [];
      const deletedIds = new Set([
        ...(Array.isArray(safeCurrent.deletedPetIds) ? safeCurrent.deletedPetIds : []),
        ...(Array.isArray(cloudData.deletedPetIds) ? cloudData.deletedPetIds : [])
      ]);

      if (cloudList.length === 0 && localList.length === 0) return [];
      const map = new Map();
      localList.forEach(p => {
        if (p && p.id && !deletedIds.has(p.id)) {
          map.set(p.id, p);
        }
      });

      cloudList.forEach(cloudP => {
        if (!cloudP || !cloudP.id || deletedIds.has(cloudP.id)) return;
        const existing = map.get(cloudP.id);
        if (!existing) {
          // Pet com mesmo nome/espécie mas id diferente (duplicata antiga da nuvem)
          // é adicionado ao mapa e o deduplicatePets() no fim deste bloco mescla os
          // sub-registros no pet principal + registra o id em deletedPetIds.
          // Antes ele era descartado aqui, perdendo ração/vacinas/exames da duplicata.
          map.set(cloudP.id, cloudP);
        } else {
          const mergedPet = { ...existing, ...cloudP };
          // Preserva fotos do perfil do pet
          if (existing.foto && !cloudP.foto) mergedPet.foto = existing.foto;
          if (existing.photo && !cloudP.photo) mergedPet.photo = existing.photo;
          if (existing.photoUrl && !cloudP.photoUrl) mergedPet.photoUrl = existing.photoUrl;
          if (Array.isArray(existing.photos) && existing.photos.length > 0 && (!cloudP.photos || cloudP.photos.length === 0)) {
            mergedPet.photos = existing.photos;
          }
          if (Array.isArray(existing.fotos) && existing.fotos.length > 0 && (!cloudP.fotos || cloudP.fotos.length === 0)) {
            mergedPet.fotos = existing.fotos;
          }
          const avatar = getPetAvatarUrl(existing) || getPetAvatarUrl(cloudP);
          if (avatar && !mergedPet.foto && (!mergedPet.fotos || mergedPet.fotos.length === 0)) {
            mergedPet.foto = avatar;
            mergedPet.photo = avatar;
            mergedPet.photoUrl = avatar;
            mergedPet.fotos = [avatar];
            if (!mergedPet.photos || mergedPet.photos.length === 0) mergedPet.photos = [avatar];
          }
          // Mescla sub-registros por id (e não por índice): quando um exame/item era
          // excluído ou reordenado, o merge por posição cruzava os dados de dois
          // registros diferentes. Fallback para índice mantém compatibilidade com
          // registros antigos sem id.
          const mergeSubRecord = (localRec, cloudArr, idx) => {
            const cloudRec = (localRec && localRec.id
              ? cloudArr.find(c => c && c.id === localRec.id)
              : null) || cloudArr[idx] || {};
            const merged = { ...cloudRec, ...localRec };
            if (localRec && localRec.foto && !cloudRec.foto) merged.foto = localRec.foto;
            if (localRec && Array.isArray(localRec.fotos) && localRec.fotos.length > 0 &&
                (!cloudRec.fotos || cloudRec.fotos.length === 0)) {
              merged.fotos = localRec.fotos;
            }
            return merged;
          };

          if (Array.isArray(existing.exames)) {
            const cloudExames = Array.isArray(cloudP.exames) ? cloudP.exames : [];
            mergedPet.exames = existing.exames.map((ex, idx) => mergeSubRecord(ex, cloudExames, idx));
          }
          if (Array.isArray(existing.itens)) {
            const cloudItens = Array.isArray(cloudP.itens) ? cloudP.itens : [];
            mergedPet.itens = existing.itens.map((it, idx) => mergeSubRecord(it, cloudItens, idx));
          }
          map.set(cloudP.id, mergedPet);
        }
      });

      const mergedList = Array.from(map.values()).filter(p => !deletedIds.has(p.id));
      const dummyState = { pets: mergedList, deletedPetIds: Array.from(deletedIds) };
      deduplicatePets(dummyState);
      return dummyState.pets;
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
    rotinaMatheus: mergeRotinaMatheusState(
      safeCurrent.rotinaMatheus,
      cloudData.rotinaMatheus ? { ...cloudData.rotinaMatheus, _isCloudSnapshot: true } : undefined
    ),
    nutrition: (() => {
      const localN = (safeCurrent.nutrition && typeof safeCurrent.nutrition === 'object') ? safeCurrent.nutrition : {};
      const cloudN = (cloudData.nutrition && typeof cloudData.nutrition === 'object') ? cloudData.nutrition : {};
      const pickPerson = (key) => {
        const l = localN[key];
        const c = cloudN[key];
        if (!l && !c) return undefined;
        if (!l) return c;
        if (!c) return l;
        const lTs = l.updatedAt ? Date.parse(l.updatedAt) : 0;
        const cTs = c.updatedAt ? Date.parse(c.updatedAt) : 0;
        const winner = cTs > lTs ? { ...c } : { ...l };
        if (!winner.reset && !winner.photo && l.photo) {
          winner.photo = l.photo;
        }
        return winner;
      };
      return {
        matheus: pickPerson('matheus'),
        scarlet: pickPerson('scarlet')
      };
    })(),
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
      // Preserva a preferência do aparelho: um pull da nuvem não pode religar
      // a sincronização automática que o usuário desligou nos Ajustes.
      autoSync: safeCurrentSettings.autoSync !== undefined
        ? safeCurrentSettings.autoSync
        : (safeCloudSettings.autoSync !== undefined ? safeCloudSettings.autoSync : true),
      lastSyncTimestamp: new Date().toISOString()
    }
  };

  // Normaliza valores (a planilha costuma devolver "264,33" como texto) e
  // aplica os túmulos por último, para nada apagado voltar no merge.
  normalizePurchasesInState(merged);
  filterDeletedFromState(merged);

  return merged;
}


/**
 * Mescla a nuvem no estado local dando PRIORIDADE AO APARELHO.
 * Usado quando há alterações locais ainda não enviadas (push pendente) e logo
 * antes de cada envio: assim um snapshot antigo da planilha (gravado pelo outro
 * aparelho) não reverte edições locais, e os lançamentos novos do outro aparelho
 * entram por união antes de regravarmos a planilha.
 */
export function mergeCloudWithLocalPriority(localState, cloudData) {
  if (!cloudData || typeof cloudData !== 'object') return localState;
  const local = localState || {};
  const taggedCloud = cloudData.rotinaMatheus
    ? { ...cloudData, rotinaMatheus: { ...cloudData.rotinaMatheus, _isCloudSnapshot: true } }
    : cloudData;
  // Direção normal (nuvem vence) só para o que já é "local vence" por desenho:
  // compras/notas, ajustes do aparelho e benefícios.
  const normal = applyCloudBackup(local, taggedCloud);
  // Direção invertida: o aparelho vence nos conflitos das demais coleções.
  const swapped = applyCloudBackup(taggedCloud, local);
  const preservedSubtab = (local.rotinaMatheus && local.rotinaMatheus.subtab) || 'hoje';
  const merged = {
    ...swapped,
    activeUserId: normal.activeUserId,
    comprasRegistros: normal.comprasRegistros,
    rotinaMatheus: mergeRotinaMatheusState(local.rotinaMatheus, taggedCloud.rotinaMatheus),
    settings: { ...normal.settings, lastCloudUpdatedAt: (local.settings || {}).lastCloudUpdatedAt }
  };
  if (merged.rotinaMatheus) {
    merged.rotinaMatheus.subtab = preservedSubtab;
  }
  normalizePurchasesInState(merged);
  filterDeletedFromState(merged);
  return merged;
}

/**
 * Busca o HTML de uma NFC-e via backend do Google Apps Script (contorna restrições de CORS).
 * Metodo POST evita o limite de tamanho da query string (a URL do QR Code carrega
 * a chave + hash e pode ser longa). Retorna o HTML ou lança erro explicativo.
 */
export async function fetchNfceHtmlViaAppsScript(url, token, nfceUrl, timeoutMs = 15000, method = 'GET') {
  if (!url || !url.trim() || !nfceUrl) {
    throw new Error("URL do Google Apps Script ou link da NFC-e não fornecido.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // O QR Code da NFC-e carrega "|" no parâmetro p (chave|versao|...). O
  // UrlFetchApp recusa a URL com pipe cru ("Argumento inválido"), então
  // enviamos já percent-encoded (%7C). O Apps Script também normaliza.
  const safeNfceUrl = String(nfceUrl).replace(/\|/g, '%7C').replace(/ /g, '%20');

  try {
    let res;
    if (String(method).toUpperCase() === 'POST') {
      res = await fetch(url.trim(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8", "Accept": "application/json" },
        body: JSON.stringify({ action: "fetchNfce", url: safeNfceUrl, token: token ? token.trim() : "" }),
        signal: controller.signal
      });
    } else {
      const endpoint = new URL(url.trim());
      endpoint.searchParams.set("action", "fetchNfce");
      endpoint.searchParams.set("url", safeNfceUrl);
      if (token) endpoint.searchParams.set("token", token.trim());
      res = await fetch(endpoint.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" },
        signal: controller.signal
      });
    }
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Erro na conexão HTTP: ${res.status} ${res.statusText}`);
    }

    let json = null;
    try {
      json = await res.json();
    } catch (parseErr) {
      throw new Error("O backend respondeu algo que não é JSON. Atualize o Apps Script.");
    }

    if (json && json.status === "success" && typeof json.html === "string" && json.html.trim()) {
      return json.html;
    }
    if (json && json.data) {
      // Backend antigo (sem a ação fetchNfce): devolveu o backup no lugar do HTML.
      const err = new Error("O Apps Script publicado ainda não tem a ação fetchNfce. Republique o apps_script.gs.");
      err.code = 'BRIDGE_OUTDATED';
      throw err;
    }
    const errMsg = (json && json.message) || "Falha ao obter HTML da NFC-e via Apps Script.";
    const err = new Error(errMsg);
    throw err;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error("Tempo limite excedido ao consultar a SEFAZ pelo Apps Script.");
    }
    throw err;
  }
}
