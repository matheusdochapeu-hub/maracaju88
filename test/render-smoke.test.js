// Smoke test de renderização: executa todos os renderizadores da UI contra um
// DOM falso, com um estado "cheio" (todas as abas com dados). O objetivo é
// pegar ReferenceError/TypeError em caminhos que os testes estáticos não veem
// (foi assim que a aba Nossos Pets quebrou na v2.7.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const errors = [];

function makeClassList() {
  const set = new Set();
  return {
    add: (...names) => names.forEach((n) => set.add(n)),
    remove: (...names) => names.forEach((n) => set.delete(n)),
    toggle: (name, force) => {
      const on = force === undefined ? !set.has(name) : !!force;
      if (on) set.add(name); else set.delete(name);
      return on;
    },
    contains: (name) => set.has(name)
  };
}

function makeEl(id = '') {
  const el = {
    id,
    innerHTML: '',
    textContent: '',
    value: '',
    src: '',
    checked: false,
    disabled: false,
    hidden: false,
    dataset: {},
    style: {},
    children: [],
    files: null,
    classList: makeClassList(),
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    removeAttribute() {},
    getAttribute() { return null; },
    hasAttribute() { return false; },
    querySelector: () => makeEl(),
    querySelectorAll: () => [],
    closest: () => null,
    appendChild(child) { el.children.push(child); return child; },
    insertBefore(child) { el.children.push(child); return child; },
    removeChild() {},
    remove() {},
    replaceChildren() {},
    insertAdjacentHTML() {},
    insertAdjacentElement() {},
    focus() {},
    blur() {},
    click() {},
    scrollIntoView() {},
    scrollTo() {},
    animate: () => ({ finished: Promise.resolve(), cancel() {} }),
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100, bottom: 100, right: 100 }),
    cloneNode: () => makeEl(id),
    matches: () => false,
    contains: () => false
  };
  return el;
}

function installDom() {
  const cache = new Map();
  const getEl = (id) => {
    if (!cache.has(id)) cache.set(id, makeEl(id));
    return cache.get(id);
  };

  const define = (name, value) => {
    try {
      Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
    } catch (err) {
      globalThis[name] = value;
    }
  };

  // Rastreia timers criados pelo app para o processo de teste conseguir encerrar
  const timers = new Set();
  const rawSetTimeout = globalThis.setTimeout;
  const rawSetInterval = globalThis.setInterval;
  const rawClearTimeout = globalThis.clearTimeout;
  const rawClearInterval = globalThis.clearInterval;
  const trackedSetTimeout = (fn, ms, ...args) => {
    const id = rawSetTimeout(fn, ms, ...args);
    timers.add(id);
    return id;
  };
  const trackedSetInterval = (fn, ms, ...args) => {
    const id = rawSetInterval(fn, ms, ...args);
    timers.add(id);
    return id;
  };
  define('setTimeout', trackedSetTimeout);
  define('setInterval', trackedSetInterval);
  define('clearTimeout', (id) => { timers.delete(id); return rawClearTimeout(id); });
  define('clearInterval', (id) => { timers.delete(id); return rawClearInterval(id); });

  const storage = new Map();
  define('localStorage', {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
    key: (i) => Array.from(storage.keys())[i] ?? null,
    get length() { return storage.size; }
  });

  const listeners = new Map();
  const on = (type, fn) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  };
  const fire = (type, event = {}) => {
    (listeners.get(type) || []).forEach((fn) => fn(event));
  };

  define('document', {
    getElementById: getEl,
    querySelector: () => makeEl(),
    querySelectorAll: () => [],
    createElement: (tag) => makeEl(tag),
    createTextNode: (t) => ({ textContent: t }),
    addEventListener: on,
    removeEventListener() {},
    dispatchEvent: () => true,
    body: makeEl('body'),
    documentElement: makeEl('html'),
    head: makeEl('head'),
    activeElement: null,
    visibilityState: 'visible',
    cookie: '',
    title: ''
  });

  define('window', {
    addEventListener: on,
    removeEventListener() {},
    dispatchEvent: () => true,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    location: { href: 'https://example.test/', pathname: '/', search: '', hash: '', reload() {} },
    history: { pushState() {}, replaceState() {}, back() {}, state: null, length: 1 },
    navigator: { language: 'pt-BR', userAgent: 'node', maxTouchPoints: 1 },
    scrollTo() {},
    innerWidth: 390,
    innerHeight: 844,
    devicePixelRatio: 2,
    requestAnimationFrame: (cb) => trackedSetTimeout(cb, 0),
    cancelAnimationFrame: (id) => rawClearTimeout(id),
    setTimeout: trackedSetTimeout,
    clearTimeout: rawClearTimeout,
    confirm: () => true,
    alert: () => {},
    open: () => null,
    print() {}
  });

  define('navigator', globalThis.window.navigator);
  define('getComputedStyle', globalThis.window.getComputedStyle);
  define('matchMedia', globalThis.window.matchMedia);
  define('requestAnimationFrame', globalThis.window.requestAnimationFrame);
  define('cancelAnimationFrame', globalThis.window.cancelAnimationFrame);
  define('alert', globalThis.window.alert);
  define('confirm', globalThis.window.confirm);
  define('scrollTo', globalThis.window.scrollTo);
  define('location', globalThis.window.location);
  define('history', globalThis.window.history);

  if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => 'blob:test';
  if (!globalThis.URL.revokeObjectURL) globalThis.URL.revokeObjectURL = () => {};

  class AudioStub {
    constructor() { this.volume = 1; this.currentTime = 0; }
    play() { return Promise.resolve(); }
    pause() {}
    load() {}
  }
  define('Audio', AudioStub);
  define('Image', class { constructor() { this.src = ''; } });

  const clearTimers = () => {
    timers.forEach((id) => {
      rawClearTimeout(id);
      rawClearInterval(id);
    });
    timers.clear();
  };

  return { getEl, storage, fire, clearTimers };
}

