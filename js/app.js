import {
  getMonthlyBenefitDetails,
  updateMonthlyBenefitsConfig,
  closeBenefitCycleEarly,
  getCurrentBenefitCycleKey
} from './benefits.js';
// ============================================================
//  MARACAJU - APP CONTROLLER PRINCIPAL (v1.3.3)
// ============================================================

import { loadState, saveState, exportBackupJson, importBackupJson, getInitialState } from './storage.js';
import {
  getAuthSession,
  loginWithEmail,
  loginWithCredentials,
  clearAuthSession,
  isBiometricsSupported,
  isBiometricsEnabled,
  setBiometricsEnabled,
  authenticateWithBiometrics,
  setUserPassword,
  verifyUserPassword,
  hasUserCustomPassword
} from './auth.js';
import { playTaskCompleteSound, playSubtleClick } from './audio.js';
import { toggleTaskDone, addTask, deleteTask, updateTask, getLocalDateString } from './tasks.js';
import {
  addShoppingItem,
  toggleShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearBoughtItems,
  restoreBoughtItems,
  addMarketPurchase,
  deleteMarketPurchase,
  addPhotoToShoppingItem,
  removePhotoFromShoppingItem,
  addPhotoToMarketPurchase,
  removePhotoFromMarketPurchase,
  getShoppingSummary,
  getMarketPurchasesByMonth,
  parseQuantity,
  getItemTotalPrice,
  updateMarketPurchase
} from './shopping.js';
import { parseNfceQrCodeText, fetchNfceDetailsOnline } from './nfce.js';
import { parseCurrency, formatCurrency, formatCurrencyWithSymbol } from './currency.js';
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
import {
  addReforma,
  updateReforma,
  deleteReforma,
  toggleReformaChecklistItem,
  addPhotoToReforma,
  removePhotoFromReforma,
  addLinkToReforma,
  removeLinkFromReforma
} from './reformas.js';
import { addSonho, updateSonho, deleteSonho, toggleSonhoMilestone, addPhotoToSonho, removePhotoFromSonho } from './sonhos.js';
import { parseNfceDanfeText, extractTextFromPdfFile, suggestPopularName } from './pdf-parser.js';
import {
  ensureCatalog,
  syncPurchasesIntoCatalog,
  findCatalogProduct,
  upsertCatalogProduct,
  registerInvoiceInCatalog,
  getProductPriceComparison,
  addCatalogProductToShoppingList,
  addPhotoToCatalogProduct,
  updateCatalogProductDetails,
  searchCatalogProducts
} from './catalog.js';
import {
  updateCatalogDatalist,
  updateRecurrentMarketsDatalist,
  renderCatalogModal,
  renderProductHistoryModal,
  renderPdfInvoiceConfirmation,
  renderBenefitsHistoryModal,
  setBenefitsCycle,
  getActiveBenefitsCycle
} from './ui.js';
import { testSheetsConnection, backupToSheets, restoreFromSheets, applyCloudBackup } from './sheets.js';
import {
  getCategories,
  findCategory,
  addCategory,
  updateCategory,
  deleteCategory
} from './categories.js';
import {
  triggerConfetti,
  showToast,
  renderHeaderStats,
  renderTasksTab,
  renderHistoryTab,
  renderCarroTab,
  renderReformasTab,
  renderSonhosTab,
  renderComprasTab,
  renderGamificationTab,
  renderSettingsTab,
  populateCategorySelects,
  renderCategoriesManager,
  renderQuickEmojis
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
let currentReformasCategory = 'todas';
let currentSonhosFilter = 'todas';
let currentComprasCategory = 'todas';
let currentComprasView = 'lista';
let currentPurchasesSort = 'date-desc';
let currentPurchasesSearch = '';
let currentCatalogCategoryFilter = 'todos';
let currentCatalogSearchQuery = '';
let currentCatalogMode = 'comparator';
let currentCatalogSort = 'economy';
let currentManualPurchasePhotos = [];
let currentPendingPdfInvoice = null;
let currentCategoryManageModule = 'tarefas';
let deferredInstallPrompt = null;

// -------------------------------------------------------------
// INICIALIZAÇÃO DO APP
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  try {
    state = loadState();
  } catch (err) {
    console.error('[Maracaju] Erro ao carregar estado inicial:', err);
    state = getInitialState();
  }

  const safeInit = (fn, name) => {
    try {
      fn();
    } catch (e) {
      console.warn(`[Maracaju] Falha ao inicializar ${name}:`, e);
    }
  };

  safeInit(initAuthModule, 'initAuthModule');
  safeInit(initServiceWorker, 'initServiceWorker');
  safeInit(initPwaInstallPrompt, 'initPwaInstallPrompt');
  safeInit(initNavigation, 'initNavigation');
  safeInit(initHeaderControls, 'initHeaderControls');
  safeInit(initTasksModule, 'initTasksModule');
  safeInit(initHistoryModule, 'initHistoryModule');
  safeInit(initCarroModule, 'initCarroModule');
  safeInit(initReformasModule, 'initReformasModule');
  safeInit(initSonhosModule, 'initSonhosModule');
  safeInit(initComprasModule, 'initComprasModule');
  safeInit(initQrCodeScanner, 'initQrCodeScanner');
  safeInit(initSettingsModule, 'initSettingsModule');
  safeInit(initCategoryManagement, 'initCategoryManagement');
  safeInit(initModals, 'initModals');
  safeInit(initGlobalEditDelegation, 'initGlobalEditDelegation');

  try {
    populateCategorySelects(state);
    updateCatalogDatalist(state);
    updateRecurrentMarketsDatalist(state);
  } catch (e) {
    console.warn('[Maracaju] Erro ao popular selects/datalists:', e);
  }

  // Render inicial ultra-rápido (< 20ms) a partir do cache local
  refreshAllUI();

  // Sincronização em segundo plano não-bloqueante: inicia após pintura da interface
  setTimeout(() => {
    syncPullFromSheets(true);
  }, 400);
});

// Ao retornar ao aplicativo (desbloqueio de tela no celular ou volta de aba), puxa a planilha em background com cooldown
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    syncPullFromSheets(true);
  }
});

// -------------------------------------------------------------
// CONTROLE DE ACESSO EXCLUSIVO (Matheus & Scarlet)
// -------------------------------------------------------------
function initAuthModule() {
  const authGate = document.getElementById('auth-gate');
  const authForm = document.getElementById('form-auth-login');
  const passwordInput = document.getElementById('auth-password-input');
  const selectedUserInput = document.getElementById('auth-selected-user');
  const togglePassBtn = document.getElementById('btn-toggle-auth-password');
  const btnBiometrics = document.getElementById('btn-auth-biometrics');
  const biometricsContainer = document.getElementById('auth-biometrics-container');
  const errorBox = document.getElementById('auth-error-box');
  const errorText = document.getElementById('auth-error-text');
  const btnQuickMatheus = document.getElementById('btn-quick-matheus');
  const btnQuickScarlet = document.getElementById('btn-quick-scarlet');
  const btnLogout = document.getElementById('btn-auth-logout');

  // Verifica se o dispositivo suporta biometria de forma assíncrona segura
  if (biometricsContainer) {
    biometricsContainer.style.display = 'none';
    if (typeof isBiometricsSupported === 'function') {
      isBiometricsSupported().then(supported => {
        if (supported && isBiometricsEnabled()) {
          biometricsContainer.style.display = 'block';
        }
      }).catch(() => {
        biometricsContainer.style.display = 'none';
      });
    }
  }

  function checkSession() {
    const session = getAuthSession();
    if (!session) {
      if (authGate) authGate.style.display = 'flex';
      return false;
    } else {
      if (authGate) authGate.style.display = 'none';
      if (state) {
        state.activeUserId = session.id;
      }
      return true;
    }
  }

  function handleLogin(email, verifiedUser = null) {
    if (errorBox) errorBox.style.display = 'none';

    let user = verifiedUser;
    if (!user) {
      const pass = passwordInput ? passwordInput.value : '';
      const result = loginWithCredentials(email, pass);
      if (!result.success) {
        if (errorBox && errorText) {
          errorText.textContent = result.error;
          errorBox.style.display = 'flex';
          if (passwordInput) passwordInput.focus();
        } else {
          alert(result.error);
        }
        return;
      }
      user = result.user;
    }

    if (authGate) authGate.style.display = 'none';
    if (passwordInput) passwordInput.value = '';
    state.activeUserId = user.id;
    saveState(state);

    playSubtleClick(state.settings.soundEnabled);
    triggerConfetti();
    showToast(`Bem-vindo(a) ao Maracaju, ${user.name}! 🏡✨`, 'success', 3500);
    refreshAllUI();
    syncPullFromSheets(false);
  }

  // Alterna visibilidade da senha
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Desbloqueio com Biometria do Celular (Face ID / Digital)
  if (btnBiometrics) {
    btnBiometrics.addEventListener('click', async () => {
      try {
        const uId = selectedUserInput ? selectedUserInput.value : 'matheus';
        const ok = await authenticateWithBiometrics(uId);
        if (ok && ok.user) {
          handleLogin(ok.user.email, ok.user);
        } else {
          if (errorBox && errorText) {
            errorText.textContent = 'Não foi possível validar a biometria neste aparelho.';
            errorBox.style.display = 'flex';
          }
        }
      } catch (err) {
        if (errorBox && errorText) {
          errorText.textContent = err.message || 'Falha ao validar biometria.';
          errorBox.style.display = 'flex';
        }
      }
    });
  }

  // Verifica sessão na inicialização
  checkSession();

  // Seleção de perfil e suporte a 1 toque quando não há senha
  function selectProfile(uId) {
    if (selectedUserInput) selectedUserInput.value = uId;
    if (btnQuickMatheus) btnQuickMatheus.classList.toggle('active-profile-btn', uId === 'matheus');
    if (btnQuickScarlet) btnQuickScarlet.classList.toggle('active-profile-btn', uId === 'scarlet');
    if (errorBox) errorBox.style.display = 'none';
    if (passwordInput) passwordInput.focus();
  }

  if (btnQuickMatheus) {
    btnQuickMatheus.addEventListener('click', () => {
      if (hasUserCustomPassword('matheus')) {
        selectProfile('matheus');
      } else {
        // Se ainda não configurou senha, entra imediatamente com 1 toque!
        handleLogin('matheusdochapeu@gmail.com');
      }
    });
  }

  if (btnQuickScarlet) {
    btnQuickScarlet.addEventListener('click', () => {
      if (hasUserCustomPassword('scarlet')) {
        selectProfile('scarlet');
      } else {
        // Se ainda não configurou senha, entra imediatamente com 1 toque!
        handleLogin('scarletsantos7@gmail.com');
      }
    });
  }

  // Submissão do formulário com validação segura de credenciais
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const uId = selectedUserInput ? selectedUserInput.value : 'matheus';
      const email = (uId === 'scarlet') ? 'scarletsantos7@gmail.com' : 'matheusdochapeu@gmail.com';
      handleLogin(email);
    });
  }

  // Botão de Sair / Trocar Usuário (na aba Ajustes)
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      clearAuthSession();
      if (authGate) authGate.style.display = 'flex';
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
      showToast('Sessão encerrada com sucesso.', 'info', 2500);
      refreshAllUI();
    });
  }
}

function refreshAllUI() {
  renderHeaderStats(state);
  populateCategorySelects(state);

  if (currentTab === 'tarefas') {
    renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
  } else if (currentTab === 'historico') {
    renderHistoryTab(state, currentHistoryDate);
  } else if (currentTab === 'carro') {
    renderCarroTab(state, currentCarroCategory, currentCarroStatus);
  } else if (currentTab === 'reformas') {
    renderReformasTab(state, currentReformasFilter, currentReformasCategory);
  } else if (currentTab === 'sonhos') {
    renderSonhosTab(state, currentSonhosFilter);
  } else if (currentTab === 'compras' || currentTab === 'gamificacao') {
    renderComprasTab(state, currentComprasCategory, currentComprasView, currentPurchasesSort, currentPurchasesSearch);
  } else if (currentTab === 'ajustes') {
    renderSettingsTab(state, currentCategoryManageModule);
  }
}

// -------------------------------------------------------------
// PWA SERVICE WORKER & INSTALAÇÃO FACILITADA
// -------------------------------------------------------------
window.forceUpdateApp = async function() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }
  } catch (e) {
    console.error('[Maracaju] Erro ao limpar caches:', e);
  } finally {
    window.location.reload();
  }
};

