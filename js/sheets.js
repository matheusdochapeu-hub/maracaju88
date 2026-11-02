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
      tasks: state.tasks,
      history: state.history,
      carro: state.carro || [],
      reformas: state.reformas,
      sonhos: state.sonhos
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
    // Caso o Apps Script responda redirect ou texto
    result = { status: "success", message: "Backup enviado para processamento." };
  }

  if (result.status === "error") {
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
