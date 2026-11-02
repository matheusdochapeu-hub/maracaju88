// ============================================================
//  MARACAJU 88 - INTERFACE, RENDERIZAÇÃO & MODAIS
// ============================================================

import { ROOMS, EFFORT_LEVELS, BADGES, FREQUENCIES, CARRO_CATEGORIES } from './config.js';
import { getCoupleTotalXp, getCurrentLevel } from './gamification.js';
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
        ctx.ellipse(p.x, p.y, p.r, p.r * Math.sin(p.tilt), p.tilt, 0, Math.PI * 2);
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
// RENDERIZAÇÃO DO CABEÇALHO & PLACAR RÁPIDO
// -------------------------------------------------------------
export function renderHeaderStats(state) {
  const totalXp = getCoupleTotalXp(state);
  const lvl = getCurrentLevel(totalXp);
  const streak = state.gamification.streak || 0;

  // Streak Pill
  const streakEl = document.getElementById('header-streak-count');
  if (streakEl) streakEl.textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;

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
  const totalXp = getCoupleTotalXp(state);
  const lvl = getCurrentLevel(totalXp);

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
          <span class="level-badge">${lvl.icon} Nível ${lvl.level}: ${lvl.title}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--brand-teal);">
          +${currentProg.xpEarned} XP conquistados
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

  // Chips de Cômodos
  const chipsContainer = document.getElementById('room-chips-container');
  if (chipsContainer) {
    chipsContainer.innerHTML = ROOMS.map(r => `
      <button class="chip ${r.id === selectedRoom ? 'active' : ''}" data-room="${r.id}">
        <span>${r.icon}</span>
        <span>${r.label}</span>
      </button>
    `).join('');
  }

  // Lista de Tarefas Filtrada por Frequência E Cômodo
  const taskListEl = document.getElementById('tasks-list');
  if (!taskListEl) return;

  let tasksToDisplay = (state.tasks || []).filter(t => (t.frequency || 'diaria') === selectedFrequency);

  if (selectedRoom !== 'tudo') {
    tasksToDisplay = tasksToDisplay.filter(t => t.room === selectedRoom);
  }

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

  taskListEl.innerHTML = tasksToDisplay.map(task => {
    const isDone = isTaskDoneOnDate(state, task.id, todayStr);
    const historyEntry = getTaskHistoryEntry(state, task.id, todayStr);
    const effort = EFFORT_LEVELS[task.effort] || EFFORT_LEVELS.media;
    const room = ROOMS.find(r => r.id === task.room) || { label: task.room, icon: '🏠' };
    const curFreqObj = FREQUENCIES.find(f => f.id === task.frequency) || FREQUENCIES[0];

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
              <span class="tag-room">${room.icon} ${room.label}</span>
              <span class="tag-xp">+${task.xp || effort.xp} XP</span>
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
          <button class="btn btn-icon btn-sm" data-delete-task="${task.id}" title="Excluir tarefa">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
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
          <strong>${historyData.userStats.matheus.count} tarefas (${historyData.userStats.matheus.xp} XP)</strong>
        </div>
        <div style="background: var(--bg-secondary); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <span style="color: var(--text-muted);">👩‍💼 ${state.users.user2.name}:</span>
          <strong>${(historyData.userStats.scarlet || historyData.userStats.esposa || {count: 0}).count} tarefas (${(historyData.userStats.scarlet || historyData.userStats.esposa || {xp: 0}).xp} XP)</strong>
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
        <span class="tag-xp">+${entry.xp} XP</span>
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
    const catObj = CARRO_CATEGORIES.find(c => c.id === item.category) || { label: item.category, icon: '🚗' };
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
              <label class="btn btn-secondary btn-sm" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0;">
                + Foto
                <input type="file" accept="image/*" capture="environment" class="input-carro-add-photo" data-car-id="${item.id}" style="display: none;" />
              </label>
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
            <button class="btn btn-secondary btn-sm" data-edit-carro-status="${item.id}">Alterar Status</button>
            <button class="btn btn-icon btn-sm" data-delete-carro="${item.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 4: REFORMAS & MELHORIAS
// -------------------------------------------------------------
export function renderReformasTab(state, statusFilter = 'todas') {
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

  const gridEl = document.getElementById('reformas-grid');
  if (!gridEl) return;

  const list = statusFilter === 'todas'
    ? state.reformas
    : state.reformas.filter(r => r.status === statusFilter);

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
    const doneChecks = checklist.filter(c => c.done).length;
    const checkPercent = checklist.length > 0 ? Math.round((doneChecks / checklist.length) * 100) : 0;

    return `
      <div class="project-card" data-reforma-id="${ref.id}">
        <div>
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="project-status-badge status-${ref.status}">${ref.status}</span>
            <span class="tag-room">🏠 ${ref.room}</span>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.4rem;">${ref.title}</h3>
          ${ref.description ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${ref.description}</p>` : ''}
          
          <div style="background: var(--bg-secondary); padding: 0.6rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.8rem; display: flex; justify-content: space-between;">
            <div>
              <span style="color: var(--text-muted);">Estimado:</span>
              <strong>R$ ${ref.estimatedCost.toLocaleString('pt-BR')}</strong>
            </div>
            <div>
              <span style="color: var(--text-muted);">Gasto:</span>
              <strong style="color: var(--success);">R$ ${ref.actualCost.toLocaleString('pt-BR')}</strong>
            </div>
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
            <button class="btn btn-secondary btn-sm" data-edit-reforma-status="${ref.id}">Alterar Status</button>
            <button class="btn btn-icon btn-sm" data-delete-reforma="${ref.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 5: MURAL DOS SONHOS & METAS
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

  const gridEl = document.getElementById('sonhos-grid');
  if (!gridEl) return;

  const list = categoryFilter === 'todas'
    ? state.sonhos
    : state.sonhos.filter(s => s.category === categoryFilter);

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

    let catIcon = '✨';
    if (sonho.category === 'viagem') catIcon = '✈️';
    if (sonho.category === 'casa') catIcon = '🏡';
    if (sonho.category === 'bens') catIcon = '🚗';
    if (sonho.category === 'experiencia') catIcon = '💖';

    return `
      <div class="project-card" data-sonho-id="${sonho.id}">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="project-status-badge status-andamento">${sonho.status}</span>
            <span class="tag-room">${catIcon} ${sonho.category}</span>
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
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.5rem;">
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            ${sonho.targetDate ? `🎯 Prazo: ${sonho.targetDate}` : ''}
          </div>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary btn-sm" data-edit-sonho-status="${sonho.id}">Status</button>
            <button class="btn btn-icon btn-sm" data-delete-sonho="${sonho.id}">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// -------------------------------------------------------------
// RENDERIZAÇÃO DA ABA 6: CONQUISTAS & PLACAR DO CASAL
// -------------------------------------------------------------
export function renderGamificationTab(state) {
  const totalXp = getCoupleTotalXp(state);
  const lvl = getCurrentLevel(totalXp);
  const u1 = state.users.user1;
  const u2 = state.users.user2;

  const totalUserXp = (u1.xp || 0) + (u2.xp || 0);
  const u1Percent = totalUserXp > 0 ? Math.round(((u1.xp || 0) / totalUserXp) * 100) : 50;
  const u2Percent = 100 - u1Percent;

  const scoreboard = document.getElementById('gamification-scoreboard');
  if (scoreboard) {
    scoreboard.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">${lvl.icon}</div>
        <h2 style="font-size: 1.4rem; font-weight: 800;">Nível ${lvl.level}: ${lvl.title}</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${totalXp} XP acumulados no Maracaju 88</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.35rem;">
          <span>Progresso para ${lvl.nextTitle ? `Nível ${lvl.level + 1} (${lvl.nextTitle})` : 'Nível Máximo!'}</span>
          <span>${lvl.progressPercent}%</span>
        </div>
        <div class="progress-container" style="height: 12px;">
          <div class="progress-bar gold" style="width: ${lvl.progressPercent}%"></div>
        </div>
        ${lvl.xpNeeded > 0 ? `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: right; margin-top: 0.25rem;">Faltam ${lvl.xpNeeded} XP</div>` : ''}
      </div>

      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <h3 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;">Divisão de XP do Casal</h3>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <div>${u1.avatarEmoji} <strong>${u1.name}</strong>: ${u1.xp || 0} XP (${u1Percent}%)</div>
          <div>${u2.avatarEmoji} <strong>${u2.name}</strong>: ${u2.xp || 0} XP (${u2Percent}%)</div>
        </div>
        <div class="progress-container" style="height: 10px; display: flex;">
          <div style="height: 100%; width: ${u1Percent}%; background: var(--brand-teal);"></div>
          <div style="height: 100%; width: ${u2Percent}%; background: var(--brand-rose);"></div>
        </div>
      </div>
    `;
  }

  const badgesGrid = document.getElementById('gamification-badges-grid');
  if (!badgesGrid) return;

  const unlockedSet = new Set(state.gamification.unlockedBadges || []);

  badgesGrid.innerHTML = BADGES.map(b => {
    const isUnlocked = unlockedSet.has(b.id);
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" title="${b.desc}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        <span class="badge-desc">${b.desc}</span>
        <span style="font-size: 0.65rem; font-weight: 800; color: ${isUnlocked ? 'var(--brand-amber)' : 'var(--text-muted)'}; margin-top: 0.2rem;">
          ${isUnlocked ? '✨ DESBLOQUEADA' : '🔒 BLOQUEADA'}
        </span>
      </div>
    `;
  }).join('');
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
    const raw = localStorage.getItem('MARACAJU88_AUTH_USER_v1');
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
}