async function buildFullState() {
  const { getInitialState } = await import('../js/storage.js');
  const state = getInitialState();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  state.history = {
    [todayStr]: {
      [state.tasks[0].id]: { done: true, doneBy: 'matheus', xp: 25, completedAt: '10:30' }
    }
  };

  state.carro = [
    ...(state.carro || []),
    {
      id: 'carro_teste',
      title: 'Troca de óleo',
      category: 'revisao',
      status: 'pendente',
      estimatedCost: 264.33,
      actualCost: 250,
      date: todayStr,
      description: 'Óleo 5W30 e filtro',
      checklist: [{ id: 'c1', text: 'Comprar filtro', done: false }],
      photos: ['data:image/png;base64,AAA'],
      links: [{ title: 'Mercado Livre', url: 'https://mercadolivre.com.br/item/1' }],
      notes: 'Verificar nível depois'
    }
  ];

  state.reformas = [
    ...(state.reformas || []),
    {
      id: 'ref_teste',
      title: 'Pintar sala',
      status: 'andamento',
      category: 'sala',
      estimatedCost: 800,
      actualCost: 150,
      description: 'Tinta acrílica + fita. Link: https://www.leroymerlin.com.br/tinta-acrilica-premium-18l-branco-neve-coral/p',
      photos: ['data:image/png;base64,BBB'],
      links: [{ title: 'Leroy', url: 'https://leroymerlin.com.br/x' }]
    }
  ];

  state.sonhos = [
    ...(state.sonhos || []),
    {
      id: 'sonho_teste',
      title: 'Viagem para a praia',
      category: 'viagens',
      targetAmount: 5000,
      currentAmount: 1200,
      status: 'ativo',
      notes: 'Reservar em janeiro',
      marcos: [{ id: 'm1', title: 'Passagens', done: false }]
    }
  ];

  state.compras = [
    ...(state.compras || []),
    {
      id: 'compra_item_1',
      title: 'Arroz 5kg',
      name: 'Arroz 5kg',
      quantity: '2',
      unitPrice: 27.9,
      price: 27.9,
      category: 'mercado',
      suggestedBy: 'scarlet',
      notes: 'Marca boa',
      photos: ['data:image/png;base64,CCC'],
      purchased: false,
      createdAt: new Date().toISOString()
    }
  ];

  state.comprasRegistros = [
    ...(state.comprasRegistros || []),
    {
      id: 'nfe_teste',
      marketName: 'Carrefour',
      establishment: 'Carrefour',
      date: todayStr,
      monthKey: todayStr.slice(0, 7),
      total: 264.33,
      totalAmount: 264.33,
      paymentMethod: 'va',
      notes: 'Compra do mês',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'it1', name: 'Arroz 5kg', quantity: 1, unit: 'UN', unitPrice: 27.9, price: 27.9, totalPrice: 27.9, category: 'mercado', photos: ['data:image/png;base64,DDD'] }
      ],
      photos: ['data:image/png;base64,EEE']
    }
  ];

  state.shoppingWishlist = [
    {
      id: 'wish_1',
      title: 'Air Fryer',
      category: 'eletro',
      status: 'desejado',
      priority: 'alta',
      price: 499.9,
      store: 'Amazon',
      forWhom: 'casal',
      link: 'https://amazon.com.br/dp/B0TESTE',
      notes: 'Esperar promoção',
      photos: ['data:image/png;base64,FFF'],
      createdAt: new Date().toISOString()
    }
  ];

  state.catalog = [
    {
      id: 'cat_1',
      name: 'Arroz 5kg',
      aliases: ['ARROZ BRANCO 5KG'],
      category: 'mercado',
      records: [{ date: todayStr, price: 27.9, market: 'Carrefour' }],
      photos: []
    }
  ];

  state.pets = [
    {
      id: 'pet_mandioca',
      nome: 'Mandioca',
      apelido: 'Boizin',
      especie: 'cachorro',
      raca: 'SRD',
      sexo: 'femea',
      dataNascimento: '2019-11-15',
      pesoKg: 14.5,
      vacinacaoEmDia: true,
      observacoes: 'Muito dócil',
      fotos: ['data:image/png;base64,GGG'],
      photos: ['data:image/png;base64,GGG'],
      racao: [
        { id: 'racao_1', dataCompra: todayStr, marca: 'Premier', quantidadeKg: 15, consumoDiarioG: 250, duracaoDias: 60, dataPrevisaoFim: todayStr, valor: 250, notas: 'Saco grande' }
      ],
      areia: [],
      higiene: [
        { id: 'banho_1', data: todayStr, tipo: 'casa', local: 'Em Casa', valor: 0, notas: 'Shampoo neutro', tosa: false, corteUnhas: true }
      ],
      vacinas: [
        { id: 'vac_1', vacina: 'V10', tipoVacina: 'V10', nome: 'V10', dataAplicacao: todayStr, dataProximaDose: '2027-11-10', lote: 'L-1', clinica: 'Vet', veterinario: 'Dra. Paula', notas: '' }
      ],
      vermifugos: [
        { id: 'verm_1', nome: 'Drontal', dataAplicacao: todayStr, dataProximaDose: '2027-05-10', pesoAnimalKg: 14.5, dose: '1 e 1/2 comprimido', notas: '' }
      ],
      exames: [
        { id: 'ex_1', data: todayStr, tipo: 'Consulta de rotina', clinica: 'Vet Mais', veterinario: 'Dra. Paula', descricao: 'Checkup', pendencias: 'Retorno em 10 dias', fotos: ['data:image/png;base64,HHH'] }
      ],
      itens: [
        { id: 'item_1', petId: 'pet_mandioca', nome: 'Comedouro duplo', tipo: 'comedouro', dataCompra: todayStr, valor: 45, loja: 'Cobasi', observacoes: 'Inox', fotos: [] }
      ]
    },
    {
      id: 'pet_sagu',
      nome: 'Sagu',
      especie: 'gato',
      raca: 'Frajola',
      sexo: 'macho',
      dataNascimento: '2024-03-15',
      pesoKg: 4.5,
      vacinacaoEmDia: false,
      observacoes: '',
      fotos: [],
      photos: [],
      racao: [],
      areia: [
        { id: 'areia_1', dataCompra: todayStr, marca: 'Pipicat', quantidadeKg: 4, duracaoDias: 20, dataPrevisaoFim: todayStr, valor: 35, notas: 'Granulado fino' }
      ],
      higiene: [{ id: 'banho_2', data: todayStr, tipo: 'petshop', local: 'Pet Shop', valor: 85, notas: '', tosa: true, corteUnhas: false }],
      vacinas: [],
      vermifugos: [],
      exames: [],
      itens: []
    }
  ];
  state.deletedPetIds = [];

  state.users = { user1: { id: 'matheus', name: 'Matheus', email: 'matheusdochapeu@gmail.com' }, user2: { id: 'scarlet', name: 'Scarlet', email: 'scarletsantos7@gmail.com' } };
  state.gamification = { streak: 5, bestStreak: 12, lastStreakDate: todayStr, unlockedBadges: ['primeira_tarefa'] };
  state.settings.soundEnabled = false;
  state.settings.autoSync = true;
  state.settings.sheetsUrl = '';

  return state;
}