function initServiceWorker() {
  const forceUpdateBtn = document.getElementById('btn-force-update-login');
  if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener('click', () => {
      forceUpdateBtn.textContent = '⏳ Atualizando...';
      window.forceUpdateApp();
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[Maracaju] Service Worker ativo:', reg.scope);
          if (reg && typeof reg.update === 'function') {
            reg.update().catch(() => {});
          }
        })
        .catch(err => {
          console.warn('[Maracaju] Falha no Service Worker:', err);
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
          showToast('Instalando Maracaju no seu celular... 🎉', 'success', 3500);
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
// CONTROLES DO CABEÇALHO (Perfil: Matheus / Scarlet)
// -------------------------------------------------------------
function initHeaderControls() {
  const userBtn = document.getElementById('active-user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', () => {
      state.activeUserId = (state.activeUserId === 'matheus') ? 'scarlet' : 'matheus';
      saveState(state);
      playSubtleClick(state.settings.soundEnabled);

      const activeName = (state.activeUserId === 'scarlet' || state.activeUserId === 'esposa') ? state.users.user2.name : state.users.user1.name;
      showToast(`Perfil ativo: ${activeName}`, 'info', 1800);
      refreshAllUI();
    });
  }
}

// -------------------------------------------------------------
// MÓDULO DE TAREFAS (DIÁRIAS, SEMANAIS, MENSAIS, ANUAIS)
// -------------------------------------------------------------

  // -----------------------------------------------------------
  // LANÇAR COMPRA DE MERCADO MANUALMENTE (SEM NOTA)
  // -----------------------------------------------------------
  const modalManualPurchase = document.getElementById('modal-add-manual-purchase');
  const formManualPurchase = document.getElementById('form-add-manual-purchase');
  const btnAddManualItem = document.getElementById('btn-add-manual-item-row');
  const manualItemsContainer = document.getElementById('manual-purchase-items-container');
  const manualCameraInput = document.getElementById('manual-purchase-camera');
  const manualGalleryInput = document.getElementById('manual-purchase-gallery');
  const manualPhotosPreview = document.getElementById('manual-purchase-photos-preview');

  function renderManualPhotosPreview() {
    if (!manualPhotosPreview) return;
    manualPhotosPreview.innerHTML = currentManualPurchasePhotos.map((src, idx) => `
      <div class="carro-thumb-wrapper" style="width: 58px; height: 58px;">
        <img src="${src}" alt="Comprovante" class="carro-thumb-img" />
        <button type="button" class="carro-thumb-delete" data-del-manual-photo="${idx}">✕</button>
      </div>
    `).join('');
  }

  if (manualPhotosPreview) {
    manualPhotosPreview.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del-manual-photo]');
      if (delBtn) {
        const idx = Number(delBtn.getAttribute('data-del-manual-photo'));
        currentManualPurchasePhotos.splice(idx, 1);
        renderManualPhotosPreview();
      }
    });
  }

  async function handleManualPhotoFile(file) {
    if (!file) return;
    try {
      showToast('Processando foto da compra...', 'info', 1500);
      const compressed = await compressImageFile(file, 900, 0.75);
      currentManualPurchasePhotos.push(compressed);
      renderManualPhotosPreview();
      showToast('Foto anexada!', 'success', 1800);
    } catch (err) {
      showToast('Erro ao processar foto: ' + err.message, 'error');
    }
  }

  if (manualCameraInput) {
    manualCameraInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleManualPhotoFile(file);
      manualCameraInput.value = '';
    });
  }

  if (manualGalleryInput) {
    manualGalleryInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleManualPhotoFile(file);
      manualGalleryInput.value = '';
    });
  }

  // Adicionar linha de item dinâmica
  function addManualItemRow(name = '', qty = '1', price = '') {
    if (!manualItemsContainer) return;
    const rowId = 'manual-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const rowEl = document.createElement('div');
    rowEl.className = 'manual-item-row';
    rowEl.id = rowId;
    rowEl.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 0.4rem; align-items: center; background: var(--bg-card); padding: 0.4rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);';
    rowEl.innerHTML = `
      <input type="text" class="form-control manual-item-name" placeholder="Nome do Produto" list="catalog-suggestions-list" value="${name}" style="padding: 0.3rem 0.5rem; font-size: 0.8rem;" required />
      <input type="text" class="form-control manual-item-qty" placeholder="Qtd" value="${qty}" style="padding: 0.3rem 0.5rem; font-size: 0.8rem;" />
      <input type="text" inputmode="decimal" class="form-control manual-item-price" placeholder="R$ Unit" value="${price}" style="padding: 0.3rem 0.5rem; font-size: 0.8rem;" />
      <button type="button" class="btn btn-icon btn-xs btn-remove-item-row" style="color: var(--danger); font-size: 0.85rem;" title="Remover item">✕</button>
    `;
    rowEl.querySelector('.btn-remove-item-row').addEventListener('click', () => {
      rowEl.remove();
      recalcManualTotal();
    });

    const priceInput = rowEl.querySelector('.manual-item-price');
    if (priceInput) {
      priceInput.addEventListener('input', recalcManualTotal);
    }
    const qtyInput = rowEl.querySelector('.manual-item-qty');
    if (qtyInput) {
      qtyInput.addEventListener('input', recalcManualTotal);
    }

    manualItemsContainer.appendChild(rowEl);
  }

  function recalcManualTotal() {
    const totalInput = document.getElementById('manual-purchase-total');
    if (!totalInput || !manualItemsContainer) return;
    const rows = manualItemsContainer.querySelectorAll('.manual-item-row');
    if (rows.length === 0) return;

    let sum = 0;
    rows.forEach(r => {
      const pInput = r.querySelector('.manual-item-price');
      const qInput = r.querySelector('.manual-item-qty');
      const p = parseCurrency(pInput ? pInput.value : 0);
      const qParsed = parseQuantity(qInput ? qInput.value : 1);
      sum += (p * qParsed.count);
    });

    if (sum > 0) {
      totalInput.value = formatCurrency(Math.round(sum * 100) / 100);
    }
  }

  if (btnAddManualItem) {
    btnAddManualItem.addEventListener('click', () => addManualItemRow());
  }

  // Prepara formulário ao abrir modal
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-modal="modal-add-manual-purchase"]');
    if (openBtn) {
      currentManualPurchasePhotos = [];
      if (manualPhotosPreview) manualPhotosPreview.innerHTML = '';
      if (manualItemsContainer) manualItemsContainer.innerHTML = '';
      if (formManualPurchase) formManualPurchase.reset();

      const dateInput = document.getElementById('manual-purchase-date');
      if (dateInput) {
        dateInput.value = new Date().toISOString().substring(0, 10);
      }
      let paySelect = document.getElementById('manual-purchase-payment-method');
      if (!paySelect) {
        const notesGroup = document.getElementById('manual-purchase-notes')?.closest('.form-group');
        if (notesGroup) {
          const payGroup = document.createElement('div');
          payGroup.className = 'form-group';
          payGroup.id = 'manual-purchase-payment-group';
          payGroup.innerHTML = `
            <label class="form-label">Forma de Pagamento</label>
            <select id="manual-purchase-payment-method" class="form-control" style="font-weight: 600;">
              <option value="va" selected>🥗 Vale Alimentação (VA) - Saldo R$ 2.050</option>
              <option value="vr">🍽️ Vale Refeição (VR) - R$ 65/dia</option>
              <option value="pix">💠 Pix</option>
              <option value="credito">💳 Cartão de Crédito</option>
              <option value="debito">💳 Cartão de Débito</option>
              <option value="dinheiro">💵 Dinheiro</option>
            </select>
          `;
          notesGroup.parentNode.insertBefore(payGroup, notesGroup);
          paySelect = document.getElementById('manual-purchase-payment-method');
        }
      }
      if (paySelect) {
        paySelect.value = 'va';
      }
      updateRecurrentMarketsDatalist(state);
      setTimeout(() => {
        const marketInput = document.getElementById('manual-purchase-market');
        if (marketInput) marketInput.focus();
      }, 100);
    }
  });

  // Salvar compra manual
  if (formManualPurchase) {
    formManualPurchase.addEventListener('submit', (e) => {
      e.preventDefault();
      const marketName = (document.getElementById('manual-purchase-market')?.value || 'Supermercado').trim();
      const date = document.getElementById('manual-purchase-date')?.value || new Date().toISOString().substring(0, 10);
      const totalRaw = document.getElementById('manual-purchase-total')?.value || '0';
      const notes = (document.getElementById('manual-purchase-notes')?.value || '').trim();
      const total = parseCurrency(totalRaw);
      const paymentMethod = document.getElementById('manual-purchase-payment-method')?.value || 'va';

      if (total <= 0) {
        showToast('Informe o valor total da compra.', 'warning');
        return;
      }

      // Extrai itens adicionados
      const items = [];
      if (manualItemsContainer) {
        const rows = manualItemsContainer.querySelectorAll('.manual-item-row');
        rows.forEach(r => {
          const nInput = r.querySelector('.manual-item-name');
          const qInput = r.querySelector('.manual-item-qty');
          const pInput = r.querySelector('.manual-item-price');
          const name = nInput ? nInput.value.trim() : '';
          if (name) {
            const qParsed = parseQuantity(qInput ? qInput.value : '1');
            const uPrice = parseCurrency(pInput ? pInput.value : 0);
            items.push({
              rawName: name,
              alias: name,
              qty: qParsed.count,
              unit: qParsed.unit || 'un',
              unitPrice: uPrice,
              totalPrice: Math.round(uPrice * qParsed.count * 100) / 100
            });
          }
        });
      }

      const purchase = addMarketPurchase(state, {
        marketName,
        date,
        total,
        paymentMethod,
        notes: notes || (items.length > 0 ? `${items.length} itens registrados manualmente` : 'Lançamento manual'),
        items,
        photos: [...currentManualPurchasePhotos]
      });

      if (items.length > 0) {
        registerInvoiceInCatalog(state, {
          marketName,
          date,
          items
        });
      }

      saveState(state);
      triggerAutoSyncIfEnabled();
      updateRecurrentMarketsDatalist(state);
      updateCatalogDatalist(state);

      currentComprasView = 'notas';
      refreshAllUI();
      closeModal('modal-add-manual-purchase');

      playTaskCompleteSound(state.settings.soundEnabled);
      showToast(`🎉 Compra no ${marketName} (${formatCurrencyWithSymbol(total)}) registrada com sucesso!`, 'success', 3500);
    });
  }


