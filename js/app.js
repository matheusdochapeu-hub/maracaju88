// ============================================================
//  MARACAJU 88 - APP CONTROLLER PRINCIPAL (v1.1.0)
// ============================================================

import { loadState, saveState, exportBackupJson, importBackupJson } from './storage.js';
import { playTaskCompleteSound, playLevelUpSound, playSubtleClick } from './audio.js';
import { toggleTaskDone, addTask, deleteTask, getLocalDateString } from './tasks.js';
import {
  addCarroItem,
  updateCarroItem,
  deleteCarroItem,
  addPhotoToCarro,
  removePhotoFromCarro,
  addLinkToCarro,
  removeLinkFromCarro,
  toggleCarroChecklistItem,
  compressImageFile
} from './carro.js';
import { addReforma, deleteReforma, toggleReformaChecklistItem } from './reformas.js';
import { addSonho, deleteSonho, toggleSonhoMilestone } from './sonhos.js';
import { testSheetsConnection, backupToSheets, restoreFromSheets } from './sheets.js';
import {
  triggerConfetti,
  showToast,
  renderHeaderStats,
  renderTasksTab,
  renderHistoryTab,
  renderCarroTab,
  renderReformasTab,
  renderSonhosTab,
  renderGamificationTab,
  renderSettingsTab
} from './ui.js';

// Estado global em memória
let state = null;
let currentTab = 'tarefas';
let currentFrequencyFilter = 'diaria';
let currentRoomFilter = 'tudo';
let currentHistoryDate = getLocalDateString();
let currentCarroCategory = 'todas';
let currentCarroStatus = 'todas';
let currentReformasFilter = 'todas';
let currentSonhosFilter = 'todas';
let deferredInstallPrompt = null;

// -------------------------------------------------------------
// INICIALIZAÇÃO DO APP
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  state = loadState();

  initServiceWorker();
  initPwaInstallPrompt();
  initNavigation();
  initHeaderControls();
  initTasksModule();
  initHistoryModule();
  initCarroModule();
  initReformasModule();
  initSonhosModule();
  initSettingsModule();
  initModals();

  refreshAllUI();
});

function refreshAllUI() {
  renderHeaderStats(state);

  if (currentTab === 'tarefas') {
    renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
  } else if (currentTab === 'historico') {
    renderHistoryTab(state, currentHistoryDate);
  } else if (currentTab === 'carro') {
    renderCarroTab(state, currentCarroCategory, currentCarroStatus);
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
// PWA SERVICE WORKER & INSTALAÇÃO FACILITADA
// -------------------------------------------------------------
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[Maracaju 88] Service Worker ativo:', reg.scope);
        })
        .catch(err => {
          console.warn('[Maracaju 88] Falha no Service Worker:', err);
        });
    });
  }
}