test('Render smoke: todas as abas e modais renderizam sem erro de runtime', async () => {
  installDom();
  const state = await buildFullState();
  const ui = await import('../js/ui.js');

  const tries = [
    ['renderHeaderStats', [state]],
    ['renderTasksTab', [state]],
    ['renderTasksTab', [state, 'semanal', 'cozinha']],
    ['renderTasksTab', [state, 'mensal', 'tudo']],
    ['renderTasksTab', [state, 'anual', 'tudo']],
    ['renderHistoryTab', [state]],
    ['renderHistoryTab', [state, '2026-01-01']],
    ['renderCarroTab', [state]],
    ['renderReformasTab', [state]],
    ['renderReformasTab', [state, 'andamento', 'sala']],
    ['renderSonhosTab', [state]],
    ['renderComprasTab', [state]],
    ['renderComprasTab', [state, 'mercado', 'lista']],
    ['renderComprasTab', [state, 'todas', 'notas']],
    ['renderGamificationTab', [state]],
    ['renderSettingsTab', [state]],
    ['renderSettingsTab', [state, 'mercado']],
    ['populateCategorySelects', [state]],
    ['renderCategoriesManager', [state]],
    ['renderCategoriesManager', [state, 'carro']],
    ['renderQuickEmojis', []],
    ['updateRecurrentMarketsDatalist', [state]],
    ['updateCatalogDatalist', [state]],
    ['renderCatalogModal', [state]],
    ['renderCatalogModal', [state, 'arroz', 'mercado']],
    ['renderProductHistoryModal', [state, 'cat_1']],
    ['renderBenefitsHistoryModal', [state]],
    ['renderShoppingTab', [state]],
    ['renderShoppingTab', [state, 'eletro', 'desejado', 'casal', 'air', 'price_asc']],
    ['renderPetsTab', [state, 'pets']],
    ['renderPetsTab', [state, 'pets', null, 'gato', '']],
    ['renderPetsTab', [state, 'racao']],
    ['renderPetsTab', [state, 'racao', 'pet_mandioca']],
    ['renderPetsTab', [state, 'areia', 'pet_sagu']],
    ['renderPetsTab', [state, 'higiene']],
    ['renderPetsTab', [state, 'vacinas', 'pet_mandioca']],
    ['renderPetsTab', [state, 'exames']],
    ['renderPetsTab', [state, 'itens', 'pet_mandioca']],
    ['renderShoppingTab', [state, 'todos', 'todos', 'todos', '', 'recent']]
  ];

  for (const [name, args] of tries) {
    try {
      ui[name](...args);
    } catch (err) {
      errors.push(`${name}(${args.length > 1 ? '…' : ''}): ${err.message}`);
    }
  }

  for (const petId of ['pet_mandioca', 'pet_sagu']) {
    for (const tab of ['racao', 'areia', 'higiene', 'vacinas', 'exames', 'itens', 'cadastrais']) {
      try {
        ui.renderPetFolderModal(state, petId, tab);
      } catch (err) {
        errors.push(`renderPetFolderModal(${petId}, ${tab}): ${err.message}`);
      }
    }
  }

  try {
    ui.showToast('teste', 'info', 10);
  } catch (err) {
    errors.push(`showToast: ${err.message}`);
  }

  assert.deepEqual(errors, [], `Erros de render:\n${errors.join('\n')}`);
});