function initTasksModule() {
  // Gerenciamento dos Seletores de Dias da Semana (Nova Tarefa e Editar Tarefa)
  function updateWeekdaysUI(containerId, labelId, activeDays = []) {
    const container = document.getElementById(containerId);
    const label = document.getElementById(labelId);
    if (!container) return;

    const buttons = container.querySelectorAll('.btn-weekday');
    buttons.forEach(btn => {
      const day = Number(btn.getAttribute('data-day'));
      btn.classList.toggle('active', activeDays.includes(day));
    });

    if (label) {
      label.textContent = formatTaskWeekDays(activeDays);
    }
  }

  function getSelectedWeekdays(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const activeButtons = container.querySelectorAll('.btn-weekday.active');
    const days = Array.from(activeButtons).map(b => Number(b.getAttribute('data-day'))).sort((a, b) => a - b);
    return days;
  }

  // Alternância de botões de dias individuais
  document.addEventListener('click', (e) => {
    const dayBtn = e.target.closest('.btn-weekday');
    if (dayBtn) {
      dayBtn.classList.toggle('active');
      const isEdit = dayBtn.closest('#task-edit-weekdays-group');
      const containerId = isEdit ? 'task-edit-weekdays-buttons' : 'task-weekdays-buttons';
      const labelId = isEdit ? 'task-edit-weekdays-label' : 'task-weekdays-label';
      const selected = getSelectedWeekdays(containerId);
      const label = document.getElementById(labelId);
      if (label) label.textContent = formatTaskWeekDays(selected);
      playSubtleClick(state.settings.soundEnabled);
      return;
    }

    const presetBtn = e.target.closest('.btn-weekday-preset');
    if (presetBtn) {
      const target = presetBtn.getAttribute('data-target'); // 'add' or 'edit'
      const preset = presetBtn.getAttribute('data-preset');
      const containerId = target === 'edit' ? 'task-edit-weekdays-buttons' : 'task-weekdays-buttons';
      const labelId = target === 'edit' ? 'task-edit-weekdays-label' : 'task-weekdays-label';

      let days = [];
      if (preset === 'all') days = [0, 1, 2, 3, 4, 5, 6];
      else if (preset === 'trash') days = [2, 4, 6]; // Terça, Quinta, Sábado (Coleta de Lixo)
      else if (preset === 'weekdays') days = [1, 2, 3, 4, 5]; // Segunda a Sexta
      else if (preset === 'weekend') days = [0, 6]; // Sábado e Domingo

      updateWeekdaysUI(containerId, labelId, days);
      playSubtleClick(state.settings.soundEnabled);
      return;
    }
  });

  // Mostrar/ocultar seletor de dias conforme periodicidade
  const addFreqSelect = document.getElementById('task-input-frequency');
  const addWeekdaysGroup = document.getElementById('task-weekdays-group');
  if (addFreqSelect && addWeekdaysGroup) {
    addFreqSelect.addEventListener('change', () => {
      addWeekdaysGroup.style.display = addFreqSelect.value === 'diaria' ? 'block' : 'none';
    });
  }

  const editFreqSelect = document.getElementById('task-edit-frequency');
  const editWeekdaysGroup = document.getElementById('task-edit-weekdays-group');
  if (editFreqSelect && editWeekdaysGroup) {
    editFreqSelect.addEventListener('change', () => {
      editWeekdaysGroup.style.display = editFreqSelect.value === 'diaria' ? 'block' : 'none';
    });
  }

  // Prepara modal de nova tarefa
  document.addEventListener('click', (e) => {
    const openAddBtn = e.target.closest('[data-open-modal="modal-add-task"]');
    if (openAddBtn) {
      updateWeekdaysUI('task-weekdays-buttons', 'task-weekdays-label', []);
      if (addWeekdaysGroup && addFreqSelect) {
        addWeekdaysGroup.style.display = addFreqSelect.value === 'diaria' ? 'block' : 'none';
      }
    }
  });
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

  // Filtro de Cômodos / Categorias (Chips)
  const chipsContainer = document.getElementById('room-chips-container');
  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-open-category-modal]');
      if (addBtn) {
        const mod = addBtn.getAttribute('data-open-category-modal') || 'tarefas';
        openCategoryEditorModal(mod);
        return;
      }
      const chip = e.target.closest('[data-room]');
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
          showToast(`Tarefa concluída por ${res.doneBy}! ✓`, 'success');
        } else if (res && res.status === 'uncompleted') {
          playSubtleClick(state.settings.soundEnabled);
          showToast('Tarefa desmarcada', 'info');
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
          else if (task.assignedTo === 'matheus') task.assignedTo = 'scarlet';
          else task.assignedTo = 'ambos';

          saveState(state);
          playSubtleClick(state.settings.soundEnabled);
          renderTasksTab(state, currentFrequencyFilter, currentRoomFilter);
        }
        return;
      }

      const editBtn = e.target.closest('[data-edit-task]');
      if (editBtn) {
        const taskId = editBtn.getAttribute('data-edit-task');
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          populateCategorySelects(state);
          document.getElementById('task-edit-id').value = task.id;
          document.getElementById('task-edit-title').value = task.title;
          document.getElementById('task-edit-frequency').value = task.frequency || 'diaria';
          document.getElementById('task-edit-room').value = task.room || 'cozinha';
          document.getElementById('task-edit-effort').value = task.effort || 'media';
          document.getElementById('task-edit-assignee').value = task.assignedTo || 'ambos';
          document.getElementById('task-edit-notes').value = task.notes || '';
          if (editWeekdaysGroup) {
            editWeekdaysGroup.style.display = (task.frequency === 'diaria' || !task.frequency) ? 'block' : 'none';
          }
          updateWeekdaysUI('task-edit-weekdays-buttons', 'task-edit-weekdays-label', task.weekDays || []);
          openModal('modal-edit-task');
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

      const weekDays = frequency === 'diaria' ? getSelectedWeekdays('task-weekdays-buttons') : [];
      addTask(state, { title, frequency, room, effort, assignedTo, notes, weekDays });
      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-task');
      addTaskForm.reset();
      showToast('Nova tarefa adicionada com sucesso!', 'success');
      currentFrequencyFilter = frequency;
      refreshAllUI();
    });
  }

  // Formulário de Edição de Tarefa
  const formEditTask = document.getElementById('form-edit-task');
  if (formEditTask) {
    formEditTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskId = document.getElementById('task-edit-id').value;
      const title = document.getElementById('task-edit-title').value;
      const frequency = document.getElementById('task-edit-frequency').value;
      const room = document.getElementById('task-edit-room').value;
      const effort = document.getElementById('task-edit-effort').value;
      const assignedTo = document.getElementById('task-edit-assignee').value;
      const notes = document.getElementById('task-edit-notes').value;

      if (!title.trim() || !taskId) return;

      const previousTask = state.tasks.find(t => t.id === taskId);
      const prevFreq = previousTask ? previousTask.frequency : null;

      const weekDays = frequency === 'diaria' ? getSelectedWeekdays('task-edit-weekdays-buttons') : [];
      updateTask(state, taskId, {
        title,
        frequency,
        room,
        effort,
        assignedTo,
        notes,
        weekDays
      });

      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-edit-task');
      showToast('Tarefa atualizada com sucesso! ✏️', 'success');

      if (prevFreq && prevFreq !== frequency) {
        currentFrequencyFilter = frequency;
      }

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
  // Filtros de Categoria (Dinâmicos)
  const carroChipsContainer = document.getElementById('carro-category-chips');
  if (carroChipsContainer) {
    carroChipsContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-open-category-modal]');
      if (addBtn) {
        const mod = addBtn.getAttribute('data-open-category-modal') || 'carro';
        openCategoryEditorModal(mod);
        return;
      }
      const chip = e.target.closest('[data-carro-cat]');
      if (!chip) return;
      currentCarroCategory = chip.getAttribute('data-carro-cat') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderCarroTab(state, currentCarroCategory, currentCarroStatus);
    });
  }

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

      
      // Editar lançamento do Carro (Título, categoria, custos, etc.)
      const editCarroBtn = e.target.closest('[data-edit-carro]');
      if (editCarroBtn) {
        const carId = editCarroBtn.getAttribute('data-edit-carro');
        const item = state.carro.find(c => c.id === carId);
        if (item) {
          populateCategorySelects(state);
          document.getElementById('carro-edit-id').value = item.id;
          document.getElementById('carro-edit-title').value = item.title || '';
          document.getElementById('carro-edit-category').value = item.category || 'mecanica';
          document.getElementById('carro-edit-status').value = item.status || 'pendente';
          document.getElementById('carro-edit-priority').value = item.priority || 'media';
          document.getElementById('carro-edit-estimated').value = item.estimatedCost ? formatCurrency(item.estimatedCost) : '';
          document.getElementById('carro-edit-actual').value = item.actualCost ? formatCurrency(item.actualCost) : '';
          document.getElementById('carro-edit-km').value = item.targetKm || '';
          document.getElementById('carro-edit-date').value = item.targetDate || '';
          document.getElementById('carro-edit-notes').value = item.notes || '';
          openModal('modal-edit-carro');
        }
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


  // Formulário Editar Manutenção do Carro
  const formEditCarro = document.getElementById('form-edit-carro');
  if (formEditCarro) {
    formEditCarro.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('carro-edit-id').value;
        const title = document.getElementById('carro-edit-title').value.trim();
        const category = document.getElementById('carro-edit-category').value;
        const status = document.getElementById('carro-edit-status').value;
        const priority = document.getElementById('carro-edit-priority').value;
        const estimatedCost = document.getElementById('carro-edit-estimated').value;
        const actualCost = document.getElementById('carro-edit-actual').value;
        const targetKm = document.getElementById('carro-edit-km').value;
        const targetDate = document.getElementById('carro-edit-date').value;
        const notes = document.getElementById('carro-edit-notes').value.trim();

        if (!id || !title) return;

        updateCarroItem(state, id, {
          title,
          category,
          status,
          priority,
          estimatedCost,
          actualCost,
          targetKm,
          targetDate,
          notes
        });

        saveState(state);
        triggerAutoSyncIfEnabled();
        closeModal('modal-edit-carro');
        showToast('Manutenção do carro atualizada com sucesso!', 'success');
        refreshAllUI();
      } catch (err) {
        showToast('Erro ao editar: ' + err.message, 'error');
      }
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
      renderReformasTab(state, currentReformasFilter, currentReformasCategory);
    });
  });

  // Filtros de Cômodo/Categoria das Reformas (Dinâmicos)
  const reformaCatsContainer = document.getElementById('reformas-category-chips');
  if (reformaCatsContainer) {
    reformaCatsContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-open-category-modal]');
      if (addBtn) {
        const mod = addBtn.getAttribute('data-open-category-modal') || 'reformas';
        openCategoryEditorModal(mod);
        return;
      }
      const chip = e.target.closest('[data-reforma-cat]');
      if (!chip) return;
      currentReformasCategory = chip.getAttribute('data-reforma-cat') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderReformasTab(state, currentReformasFilter, currentReformasCategory);
    });
  }

  const gridEl = document.getElementById('reformas-grid');
  if (gridEl) {
    gridEl.addEventListener('change', async (e) => {
      // Checklist de etapas
      if (e.target.classList.contains('reforma-check-item')) {
        const refId = e.target.getAttribute('data-ref-id');
        const checkId = e.target.getAttribute('data-check-id');
        toggleReformaChecklistItem(state, refId, checkId);
        saveState(state);
        playTaskCompleteSound(state.settings.soundEnabled);
        renderReformasTab(state, currentReformasFilter);
        return;
      }

      // Adicionar nova foto à reforma
      if (e.target.classList.contains('input-reforma-add-photo')) {
        const file = e.target.files[0];
        const refId = e.target.getAttribute('data-ref-id');
        if (!file || !refId) return;

        try {
          showToast('Processando foto da reforma...', 'info', 1800);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToReforma(state, refId, compressed);
          saveState(state);
          showToast('Foto anexada à reforma! 📸', 'success');
          renderReformasTab(state, currentReformasFilter);
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
        if (modalImg && src) {
          modalImg.src = src;
          openModal('modal-photo-viewer');
        }
        return;
      }

      // Deletar Foto da Reforma
      const delPhotoBtn = e.target.closest('[data-del-reforma-photo]');
      if (delPhotoBtn) {
        const refId = delPhotoBtn.getAttribute('data-del-reforma-photo');
        const pIdx = parseInt(delPhotoBtn.getAttribute('data-photo-idx'), 10);
        if (confirm('Deseja excluir esta foto da reforma?')) {
          removePhotoFromReforma(state, refId, pIdx);
          saveState(state);
          showToast('Foto removida', 'info');
          renderReformasTab(state, currentReformasFilter);
        }
        return;
      }

      // Adicionar Link à Reforma
      const addLinkBtn = e.target.closest('[data-add-reforma-link-to]');
      if (addLinkBtn) {
        const refId = addLinkBtn.getAttribute('data-add-reforma-link-to');
        const url = prompt('Cole o endereço do link ou inspiração (ex: Pinterest, Leroy Merlin, YouTube):');
        if (url && url.trim()) {
          const title = prompt('Nome ou título do link (ex: Luminária Pendente, Tutorial Instalação):') || url;
          addLinkToReforma(state, refId, { url, title });
          saveState(state);
          showToast('Link adicionado à reforma!', 'success');
          renderReformasTab(state, currentReformasFilter);
        }
        return;
      }

      // Deletar Link da Reforma
      const delLinkBtn = e.target.closest('[data-del-reforma-link]');
      if (delLinkBtn) {
        const refId = delLinkBtn.getAttribute('data-del-reforma-link');
        const linkId = delLinkBtn.getAttribute('data-link-id');
        removeLinkFromReforma(state, refId, linkId);
        saveState(state);
        showToast('Link removido', 'info');
        renderReformasTab(state, currentReformasFilter);
        return;
      }

      // Deletar Reforma
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

      
      // Editar lançamento de Reforma (Projeto, custos, status, cômodo)
      const editReformaBtn = e.target.closest('[data-edit-reforma]');
      if (editReformaBtn) {
        const refId = editReformaBtn.getAttribute('data-edit-reforma');
        const ref = state.reformas.find(r => r.id === refId);
        if (ref) {
          populateCategorySelects(state);
          document.getElementById('reforma-edit-id').value = ref.id;
          document.getElementById('reforma-edit-title').value = ref.title || '';
          document.getElementById('reforma-edit-room').value = ref.room || 'sala';
          document.getElementById('reforma-edit-status').value = ref.status || 'ideia';
          document.getElementById('reforma-edit-priority').value = ref.priority || 'media';
          document.getElementById('reforma-edit-estimated').value = ref.estimatedCost ? formatCurrency(ref.estimatedCost) : '';
          document.getElementById('reforma-edit-actual').value = ref.actualCost ? formatCurrency(ref.actualCost) : '';
          document.getElementById('reforma-edit-date').value = ref.targetDate || '';
          document.getElementById('reforma-edit-desc').value = ref.description || '';
          openModal('modal-edit-reforma');
        }
        return;
      }

      // Alterar Status da Reforma
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
    formAddReforma.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('reforma-input-title').value;
      const room = document.getElementById('reforma-input-room').value;
      const priority = document.getElementById('reforma-input-priority').value;
      const status = document.getElementById('reforma-input-status').value;
      const estimatedCost = document.getElementById('reforma-input-cost').value;
      const targetDate = document.getElementById('reforma-input-date').value;
      const description = document.getElementById('reforma-input-desc').value;
      const linkUrl = document.getElementById('reforma-input-link-url') ? document.getElementById('reforma-input-link-url').value : '';
      const linkTitle = document.getElementById('reforma-input-link-title') ? document.getElementById('reforma-input-link-title').value : '';
      const photoFileInput = document.getElementById('reforma-input-photo');
      const photoFile = photoFileInput && photoFileInput.files ? photoFileInput.files[0] : null;

      if (!title.trim()) return;

      const links = [];
      if (linkUrl && linkUrl.trim()) {
        links.push({
          id: `lnk_${Date.now()}`,
          title: (linkTitle && linkTitle.trim()) || 'Inspiração da Reforma',
          url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : 'https://' + linkUrl.trim()
        });
      }

      const photos = [];
      if (photoFile) {
        try {
          const comp = await compressImageFile(photoFile, 800, 0.72);
          photos.push(comp);
        } catch (err) {
          console.warn('Erro ao processar foto inicial da reforma:', err);
        }
      }

      addReforma(state, {
        title,
        room,
        priority,
        status,
        estimatedCost,
        targetDate,
        description,
        links,
        photos
      });

      saveState(state);
      triggerAutoSyncIfEnabled();

      closeModal('modal-add-reforma');
      formAddReforma.reset();
      showToast('Reforma cadastrada com fotos e links! 🛠️', 'success');
      refreshAllUI();
    });
  }


  // Formulário Editar Projeto de Reforma
  const formEditReforma = document.getElementById('form-edit-reforma');
  if (formEditReforma) {
    formEditReforma.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('reforma-edit-id').value;
        const title = document.getElementById('reforma-edit-title').value.trim();
        const room = document.getElementById('reforma-edit-room').value;
        const status = document.getElementById('reforma-edit-status').value;
        const priority = document.getElementById('reforma-edit-priority').value;
        const estimatedCost = document.getElementById('reforma-edit-estimated').value;
        const actualCost = document.getElementById('reforma-edit-actual').value;
        const targetDate = document.getElementById('reforma-edit-date').value;
        const description = document.getElementById('reforma-edit-desc').value.trim();

        if (!id || !title) return;

        updateReforma(state, id, {
          title,
          room,
          status,
          priority,
          estimatedCost,
          actualCost,
          targetDate,
          description
        });

        saveState(state);
        triggerAutoSyncIfEnabled();
        closeModal('modal-edit-reforma');
        showToast('Projeto de reforma atualizado com sucesso!', 'success');
        refreshAllUI();
      } catch (err) {
        showToast('Erro ao editar: ' + err.message, 'error');
      }
    });
  }

}

