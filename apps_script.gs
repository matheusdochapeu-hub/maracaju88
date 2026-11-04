// ============================================================
//  MARACAJU 88 - GOOGLE APPS SCRIPT BACKUP & SYNC (v1.1.0)
//  Vincule este script à sua planilha pessoal do Google Sheets
// ============================================================
//
//  INSTRUÇÕES DE INSTALAÇÃO (Passo a Passo):
//  1. Crie uma nova planilha no Google Sheets (ex: "Maracaju 88 - Dados")
//  2. No menu superior, clique em: Extensões > Apps Script
//  3. Apague todo o código existente no editor e cole este script completo
//  4. Altere a constante SHARED_SECRET abaixo (ou defina uma senha segura)
//  5. Salve o projeto (Ctrl + S)
//  6. Clique no botão azul "Implantar" (canto superior direito) > "Nova implantação"
//  7. Em "Selecionar tipo", clique no ícone de engrenagem > "App da Web"
//  8. Preencha:
//     - Descrição: "Maracaju 88 Web API"
//     - Executar como: "Eu (seu e-mail)"
//     - Quem pode acessar: "Qualquer pessoa" (necessário para a PWA enviar dados)
//  9. Clique em "Implantar" e conceda as permissões de acesso do Google
//  10. Copie a "URL do App da Web" gerada (termina com /exec)
//  11. Abra o app Maracaju 88 > Aba "Ajustes & Backup" > Cole a URL e o Segredo
//
//  ATUALIZAÇÃO DE CÓDIGO FUTURA:
//  Caso altere este código: "Implantar" > "Gerenciar implantações" > Editar (lápis)
//  > Versão: "Nova versão" > Salvar/Implantar (a URL permanece a mesma).
// ============================================================

var SHARED_SECRET = "Maracaju88CasalSegredo2026!"; // Altere para sua senha preferida

function getSecretToken() {
  try {
    var prop = PropertiesService.getScriptProperties().getProperty("MARACAJU88_TOKEN");
    if (prop) return prop;
  } catch(e) {}
  return SHARED_SECRET;
}

function isAuthorized(e) {
  var secret = getSecretToken();
  if (!secret) return true;
  var token = (e && e.parameter && e.parameter.token) || "";
  if (!token && e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      token = body.token || "";
    } catch(err) {}
  }
  return token === secret;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// GET: Teste de conexão ou busca do último backup
// -------------------------------------------------------------
function doGet(e) {
  try {
    if (!isAuthorized(e)) {
      return createJsonResponse({ status: "error", message: "Token de autorização inválido ou ausente." });
    }

    var action = (e && e.parameter && e.parameter.action) || "restore";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Conexão com Google Sheets estabelecida com sucesso!",
        spreadsheetTitle: ss.getName(),
        serverTime: new Date().toISOString()
      });
    }

    // Ação 'restore': busca o JSON mais recente armazenado
    var sheetRaw = ss.getSheetByName("Backup_JSON");
    if (!sheetRaw) {
      return createJsonResponse({
        status: "success",
        data: null,
        message: "Nenhum backup anterior encontrado nesta planilha."
      });
    }

    var lastRow = sheetRaw.getLastRow();
    if (lastRow < 2) {
      return createJsonResponse({
        status: "success",
        data: null,
        message: "Aba de backup vazia."
      });
    }

    var jsonStr = sheetRaw.getRange(2, 2).getValue();
    var parsed = JSON.parse(jsonStr);

    return createJsonResponse({
      status: "success",
      timestamp: sheetRaw.getRange(2, 1).getValue(),
      data: parsed,
      message: "Dados restaurados com sucesso do Google Sheets."
    });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// -------------------------------------------------------------
