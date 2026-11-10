import { registerInvoiceInCatalog, findCatalogProduct, getProductPriceComparison } from '../js/catalog.js';
// ============================================================
//  MARACAJU - TESTES UNITÁRIOS DE REGRAS DE NEGÓCIO
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { getCoupleTotalXp, getCurrentLevel } from '../js/gamification.js';
import {
  getLocalDateString,
  toggleTaskDone,
  isTaskDoneOnDate,
  getTasksProgressByFrequency,
  getAllFrequenciesSummary,
  addTask,
  deleteTask,
  updateTask,
  formatTaskWeekDays,
  isTaskScheduledForDate
} from '../js/tasks.js';
import { getHistoryForDate, getRecentDaysSummary } from '../js/history.js';
import {
  addCarroItem,
  updateCarroItem,
  getCarroSummary,
  addPhotoToCarro,
  removePhotoFromCarro,
  addLinkToCarro,
  removeLinkFromCarro,
  toggleCarroChecklistItem
} from '../js/carro.js';
import {
  addReforma,
  updateReforma,
  getReformasSummary,
  toggleReformaChecklistItem,
  addPhotoToReforma,
  removePhotoFromReforma,
  addLinkToReforma,
  removeLinkFromReforma
} from '../js/reformas.js';
import {
  addSonho,
  updateSonho,
  getSonhosSummary,
  toggleSonhoMilestone,
  addPhotoToSonho,
  removePhotoFromSonho
} from '../js/sonhos.js';
import {
  normalizeEmail,
  findAuthorizedUser,
  loginWithEmail,
  setUserPassword,
  verifyUserPassword,
  loginWithCredentials
} from '../js/auth.js';
import {
  addShoppingItem,
  toggleShoppingItem,
  getShoppingSummary,
  addMarketPurchase,
  updateMarketPurchase,
  getMarketPurchasesByMonth,
  getMarketAnalytics,
  addPhotoToShoppingItem,
  removePhotoFromShoppingItem,
  addPhotoToMarketPurchase,
  removePhotoFromMarketPurchase,
  parseQuantity,
  getItemTotalPrice
} from '../js/shopping.js';
import {
  parseNfceQrCodeText,
  formatCnpj,
  guessMarketNameFromCnpj
} from '../js/nfce.js';
import {
  parseCurrency,
  formatCurrency,
  formatCurrencyWithSymbol
} from '../js/currency.js';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  findCategory
} from '../js/categories.js';
import { applyCloudBackup } from '../js/sheets.js';