// -------------------------------------------------------------
// MÓDULO DE SONHOS & METAS DO CASAL
// -------------------------------------------------------------
function initSonhosModule() {
  const catChipsContainer = document.getElementById('sonhos-category-chips');
  if (catChipsContainer) {
    catChipsContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-open-category-modal]');
      if (addBtn) {
        const mod = addBtn.getAttribute('data-open-category-modal') || 'sonhos';
        openCategoryEditorModal(mod);
        return;
      }
      const chip = e.target.closest('[data-sonho-filter]');
      if (!chip) return;
      currentSonhosFilter = chip.getAttribute('data-sonho-filter') || 'todas';
      playSubtleClick(state.settings.soundEnabled);
      renderSonhosTab(state, currentSonhosFilter);
    });
  }

  const gridEl = document.getElementById('sonhos-grid');
  if (gridEl) {
    gridEl.addEventListener('change', async (e) => {
      if (e.target.classList.contains('sonho-milestone-item')) {
        const sonhoId = e.target.getAttribute('data-sonho-id');
        const mId = e.target.getAttribute('data-milestone-id');
        toggleSonhoMilestone(state, sonhoId, mId);
        saveState(state);
        playTaskCompleteSound(state.settings.soundEnabled);
        renderSonhosTab(state, currentSonhosFilter);
        return;
      }

      // Adicionar foto via câmera ou galeria no sonho
      if (e.target.classList.contains('input-sonho-add-photo')) {
        const sonhoId = e.target.getAttribute('data-sonho-id');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Processando foto do sonho...', 'info', 1800);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToSonho(state, sonhoId, compressed);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Foto anexada ao sonho! ✨📷', 'success');
          renderSonhosTab(state, currentSonhosFilter);
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

      // Deletar foto do sonho
      const delPhotoBtn = e.target.closest('[data-del-sonho-photo]');
      if (delPhotoBtn) {
        const sonhoId = delPhotoBtn.getAttribute('data-del-sonho-photo');
        const pIdx = parseInt(delPhotoBtn.getAttribute('data-photo-idx'), 10);
        if (confirm('Excluir esta foto do sonho?')) {
          removePhotoFromSonho(state, sonhoId, pIdx);
          saveState(state);
          triggerAutoSyncIfEnabled();
          renderSonhosTab(state, currentSonhosFilter);
        }
        return;
      }

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

      
      // Editar lançamento de Sonho (Título, meta, valor guardado, status)
      const editSonhoBtn = e.target.closest('[data-edit-sonho]');
      if (editSonhoBtn) {
        const sId = editSonhoBtn.getAttribute('data-edit-sonho');
        const sonho = state.sonhos.find(s => s.id === sId);
        if (sonho) {
          document.getElementById('sonho-edit-id').value = sonho.id;
          document.getElementById('sonho-edit-title').value = sonho.title || '';
          document.getElementById('sonho-edit-category').value = sonho.category || 'viagem';
          document.getElementById('sonho-edit-status').value = sonho.status || 'sonhando';
          document.getElementById('sonho-edit-amount').value = sonho.targetAmount ? formatCurrency(sonho.targetAmount) : '';
          document.getElementById('sonho-edit-current').value = sonho.savedAmount ? formatCurrency(sonho.savedAmount) : '';
          document.getElementById('sonho-edit-date').value = sonho.targetDate || '';
          document.getElementById('sonho-edit-desc').value = sonho.description || '';
          openModal('modal-edit-sonho');
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


  // Formulário Editar Sonho do Casal
  const formEditSonho = document.getElementById('form-edit-sonho');
  if (formEditSonho) {
    formEditSonho.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('sonho-edit-id').value;
        const title = document.getElementById('sonho-edit-title').value.trim();
        const category = document.getElementById('sonho-edit-category').value;
        const status = document.getElementById('sonho-edit-status').value;
        const targetAmount = document.getElementById('sonho-edit-amount').value;
        const savedAmount = document.getElementById('sonho-edit-current').value;
        const targetDate = document.getElementById('sonho-edit-date').value;
        const description = document.getElementById('sonho-edit-desc').value.trim();

        if (!id || !title) return;

        updateSonho(state, id, {
          title,
          category,
          status,
          targetAmount,
          savedAmount,
          targetDate,
          description
        });

        saveState(state);
        triggerAutoSyncIfEnabled();
        closeModal('modal-edit-sonho');
        showToast('Sonho atualizado com sucesso! ✨', 'success');
        refreshAllUI();
      } catch (err) {
        showToast('Erro ao editar: ' + err.message, 'error');
      }
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

  const inputSheetsUrl = document.getElementById('settings-sheets-url');
  const inputSheetsToken = document.getElementById('settings-sheets-token');
  const autoSyncToggle = document.getElementById('settings-autosync-toggle');
  const soundToggle = document.getElementById('settings-sound-toggle');

  function syncSheetsInputsToState() {
    if (inputSheetsUrl) {
      state.settings.sheetsUrl = inputSheetsUrl.value.trim();
    }
    if (inputSheetsToken) {
      state.settings.sheetsToken = inputSheetsToken.value.trim();
    }
    if (autoSyncToggle) {
      state.settings.autoSync = autoSyncToggle.checked;
    }
    if (soundToggle) {
      state.settings.soundEnabled = soundToggle.checked;
    }
    saveState(state);
  }

  if (inputSheetsUrl) {
    inputSheetsUrl.addEventListener('input', syncSheetsInputsToState);
    inputSheetsUrl.addEventListener('change', syncSheetsInputsToState);
  }
  if (inputSheetsToken) {
    inputSheetsToken.addEventListener('input', syncSheetsInputsToState);
    inputSheetsToken.addEventListener('change', syncSheetsInputsToState);
  }
  if (autoSyncToggle) {
    autoSyncToggle.addEventListener('change', syncSheetsInputsToState);
  }
  if (soundToggle) {
    soundToggle.addEventListener('change', syncSheetsInputsToState);
  }

  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      state.settings.sheetsUrl = document.getElementById('settings-sheets-url').value.trim();
      state.settings.sheetsToken = document.getElementById('settings-sheets-token').value.trim();
      state.settings.autoSync = document.getElementById('settings-autosync-toggle').checked;
      state.settings.soundEnabled = document.getElementById('settings-sound-toggle').checked;

      state.users.user1.name = document.getElementById('settings-user1-name').value.trim() || 'Matheus';
      state.users.user2.name = document.getElementById('settings-user2-name').value.trim() || 'Scarlet';

      saveState(state);
      showToast('Configurações salvas!', 'success');
      refreshAllUI();
    });
  }

  // Senhas Individuais para Matheus e Scarlet
  const btnPassMatheus = document.getElementById('btn-change-pass-matheus');
  const btnPassScarlet = document.getElementById('btn-change-pass-scarlet');
  const formPass = document.getElementById('form-change-password');
  const passUserId = document.getElementById('pass-modal-user-id');
  const passUserName = document.getElementById('pass-modal-user-name');
  const passNewInput = document.getElementById('pass-modal-new-input');
  const passConfirmInput = document.getElementById('pass-modal-confirm-input');
  const passError = document.getElementById('pass-modal-error');
  const biometricsToggle = document.getElementById('settings-biometrics-toggle');

  function openPasswordModal(uId, name) {
    if (passUserId) passUserId.value = uId;
    if (passUserName) passUserName.textContent = name;
    if (passNewInput) passNewInput.value = '';
    if (passConfirmInput) passConfirmInput.value = '';
    if (passError) passError.style.display = 'none';
    openModal('modal-change-password');
    if (passNewInput) passNewInput.focus();
  }

  if (btnPassMatheus) {
    btnPassMatheus.addEventListener('click', () => {
      openPasswordModal('matheus', state.users.user1.name || 'Matheus');
    });
  }

  if (btnPassScarlet) {
    btnPassScarlet.addEventListener('click', () => {
      openPasswordModal('scarlet', state.users.user2.name || 'Scarlet');
    });
  }

  if (formPass) {
    formPass.addEventListener('submit', (e) => {
      e.preventDefault();
      const uId = passUserId ? passUserId.value : 'matheus';
      const p1 = passNewInput ? passNewInput.value : '';
      const p2 = passConfirmInput ? passConfirmInput.value : '';

      if (p1 !== p2) {
        if (passError) {
          passError.textContent = 'As senhas digitadas não conferem.';
          passError.style.display = 'block';
        }
        return;
      }

      setUserPassword(uId, p1);
      closeModal('modal-change-password');
      showToast(`Senha de ${uId === 'scarlet' ? 'Scarlet' : 'Matheus'} salva com sucesso! 🔐`, 'success', 3500);
    });
  }

  if (biometricsToggle) {
    biometricsToggle.addEventListener('change', (e) => {
      setBiometricsEnabled(e.target.checked);
      showToast(e.target.checked ? 'Desbloqueio por biometria ativado!' : 'Desbloqueio por biometria desativado.', 'info');
    });
  }

  if (btnTestSheets) {
    btnTestSheets.addEventListener('click', async () => {
      syncSheetsInputsToState();
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
      syncSheetsInputsToState();
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
      syncSheetsInputsToState();
      if (!confirm('Atenção: A restauração atualizará os dados locais com a versão mais recente salva na planilha. Deseja continuar?')) {
        return;
      }

      btnRestoreSheets.disabled = true;
      btnRestoreSheets.textContent = 'Restaurando da planilha...';

      try {
        const cloudData = await restoreFromSheets(state);
        if (cloudData) {
          state = applyCloudBackup(state, cloudData);
          saveState(state);
          populateCategorySelects(state);
          showToast('☁️ Dados restaurados com sucesso do Google Sheets!', 'success', 4000);
          refreshAllUI();
        } else {
          showToast('Nenhum dado encontrado na planilha.', 'info');
        }
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

// -------------------------------------------------------------
// SINCRONIZAÇÃO EM NUVEM E PRIORIDADE GOOGLE SHEETS
// -------------------------------------------------------------
let autoSyncTimeout = null;
function triggerAutoSyncIfEnabled(immediate = false) {
  if (!state.settings.sheetsUrl) return;

  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.className = 'sync-status-indicator syncing';
    syncDot.title = 'Sincronizando com o Google Sheets...';
  }

  const runSync = async () => {
    try {
      await backupToSheets(state);
      if (syncDot) {
        syncDot.className = 'sync-status-indicator synced';
        syncDot.title = `Sincronizado com Google Sheets às ${new Date().toLocaleTimeString('pt-BR')}`;
      }
    } catch (err) {
      console.warn('[Maracaju] Auto-sync falhou em background:', err);
      if (syncDot) {
        syncDot.className = 'sync-status-indicator error';
        syncDot.title = `Falha ao sincronizar: ${err.message}`;
      }
    }
  };

  if (immediate) {
    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    runSync();
  } else {
    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(runSync, 400);
  }
}

let lastSyncPullTime = 0;
let isSyncPulling = false;

async function syncPullFromSheets(silent = false) {
  if (!state.settings.sheetsUrl) return;
  if (isSyncPulling) return;

  const now = Date.now();
  if (silent && (now - lastSyncPullTime < 10000)) {
    return;
  }

  isSyncPulling = true;
  lastSyncPullTime = now;

  const syncDot = document.getElementById('sync-dot');
  if (syncDot) {
    syncDot.className = 'sync-status-indicator syncing';
    syncDot.title = 'Buscando versão mais recente na planilha...';
  }

  try {
    const cloudData = await restoreFromSheets(state);
    if (cloudData) {
      state = applyCloudBackup(state, cloudData);
      saveState(state);
      populateCategorySelects(state);
      refreshAllUI();

      if (syncDot) {
        syncDot.className = 'sync-status-indicator synced';
        syncDot.title = `Planilha sincronizada às ${new Date().toLocaleTimeString('pt-BR')}`;
      }

      if (!silent) {
        showToast('☁️ Dados atualizados da planilha!', 'success', 3000);
      }
    }
  } catch (err) {
    console.warn('[Maracaju] Sincronização inicial com Sheets falhou (usando cache local):', err.message);
    if (syncDot) {
      syncDot.className = 'sync-status-indicator ' + (state.settings.sheetsUrl ? 'synced' : '');
      syncDot.title = state.settings.sheetsUrl ? 'Google Sheets Conectado (offline temporário)' : 'Sem sincronização ativa';
    }
  } finally {
    isSyncPulling = false;
  }
}

// -------------------------------------------------------------
// MÓDULO DE MERCADO & LISTA DE COMPRAS
// -------------------------------------------------------------
function initComprasModule() {
  // Alternador de Visão (Lista do Mês vs Notas & Histórico)
  const comprasTab = document.getElementById('tab-compras');
  if (comprasTab) {
    comprasTab.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-compras-view]');
      if (viewBtn) {
        currentComprasView = viewBtn.getAttribute('data-compras-view') || 'lista';
        playSubtleClick(state.settings.soundEnabled);
        renderComprasTab(state, currentComprasCategory, currentComprasView);
        return;
      }

      const catChip = e.target.closest('[data-compras-cat]');
      if (catChip) {
        currentComprasCategory = catChip.getAttribute('data-compras-cat') || 'todas';
        playSubtleClick(state.settings.soundEnabled);
        renderComprasTab(state, currentComprasCategory, currentComprasView);
        return;
      }

      const addCatBtn = e.target.closest('[data-open-category-modal]');
      if (addCatBtn) {
        openCategoryEditorModal('compras');
        return;
      }
    });
  }

  // Interações na Lista de Itens (Marcar comprado, fotos, editar, excluir)
  const shoppingListEl = document.getElementById('shopping-items-list');
  if (shoppingListEl) {
    shoppingListEl.addEventListener('change', async (e) => {
      if (e.target.classList.contains('shopping-checkbox')) {
        const itemId = e.target.getAttribute('data-id');
        const item = toggleShoppingItem(state, itemId);
        saveState(state);
        triggerAutoSyncIfEnabled();

        if (item && item.bought) {
          playTaskCompleteSound(state.settings.soundEnabled);
          showToast('Item marcado como comprado! ✓', 'success', 2000);
        } else {
          playSubtleClick(state.settings.soundEnabled);
        }

        renderComprasTab(state, currentComprasCategory, currentComprasView);
        return;
      }

      // Adicionar foto do item (câmera ou galeria)
      if (e.target.classList.contains('input-shopping-add-photo')) {
        const itemId = e.target.getAttribute('data-shopping-id');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Processando foto do item...', 'info', 1800);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToShoppingItem(state, itemId, compressed);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Foto do item anexada com sucesso! 📷', 'success');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        } catch (err) {
          showToast(`Erro na foto: ${err.message}`, 'error');
        }
      }
    });

    shoppingListEl.addEventListener('click', (e) => {
      // Visualizar foto em tamanho ampliado
      const thumb = e.target.closest('[data-view-photo]');
      if (thumb && !e.target.classList.contains('carro-thumb-delete')) {
        const src = thumb.getAttribute('data-view-photo');
        const modalImg = document.getElementById('photo-viewer-target');
        if (modalImg) modalImg.src = src;
        openModal('modal-photo-viewer');
        return;
      }

      // Deletar foto do item de compras
      const delPhotoBtn = e.target.closest('[data-del-shopping-photo]');
      if (delPhotoBtn) {
        const itemId = delPhotoBtn.getAttribute('data-del-shopping-photo');
        const pIdx = parseInt(delPhotoBtn.getAttribute('data-photo-idx'), 10);
        if (confirm('Excluir foto deste item?')) {
          removePhotoFromShoppingItem(state, itemId, pIdx);
          saveState(state);
          triggerAutoSyncIfEnabled();
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        }
        return;
      }

      // Editar Item
      const editBtn = e.target.closest('[data-edit-shopping]');
      if (editBtn) {
        const itemId = editBtn.getAttribute('data-edit-shopping');
        const item = (state.compras || []).find(i => i.id === itemId);
        if (item) {
          populateCategorySelects(state);
          document.getElementById('shopping-edit-id').value = item.id;
          document.getElementById('shopping-edit-title').value = item.title || item.name || '';
          document.getElementById('shopping-edit-category').value = item.category || 'outros';
          const qtyParsed = parseQuantity(item.quantity || item.qty);
          document.getElementById('shopping-edit-qty').value = qtyParsed.text;
          const uPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
          document.getElementById('shopping-edit-price').value = uPrice ? formatCurrency(uPrice) : '';
          document.getElementById('shopping-edit-suggested-by').value = item.suggestedBy || 'ambos';
          document.getElementById('shopping-edit-notes').value = item.notes || '';
          updateShoppingSubtotalPreview('edit');
          openModal('modal-edit-shopping-item');
        }
        return;
      }

      // Excluir Item
      const delBtn = e.target.closest('[data-delete-shopping]');
      if (delBtn) {
        const itemId = delBtn.getAttribute('data-delete-shopping');
        if (confirm('Deseja remover este item da lista de compras?')) {
          deleteShoppingItem(state, itemId);
          saveState(state);
          showToast('Item removido da lista', 'info');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        }
      }
    });
  }

  // Interações nas Notas Fiscais Registradas (Ordenação, Busca, Expandir/Recolher, Fotos e Exclusão)
  const purchasesContainer = document.getElementById('market-purchases-container');
  if (purchasesContainer) {
    // Busca em tempo real com preservação do foco
    purchasesContainer.addEventListener('input', (e) => {
      if (e.target.id === 'purchases-filter-search') {
        currentPurchasesSearch = e.target.value;
        renderComprasTab(state, currentComprasCategory, currentComprasView, currentPurchasesSort, currentPurchasesSearch);
        const newInput = document.getElementById('purchases-filter-search');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      }
    });

    purchasesContainer.addEventListener('change', async (e) => {
      // Ordenação das compras (por data, nome do mercado ou valor)
      if (e.target.id === 'purchases-sort-select') {
        currentPurchasesSort = e.target.value;
        playSubtleClick(state.settings.soundEnabled);
        renderComprasTab(state, currentComprasCategory, currentComprasView, currentPurchasesSort, currentPurchasesSearch);
        return;
      }

      // Adicionar foto do cupom fiscal / produtos (câmera ou galeria)
      if (e.target.classList.contains('input-purchase-add-photo')) {
        const purchaseId = e.target.getAttribute('data-purchase-id');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Processando foto do comprovante...', 'info', 1800);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToMarketPurchase(state, purchaseId, compressed);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Foto do cupom anexada com sucesso! 🧾📷', 'success');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        } catch (err) {
          showToast(`Erro na foto: ${err.message}`, 'error');
        }
      }
    });

    purchasesContainer.addEventListener('click', (e) => {
      // Expandir todos os itens de todas as notas
      const expandAllBtn = e.target.closest('#btn-expand-all-purchases');
      if (expandAllBtn) {
        const allDetails = purchasesContainer.querySelectorAll('.market-receipt-items-details');
        allDetails.forEach(d => { d.open = true; });
        playSubtleClick(state.settings.soundEnabled);
        showToast('Itens expandidos', 'info', 1500);
        return;
      }

      // Recolher todos os itens de todas as notas
      const collapseAllBtn = e.target.closest('#btn-collapse-all-purchases');
      if (collapseAllBtn) {
        const allDetails = purchasesContainer.querySelectorAll('.market-receipt-items-details');
        allDetails.forEach(d => { d.open = false; });
        playSubtleClick(state.settings.soundEnabled);
        showToast('Itens recolhidos', 'info', 1500);
        return;
      }

      // Limpar filtro de busca
      const clearFilterBtn = e.target.closest('#btn-clear-purchases-filter');
      if (clearFilterBtn) {
        currentPurchasesSearch = '';
        renderComprasTab(state, currentComprasCategory, currentComprasView, currentPurchasesSort, currentPurchasesSearch);
        return;
      }

      // Visualizar foto em tamanho ampliado
      const thumb = e.target.closest('[data-view-photo]');
      if (thumb && !e.target.classList.contains('carro-thumb-delete')) {
        const src = thumb.getAttribute('data-view-photo');
        const modalImg = document.getElementById('photo-viewer-target');
        if (modalImg) modalImg.src = src;
        openModal('modal-photo-viewer');
        return;
      }

      // Deletar foto do registro de compra
      const delPhotoBtn = e.target.closest('[data-del-purchase-photo]');
      if (delPhotoBtn) {
        const purchaseId = delPhotoBtn.getAttribute('data-del-purchase-photo');
        const pIdx = parseInt(delPhotoBtn.getAttribute('data-photo-idx'), 10);
        if (confirm('Excluir foto deste comprovante?')) {
          removePhotoFromMarketPurchase(state, purchaseId, pIdx);
          saveState(state);
          triggerAutoSyncIfEnabled();
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        }
        return;
      }

      
      // Editar registro de compra / nota fiscal
      const editPurBtn = e.target.closest('[data-edit-purchase]');
      if (editPurBtn) {
        const purchaseId = editPurBtn.getAttribute('data-edit-purchase');
        const p = (state.comprasRegistros || []).find(item => item.id === purchaseId);
        if (p) {
          document.getElementById('purchase-edit-id').value = p.id;
          document.getElementById('purchase-edit-market').value = p.marketName || '';
          document.getElementById('purchase-edit-date').value = p.date || '';
          document.getElementById('purchase-edit-total').value = p.total ? formatCurrency(p.total) : '';
          document.getElementById('purchase-edit-notes').value = p.notes || '';
          let paySelect = document.getElementById('purchase-edit-payment-method');
          if (!paySelect) {
            const notesGroup = document.getElementById('purchase-edit-notes')?.closest('.form-group');
            if (notesGroup) {
              const payGroup = document.createElement('div');
              payGroup.className = 'form-group';
              payGroup.id = 'purchase-edit-payment-group';
              payGroup.innerHTML = `
                <label class="form-label">Forma de Pagamento</label>
                <select id="purchase-edit-payment-method" class="form-control" style="font-weight: 600;">
                  <option value="va">🥗 Vale Alimentação (VA)</option>
                  <option value="vr">🍽️ Vale Refeição (VR)</option>
                  <option value="pix">💠 Pix</option>
                  <option value="credito">💳 Cartão de Crédito</option>
                  <option value="debito">💳 Cartão de Débito</option>
                  <option value="dinheiro">💵 Dinheiro</option>
                </select>
              `;
              notesGroup.parentNode.insertBefore(payGroup, notesGroup);
              paySelect = document.getElementById('purchase-edit-payment-method');
            }
          }
          if (paySelect) {
            paySelect.value = p.paymentMethod || 'va';
          }
          openModal('modal-edit-purchase');
        }
        return;
      }

      const delBtn = e.target.closest('[data-delete-purchase]');
      if (delBtn) {
        const purchaseId = delBtn.getAttribute('data-delete-purchase');
        if (confirm('Deseja excluir este registro de nota fiscal de compra?')) {
          deleteMarketPurchase(state, purchaseId);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Registro de compra excluído', 'info');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        }
      }
    });
  }


  // Formulário Editar Registro de Compra / Nota Fiscal
  const formEditPurchase = document.getElementById('form-edit-purchase');
  if (formEditPurchase) {
    formEditPurchase.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('purchase-edit-id').value;
        const marketName = document.getElementById('purchase-edit-market').value.trim();
        const date = document.getElementById('purchase-edit-date').value;
        const total = document.getElementById('purchase-edit-total').value;
        const notes = document.getElementById('purchase-edit-notes').value.trim();
        const paymentMethod = document.getElementById('purchase-edit-payment-method')?.value || 'va';

        if (!id || !marketName) return;

        updateMarketPurchase(state, id, {
          marketName,
          date,
          total,
          notes,
          paymentMethod
        });

        saveState(state);
        triggerAutoSyncIfEnabled();
        closeModal('modal-edit-purchase');
        showToast('Registro de compra atualizado com sucesso!', 'success');
        renderComprasTab(state, currentComprasCategory, currentComprasView);
      } catch (err) {
        showToast('Erro ao editar: ' + err.message, 'error');
      }
    });
  }


  // Botão Limpar Comprados
  const btnClearBought = document.getElementById('btn-clear-bought-items');
  if (btnClearBought) {
    btnClearBought.addEventListener('click', () => {
      const removedCount = clearBoughtItems(state);
      if (removedCount === 0) {
        showToast('Nenhum item marcado como comprado para limpar.', 'info');
        return;
      }
      saveState(state);
      triggerAutoSyncIfEnabled();
      showToast(`${removedCount} ${removedCount === 1 ? 'item comprado foi limpo' : 'itens comprados foram limpos'} da lista! 🧹`, 'success');
      renderComprasTab(state, currentComprasCategory, currentComprasView);
    });
  }

  // Formulário Adicionar Item na Lista
  const formAddShopping = document.getElementById('form-add-shopping-item');
  if (formAddShopping) {
    formAddShopping.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const title = document.getElementById('shopping-input-title').value.trim();
        const category = document.getElementById('shopping-input-category').value || 'outros';
        const quantity = document.getElementById('shopping-input-qty').value.trim() || '1 un';
        const priceRaw = document.getElementById('shopping-input-price').value;
        const price = parseCurrency(priceRaw);
        const suggestedBy = document.getElementById('shopping-input-suggested-by').value || state.activeUserId;
        const notes = document.getElementById('shopping-input-notes').value.trim();

        if (!title) {
          showToast('Digite o nome do item a comprar.', 'warning');
          return;
        }

        addShoppingItem(state, {
          name: title,
          title,
          qty: quantity,
          quantity,
          category,
          price,
          suggestedBy,
          notes
        }, state.activeUserId);

        saveState(state);
        triggerAutoSyncIfEnabled();

        closeModal('modal-add-shopping-item');
        formAddShopping.reset();
        updateShoppingSubtotalPreview('input');
        showToast('Item adicionado à lista de compras! 🛒', 'success');
        renderComprasTab(state, currentComprasCategory, currentComprasView);
      } catch (err) {
        console.error('Erro ao adicionar item de compras:', err);
        showToast(err.message || 'Erro ao adicionar item.', 'error');
      }
    });
  }

  // Formulário Editar Item
  const formEditShopping = document.getElementById('form-edit-shopping-item');
  if (formEditShopping) {
    formEditShopping.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const itemId = document.getElementById('shopping-edit-id').value;
        const title = document.getElementById('shopping-edit-title').value.trim();
        const category = document.getElementById('shopping-edit-category').value;
        const quantity = document.getElementById('shopping-edit-qty').value.trim();
        const priceRaw = document.getElementById('shopping-edit-price').value;
        const price = parseCurrency(priceRaw);
        const suggestedBy = document.getElementById('shopping-edit-suggested-by').value;
        const notes = document.getElementById('shopping-edit-notes').value.trim();

        if (!title || !itemId) return;

        updateShoppingItem(state, itemId, {
          name: title,
          title,
          qty: quantity,
          quantity,
          category,
          price,
          suggestedBy,
          notes
        });

        saveState(state);
        triggerAutoSyncIfEnabled();

        closeModal('modal-edit-shopping-item');
        showToast('Item atualizado com sucesso!', 'success');
        renderComprasTab(state, currentComprasCategory, currentComprasView);
      } catch (err) {
        console.error('Erro ao editar item:', err);
        showToast(err.message || 'Erro ao atualizar item.', 'error');
      }
    });
  }

  // Atualização em tempo real de Subtotal Estimado nos modais de Compra
  function updateShoppingSubtotalPreview(prefix) {
    const qtyInput = document.getElementById(`shopping-${prefix}-qty`);
    const priceInput = document.getElementById(`shopping-${prefix}-price`);
    const box = document.getElementById(`shopping-${prefix}-subtotal-box`);
    const valSpan = document.getElementById(`shopping-${prefix}-subtotal-val`);
    if (!qtyInput || !priceInput || !box || !valSpan) return;

    const rawQty = qtyInput.value;
    const rawPrice = priceInput.value;
    const parsedQty = parseQuantity(rawQty);
    const unitPrice = parseCurrency(rawPrice);

    if (unitPrice > 0) {
      const total = Math.round(unitPrice * parsedQty.count * 100) / 100;
      box.style.display = 'block';
      if (parsedQty.count > 1) {
        valSpan.textContent = `${parsedQty.text} × ${formatCurrencyWithSymbol(unitPrice)} = ${formatCurrencyWithSymbol(total)}`;
      } else {
        valSpan.textContent = `${parsedQty.text} = ${formatCurrencyWithSymbol(total)}`;
      }
    } else {
      box.style.display = 'none';
    }
  }

  ['input', 'change', 'keyup'].forEach(evt => {
    const addQtyEl = document.getElementById('shopping-input-qty');
    const addPriceEl = document.getElementById('shopping-input-price');
    if (addQtyEl) addQtyEl.addEventListener(evt, () => updateShoppingSubtotalPreview('input'));
    if (addPriceEl) addPriceEl.addEventListener(evt, () => updateShoppingSubtotalPreview('input'));

    const editQtyEl = document.getElementById('shopping-edit-qty');
    const editPriceEl = document.getElementById('shopping-edit-price');
    if (editQtyEl) editQtyEl.addEventListener(evt, () => updateShoppingSubtotalPreview('edit'));
    if (editPriceEl) editPriceEl.addEventListener(evt, () => updateShoppingSubtotalPreview('edit'));
  });
}