test('Init smoke: app.js inicializa com estado salvo e renderiza a aba inicial', async () => {
  const dom = installDom();
  const state = await buildFullState();

  dom.storage.set('MARACAJU_STATE_v1', JSON.stringify(state));

  const logged = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args) => logged.push(`ERROR ${args.map(String).join(' ')}`);
  console.warn = (...args) => logged.push(`WARN ${args.map(String).join(' ')}`);

  try {
    await import('../js/app.js');
    dom.fire('DOMContentLoaded');
    await new Promise((resolve) => setTimeout(resolve, 250));
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
    dom.clearTimers();
  }

  const realErrors = logged.filter((entry) => entry.startsWith('ERROR'));
  assert.deepEqual(realErrors, [], `console.error durante a inicialização:\n${realErrors.join('\n')}`);

  const freqBar = dom.getEl('frequency-segmented-bar');
  assert.ok(freqBar.innerHTML.includes('Diárias'), 'A barra de frequências da aba Tarefas deve ser renderizada.');

  const progressCard = dom.getEl('daily-progress-card');
  assert.ok(progressCard.innerHTML.length > 0, 'O card de progresso do dia deve ser renderizado.');
});
test('Render smoke: registros legados/incompletos não quebram as abas', async () => {
  installDom();
  const ui = await import('../js/ui.js');

  // Estado no formato "antigo"/parcial: campos que existem no localStorage real
  // de quem usa o app há meses (sem arrays, sem fotos, sem datas).
  const legacy = {
    tasks: [{ id: 't1', title: 'Lavar louça', frequency: 'diaria' }],
    history: {},
    carro: [{ id: 'c1', title: 'Troca de óleo' }],
    reformas: [{ id: 'r1', title: 'Pintura' }],
    sonhos: [{ id: 's1', title: 'Viagem' }],
    compras: [{ id: 'm1', name: 'Arroz' }],
    comprasRegistros: [{ id: 'n1', marketName: 'Mercado', total: '12,50' }],
    shoppingWishlist: [{ id: 'w1', title: 'TV' }],
    pets: [{ id: 'p1', nome: 'Rex' }],
    catalog: [{ id: 'cat1', name: 'Arroz' }],
    categories: {},
    settings: {},
    users: {},
    gamification: {}
  };

  const calls = [
    ['renderHeaderStats', [legacy]],
    ['renderTasksTab', [legacy]],
    ['renderComprasTab', [legacy]],
    ['renderShoppingTab', [legacy]],
    ['renderCarroTab', [legacy]],
    ['renderReformasTab', [legacy]],
    ['renderSonhosTab', [legacy]],
    ['renderSettingsTab', [legacy]],
    ['renderPetsTab', [legacy, 'pets']],
    ['renderPetsTab', [legacy, 'racao']],
    ['renderPetsTab', [legacy, 'vacinas']],
    ['renderPetFolderModal', [legacy, 'p1', 'racao']],
    ['renderGamificationTab', [legacy]],
    ['populateCategorySelects', [legacy]]
  ];

  const failures = [];
  for (const [name, args] of calls) {
    try {
      ui[name](...args);
    } catch (err) {
      failures.push(`${name}: ${err.message}`);
    }
  }

  assert.deepEqual(failures, [], `Erros com dados legados:\n${failures.join('\n')}`);
});