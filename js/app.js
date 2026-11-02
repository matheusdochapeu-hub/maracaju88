// ============================================================
//  MARACAJU 88 - APP CONTROLLER PRINCIPAL
// ============================================================

import { loadState, saveState, exportBackupJson, importBackupJson } from './storage.js';
import { playTaskCompleteSound, playLevelUpSound, playSubtleClick } from './audio.js';
import { toggleTaskDone, addTask, deleteTask, getLocalDateString } from './tasks.js';
import { addReforma, deleteReforma, toggleReformaChecklistItem, updateReforma } from './reformas.js';
import { addSonho, deleteSonho, toggleSonhoMilestone, updateSonho } from './sonhos.js';
import { testSheetsConnection, backupToSheets, restoreFromSheets } from './sheets.js';
import {
  triggerConfetti,
  showToast,
  renderHeaderStats,
  renderTasksTab,
  renderHistoryTab,
  renderReformasTab,
  renderSonhosTab,
  renderGamificationTab,
  renderSettingsTab
} from './ui.js';

// Estado global em memória
let state = null;
let currentTab = 'tarefas';
let currentRoomFilter = 'tudo';
let currentHistoryDate = getLocalDateString();
let currentReformasFilter = 'todas';
let currentSonhosFilter = 'todas';

// -------------------------------------------------------------
// INICIALIZAÇÃO DO APP
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  state = loadState();

  initServiceWorker();
  initNavigation();
  initHeaderControls();
  initTasksModule();
  initHistoryModule();
  initReformasModule();
  initSonhosModule();
  initSettingsModule();
  initModals();

  refreshAllUI();
});

function refreshAllUI() {
  renderHeaderStats(state);

  if (currentTab === 'tarefas') {
    renderTasksTab(state, currentRoomFilter);
  } else if (currentTab === 'historico') {
    renderHistoryTab(state, currentHistoryDate);
  } else if (currentTab === 'reformas') {
    renderReformasTab(state, currentReformasFilter);
  } else if (currentTab === 'sonhos') {
    renderSonhosTab(state, currentSonhosFilter);
  } else if (currentTab === 'gamificacao') {
    renderGamificationTab(state);
  } else if (currentTab === 'ajustes') {
    renderSettingsTab(state);
  }
}

// -------------------------------------------------------------
// PWA SERVICE WORKER REGISTRATION
// -------------------------------------------------------------
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[Maracaju 88] Service Worker registrado:', reg.scope);
        })
        .catch(err => {
          console.warn('[Maracaju 88] Falha no Service Worker:', err);
        });
    });
  }
}

// -------------------------------------------------------------
// NAVEGAÇÃO ENTRE ABAS
// -------------------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      if (!targetTab) return;

      playSubtleClick(state.settings.soundEnabled);

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) activeContent.classList.add('active');

      currentTab = targetTab;
      refreshAllUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// -------------------------------------------------------------