// -------------------------------------------------------------
// LEITOR DE NOTAS FISCAIS (NFC-e QR CODE) & REGISTRO AUTOMÁTICO
// -------------------------------------------------------------

  // -----------------------------------------------------------
  // UPLOAD E PROCESSAMENTO DE NOTA FISCAL EM PDF
  // -----------------------------------------------------------
  const inputPdf = document.getElementById('input-upload-pdf-nfce');
  if (inputPdf) {
    inputPdf.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        showToast('Lendo e analisando nota fiscal em PDF... 📄🔍', 'info', 3000);
        const pdfText = await extractTextFromPdfFile(file);
        const invoiceData = parseNfceDanfeText(pdfText);

        if (!invoiceData || invoiceData.items.length === 0) {
          throw new Error('Não foi possível identificar os itens da compra neste PDF.');
        }

        // Se algum item já tiver sido apelidado no catálogo anteriormente, reaproveita o apelido!
        invoiceData.items.forEach(it => {
          const known = findCatalogProduct(state, { code: it.code, rawName: it.rawName });
          if (known && known.alias) {
            it.alias = known.alias;
            if (known.category) it.category = known.category;
            if (known.photos && known.photos.length > 0) it.photos = [...known.photos];
          }
        });

        currentPendingPdfInvoice = invoiceData;

        // AUTO-SAVE IMEDIATO: Salva a nota e todos os itens no histórico e catálogo
        const existingIdx = (state.comprasRegistros || []).findIndex(p => p.nfeKey && p.nfeKey === invoiceData.nfeKey);
        let savedPurchase;
        if (existingIdx >= 0) {
          state.comprasRegistros[existingIdx].items = [...invoiceData.items];
          state.comprasRegistros[existingIdx].total = invoiceData.total;
          state.comprasRegistros[existingIdx].marketName = invoiceData.marketName;
          savedPurchase = state.comprasRegistros[existingIdx];
        } else {
          savedPurchase = addMarketPurchase(state, {
            marketName: invoiceData.marketName,
            date: invoiceData.date,
            total: invoiceData.total,
            nfeKey: invoiceData.nfeKey,
            items: invoiceData.items,
            notes: `${invoiceData.items.length} itens (importados via PDF)`
          });
        }

        // Grava e memoriza todos os produtos no Catálogo Inteligente
        registerInvoiceInCatalog(state, invoiceData);

        // Salva estado e dispara sincronização com Google Sheets
        saveState(state);
        triggerAutoSyncIfEnabled();
        updateCatalogDatalist(state);

        // Muda a visualização para a aba de notas e atualiza toda a interface imediatamente
        currentComprasView = 'notas';
        refreshAllUI();

        // Abre o modal de conferência / apelidos
        renderPdfInvoiceConfirmation(state, invoiceData);
        openModal('modal-confirm-pdf-invoice');

        showToast(`🎉 Nota do ${invoiceData.marketName || 'Mercado'} salva! ${invoiceData.items.length} produtos registrados no app!`, 'success', 4500);
      } catch (err) {
        console.error('Erro ao ler PDF:', err);
        showToast('Erro ao processar PDF da nota: ' + err.message, 'error', 5000);
      } finally {
        inputPdf.value = '';
      }
    });
  }

  // Botão: Adicionar TODOS os itens da nota fiscal diretamente à Lista do Mês
  const btnAddAllPdfToList = document.getElementById('btn-add-all-pdf-to-list');
  if (btnAddAllPdfToList) {
    btnAddAllPdfToList.addEventListener('click', () => {
      if (!currentPendingPdfInvoice || !currentPendingPdfInvoice.items) return;

      currentPendingPdfInvoice.items.forEach(it => {
        addShoppingItem(state, {
          name: it.alias || it.rawName,
          category: it.category || 'mercearia',
          qty: `${it.qty} ${it.unit || 'un'}`,
          unitPrice: it.unitPrice,
          price: it.unitPrice,
          notes: `Importado de ${currentPendingPdfInvoice.marketName || 'Supermercado'}`
        });
      });

      saveState(state);
      triggerAutoSyncIfEnabled();
      refreshAllUI();
      showToast(`🛒 ${currentPendingPdfInvoice.items.length} itens colocados na sua Lista de Compras do Mês!`, 'success', 4000);
    });
  }

  // Botão rápido "+ Lista" a partir de qualquer produto nas Notas Fiscais
  const purchasesListContainer = document.getElementById('market-purchases-container');
  if (purchasesListContainer) {
    purchasesListContainer.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-quick-add-receipt-item]');
      if (!addBtn) return;

      const itemIdentifier = addBtn.getAttribute('data-quick-add-receipt-item');
      if (!itemIdentifier) return;

      // Busca no catálogo ou nos registros de compras
      let foundItem = findCatalogProduct(state, { code: itemIdentifier, rawName: itemIdentifier, alias: itemIdentifier });
      const itemName = foundItem ? (foundItem.alias || foundItem.rawName) : itemIdentifier;
      const itemCat = foundItem ? (foundItem.category || 'mercearia') : 'mercearia';
      const itemPrice = foundItem ? (foundItem.lastPrice || 0) : 0;
      const itemUnit = foundItem ? (foundItem.unit || 'un') : 'un';

      addShoppingItem(state, {
        name: itemName,
        category: itemCat,
        qty: `1 ${itemUnit}`,
        unitPrice: itemPrice,
        price: itemPrice,
        notes: foundItem ? `Última compra em ${foundItem.lastMarket || 'Supermercado'}` : ''
      });

      saveState(state);
      triggerAutoSyncIfEnabled();
      refreshAllUI();
      showToast(`✓ "${itemName}" adicionado à Lista de Compras do Mês! 🛒`, 'success', 3000);
    });
  }

  // Interações no Modal de Confirmação do PDF (Fotos e Checkbox)
  const pdfContainer = document.getElementById('pdf-extracted-items-list');
  if (pdfContainer) {
    pdfContainer.addEventListener('change', async (e) => {
      // Bater foto ou carregar imagem para item da nota
      if (e.target.classList.contains('input-pdf-item-photo')) {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const file = e.target.files && e.target.files[0];
        if (!file || !currentPendingPdfInvoice) return;

        try {
          showToast('Anexando foto do produto...', 'info', 1500);
          const compressed = await compressImageFile(file, 800, 0.72);
          const item = currentPendingPdfInvoice.items[idx];
          if (item) {
            if (!item.photos) item.photos = [];
            item.photos.push(compressed);
            const ind = document.getElementById(`pdf-photo-indicator-${idx}`);
            if (ind) ind.style.display = 'inline';
            showToast('Foto vinculada ao item! 📷', 'success');
          }
        } catch (err) {
          showToast('Erro na foto: ' + err.message, 'error');
        }
      }

      if (e.target.classList.contains('pdf-item-include')) {
        const card = e.target.closest('.pdf-item-card');
        if (card) {
          card.classList.toggle('unselected', !e.target.checked);
        }
      }
    });
  }

  // Salvar Nota Fiscal em PDF & Gravar no Catálogo
  const btnSavePdf = document.getElementById('btn-save-pdf-invoice');
  if (btnSavePdf) {
    btnSavePdf.addEventListener('click', () => {
      if (!currentPendingPdfInvoice) return;

      const marketInput = document.getElementById('pdf-invoice-market-name');
      const marketName = (marketInput ? marketInput.value : '').trim() || currentPendingPdfInvoice.marketName || 'Supermercado';
      currentPendingPdfInvoice.marketName = marketName;
      const pdfPayMethod = document.getElementById('pdf-invoice-payment-method')?.value || 'va';
      currentPendingPdfInvoice.paymentMethod = pdfPayMethod;

      const container = document.getElementById('pdf-extracted-items-list');
      const itemCards = container ? container.querySelectorAll('.pdf-item-card') : [];

      const itemsToKeep = [];
      const itemsToAddToList = [];

      itemCards.forEach(card => {
        const idx = parseInt(card.getAttribute('data-pdf-item-idx'), 10);
        const it = currentPendingPdfInvoice.items[idx];
        if (!it) return;

        const checkInc = card.querySelector('.pdf-item-include');
        if (checkInc && !checkInc.checked) return;

        const aliasInput = card.querySelector('.pdf-item-alias');
        if (aliasInput && aliasInput.value.trim()) {
          it.alias = aliasInput.value.trim();
        }

        const catSelect = card.querySelector('.pdf-item-category');
        if (catSelect && catSelect.value) {
          it.category = catSelect.value;
        }

        const addToListCheck = card.querySelector('.pdf-item-add-to-list');
        if (addToListCheck && addToListCheck.checked) {
          itemsToAddToList.push(it);
        }

        itemsToKeep.push(it);
      });

      currentPendingPdfInvoice.items = itemsToKeep;

      // Atualiza o registro da compra na lista de notas fiscais
      const regIdx = (state.comprasRegistros || []).findIndex(p => p.nfeKey && p.nfeKey === currentPendingPdfInvoice.nfeKey);
      if (regIdx >= 0) {
        state.comprasRegistros[regIdx].marketName = marketName;
        state.comprasRegistros[regIdx].paymentMethod = pdfPayMethod;
        state.comprasRegistros[regIdx].items = itemsToKeep;
      }

      // Atualiza o Catálogo Inteligente com os apelidos definidos
      registerInvoiceInCatalog(state, currentPendingPdfInvoice);

      // Coloca na lista do mês os itens que o usuário solicitou
      itemsToAddToList.forEach(it => {
        const res = addShoppingItem(state, {
          name: it.alias || it.rawName,
          category: it.category || 'mercearia',
          qty: `${it.qty} ${it.unit || 'un'}`,
          unitPrice: it.unitPrice,
          price: it.unitPrice,
          notes: `Comprado em ${marketName}`
        });
        const createdItem = res.item || res;
        if (it.photos && it.photos.length > 0) {
          createdItem.photos = [...it.photos];
        }
      });

      saveState(state);
      triggerAutoSyncIfEnabled();
      closeModal('modal-confirm-pdf-invoice');

      playTaskCompleteSound(state.settings.soundEnabled);
      showToast(`✨ Catálogo atualizado com ${itemsToKeep.length} produtos!`, 'success', 3500);

      updateCatalogDatalist(state);
      refreshAllUI();
      currentPendingPdfInvoice = null;
    });
  }

  // -----------------------------------------------------------
  // MODAL DO CATÁLOGO DE PRODUTOS & HISTÓRICO DE PREÇOS
  // -----------------------------------------------------------
  const btnOpenCatalog = document.getElementById('btn-open-catalog');
  const btnQuickCatalogAdd = document.getElementById('btn-quick-catalog-from-add');

  function openCatalogView(initialMode = 'comparator') {
    syncPurchasesIntoCatalog(state);
    currentCatalogMode = initialMode;
    currentCatalogCategoryFilter = 'todos';
    currentCatalogSearchQuery = '';
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';
    renderCatalogModal(state, '', 'todos', currentCatalogMode, currentCatalogSort);
    openModal('modal-catalog-products');
  }

  const btnOpenPriceComparator = document.getElementById('btn-open-price-comparator');
  if (btnOpenPriceComparator) {
    btnOpenPriceComparator.addEventListener('click', () => openCatalogView('comparator'));
  }

  // Alternador de modo (Comparador vs Já Comprados) e ordenação no modal do catálogo
  const catalogModalEl = document.getElementById('modal-catalog-products');
  if (catalogModalEl) {
    catalogModalEl.addEventListener('click', (e) => {
      const modeBtn = e.target.closest('[data-catalog-mode]');
      if (modeBtn) {
        currentCatalogMode = modeBtn.getAttribute('data-catalog-mode') || 'comparator';
        playSubtleClick(state.settings.soundEnabled);
        renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
        return;
      }

      const sortBtn = e.target.closest('[data-catalog-sort]');
      if (sortBtn) {
        currentCatalogSort = sortBtn.getAttribute('data-catalog-sort') || 'economy';
        playSubtleClick(state.settings.soundEnabled);
        renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
        return;
      }
    });
  }

  if (btnOpenCatalog) btnOpenCatalog.addEventListener('click', openCatalogView);
  if (btnQuickCatalogAdd) btnQuickCatalogAdd.addEventListener('click', openCatalogView);

  // Busca em tempo real no catálogo
  const catalogSearchInput = document.getElementById('catalog-search-input');
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      currentCatalogSearchQuery = e.target.value.trim();
      renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
    });
  }

  // Filtro de categorias no catálogo
  const catalogChipsContainer = document.getElementById('catalog-category-chips');
  if (catalogChipsContainer) {
    catalogChipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-catalog-cat]');
      if (!chip) return;
      currentCatalogCategoryFilter = chip.getAttribute('data-catalog-cat') || 'todos';
      playSubtleClick(state.settings.soundEnabled);
      renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
    });
  }

  // Ações dentro do grid do catálogo (+ Adicionar, Foto, Apelidar, Histórico)
  const catalogContainer = document.getElementById('catalog-products-container');
  if (catalogContainer) {
    // Adicionar foto a produto do catálogo
    catalogContainer.addEventListener('change', async (e) => {
      if (e.target.classList.contains('input-catalog-add-photo')) {
        const prodId = e.target.getAttribute('data-catalog-id');
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Processando foto do produto...', 'info', 1500);
          const compressed = await compressImageFile(file, 800, 0.72);
          addPhotoToCatalogProduct(state, prodId, compressed);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Foto vinculada ao produto e à lista! 📷', 'success');
          renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        } catch (err) {
          showToast('Erro na foto: ' + err.message, 'error');
        }
      }
    });

    catalogContainer.addEventListener('click', (e) => {
      // 1. + Adicionar à lista de compras
      const addBtn = e.target.closest('[data-add-catalog-to-list]');
      if (addBtn) {
        const prodId = addBtn.getAttribute('data-add-catalog-to-list');
        try {
          const item = addCatalogProductToShoppingList(state, prodId);
          saveState(state);
          triggerAutoSyncIfEnabled();
          playSubtleClick(state.settings.soundEnabled);
          showToast(`"${item.name}" adicionado à lista de compras! 🛒`, 'success');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        } catch (err) {
          showToast(err.message, 'error');
        }
        return;
      }

      // 2. Apelidar produto
      const aliasBtn = e.target.closest('[data-edit-catalog-alias]');
      if (aliasBtn) {
        const prodId = aliasBtn.getAttribute('data-edit-catalog-alias');
        const prod = (state.catalog || []).find(p => p.id === prodId);
        if (prod) {
          const newAlias = prompt(`Como você e a Scarlet costumam chamar este item?\n(Nome na nota: "${prod.rawName}")`, prod.alias || prod.rawName);
          if (newAlias && newAlias.trim()) {
            updateCatalogProductDetails(state, prodId, { alias: newAlias.trim() });
            saveState(state);
            triggerAutoSyncIfEnabled();
            showToast('Apelido do produto atualizado!', 'success');
            renderCatalogModal(state, currentCatalogSearchQuery, currentCatalogCategoryFilter, currentCatalogMode, currentCatalogSort);
            renderComprasTab(state, currentComprasCategory, currentComprasView);
            updateCatalogDatalist(state);
          }
        }
        return;
      }

      // 3. Ver histórico de preços
      const histBtn = e.target.closest('[data-view-product-history]');
      if (histBtn) {
        const prodId = histBtn.getAttribute('data-view-product-history');
        renderProductHistoryModal(state, prodId);
        openModal('modal-product-history');
        return;
      }
    });
  }

  // Clique em "Ver Histórico" a partir de qualquer lugar (ex: card da lista de compras)
  document.addEventListener('click', (e) => {
    const histBtn = e.target.closest('[data-view-product-history]');
    if (histBtn && !catalogContainer.contains(histBtn)) {
      const prodId = histBtn.getAttribute('data-view-product-history');
      renderProductHistoryModal(state, prodId);
      openModal('modal-product-history');
    }
  });

  // Botão "+ Colocar na Lista" dentro do modal de histórico
  const btnAddFromHist = document.getElementById('btn-add-to-list-from-history');
  if (btnAddFromHist) {
    btnAddFromHist.addEventListener('click', () => {
      const prodId = btnAddFromHist.getAttribute('data-add-catalog-to-list');
      if (prodId) {
        try {
          const item = addCatalogProductToShoppingList(state, prodId);
          saveState(state);
          triggerAutoSyncIfEnabled();
          playSubtleClick(state.settings.soundEnabled);
          showToast(`"${item.name}" adicionado à lista de compras! 🛒`, 'success');
          closeModal('modal-product-history');
          renderComprasTab(state, currentComprasCategory, currentComprasView);
        } catch (err) {
          showToast(err.message, 'error');
        }
      }
    });
  }

  // Preenchimento automático ao selecionar sugestão do catálogo no formulário de adicionar
  const inputShoppingTitle = document.getElementById('shopping-input-title');
  if (inputShoppingTitle) {
    inputShoppingTitle.addEventListener('change', () => {
      const val = inputShoppingTitle.value.trim();
      if (!val) return;

      const prod = findCatalogProduct(state, { alias: val, rawName: val });
      if (prod) {
        const catSelect = document.getElementById('shopping-input-category');
        const priceInput = document.getElementById('shopping-input-price');

        if (catSelect && prod.category) {
          catSelect.value = prod.category;
        }
        if (priceInput && prod.lastPrice && !priceInput.value) {
          priceInput.value = formatCurrency(prod.lastPrice);
          updateShoppingSubtotalPreview('input');
        }
      }
    });
  }

  // -------------------------------------------------------------
  // CONTROLE DO MODAL DE AJUSTE DE BENEFÍCIOS (VA / VR)
  // -------------------------------------------------------------
  const formAdjustBenefits = document.getElementById('form-adjust-benefits');
  const benefitsMonthInput = document.getElementById('benefits-input-month');
  const benefitsVaInput = document.getElementById('benefits-input-va-fixed');
  const benefitsVrDailyInput = document.getElementById('benefits-input-vr-daily');
  const benefitsVrDaysInput = document.getElementById('benefits-input-vr-days');
  const benefitsVaRolloverInput = document.getElementById('benefits-input-va-rollover');
  const benefitsVrRolloverInput = document.getElementById('benefits-input-vr-rollover');

  function updateBenefitsLivePreview() {
    const vaVal = benefitsVaInput ? parseCurrency(benefitsVaInput.value) : 2050;
    const vrDailyVal = benefitsVrDailyInput ? parseCurrency(benefitsVrDailyInput.value) : 65;
    const vrDaysVal = benefitsVrDaysInput ? (parseInt(benefitsVrDaysInput.value, 10) || 0) : 0;
    const vaRollVal = benefitsVaRolloverInput ? parseCurrency(benefitsVaRolloverInput.value) : 0;
    const vrRollVal = benefitsVrRolloverInput ? parseCurrency(benefitsVrRolloverInput.value) : 0;

    const vrTotal = Math.round((vrDailyVal * vrDaysVal + vrRollVal) * 100) / 100;
    const vaTotal = Math.round((vaVal + vaRollVal) * 100) / 100;
    const combinedTotal = Math.round((vaTotal + vrTotal) * 100) / 100;

    const vrPreview = document.getElementById('benefits-preview-vr-total');
    const combinedPreview = document.getElementById('benefits-preview-combined-total');
    if (vrPreview) vrPreview.textContent = formatCurrencyWithSymbol(vrTotal);
    if (combinedPreview) combinedPreview.textContent = formatCurrencyWithSymbol(combinedTotal);
  }

  if (benefitsMonthInput) {
    benefitsMonthInput.addEventListener('change', () => {
      const selectedMonth = benefitsMonthInput.value;
      if (selectedMonth && typeof prepareBenefitsModal === 'function') {
        prepareBenefitsModal(selectedMonth);
      }
    });
  }

  [benefitsVaInput, benefitsVrDailyInput, benefitsVrDaysInput, benefitsVaRolloverInput, benefitsVrRolloverInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', updateBenefitsLivePreview);
      inp.addEventListener('change', updateBenefitsLivePreview);
    }
  });

  if (formAdjustBenefits) {
    formAdjustBenefits.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const monthKey = benefitsMonthInput?.value || new Date().toISOString().slice(0, 7);
        const vaFixed = benefitsVaInput ? parseCurrency(benefitsVaInput.value) : 2050;
        const vrDaily = benefitsVrDailyInput ? parseCurrency(benefitsVrDailyInput.value) : 65;
        const vrDays = benefitsVrDaysInput ? (parseInt(benefitsVrDaysInput.value, 10) || 0) : 0;
        const vaRollover = benefitsVaRolloverInput ? parseCurrency(benefitsVaRolloverInput.value) : 0;
        const vrRollover = benefitsVrRolloverInput ? parseCurrency(benefitsVrRolloverInput.value) : 0;

        updateMonthlyBenefitsConfig(state, monthKey, {
          vaFixed,
          vrDaily,
          vrDays,
          vaRollover,
          vrRollover
        });

        saveState(state);
        triggerAutoSyncIfEnabled();
        closeModal('modal-adjust-benefits');
        showToast('Benefícios VA/VR salvos com sucesso! 🥗🍽️', 'success');
        refreshAllUI();
      } catch (err) {
        showToast('Erro ao salvar benefícios: ' + err.message, 'error');
      }
    });
  }