// POST: Recebe o payload da PWA e grava nas abas da planilha
// -------------------------------------------------------------
function doPost(e) {
  try {
    if (!isAuthorized(e)) {
      return createJsonResponse({ status: "error", message: "Token de autorização inválido." });
    }

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "Conteúdo do POST vazio." });
    }

    var payload = JSON.parse(e.postData.contents);
    var data = payload.data || payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();

    // 1. Atualiza Aba: Backup_JSON (Snapshot completo para restauração exata)
    syncBackupJsonSheet(ss, data, now);

    // 2. Atualiza Aba: Resumo_Geral (Gamificação e Placar)
    syncResumoSheet(ss, data, now);

    // 3. Atualiza Aba: Tarefas_Cadastradas
    syncTarefasSheet(ss, data.tasks || []);

    // 4. Atualiza Aba: Historico_Execucoes (Log diário de quem fez o quê)
    syncHistoricoSheet(ss, data.history || {});

    // 5. Atualiza Aba: Carro (Manutenções, peças e links)
    syncCarroSheet(ss, data.carro || []);

    // 6. Atualiza Aba: Reformas
    syncReformasSheet(ss, data.reformas || []);

    // 7. Atualiza Aba: Sonhos
    syncSonhosSheet(ss, data.sonhos || []);

    // 8. Atualiza Aba: Mercado_Compras
    syncComprasSheet(ss, data.compras || [], data.comprasRegistros || []);

    return createJsonResponse({
      status: "success",
      message: "Backup realizado com sucesso no Google Sheets!",
      timestamp: now.toISOString()
    });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// ============================================================
// FUNÇÕES AUXILIARES DE FORMATAÇÃO E GRAVAÇÃO
// ============================================================

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function syncBackupJsonSheet(ss, data, now) {
  var sheet = getOrCreateSheet(ss, "Backup_JSON");
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([["Data/Hora Backup", "Payload_JSON_Integral"]]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#0f766e").setFontColor("#ffffff");
  sheet.getRange(2, 1).setValue(now.toLocaleString("pt-BR"));
  sheet.getRange(2, 2).setValue(JSON.stringify(data));
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 600);
}

function syncResumoSheet(ss, data, now) {
  var sheet = getOrCreateSheet(ss, "Resumo_Geral");
  sheet.clear();
  var gamif = data.gamification || {};
  var user1 = (data.users && data.users.user1) || { name: "Matheus", xp: 0 };
  var user2 = (data.users && data.users.user2) || { name: "Scarlet", xp: 0 };

  var rows = [
    ["Métrica", "Valor"],
    ["Última Sincronização", now.toLocaleString("pt-BR")],
    ["Nível do Lar", gamif.levelName || "Iniciantes"],
    ["Nível Numérico", gamif.level || 1],
    ["XP Total do Casal", (user1.xp || 0) + (user2.xp || 0)],
    ["XP " + user1.name, user1.xp || 0],
    ["XP " + user2.name, user2.xp || 0],
    ["Sequência Atual (Dias)", gamif.streak || 0],
    ["Recorde de Sequência", gamif.bestStreak || 0],
    ["Total de Tarefas Cadastradas", (data.tasks || []).length],
    ["Manutenções do Carro Cadastradas", (data.carro || []).length],
    ["Total de Reformas em Andamento", (data.reformas || []).filter(function(r){ return r.status === "andamento"; }).length],
    ["Total de Sonhos Cadastrados", (data.sonhos || []).length]
  ];

  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  sheet.getRange(2, 1, rows.length - 1, 1).setFontWeight("bold");
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 240);
}