function initPwaInstallPrompt() {
  const btnInstall = document.getElementById('btn-install-app');

  // Detecta se já está rodando como app instalado (standalone)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone && btnInstall) {
    btnInstall.style.display = 'none';
    return;
  }

  // Captura o evento nativo do Android / Chromium
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (btnInstall) btnInstall.style.display = 'inline-flex';
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      playSubtleClick(state.settings.soundEnabled);

      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('Instalando Maracaju 88 no seu celular... 🎉', 'success', 3500);
          btnInstall.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } else {
        // No iPhone/Safari ou navegadores que não disparam o evento, abre o guia ilustrado
        openModal('modal-install-guide');
      }
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
// CONTROLES DO CABEÇALHO (Perfil: Matheus / Esposa)
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
// MÓDULO DE TAREFAS (DIÁRIAS, SEMANAIS, MENSAIS, ANUAIS)
// -------------------------------------------------------------
function initTasksModule() {
  // Controle de Frequência (Diárias, Semanais, Mensais, Anuais)
  const freqBar = document.getElementById('frequency-segmented-bar');
  if (freqBar) {
    freqBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.freq-btn');
      if (!btn) return;
      const freq = btn.getAttribute('data-frequency');
      if (freq) {
        currentFrequencyFilter = freq;
        playSubtleClick(state.settings.soundEnabled);
        renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
      }
    });
  }

  // Filtro de Cômodos (Chips)
  const chipsContainer = document.getElementById('room-chips-container');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      currentRoomFilter = chip.getAttribute('data-room') || 'tudo';
      playSubtleClick(state.settings.soundEnabled);
      renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
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
          renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
        }
        return;
      }

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
      const frequency = document.getElementById('task-input-frequency').value || 'diaria';
      const room = document.getElementById('task-input-room').value;
      const effort = document.getElementById('task-input-effort').value;
      const assignedTo = document.getElementById('task-input-assignee').value;
      const notes = document.getElementById('task-input-notes').value;

      if (!title.trim()) return;

      addTask(state, { title, frequency, room, effort, assignedTo, notes });
      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-task');
      addTaskForm.reset();
      showToast('Nova tarefa adicionada com sucesso!', 'success');
      currentFrequencyFilter = frequency;
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
// MÓDULO DO CARRO & MANUTENÇÃO (NOVO!)
// -------------------------------------------------------------
function initCarroModule() {
  // Filtros de Categoria
  const catChips = document.querySelectorAll('[data-carro-cat]');
  catChips.forEach(btn => {
    btn.addEventListener('click', () => {
      catChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCarroCategory = btn.getAttribute('data-carro-cat') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderCarroTab(state, currentCarroCategory, currentCarroStatus);
    });
  });

  // Filtros de Status
  const statusChips = document.querySelectorAll('[data-carro-status-filter]');
  statusChips.forEach(btn => {
    btn.addEventListener('click', () => {
      statusChips.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCarroStatus = btn.getAttribute('data-carro-status-filter') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderCarroTab(state, currentCarroCategory, currentCarroStatus);
    });
  });

  const gridEl = document.getElementById('carro-grid');
  if (gridEl) {
    // Checkbox checklist do carro
    gridEl.addEventListener('change', async (e) => {
      if (e.target.classList.contains('carro-check-item')) {
        const carId = e.target.getAttribute('data-car-id');
        const checkId = e.target.getAttribute('data-check-id');
        toggleCarroChecklistItem(state, carId, checkId);
        saveState(state);
        playTaskCompleteSound(state.settings.soundEnabled);
        renderCarroTab(state, currentCarroCategory, currentCarroStatus);
        return;
      }

      // Adicionar foto via input file da câmera / galeria
      if (e.target.classList.contains('input-carro-add-photo')) {
        const carId = e.target.getAttribute('data-car-id');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Processando e comprimindo foto...', 'info', 2000);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToCarro(state, carId, compressed);
          saveState(state);
          showToast('Foto anexada com sucesso! 📷', 'success');
          renderCarroTab(state, currentCarroCategory, currentCarroStatus);
        } catch (err) {
          showToast(`Erro na foto: ${err.message}`, 'error');
        }
      }
    });

    gridEl.addEventListener('click', (e) => {
      // Visualizar foto em tamanho ampliado
      const thumb = e.target.closest('[data-view-photo]');
      if (thumb && !e.target.classList.contains('carro-thumb-delete')) {
        const src = thumb.getAttribute('data-view-photo');
        const modalImg = document.getElementById('photo-viewer-target');
        if (modalImg) modalImg.src = src;
        openModal('modal-photo-viewer');
        return;
      }

      // Deletar foto
      const delPhotoBtn = e.target.closest('[data-del-photo]');
      if (delPhotoBtn) {
        const carId = delPhotoBtn.getAttribute('data-del-photo');
        const pIdx = parseInt(delPhotoBtn.getAttribute('data-photo-idx'), 10);
        if (confirm('Excluir esta foto?')) {
          removePhotoFromCarro(state, carId, pIdx);
          saveState(state);
          showToast('Foto removida', 'info');
          renderCarroTab(state, currentCarroCategory, currentCarroStatus);
        }
        return;
      }

      // Adicionar Link a um item existente
      const addLinkBtn = e.target.closest('[data-add-link-to]');
      if (addLinkBtn) {
        const carId = addLinkBtn.getAttribute('data-add-link-to');
        const url = prompt('Cole o link do produto, peça ou tutorial:');
        if (url && url.trim()) {
          const title = prompt('Título ou descrição do link (ex: Mercado Livre, Peça):', 'Ver Link') || 'Link';
          addLinkToCarro(state, carId, { url, title });
          saveState(state);
          showToast('Link adicionado!', 'success');
          renderCarroTab(state, currentCarroCategory, currentCarroStatus);
        }
        return;
      }

      // Deletar Link
      const delLinkBtn = e.target.closest('[data-del-link]');
      if (delLinkBtn) {
        const carId = delLinkBtn.getAttribute('data-del-link');
        const linkId = delLinkBtn.getAttribute('data-link-id');
        removeLinkFromCarro(state, carId, linkId);
        saveState(state);
        showToast('Link removido', 'info');
        renderCarroTab(state, currentCarroCategory, currentCarroStatus);
        return;
      }

      // Alterar status rápido
      const statusBtn = e.target.closest('[data-edit-carro-status]');
      if (statusBtn) {
        const carId = statusBtn.getAttribute('data-edit-carro-status');
        const item = state.carro.find(c => c.id === carId);
        if (item) {
          const statuses = ['pendente', 'orcamento', 'andamento', 'concluido'];
          const curIdx = statuses.indexOf(item.status);
          item.status = statuses[(curIdx + 1) % statuses.length];
          saveState(state);
          playSubtleClick(state.settings.soundEnabled);
          showToast(`Status atualizado: ${item.status}`, 'info');
          refreshAllUI();
        }
        return;
      }

      // Excluir item do carro
      const delBtn = e.target.closest('[data-delete-carro]');
      if (delBtn) {
        const carId = delBtn.getAttribute('data-delete-carro');
        if (confirm('Deseja excluir esta manutenção do carro?')) {
          deleteCarroItem(state, carId);
          saveState(state);
          showToast('Manutenção removida', 'info');
          refreshAllUI();
        }
      }
    });
  }

  // Formulário Nova Manutenção do Carro
  const formAddCarro = document.getElementById('form-add-carro');
  if (formAddCarro) {
    formAddCarro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('carro-input-title').value;
      const category = document.getElementById('carro-input-category').value;
      const status = document.getElementById('carro-input-status').value;
      const priority = document.getElementById('carro-input-priority').value;
      const estimatedCost = document.getElementById('carro-input-cost').value;
      const targetKm = document.getElementById('carro-input-km').value;
      const targetDate = document.getElementById('carro-input-date').value;
      const notes = document.getElementById('carro-input-notes').value;
      const linkUrl = document.getElementById('carro-input-link-url').value;
      const linkTitle = document.getElementById('carro-input-link-title').value;
      const photoFile = document.getElementById('carro-input-photo').files[0];

      if (!title.trim()) return;

      const links = [];
      if (linkUrl && linkUrl.trim()) {
        links.push({
          id: `lnk_${Date.now()}`,
          title: (linkTitle && linkTitle.trim()) || 'Link da Peça',
          url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
        });
      }

      const photos = [];
      if (photoFile) {
        try {
          const comp = await compressImageFile(photoFile, 800, 0.72);
          photos.push(comp);
        } catch (err) {
          console.warn('Erro ao processar foto inicial do carro:', err);
        }
      }

      addCarroItem(state, {
        title,
        category,
        status,
        priority,
        estimatedCost,
        targetKm,
        targetDate,
        notes,
        links,
        photos
      });

      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-carro');
      formAddCarro.reset();
      showToast('Manutenção do carro cadastrada com sucesso! 🚗', 'success');
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE REFORMAS & MELHORIAS
// -------------------------------------------------------------
function initReformasModule() {
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
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-open-modal');
      openModal(modalId);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

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