function initQrCodeScanner() {
  const btnScan = document.getElementById('btn-scan-nfce-qr');
  const videoEl = document.getElementById('qr-video');
  const btnToggleCam = document.getElementById('btn-toggle-camera');
  const fileInput = document.getElementById('qr-file-input');
  const statusMsg = document.getElementById('qr-status-msg');
  const previewBox = document.getElementById('qr-preview-result');
  const resMarket = document.getElementById('qr-res-market');
  const resDate = document.getElementById('qr-res-date');
  const resTotal = document.getElementById('qr-res-total');
  const resKey = document.getElementById('qr-res-key');
  const btnConfirm = document.getElementById('btn-confirm-qr-purchase');
  const manualInput = document.getElementById('qr-manual-input');
  const btnManualSubmit = document.getElementById('btn-qr-manual-submit');

  let activeStream = null;
  let scanInterval = null;
  let currentFacingMode = 'environment';
  let pendingPurchase = null;

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMsg) statusMsg.textContent = 'Câmera não suportada neste navegador. Use a foto ou link.';
      return;
    }

    try {
      if (activeStream) {
        stopCamera();
      }

      activeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (videoEl) {
        videoEl.srcObject = activeStream;
        await videoEl.play();
      }

      if (statusMsg) statusMsg.textContent = 'Câmera ativa! Aponte para o QR Code da nota fiscal.';
      startScanningLoop();
    } catch (err) {
      console.warn('Erro ao acessar câmera:', err);
      if (statusMsg) statusMsg.textContent = 'Acesso à câmera não concedido. Você pode anexar foto ou colar o link.';
    }
  }

  function stopCamera() {
    if (scanInterval) {
      clearInterval(scanInterval);
      scanInterval = null;
    }
    if (activeStream) {
      activeStream.getTracks().forEach(t => t.stop());
      activeStream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
  }

  function startScanningLoop() {
    if (window.BarcodeDetector) {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      scanInterval = setInterval(async () => {
        if (!videoEl || videoEl.readyState < 2) return;
        try {
          const barcodes = await detector.detect(videoEl);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleDetectedCode(rawValue);
          }
        } catch (e) {
          // Frame skip
        }
      }, 500);
    }
  }

  function handleDetectedCode(rawText) {
    if (!rawText) return;
    const parsed = parseNfceQrCodeText(rawText);

    pendingPurchase = {
      marketName: parsed.marketName || 'Supermercado',
      date: parsed.date || getLocalDateString(),
      totalAmount: parsed.totalAmount || 0,
      accessKey: parsed.accessKey || '',
      rawUrl: parsed.rawUrl || rawText,
      items: parsed.items || []
    };

    if (previewBox) {
      if (resMarket) resMarket.textContent = pendingPurchase.marketName;
      if (resDate) resDate.textContent = pendingPurchase.date;
      if (resTotal) resTotal.textContent = formatCurrencyWithSymbol(pendingPurchase.totalAmount);
      if (resKey) resKey.textContent = pendingPurchase.accessKey || pendingPurchase.rawUrl.slice(0, 44);
      previewBox.style.display = 'block';
    }

    if (statusMsg) statusMsg.textContent = 'QR Code lido com sucesso! Confirme os dados abaixo:';
    playTaskCompleteSound(state.settings.soundEnabled);

    // Se temos a URL online, tenta enriquecer com os itens em background
    if (parsed.rawUrl && parsed.rawUrl.startsWith('http')) {
      fetchNfceDetailsOnline(parsed.rawUrl).then(enhanced => {
        if (enhanced && enhanced.success) {
          if (enhanced.marketName) pendingPurchase.marketName = enhanced.marketName;
          if (enhanced.totalAmount) pendingPurchase.totalAmount = enhanced.totalAmount;
          if (enhanced.items && enhanced.items.length) pendingPurchase.items = enhanced.items;
          if (resMarket) resMarket.textContent = pendingPurchase.marketName;
          if (resTotal) resTotal.textContent = formatCurrencyWithSymbol(pendingPurchase.totalAmount);
        }
      }).catch(() => {});
    }
  }

  if (btnScan) {
    btnScan.addEventListener('click', () => {
      openModal('modal-qr-scanner');
      if (previewBox) previewBox.style.display = 'none';
      pendingPurchase = null;
      startCamera();
    });
  }

  if (btnToggleCam) {
    btnToggleCam.addEventListener('click', () => {
      currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      startCamera();
    });
  }

  // Upload de Foto do QR Code
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (statusMsg) statusMsg.textContent = 'Processando imagem da nota...';

      if (window.BarcodeDetector) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const imgBitmap = await createImageBitmap(file);
          const barcodes = await detector.detect(imgBitmap);
          if (barcodes && barcodes.length > 0) {
            handleDetectedCode(barcodes[0].rawValue);
            return;
          }
        } catch (err) {
          console.warn('BarcodeDetector error:', err);
        }
      }

      if (statusMsg) statusMsg.textContent = 'Não conseguimos ler o QR da imagem diretamente. Cole o link ou chave abaixo.';
    });
  }

  // Entrada manual do link ou chave
  if (btnManualSubmit && manualInput) {
    btnManualSubmit.addEventListener('click', () => {
      const val = manualInput.value.trim();
      if (!val) {
        showToast('Digite ou cole a URL ou chave da nota', 'error');
        return;
      }
      handleDetectedCode(val);
      manualInput.value = '';
    });
  }

  // Confirmação do Registro da Compra
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!pendingPurchase) return;

      addMarketPurchase(state, pendingPurchase);
      saveState(state);
      triggerAutoSyncIfEnabled();

      stopCamera();
      closeModal('modal-qr-scanner');
      pendingPurchase = null;

      currentComprasView = 'notas';
      triggerConfetti();
      playTaskCompleteSound(state.settings.soundEnabled);
      showToast('Compra de mercado registrada com sucesso no mês! 🧾🎉', 'success', 4000);
      refreshAllUI();
    });
  }

  // Desativa câmera ao fechar modal
  document.querySelectorAll('#btn-close-qr-scanner, [data-close-modal]').forEach(b => {
    b.addEventListener('click', () => {
      stopCamera();
    });
  });
}

