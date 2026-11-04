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
  updateTask
} from '../js/tasks.js';
import { getHistoryForDate, getRecentDaysSummary } from '../js/history.js';
import {
  addCarroItem,
  getCarroSummary,
  addPhotoToCarro,
  removePhotoFromCarro,
  addLinkToCarro,
  removeLinkFromCarro,
  toggleCarroChecklistItem
} from '../js/carro.js';
import {
  addReforma,
  getReformasSummary,
  toggleReformaChecklistItem,
  addPhotoToReforma,
  removePhotoFromReforma,
  addLinkToReforma,
  removeLinkFromReforma
} from '../js/reformas.js';
import { addSonho, getSonhosSummary, toggleSonhoMilestone } from '../js/sonhos.js';
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
  getMarketPurchasesByMonth
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

  // 1. Matheus adiciona itens conforme lembra
  const { item: i1 } = addShoppingItem(state, {
    name: 'Leite desnatado',
    qty: '3 caixas',
    category: 'frios',
    price: '16,47'
  }, 'matheus');

  assert.equal(i1.name, 'Leite desnatado');
  assert.equal(i1.price, 16.47);
  assert.equal(i1.bought, false);
  assert.equal(i1.addedBy, 'matheus');

  // 2. Scarlet adiciona outro item
  const { item: i2 } = addShoppingItem(state, {
    name: 'Detergente neutro',
    qty: '2 un',
    category: 'limpeza',
    price: '5,98'
  }, 'scarlet');

  assert.equal(state.compras.length, 2);

  // 3. Resumo da lista
  let summary = getShoppingSummary(state);
  assert.equal(summary.total, 2);
  assert.equal(summary.pendingCount, 2);
  assert.equal(summary.boughtCount, 0);
  assert.equal(summary.estimatedTotal, 22.45);

  // 4. Marcar item como comprado no supermercado
  const toggled = toggleShoppingItem(state, i1.id, 'scarlet');
  assert.equal(toggled.bought, true);
  assert.equal(toggled.boughtBy, 'scarlet');

  summary = getShoppingSummary(state);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.boughtCount, 1);
  assert.equal(summary.boughtTotal, 16.47);
  assert.equal(summary.pendingTotal, 5.98);
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
  assert.equal(resD.xpAwarded, 25);
  assert.equal(isTaskDoneOnDate(state, "task_d1", today), true);

  // 2. Concluir tarefa semanal
  const resS = toggleTaskDone(state, "task_s1", today, "esposa");
  assert.equal(resS.status, "completed");
  assert.equal(resS.xpAwarded, 50);
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
  assert.equal(hist.userStats.matheus.xp, 25);

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
  assert.equal(taskCats[0].id, 'cozinha');
  assert.equal(taskCats[0].icon, '🍳');

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
  assert.equal(deleted, true);
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
    xp: 10,
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
  assert.equal(updated1.xp, 50); // XP atualizado de acordo com o esforço
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