function syncTarefasSheet(ss, tasks) {
  var sheet = getOrCreateSheet(ss, "Tarefas");
  sheet.clear();
  var headers = ["ID", "Título da Tarefa", "Frequência", "Cômodo / Área", "Esforço", "XP", "Responsável Padrão", "Notas"];
  var rows = [headers];

  tasks.forEach(function(t) {
    rows.push([
      t.id || "",
      t.title || "",
      t.frequency || "diaria",
      t.room || "",
      t.effort || "",
      t.xp || 10,
      t.assignedTo || "ambos",
      t.notes || ""
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0284c7").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

function syncHistoricoSheet(ss, history) {
  var sheet = getOrCreateSheet(ss, "Historico_Log");
  sheet.clear();
  var headers = ["Data (YYYY-MM-DD)", "ID Tarefa", "Título Tarefa", "Frequência", "Feito Por", "XP Ganho", "Horário Conclusão"];
  var rows = [headers];

  var dates = Object.keys(history).sort().reverse();
  dates.forEach(function(d) {
    var dayEntries = history[d] || {};
    Object.keys(dayEntries).forEach(function(taskId) {
      var entry = dayEntries[taskId];
      if (entry && entry.done) {
        rows.push([
          d,
          taskId,
          entry.title || taskId,
          entry.frequency || "diaria",
          entry.doneBy || "Casal",
          entry.xp || 0,
          entry.completedAt || ""
        ]);
      }
    });
  });

  if (rows.length === 1) {
    rows.push(["-", "-", "Nenhum histórico registrado ainda", "-", "-", "-", "-"]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#4f46e5").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

function syncCarroSheet(ss, carro) {
  var sheet = getOrCreateSheet(ss, "Carro");
  sheet.clear();
  var headers = ["ID", "Título / Manutenção", "Categoria", "Status", "Prioridade", "Estimado (R$)", "Gasto Real (R$)", "KM Alvo", "Data Alvo", "Links", "Notas"];
  var rows = [headers];

  carro.forEach(function(c) {
    var linksStr = (c.links || []).map(function(l){ return l.title + ": " + l.url; }).join(" | ");
    rows.push([
      c.id || "",
      c.title || "",
      c.category || "mecanica",
      c.status || "pendente",
      c.priority || "media",
      c.estimatedCost || 0,
      c.actualCost || 0,
      c.targetKm || "",
      c.targetDate || "",
      linksStr,
      c.notes || ""
    ]);
  });

  if (rows.length === 1) {
    rows.push(["-", "Nenhuma manutenção cadastrada ainda", "-", "-", "-", 0, 0, "-", "-", "-", "-"]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

function syncReformasSheet(ss, reformas) {
  var sheet = getOrCreateSheet(ss, "Reformas");
  sheet.clear();
  var headers = ["ID", "Projeto / Melhoria", "Cômodo", "Prioridade", "Status", "Estimativa (R$)", "Gasto Real (R$)", "Data Alvo", "Links", "Qtd Fotos", "Descrição"];
  var rows = [headers];

  reformas.forEach(function(r) {
    var linksStr = "";
    if (r.links && r.links.length > 0) {
      linksStr = r.links.map(function(l) { return (l.title || "Link") + ": " + l.url; }).join(" | ");
    }
    var photosCount = (r.photos && r.photos.length) ? r.photos.length : 0;

    rows.push([
      r.id || "",
      r.title || "",
      r.room || "",
      r.priority || "media",
      r.status || "ideia",
      r.estimatedCost || 0,
      r.actualCost || 0,
      r.targetDate || "",
      linksStr,
      photosCount,
      r.description || ""
    ]);
  });

  if (rows.length === 1) {
    rows.push(["-", "Nenhuma reforma cadastrada ainda", "-", "-", "-", 0, 0, "-", "-", 0, "-"]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#2e5933").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}

function syncSonhosSheet(ss, sonhos) {
  var sheet = getOrCreateSheet(ss, "Sonhos");
  sheet.clear();
  var headers = ["ID", "Sonho / Meta", "Categoria", "Status", "Estimativa (R$)", "Prazo Desejado", "Descrição / Inspiração"];
  var rows = [headers];

  sonhos.forEach(function(s) {
    rows.push([
      s.id || "",
      s.title || "",
      s.category || "viagem",
      s.status || "sonhando",
      s.targetAmount || 0,
      s.targetDate || "",
      s.description || ""
    ]);
  });

  if (rows.length === 1) {
    rows.push(["-", "Nenhum sonho cadastrado ainda", "-", "-", 0, "-", "-"]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e11d48").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}


function syncComprasSheet(ss, compras, registros) {
  var sheet = getOrCreateSheet(ss, "Mercado_Compras");
  sheet.clear();
  var headers = ["Tipo", "Item / Mercado", "Qtd / Chave NFC-e", "Categoria", "Comprado?", "Quem Registrou", "Valor", "Data", "Notas"];
  var rows = [headers];

  compras.forEach(function(c) {
    rows.push([
      "Item da Lista",
      c.name || "",
      c.qty || "1",
      c.category || "geral",
      c.bought ? "SIM" : "NÃO",
      c.bought ? (c.boughtBy || "") : (c.addedBy || ""),
      c.totalPrice || c.price || 0,
      c.createdAt ? c.createdAt.substring(0, 10) : "",
      c.notes || ""
    ]);
  });

  registros.forEach(function(r) {
    rows.push([
      "Nota Fiscal (NFC-e)",
      r.marketName || "Supermercado",
      r.nfeKey || "-",
      "Mercado",
      "SIM",
      r.registeredBy || "",
      r.total || 0,
      r.date || "",
      r.notes || (r.items && r.items.length ? (r.items.length + " itens extraídos") : "")
    ]);
  });

  if (rows.length === 1) {
    rows.push(["-", "Nenhuma compra ou nota fiscal registrada ainda", "-", "-", "-", "-", 0, "-", "-"]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#10b981").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }
}