// -------------------------------------------------------------
// GESTÃO DE CATEGORIAS & EMOJIS (Tarefas, Compras, Carro, etc)
// -------------------------------------------------------------
function openCategoryEditorModal(targetModule, categoryIdToEdit = null) {
  const titleEl = document.getElementById('category-modal-title');
  const idInput = document.getElementById('category-edit-id');
  const moduleSelect = document.getElementById('category-input-module');
  const labelInput = document.getElementById('category-input-label');
  const iconInput = document.getElementById('category-input-icon');
  const previewIcon = document.getElementById('preview-chip-icon');
  const previewLabel = document.getElementById('preview-chip-label');

  renderQuickEmojis();

  if (categoryIdToEdit) {
    const cat = findCategory(state, targetModule, categoryIdToEdit);
    if (titleEl) titleEl.textContent = '✏️ Editar Categoria';
    if (idInput) idInput.value = cat.id;
    if (moduleSelect) moduleSelect.value = targetModule;
    if (labelInput) labelInput.value = cat.label;
    if (iconInput) iconInput.value = cat.icon;
    if (previewIcon) previewIcon.textContent = cat.icon;
    if (previewLabel) previewLabel.textContent = cat.label;
  } else {
    if (titleEl) titleEl.textContent = '➕ Nova Categoria';
    if (idInput) idInput.value = '';
    if (moduleSelect) moduleSelect.value = targetModule || currentCategoryManageModule;
    if (labelInput) labelInput.value = '';
    if (iconInput) iconInput.value = '🏷️';
    if (previewIcon) previewIcon.textContent = '🏷️';
    if (previewLabel) previewLabel.textContent = 'Nova Categoria';
  }

  openModal('modal-category-editor');
  if (labelInput) labelInput.focus();
}

