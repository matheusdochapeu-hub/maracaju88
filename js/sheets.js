// ============================================================
//  MARACAJU - GOOGLE SHEETS SYNC & BACKUP CLIENT
// ============================================================

export async function testSheetsConnection(url, token) {
  if (!url || !url.trim()) {
    throw new Error("Por favor, informe a URL do Google Apps Script.");
  }

  const endpoint = new URL(url.trim());
  endpoint.searchParams.set("action", "ping");
  if (token) {
    endpoint.searchParams.set("token", token.trim());
  }

  const res = await fetch(endpoint.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Erro na conexão HTTP: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Falha ao validar token do Google Sheets.");
  }

  return json;
}

export async function backupToSheets(state) {
  const url = state.settings.sheetsUrl;
  const token = state.settings.sheetsToken;

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
      categories: state.categories || {},
      userPasswords: state.userPasswords || {}
    }
  };

  // Usamos text/plain para evitar bloqueios de CORS pré-flight (OPTIONS) no Apps Script
  const response = await fetch(url.trim(), {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

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

  state.settings.lastSyncTimestamp = new Date().toISOString();
  return result;
}

export async function restoreFromSheets(state) {
  const url = state.settings.sheetsUrl;
  const token = state.settings.sheetsToken;

  if (!url || !url.trim()) {
    throw new Error("URL do Google Apps Script não configurada.");
  }

  const endpoint = new URL(url.trim());
  endpoint.searchParams.set("action", "restore");
  if (token) {
    endpoint.searchParams.set("token", token.trim());
  }

  const res = await fetch(endpoint.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  if (!res.ok) {
    throw new Error(`Erro ao conectar: ${res.status}`);
  }

  const json = await res.json();
  if (json.status !== "success" || !json.data) {
    throw new Error(json.message || "Nenhum dado encontrado para restaurar.");
  }

  return json.data;
}

/**
 * Aplica os dados do backup na nuvem com prioridade máxima sobre o estado local,
 * preservando credenciais locais e garantindo compatibilidade de estruturas.
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
    tasks: Array.isArray(cloudData.tasks) ? cloudData.tasks : (safeCurrent.tasks || []),
    history: (cloudData.history && typeof cloudData.history === 'object') ? cloudData.history : (safeCurrent.history || {}),
    carro: Array.isArray(cloudData.carro) ? cloudData.carro : (safeCurrent.carro || []),
    reformas: Array.isArray(cloudData.reformas) ? cloudData.reformas : (safeCurrent.reformas || []),
    sonhos: Array.isArray(cloudData.sonhos) ? cloudData.sonhos : (safeCurrent.sonhos || []),
    compras: Array.isArray(cloudData.compras) ? cloudData.compras : (safeCurrent.compras || []),
    comprasRegistros: Array.isArray(cloudData.comprasRegistros) ? cloudData.comprasRegistros : (safeCurrent.comprasRegistros || []),
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
      autoSync: true, // Prioridade da planilha: auto-sync sempre ativo quando há URL
      lastSyncTimestamp: new Date().toISOString()
    }
  };

  return merged;
}