function createMockState() {
  return {
    version: "1.1.0",
    activeUserId: "matheus",
    users: {
      user1: { id: "matheus", name: "Matheus", xp: 0 },
      user2: { id: "esposa", name: "Esposa", xp: 0 }
    },
    gamification: {
      streak: 0,
      bestStreak: 0,
      unlockedBadges: []
    },
    tasks: [
      { id: "task_d1", title: "Lavar louça", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria" },
      { id: "task_s1", title: "Lavar banheiro", room: "banheiros", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal" },
      { id: "task_m1", title: "Limpar geladeira", room: "cozinha", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "mensal" },
      { id: "task_a1", title: "Lavar cortinas", room: "sala", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual" }
    ],
    history: {},
    carro: [],
    reformas: [],
    sonhos: [],
    compras: [],
    comprasRegistros: [],
    settings: {
      soundEnabled: true,
      autoSync: false
    }
  };
}

test('Mercado: Lista de Compras do Mês (adicionar itens, marcar comprado, totais com centavos)', () => {
  const state = createMockState();

  // 0. Validação de parseQuantity: número puro 6 vira 6 unidades, 1 vira 1 unidade
  const pq6 = parseQuantity('6');
  assert.equal(pq6.text, '6 unidades');
  assert.equal(pq6.count, 6);
  assert.equal(pq6.unit, 'unidades');

  const pq1 = parseQuantity('1');
  assert.equal(pq1.text, '1 unidade');
  assert.equal(pq1.count, 1);

  // 1. Matheus adiciona "Chá Matte" com 6 unidades a R$ 8,00 cada
  const { item: iMatte } = addShoppingItem(state, {
    title: 'Chá Matte',
    qty: '6',
    category: 'bebidas',
    price: '8,00'
  }, 'matheus');

  assert.equal(iMatte.name, 'Chá Matte');
  assert.equal(iMatte.qty, '6 unidades');
  assert.equal(iMatte.unitPrice, 8.00);
  assert.equal(iMatte.totalPrice, 48.00);
  assert.equal(getItemTotalPrice(iMatte), 48.00);
  assert.equal(iMatte.bought, false);
  assert.equal(iMatte.addedBy, 'matheus');

  // Resumo com 1 item (6 unidades x R$ 8,00 = R$ 48,00)
  let sumMatte = getShoppingSummary(state);
  assert.equal(sumMatte.totalCount, 1);
  assert.equal(sumMatte.estimatedTotal, 48.00);

  // 2. Scarlet adiciona outro item usando title e quantity
  const { item: i2 } = addShoppingItem(state, {
    title: 'Detergente neutro',
    quantity: '2 un',
    category: 'limpeza',
    price: '5,98'
  }, 'scarlet');

  assert.equal(state.compras.length, 2);
  assert.equal(i2.name, 'Detergente neutro');
  assert.equal(i2.title, 'Detergente neutro');
  assert.equal(i2.qty, '2 un');
  assert.equal(i2.totalPrice, 11.96); // 2 un x 5,98

  // Fotos no item de lista de mercado
  assert.ok(Array.isArray(i2.photos));
  const photoAdded = addPhotoToShoppingItem(state, i2.id, "data:image/jpeg;base64,mockfotoitem");
  assert.equal(photoAdded, true);
  assert.equal(i2.photos.length, 1);
  const photoRemoved = removePhotoFromShoppingItem(state, i2.id, 0);
  assert.equal(photoRemoved, true);
  assert.equal(i2.photos.length, 0);

  // 3. Resumo da lista total (48,00 + 11,96 = 59,96)
  let summary = getShoppingSummary(state);
  assert.equal(summary.total, 2);
  assert.equal(summary.pendingCount, 2);
  assert.equal(summary.boughtCount, 0);
  assert.equal(summary.estimatedTotal, 59.96);

  // 4. Marcar item como comprado no supermercado
  const toggled = toggleShoppingItem(state, iMatte.id, 'scarlet');
  assert.equal(toggled.bought, true);
  assert.equal(toggled.boughtBy, 'scarlet');

  summary = getShoppingSummary(state);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.boughtCount, 1);
  assert.equal(summary.boughtTotal, 48.00);
  assert.equal(summary.pendingTotal, 11.96);
});

test('Mercado: Registro de Notas Fiscais (NFC-e QR Code, data da compra e separação por mês)', () => {
  const state = createMockState();

  // 1. Parser de URL de QR Code de NFC-e (ex: SEFAZ SP / Pão de Açúcar com R$ 264,33)
  const qrUrl = 'https://www.fazenda.sp.gov.br/nfce/qrcode?p=35261147508411000100650010000000011000000018|2|1|1|264.33|hash';
  const parsed = parseNfceQrCodeText(qrUrl);

  assert.ok(parsed.nfeKey);
  assert.equal(parsed.nfeKey.length, 44);
  assert.equal(parsed.total, 264.33);
  assert.equal(parsed.marketName, 'Pão de Açúcar / Extra');
  assert.ok(parsed.date.startsWith('2026-11'));

  // 2. Registrar compra no app
  const purchase1 = addMarketPurchase(state, {
    marketName: parsed.marketName,
    date: '2026-11-04',
    total: parsed.total,
    nfeKey: parsed.nfeKey,
    nfeUrl: qrUrl
  }, 'matheus');

  assert.equal(purchase1.total, 264.33);
  assert.equal(purchase1.monthKey, '2026-11');

  // Fotos na compra/nota fiscal
  assert.ok(Array.isArray(purchase1.photos));
  const photoAdded = addPhotoToMarketPurchase(state, purchase1.id, "data:image/jpeg;base64,mockfotonfce");
  assert.equal(photoAdded, true);
  assert.equal(purchase1.photos.length, 1);
  const photoRemoved = removePhotoFromMarketPurchase(state, purchase1.id, 0);
  assert.equal(photoRemoved, true);
  assert.equal(purchase1.photos.length, 0);

  // 3. Registrar outra compra no mês anterior (Outubro)
  addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-10-18',
    total: '512,80'
  }, 'scarlet');

  // 4. Separação automática por mês
  const byMonth = getMarketPurchasesByMonth(state);
  assert.equal(byMonth.length, 2);

  // Mês mais recente primeiro (Novembro/2026)
  assert.equal(byMonth[0].monthKey, '2026-11');
  assert.equal(byMonth[0].total, 264.33);
  assert.equal(byMonth[0].purchases.length, 1);

  // Mês anterior (Outubro/2026)
  assert.equal(byMonth[1].monthKey, '2026-10');
  assert.equal(byMonth[1].total, 512.80);
});

test('Moeda & Valores Quebrados: Suporte completo a centavos R$ 264,33 em todas as categorias', () => {
  // Testes com formatos brasileiros e decimais
  assert.equal(parseCurrency('264,33'), 264.33);
  assert.equal(parseCurrency('R$ 264,33'), 264.33);
  assert.equal(parseCurrency('R$264,33'), 264.33);
  assert.equal(parseCurrency('264.33'), 264.33);
  assert.equal(parseCurrency('1.250,50'), 1250.50);
  assert.equal(parseCurrency('0,99'), 0.99);
  assert.equal(parseCurrency(264.33), 264.33);
  assert.equal(parseCurrency(''), 0);
  assert.equal(parseCurrency(null), 0);

  // Formatação em padrão brasileiro
  assert.equal(formatCurrency(264.33), '264,33');
  assert.equal(formatCurrencyWithSymbol(264.33), 'R$ 264,33');
  assert.equal(formatCurrencyWithSymbol('1250.50'), 'R$ 1.250,50');
});