function initCategoryManagement() {
  const moduleChips = document.querySelectorAll('#categories-module-selector [data-manage-module]');
  const btnAddSettings = document.getElementById('btn-add-category-settings');
  const categoriesListEl = document.getElementById('categories-list-container');
  const formEditor = document.getElementById('form-category-editor');
  const iconInput = document.getElementById('category-input-icon');
  const labelInput = document.getElementById('category-input-label');
  const previewIcon = document.getElementById('preview-chip-icon');
  const previewLabel = document.getElementById('preview-chip-label');
  const quickEmojiGrid = document.getElementById('quick-emoji-grid');

  // Alternador de módulo na aba Ajustes
  moduleChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      moduleChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategoryManageModule = chip.getAttribute('data-manage-module') || 'tarefas';
      playSubtleClick(state.settings.soundEnabled);
      renderCategoriesManager(state, currentCategoryManageModule);
    });
  });

  // Botão Adicionar Categoria na aba Ajustes
  if (btnAddSettings) {
    btnAddSettings.addEventListener('click', () => {
      openCategoryEditorModal(currentCategoryManageModule);
    });
  }

  // Atualização em tempo real da pré-visualização do chip
  if (iconInput) {
    iconInput.addEventListener('input', () => {
      if (previewIcon) previewIcon.textContent = iconInput.value || '🏷️';
    });
  }
  if (labelInput) {
    labelInput.addEventListener('input', () => {
      if (previewLabel) previewLabel.textContent = labelInput.value || 'Exemplo';
    });
  }

  // Seleção rápida de emojis da grade
  if (quickEmojiGrid) {
    quickEmojiGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-emoji]');
      if (!btn) return;
      const emoji = btn.getAttribute('data-emoji');
      if (emoji && iconInput) {
        iconInput.value = emoji;
        if (previewIcon) previewIcon.textContent = emoji;
        playSubtleClick(state.settings.soundEnabled);
      }
    });
  }

  // Ações na lista de categorias (Editar e Excluir)
  if (categoriesListEl) {
    categoriesListEl.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-action-edit-cat]');
      if (editBtn) {
        const catId = editBtn.getAttribute('data-action-edit-cat');
        const mod = editBtn.getAttribute('data-cat-module') || currentCategoryManageModule;
        openCategoryEditorModal(mod, catId);
        return;
      }

      const delBtn = e.target.closest('[data-action-delete-cat]');
      if (delBtn) {
        const catId = delBtn.getAttribute('data-action-delete-cat');
        const mod = delBtn.getAttribute('data-cat-module') || currentCategoryManageModule;
        if (confirm('Deseja excluir esta categoria? Os itens que a utilizam manterão o registro.')) {
          deleteCategory(state, mod, catId);
          saveState(state);
          triggerAutoSyncIfEnabled();
          showToast('Categoria excluída', 'info');
          populateCategorySelects(state);
          renderCategoriesManager(state, mod);
        }
      }
    });
  }

  // Submissão do formulário de criação/edição de categoria
  if (formEditor) {
    formEditor.addEventListener('submit', (e) => {
      e.preventDefault();
      const catId = document.getElementById('category-edit-id').value;
      const mod = document.getElementById('category-input-module').value;
      const label = document.getElementById('category-input-label').value.trim();
      const icon = document.getElementById('category-input-icon').value.trim() || '🏷️';

      if (!label) return;

      if (catId) {
        updateCategory(state, mod, catId, { label, icon });
        showToast('Categoria atualizada!', 'success');
      } else {
        addCategory(state, mod, { label, icon });
        showToast('Nova categoria criada!', 'success');
      }

      saveState(state);
      triggerAutoSyncIfEnabled();
      closeModal('modal-category-editor');
      formEditor.reset();
      populateCategorySelects(state);
      currentCategoryManageModule = mod;
      renderCategoriesManager(state, mod);
      const mChips = document.querySelectorAll('#categories-module-selector [data-manage-module]');
      mChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-manage-module') === mod));
    });
  }
}

// -------------------------------------------------------------
// CONTROLE DE MODAIS
// -------------------------------------------------------------
// -------------------------------------------------------------
// AJUSTE & PREENCHIMENTO DO MODAL DE BENEFÍCIOS (VA / VR)
// -------------------------------------------------------------
function prepareBenefitsModal(monthKey) {
  if (!state) return;
  const targetMonth = monthKey || (typeof getActiveBenefitsCycle === 'function' ? getActiveBenefitsCycle() : (typeof getCurrentBenefitCycleKey === 'function' ? getCurrentBenefitCycleKey() : '2026-10'));
  const monthInput = document.getElementById('benefits-input-month');
  if (monthInput) monthInput.value = targetMonth;

  const details = getMonthlyBenefitDetails(state, targetMonth);
  const vaInput = document.getElementById('benefits-input-va-fixed');
  const vrDailyInput = document.getElementById('benefits-input-vr-daily');
  const vrDaysInput = document.getElementById('benefits-input-vr-days');
  const vaRolloverInput = document.getElementById('benefits-input-va-rollover');
  const vrRolloverInput = document.getElementById('benefits-input-vr-rollover');
  const vrTotalPreview = document.getElementById('benefits-preview-vr-total');
  const combinedTotalPreview = document.getElementById('benefits-preview-combined-total');

  if (vaInput) vaInput.value = formatCurrency(details.vaDeposit || details.vaBaseFixed || 2050);
  if (vrDailyInput) vrDailyInput.value = formatCurrency(details.vrDaily);
  if (vrDaysInput) vrDaysInput.value = details.vrDays;
  if (vaRolloverInput) vaRolloverInput.value = details.vaRollover ? formatCurrency(details.vaRollover) : '0,00';
  if (vrRolloverInput) vrRolloverInput.value = details.vrRollover ? formatCurrency(details.vrRollover) : '0,00';
  if (vrTotalPreview) vrTotalPreview.textContent = formatCurrencyWithSymbol(details.vrTotal);
  if (combinedTotalPreview) combinedTotalPreview.textContent = formatCurrencyWithSymbol(details.totalBenefit);
}

// -------------------------------------------------------------
// DELEGAÇÃO GLOBAL DE AÇÕES DE EDIÇÃO (Resiliente em Celulares)
// -------------------------------------------------------------
function initGlobalEditDelegation() {
  document.addEventListener('click', (e) => {
    // 0. Alternar Ciclo de Benefícios VA / VR
    const cycleBtn = e.target.closest('[data-benefits-cycle]');
    if (cycleBtn) {
      e.preventDefault();
      e.stopPropagation();
      const cycleKey = cycleBtn.getAttribute('data-benefits-cycle');
      if (cycleKey && typeof setBenefitsCycle === 'function') {
        setBenefitsCycle(cycleKey);
        playSubtleClick(state?.settings?.soundEnabled);
        renderComprasTab(state, currentComprasCategory, currentComprasView, currentPurchasesSort, currentPurchasesSearch);
      }
      return;
    }

    // 0.1 Encerrar ciclo de benefícios antecipadamente ou com atraso
    const closeCycleBtn = e.target.closest('[data-action="close-benefit-cycle"]');
    if (closeCycleBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleCloseBenefitCycle();
      return;
    }

    // 0.2 Abrir Modal de Histórico de Benefícios VA / VR
    const histBtn = e.target.closest('[data-open-modal="modal-benefits-history"]');
    if (histBtn) {
      if (typeof renderBenefitsHistoryModal === 'function') {
        renderBenefitsHistoryModal(state);
      }
      openModal('modal-benefits-history');
      return;
    }

    // 1. Abrir Modal de Ajuste de Benefícios VA / VR
    const benBtn = e.target.closest('[data-open-modal="modal-adjust-benefits"]');
    if (benBtn) {
      prepareBenefitsModal();
      openModal('modal-adjust-benefits');
      return;
    }

    // 2. Editar Registro de Compra / Nota Fiscal
    const editPurBtn = e.target.closest('[data-edit-purchase]');
    if (editPurBtn) {
      const purchaseId = editPurBtn.getAttribute('data-edit-purchase');
      const p = (state.comprasRegistros || []).find(item => item.id === purchaseId);
      if (p) {
        const idEl = document.getElementById('purchase-edit-id');
        const marketEl = document.getElementById('purchase-edit-market');
        const dateEl = document.getElementById('purchase-edit-date');
        const totalEl = document.getElementById('purchase-edit-total');
        const notesEl = document.getElementById('purchase-edit-notes');
        const payEl = document.getElementById('purchase-edit-payment-method');

        if (idEl) idEl.value = p.id;
        if (marketEl) marketEl.value = p.marketName || '';
        if (dateEl) dateEl.value = p.date || '';
        const tot = (p.total !== undefined && p.total !== null) ? p.total : (p.totalAmount || 0);
        if (totalEl) totalEl.value = tot ? formatCurrency(tot) : '';
        if (notesEl) notesEl.value = p.notes || '';
        if (payEl) payEl.value = p.paymentMethod || 'va';

        openModal('modal-edit-purchase');
      }
      return;
    }

    // 3. Editar Item da Lista de Compras
    const editShoppingBtn = e.target.closest('[data-edit-shopping]');
    if (editShoppingBtn) {
      const itemId = editShoppingBtn.getAttribute('data-edit-shopping');
      const item = (state.compras || []).find(i => i.id === itemId);
      if (item) {
        populateCategorySelects(state);
        const idEl = document.getElementById('shopping-edit-id');
        const titleEl = document.getElementById('shopping-edit-title');
        const catEl = document.getElementById('shopping-edit-category');
        const qtyEl = document.getElementById('shopping-edit-qty');
        const priceEl = document.getElementById('shopping-edit-price');
        const sugEl = document.getElementById('shopping-edit-suggested-by');
        const notesEl = document.getElementById('shopping-edit-notes');

        if (idEl) idEl.value = item.id;
        if (titleEl) titleEl.value = item.title || item.name || '';
        if (catEl) catEl.value = item.category || 'outros';
        const qtyParsed = parseQuantity(item.quantity || item.qty);
        if (qtyEl) qtyEl.value = qtyParsed.text;
        const uPrice = item.unitPrice !== undefined ? item.unitPrice : (item.price || 0);
        if (priceEl) priceEl.value = uPrice ? formatCurrency(uPrice) : '';
        if (sugEl) sugEl.value = item.suggestedBy || 'ambos';
        if (notesEl) notesEl.value = item.notes || '';
        updateShoppingSubtotalPreview('edit');
        openModal('modal-edit-shopping-item');
      }
      return;
    }
  });
}

function handleCloseBenefitCycle() {
  const cycleKey = currentBenefitsCycle || getCurrentBenefitCycleKey(state);
  const details = getMonthlyBenefitDetails(state, cycleKey);
  const todayStr = new Date().toISOString().slice(0, 10);

  const confirmMsg = `Deseja encerrar o ${details.cycleLabel} e transferir as sobras para o próximo período?\n\n` +
    `• VA restante: ${formatCurrencyWithSymbol(details.vaBalance)}\n` +
    `• VR restante: ${formatCurrencyWithSymbol(details.vrBalance)}\n\n` +
    `Esses saldos residuais serão somados ao próximo mês como crédito acumulado.`;

  if (!confirm(confirmMsg)) return;

  const newDateStr = prompt('Informe a data de início/crédito do novo ciclo (AAAA-MM-DD):', todayStr);
  if (!newDateStr) return;

  try {
    const res = closeBenefitCycleEarly(state, cycleKey, newDateStr.trim(), {
      vaEndingBalance: details.vaBalance,
      vrEndingBalance: details.vrBalance
    });
    if (res.nextCycleKey && typeof setBenefitsCycle === 'function') {
      setBenefitsCycle(res.nextCycleKey);
    }
    saveState(state);
    triggerAutoSyncIfEnabled();
    showToast(`Ciclo encerrado com sucesso! Sobras transferidas para o novo ciclo. 🎉`, 'success', 4500);
    refreshAllUI();
  } catch (err) {
    showToast('Erro ao encerrar ciclo: ' + err.message, 'error');
  }
}

function initModals() {
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open-modal]');
    if (openBtn) {
      e.preventDefault();
      try {
        if (typeof populateCategorySelects === 'function' && state) {
          populateCategorySelects(state);
        }
      } catch (err) {}
      const modalId = openBtn.getAttribute('data-open-modal');
      if (modalId) {
        openModal(modalId);
      }
      return;
    }

    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      e.preventDefault();
      const modal = closeBtn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
      return;
    }

    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
    }
  });
}

function openModal(id) {
  if (id === 'modal-adjust-benefits') prepareBenefitsModal();
  if (id === 'modal-benefits-history' && typeof renderBenefitsHistoryModal === 'function') renderBenefitsHistoryModal(state);
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
