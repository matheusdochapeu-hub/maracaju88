// ============================================================
//  MARACAJU - INTERFACE, RENDERIZAÇÃO & MODAIS
// ============================================================

import { ROOMS, EFFORT_LEVELS, BADGES, FREQUENCIES, CARRO_CATEGORIES } from './config.js';
import { getCategories, findCategory, QUICK_EMOJIS_LIST } from './categories.js';
import { parseCurrency, formatCurrency, formatCurrencyWithSymbol } from './currency.js';
import { getShoppingSummary, getMarketPurchasesByMonth, getMonthLabel, parseQuantity, getItemTotalPrice } from './shopping.js';
import { isBiometricsSupported, isBiometricsEnabled } from './auth.js';
import {
  getLocalDateString,
  isTaskDoneOnDate,
  getTaskHistoryEntry,
  getAllFrequenciesSummary,
  getTasksProgressByFrequency
} from './tasks.js';
import { getHistoryForDate, getRecentDaysSummary } from './history.js';
import { getCarroSummary } from './carro.js';
import { getReformasSummary } from './reformas.js';
import { getSonhosSummary } from './sonhos.js';
import { findCatalogProduct, getProductPriceComparison, searchCatalogProducts, ensureCatalog } from './catalog.js';

// -------------------------------------------------------------
// SISTEMA DE CONFETTI NATIVO (HTML5 Canvas Particle Engine)
// -------------------------------------------------------------
export function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#14b8a6', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#10b981'];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width * (0.3 + Math.random() * 0.4),
      y: canvas.height * 0.5,
      r: Math.random() * 6 + 3,
      dx: (Math.random() - 0.5) * 12,
      dy: (Math.random() - 0.7) * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.1,
      life: 1
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    particles.forEach(p => {
      if (p.life > 0) {
        alive++;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.35;
        p.life -= 0.015;
        p.tilt += p.tiltSpeed;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        const radiusX = Math.max(0.1, Math.abs(p.r));
        const radiusY = Math.max(0.1, Math.abs(p.r * Math.sin(p.tilt)));
        ctx.ellipse(p.x, p.y, radiusX, radiusY, p.tilt, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (alive > 0) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  update();
}

// -------------------------------------------------------------
// NOTIFICAÇÕES TOAST
// -------------------------------------------------------------
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DO CABEÇALHO & MORADOR ATIVO
// -------------------------------------------------------------
export function renderHeaderStats(state) {
  // Active User Toggle
  const activeId = state.activeUserId || 'matheus';
  const activeUser = (activeId === 'esposa' || activeId === 'scarlet') ? state.users.user2 : state.users.user1;
  const userBtn = document.getElementById('active-user-btn');
  if (userBtn && activeUser) {
    userBtn.innerHTML = `
      <span class="user-avatar-sm">${activeUser.avatarEmoji || '👤'}</span>
      <span>${activeUser.name}</span>
    `;
  }

  // Indicador de Sincronização
  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.className = 'sync-status-indicator ' + (state.settings.sheetsUrl ? 'synced' : '');
    syncDot.title = state.settings.sheetsUrl ? 'Google Sheets Conectado' : 'Sem sincronização ativa';
  }
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 1: TAREFAS (DIÁRIAS, SEMANAIS, MENSAIS, ANUAIS)
// -------------------------------------------------------------
export function renderTasksTab(state, selectedFrequency = 'diaria', selectedRoom = 'tudo') {
  const todayStr = getLocalDateString();
  const freqSummary = getAllFrequenciesSummary(state, todayStr);
  const currentProg = getTasksProgressByFrequency(state, selectedFrequency, todayStr);

  // Barra Segmentada de Frequências (Diárias, Semanais, Mensais, Anuais)
  const freqBar = document.getElementById('frequency-segmented-bar');
  if (freqBar) {
    freqBar.innerHTML = FREQUENCIES.map(f => {
      const p = freqSummary[f.id] || { completed: 0, total: 0 };
      const isActive = f.id === selectedFrequency;
      return `
        <button class="freq-btn ${isActive ? 'active' : ''}" data-frequency="${f.id}">
          <span class="freq-icon">${f.icon}</span>
          <span>${f.label}</span>
          <span class="freq-badge">${p.completed}/${p.total}</span>
        </button>
      `;
    }).join('');
  }

  // Card de Progresso da Frequência Selecionada
  const progContainer = document.getElementById('daily-progress-card');
  if (progContainer) {
    const curFreqObj = FREQUENCIES.find(f => f.id === selectedFrequency) || FREQUENCIES[0];
    progContainer.innerHTML = `
      <div class="dash-header">
        <div class="dash-title">
          <span>${curFreqObj.icon} Tarefas ${curFreqObj.label}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--brand-moss-dark);">
          ${currentProg.completed} de ${currentProg.total} feitas
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-bar ${currentProg.percent === 100 ? 'gold' : ''}" style="width: ${currentProg.percent}%"></div>
      </div>
      <div class="dash-stats-row">
        <span><strong class="highlight-stat">${currentProg.completed}</strong> de ${currentProg.total} concluídas</span>
        <span><strong class="highlight-stat">${currentProg.percent}%</strong> do ciclo</span>
      </div>
    `;
  }

  // Chips de Cômodos / Categorias de Tarefas
  const chipsContainer = document.getElementById('room-chips-container');
  if (chipsContainer) {
    const userRooms = getCategories(state, 'tarefas');
    const allChips = [
      { id: 'tudo', label: 'Todos os Cômodos', icon: '🏠' },
      ...userRooms
    ];
    chipsContainer.innerHTML = allChips.map(r => `
      <button class="chip ${r.id === selectedRoom ? 'active' : ''}" data-room="${r.id}">
        <span>${r.icon}</span>
        <span>${r.label}</span>
      </button>
    `).join('') + `
      <button type="button" class="chip chip-add-category" data-open-category-modal="tarefas" style="border-style: dashed; border-color: rgba(46, 89, 51, 0.45); background: rgba(46, 89, 51, 0.05);" title="Adicionar ou personalizar categorias">
        <span>➕</span>
        <span>Nova Categoria</span>
      </button>
    `;
  }

  // Lista de Tarefas Filtrada por Frequência E Cômodo
  const taskListEl = document.getElementById('tasks-list');
  if (!taskListEl) return;

  let tasksToDisplay = (state.tasks || []).filter(t => (t.frequency || 'diaria') === selectedFrequency);

  if (selectedRoom !== 'tudo') {
    tasksToDisplay = tasksToDisplay.filter(t => t.room === selectedRoom);
  }

  const renderSingleTaskCard = (task) => {
    const isDone = isTaskDoneOnDate(state, task.id, todayStr);
    const historyEntry = getTaskHistoryEntry(state, task.id, todayStr);
    const room = findCategory(state, 'tarefas', task.room);
    const curFreqObj = FREQUENCIES.find(f => f.id === task.frequency) || FREQUENCIES[0];
    const hasSpecificWeekDays = Array.isArray(task.weekDays) && task.weekDays.length > 0 && task.weekDays.length < 7;
    const weekDaysBadge = hasSpecificWeekDays
      ? `<span class="tag-weekdays" title="Executar em: ${formatTaskWeekDays(task.weekDays)}">📅 ${formatTaskWeekDays(task.weekDays)}</span>`
      : '';

    return `
      <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-main">
          <label class="task-checkbox-wrapper">
            <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${isDone ? 'checked' : ''} />
          </label>
          <div class="task-info">
            <span class="task-title" title="${task.title}">${task.title}</span>
            <div class="task-meta">
              <span class="tag-freq">${curFreqObj.icon} ${curFreqObj.label}</span>
              ${weekDaysBadge}
              <span class="tag-room">${room.icon} ${room.label}</span>
              ${isDone && historyEntry ? `
                <span style="color: var(--success); font-weight: 600;">
                  ✓ Feito por ${historyEntry.doneBy} ${historyEntry.completedOnDate ? `(${historyEntry.completedOnDate})` : ''}
                </span>
              ` : `
                <button class="task-assignee-btn" data-change-assignee="${task.id}" title="Alterar responsável">
                  <span>👤 ${task.assignedTo === 'ambos' ? 'Casal' : ((task.assignedTo === 'esposa' || task.assignedTo === 'scarlet') ? state.users.user2.name : state.users.user1.name)}</span>
                </button>
              `}
            </div>
            ${task.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${task.notes}</div>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-icon btn-sm" data-edit-task="${task.id}" title="Editar tarefa e periodicidade" style="color: var(--brand-forest); margin-right: 0.25rem;">✏️</button>
          <button class="btn btn-icon btn-sm" data-delete-task="${task.id}" title="Excluir tarefa">🗑️</button>
        </div>
      </div>
    `;
  };

  if (tasksToDisplay.length === 0) {
    const curFreqObj = FREQUENCIES.find(f => f.id === selectedFrequency) || FREQUENCIES[0];
    taskListEl.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
        <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">${curFreqObj.icon}</p>
        <p style="font-weight: 600;">Nenhuma tarefa ${curFreqObj.label.toLowerCase()} cadastrada neste cômodo.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">Clique em "+ Nova Tarefa" para adicionar.</p>
      </div>
    `;
    return;
  }

  // Se for visualização diária, separa o que é para HOJE do que está agendado para outros dias
  if (selectedFrequency === 'diaria') {
    const todayTasks = tasksToDisplay.filter(t => isTaskScheduledForDate(t, todayStr) || isTaskDoneOnDate(state, t.id, todayStr));
    const otherDaysTasks = tasksToDisplay.filter(t => !isTaskScheduledForDate(t, todayStr) && !isTaskDoneOnDate(state, t.id, todayStr));

    let html = '';
    if (todayTasks.length === 0) {
      html += `
        <div style="text-align: center; padding: 1.75rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); margin-bottom: 0.75rem;">
          <p style="font-size: 1.8rem; margin-bottom: 0.25rem;">✨</p>
          <p style="font-weight: 700; color: var(--brand-moss-dark);">Tudo livre por hoje neste cômodo!</p>
          <p style="font-size: 0.8rem; margin-top: 0.25rem;">Não há tarefas agendadas para hoje.</p>
        </div>
      `;
    } else {
      html += todayTasks.map(renderSingleTaskCard).join('');
    }

    if (otherDaysTasks.length > 0) {
      html += `
        <details class="other-days-tasks-details" style="margin-top: 1rem; background: var(--bg-card); border: 1.5px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem 0.85rem;">
          <summary style="font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); cursor: pointer; user-select: none;">
            🗓️ Agendadas para outros dias (${otherDaysTasks.length} ${otherDaysTasks.length === 1 ? 'tarefa' : 'tarefas'})
          </summary>
          <div style="margin-top: 0.65rem; display: flex; flex-direction: column; gap: 0.5rem;">
            ${otherDaysTasks.map(renderSingleTaskCard).join('')}
          </div>
        </details>
      `;
    }

    taskListEl.innerHTML = html;
  } else {
    taskListEl.innerHTML = tasksToDisplay.map(renderSingleTaskCard).join('');
  }
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 2: HISTÓRICO & INSPEÇÃO DIÁRIA
// -------------------------------------------------------------
export function renderHistoryTab(state, targetDateStr = getLocalDateString()) {
  const historyData = getHistoryForDate(state, targetDateStr);
  const recentDays = getRecentDaysSummary(state, 7);

  const dateDisplay = document.getElementById('history-date-display');
  const dObj = new Date(targetDateStr + 'T12:00:00');
  const formattedFriendly = dObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (dateDisplay) {
    dateDisplay.innerHTML = `
      <div class="date-current">${formattedFriendly}</div>
      <div class="date-sub">${targetDateStr === getLocalDateString() ? '⭐ Visualizando Hoje' : targetDateStr}</div>
    `;
  }

  const streakBar = document.getElementById('history-recent-days-bar');
  if (streakBar) {
    streakBar.innerHTML = recentDays.map(d => `
      <div class="recent-day-dot ${d.status} ${d.dateStr === targetDateStr ? 'selected' : ''}" data-nav-date="${d.dateStr}" style="cursor: pointer; text-align: center; flex: 1;">
        <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${d.weekday}</div>
        <div style="width: 32px; height: 32px; margin: 4px auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;
          background: ${d.status === 'complete' ? 'var(--success)' : (d.status === 'partial' ? 'var(--brand-amber)' : 'var(--bg-tertiary)')};
          color: ${d.status === 'empty' ? 'var(--text-muted)' : '#ffffff'};
          border: ${d.dateStr === targetDateStr ? '2px solid var(--brand-teal)' : 'none'};">
          ${d.dayNumber}
        </div>
        <div style="font-size: 0.65rem; color: var(--text-secondary);">${d.percent}%</div>
      </div>
    `).join('');
  }

  const summaryBox = document.getElementById('history-day-summary');
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 700; font-size: 1rem;">Desempenho do Dia</span>
        <span style="font-weight: 800; color: var(--brand-teal);">${historyData.percent}% Concluído</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar ${historyData.percent === 100 ? 'gold' : ''}" style="width: ${historyData.percent}%"></div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.85rem;">
        <div style="background: var(--bg-secondary); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted);">👨‍💻 ${state.users.user1.name}:</span>
          <strong>${historyData.userStats.matheus.count} tarefas</strong>
        </div>
        <div style="background: var(--bg-secondary); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted);">👩‍💼 ${state.users.user2.name}:</span>
          <strong>${(historyData.userStats.scarlet || historyData.userStats.esposa || {count: 0}).count} tarefas</strong>
        </div>
      </div>
    `;
  }

  const listEl = document.getElementById('history-items-list');
  if (!listEl) return;

  if (historyData.tasksDone.length === 0 && historyData.tasksPending.length === 0) {
    listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum registro para esta data.</div>`;
    return;
  }

  let html = '';

  if (historyData.tasksDone.length > 0) {
    html += `<h4 style="font-size: 0.9rem; color: var(--success); margin: 1rem 0 0.5rem 0; display: flex; align-items: center; gap: 0.4rem;">
      ✅ Concluídas (${historyData.tasksDone.length})
    </h4>`;
    html += historyData.tasksDone.map(({ task, entry }) => `
      <div class="history-item done">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${task.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Feito por <strong>${entry.doneBy}</strong> às ${entry.completedAt || '--:--'} • Cômodo: ${task.room}
          </div>
        </div>
        <span style="color: var(--success); font-weight: 600; font-size: 0.85rem;">✓ Concluída</span>
      </div>
    `).join('');
  }

  if (historyData.tasksPending.length > 0) {
    html += `<h4 style="font-size: 0.9rem; color: var(--warning); margin: 1.25rem 0 0.5rem 0; display: flex; align-items: center; gap: 0.4rem;">
      ⏳ Pendentes / Não Realizadas (${historyData.tasksPending.length})
    </h4>`;
    html += historyData.tasksPending.map(task => `
      <div class="history-item pending">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${task.title}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            Cômodo: ${task.room} • Previsto para: ${task.assignedTo === 'ambos' ? 'Casal' : task.assignedTo}
          </div>
        </div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Não realizada</span>
      </div>
    `).join('');
  }

  listEl.innerHTML = html;
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 3: CARRO & MANUTENÇÃO (NOVA!)
// -------------------------------------------------------------
export function renderCarroTab(state, categoryFilter = 'todas', statusFilter = 'todas') {
  const summary = getCarroSummary(state);

  // Banner Resumo do Carro
  const bannerEl = document.getElementById('carro-summary-banner');
  if (bannerEl) {
    bannerEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.5rem;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Orçado / Estimado</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-cyan);">
            R$ ${summary.totalEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Total Investido</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--success);">
            R$ ${summary.totalActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
        <span>⏳ Pendentes: <strong>${summary.byStatus.pendente}</strong></span>
        <span>•</span>
        <span>📐 Em Orçamento: <strong>${summary.byStatus.orcamento}</strong></span>
        <span>•</span>
        <span>🛠️ Em Andamento: <strong>${summary.byStatus.andamento}</strong></span>
        <span>•</span>
        <span>✅ Concluídas: <strong>${summary.byStatus.concluido}</strong></span>
      </div>
    `;
  }

  // Chips de Categorias do Carro (Dinâmicos com Emojis)
  const catContainer = document.getElementById('carro-category-chips');
  if (catContainer) {
    const userCarCats = getCategories(state, 'carro');
    const allChips = [
      { id: 'todas', label: 'Todas Categorias', icon: '🚗' },
      ...userCarCats
    ];
    catContainer.innerHTML = allChips.map(c => `
      <button class="chip ${c.id === categoryFilter ? 'active' : ''}" data-carro-cat="${c.id}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('') + `
      <button type="button" class="chip chip-add-category" data-open-category-modal="carro" style="border-style: dashed; border-color: rgba(46, 89, 51, 0.45); background: rgba(46, 89, 51, 0.05);" title="Adicionar ou personalizar categorias">
        <span>➕</span>
        <span>Nova Categoria</span>
      </button>
    `;
  }

  const gridEl = document.getElementById('carro-grid');
  if (!gridEl) return;

  let list = state.carro || [];

  if (categoryFilter !== 'todas') {
    list = list.filter(c => c.category === categoryFilter);
  }

  if (statusFilter !== 'todas') {
    list = list.filter(c => c.status === statusFilter);
  }

  if (list.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
        <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">🚗</p>
        <p style="font-weight: 600;">Nenhuma manutenção ou ideia encontrada nesta categoria.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">Clique em "+ Nova Manutenção" para registrar peças, revisões ou fotos.</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = list.map(item => {
    const catObj = findCategory(state, 'carro', item.category);
    const checklist = item.checklist || [];
    const doneChecks = checklist.filter(c => c.done).length;
    const checkPercent = checklist.length > 0 ? Math.round((doneChecks / checklist.length) * 100) : 0;
    const photos = item.photos || [];
    const links = item.links || [];

    return `
      <div class="project-card" data-carro-id="${item.id}">
        <div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span class="project-status-badge status-${item.status}">${item.status}</span>
            <span class="tag-room">${catObj.icon} ${catObj.label}</span>
          </div>

          <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.35rem;">${item.title}</h3>

          ${item.notes ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.65rem;">${item.notes}</p>` : ''}

          <!-- Valores Financeiros & KM -->
          <div style="background: var(--bg-secondary); padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.8rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.4rem;">
            <div>
              <span style="color: var(--text-muted);">Estimado:</span>
              <strong>R$ ${item.estimatedCost.toLocaleString('pt-BR')}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">Gasto Real:</span>
              <strong style="color: var(--success);">R$ ${item.actualCost.toLocaleString('pt-BR')}</strong>
            </div>
            ${item.targetKm > 0 ? `
              <div>
                <span style="color: var(--text-muted);">KM Alvo:</span>
                <strong style="color: var(--brand-amber);">${item.targetKm.toLocaleString('pt-BR')} km</strong>
              </div>
            ` : ''}
          </div>

          <!-- Galeria de Fotos da Manutenção -->
          <div style="margin-bottom: 0.65rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
              <span>📷 Fotos da Peça / Manutenção (${photos.length})</span>
              <div style="display: flex; gap: 0.35rem;">
                <label class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0;" title="Bater foto com a câmera do celular">
                  📸 Câmera
                  <input type="file" accept="image/*" capture="environment" class="input-carro-add-photo" data-car-id="${item.id}" style="display: none;" />
                </label>
                <label class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0;" title="Escolher foto da galeria">
                  🖼️ Galeria
                  <input type="file" accept="image/*" class="input-carro-add-photo" data-car-id="${item.id}" style="display: none;" />
                </label>
              </div>
            </div>
            ${photos.length > 0 ? `
              <div class="carro-photos-container">
                ${photos.map((src, pIdx) => `
                  <div class="carro-thumb-wrapper" data-view-photo="${src}">
                    <img src="${src}" alt="Foto ${item.title}" class="carro-thumb-img" />
                    <button class="carro-thumb-delete" data-del-photo="${item.id}" data-photo-idx="${pIdx}" title="Excluir foto">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhuma foto anexada. Tire uma foto ou escolha da galeria.</div>
            `}
          </div>

          <!-- Links de Peças / Referências -->
          <div style="margin-bottom: 0.65rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
              <span>🔗 Links e Peças (${links.length})</span>
              <button class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;" data-add-link-to="${item.id}">+ Link</button>
            </div>
            ${links.length > 0 ? `
              <div class="carro-links-list">
                ${links.map(l => `
                  <span class="carro-link-chip">
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                      🔗 ${l.title}
                    </a>
                    <button class="carro-link-delete" data-del-link="${item.id}" data-link-id="${l.id}" title="Remover link">✕</button>
                  </span>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhum link adicionado.</div>
            `}
          </div>

          <!-- Checklist de Etapas -->
          ${checklist.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                <span>Etapas</span>
                <span>${doneChecks}/${checklist.length} (${checkPercent}%)</span>
              </div>
              <div class="progress-container" style="height: 6px;">
                <div class="progress-bar" style="width: ${checkPercent}%"></div>
              </div>
              <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
                ${checklist.map(c => `
                  <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="carro-check-item" data-car-id="${item.id}" data-check-id="${c.id}" ${c.done ? 'checked' : ''} />
                    <span style="${c.done ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${c.title}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Rodapé do Card -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${item.targetDate ? `📅 Previsão: ${item.targetDate}` : ''}
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" data-edit-carro="${item.id}" title="Editar Manutenção">✏️ Editar</button>
            <button class="btn btn-secondary btn-sm" data-edit-carro-status="${item.id}">Alterar Status</button>
            <button class="btn btn-icon btn-sm" data-delete-carro="${item.id}" title="Excluir">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 3: REFORMAS & MELHORIAS
// -------------------------------------------------------------
export function renderReformasTab(state, statusFilter = 'todas', categoryFilter = 'todas') {
  const summary = getReformasSummary(state);

  const bannerEl = document.getElementById('reformas-summary-banner');
  if (bannerEl) {
    bannerEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Orçamento Estimado</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-cyan);">
            R$ ${summary.totalEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Total Investido</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--success);">
            R$ ${summary.totalActual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    `;
  }

  // Chips de Cômodos / Categorias de Reformas (Dinâmicos com Emojis)
  const catContainer = document.getElementById('reformas-category-chips');
  if (catContainer) {
    const userRefCats = getCategories(state, 'reformas');
    const allChips = [
      { id: 'todas', label: 'Todos os Cômodos', icon: '🏠' },
      ...userRefCats
    ];
    catContainer.innerHTML = allChips.map(c => `
      <button class="chip ${c.id === categoryFilter ? 'active' : ''}" data-reforma-cat="${c.id}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('') + `
      <button type="button" class="chip chip-add-category" data-open-category-modal="reformas" style="border-style: dashed; border-color: rgba(46, 89, 51, 0.45); background: rgba(46, 89, 51, 0.05);" title="Adicionar ou personalizar categorias">
        <span>➕</span>
        <span>Nova Categoria</span>
      </button>
    `;
  }

  const gridEl = document.getElementById('reformas-grid');
  if (!gridEl) return;

  let list = state.reformas || [];

  if (statusFilter !== 'todas') {
    list = list.filter(r => r.status === statusFilter);
  }

  if (categoryFilter !== 'todas') {
    list = list.filter(r => r.room === categoryFilter);
  }

  if (list.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
        <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔨</p>
        <p style="font-weight: 600;">Nenhuma reforma ou melhoria nesta categoria.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">Adicione uma nova ideia para transformar a casa!</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = list.map(ref => {
    const checklist = ref.checklist || [];
    const photos = ref.photos || [];
    const links = ref.links || [];
    const doneChecks = checklist.filter(c => c.done).length;
    const checkPercent = checklist.length > 0 ? Math.round((doneChecks / checklist.length) * 100) : 0;
    const roomObj = findCategory(state, 'reformas', ref.room);

    return `
      <div class="project-card" data-reforma-id="${ref.id}">
        <div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="project-status-badge status-${ref.status}">${ref.status}</span>
            <span class="tag-room">${roomObj.icon} ${roomObj.label}</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.4rem;">${ref.title}</h3>
          ${ref.description ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${ref.description}</p>` : ''}
          
          <div style="background: var(--bg-tertiary); padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.8rem; display: flex; justify-content: space-between;">
            <div>
              <span style="color: var(--text-muted);">Estimado:</span>
              <strong>R$ ${ref.estimatedCost.toLocaleString('pt-BR')}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">Gasto:</span>
              <strong style="color: var(--success);">R$ ${ref.actualCost.toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          <!-- Galeria de Fotos da Reforma / Inspirações -->
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">
              <span style="font-weight: 600;">📷 Fotos e Inspirações (${photos.length})</span>
              <div style="display: flex; gap: 0.35rem;">
                <label class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.725rem; cursor: pointer; margin-bottom: 0;" title="Bater foto com a câmera do celular">
                  📸 Câmera
                  <input type="file" accept="image/*" capture="environment" class="input-reforma-add-photo" data-ref-id="${ref.id}" style="display: none;" />
                </label>
                <label class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.725rem; cursor: pointer; margin-bottom: 0;" title="Escolher foto da galeria">
                  🖼️ Galeria
                  <input type="file" accept="image/*" class="input-reforma-add-photo" data-ref-id="${ref.id}" style="display: none;" />
                </label>
              </div>
            </div>
            ${photos.length > 0 ? `
              <div class="carro-photos-container">
                ${photos.map((src, pIdx) => `
                  <div class="carro-thumb-wrapper" data-view-photo="${src}">
                    <img src="${src}" alt="Foto ${ref.title}" class="carro-thumb-img" />
                    <button class="carro-thumb-delete" data-del-reforma-photo="${ref.id}" data-photo-idx="${pIdx}" title="Excluir foto">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhuma foto anexada. Tire uma foto ou escolha da galeria.</div>
            `}
          </div>

          <!-- Links de Inspirações / Peças / Materiais -->
          <div style="margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">
              <span style="font-weight: 600;">🔗 Links e Lojas (${links.length})</span>
              <button class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.725rem;" data-add-reforma-link-to="${ref.id}">+ Link</button>
            </div>
            ${links.length > 0 ? `
              <div class="carro-links-list">
                ${links.map(l => `
                  <span class="carro-link-chip">
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">
                      🔗 ${l.title}
                    </a>
                    <button class="carro-link-delete" data-del-reforma-link="${ref.id}" data-link-id="${l.id}" title="Remover link">✕</button>
                  </span>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhum link adicionado.</div>
            `}
          </div>

          ${checklist.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                <span>Etapas</span>
                <span>${doneChecks}/${checklist.length} (${checkPercent}%)</span>
              </div>
              <div class="progress-container" style="height: 6px;">
                <div class="progress-bar" style="width: ${checkPercent}%"></div>
              </div>
              <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
                ${checklist.map(c => `
                  <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="reforma-check-item" data-ref-id="${ref.id}" data-check-id="${c.id}" ${c.done ? 'checked' : ''} />
                    <span style="${c.done ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${c.title}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${ref.targetDate ? `📅 Alvo: ${ref.targetDate}` : ''}
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" data-edit-reforma="${ref.id}" title="Editar Reforma">✏️ Editar</button>
            <button class="btn btn-secondary btn-sm" data-edit-reforma-status="${ref.id}">Alterar Status</button>
            <button class="btn btn-icon btn-sm" data-delete-reforma="${ref.id}" title="Excluir">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 4: MURAL DOS SONHOS & METAS
// -------------------------------------------------------------
export function renderSonhosTab(state, categoryFilter = 'todas') {
  const summary = getSonhosSummary(state);

  const bannerEl = document.getElementById('sonhos-summary-banner');
  if (bannerEl) {
    bannerEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Sonhos Cadastrados</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-rose);">${summary.count} Sonhos do Casal</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Meta Financeira Total</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-amber);">
            R$ ${summary.totalTargetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    `;
  }

  // Chips de Categorias dos Sonhos (Dinâmicos com Emojis)
  const catContainer = document.getElementById('sonhos-category-chips');
  if (catContainer) {
    const userSonhoCats = getCategories(state, 'sonhos');
    const allChips = [
      { id: 'todas', label: 'Todos os Sonhos', icon: '✨' },
      ...userSonhoCats
    ];
    catContainer.innerHTML = allChips.map(c => `
      <button class="chip ${c.id === categoryFilter ? 'active' : ''}" data-sonho-filter="${c.id}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('') + `
      <button type="button" class="chip chip-add-category" data-open-category-modal="sonhos" style="border-style: dashed; border-color: rgba(46, 89, 51, 0.45); background: rgba(46, 89, 51, 0.05);" title="Adicionar ou personalizar categorias">
        <span>➕</span>
        <span>Nova Categoria</span>
      </button>
    `;
  }

  const gridEl = document.getElementById('sonhos-grid');
  if (!gridEl) return;

  let list = state.sonhos || [];

  if (categoryFilter !== 'todas') {
    list = list.filter(s => s.category === categoryFilter);
  }

  if (list.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
        <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">✨</p>
        <p style="font-weight: 600;">Nenhum sonho cadastrado nesta categoria.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">O que vocês gostariam de viver ou conquistar juntos?</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = list.map(sonho => {
    const milestones = sonho.milestones || [];
    const doneMilestones = milestones.filter(m => m.done).length;
    const mPercent = milestones.length > 0 ? Math.round((doneMilestones / milestones.length) * 100) : 0;
    const catObj = findCategory(state, 'sonhos', sonho.category);

    return `
      <div class="project-card" data-sonho-id="${sonho.id}">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="project-status-badge status-andamento">${sonho.status}</span>
            <span class="tag-room">${catObj.icon} ${catObj.label}</span>
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.4rem;">${sonho.title}</h3>
          ${sonho.description ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${sonho.description}</p>` : ''}

          ${sonho.targetAmount > 0 ? `
            <div style="background: var(--bg-secondary); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.8rem;">
              <span style="color: var(--text-muted);">Meta Financeira:</span>
              <strong style="color: var(--brand-amber);"> R$ ${sonho.targetAmount.toLocaleString('pt-BR')}</strong>
            </div>
          ` : ''}

          ${milestones.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                <span>Passos para realizar</span>
                <span>${doneMilestones}/${milestones.length} (${mPercent}%)</span>
              </div>
              <div class="progress-container" style="height: 6px;">
                <div class="progress-bar gold" style="width: ${mPercent}%"></div>
              </div>
              <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
                ${milestones.map(m => `
                  <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; cursor: pointer;">
                    <input type="checkbox" class="sonho-milestone-item" data-sonho-id="${sonho.id}" data-milestone-id="${m.id}" ${m.done ? 'checked' : ''} />
                    <span style="${m.done ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${m.title}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Fotos & Inspirações do Sonho -->
          <div style="margin-top: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">
              <span style="font-weight: 600;">✨ Fotos e Inspirações (${(sonho.photos || []).length})</span>
              <div style="display: flex; gap: 0.35rem;">
                <label class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0;" title="Bater foto com a câmera do celular">
                  📸 Câmera
                  <input type="file" accept="image/*" capture="environment" class="input-sonho-add-photo" data-sonho-id="${sonho.id}" style="display: none;" />
                </label>
                <label class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0;" title="Escolher foto da galeria">
                  🖼️ Galeria
                  <input type="file" accept="image/*" class="input-sonho-add-photo" data-sonho-id="${sonho.id}" style="display: none;" />
                </label>
              </div>
            </div>
            ${(sonho.photos && sonho.photos.length > 0) ? `
              <div class="carro-photos-container">
                ${sonho.photos.map((src, pIdx) => `
                  <div class="carro-thumb-wrapper" data-view-photo="${src}">
                    <img src="${src}" alt="Foto ${sonho.title}" class="carro-thumb-img" />
                    <button class="carro-thumb-delete" data-del-sonho-photo="${sonho.id}" data-photo-idx="${pIdx}" title="Excluir foto">✕</button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">Nenhuma foto anexada. Adicione fotos de lugares, referências ou metas!</div>
            `}
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${sonho.targetDate ? `🎯 Prazo: ${sonho.targetDate}` : ''}
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" data-edit-sonho="${sonho.id}" title="Editar Sonho">✏️ Editar</button>
            <button class="btn btn-secondary btn-sm" data-edit-sonho-status="${sonho.id}">Status</button>
            <button class="btn btn-icon btn-sm" data-delete-sonho="${sonho.id}" title="Excluir">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA: MERCADO & LISTA DE COMPRAS
// -------------------------------------------------------------
export function renderComprasTab(state, activeCategory = 'todas', activeView = 'lista') {
  const summary = getShoppingSummary(state);

  // Banner de Resumo da Lista & Mês
  const bannerEl = document.getElementById('compras-summary-banner');
  if (bannerEl) {
    bannerEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Itens a Comprar</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-moss-dark);">
            ${summary.pendingCount} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">(de ${summary.totalCount})</span>
          </div>
        </div>
        <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Estimativa Total</div>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--brand-moss-dark);">
            ${formatCurrencyWithSymbol(summary.estimatedTotal)}
          </div>
        </div>
      </div>
    `;
  }

  // Alternador de Visão (Lista do Mês vs Notas & Histórico)
  const viewListaEl = document.getElementById('compras-view-lista-container');
  const viewNotasEl = document.getElementById('compras-view-notas-container');
  const viewButtons = document.querySelectorAll('[data-compras-view]');
  viewButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-compras-view') === activeView);
  });

  if (activeView === 'notas') {
    if (viewListaEl) viewListaEl.style.display = 'none';
    if (viewNotasEl) viewNotasEl.style.display = 'block';
  } else {
    if (viewListaEl) viewListaEl.style.display = 'block';
    if (viewNotasEl) viewNotasEl.style.display = 'none';
  }

  // Chips de Categoria para Lista de Compras
  const chipsContainer = document.getElementById('compras-category-chips');
  if (chipsContainer) {
    const userCats = getCategories(state, 'compras');
    const allChips = [
      { id: 'todas', label: 'Todos os Itens', icon: '🛒' },
      ...userCats
    ];
    chipsContainer.innerHTML = allChips.map(c => `
      <button class="chip ${c.id === activeCategory ? 'active' : ''}" data-compras-cat="${c.id}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('') + `
      <button type="button" class="chip chip-add-category" data-open-category-modal="compras" style="border-style: dashed; border-color: rgba(46, 89, 51, 0.45); background: rgba(46, 89, 51, 0.05);" title="Adicionar ou personalizar categorias">
        <span>➕</span>
        <span>Nova Categoria</span>
      </button>
    `;
  }

  // Lista de Itens da Lista de Compras
  const listEl = document.getElementById('shopping-items-list');
  if (listEl) {
    let items = (state.compras || []);
    if (activeCategory !== 'todas') {
      items = items.filter(i => (i.category || 'outros') === activeCategory);
    }

    if (items.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
          <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">🛒</p>
          <p style="font-weight: 600;">Sua lista de mercado está vazia nesta categoria.</p>
          <p style="font-size: 0.8rem; margin-top: 0.25rem;">Adicione itens conforme for lembrando durante o mês!</p>
        </div>
      `;
    } else {
      // Ordena: pendentes primeiro, comprados por último
      const sorted = [...items].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0));

      listEl.innerHTML = sorted.map(item => {
        const catObj = findCategory(state, 'compras', item.category);
        const userLabel = item.suggestedBy === 'scarlet' ? '👩‍💼 Scarlet' : (item.suggestedBy === 'matheus' ? '👨‍💻 Matheus' : '👥 Casal');

        const qtyParsed = parseQuantity(item.quantity || item.qty);
        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
        const itemTotal = getItemTotalPrice(item);

        return `
          <div class="shopping-card ${item.bought ? 'bought' : ''}" data-shopping-id="${item.id}">
            <div class="shopping-main">
              <label class="task-checkbox-wrapper">
                <input type="checkbox" class="shopping-checkbox" data-id="${item.id}" ${item.bought ? 'checked' : ''} />
              </label>
              <div class="shopping-info">
                <span class="shopping-title">${item.title || item.name}</span>
                <div class="shopping-meta">
                  <span class="tag-room">${catObj.icon} ${catObj.label}</span>
                  <span class="shopping-qty-pill">${qtyParsed.text}</span>
                  ${(() => {
                    const prod = findCatalogProduct(state, { id: item.catalogId, alias: item.title || item.name, rawName: item.title || item.name });
                    if (!prod) return '';
                    const comp = getProductPriceComparison(prod);
                    let badge = '';
                    if (comp && comp.totalPurchases > 1 && comp.minPrice > 0) {
                      badge = `<span class="price-compare-badge cheaper" title="Menor preço histórico pago neste produto" style="cursor: pointer;" data-view-product-history="${prod.id}">Menor: ${formatCurrencyWithSymbol(comp.minPrice)}</span>`;
                    }
                    return `
                      <button type="button" class="btn btn-secondary btn-xs" data-view-product-history="${prod.id}" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; font-weight: 700; border-radius: var(--radius-sm);" title="Ver histórico comparativo de preços">
                        📊 Histórico (${comp ? comp.totalPurchases : 1})
                      </button>
                      ${badge}
                    `;
                  })()}
                  ${unitPrice > 0 ? (
                    qtyParsed.count > 1
                      ? `<span class="shopping-price-tag" title="Preço unitário">${formatCurrencyWithSymbol(unitPrice)}/un</span>
                         <span class="shopping-price-tag" style="background: var(--brand-moss); color: #fff; font-weight: 700;" title="Subtotal">${formatCurrencyWithSymbol(itemTotal)}</span>`
                      : `<span class="shopping-price-tag" title="Preço">${formatCurrencyWithSymbol(itemTotal)}</span>`
                  ) : ''}
                  <span style="color: var(--text-muted); font-size: 0.75rem;">${userLabel}</span>
                </div>
                ${item.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${item.notes}</div>` : ''}

                <!-- Fotos / Embalagem do Produto -->
                <div style="margin-top: 0.4rem;">
                  <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: var(--text-muted);">
                    <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Bater foto do item ou embalagem com a câmera">
                      📸 Câmera
                      <input type="file" accept="image/*" capture="environment" class="input-shopping-add-photo" data-shopping-id="${item.id}" style="display: none;" />
                    </label>
                    <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Escolher foto da galeria">
                      🖼️ Galeria
                      <input type="file" accept="image/*" class="input-shopping-add-photo" data-shopping-id="${item.id}" style="display: none;" />
                    </label>
                  </div>
                  ${(item.photos && item.photos.length > 0) ? `
                    <div class="carro-photos-container" style="margin-top: 0.25rem;">
                      ${item.photos.map((src, pIdx) => `
                        <div class="carro-thumb-wrapper" style="width: 58px; height: 58px;" data-view-photo="${src}">
                          <img src="${src}" alt="Foto ${item.title || item.name}" class="carro-thumb-img" />
                          <button class="carro-thumb-delete" data-del-shopping-photo="${item.id}" data-photo-idx="${pIdx}" title="Excluir foto">✕</button>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
            <div class="task-actions" style="display: flex; gap: 0.25rem; align-items: center;">
              <button class="btn btn-icon btn-sm" data-edit-shopping="${item.id}" title="Editar Item">✏️</button>
              <button class="btn btn-icon btn-sm" data-delete-shopping="${item.id}" title="Excluir Item">🗑️</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Painel de Análise de Gastos e Mercados Recorrentes
  const analyticsContainer = document.getElementById('market-analytics-container');
  if (analyticsContainer) {
    const analytics = getMarketAnalytics(state);
    if (analytics.count === 0) {
      analyticsContainer.innerHTML = '';
    } else {
      analyticsContainer.innerHTML = `
        <div class="market-analytics-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; flex-wrap: wrap; gap: 0.4rem;">
            <div>
              <strong style="font-size: 0.95rem; color: var(--brand-moss-dark);">📊 Análise de Gastos & Mercados</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Histórico de compras e estabelecimentos mais frequentados</div>
            </div>
            <button type="button" class="btn btn-primary btn-xs" data-open-modal="modal-add-manual-purchase" style="font-weight: 700; background: linear-gradient(135deg, #15803d, #166534);">
              + Lançar Compra
            </button>
          </div>

          <div class="analytics-stats-grid">
            <div class="analytics-stat-box">
              <div class="analytics-stat-label">Total Gasto</div>
              <div class="analytics-stat-value">${formatCurrencyWithSymbol(analytics.total)}</div>
            </div>
            <div class="analytics-stat-box">
              <div class="analytics-stat-label">Ticket Médio</div>
              <div class="analytics-stat-value">${formatCurrencyWithSymbol(analytics.avgTicket)}</div>
            </div>
            <div class="analytics-stat-box">
              <div class="analytics-stat-label">Idas ao Mercado</div>
              <div class="analytics-stat-value">${analytics.count} ${analytics.count === 1 ? 'compra' : 'compras'}</div>
            </div>
          </div>

          ${analytics.recurrentMarkets.length > 0 ? `
            <div style="margin-top: 0.25rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.4rem; text-transform: uppercase;">
                🏪 Mercados Mais Frequentados (Gastos Recorrentes):
              </div>
              <div class="recurrent-markets-container">
                ${analytics.recurrentMarkets.slice(0, 5).map(m => `
                  <div class="market-spend-row">
                    <div class="market-spend-header">
                      <span><strong>🛒 ${m.marketName}</strong> <span style="font-size: 0.72rem; color: var(--text-muted);">(${m.count}x • média ${formatCurrencyWithSymbol(m.avgTicket)})</span></span>
                      <span><strong>${formatCurrencyWithSymbol(m.total)}</strong> <span style="font-size: 0.72rem; color: var(--brand-moss); font-weight: 700;">${m.percentage}%</span></span>
                    </div>
                    <div class="market-spend-bar-bg">
                      <div class="market-spend-bar-fill" style="width: ${m.percentage}%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }
  }

  // Compras de Mercado / Notas Fiscais Separadas por Mês (Layout sem truncar nomes)
  const purchasesContainer = document.getElementById('market-purchases-container');
  if (purchasesContainer) {
    const monthlyGroups = getMarketPurchasesByMonth(state);
    const monthKeys = Object.keys(monthlyGroups).sort().reverse();

    if (monthKeys.length === 0) {
      purchasesContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
          <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">🧾</p>
          <p style="font-weight: 600;">Nenhuma compra de mercado registrada ainda.</p>
          <p style="font-size: 0.8rem; margin-top: 0.25rem;">Toque em "📝 Lançar Compra", escaneie um QR Code ou envie um PDF de cupom fiscal!</p>
        </div>
      `;
    } else {
      purchasesContainer.innerHTML = monthKeys.map(mKey => {
        const group = monthlyGroups[mKey];
        return `
          <div class="month-group-card">
            <div class="month-group-header">
              <span class="month-group-title">📅 ${getMonthLabel(group.monthKey)}</span>
              <span class="month-group-total">${formatCurrencyWithSymbol(group.total)} (${group.count} ${group.count === 1 ? 'compra' : 'compras'})</span>
            </div>
            <div class="month-purchases-list">
              ${group.purchases.map(p => `
                <div class="market-receipt-card" data-purchase-id="${p.id}">
                  <div class="market-receipt-header-row">
                    <div class="market-receipt-title-box">
                      <div class="market-name">🛒 ${p.marketName || 'Supermercado'}</div>
                      <div class="market-meta">
                        <span>📅 ${p.date ? p.date.split('-').reverse().join('/') : 'Data da compra'}</span>
                        ${p.items && p.items.length ? `<span>• <strong>${p.items.length} itens</strong></span>` : ''}
                        ${(p.nfeKey || p.accessKey) ? `<span style="font-size: 0.7rem; color: var(--text-muted);" title="${p.nfeKey || p.accessKey}">Chave: ${(p.nfeKey || p.accessKey).slice(0, 10)}...</span>` : ''}
                      </div>
                    </div>
                    <div class="market-receipt-actions-box">
                      <div class="market-receipt-total-badge">${formatCurrencyWithSymbol(p.total || p.totalAmount || 0)}</div>
                      <button class="btn btn-icon btn-sm" data-edit-purchase="${p.id}" title="Editar Registro de Compra">✏️</button>
                      <button class="btn btn-icon btn-sm" data-delete-purchase="${p.id}" title="Excluir Registro de Compra">🗑️</button>
                    </div>
                  </div>

                  ${p.notes ? `<div style="font-size: 0.78rem; color: var(--text-secondary); background: var(--bg-tertiary); padding: 0.35rem 0.6rem; border-radius: var(--radius-sm);">📝 ${p.notes}</div>` : ''}

                  <!-- Lista Expansível de Produtos Comprados nesta Nota (100% largura, sem truncar nomes) -->
                  ${(p.items && p.items.length > 0) ? `
                    <details class="market-receipt-items-details" style="margin-top: 0.25rem; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; width: 100%;" open>
                      <summary style="font-size: 0.8rem; font-weight: 700; color: var(--brand-moss-dark); cursor: pointer; user-select: none;">
                        📦 ${p.items.length} produtos comprados nesta nota:
                      </summary>
                      <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
                        ${p.items.map(it => `
                          <div class="receipt-product-row">
                            <div class="receipt-product-info">
                              <strong class="receipt-product-name">${it.alias || it.rawName}</strong>
                              <div class="receipt-product-sub">${it.qty} ${it.unit || 'un'} × ${formatCurrencyWithSymbol(it.unitPrice)}</div>
                            </div>
                            <div class="receipt-product-side">
                              <strong class="receipt-product-price">${formatCurrencyWithSymbol(it.totalPrice || it.unitPrice)}</strong>
                              <button type="button" class="btn btn-secondary btn-xs" data-quick-add-receipt-item="${it.code || it.rawName}" style="padding: 0.15rem 0.45rem; font-size: 0.72rem; white-space: nowrap;" title="Colocar na lista de compras do mês">+ Lista</button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </details>
                  ` : ''}

                  <!-- Fotos do Cupom / Comprovante -->
                  <div style="margin-top: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: var(--text-muted); flex-wrap: wrap;">
                      <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin: 0;" title="Bater foto do cupom fiscal ou recibo">
                        📸 Câmera
                        <input type="file" accept="image/*" capture="environment" class="input-purchase-add-photo" data-purchase-id="${p.id}" style="display: none;" />
                      </label>
                      <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin: 0;" title="Escolher foto da galeria">
                        🖼️ Galeria
                        <input type="file" accept="image/*" class="input-purchase-add-photo" data-purchase-id="${p.id}" style="display: none;" />
                      </label>
                    </div>
                    ${(p.photos && p.photos.length > 0) ? `
                      <div class="carro-photos-container" style="margin-top: 0.35rem;">
                        ${p.photos.map((src, pIdx) => `
                          <div class="carro-thumb-wrapper" style="width: 58px; height: 58px;" data-view-photo="${src}">
                            <img src="${src}" alt="Cupom ${p.marketName}" class="carro-thumb-img" />
                            <button class="carro-thumb-delete" data-del-purchase-photo="${p.id}" data-photo-idx="${pIdx}" title="Excluir foto">✕</button>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

export function renderGamificationTab(state) {
  // Gamificação removida a pedido do casal
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 7: AJUSTES & GOOGLE SHEETS
// -------------------------------------------------------------
export function renderSettingsTab(state) {
  const urlInput = document.getElementById('settings-sheets-url');
  const tokenInput = document.getElementById('settings-sheets-token');
  const autoSyncCheck = document.getElementById('settings-autosync-toggle');
  const soundCheck = document.getElementById('settings-sound-toggle');
  const user1Name = document.getElementById('settings-user1-name');
  const user2Name = document.getElementById('settings-user2-name');

  if (urlInput) urlInput.value = state.settings.sheetsUrl || '';
  if (tokenInput) tokenInput.value = state.settings.sheetsToken || '';
  if (autoSyncCheck) autoSyncCheck.checked = !!state.settings.autoSync;
  if (soundCheck) soundCheck.checked = !!state.settings.soundEnabled;
  if (user1Name) user1Name.value = state.users.user1.name || 'Matheus';
  if (user2Name) user2Name.value = state.users.user2.name || 'Scarlet';

  const lastSyncEl = document.getElementById('settings-last-sync-label');
  if (lastSyncEl) {
    if (state.settings.lastSyncTimestamp) {
      const dt = new Date(state.settings.lastSyncTimestamp);
      lastSyncEl.textContent = `Último backup em: ${dt.toLocaleString('pt-BR')}`;
    } else {
      lastSyncEl.textContent = 'Nenhum backup realizado ainda nesta sessão.';
    }
  }

  // Morador Autenticado na Sessão
  const sessionUserEl = document.getElementById('auth-session-user-display');
  if (sessionUserEl) {
    const raw = localStorage.getItem('MARACAJU_AUTH_USER_v1') || localStorage.getItem('MARACAJU88_AUTH_USER_v1');
    if (raw) {
      try {
        const session = JSON.parse(raw);
        sessionUserEl.innerHTML = `
          <span>${session.avatarEmoji || '👤'}</span>
          <span>${session.name}</span>
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: normal;">(${session.email})</span>
        `;
      } catch (e) {
        sessionUserEl.textContent = 'Sessão ativa';
      }
    } else {
      sessionUserEl.textContent = 'Nenhuma sessão conectada';
    }
  }

  // Biometria do Celular
  const biometricsToggle = document.getElementById('settings-biometrics-toggle');
  if (biometricsToggle) {
    biometricsToggle.checked = isBiometricsEnabled();
    if (!isBiometricsSupported()) {
      biometricsToggle.disabled = true;
      if (biometricsToggle.parentElement) {
        biometricsToggle.parentElement.title = 'Biometria não suportada ou não disponível neste navegador/dispositivo';
      }
    }
  }

  // Renderiza Gerenciador de Categorias em Ajustes
  renderCategoriesManager(state, 'tarefas');
}

// -------------------------------------------------------------
// GESTOR DE CATEGORIAS & EMOJIS (Ajustes & Modais)
// -------------------------------------------------------------
export function populateCategorySelects(state) {
  const taskSelect = document.getElementById('task-input-room');
  if (taskSelect) {
    const cats = getCategories(state, 'tarefas');
    const curVal = taskSelect.value;
    taskSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) taskSelect.value = curVal;
  }

  const taskEditSelect = document.getElementById('task-edit-room');
  if (taskEditSelect) {
    const cats = getCategories(state, 'tarefas');
    const curVal = taskEditSelect.value;
    taskEditSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) taskEditSelect.value = curVal;
  }

  const shoppingSelect = document.getElementById('shopping-input-category');
  if (shoppingSelect) {
    const cats = getCategories(state, 'compras');
    const curVal = shoppingSelect.value;
    shoppingSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) shoppingSelect.value = curVal;
  }

  const shoppingEditSelect = document.getElementById('shopping-edit-category');
  if (shoppingEditSelect) {
    const cats = getCategories(state, 'compras');
    const curVal = shoppingEditSelect.value;
    shoppingEditSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) shoppingEditSelect.value = curVal;
  }

  const carroSelect = document.getElementById('carro-input-category');
  if (carroSelect) {
    const cats = getCategories(state, 'carro');
    const curVal = carroSelect.value;
    carroSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) carroSelect.value = curVal;
  }

  const carroEditSelect = document.getElementById('carro-edit-category');
  if (carroEditSelect) {
    const cats = getCategories(state, 'carro');
    const curVal = carroEditSelect.value;
    carroEditSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) carroEditSelect.value = curVal;
  }

  const reformaSelect = document.getElementById('reforma-input-room');
  if (reformaSelect) {
    const cats = getCategories(state, 'reformas');
    const curVal = reformaSelect.value;
    reformaSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) reformaSelect.value = curVal;
  }

  const reformaEditSelect = document.getElementById('reforma-edit-room');
  if (reformaEditSelect) {
    const cats = getCategories(state, 'reformas');
    const curVal = reformaEditSelect.value;
    reformaEditSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) reformaEditSelect.value = curVal;
  }

  const sonhoSelect = document.getElementById('sonho-input-category');
  if (sonhoSelect) {
    const cats = getCategories(state, 'sonhos');
    const curVal = sonhoSelect.value;
    sonhoSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) sonhoSelect.value = curVal;
  }

  const sonhoEditSelect = document.getElementById('sonho-edit-category');
  if (sonhoEditSelect) {
    const cats = getCategories(state, 'sonhos');
    const curVal = sonhoEditSelect.value;
    sonhoEditSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
    if (curVal && cats.some(c => c.id === curVal)) sonhoEditSelect.value = curVal;
  }
}

export function renderCategoriesManager(state, activeModule = 'tarefas') {
  const container = document.getElementById('categories-list-container');
  if (!container) return;

  const cats = getCategories(state, activeModule);
  if (cats.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 1.25rem 0.5rem; font-size: 0.85rem;">
        Nenhuma categoria cadastrada para este módulo. Toque em "+ Nova Categoria" para criar!
      </div>
    `;
    return;
  }

  container.innerHTML = cats.map(cat => `
    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.65rem 0.85rem; gap: 0.5rem;">
      <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
        <span style="font-size: 1.45rem; line-height: 1;">${cat.icon}</span>
        <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${cat.label}</span>
      </div>
      <div style="display: flex; gap: 0.4rem; flex-shrink: 0;">
        <button type="button" class="btn btn-secondary btn-sm" data-action-edit-cat="${cat.id}" data-cat-module="${activeModule}" title="Editar Categoria" style="padding: 0.35rem 0.6rem;">
          ✏️
        </button>
        <button type="button" class="btn btn-secondary btn-sm" data-action-delete-cat="${cat.id}" data-cat-module="${activeModule}" title="Excluir Categoria" style="padding: 0.35rem 0.6rem; color: var(--brand-rose); border-color: rgba(244, 63, 94, 0.3);">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

export function renderQuickEmojis() {
  const grid = document.getElementById('quick-emoji-grid');
  if (!grid) return;

  grid.innerHTML = QUICK_EMOJIS_LIST.map(emoji => `
    <button type="button" class="btn-quick-emoji" data-emoji="${emoji}" style="font-size: 1.35rem; padding: 0.3rem 0.45rem; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer; line-height: 1; transition: transform 0.1s ease;">
      ${emoji}
    </button>
  `).join('');
}

// -------------------------------------------------------------
// CATÁLOGO DE PRODUTOS & HISTÓRICO COMPARATIVO DE PREÇOS
// -------------------------------------------------------------


export function updateRecurrentMarketsDatalist(state) {
  const datalist = document.getElementById('recurrent-markets-datalist');
  if (!datalist) return;

  const defaultMarkets = [
    'Carrefour',
    'Atacadão',
    'Pão de Açúcar',
    'Assaí Atacadista',
    'Açougue Central',
    'Feira Livre',
    'Hortifruti',
    'Padaria',
    'Farmácia',
    'Swift'
  ];

  const analytics = getMarketAnalytics(state);
  const recordedMarkets = analytics.uniqueMarketsList || [];
  const combined = Array.from(new Set([...recordedMarkets, ...defaultMarkets]));

  datalist.innerHTML = combined.map(m => `<option value="${m}"></option>`).join('');
}

export function updateCatalogDatalist(state) {
  const datalist = document.getElementById('catalog-suggestions-list');
  if (!datalist) return;

  const catalog = ensureCatalog(state);
  datalist.innerHTML = catalog.map(p => {
    const alias = p.alias || p.rawName;
    const priceText = p.lastPrice ? ` - R$ ${formatCurrency(p.lastPrice)}` : '';
    return `<option value="${alias}">${alias}${priceText} (${p.lastMarket || 'Mercado'})</option>`;
  }).join('');
}

export function renderCatalogModal(state, query = '', categoryFilter = 'todos', mode = 'comparator', sortOption = 'economy') {
  const container = document.getElementById('catalog-products-container');
  const chipsContainer = document.getElementById('catalog-category-chips');
  const headingEl = document.getElementById('catalog-modal-heading');
  const sortPillsEl = document.getElementById('catalog-sort-pills');
  if (!container) return;

  // Atualiza título do modal e visibilidade dos botões de ordenação
  if (headingEl) {
    headingEl.textContent = mode === 'comparator'
      ? '📊 Comparador de Preços (Onde é mais barato?)'
      : '✨ Catálogo Geral (+ Lista de Compras)';
  }
  if (sortPillsEl) {
    sortPillsEl.style.display = mode === 'comparator' ? 'flex' : 'none';
  }

  // Atualiza pílulas de modo
  document.querySelectorAll('[data-catalog-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-catalog-mode') === mode);
  });

  // Atualiza pílulas de ordenação
  document.querySelectorAll('[data-catalog-sort]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-catalog-sort') === sortOption);
  });

  // Chips de categoria no catálogo
  if (chipsContainer) {
    const cats = getCategories(state, 'compras');
    const allChips = [
      { id: 'todos', label: 'Todos os Produtos', icon: '🛒' },
      ...cats
    ];
    chipsContainer.innerHTML = allChips.map(c => `
      <button class="chip ${c.id === categoryFilter ? 'active' : ''}" data-catalog-cat="${c.id}">
        <span>${c.icon}</span>
        <span>${c.label}</span>
      </button>
    `).join('');
  }

  let products = searchCatalogProducts(state, query, categoryFilter);

  if (products.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg);">
        <p style="font-size: 2.2rem; margin-bottom: 0.5rem;">✨</p>
        <p style="font-weight: 700; color: var(--text-primary);">Nenhum produto encontrado.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">
          Lance compras ou suba notas fiscais em PDF para que o app memorize os produtos e compare os preços automaticamente!
        </p>
      </div>
    `;
    return;
  }

  // Ordenação inteligente
  products = [...products].sort((a, b) => {
    const compA = getProductPriceComparison(a) || {};
    const compB = getProductPriceComparison(b) || {};

    if (sortOption === 'economy') {
      const diffA = (compA.maxPrice && compA.minPrice) ? (compA.maxPrice - compA.minPrice) : 0;
      const diffB = (compB.maxPrice && compB.minPrice) ? (compB.maxPrice - compB.minPrice) : 0;
      if (diffB !== diffA) return diffB - diffA;
      return (b.timesBought || 0) - (a.timesBought || 0);
    }
    if (sortOption === 'lowest') {
      const minA = compA.minPrice || compA.lastPrice || 999999;
      const minB = compB.minPrice || compB.lastPrice || 999999;
      return minA - minB;
    }
    if (sortOption === 'bought') {
      return (b.timesBought || 0) - (a.timesBought || 0);
    }
    if (sortOption === 'alpha') {
      return (a.alias || a.rawName || '').localeCompare(b.alias || b.rawName || '');
    }
    return 0;
  });

  // MODO 1: COMPARADOR DE PREÇOS DEDICADO
  if (mode === 'comparator') {
    container.innerHTML = products.map(prod => {
      const catObj = findCategory(state, 'compras', prod.category);
      const comp = getProductPriceComparison(prod);
      const thumbSrc = (prod.photos && prod.photos.length > 0) ? prod.photos[0] : null;

      const hasHistory = comp && comp.totalPurchases > 1 && comp.minPrice > 0;
      const priceDiff = (comp && comp.maxPrice > comp.minPrice) ? Math.round((comp.maxPrice - comp.minPrice) * 100) / 100 : 0;
      const economyPercent = (comp && comp.maxPrice > 0 && priceDiff > 0) ? Math.round((priceDiff / comp.maxPrice) * 100) : 0;

      return `
        <div class="comparator-card" data-catalog-id="${prod.id}">
          <div class="comparator-card-top">
            <div style="display: flex; gap: 0.65rem; align-items: flex-start; flex: 1; min-width: 0;">
              ${thumbSrc ? `
                <img src="${thumbSrc}" alt="${prod.alias}" class="product-photo-preview-sm" data-view-photo="${thumbSrc}" />
              ` : `
                <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(46, 89, 51, 0.08); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">
                  ${catObj.icon}
                </div>
              `}
              <div style="flex: 1; min-width: 0;">
                <strong style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.3; display: block; word-break: break-word;">${prod.alias || prod.rawName}</strong>
                <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; margin-top: 0.2rem;">
                  <span class="tag-room">${catObj.icon} ${catObj.label}</span>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">Comprado ${prod.timesBought || 1}x</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-sm" data-add-catalog-to-list="${prod.id}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 700; white-space: nowrap;">
              + Lista
            </button>
          </div>

          <!-- Grade Comparativa de Preços e Mercados -->
          <div class="comparator-price-grid">
            <div style="border-right: 1px solid var(--border-subtle); padding-right: 0.5rem;">
              <span style="font-size: 0.68rem; color: #16a34a; font-weight: 700; text-transform: uppercase; display: block;">★ Menor Preço Encontrado</span>
              <strong style="font-size: 1.05rem; color: #16a34a;">${formatCurrencyWithSymbol(comp ? comp.minPrice : prod.lastPrice)}</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 1px;">no <strong>${(comp && comp.minMarket) || prod.lastMarket || 'Supermercado'}</strong></div>
            </div>
            <div style="padding-left: 0.25rem;">
              <span style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: block;">Último Preço Pago</span>
              <strong style="font-size: 1.05rem; color: var(--brand-moss-dark);">${formatCurrencyWithSymbol(prod.lastPrice || 0)}</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 1px;">no <strong>${prod.lastMarket || 'Supermercado'}</strong></div>
            </div>
          </div>

          <!-- Destaque de Economia ou Histórico -->
          ${priceDiff > 0 ? `
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
              <span class="economy-pill">
                💰 Economia de até ${formatCurrencyWithSymbol(priceDiff)} (-${economyPercent}%) comprando no ${comp.minMarket}!
              </span>
            </div>
          ` : (hasHistory ? `
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Preço estável entre compras (Média: ${formatCurrencyWithSymbol(comp.avgPrice)})
            </div>
          ` : '')}

          <!-- Botão para Ver Todos os Mercados onde foi comprado -->
          <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 0.15rem; gap: 0.4rem;">
            <button type="button" class="btn btn-secondary btn-xs" data-view-product-history="${prod.id}" style="padding: 0.2rem 0.55rem; font-size: 0.72rem; font-weight: 600;">
              📊 Ver Todas as ${comp ? comp.totalPurchases : 1} Compras deste Produto
            </button>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  // MODO 2: CATÁLOGO GERAL & APELIDOS
  container.innerHTML = products.map(prod => {
    const catObj = findCategory(state, 'compras', prod.category);
    const comp = getProductPriceComparison(prod);
    const thumbSrc = (prod.photos && prod.photos.length > 0) ? prod.photos[0] : null;

    let variationBadge = '';
    if (comp && comp.previousPrice && comp.priceDiffPercent !== 0) {
      const isCheaper = comp.priceDiff < 0;
      variationBadge = `
        <span class="price-compare-badge ${isCheaper ? 'cheaper' : 'expensive'}" title="Comparado à compra anterior (${formatCurrencyWithSymbol(comp.previousPrice)})">
          ${isCheaper ? '↓' : '↑'} ${Math.abs(comp.priceDiffPercent)}%
        </span>
      `;
    }

    return `
      <div class="catalog-card" data-catalog-id="${prod.id}">
        <div class="catalog-card-header">
          <div style="display: flex; gap: 0.65rem; align-items: flex-start; flex: 1;">
            ${thumbSrc ? `
              <img src="${thumbSrc}" alt="${prod.alias}" class="product-photo-preview-sm" data-view-photo="${thumbSrc}" />
            ` : `
              <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(46, 89, 51, 0.08); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;">
                ${catObj.icon}
              </div>
            `}
            <div style="flex: 1; min-width: 0;">
              <div class="catalog-product-title">
                <span>${prod.alias || prod.rawName}</span>
              </div>
              ${prod.rawName && prod.rawName !== prod.alias ? `
                <div class="pdf-raw-name" title="Nome original no cupom fiscal">${prod.rawName} ${prod.code ? `(${prod.code})` : ''}</div>
              ` : ''}
              <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; margin-top: 0.25rem;">
                <span class="tag-room">${catObj.icon} ${catObj.label}</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);">Comprado ${prod.timesBought || 1}x</span>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-add-catalog-to-list="${prod.id}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; font-weight: 700; white-space: nowrap;">
            + Adicionar
          </button>
        </div>

        <!-- Linha Comparativa de Preços -->
        <div style="background: var(--bg-primary); border-radius: var(--radius-sm); padding: 0.45rem 0.65rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; font-size: 0.78rem;">
          <div>
            <span style="color: var(--text-muted); font-size: 0.7rem;">Último preço:</span>
            <strong style="color: var(--brand-moss-dark); font-size: 0.85rem;">${formatCurrencyWithSymbol(prod.lastPrice || 0)}</strong>
            <span style="color: var(--text-muted); font-size: 0.68rem;">(${prod.lastMarket || 'Mercado'})</span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.35rem;">
            ${comp && comp.minPrice > 0 ? `
              <span class="price-compare-badge stable" title="Menor preço já registrado">
                Menor: ${formatCurrencyWithSymbol(comp.minPrice)}
              </span>
            ` : ''}
            ${variationBadge}
          </div>
        </div>

        <!-- Ações do Produto (Fotos, Apelidar e Histórico) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.15rem; gap: 0.5rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Bater foto da embalagem com a câmera">
              📸 Foto
              <input type="file" accept="image/*" capture="environment" class="input-catalog-add-photo" data-catalog-id="${prod.id}" style="display: none;" />
            </label>
            <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Escolher da galeria">
              🖼️ Galeria
              <input type="file" accept="image/*" class="input-catalog-add-photo" data-catalog-id="${prod.id}" style="display: none;" />
            </label>
          </div>

          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-secondary btn-xs" data-edit-catalog-alias="${prod.id}" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;">
              ✏️ Apelidar
            </button>
            <button type="button" class="btn btn-secondary btn-xs" data-view-product-history="${prod.id}" style="padding: 0.15rem 0.45rem; font-size: 0.7rem;">
              📊 Histórico
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function renderProductHistoryModal(state, catalogId) {
  const prod = (state.catalog || []).find(p => p.id === catalogId);
  if (!prod) return;

  const titleEl = document.getElementById('product-history-title');
  const rawNameEl = document.getElementById('product-history-rawname');
  const summaryBox = document.getElementById('product-history-summary-box');
  const recordsList = document.getElementById('product-history-records-list');
  const btnAdd = document.getElementById('btn-add-to-list-from-history');

  if (titleEl) titleEl.textContent = `📊 ${prod.alias || prod.rawName}`;
  if (rawNameEl) rawNameEl.textContent = prod.rawName ? `Nota fiscal: ${prod.rawName} ${prod.code ? `(${prod.code})` : ''}` : '';
  if (btnAdd) btnAdd.setAttribute('data-add-catalog-to-list', prod.id);

  const comp = getProductPriceComparison(prod);
  if (summaryBox && comp) {
    summaryBox.innerHTML = `
      <div style="background: rgba(46, 89, 51, 0.08); border: 1px solid rgba(46, 89, 51, 0.2); border-radius: var(--radius-md); padding: 0.75rem 0.85rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center;">
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Último Preço</span>
          <strong style="font-size: 0.95rem; color: var(--brand-moss-dark);">${formatCurrencyWithSymbol(comp.lastPrice)}</strong>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Menor Preço</span>
          <strong style="font-size: 0.95rem; color: #16a34a;">${formatCurrencyWithSymbol(comp.minPrice)}</strong>
        </div>
        <div>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Preço Médio</span>
          <strong style="font-size: 0.95rem; color: var(--text-primary);">${formatCurrencyWithSymbol(comp.avgPrice)}</strong>
        </div>
      </div>
    `;
  }

  if (recordsList && comp) {
    if (comp.history.length === 0) {
      recordsList.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 1rem;">Nenhum registro detalhado ainda.</p>`;
    } else {
      recordsList.innerHTML = comp.history.map((h, idx) => {
        const isLowest = h.unitPrice === comp.minPrice;
        return `
          <div style="background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.82rem; color: var(--text-primary);">${h.market || 'Supermercado'}</strong>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Data: ${h.date ? h.date.split('-').reverse().join('/') : '-'} | Qtd: ${h.qty || '1'}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.9rem; font-weight: 800; color: ${isLowest ? '#16a34a' : 'var(--text-primary)'};">${formatCurrencyWithSymbol(h.unitPrice)}</span>
              ${isLowest ? '<span style="display: block; font-size: 0.65rem; color: #16a34a; font-weight: 700;">★ Menor Preço</span>' : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

export function renderPdfInvoiceConfirmation(state, invoiceData) {
  const container = document.getElementById('pdf-extracted-items-list');
  const marketInput = document.getElementById('pdf-invoice-market-name');
  const totalDisplay = document.getElementById('pdf-invoice-total-display');
  const headerMeta = document.getElementById('pdf-invoice-header-meta');
  if (!container) return;

  if (marketInput) marketInput.value = invoiceData.marketName || 'Supermercado';
  if (totalDisplay) totalDisplay.textContent = formatCurrencyWithSymbol(invoiceData.total || 0);

  const formattedDate = invoiceData.date ? invoiceData.date.split('-').reverse().join('/') : 'Hoje';
  if (headerMeta) {
    headerMeta.textContent = `Data: ${formattedDate} • ${invoiceData.items.length} itens identificados no cupom fiscal`;
  }

  const userCats = getCategories(state, 'compras');

  container.innerHTML = invoiceData.items.map((item, idx) => {
    return `
      <div class="pdf-item-card" data-pdf-item-idx="${idx}">
        <div class="pdf-item-header">
          <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; cursor: pointer; flex: 1;">
            <input type="checkbox" class="pdf-item-include" data-idx="${idx}" checked />
            <span style="color: var(--text-primary);">Item #${idx + 1}</span>
          </label>
          <span style="font-weight: 800; color: var(--brand-moss-dark); font-size: 0.95rem;">
            ${formatCurrencyWithSymbol(item.totalPrice || item.unitPrice)}
          </span>
        </div>

        <div class="pdf-raw-name">
          Nota: ${item.rawName} ${item.code ? `[Cód: ${item.code}]` : ''}
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 2px;">Apelido Popular (como você chama):</label>
            <input type="text" class="form-control pdf-item-alias" data-idx="${idx}" value="${item.alias || item.rawName}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; font-weight: 600;" />
          </div>

          <div>
            <label style="font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 2px;">Categoria:</label>
            <select class="form-control pdf-item-category" data-idx="${idx}" style="padding: 0.35rem 0.5rem; font-size: 0.82rem;">
              ${userCats.map(c => `
                <option value="${c.id}" ${c.id === item.category ? 'selected' : ''}>${c.icon} ${c.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="pdf-item-meta" style="justify-content: space-between;">
          <span>Qtd: <strong>${item.qty} ${item.unit || 'un'}</strong> × ${formatCurrencyWithSymbol(item.unitPrice)}</span>

          <!-- Fotos do Produto -->
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Bater foto do produto com a câmera">
              📸 Foto
              <input type="file" accept="image/*" capture="environment" class="input-pdf-item-photo" data-idx="${idx}" style="display: none;" />
            </label>
            <label class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; cursor: pointer; margin: 0;" title="Escolher da galeria">
              🖼️ Galeria
              <input type="file" accept="image/*" class="input-pdf-item-photo" data-idx="${idx}" style="display: none;" />
            </label>
            <span id="pdf-photo-indicator-${idx}" style="display: ${(item.photos && item.photos.length > 0) ? 'inline' : 'none'}; font-size: 0.75rem;">📷✓</span>
          </div>
        </div>

        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-secondary); cursor: pointer; margin-top: 0.2rem;">
          <input type="checkbox" class="pdf-item-add-to-list" data-idx="${idx}" />
          <span>Colocar também na <strong>Lista de Compras do Mês</strong> (para comprar de novo)</span>
        </label>
      </div>
    `;
  }).join('');
}