test('Tasks: Frequências Diárias, Semanais, Mensais e Anuais', () => {
  const state = createMockState();
  const today = getLocalDateString();

  // 1. Concluir tarefa diária
  const resD = toggleTaskDone(state, "task_d1", today, "matheus");
  assert.equal(resD.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_d1", today), true);

  // 2. Concluir tarefa semanal
  const resS = toggleTaskDone(state, "task_s1", today, "esposa");
  assert.equal(resS.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_s1", today), true);

  // 3. Concluir tarefa mensal
  const resM = toggleTaskDone(state, "task_m1", today, "matheus");
  assert.equal(resM.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_m1", today), true);

  // 4. Concluir tarefa anual
  const resA = toggleTaskDone(state, "task_a1", today, "esposa");
  assert.equal(resA.status, "completed");
  assert.equal(isTaskDoneOnDate(state, "task_a1", today), true);

  // Progresso por frequência
  const progD = getTasksProgressByFrequency(state, 'diaria', today);
  assert.equal(progD.total, 1);
  assert.equal(progD.completed, 1);
  assert.equal(progD.percent, 100);

  const progS = getTasksProgressByFrequency(state, 'semanal', today);
  assert.equal(progS.total, 1);
  assert.equal(progS.completed, 1);

  const allFreq = getAllFrequenciesSummary(state, today);
  assert.equal(allFreq.diaria.completed, 1);
  assert.equal(allFreq.semanal.completed, 1);
  assert.equal(allFreq.mensal.completed, 1);
  assert.equal(allFreq.anual.completed, 1);

  // Desmarcar tarefa semanal
  const uncheckS = toggleTaskDone(state, "task_s1", today, "esposa");
  assert.equal(uncheckS.status, "uncompleted");
  assert.equal(isTaskDoneOnDate(state, "task_s1", today), false);
});

test('History: Verificação detalhada de tarefas feitas e pendentes no dia', () => {
  const state = createMockState();
  const today = getLocalDateString();

  toggleTaskDone(state, "task_d1", today, "matheus");

  const hist = getHistoryForDate(state, today);
  assert.equal(hist.doneCount, 1);
  assert.equal(hist.pendingCount, 3);
  assert.equal(hist.tasksDone[0].task.id, "task_d1");
  assert.equal(hist.userStats.matheus.count, 1);

  const recent = getRecentDaysSummary(state, 7);
  assert.equal(recent.length, 7);
  assert.equal(recent[recent.length - 1].doneCount, 1);
});

test('Carro: Cadastrar manutenção, adicionar fotos, links e checklist', () => {
  const state = createMockState();
  const item = addCarroItem(state, {
    title: "Troca de óleo e filtro",
    category: "oleo_revisao",
    status: "orcamento",
    estimatedCost: 350,
    actualCost: 120,
    targetKm: 80000,
    checklist: [{ id: "c1", title: "Comprar óleo", done: false }]
  });

  assert.equal(state.carro.length, 1);
  assert.equal(item.estimatedCost, 350);

  // Adicionar foto
  const photoAdded = addPhotoToCarro(state, item.id, "data:image/jpeg;base64,sample123");
  assert.equal(photoAdded, true);
  assert.equal(item.photos.length, 1);

  // Remover foto
  removePhotoFromCarro(state, item.id, 0);
  assert.equal(item.photos.length, 0);

  // Adicionar link
  const linkAdded = addLinkToCarro(state, item.id, { url: "mercadolivre.com.br/peca", title: "Filtro no ML" });
  assert.ok(linkAdded.url.startsWith("https://"));
  assert.equal(item.links.length, 1);

  // Remover link
  removeLinkFromCarro(state, item.id, linkAdded.id);
  assert.equal(item.links.length, 0);

  // Checklist
  const isDone = toggleCarroChecklistItem(state, item.id, "c1");
  assert.equal(isDone, true);

  const summary = getCarroSummary(state);
  assert.equal(summary.totalEstimated, 350);
  assert.equal(summary.totalActual, 120);
  assert.equal(summary.byStatus.orcamento, 1);
});

test('Reformas: Adicionar projeto, alternar checklist, totalizar orçamento, fotos e links', () => {
  const state = createMockState();
  const ref = addReforma(state, {
    title: "Pintura da Sala",
    room: "sala",
    status: "orcamento",
    estimatedCost: 800,
    actualCost: 150,
    checklist: [{ id: "c1", title: "Comprar tinta", done: false }]
  });

  assert.equal(state.reformas.length, 1);
  assert.equal(ref.estimatedCost, 800);

  const isDone = toggleReformaChecklistItem(state, ref.id, "c1");
  assert.equal(isDone, true);

  // Fotos na reforma
  const photoAdded = addPhotoToReforma(state, ref.id, "data:image/jpeg;base64,mockphotodata");
  assert.equal(photoAdded, true);
  assert.equal(ref.photos.length, 1);

  const photoRemoved = removePhotoFromReforma(state, ref.id, 0);
  assert.equal(photoRemoved, true);
  assert.equal(ref.photos.length, 0);

  // Links na reforma
  const linkAdded = addLinkToReforma(state, ref.id, { url: "leroymerlin.com.br/tinta", title: "Tinta Suvinil Verde" });
  assert.ok(linkAdded);
  assert.equal(linkAdded.url, "https://leroymerlin.com.br/tinta");
  assert.equal(ref.links.length, 1);

  const linkRemoved = removeLinkFromReforma(state, ref.id, linkAdded.id);
  assert.equal(linkRemoved, true);
  assert.equal(ref.links.length, 0);

  const summary = getReformasSummary(state);
  assert.equal(summary.totalEstimated, 800);
  assert.equal(summary.totalActual, 150);
  assert.equal(summary.byStatus.orcamento, 1);
});

test('Sonhos: Adicionar sonho do casal, marcos e metas', () => {
  const state = createMockState();
  const s = addSonho(state, {
    title: "Viagem Itália",
    category: "viagem",
    targetAmount: 12000,
    status: "sonhando",
    milestones: [{ id: "m1", title: "Passaporte", done: false }]
  });

  assert.equal(state.sonhos.length, 1);
  assert.equal(s.targetAmount, 12000);

  const isDone = toggleSonhoMilestone(state, s.id, "m1");
  assert.equal(isDone, true);

  // Fotos no sonho
  assert.ok(Array.isArray(s.photos));
  const photoAdded = addPhotoToSonho(state, s.id, "data:image/jpeg;base64,mockfotosonho");
  assert.equal(photoAdded, true);
  assert.equal(s.photos.length, 1);
  const photoRemoved = removePhotoFromSonho(state, s.id, 0);
  assert.equal(photoRemoved, true);
  assert.equal(s.photos.length, 0);

  const summary = getSonhosSummary(state);
  assert.equal(summary.count, 1);
  assert.equal(summary.totalTargetAmount, 12000);
  assert.equal(summary.byCategory.viagem, 1);
});

test('Auth: Controle de Acesso Restrito Exclusivo para Matheus e Scarlet', () => {
  // 1. Normalização de e-mail (espaços e maiúsculas/minúsculas)
  assert.equal(normalizeEmail('  MatheusDoChapeu@Gmail.com '), 'matheusdochapeu@gmail.com');
  assert.equal(normalizeEmail('ScarletSantos7@GMAIL.COM'), 'scarletsantos7@gmail.com');
  assert.equal(normalizeEmail(null), '');
  assert.equal(normalizeEmail(undefined), '');

  // 2. Validação de Matheus (E-mail principal e Alias com typo do prompt)
  const userMatheus = findAuthorizedUser('matheusdochapeu@gmail.com');
  assert.ok(userMatheus);
  assert.equal(userMatheus.id, 'matheus');
  assert.equal(userMatheus.name, 'Matheus');
  assert.equal(userMatheus.avatarEmoji, '👨‍💻');

  // Alias digitado no prompt: Matheusdochpaeu@gmail.com
  const userMatheusAlias = findAuthorizedUser('Matheusdochpaeu@gmail.com');
  assert.ok(userMatheusAlias);
  assert.equal(userMatheusAlias.id, 'matheus');

  // 3. Validação de Scarlet
  const userScarlet = findAuthorizedUser('scarletsantos7@gmail.com');
  assert.ok(userScarlet);
  assert.equal(userScarlet.id, 'scarlet');
  assert.equal(userScarlet.name, 'Scarlet');
  assert.equal(userScarlet.avatarEmoji, '👩‍💼');

  // 4. Tentativa de login autorizado via loginWithEmail
  const loginResM = loginWithEmail('  matheusdochapeu@gmail.com  ');
  assert.equal(loginResM.success, true);
  assert.equal(loginResM.user.id, 'matheus');

  const loginResS = loginWithEmail('ScarletSantos7@gmail.com');
  assert.equal(loginResS.success, true);
  assert.equal(loginResS.user.id, 'scarlet');

  // 5. Bloqueio estrito de intrusos e e-mails não autorizados
  const loginIntruso = loginWithEmail('visitante@desconhecido.com');
  assert.equal(loginIntruso.success, false);
  assert.ok(loginIntruso.error.includes('não autorizado'));

  const loginVazio = loginWithEmail('');
  assert.equal(loginVazio.success, false);

  // 6. Definição de senhas individuais para Matheus e Scarlet
  setUserPassword('matheus', 'senhaMatheus2026');
  assert.equal(verifyUserPassword('matheus', 'senhaMatheus2026'), true);
  assert.equal(verifyUserPassword('matheus', 'errada'), false);

  setUserPassword('scarlet', 'senhaScarletCasal');
  assert.equal(verifyUserPassword('scarlet', 'senhaScarletCasal'), true);
  assert.equal(verifyUserPassword('scarlet', '1234'), false);

  // Login com credenciais válidas e inválidas
  const credOk = loginWithCredentials('matheus', 'senhaMatheus2026');
  assert.equal(credOk.success, true);
  assert.equal(credOk.user.name, 'Matheus');

  const credFail = loginWithCredentials('matheus', 'senhaInvalida');
  assert.equal(credFail.success, false);
});

test('Categories: Definir categorias personalizadas e emojis para filtro', () => {
  const state = createMockState();

  // 1. Obter categorias padrão de tarefas
  const taskCats = getCategories(state, 'tarefas');
  assert.ok(taskCats.length >= 7);
  assert.equal(taskCats[0].id, 'suite');
  assert.equal(taskCats[0].icon, '🛏️');

  // 2. Adicionar nova categoria com emoji (ex: Varanda Gourmet)
  const newCat = addCategory(state, 'tarefas', { label: 'Varanda Gourmet', icon: '🌿' });
  assert.ok(newCat);
  assert.equal(newCat.id, 'varanda_gourmet');
  assert.equal(newCat.label, 'Varanda Gourmet');
  assert.equal(newCat.icon, '🌿');

  const updatedTaskCats = getCategories(state, 'tarefas');
  assert.ok(updatedTaskCats.some(c => c.id === 'varanda_gourmet' && c.icon === '🌿'));

  // 3. Atualizar categoria (mudar emoji e nome)
  const updated = updateCategory(state, 'tarefas', 'varanda_gourmet', { label: 'Varanda & Churrasqueira', icon: '🍖' });
  assert.equal(updated.label, 'Varanda & Churrasqueira');
  assert.equal(updated.icon, '🍖');

  // 4. Buscar categoria por id
  const found = findCategory(state, 'tarefas', 'varanda_gourmet');
  assert.equal(found.label, 'Varanda & Churrasqueira');
  assert.equal(found.icon, '🍖');

  // 5. Excluir categoria
  const deleted = deleteCategory(state, 'tarefas', 'varanda_gourmet');
  assert.ok(deleted);
  assert.equal(deleted.id, 'varanda_gourmet');
  const afterDelete = getCategories(state, 'tarefas');
  assert.equal(afterDelete.some(c => c.id === 'varanda_gourmet'), false);

  // 6. Categorias para o módulo Carro
  const newCarCat = addCategory(state, 'carro', { label: 'Som & Multimídia', icon: '🎵' });
  assert.equal(newCarCat.icon, '🎵');
  const carCats = getCategories(state, 'carro');
  assert.ok(carCats.some(c => c.id === 'som_multimidia'));
});

test('Tasks: Editar tarefa e alterar periodicidade (diária, semanal, mensal, anual)', () => {
  const state = createMockState();
  state.tasks = []; // Inicia vazio para teste isolado
  const task = addTask(state, {
    title: "Limpar fogão",
    room: "cozinha",
    effort: "leve",
    assignedTo: "matheus",
    frequency: "diaria",
    notes: "Usar desengordurante"
  });

  assert.equal(task.title, "Limpar fogão");
  assert.equal(task.frequency, "diaria");

  // 1. Atualizar título, esforço e observações
  const updated1 = updateTask(state, task.id, {
    title: "Limpar e desengordurar fogão e forno",
    effort: "pesada",
    notes: "Cuidado com o vidro do forno"
  });
  assert.equal(updated1.title, "Limpar e desengordurar fogão e forno");
  assert.equal(updated1.effort, "pesada");
  assert.equal(updated1.notes, "Cuidado com o vidro do forno");

  // 2. Mudar periodicidade de 'diaria' para 'semanal'
  updateTask(state, task.id, { frequency: "semanal" });
  assert.equal(task.frequency, "semanal");

  const summarySemanal = getAllFrequenciesSummary(state);
  assert.equal(summarySemanal.semanal.total, 1);
  assert.equal(summarySemanal.diaria.total, 0);

  // 3. Mudar periodicidade para 'mensal'
  updateTask(state, task.id, { frequency: "mensal" });
  assert.equal(task.frequency, "mensal");
  const summaryMensal = getAllFrequenciesSummary(state);
  assert.equal(summaryMensal.mensal.total, 1);
  assert.equal(summaryMensal.semanal.total, 0);

  // 4. Mudar periodicidade para 'anual'
  updateTask(state, task.id, { frequency: "anual" });
  assert.equal(task.frequency, "anual");
  const summaryAnual = getAllFrequenciesSummary(state);
  assert.equal(summaryAnual.anual.total, 1);
  assert.equal(summaryAnual.mensal.total, 0);

  // 5. Retornar para 'diaria'
  updateTask(state, task.id, { frequency: "diaria" });
  assert.equal(task.frequency, "diaria");
  const summaryDiaria = getAllFrequenciesSummary(state);
  assert.equal(summaryDiaria.diaria.total, 1);
  assert.equal(summaryDiaria.anual.total, 0);

  // 6. Testar com ID inexistente
  const notFound = updateTask(state, "inexistente_123", { title: "Nada" });
  assert.equal(notFound, null);
});

test('History: getRecentDaysSummary aceita string YYYY-MM-DD e objeto Date sem desvios de fuso', () => {
  const state = createMockState();
  const summaryDateObj = getRecentDaysSummary(state, 7, new Date('2026-11-04T12:00:00'));
  assert.equal(summaryDateObj.length, 7);
  assert.equal(summaryDateObj[6].dateStr, '2026-11-04');

  const summaryDateStr = getRecentDaysSummary(state, 5, '2026-11-04');
  assert.equal(summaryDateStr.length, 5);
  assert.equal(summaryDateStr[4].dateStr, '2026-11-04');
  assert.equal(summaryDateStr[0].dateStr, '2026-10-31');
});

test('Auth: Definir senha individual, validar PIN e login seguro com credenciais', () => {
  setUserPassword('matheus', 'segredo123');
  assert.equal(verifyUserPassword('matheus', 'segredo123'), true);
  assert.equal(verifyUserPassword('matheus', 'errada'), false);

  const resSucesso = loginWithCredentials('matheusdochapeu@gmail.com', 'segredo123');
  assert.equal(resSucesso.success, true);
  assert.equal(resSucesso.user.name, 'Matheus');

  const resFalha = loginWithCredentials('matheusdochapeu@gmail.com', 'senhaInvalida');
  assert.equal(resFalha.success, false);
  assert.equal(resFalha.error, 'Senha incorreta. Tente novamente.');
});

test('Edição de Lançamentos: Permitir editar qualquer item em Carro, Reformas, Sonhos e Mercado', () => {
  const state = createMockState();

  // 1. Carro: Cadastrar "Suporte Bagagiyo" e corrigir para "Suporte Bagageiro" com novos valores
  const carro = addCarroItem(state, {
    title: 'Suporte Bagagiyo',
    category: 'estetica',
    status: 'orcamento',
    estimatedCost: '270,00',
    actualCost: '0'
  });
  assert.equal(carro.title, 'Suporte Bagagiyo');
  assert.equal(carro.estimatedCost, 270.00);

  const updatedCarro = updateCarroItem(state, carro.id, {
    title: 'Suporte Bagageiro',
    category: 'eletrica_acessorios',
    status: 'andamento',
    estimatedCost: '280,00',
    actualCost: '275,50',
    notes: 'Comprado modelo reforçado'
  });
  assert.equal(updatedCarro.title, 'Suporte Bagageiro');
  assert.equal(updatedCarro.category, 'eletrica_acessorios');
  assert.equal(updatedCarro.status, 'andamento');
  assert.equal(updatedCarro.estimatedCost, 280.00);
  assert.equal(updatedCarro.actualCost, 275.50);
  assert.equal(updatedCarro.notes, 'Comprado modelo reforçado');

  // 2. Reformas: Atualizar título, status e custos de projeto
  const ref = addReforma(state, {
    title: 'Pintura Sala',
    room: 'sala',
    status: 'orcamento',
    estimatedCost: '500,00'
  });
  const updatedRef = updateReforma(state, ref.id, {
    title: 'Pintura da Sala e Corredor',
    estimatedCost: '750,00',
    actualCost: '300,00',
    status: 'andamento'
  });
  assert.equal(updatedRef.title, 'Pintura da Sala e Corredor');
  assert.equal(updatedRef.estimatedCost, 750.00);
  assert.equal(updatedRef.actualCost, 300.00);

  // 3. Sonhos: Atualizar meta financeira e valor poupado
  const sonho = addSonho(state, {
    title: 'Viagem Japão',
    category: 'viagem',
    targetAmount: '15000,00'
  });
  const updatedSonho = updateSonho(state, sonho.id, {
    title: 'Viagem para o Japão em Outubro',
    targetAmount: '18000,00',
    savedAmount: '4500,00',
    status: 'poupando'
  });
  assert.equal(updatedSonho.title, 'Viagem para o Japão em Outubro');
  assert.equal(updatedSonho.targetAmount, 18000.00);
  assert.equal(updatedSonho.savedAmount, 4500.00);
  assert.equal(updatedSonho.status, 'poupando');

  // 4. Mercado: Atualizar registro de compra / nota fiscal
  const purchase = addMarketPurchase(state, {
    marketName: 'Mercadinho Local',
    date: '2026-11-04',
    total: '85,00'
  });
  const updatedPurchase = updateMarketPurchase(state, purchase.id, {
    marketName: 'Supermercado Pão de Açúcar',
    total: '92,40',
    notes: 'Itens de café da manhã'
  });
  assert.equal(updatedPurchase.marketName, 'Supermercado Pão de Açúcar');
  assert.equal(updatedPurchase.total, 92.40);
  assert.equal(updatedPurchase.notes, 'Itens de café da manhã');
});

test('Sheets: Prioridade da planilha Google e sincronização completa dos dados (Cloud-First)', () => {
  const localState = {
    version: "2.0.5",
    activeUserId: "matheus",
    users: {
      user1: { id: "matheus", name: "Matheus", xp: 10 },
      user2: { id: "scarlet", name: "Scarlet", xp: 20 }
    },
    tasks: [{ id: "task_1", title: "Lavar louça", frequency: "diaria" }],
    history: { "2026-11-04": { "task_1": { done: true, doneBy: "matheus" } } },
    carro: [{ id: "car_1", title: "Óleo antigo", actualCost: 100 }],
    reformas: [{ id: "ref_1", title: "Pintura antiga", actualCost: 0 }],
    sonhos: [{ id: "sonho_1", title: "Sonho antigo", savedAmount: 0 }],
    compras: [{ id: "comp_1", name: "Leite", qty: "1", totalPrice: 5.50, bought: false }],
    comprasRegistros: [],
    categories: {
      tarefas: [{ id: "cozinha", label: "Cozinha", icon: "🍳" }],
      carro: [],
      reformas: [],
      sonhos: [],
      compras: []
    },
    userPasswords: { matheus: "1234" },
    settings: {
      sheetsUrl: "https://script.google.com/macros/s/AKfycb.../exec",
      sheetsToken: "Maracaju88CasalSegredo2026!",
      autoSync: false,
      lastSyncTimestamp: null
    }
  };

  // Simula snapshot retornado do Google Sheets com alterações feitas no outro aparelho
  const cloudData = {
    version: "2.0.6",
    lastUpdated: "2026-11-04T22:00:00.000Z",
    activeUserId: "scarlet",
    users: {
      user1: { id: "matheus", name: "Matheus", xp: 35 },
      user2: { id: "scarlet", name: "Scarlet", xp: 50 }
    },
    tasks: [
      { id: "task_1", title: "Lavar louça", frequency: "diaria" },
      { id: "task_2", title: "Trocar roupas de cama", frequency: "semanal" }
    ],
    history: {
      "2026-11-04": {
        "task_1": { done: true, doneBy: "matheus" },
        "task_2": { done: true, doneBy: "scarlet" }
      }
    },
    carro: [{ id: "car_1", title: "Troca de óleo 5W30", actualCost: 320.50, status: "concluido" }],
    reformas: [{ id: "ref_1", title: "Iluminação LED Sala", actualCost: 450.00, status: "andamento" }],
    sonhos: [{ id: "sonho_1", title: "Viagem Gramado", savedAmount: 1200.00, status: "poupando" }],
    compras: [
      { id: "comp_1", name: "Leite Desnatado", qty: "2 unidades", totalPrice: 11.00, bought: true, boughtBy: "Scarlet" },
      { id: "comp_2", name: "Chá Matte", qty: "6 unidades", totalPrice: 48.00, bought: false }
    ],
    comprasRegistros: [
      { id: "reg_1", marketName: "Carrefour", date: "2026-11-04", total: 154.20, nfeKey: "3526..." }
    ],
    categories: {
      tarefas: [{ id: "cozinha", label: "Cozinha", icon: "🍳" }, { id: "jardim", label: "Jardim", icon: "🪴" }],
      carro: [{ id: "oleo", label: "Óleo", icon: "🛢️" }],
      reformas: [],
      sonhos: [],
      compras: [{ id: "bebidas", label: "Bebidas", icon: "🧃" }]
    },
    userPasswords: { matheus: "1234", scarlet: "5678" }
  };

  // Aplica restauração prioritária da nuvem
  const merged = applyCloudBackup(localState, cloudData);

  // Valida que os dados da planilha prevaleceram absolutamente
  assert.equal(merged.tasks.length, 2);
  assert.equal(merged.tasks[1].title, "Trocar roupas de cama");
  assert.equal(merged.carro[0].status, "concluido");
  assert.equal(merged.carro[0].actualCost, 320.50);
  assert.equal(merged.reformas[0].actualCost, 450.00);
  assert.equal(merged.sonhos[0].savedAmount, 1200.00);
  assert.equal(merged.compras.length, 2);
  assert.equal(merged.compras[0].bought, true);
  assert.equal(merged.compras[0].totalPrice, 11.00);
  assert.equal(merged.compras[1].name, "Chá Matte");
  assert.equal(merged.compras[1].totalPrice, 48.00);
  assert.equal(merged.comprasRegistros.length, 1);
  assert.equal(merged.comprasRegistros[0].total, 154.20);
  assert.ok(merged.categories.tarefas.length >= 11);
  assert.ok(merged.categories.tarefas.some(c => c.id === 'suite'));
  assert.ok(merged.categories.tarefas.some(c => c.id === 'jardim'));
  assert.equal(merged.categories.compras.length, 1);
  assert.equal(merged.userPasswords.scarlet, "5678");

  // Valida que a conexão local foi mantida e que a preferência de autoSync do
  // aparelho é preservada (antes a restauração forçava autoSync=true, religando
  // a sincronização que o usuário desligou nos Ajustes).
  assert.equal(merged.settings.sheetsUrl, localState.settings.sheetsUrl);
  assert.equal(merged.settings.sheetsToken, localState.settings.sheetsToken);
  assert.equal(merged.settings.autoSync, false);
  assert.ok(merged.settings.lastSyncTimestamp);
});

test('Mercado: Análise de Gastos e Mercados Recorrentes (getMarketAnalytics)', () => {
  const state = {
    comprasRegistros: [
      { id: 'nfe_1', marketName: 'Carrefour', total: 350.00, date: '2026-11-07', monthKey: '2026-11' },
      { id: 'nfe_2', marketName: 'Atacadão', total: 200.00, date: '2026-11-08', monthKey: '2026-11' },
      { id: 'nfe_3', marketName: 'Carrefour', total: 150.00, date: '2026-11-09', monthKey: '2026-11' },
      { id: 'nfe_4', marketName: 'Açougue Central', total: 100.00, date: '2026-10-20', monthKey: '2026-10' }
    ]
  };

  // Análise geral de todo o histórico
  const overall = getMarketAnalytics(state);
  assert.equal(overall.total, 800.00);
  assert.equal(overall.count, 4);
  assert.equal(overall.avgTicket, 200.00);

  // Ranking de mercados recorrentes
  assert.equal(overall.recurrentMarkets.length, 3);
  assert.equal(overall.recurrentMarkets[0].marketName, 'Carrefour');
  assert.equal(overall.recurrentMarkets[0].total, 500.00);
  assert.equal(overall.recurrentMarkets[0].count, 2);
  assert.equal(overall.recurrentMarkets[0].percentage, 62.5); // 500 / 800 = 62.5%

  // Análise filtrada por mês específico (Novembro/2026)
  const novAnalytics = getMarketAnalytics(state, '2026-11');
  assert.equal(novAnalytics.total, 700.00);
  assert.equal(novAnalytics.count, 3);
  assert.equal(novAnalytics.avgTicket, 233.33);
  assert.equal(novAnalytics.recurrentMarkets[0].marketName, 'Carrefour');
});

test('Mercado: Lançamento Manual de Compra sem Nota & Comparador de Preços entre Mercados', () => {
  const state = {
    comprasRegistros: [],
    catalog: []
  };

  // 1. Lança compra manual no Atacadão
  const purchase1 = addMarketPurchase(state, {
    marketName: 'Atacadão',
    date: '2026-11-07',
    total: '85,50',
    items: [
      { rawName: 'Café Pilão 500g', alias: 'Café Pilão', qty: '2 un', unitPrice: 17.50, totalPrice: 35.00 },
      { rawName: 'Arroz Camil 5kg', alias: 'Arroz Camil', qty: '1 un', unitPrice: 28.90, totalPrice: 28.90 }
    ],
    notes: 'Compra manual quinzenal'
  });
  assert.equal(purchase1.marketName, 'Atacadão');
  assert.equal(purchase1.total, 85.50);

  // Registra no catálogo
  registerInvoiceInCatalog(state, {
    marketName: purchase1.marketName,
    date: purchase1.date,
    items: purchase1.items
  });

  // 2. Lança compra manual no Carrefour com preço mais caro do mesmo café
  const purchase2 = addMarketPurchase(state, {
    marketName: 'Carrefour',
    date: '2026-11-09',
    total: '55,00',
    items: [
      { rawName: 'Café Pilão 500g', alias: 'Café Pilão', qty: '1 un', unitPrice: 22.90, totalPrice: 22.90 }
    ]
  });

  registerInvoiceInCatalog(state, {
    marketName: purchase2.marketName,
    date: purchase2.date,
    items: purchase2.items
  });

  // 3. Testa Comparador de Preços
  const cafeProd = findCatalogProduct(state, { alias: 'Café Pilão' });
  assert.ok(cafeProd, 'Café Pilão deve estar memorizado no catálogo inteligente');
  assert.equal(cafeProd.timesBought, 2);

  const comp = getProductPriceComparison(cafeProd);
  assert.equal(comp.lastPrice, 22.90);
  assert.equal(comp.minPrice, 17.50);
  assert.equal(comp.maxPrice, 22.90);
  assert.equal(comp.minMarket, 'Atacadão');
  assert.equal(comp.maxMarket, 'Carrefour');
  assert.equal(comp.priceDiff, 5.40); // 22.90 - 17.50 = 5.40 de economia no Atacadão
});

test('Tasks: Dias específicos da semana (ex: tirar o lixo ter/qui/sab)', () => {
  const state = {
    tasks: [],
    history: {}
  };

  // 1. Cadastra tarefa de tirar o lixo para Terça (2), Quinta (4) e Sábado (6)
  const taskLixo = addTask(state, {
    title: 'Tirar o lixo para a rua',
    frequency: 'diaria',
    weekDays: [2, 4, 6],
    room: 'cozinha'
  });

  assert.equal(taskLixo.title, 'Tirar o lixo para a rua');
  assert.deepEqual(taskLixo.weekDays, [2, 4, 6]);
  assert.equal(formatTaskWeekDays(taskLixo.weekDays), 'Ter, Qui, Sáb');

  // 2. Validação de formatação de dias
  assert.equal(formatTaskWeekDays([1, 2, 3, 4, 5]), 'Segunda a Sexta');
  assert.equal(formatTaskWeekDays([0, 6]), 'Fim de semana');
  assert.equal(formatTaskWeekDays([]), 'Todos os dias');
  assert.equal(formatTaskWeekDays([0, 1, 2, 3, 4, 5, 6]), 'Todos os dias');

  // 3. Validação de agendamento por data
  // 2026-11-03 é Terça-feira (dia 2) -> DEVE rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-03'), true);
  // 2026-11-04 é Quarta-feira (dia 3) -> NÃO deve rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-04'), false);
  // 2026-11-05 é Quinta-feira (dia 4) -> DEVE rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-05'), true);
  // 2026-11-06 é Sexta-feira (dia 5) -> NÃO deve rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-06'), false);
  // 2026-11-07 é Sábado (dia 6) -> DEVE rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-07'), true);
  // 2026-11-08 é Domingo (dia 0) -> NÃO deve rodar
  assert.equal(isTaskScheduledForDate(taskLixo, '2026-11-08'), false);

  // 4. Progresso diário: na Terça a tarefa conta no total; na Quarta não conta
  const progTerca = getTasksProgressByFrequency(state, 'diaria', '2026-11-03');
  assert.equal(progTerca.total, 1);
  assert.equal(progTerca.completed, 0);

  const progQuarta = getTasksProgressByFrequency(state, 'diaria', '2026-11-04');
  assert.equal(progQuarta.total, 0); // Lixo não passa na quarta, não entra no total!

  // 5. Edição: alterar dias para Seg, Qua, Sex
  const updated = updateTask(state, taskLixo.id, {
    weekDays: [1, 3, 5]
  });
  assert.deepEqual(updated.weekDays, [1, 3, 5]);
  assert.equal(formatTaskWeekDays(updated.weekDays), 'Seg, Qua, Sex');
  assert.equal(isTaskScheduledForDate(updated, '2026-11-04'), true); // Quarta agora é válida
  assert.equal(isTaskScheduledForDate(updated, '2026-11-03'), false); // Terça não é mais
});