// CONTROLES DO CABEÇALHO (Perfil Ativo: Matheus / Esposa)
// -------------------------------------------------------------
function initHeaderControls() {
  const userBtn = document.getElementById('active-user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      state.activeUserId = state.activeUserId === 'matheus' ? 'esposa' : 'matheus';
      saveState(state);
      playSubtleClick(state.settings.soundEnabled);

      const activeName = state.activeUserId === 'esposa' ? state.users.user2.name : state.users.user1.name;
      showToast(`Perfil ativo: ${activeName}`, 'info', 1800);
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE TAREFAS DIÁRIAS (GAMIFICAÇÃO)
// -------------------------------------------------------------
function initTasksModule() {
  // Filtro de Cômodos (Chips)
  const chipsContainer = document.getElementById('room-chips-container');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      currentRoomFilter = chip.getAttribute('data-room') || 'tudo';
      playSubtleClick(state.settings.soundEnabled);
      renderTasksTab(state, currentRoomFilter);
    });
  }

  // Interação na Lista de Tarefas (Checkbox, Quem Fez, Deletar)
  const taskListEl = document.getElementById('tasks-list');
  if (taskListEl) {
    taskListEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('task-checkbox')) {
        const taskId = e.target.getAttribute('data-id');
        const todayStr = getLocalDateString();
        const res = toggleTaskDone(state, taskId, todayStr);

        if (res && res.status === 'completed') {
          playTaskCompleteSound(state.settings.soundEnabled);
          triggerConfetti();
          showToast(`+${res.xpAwarded} XP para ${res.doneBy}! 🎉`, 'success');

          if (res.newlyUnlocked && res.newlyUnlocked.length > 0) {
            playLevelUpSound(state.settings.soundEnabled);
            res.newlyUnlocked.forEach(b => {
              showToast(`Nova Conquista: ${b.icon} ${b.name}!`, 'success', 4000);
            });
          }
        } else if (res && res.status === 'uncompleted') {
          playSubtleClick(state.settings.soundEnabled);
          showToast(`Tarefa desmarcada (-${res.xpRemoved} XP)`, 'info');
        }

        saveState(state);
        triggerAutoSyncIfEnabled();
        refreshAllUI();
      }
    });

    taskListEl.addEventListener('click', (e) => {
      // Alterar responsável padrão da tarefa
      const changeBtn = e.target.closest('[data-change-assignee]');
      if (changeBtn) {
        const taskId = changeBtn.getAttribute('data-change-assignee');
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          if (task.assignedTo === 'ambos') task.assignedTo = 'matheus';
          else if (task.assignedTo === 'matheus') task.assignedTo = 'esposa';
          else task.assignedTo = 'ambos';

          saveState(state);
          playSubtleClick(state.settings.soundEnabled);
          renderTasksTab(state, currentRoomFilter);
        }
        return;
      }

      // Excluir tarefa
      const deleteBtn = e.target.closest('[data-delete-task]');
      if (deleteBtn) {
        const taskId = deleteBtn.getAttribute('data-delete-task');
        if (confirm('Deseja excluir esta tarefa permanentemente?')) {
          deleteTask(state, taskId);
          saveState(state);
          showToast('Tarefa excluída', 'info');
          refreshAllUI();
        }
      }
    });
  }

  // Formulário de Nova Tarefa
  const addTaskForm = document.getElementById('form-add-task');
  if (addTaskForm) {
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-input-title').value;
      const room = document.getElementById('task-input-room').value;
      const effort = document.getElementById('task-input-effort').value;
      const assignedTo = document.getElementById('task-input-assignee').value;
      const notes = document.getElementById('task-input-notes').value;

      if (!title.trim()) return;

      addTask(state, { title, room, effort, assignedTo, notes });
      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-task');
      addTaskForm.reset();
      showToast('Nova tarefa adicionada com sucesso!', 'success');
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE HISTÓRICO & VERIFICAÇÃO DIÁRIA
// -------------------------------------------------------------
function initHistoryModule() {
  const btnPrev = document.getElementById('btn-history-prev');
  const btnNext = document.getElementById('btn-history-next');
  const btnToday = document.getElementById('btn-history-today');
  const inputDate = document.getElementById('history-custom-date');
  const recentDaysBar = document.getElementById('history-recent-days-bar');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      const d = new Date(currentHistoryDate + 'T12:00:00');
      d.setDate(d.getDate() - 1);
      currentHistoryDate = getLocalDateString(d);
      playSubtleClick(state.settings.soundEnabled);
      renderHistoryTab(state, currentHistoryDate);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const d = new Date(currentHistoryDate + 'T12:00:00');
      d.setDate(d.getDate() + 1);
      currentHistoryDate = getLocalDateString(d);
      playSubtleClick(state.settings.soundEnabled);
      renderHistoryTab(state, currentHistoryDate);
    });
  }

  if (btnToday) {
    btnToday.addEventListener('click', () => {
      currentHistoryDate = getLocalDateString();
      playSubtleClick(state.settings.soundEnabled);
      renderHistoryTab(state, currentHistoryDate);
    });
  }

  if (inputDate) {
    inputDate.addEventListener('change', (e) => {
      if (e.target.value) {
        currentHistoryDate = e.target.value;
        renderHistoryTab(state, currentHistoryDate);
      }
    });
  }

  if (recentDaysBar) {
    recentDaysBar.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-nav-date]');
      if (dot) {
        currentHistoryDate = dot.getAttribute('data-nav-date');
        playSubtleClick(state.settings.soundEnabled);
        renderHistoryTab(state, currentHistoryDate);
      }
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE REFORMAS & MELHORIAS
// -------------------------------------------------------------
function initReformasModule() {
  // Filtros de status de reformas
  const statusChips = document.querySelectorAll('[data-reforma-filter]');
  statusChips.forEach(btn => {
    btn.addEventListener('click', () => {
      statusChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReformasFilter = btn.getAttribute('data-reforma-filter') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderReformasTab(state, currentReformasFilter);
    });
  });

  const gridEl = document.getElementById('reformas-grid');
  if (gridEl) {
    gridEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('reforma-check-item')) {
        const refId = e.target.getAttribute('data-ref-id');
        const checkId = e.target.getAttribute('data-check-id');
        toggleReformaChecklistItem(state, refId, checkId);
        saveState(state);
        playTaskCompleteSound(state.settings.soundEnabled);
        renderReformasTab(state, currentReformasFilter);
      }
    });

    gridEl.addEventListener('click', (e) => {
      // Excluir reforma
      const delBtn = e.target.closest('[data-delete-reforma]');
      if (delBtn) {
        const refId = delBtn.getAttribute('data-delete-reforma');
        if (confirm('Deseja excluir esta ideia de reforma?')) {
          deleteReforma(state, refId);
          saveState(state);
          showToast('Reforma excluída', 'info');
          refreshAllUI();
        }
        return;
      }

      // Alterar status rápido
      const statusBtn = e.target.closest('[data-edit-reforma-status]');
      if (statusBtn) {
        const refId = statusBtn.getAttribute('data-edit-reforma-status');
        const ref = state.reformas.find(r => r.id === refId);
        if (ref) {
          const statuses = ['ideia', 'orcamento', 'andamento', 'concluido'];
          const curIdx = statuses.indexOf(ref.status);
          ref.status = statuses[(curIdx + 1) % statuses.length];
          saveState(state);
          playSubtleClick(state.settings.soundEnabled);
          showToast(`Status atualizado para: ${ref.status}`, 'info');
          refreshAllUI();
        }
      }
    });
  }

  // Formulário Nova Reforma
  const formAddReforma = document.getElementById('form-add-reforma');
  if (formAddReforma) {
    formAddReforma.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('reforma-input-title').value;
      const room = document.getElementById('reforma-input-room').value;
      const priority = document.getElementById('reforma-input-priority').value;
      const status = document.getElementById('reforma-input-status').value;
      const estimatedCost = document.getElementById('reforma-input-cost').value;
      const targetDate = document.getElementById('reforma-input-date').value;
      const description = document.getElementById('reforma-input-desc').value;

      if (!title.trim()) return;

      addReforma(state, { title, room, priority, status, estimatedCost, targetDate, description });
      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-reforma');
      formAddReforma.reset();
      showToast('Reforma cadastrada!', 'success');
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE SONHOS & METAS DO CASAL
// -------------------------------------------------------------
function initSonhosModule() {
  const catChips = document.querySelectorAll('[data-sonho-filter]');
  catChips.forEach(btn => {
    btn.addEventListener('click', () => {
      catChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSonhosFilter = btn.getAttribute('data-sonho-filter') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderSonhosTab(state, currentSonhosFilter);
    });
  });

  const gridEl = document.getElementById('sonhos-grid');
  if (gridEl) {
    gridEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('sonho-milestone-item')) {
        const sonhoId = e.target.getAttribute('data-sonho-id');
        const mId = e.target.getAttribute('data-milestone-id');
        toggleSonhoMilestone(state, sonhoId, mId);
        saveState(state);
        playTaskCompleteSound(state.settings.soundEnabled);
        renderSonhosTab(state, currentSonhosFilter);
      }
    });

    gridEl.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-delete-sonho]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-delete-sonho');
        if (confirm('Deseja excluir este sonho?')) {
          deleteSonho(state, id);
          saveState(state);
          showToast('Sonho removido', 'info');
          refreshAllUI();
        }
        return;
      }

      const statusBtn = e.target.closest('[data-edit-sonho-status]');
      if (statusBtn) {
        const id = statusBtn.getAttribute('data-edit-sonho-status');
        const sonho = state.sonhos.find(s => s.id === id);
        if (sonho) {
          const statuses = ['sonhando', 'planejando', 'poupando', 'realizado'];
          const curIdx = statuses.indexOf(sonho.status);
          sonho.status = statuses[(curIdx + 1) % statuses.length];
          saveState(state);
          playSubtleClick(state.settings.soundEnabled);
          showToast(`Status: ${sonho.status}`, 'info');
          refreshAllUI();
        }
      }
    });
  }

  // Formulário Novo Sonho
  const formAddSonho = document.getElementById('form-add-sonho');
  if (formAddSonho) {
    formAddSonho.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('sonho-input-title').value;
      const category = document.getElementById('sonho-input-category').value;
      const targetAmount = document.getElementById('sonho-input-amount').value;
      const targetDate = document.getElementById('sonho-input-date').value;
      const description = document.getElementById('sonho-input-desc').value;

      if (!title.trim()) return;

      addSonho(state, { title, category, targetAmount, targetDate, description });
      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-sonho');
      formAddSonho.reset();
      showToast('Sonho adicionado ao mural! ✨', 'success');
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE AJUSTES & GOOGLE SHEETS
// -------------------------------------------------------------
function initSettingsModule() {
  const formSettings = document.getElementById('form-settings');
  const btnTestSheets = document.getElementById('btn-test-sheets');
  const btnSyncNow = document.getElementById('btn-sync-now');
  const btnRestoreSheets = document.getElementById('btn-restore-sheets');
  const btnExportJson = document.getElementById('btn-export-json');
  const inputImportJson = document.getElementById('input-import-json');

  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      state.settings.sheetsUrl = document.getElementById('settings-sheets-url').value.trim();
      state.settings.sheetsToken = document.getElementById('settings-sheets-token').value.trim();
      state.settings.autoSync = document.getElementById('settings-autosync-toggle').checked;
      state.settings.soundEnabled = document.getElementById('settings-sound-toggle').checked;

      state.users.user1.name = document.getElementById('settings-user1-name').value.trim() || 'Matheus';
      state.users.user2.name = document.getElementById('settings-user2-name').value.trim() || 'Esposa';

      saveState(state);
      showToast('Configurações salvas!', 'success');
      refreshAllUI();
    });
  }

  if (btnTestSheets) {
    btnTestSheets.addEventListener('click', async () => {
      const url = document.getElementById('settings-sheets-url').value;
      const token = document.getElementById('settings-sheets-token').value;
      btnTestSheets.disabled = true;
      btnTestSheets.textContent = 'Testando...';

      try {
        const res = await testSheetsConnection(url, token);
        showToast(res.message || 'Conexão com Google Sheets bem-sucedida!', 'success', 4000);
      } catch (err) {
        showToast(`Erro: ${err.message}`, 'error', 5000);
      } finally {
        btnTestSheets.disabled = false;
        btnTestSheets.textContent = 'Testar Conexão';
      }
    });
  }

  if (btnSyncNow) {
    btnSyncNow.addEventListener('click', async () => {
      btnSyncNow.disabled = true;
      btnSyncNow.textContent = 'Enviando...';
      const syncDot = document.getElementById('sync-dot');
      if (syncDot) syncDot.className = 'sync-status-indicator syncing';

      try {
        await backupToSheets(state);
        saveState(state);
        showToast('Backup no Google Sheets concluído com sucesso!', 'success', 3500);
      } catch (err) {
        showToast(`Falha no backup: ${err.message}`, 'error', 5000);
        if (syncDot) syncDot.className = 'sync-status-indicator error';
      } finally {
        btnSyncNow.disabled = false;
        btnSyncNow.textContent = 'Fazer Backup Agora';
        refreshAllUI();
      }
    });
  }

  if (btnRestoreSheets) {
    btnRestoreSheets.addEventListener('click', async () => {
      if (!confirm('Atenção: A restauração substituirá os dados locais atuais pelos dados salvos na planilha. Deseja continuar?')) {
        return;
      }

      btnRestoreSheets.disabled = true;
      btnRestoreSheets.textContent = 'Restaurando...';

      try {
        const restoredData = await restoreFromSheets(state);
        state = {
          ...state,
          ...restoredData,
          users: { ...state.users, ...(restoredData.users || {}) },
          gamification: { ...state.gamification, ...(restoredData.gamification || {}) },
          settings: { ...state.settings, ...(restoredData.settings || {}) }
        };
        saveState(state);
        showToast('Dados restaurados com sucesso do Google Sheets!', 'success', 4000);
        refreshAllUI();
      } catch (err) {
        showToast(`Erro na restauração: ${err.message}`, 'error', 5000);
      } finally {
        btnRestoreSheets.disabled = false;
        btnRestoreSheets.textContent = 'Restaurar do Google Sheets';
      }
    });
  }

  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      exportBackupJson(state);
      showToast('Arquivo JSON de backup baixado!', 'success');
    });
  }

  if (inputImportJson) {
    inputImportJson.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      importBackupJson(file, state, (err, newState) => {
        if (err) {
          showToast(`Erro ao importar: ${err.message}`, 'error');
        } else {
          state = newState;
          showToast('Backup local importado com sucesso!', 'success');
          refreshAllUI();
        }
        inputImportJson.value = '';
      });
    });
  }
}

function triggerAutoSyncIfEnabled() {
  if (state.settings.autoSync && state.settings.sheetsUrl) {
    backupToSheets(state).catch(err => {
      console.warn('[Maracaju 88] Auto-sync falhou em background:', err);
    });
  }
}

// -------------------------------------------------------------
// CONTROLE DE MODAIS
// -------------------------------------------------------------
function initModals() {
  // Abertura de modais
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-open-modal');
      openModal(modalId);
    });
  });

  // Fechamento de modais
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Fechar ao clicar fora do conteúdo
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    playSubtleClick(state.settings.soundEnabled);
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}
