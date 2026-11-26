// ============================================================
//  MARACAJU 88 — MÓDULO: MEU ESPAÇO (ROTINA MATHEUS — OPÇÃO B)
//  Acesso exclusivo no cabeçalho superior (#btn-header-rotina-matheus)
//  ao lado do botão 👨‍💻 Matheus, sem adicionar 9ª aba na barra inferior.
//  Inclui 100% do app Rotina: Hoje, Capilar, Pele & Estilo,
//  Fotos em Grande Volume (Git Data API) e Ciclos.
// ============================================================

export const ROTINA_BLOCOS_HOJE = {
  m1: [
    { id: 'agua', t: 'Beber 1 copo cheio de água', d: 'Logo ao levantar da cama para despertar o corpo', surv: true },
    { id: 'escova_m', t: 'Escovar os dentes', d: 'Higiene matinal base por 2 minutos', surv: true },
    { id: 'raspador', t: 'Passar o raspador de língua', d: 'Remove 80% da saburra em 10 segundos e garante hálito limpo', surv: true }
  ],
  m2: [
    { id: 'gel_m', t: 'Lavar o rosto com Gel de Limpeza Facial', d: 'Principia GL-01, GL-02 ou CeraVe — sem sabonete corporal no rosto' },
    { id: 'hid_m', t: 'Aplicar Hidratante Facial Leve', d: 'CeraVe Loção ou Hydro Boost — blinda contra o ar-condicionado do trabalho' },
    { id: 'prot_m', t: 'Passar Protetor Solar FPS 50+ Invisível', d: '3 dedos no rosto, orelhas e pescoço — ISDIN, Principia PS-01/03 ou Nivea Toque Seco', surv: true }
  ],
  m3: [
    { id: 'cab_m', t: 'Revitalizar o cabelo', d: 'Borrifar água + 2 gotas de óleo finalizador nas pontas e modelar com a mão ou nudred' },
    { id: 'barba_m', t: 'Alinhar e hidratar a barba', d: '3 gotas de óleo ou balm de barba para maciez e cheiro agradável' },
    { id: 'desod_m', t: 'Aplicar antitranspirante neutro', d: 'Rexona ou Dove Clinical ou Nivea Black & White', surv: true },
    { id: 'roupa_m', t: 'Vestir a roupa já separada ontem', d: 'Zero gasto de energia decidindo roupa às 05h50', surv: true },
    { id: 'perf_m', t: 'Aplicar Perfume do Dia', d: '5 a 6 borrifadas: 2× pescoço e orelhas, 1× nuca, 1× peito, 1× dobras do cotovelo sem esfregar', surv: true }
  ],
  t1: [
    { id: 'labial_t', t: 'Passar Protetor Labial e Creme de Mãos', d: '1 a 2× durante o expediente no ar-condicionado', opt: true },
    { id: 'decant_t', t: 'Retocar Perfume pós-almoço', d: '2 borrifadas do mini porta-perfume de 5 ml da gaveta', opt: true }
  ],
  n1: [
    { id: 'casa_pia', t: 'Reset Casa 1/3: Cozinha — pia zerada e lixo', d: 'Guardar louça e lavar copo ou prato usado' },
    { id: 'casa_quarto', t: 'Reset Casa 2/3: Sala e Quarto — zero roupa fora do lugar', d: 'Roupa suja no cesto, tênis e mochila no lugar fixo' },
    { id: 'casa_banh', t: 'Reset Casa 3/3: Banheiro — pia seca e toalha aberta', d: 'Toalha sempre estendida em local ventilado' },
    { id: 'roupa_n', t: 'Separar roupa de amanhã + mochila e tênis', d: 'Deixar pendurada no gancho antes do banho' }
  ],
  n2: [
    { id: 'banho_n', t: 'Banho morno com sabonete hidratante ou óleo', d: 'Atenção atrás das orelhas, nuca, axilas e pés · Pós-corrida: Co-Wash no cabelo' },
    { id: 'hid_corpo', t: 'Hidratante Corporal sem cheiro nos 2 min pós-banho', d: 'CeraVe Loção 473 ml com a pele ainda úmida em braços, pernas, cotovelos e joelhos' },
    { id: 'desod_n', t: 'Aplicar Antitranspirante Noturno', d: 'Com axila seca antes de dormir — bloqueia o suor 2× melhor no dia seguinte' },
    { id: 'pes_n', t: 'Creme com Ureia 10% nos pés', d: 'Terça e Sábado — previne calos, rachaduras e atrito das corridas', days: [2, 6] },
    { id: 'fio_n', t: 'Passar o Fio Dental', d: 'Seu hábito âncora consolidado — nunca pular' },
    { id: 'escova_n', t: 'Escovar os dentes', d: 'Higiene noturna completa' },
    { id: 'gel_n', t: 'Lavar o rosto com Gel de Limpeza Facial', d: 'Remove protetor solar, suor da corrida e poluição' },
    { id: 'serum_n', t: 'Aplicar Sérum Niacinamida 10%', d: 'Segunda, Quarta e Sexta · Principia NC-10 contra manchas e pelos encravados', days: [1, 3, 5] },
    { id: 'hid_n', t: 'Aplicar Hidratante Facial Noturno', d: 'Regeneração da barreira da pele durante o sono' },
    { id: 'cetim_n', t: 'Dormir na Fronha de Cetim Escura', d: 'Evita quebra do cabelo crespo crescendo · Meta pós-04/12: dormir às 22h30' }
  ]
};

export const ETAPAS_CAPILARES = [
  {
    titulo: 'Semana 1 · 💧 Hidratação',
    foco: 'Repor a água sugada pelo ar-condicionado do trabalho e pelo sol de Ribeirão Preto. Devolve maciez e balanço.',
    cremes: 'Máscara Lola Morte Súbita • Widi Care Operação Resgate • Bio Extratus Botica Cachos • Skala Babosa',
    passos: [
      '<b>1. Shampoo Hidratante · 2 min:</b> Molhe bem, aplique o shampoo só no couro cabeludo como <i>Widi Care Juba</i> ou <i>Salon Line Babosa</i>, massageie com as pontas dos dedos e enxágue.',
      '<b>2. Tirar excesso de água:</b> Aperte suavemente com toalha de microfibra ou camiseta de algodão para a máscara não escorrer.',
      '<b>3. Aplicar Máscara de Hidratação · 2 min:</b> Pegue 1 colher de máscara com espátula limpa e enluve mecha por mecha da raiz às pontas.',
      '<b>4. Desembaraçar no banho:</b> Com a máscara no fio, passe a escova polvo ou pente garfo das pontas para a raiz.',
      '<b>5. Pausa · 10 min:</b> Deixe agir enquanto toma banho e faz esfoliação corporal e da barba.',
      '<b>6. Enxágue + Condicionador Selante · 2 min:</b> Enxágue 100% da máscara, aplique o condicionador por 2 min para fechar a cutícula e enxágue.',
      '<b>7. Finalização:</b> Com o cabelo úmido, aplique 2 gotas de óleo vegetal + Creme de Pentear como <i>Encrespando a Juba</i> ou <i>Crespo Divino</i>.'
    ]
  },
  {
    titulo: 'Semana 2 · 🥑 Nutrição e Umectação',
    foco: 'A etapa mais importante do cabelo crespo. Repõe lipídios e óleos naturais que não chegam às pontas, eliminando o frizz e dando brilho.',
    cremes: 'Máscara Lola Dream Cream • Widi Care Juba Manteiga • Eudora Siàge Nutri Óleos + Óleo 100% Vegetal de Rícino, Abacate ou Argan',
    passos: [
      '<b>Opção A — No Banho · 15 min:</b> Lavar com Shampoo Hidratante → tirar excesso de água → enluvar a <b>Máscara de Nutrição</b> com 3 gotas de óleo vegetal misturadas → deixar 10 a 15 min → enxaguar → Condicionador Selante → Finalizar.',
      '<b>Opção B — Umectação Antes do Banho:</b> 30 min antes do banho, passe óleo 100% vegetal puro nos fios secos. No banho, aplique Co-Wash por cima do óleo por 5 min para remover o excesso sem ressecar, enxágue, passe a máscara nutritiva por 5 min e finalize.'
    ]
  },
  {
    titulo: 'Semana 3 · 💧 Hidratação + Banho de Brilho',
    foco: 'Manter a reposição hídrica do mês. Se o cabelo estiver Vermelho ou Azul, é a semana ideal para renovar a cor sem amônia.',
    cremes: 'Máscara de Hidratação branca + 1 colher de Tonalizante Kamaleão Color ou Salon Line Color Express',
    passos: [
      '<b>Se estiver com cor natural:</b> Repetir o passo a passo da Semana 1: Shampoo Hidratante → Máscara de Hidratação por 10 min → Condicionador → Finalizador.',
      '<b>Se estiver Vermelho ou Azul:</b> Misture num potinho 2 colheres de máscara branca hidratante + 1 colher do tonalizante sem amônia. Lave com shampoo, tire o excesso de água, aplique a mistura com luva, deixe 20 a 25 min, enxágue e passe condicionador.'
    ]
  },
  {
    titulo: 'Semana 4 · 🧱 Reconstrução',
    foco: 'Repor massa proteica e queratina perdidas na descoloração e no sol. Impede o corte químico e a quebra das pontas.',
    cremes: 'Máscara Lola Tarja Preta Queratina Vegetal • Widi Care Operação Resgate • Eudora Siàge Cauterização • Salon Line S.O.S Reconstrução',
    passos: [
      '<b>1. Shampoo Hidratante:</b> Lave o couro cabeludo e enxágue bem.',
      '<b>2. Acidificante pós-química:</b> Tire o excesso de água, aplique o <b>Acidificante</b> como <i>Lola Densidade</i> ou <i>Widi Care</i>, deixe 3 a 5 min e enxágue para fechar as escamas abertas pela química.',
      '<b>3. Máscara Reconstrutora · 10 min:</b> Aplique a máscara reconstrutora enluvando bem e deixe agir por 10 min.',
      '<b>4. Condicionador + Óleo:</b> Enxágue 100%, sele com condicionador por 2 min e finalize com creme de pentear + óleo.'
    ]
  }
];

export const ROTINA_ONDAS = [
  { ini: '2026-11-25', fim: '2026-12-08', t: 'Onda 1 · Bandeja da Pia + Rosto + Raspador', d: 'Foco único: deixar produtos visíveis ao lado da escova e fixar Raspador + Gel facial + Protetor solar.' },
  { ini: '2026-12-09', fim: '2026-12-22', t: 'Onda 2 · Pós-Banho + Homem Cheiroso', d: 'Foco único: Hidratante corporal nos 2 min pós-banho + Antitranspirante à noite + 5 borrifadas de perfume e decant.' },
  { ini: '2026-12-23', fim: '2027-01-05', t: 'Onda 3 · Reset 5 min da Casa + Roupa à Noite', d: 'Foco único: Timer de 5 min da casa antes do banho e deixar a roupa da manhã pendurada.' },
  { ini: '2027-01-06', fim: '2027-01-19', t: 'Onda 4 · Ritual de Domingo Consolidado', d: 'Foco único: Cronograma capilar de 15 min no domingo + esfoliação barba e corpo + troca da fronha de cetim.' }
];

export const ROTINA_CICLOS = [
  { k: 'nutri', n: '🥗 Nutricionista', d: 45 },
  { k: 'depil', n: '🪒 Depilação Corporal', d: 90 },
  { k: 'desc', n: '🎨 Descoloração Segura', d: 90 },
  { k: 'corte', n: '✂️ Barbeiro', d: 18 },
  { k: 'cetim', n: '🛏️ Trocar Fronha de Cetim & Toalhas', d: 7 }
];

export const PRODUTOS_SUGERIDOS_SHOPPING = [
  { title: 'Shampoo Hidratante Widi Care Juba / Lola Morte Súbita', price: 38, category: 'beleza_pessoal', notes: 'Plano Capilar Matheus — Limpeza sem ressecar' },
  { title: 'Co-Wash Condicionador Limpante', price: 32, category: 'beleza_pessoal', notes: 'Plano Capilar Matheus — Quinta, Sábado e Domingo pós-corrida' },
  { title: 'Máscara Nutrição Lola Dream Cream / Juba Manteiga', price: 42, category: 'beleza_pessoal', notes: 'Cronograma Capilar Semana 2' },
  { title: 'Máscara Reconstrução Lola Tarja Preta', price: 45, category: 'beleza_pessoal', notes: 'Cronograma Capilar Semana 4 — Pós-coloração' },
  { title: 'Acidificante Capilar Lola Densidade / Widi Care', price: 44, category: 'beleza_pessoal', notes: 'Sela cutículas pós-descoloração e segura a cor' },
  { title: '2 Fronhas de Cetim Escuras', price: 55, category: 'beleza_pessoal', notes: 'Anti-quebra noturna para cabelo crespo colorido' },
  { title: 'CeraVe Loção Hidratante 473ml com Pump Sem Cheiro', price: 89, category: 'beleza_pessoal', notes: 'Skincare Corpo pós-banho + Rosto' },
  { title: 'Protetor Solar Facial Invisível FPS 50+ ISDIN ou Principia', price: 65, category: 'beleza_pessoal', notes: 'Zero resíduo branco na pele negra + corrida' },
  { title: 'Sérum Niacinamida 10% Principia NC-10', price: 54, category: 'beleza_pessoal', notes: 'Uso Segunda, Quarta e Sexta à noite' },
  { title: 'Raspador de Língua em Inox ou Cobre', price: 18, category: 'beleza_pessoal', notes: 'Higiene matinal em 10 segundos' }
];

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MANHA_KEYS = ['m1', 'm2', 'm3'];
const NOITE_KEYS = ['n1', 'n2'];

export function ensureRotinaMatheusState(state) {
  if (!state) return { dias: {}, ds: {}, subtab: 'hoje', capStageSel: 0 };
  if (!state.rotinaMatheus || typeof state.rotinaMatheus !== 'object') {
    state.rotinaMatheus = {
      dias: {},
      ds: {},
      subtab: 'hoje',
      updatedAt: new Date().toISOString()
    };
    try {
      const legacyRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('rm') : null;
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy && typeof legacy === 'object') {
          if (legacy.dias) state.rotinaMatheus.dias = { ...legacy.dias };
          if (legacy.ds) state.rotinaMatheus.ds = { ...legacy.ds };
        }
      }
    } catch (e) {}
  }
  if (!state.rotinaMatheus.dias) state.rotinaMatheus.dias = {};
  if (!state.rotinaMatheus.ds) state.rotinaMatheus.ds = {};
  return state.rotinaMatheus;
}

export function mergeRotinaMatheusState(localRM, cloudRM) {
  const base = {
    dias: {},
    ds: {},
    subtab: (localRM && localRM.subtab) || 'hoje',
    updatedAt: new Date().toISOString()
  };
  const mergeDias = (src) => {
    if (!src || !src.dias) return;
    Object.entries(src.dias).forEach(([dayKey, val]) => {
      if (!val) return;
      const prev = base.dias[dayKey] || { done: [], min: false };
      const unionDone = Array.from(new Set([...(prev.done || []), ...(Array.isArray(val.done) ? val.done : [])]));
      base.dias[dayKey] = {
        done: unionDone,
        min: Boolean(prev.min || val.min)
      };
    });
  };
  mergeDias(cloudRM);
  mergeDias(localRM);
  base.ds = { ...((cloudRM && cloudRM.ds) || {}), ...((localRM && localRM.ds) || {}) };
  return base;
}

export function syncRotinaAccessVisibility(state, currentTab = '') {
  const isMatheus = !state || !state.activeUserId || state.activeUserId === 'matheus';
  const headerQuickBtn = document.getElementById('btn-header-rotina-matheus');
  const tabSection = document.getElementById('tab-rotina');
  const isRotinaOpen = currentTab === 'rotina' || Boolean(tabSection && tabSection.classList.contains('active'));

  if (headerQuickBtn) {
    headerQuickBtn.style.display = isMatheus ? 'inline-flex' : 'none';
    headerQuickBtn.style.background = isRotinaOpen ? 'var(--brand-moss)' : '';
    headerQuickBtn.style.color = isRotinaOpen ? '#fff' : '';
  }

  return isMatheus;
}

/* ===== Helpers de Cálculo de Progresso & Streak ===== */
function getLocalIso(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getActiveItemsForBlock(bKey, dow) {
  return (ROTINA_BLOCOS_HOJE[bKey] || []).filter(it => !it.days || it.days.includes(dow));
}

function isDayComplete(rm, diaKey) {
  const x = rm.dias && rm.dias[diaKey];
  if (!x || !Array.isArray(x.done)) return false;
  const dt = new Date(diaKey + 'T12:00');
  const dow = dt.getDay();
  const mItems = MANHA_KEYS.flatMap(k => getActiveItemsForBlock(k, dow));
  const nItems = NOITE_KEYS.flatMap(k => getActiveItemsForBlock(k, dow));
  const mOk = x.min
    ? mItems.filter(i => i.surv).every(i => x.done.includes(i.id))
    : mItems.every(i => x.done.includes(i.id));
  const nOk = nItems.every(i => x.done.includes(i.id));
  return mOk && nOk;
}

function calcStreak(rm, H) {
  let n = 0;
  const d = new Date(H + 'T12:00');
  if (!isDayComplete(rm, H)) d.setDate(d.getDate() - 1);
  while (isDayComplete(rm, getLocalIso(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function calcProgressToday(rm, H, dow) {
  const d = (rm.dias && rm.dias[H]) || { done: [], min: false };
  const mItems = MANHA_KEYS.flatMap(k => getActiveItemsForBlock(k, dow));
  const nItems = NOITE_KEYS.flatMap(k => getActiveItemsForBlock(k, dow));
  const mAlvo = d.min ? mItems.filter(i => i.surv) : mItems;
  const total = mAlvo.length + nItems.length;
  if (!total) return 0;
  const feitos = mAlvo.filter(i => d.done.includes(i.id)).length + nItems.filter(i => d.done.includes(i.id)).length;
  return Math.min(100, Math.round((feitos / total) * 100));
}

/* ===== Timer de 5 Minutos do Reset da Casa ===== */
let tmCasa = null;
let secCasa = 300;
function toggleTimerCasa(onNotify) {
  const lbl = document.getElementById('rm-tm-casa');
  const btn = document.getElementById('rm-btn-casa');
  if (tmCasa) {
    clearInterval(tmCasa);
    tmCasa = null;
    if (btn) btn.textContent = 'Continuar';
    return;
  }
  if (btn) btn.textContent = 'Pausar';
  tmCasa = setInterval(() => {
    secCasa--;
    const txt = String(Math.floor(secCasa / 60)).padStart(2, '0') + ':' + String(secCasa % 60).padStart(2, '0');
    const l = document.getElementById('rm-tm-casa');
    if (l) l.textContent = txt;
    if (secCasa <= 0) {
      clearInterval(tmCasa);
      tmCasa = null;
      secCasa = 300;
      if (l) l.textContent = '05:00';
      const b = document.getElementById('rm-btn-casa');
      if (b) b.textContent = 'Iniciar';
      if (typeof onNotify === 'function') onNotify('5 minutos concluídos! Casa em ordem 🏠', 'success');
    }
  }, 1000);
}

/* ===== Motor de Fotos em Grande Volume (IndexedDB + Git Data API) ===== */
let dbPromise = null;
function getFotoDb() {
  if (!dbPromise) {
    dbPromise = new Promise((res, rej) => {
      if (typeof indexedDB === 'undefined') {
        rej(new Error('IndexedDB indisponível'));
        return;
      }
      const r = indexedDB.open('rm-fotos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('f', { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbPromise;
}

async function idbFoto(mode, fn) {
  const db = await getFotoDb();
  return new Promise((res, rej) => {
    const t = db.transaction('f', mode);
    const q = fn(t.objectStore('f'));
    t.oncomplete = () => res(q && q.result);
    t.onerror = () => rej(t.error);
  });
}

async function listarFotosIdb() {
  try {
    return (await idbFoto('readonly', s => s.getAll())) || [];
  } catch (e) {
    return [];
  }
}

let activeUrls = [];
let fPagina = 1;
let fFiltroAtual = 'todas';
const FOTOS_POR_PAGINA = 24;
let wakeLock = null;
let enviandoFotos = false;
let pausarEnvioSolicitado = false;

async function manterTelaAcesa(on) {
  try {
    if (on && typeof navigator !== 'undefined' && navigator.wakeLock && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch (e) {}
}

function carregarImgElemento(file) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => { URL.revokeObjectURL(u); res(im); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('formato não suportado')); };
    im.src = u;
  });
}

async function comprimirParFoto(file) {
  let src;
  try { src = await createImageBitmap(file); } catch (e) { src = await carregarImgElemento(file); }
  const w = src.width || src.naturalWidth;
  const h = src.height || src.naturalHeight;
  const sc = Math.min(1, 1280 / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * sc);
  c.height = Math.round(h * sc);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.78));

  const scT = Math.min(1, 240 / Math.max(w, h));
  const cT = document.createElement('canvas');
  cT.width = Math.round(w * scT);
  cT.height = Math.round(h * scT);
  cT.getContext('2d').drawImage(c, 0, 0, cT.width, cT.height);
  const thumb = await new Promise(r => cT.toBlob(r, 'image/jpeg', 0.7));

  if (src.close) { try { src.close(); } catch (e) {} }
  c.width = c.height = cT.width = cT.height = 0;
  if (!blob) throw new Error('falha ao comprimir');
  return { blob, thumb: thumb || blob, size: blob.size };
}

function getGhCfg() {
  try { return JSON.parse(localStorage.getItem('rm-gh') || '{}'); } catch (e) { return {}; }
}
function limpaRepoStr(v) {
  return (v || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
}
function limpaTokStr(v) {
  return (v || '').replace(/\s+/g, '');
}
function blobToB64(blob) {
  return new Promise(r => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result.split(',')[1]);
    fr.readAsDataURL(blob);
  });
}

async function ghFetch(url, opt = {}, ms = 60000) {
  const c = getGhCfg();
  const ac = new AbortController();
  const to = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, {
      ...opt,
      signal: ac.signal,
      headers: {
        Authorization: 'Bearer ' + c.tok,
        Accept: 'application/vnd.github+json',
        ...(opt.headers || {})
      }
    });
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'tempo esgotado — internet lenta ou sem sinal' : 'sem conexão com a internet');
  } finally {
    clearTimeout(to);
  }
}

function explicaStatusGh(status) {
  return ({
    401: 'token inválido ou expirado — gere outro',
    403: 'token sem permissão — precisa de Contents: Read and write neste repositório',
    404: 'repositório não encontrado ou o token não tem acesso a ele',
    409: 'conflito temporário no GitHub — tente enviar novamente',
    422: 'arquivo já existe'
  })[status] || ('erro ' + status);
}

async function enviarFotoIndividualRetry(repo, f, tentativas = 3) {
  const b64 = await blobToB64(f.blob);
  for (let t = 1; t <= tentativas; t++) {
    const r = await ghFetch(`https://api.github.com/repos/${repo}/contents/fotos/${f.cat}/${f.id}.jpg`, {
      method: 'PUT',
      body: JSON.stringify({ message: `foto ${f.cat} ${f.id}`, content: b64 })
    });
    if (r.ok || r.status === 422) return true;
    if (t < tentativas && (r.status === 409 || r.status >= 500)) {
      await new Promise(res => setTimeout(res, 800 * t));
      continue;
    }
    throw new Error(explicaStatusGh(r.status));
  }
}

async function enviarLoteGitData(repo, branch, lote, onBlobDone) {
  const refRes = await ghFetch(`https://api.github.com/repos/${repo}/git/ref/heads/${branch}`);
  if (!refRes.ok) return false;
  const latestCommitSha = (await refRes.json()).object.sha;

  const commitRes = await ghFetch(`https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`);
  if (!commitRes.ok) return false;
  const baseTreeSha = (await commitRes.json()).tree.sha;

  const treeItems = [];
  const fila = [...lote];
  const workers = Array.from({ length: Math.min(3, fila.length) }, async () => {
    while (fila.length && !pausarEnvioSolicitado) {
      const f = fila.shift();
      const b64 = await blobToB64(f.blob);
      let blobSha = null;
      for (let t = 1; t <= 3; t++) {
        const bRes = await ghFetch(`https://api.github.com/repos/${repo}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({ content: b64, encoding: 'base64' })
        });
        if (bRes.ok) { blobSha = (await bRes.json()).sha; break; }
        if (t === 3) throw new Error(explicaStatusGh(bRes.status));
        await new Promise(r => setTimeout(r, 600 * t));
      }
      treeItems.push({ path: `fotos/${f.cat}/${f.id}.jpg`, mode: '100644', type: 'blob', sha: blobSha, f });
      if (onBlobDone) onBlobDone();
    }
  });
  await Promise.all(workers);
  if (!treeItems.length) return true;

  const treeRes = await ghFetch(`https://api.github.com/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems.map(({ path, mode, type, sha }) => ({ path, mode, type, sha }))
    })
  });
  if (!treeRes.ok) throw new Error(explicaStatusGh(treeRes.status));
  const newTreeSha = (await treeRes.json()).sha;

  const newCommitRes = await ghFetch(`https://api.github.com/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: `lote de ${treeItems.length} fotos`, tree: newTreeSha, parents: [latestCommitSha] })
  });
  if (!newCommitRes.ok) throw new Error(explicaStatusGh(newCommitRes.status));
  const newCommitSha = (await newCommitRes.json()).sha;

  const upRefRes = await ghFetch(`https://api.github.com/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: newCommitSha })
  });
  if (!upRefRes.ok) throw new Error(explicaStatusGh(upRefRes.status));

  for (const item of treeItems) {
    item.f.sent = true;
    await idbFoto('readwrite', s => s.put(item.f));
  }
  return true;
}

/* ===== Galeria das fotos já salvas no GitHub =====
 * A galeria "Envio & Galeria" só enxerga a fila local (IndexedDB) do aparelho.
 * Se o navegador limpar o armazenamento, o app for reinstalado ou as fotos
 * tiverem sido tiradas em outro app/aparelho, elas somem dali — mas continuam
 * no repositório. Esta seção lista e baixa as miniaturas direto do GitHub.
 */
let ghFotosCache = null; // { repo, at, list, truncated }
const ghImgCache = new Map(); // path -> objectURL
let ghPagina = 1;
let ghFiltroAtual = 'todas';
let renderGaleriaGitHubRef = null;
const GH_FOTOS_POR_PAGINA = 18;

function encodeGhPath(p) {
  return String(p).split('/').map(encodeURIComponent).join('/');
}

export function parseGhFotosTree(tree) {
  return (Array.isArray(tree) ? tree : [])
    .filter(t => t && t.type === 'blob' && /^fotos\/[^/]+\/[^/]+\.(jpe?g|png|webp)$/i.test(t.path || ''))
    .map(t => {
      const [, cat, file] = t.path.split('/');
      return { path: t.path, cat, id: file.replace(/\.[^.]+$/, ''), sha: t.sha, size: t.size || 0 };
    })
    .sort((a, b) => (a.id < b.id ? 1 : -1));
}

async function listarFotosGitHub(force = false) {
  const cfg = getGhCfg();
  if (!cfg.repo || !cfg.tok) throw new Error('GitHub não configurado — preencha repositório e token abaixo');
  if (!force && ghFotosCache && ghFotosCache.repo === cfg.repo && Date.now() - ghFotosCache.at < 5 * 60 * 1000) {
    return ghFotosCache;
  }
  const repoRes = await ghFetch(`https://api.github.com/repos/${cfg.repo}`, {}, 15000);
  if (!repoRes.ok) throw new Error(explicaStatusGh(repoRes.status));
  const branch = (await repoRes.json()).default_branch || 'main';
  const treeRes = await ghFetch(`https://api.github.com/repos/${cfg.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, {}, 30000);
  let list = [];
  let truncated = false;
  if (treeRes.ok) {
    const j = await treeRes.json();
    list = parseGhFotosTree(j.tree);
    truncated = Boolean(j.truncated);
  } else if (treeRes.status !== 404 && treeRes.status !== 409) {
    // 404/409 = repositório ainda vazio (nenhuma foto enviada)
    throw new Error(explicaStatusGh(treeRes.status));
  }
  ghFotosCache = { repo: cfg.repo, at: Date.now(), list, truncated };
  return ghFotosCache;
}

async function baixarFotoGitHub(foto) {
  if (ghImgCache.has(foto.path)) return ghImgCache.get(foto.path);
  const cfg = getGhCfg();
  const r = await ghFetch(`https://api.github.com/repos/${cfg.repo}/contents/${encodeGhPath(foto.path)}`, {
    headers: { Accept: 'application/vnd.github.raw' }
  }, 45000);
  if (!r.ok) throw new Error(explicaStatusGh(r.status));
  const raw = await r.blob();
  const blob = raw.type && raw.type.startsWith('image/') ? raw : new Blob([raw], { type: 'image/jpeg' });
  const url = URL.createObjectURL(blob);
  ghImgCache.set(foto.path, url);
  return url;
}

function abrirFotoTelaCheia(url, legenda = '') {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;cursor:zoom-out;';
  ov.innerHTML = `
    <img src="${url}" alt="" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:8px;" />
    <div style="color:#fff;font-size:0.8rem;margin-top:0.6rem;opacity:0.85;">${legenda} · toque para fechar</div>
  `;
  ov.addEventListener('click', () => ov.remove());
  document.body.appendChild(ov);
}

/**
 * Renderiza toda a central "Meu Espaço (Matheus)" dentro do Maracaju
 */
export function renderRotinaMatheusTab(state, callbacks = {}) {
  const { onSaveState, onAddWishlistItem, onToast } = callbacks;
  const container = document.getElementById('rotina-matheus-view');
  if (!container) return;

  const notify = (m, type = 'info') => {
    if (typeof onToast === 'function') onToast(m, type);
  };

  const rm = ensureRotinaMatheusState(state);
  const subtab = rm.subtab || 'hoje';
  const hoje = new Date();
  const H = getLocalIso(hoje);
  const DOW = hoje.getDay();

  if (!rm.dias[H]) rm.dias[H] = { done: [], min: false };
  const diaAtual = rm.dias[H];

  // Atualiza barra superior do Meu Espaço (Streak + % do Dia)
  const progPct = calcProgressToday(rm, H, DOW);
  const streakCnt = calcStreak(rm, H);
  const streakEl = document.getElementById('rm-header-streak');
  const progEl = document.getElementById('rm-header-prog');
  if (streakEl) streakEl.textContent = `${streakCnt} 🔥`;
  if (progEl) progEl.textContent = `${progPct}% hoje`;

  document.querySelectorAll('[data-rotina-subtab]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-rotina-subtab') === subtab);
  });

  const save = () => {
    rm.updatedAt = new Date().toISOString();
    if (typeof onSaveState === 'function') onSaveState();
  };

  /* -------------------- SUB-ABA 1: HOJE -------------------- */
  if (subtab === 'hoje') {
    const manhaItems = MANHA_KEYS.flatMap(k => getActiveItemsForBlock(k, DOW));
    const survIds = manhaItems.filter(i => i.surv).map(i => i.id);
    const survAtivo = Boolean(diaAtual.min || survIds.every(id => diaAtual.done.includes(id)));

    const posFacul = H >= '2026-12-05';
    const ag = [];
    if (DOW >= 1 && DOW <= 5) ag.push(posFacul ? '💪 Treino de Força · 30 min' : '🎓 Aulas até 04/12');
    if (DOW === 4) ag.push('🏃 Corrida de Quinta 5 km + Co-Wash');
    if (DOW === 6) ag.push('🏃 Corrida de Sábado 5 km + Co-Wash');
    if (DOW === 0) ag.push('🏃 Corrida de Domingo 10 km + Co-Wash');
    if (DOW === 3) ag.push('🧠 Psicóloga às 19h30');
    if (DOW === 4) ag.push('✂️ Barbeiro às 19h30');
    if (DOW === 0) ag.push('💈 Domingo: Cronograma Capilar + Trocar Fronha');
    if ([1, 3, 5].includes(DOW)) ag.push('🧪 Noite: Dia de Sérum Niacinamida 10%');
    if ([2, 6].includes(DOW)) ag.push('🦶 Noite: Dia de Ureia 10% nos pés');

    const ondaIdx = ROTINA_ONDAS.findIndex(o => H >= o.ini && H <= o.fim);
    const onda = ROTINA_ONDAS[ondaIdx >= 0 ? ondaIdx : 0];

    const renderChecklistBlock = (title, subtitle, key, extraHtml = '') => {
      const items = getActiveItemsForBlock(key, DOW);
      const doneCount = items.filter(it => diaAtual.done.includes(it.id)).length;
      return `
        <div class="dash-card" style="margin-bottom:0.85rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
            <h3 style="margin:0;font-size:1rem;">${title}</h3>
            <span class="chip" style="padding:2px 8px;font-size:0.75rem;">${doneCount}/${items.length}</span>
          </div>
          <p style="margin:0 0 0.6rem;font-size:0.8rem;color:var(--text-muted);">${subtitle}</p>
          ${extraHtml}
          <div style="display:flex;flex-direction:column;gap:0.45rem;">
            ${items.map(it => {
              const checked = diaAtual.done.includes(it.id);
              return `
                <label style="display:flex;gap:0.65rem;align-items:flex-start;padding:0.45rem 0;border-bottom:1px solid var(--border-subtle);cursor:pointer;">
                  <input type="checkbox" data-rm-check="${it.id}" ${checked ? 'checked' : ''} style="width:20px;height:20px;margin-top:2px;accent-color:var(--brand-moss);" />
                  <div style="flex:1;">
                    <div style="font-weight:600;${checked ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">
                      ${it.t} ${it.surv ? '<span style="font-size:0.68rem;background:rgba(46,89,51,0.15);color:var(--brand-moss);padding:1px 6px;border-radius:99px;margin-left:4px;">⚡ 3min</span>' : ''}
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted);">${it.d}</div>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    };

    const timerHtml = `
      <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(46,89,51,0.08);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;margin-bottom:0.6rem;">
        <span style="font-size:0.84rem;font-weight:600;">⏱️ Timer Reset da Casa</span>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <strong id="rm-tm-casa" style="font-size:1.1rem;font-variant-numeric:tabular-nums;color:var(--brand-moss);">05:00</strong>
          <button type="button" class="btn btn-secondary btn-sm" id="rm-btn-casa">Iniciar</button>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="dash-card" style="margin-bottom:0.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <strong>📅 ${DIAS_SEMANA[DOW]}, ${hoje.toLocaleDateString('pt-BR')}</strong>
          <span class="chip">Onda ${(ondaIdx >= 0 ? ondaIdx + 1 : 1)}/4</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.5rem;">
          ${ag.map(a => `<span class="chip" style="font-size:0.76rem;">${a}</span>`).join('')}
        </div>
        <p style="margin:0;font-size:0.78rem;color:var(--text-muted);">${onda.t} — ${onda.d}</p>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;">
        <button type="button" id="btn-rm-surv-toggle" class="btn ${survAtivo ? 'btn-primary' : 'btn-secondary'}" style="flex:1;justify-content:center;">
          ${survAtivo ? '✅ Modo Sobrevivência Ativo' : '😵 Ativar Modo Sobrevivência'}
        </button>
        <button type="button" id="btn-rm-clear-day" class="btn btn-secondary btn-sm">Limpar dia</button>
      </div>
      ${renderChecklistBlock('🌅 1. Manhã — Despertar & Hálito', '05h50 · Ao levantar e entrar no banheiro', 'm1')}
      ${renderChecklistBlock('🧴 2. Manhã — Rosto', 'Pele negra protegida do ar-condicionado e do sol de Ribeirão Preto', 'm2')}
      ${renderChecklistBlock('💈 3. Manhã — Cabelo, Barba & Presença', 'Revitalização rápida + camadas de perfume e roupa pronta', 'm3')}
      ${renderChecklistBlock('🏢 4. Trabalho', 'Kit fixo na mesa ou gaveta do escritório', 't1')}
      ${renderChecklistBlock('🏠 5. Noite — Casa & Preparação', 'Antes do banho: destrava a casa em 5 min e elimina decisões das 05h50', 'n1', timerHtml)}
      ${renderChecklistBlock('🌙 6. Noite — Banho, Corpo, Rosto & Sono', 'Onde a pele e o cabelo se recuperam enquanto você dorme', 'n2')}
    `;

    const btnCasa = document.getElementById('rm-btn-casa');
    if (btnCasa) btnCasa.addEventListener('click', () => toggleTimerCasa(notify));

    container.querySelectorAll('[data-rm-check]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-rm-check');
        if (e.target.checked) {
          if (!diaAtual.done.includes(id)) diaAtual.done.push(id);
        } else {
          diaAtual.done = diaAtual.done.filter(x => x !== id);
          if (diaAtual.min && !survIds.some(sid => diaAtual.done.includes(sid))) {
            diaAtual.min = false;
          }
        }
        save();
        renderRotinaMatheusTab(state, callbacks);
      });
    });

    const survBtn = document.getElementById('btn-rm-surv-toggle');
    if (survBtn) {
      survBtn.addEventListener('click', () => {
        if (survAtivo) {
          diaAtual.min = false;
          diaAtual.done = diaAtual.done.filter(id => !survIds.includes(id));
          notify('Modo sobrevivência desativado');
        } else {
          diaAtual.min = true;
          survIds.forEach(id => {
            if (!diaAtual.done.includes(id)) diaAtual.done.push(id);
          });
          notify('⚡ Modo sobrevivência ativado', 'success');
        }
        save();
        renderRotinaMatheusTab(state, callbacks);
      });
    }

    const clearBtn = document.getElementById('btn-rm-clear-day');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Desmarcar todos os itens de hoje?')) return;
        rm.dias[H] = { done: [], min: false };
        save();
        renderRotinaMatheusTab(state, callbacks);
        notify('Itens de hoje desmarcados');
      });
    }
    return;
  }

  /* -------------------- SUB-ABA 2: CAPILAR -------------------- */
  if (subtab === 'capilar') {
    const semAtual = Math.min(3, Math.floor((hoje.getDate() - 1) / 7));
    const sel = typeof rm.capStageSel === 'number' ? rm.capStageSel : semAtual;
    const etapa = ETAPAS_CAPILARES[sel] || ETAPAS_CAPILARES[0];

    const calcDias = (k) => {
      if (!rm.ds[k]) return null;
      return Math.floor((new Date(H) - new Date(rm.ds[k])) / 864e5);
    };
    const dDesc = calcDias('desc');
    const dCorte = calcDias('corte');

    container.innerHTML = `
      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.5rem;">💈 Etapa Capilar desta Semana</h3>
        <p style="margin:0 0 0.6rem;font-size:0.8rem;color:var(--text-muted);">Todo Domingo, 15 min no banho. Toque em qualquer etapa para ver o passo a passo e qual creme usar:</p>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem;">
          ${['Sem 1 · H', 'Sem 2 · N', 'Sem 3 · H', 'Sem 4 · R'].map((lbl, idx) => `
            <button type="button" class="chip ${idx === sel ? 'active' : ''}" data-rm-stage="${idx}">
              ${lbl}${idx === semAtual ? ' ★' : ''}
            </button>
          `).join('')}
        </div>
        <div style="padding:0.75rem;border-radius:var(--radius-md);background:rgba(46,89,51,0.08);margin-bottom:0.75rem;">
          <strong>${etapa.titulo}</strong>
          <p style="margin:0.35rem 0;font-size:0.84rem;">${etapa.foco}</p>
          <div style="font-size:0.82rem;color:var(--brand-moss);font-weight:600;">🧴 Cremes indicados: ${etapa.cremes}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.45rem;font-size:0.85rem;">
          ${etapa.passos.map(p => `<div style="padding:0.55rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);">${p}</div>`).join('')}
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">🏃 Cuidado nos Dias de Corrida</h3>
        <p style="margin:0 0 0.6rem;font-size:0.8rem;color:var(--text-muted);">Quinta, Sábado e Domingo · O sal do suor e o sol de Ribeirão Preto ressecam o fio crespo e desbotam a tinta.</p>
        <div style="display:flex;flex-direction:column;gap:0.45rem;font-size:0.84rem;">
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>1. Antes de correr no sol:</b> Aplicar uma ervilha de <b>Leave-in com proteção solar UV</b> como <i>Amend Solar Defense</i>, <i>Bio Extratus Pós-Sol</i> ou <i>Lola Danos Vorazes</i>.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>2. Lavagem pós-corrida com Co-Wash:</b> Não use shampoo tradicional nos 3 dias de corrida. Aplique <b>Condicionador Limpante Co-Wash</b> como <i>Salon Line Co-Wash #TodeCacho</i>, <i>Lola Comigo Ninguém Pode</i> ou <i>Widi Care Juba Co-Wash</i>, massageie por 1 min e enxágue 100%.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>3. Selagem rápida:</b> Com o cabelo úmido, passe <b>2 gotas de óleo vegetal finalizador</b> + <b>Creme de Pentear para Crespos</b> amassando de baixo para cima.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>4. Dias de Shampoo Hidratante:</b> Use o Shampoo Hidratante apenas <b>1 a 2× na semana</b>, como na Quinta pós-corrida e no Domingo antes da máscara.</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.5rem;">🧴 Guia Completo: Qual Creme Usar em Cada Função</h3>
        <details open style="margin-bottom:0.6rem;">
          <summary style="cursor:pointer;font-weight:700;padding:0.35rem 0;">1. Limpeza: Shampoo Hidratante & Co-Wash</summary>
          <div style="font-size:0.83rem;display:flex;flex-direction:column;gap:0.45rem;margin-top:0.35rem;">
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Shampoo Hidratante — 1 a 2× na semana</b><br>💚 Custo-Benefício: Widi Care Juba Higienizando • Salon Line #TodeCacho Babosa ou Óleo de Coco<br>💎 Upgrade: Lola Morte Súbita Shampoo • Eudora Siàge Nutri Óleos Poderosos</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Co-Wash — Condicionador Limpante para Quinta, Sábado e Domingo</b><br>💚 Custo-Benefício: Salon Line Co-Wash #TodeCacho • Lola Comigo Ninguém Pode<br>💎 Upgrade: Widi Care Juba Co-Wash Higienizador</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Condicionador Selante — fecha as cutículas após a máscara</b><br>💚 Custo-Benefício: Widi Care Juba Condicionador • Salon Line S.O.S Cachos<br>💎 Upgrade: Lola Morte Súbita Condicionador • Amend Cachos</div>
          </div>
        </details>
        <details style="margin-bottom:0.6rem;">
          <summary style="cursor:pointer;font-weight:700;padding:0.35rem 0;">2. Máscaras do Cronograma & Acidificante</summary>
          <div style="font-size:0.83rem;display:flex;flex-direction:column;gap:0.45rem;margin-top:0.35rem;">
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>💧 Hidratação — Semanas 1 e 3:</b> Lola Morte Súbita • Skala Babosa • Widi Care Operação Resgate • Bio Extratus Botica Cachos</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🥑 Nutrição — Semana 2:</b> Lola Dream Cream • Widi Care Juba Manteiga Nutritiva • Eudora Siàge Nutri Óleos Poderosos</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🧱 Reconstrução — Semana 4:</b> Lola Tarja Preta Queratina Vegetal • Salon Line S.O.S Bomba Reconstrução • Eudora Siàge Cauterização</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>⚡ Acidificante Capilar — pós-descoloração e 1× por mês:</b> Lola Densidade Acidificante • Widi Care Acidificante</div>
          </div>
        </details>
        <details style="margin-bottom:0.6rem;">
          <summary style="cursor:pointer;font-weight:700;padding:0.35rem 0;">3. Finalização, Cores & Escada de Cores</summary>
          <div style="font-size:0.83rem;display:flex;flex-direction:column;gap:0.45rem;margin-top:0.35rem;">
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Creme de Pentear & Óleo:</b> Widi Care Encrespando a Juba • Salon Line Crespo Divino • Óleo Lola Pinga Patauá ou Açaí • Óleo 100% Vegetal de Rícino ou Abacate</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🔴 Vermelho & 🔵 Azul Sem Amônia:</b> Kamaleão Color Pica-Pau, Raposinha, Arara Azul ou Pavão • Salon Line Color Express Fun. Misturar 1 colher de tonalizante + 2 colheres de máscara branca por 25 min.</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>⚪ Branco e Platinado & Escada de Cores:</b> Matizador Violeta Lola Loira de Farmácia 1× por semana. Escada sem redescolorir: 1º Mês Branco → 2º Mês Azul sem amônia direto por cima → 3º e 4º Mês Roxo, Vinho ou Vermelho.</div>
          </div>
        </details>
        <details>
          <summary style="cursor:pointer;font-weight:700;padding:0.35rem 0;">4. Roadmap 24 Meses, Barba & Depilação Trimestral</summary>
          <div style="font-size:0.83rem;display:flex;flex-direction:column;gap:0.45rem;margin-top:0.35rem;">
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Fases 1 a 4 · 24 Meses:</b> Meses 1 a 4 Low Taper Fade sem cortar o topo → Meses 5 a 10 micro-aparada de 0,5 cm a cada 3 meses → Meses 11 a 18 Twists, Nagô ou Taper Afro → Meses 19 a 24 volume consolidado com raiz esfumada.</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🧔 Barba Sem Pelo Encravado:</b> Aparar após banho morno com trimmer rente ou lâmina sempre a favor do pelo + lavar com gel facial + 3 gotas de óleo de barba + esfoliação no Domingo.</div>
            <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🪒 Depilação a cada 90 dias:</b> Esfoliar 48h antes e ir sem óleo na pele. Após a sessão: 48h sem correr ou suar forte e aplicar gel de Aloe Vera ou Cicaplast.</div>
          </div>
        </details>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.5rem;">🎨 Controle de Química & Barbeiro</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div>
            <label style="font-size:0.78rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Última descoloração · ciclo 90d</label>
            <input type="date" id="rm-date-desc" class="form-control" value="${rm.ds.desc || ''}" />
            <small style="font-size:0.76rem;color:var(--brand-moss);">${dDesc === null ? 'Sem registro' : `Há ${dDesc} dias · ${90 - dDesc > 0 ? `faltam ${90 - dDesc}d` : 'janela atingida'}`}</small>
          </div>
          <div>
            <label style="font-size:0.78rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">Último barbeiro · ciclo 18d</label>
            <input type="date" id="rm-date-corte" class="form-control" value="${rm.ds.corte || ''}" />
            <small style="font-size:0.76rem;color:var(--brand-moss);">${dCorte === null ? 'Sem registro' : `Há ${dCorte} dias · ${18 - dCorte > 0 ? `faltam ${18 - dCorte}d` : 'janela atingida'}`}</small>
          </div>
        </div>
      </div>

      <div class="dash-card">
        <h3 style="margin:0 0 0.5rem;">🛍️ Enviar Produtos para a Aba Shopping do Maracaju</h3>
        <p style="margin:0 0 0.65rem;font-size:0.8rem;color:var(--text-muted);">Adiciona direto na lista de desejos do Maracaju marcada para o Matheus:</p>
        <div style="display:flex;flex-direction:column;gap:0.45rem;">
          ${PRODUTOS_SUGERIDOS_SHOPPING.map((p, idx) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.45rem 0;border-bottom:1px solid var(--border-subtle);">
              <div>
                <strong style="font-size:0.86rem;">${p.title}</strong>
                <div style="font-size:0.76rem;color:var(--text-muted);">Estimado: R$ ${p.price},00 · ${p.notes}</div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" data-rm-add-shop="${idx}">＋ Shopping</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('[data-rm-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        rm.capStageSel = Number(btn.getAttribute('data-rm-stage')) || 0;
        renderRotinaMatheusTab(state, callbacks);
      });
    });

    const inDesc = document.getElementById('rm-date-desc');
    if (inDesc) inDesc.addEventListener('change', (e) => { rm.ds.desc = e.target.value; save(); renderRotinaMatheusTab(state, callbacks); });
    const inCorte = document.getElementById('rm-date-corte');
    if (inCorte) inCorte.addEventListener('change', (e) => { rm.ds.corte = e.target.value; save(); renderRotinaMatheusTab(state, callbacks); });

    container.querySelectorAll('[data-rm-add-shop]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-rm-add-shop'));
        const prod = PRODUTOS_SUGERIDOS_SHOPPING[idx];
        if (prod && typeof onAddWishlistItem === 'function') {
          onAddWishlistItem({
            title: prod.title,
            price: prod.price,
            category: prod.category,
            forWhom: 'matheus',
            priority: 'media',
            notes: prod.notes
          });
          btn.textContent = '✅ Adicionado';
          btn.disabled = true;
          notify(`"${prod.title}" enviado para a aba Shopping!`, 'success');
        }
      });
    });
    return;
  }

  /* -------------------- SUB-ABA 3: PELE & ESTILO -------------------- */
  if (subtab === 'guias') {
    const ondaIdx = ROTINA_ONDAS.findIndex(o => H >= o.ini && H <= o.fim);
    container.innerHTML = `
      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">🧴 Skincare Pele Negra: Rosto & Corpo</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>1. Gel de Limpeza Facial — Manhã e Noite:</b> Principia GL-01 ou GL-02 • CeraVe Gel de Limpeza • La Roche-Posay Effaclar</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>2. Hidratante Facial + Corporal Sem Cheiro:</b> CeraVe Loção Hidratante 473 ml com pump — serve no corpo nos 2 min pós-banho e no rosto, sem brigar com o perfume</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>3. Protetor Solar FPS 50+ Invisível:</b> ISDIN Fusion Water Magic FPS 60 • Principia PS-01 ou PS-03 • Nivea Sun Toque Seco</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>4. Sérum Noturno & Extras:</b> Principia NC-10 Niacinamida 10% nas noites de Segunda, Quarta e Sexta • Ureia 10% nos pés nas Terças e Sábados • Protetor Labial Nivea Med Repair na mesa do trabalho</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">✨ As 5 Camadas do Homem Sempre Cheiroso</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Camadas 1 a 3 — Base, Suor & Barba:</b> Raspador de língua de manhã + fio dental à noite + antitranspirante neutro à noite após o banho + spray antisséptico nos tênis pós-corrida + 3 gotas de óleo na barba.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Camada 4 — Aplicação de Perfume:</b> Hidratante sem cheiro antes → 5 a 6 borrifadas: 2× pescoço e orelhas, 1× nuca, 1× peito, 1× dobras do cotovelo sem esfregar + Decant de 5 ml na gaveta do trabalho para 2 borrifadas pós-almoço.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>☀️ Perfume Trabalho & Dia:</b> Natura Kaiak Aero • Natura Homem Verum • Quasar Surf • Versace Pour Homme • Acqua di Giò</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🍷 Perfume Noite & Jantar com a Scarlet:</b> Natura Essencial Único ou Oud • Homem Sagaz • O Boticário The Blend ou Zaad Santal • Bleu de Chanel</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">👔 Guarda-Roupa & Cores com Cabelo Colorido</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🔴 Cabelo Vermelho:</b> Preto, Branco, Off-white, Cinza-chumbo, Jeans escuro, Bege, Areia e Azul-marinho liso.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🔵 Cabelo Azul:</b> Branco, Off-white, Preto, Azul-marinho tom sobre tom, Bege, Caramelo e Cinza.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>⚪ Cabelo Branco e Platinado:</b> Combina com tudo — destaque com Preto, Verde-oliva, Terracota, Marinho e Branco.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>✂️ 3 Uniformes & Caimento:</b> Trabalho com camisa manga dobrada, polo ou camiseta encorpada + calça chino ou jeans escuro sem sobra na barra • Casual com bermuda 1 a 2 dedos acima do joelho • Sola do tênis limpa toda semana.</div>
        </div>
      </div>

      <div class="dash-card">
        <h3 style="margin:0 0 0.4rem;">🌊 As 4 Ondas de 14 Dias</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          ${ROTINA_ONDAS.map((o, i) => `
            <div style="padding:0.55rem;background:rgba(46,89,51,${i === (ondaIdx >= 0 ? ondaIdx : 0) ? '0.14' : '0.03'});border-radius:var(--radius-sm);${i === (ondaIdx >= 0 ? ondaIdx : 0) ? 'border-left:3px solid var(--brand-moss);' : ''}">
              <b>${o.t}</b><br>${o.d}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    return;
  }

  /* -------------------- SUB-ABA 4: FOTOS EM GRANDE VOLUME -------------------- */
  if (subtab === 'fotos') {
    const c = getGhCfg();
    const repoInit = c.repo || 'matheusdochapeu-hub/rotina-matheus-fotos';
    const tokInit = c.tok || '';
    const okCfg = Boolean(c.repo && c.tok);

    container.innerHTML = `
      <div class="dash-card" style="margin-bottom:0.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem;">
          <h3 style="margin:0;">📸 Fotos em Grande Volume</h3>
          <span class="chip" id="rm-f-peso">0 MB</span>
        </div>
        <p style="margin:0 0 0.65rem;font-size:0.8rem;color:var(--text-muted);">Envie dezenas ou centenas de fotos de cremes e roupas em lotes paralelos direto para o seu repositório privado no GitHub.</p>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;text-align:center;font-size:0.8rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.04);border-radius:var(--radius-sm);">1 · Na fila<br><strong id="rm-st1n">0</strong></div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.04);border-radius:var(--radius-sm);">2 · GitHub<br><strong id="rm-st2n">${okCfg ? 'configurado' : 'pendente'}</strong></div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.04);border-radius:var(--radius-sm);">3 · Enviadas<br><strong id="rm-st3n">0</strong></div>
        </div>

        <select id="rm-f-cat" class="form-control" style="margin-bottom:0.6rem;">
          <option value="cremes-cabelo">💈 Cremes e produtos de cabelo</option>
          <option value="pele-perfumes">🧴 Pele e perfumes</option>
          <option value="roupa-trabalho">🏢 Roupas — trabalho</option>
          <option value="roupa-casual">☀️ Roupas — casual</option>
          <option value="calcados">👟 Calçados</option>
          <option value="acessorios">⌚ Acessórios</option>
          <option value="eu-vestido">🧍 Eu vestido</option>
        </select>

        <input type="file" id="rm-f-in-gal" accept="image/*" multiple style="display:none;" />
        <input type="file" id="rm-f-in-cam" accept="image/*" capture="environment" style="display:none;" />
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary" id="rm-btn-add-gal" style="flex:1;justify-content:center;">🖼️ Galeria · Várias fotos</button>
          <button type="button" class="btn btn-secondary" id="rm-btn-add-cam" style="flex:1;justify-content:center;">📷 Câmera</button>
        </div>
        <div id="rm-bar-imp" style="display:none;height:8px;background:rgba(0,0,0,0.08);border-radius:99px;overflow:hidden;margin-top:0.6rem;">
          <div id="rm-bar-imp-i" style="height:100%;width:0;background:var(--brand-moss);transition:width 0.2s;"></div>
        </div>
        <p id="rm-f-imp-msg" style="margin:0.4rem 0 0;font-size:0.78rem;color:var(--brand-moss);"></p>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <h3 style="margin:0;">Envio & Galeria</h3>
          <span class="chip" id="rm-f-cnt-filtro">0 fotos</span>
        </div>
        <div id="rm-bar-env" style="display:none;height:8px;background:rgba(0,0,0,0.08);border-radius:99px;overflow:hidden;margin-bottom:0.5rem;">
          <div id="rm-bar-env-i" style="height:100%;width:0;background:var(--brand-moss);transition:width 0.2s;"></div>
        </div>
        <p id="rm-f-msg" style="margin:0 0 0.6rem;font-size:0.8rem;color:var(--text-muted);"></p>

        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.65rem;">
          <button type="button" class="btn btn-primary" id="rm-btn-env" style="flex:1;justify-content:center;">⬆️ Enviar pendentes em lote</button>
          <button type="button" class="btn btn-secondary" id="rm-btn-pause" style="display:none;">⏸️ Pausar</button>
          <button type="button" class="btn btn-secondary" id="rm-btn-share">Compartilhar</button>
        </div>

        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
          <select id="rm-f-filtro" class="form-control" style="flex:1;">
            <option value="todas">Mostrar: Todas as fotos</option>
            <option value="pend">⏳ Apenas pendentes de envio</option>
            <option value="env">✅ Apenas já enviadas</option>
            <option value="cremes-cabelo">💈 Cremes e produtos de cabelo</option>
            <option value="pele-perfumes">🧴 Pele e perfumes</option>
            <option value="roupa-trabalho">🏢 Roupas — trabalho</option>
            <option value="roupa-casual">☀️ Roupas — casual</option>
            <option value="calcados">👟 Calçados</option>
            <option value="acessorios">⌚ Acessórios</option>
            <option value="eu-vestido">🧍 Eu vestido</option>
          </select>
          <button type="button" class="btn btn-secondary btn-sm" id="rm-btn-limpar-env">🧹 Limpar enviadas</button>
        </div>

        <div id="rm-f-gal" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
        <button type="button" class="btn btn-secondary" id="rm-btn-mais-fotos" style="width:100%;justify-content:center;margin-top:0.65rem;display:none;">Mostrar mais fotos</button>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
          <h3 style="margin:0;">☁️ Salvas no GitHub</h3>
          <span class="chip" id="rm-gh-cnt">—</span>
        </div>
        <p id="rm-gh-msg" style="margin:0 0 0.6rem;font-size:0.8rem;color:var(--text-muted);">Fotos que já estão no seu repositório privado, mesmo que a cópia do aparelho tenha sido apagada.</p>
        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
          <select id="rm-gh-filtro" class="form-control" style="flex:1;"><option value="todas">Todas as categorias</option></select>
          <button type="button" class="btn btn-secondary btn-sm" id="rm-btn-gh-load">🔄 Atualizar</button>
        </div>
        <div id="rm-gh-gal" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
        <button type="button" class="btn btn-secondary" id="rm-btn-gh-mais" style="width:100%;justify-content:center;margin-top:0.65rem;display:none;">Mostrar mais</button>
      </div>

      <div class="dash-card">
        <details id="rm-det-cfg" ${!okCfg ? 'open' : ''}>
          <summary style="cursor:pointer;font-weight:700;">⚙️ Conexão com o GitHub Privado de Fotos</summary>
          <p style="font-size:0.78rem;color:var(--text-muted);margin:0.4rem 0 0.6rem;">Repositório privado só para fotos + token fine-grained com permissão <b>Contents: Read and write</b>.</p>
          <input type="text" id="rm-g-repo" class="form-control" placeholder="dono/repositorio" value="${repoInit}" style="margin-bottom:0.5rem;" />
          <input type="password" id="rm-g-tok" class="form-control" placeholder="Token github_pat_..." value="${tokInit}" style="margin-bottom:0.6rem;" />
          <div style="display:flex;gap:0.5rem;">
            <button type="button" class="btn btn-secondary" id="rm-btn-save-cfg" style="flex:1;justify-content:center;">Salvar</button>
            <button type="button" class="btn btn-primary" id="rm-btn-test-cfg" style="flex:1;justify-content:center;">🔌 Testar conexão</button>
          </div>
        </details>
      </div>
    `;

    const selFiltro = document.getElementById('rm-f-filtro');
    if (selFiltro) selFiltro.value = fFiltroAtual;

    const setMsg = (t) => { const el = document.getElementById('rm-f-msg'); if (el) el.textContent = t; };
    const setImpMsg = (t) => { const el = document.getElementById('rm-f-imp-msg'); if (el) el.textContent = t; };

    const atualizarGaleria = async () => {
      activeUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} });
      activeUrls = [];
      const g = document.getElementById('rm-f-gal');
      if (!g) return;
      g.innerHTML = '';

      const fs = (await listarFotosIdb()).sort((a, b) => (a.id < b.id ? 1 : -1));
      const pend = fs.filter(f => !f.sent).length;
      const totalBytes = fs.reduce((acc, f) => acc + (f.size || (f.blob && f.blob.size) || 0), 0);

      const pesoEl = document.getElementById('rm-f-peso');
      const st1El = document.getElementById('rm-st1n');
      const st3El = document.getElementById('rm-st3n');
      const btnEnv = document.getElementById('rm-btn-env');
      if (pesoEl) pesoEl.textContent = (totalBytes / 1048576).toFixed(1) + ' MB';
      if (st1El) st1El.textContent = String(pend);
      if (st3El) st3El.textContent = String(fs.length - pend);
      if (btnEnv) btnEnv.disabled = !pend || enviandoFotos;

      const filtradas = fs.filter(f => {
        if (fFiltroAtual === 'todas') return true;
        if (fFiltroAtual === 'pend') return !f.sent;
        if (fFiltroAtual === 'env') return Boolean(f.sent);
        return f.cat === fFiltroAtual;
      });
      const cntEl = document.getElementById('rm-f-cnt-filtro');
      if (cntEl) cntEl.textContent = `${filtradas.length} fotos`;

      const btnMais = document.getElementById('rm-btn-mais-fotos');
      if (!filtradas.length) {
        if (btnMais) btnMais.style.display = 'none';
        g.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:1rem 0;font-size:0.84rem;">Nenhuma foto guardada neste aparelho. As já enviadas aparecem em ☁️ Salvas no GitHub, logo abaixo.</div>';
        return;
      }

      const limite = fPagina * FOTOS_POR_PAGINA;
      const visiveis = filtradas.slice(0, limite);
      if (btnMais) {
        btnMais.style.display = filtradas.length > limite ? 'inline-flex' : 'none';
        btnMais.textContent = `Mostrar mais (${filtradas.length - limite} restantes)`;
      }

      visiveis.forEach(f => {
        const d = document.createElement('div');
        d.style.cssText = 'position:relative;';
        const u = URL.createObjectURL(f.thumb || f.blob);
        activeUrls.push(u);
        d.innerHTML = `
          <img src="${u}" loading="lazy" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;" />
          <span style="position:absolute;left:4px;bottom:4px;font-size:0.65rem;background:rgba(0,0,0,0.75);color:#fff;border-radius:6px;padding:2px 5px;">${f.sent ? '✅' : '⏳'} ${f.cat}</span>
          <button type="button" style="position:absolute;right:4px;top:4px;background:rgba(0,0,0,0.75);color:#fff;border:0;border-radius:50%;width:26px;height:26px;cursor:pointer;">×</button>
        `;
        d.querySelector('button').addEventListener('click', async () => {
          if (confirm('Remover esta foto do aparelho?')) {
            await idbFoto('readwrite', s => s.delete(f.id));
            atualizarGaleria();
          }
        });
        g.appendChild(d);
      });
    };

    const importarArquivos = async (fileList) => {
      const files = [...fileList];
      if (!files.length) return;
      const cat = document.getElementById('rm-f-cat')?.value || 'cremes-cabelo';
      const barImp = document.getElementById('rm-bar-imp');
      const barImpI = document.getElementById('rm-bar-imp-i');
      const bGal = document.getElementById('rm-btn-add-gal');
      const bCam = document.getElementById('rm-btn-add-cam');
      if (barImp) barImp.style.display = 'block';
      if (bGal) bGal.disabled = true;
      if (bCam) bCam.disabled = true;
      await manterTelaAcesa(true);

      let n = 0;
      let falhas = 0;
      for (let i = 0; i < files.length; i++) {
        if (barImpI) barImpI.style.width = Math.round((i / files.length) * 100) + '%';
        setImpMsg(`Otimizando e salvando foto ${i + 1} de ${files.length}...`);
        await new Promise(r => setTimeout(r, 15));
        try {
          const { blob, thumb, size } = await comprimirParFoto(files[i]);
          const id = Date.now() + '-' + String(i).padStart(3, '0') + '-' + Math.random().toString(36).slice(2, 6);
          await idbFoto('readwrite', s => s.put({ id, cat, blob, thumb, size, sent: false }));
          n++;
        } catch (err) {
          falhas++;
        }
      }
      if (barImpI) barImpI.style.width = '100%';
      setTimeout(() => { if (barImp) barImp.style.display = 'none'; }, 600);
      if (bGal) bGal.disabled = false;
      if (bCam) bCam.disabled = false;
      setImpMsg(n ? `✅ ${n} fotos prontas na fila${falhas ? ` · ${falhas} falharam` : ''}` : '');
      await manterTelaAcesa(false);
      notify(`${n} fotos adicionadas à fila`, 'success');
      atualizarGaleria();
    };

    document.getElementById('rm-btn-add-gal')?.addEventListener('click', () => document.getElementById('rm-f-in-gal')?.click());
    document.getElementById('rm-btn-add-cam')?.addEventListener('click', () => document.getElementById('rm-f-in-cam')?.click());
    document.getElementById('rm-f-in-gal')?.addEventListener('change', (e) => { importarArquivos(e.target.files); e.target.value = ''; });
    document.getElementById('rm-f-in-cam')?.addEventListener('change', (e) => { importarArquivos(e.target.files); e.target.value = ''; });

    if (selFiltro) {
      selFiltro.addEventListener('change', (e) => {
        fFiltroAtual = e.target.value;
        fPagina = 1;
        atualizarGaleria();
      });
    }
    document.getElementById('rm-btn-mais-fotos')?.addEventListener('click', () => {
      fPagina++;
      atualizarGaleria();
    });

    document.getElementById('rm-btn-limpar-env')?.addEventListener('click', async () => {
      const env = (await listarFotosIdb()).filter(f => f.sent);
      if (!env.length) { notify('Nenhuma foto enviada para limpar'); return; }
      if (!confirm(`Remover do aparelho as ${env.length} fotos já enviadas ao GitHub?`)) return;
      for (const f of env) await idbFoto('readwrite', s => s.delete(f.id));
      notify(`${env.length} fotos enviadas removidas do aparelho`, 'success');
      atualizarGaleria();
    });

    const salvarConfigGh = () => {
      const repo = limpaRepoStr(document.getElementById('rm-g-repo')?.value);
      const tok = limpaTokStr(document.getElementById('rm-g-tok')?.value);
      const inR = document.getElementById('rm-g-repo');
      if (inR) inR.value = repo;
      localStorage.setItem('rm-gh', JSON.stringify({ repo, tok }));
      const st2 = document.getElementById('rm-st2n');
      if (st2) st2.textContent = repo && tok ? 'configurado' : 'pendente';
    };

    document.getElementById('rm-btn-save-cfg')?.addEventListener('click', () => {
      salvarConfigGh();
      notify('Configuração do GitHub salva!', 'success');
    });

    document.getElementById('rm-btn-test-cfg')?.addEventListener('click', async () => {
      salvarConfigGh();
      const cfg = getGhCfg();
      if (!cfg.repo || !cfg.tok) { notify('Preencha repositório e token', 'warning'); return; }
      setMsg('Testando conexão com o GitHub...');
      try {
        const r = await ghFetch(`https://api.github.com/repos/${cfg.repo}`, {}, 15000);
        if (!r.ok) { setMsg('❌ ' + explicaStatusGh(r.status)); notify(explicaStatusGh(r.status), 'error'); return; }
        const j = await r.json();
        if (j.permissions && !j.permissions.push) {
          setMsg('❌ Token só tem leitura. Precisa de Contents: Read and write.');
          notify('Token sem permissão de escrita', 'error');
          return;
        }
        setMsg(`✅ Conexão OK${j.private ? ' · repositório privado' : ' ⚠️ repositório público'}`);
        notify('Conexão com GitHub OK ✅', 'success');
      } catch (err) {
        setMsg('❌ ' + err.message);
        notify(err.message, 'error');
      }
    });

    document.getElementById('rm-btn-pause')?.addEventListener('click', () => {
      if (!enviandoFotos) return;
      pausarEnvioSolicitado = true;
      setMsg('Pausando após o lote atual...');
    });

    document.getElementById('rm-btn-env')?.addEventListener('click', async () => {
      if (enviandoFotos) return;
      salvarConfigGh();
      const cfg = getGhCfg();
      if (!cfg.repo || !cfg.tok) {
        const det = document.getElementById('rm-det-cfg');
        if (det) det.open = true;
        notify('Configure o token do GitHub abaixo primeiro', 'warning');
        return;
      }
      const pend = (await listarFotosIdb()).filter(f => !f.sent);
      if (!pend.length) { notify('Nenhuma foto pendente'); return; }

      enviandoFotos = true;
      pausarEnvioSolicitado = false;
      const bEnv = document.getElementById('rm-btn-env');
      const bPause = document.getElementById('rm-btn-pause');
      const bar = document.getElementById('rm-bar-env');
      const barI = document.getElementById('rm-bar-env-i');
      if (bEnv) bEnv.disabled = true;
      if (bPause) bPause.style.display = 'inline-flex';
      if (bar) bar.style.display = 'block';
      if (barI) barI.style.width = '2%';
      await manterTelaAcesa(true);

      let enviadosTotal = 0;
      try {
        const repoRes = await ghFetch(`https://api.github.com/repos/${cfg.repo}`, {}, 15000);
        if (!repoRes.ok) throw new Error(explicaStatusGh(repoRes.status));
        const repoInfo = await repoRes.json();
        const branch = repoInfo.default_branch || 'main';

        const fila = [...pend];
        const refCheck = await ghFetch(`https://api.github.com/repos/${cfg.repo}/git/ref/heads/${branch}`, {}, 10000);
        if (!refCheck.ok && fila.length) {
          const f0 = fila.shift();
          setMsg(`Inicializando repositório com a foto 1 de ${pend.length}...`);
          await enviarFotoIndividualRetry(cfg.repo, f0);
          f0.sent = true;
          await idbFoto('readwrite', s => s.put(f0));
          enviadosTotal++;
          if (barI) barI.style.width = Math.round((enviadosTotal / pend.length) * 100) + '%';
        }

        const TAM_LOTE = 10;
        for (let i = 0; i < fila.length; i += TAM_LOTE) {
          if (pausarEnvioSolicitado) break;
          const lote = fila.slice(i, i + TAM_LOTE);
          let concluidosNoLote = 0;
          const usouBatch = await enviarLoteGitData(cfg.repo, branch, lote, () => {
            concluidosNoLote++;
            const p = Math.round(((enviadosTotal + concluidosNoLote) / pend.length) * 100);
            if (barI) barI.style.width = p + '%';
            setMsg(`Enviando em lote turbo: ${enviadosTotal + concluidosNoLote} de ${pend.length} fotos...`);
          });
          if (usouBatch) {
            enviadosTotal += lote.filter(x => x.sent).length;
          } else {
            for (const f of lote) {
              if (pausarEnvioSolicitado) break;
              setMsg(`Enviando foto ${enviadosTotal + 1} de ${pend.length}...`);
              await enviarFotoIndividualRetry(cfg.repo, f);
              f.sent = true;
              await idbFoto('readwrite', s => s.put(f));
              enviadosTotal++;
              if (barI) barI.style.width = Math.round((enviadosTotal / pend.length) * 100) + '%';
            }
          }
        }

        if (barI) barI.style.width = '100%';
        setTimeout(() => { if (bar) bar.style.display = 'none'; }, 800);
        if (pausarEnvioSolicitado) {
          setMsg(`⏸️ Envio pausado (${enviadosTotal} enviadas). Toque em Enviar para retomar.`);
        } else {
          setMsg(`✅ Todas as ${enviadosTotal} fotos foram enviadas ao GitHub!`);
          notify(`${enviadosTotal} fotos enviadas com sucesso ✅`, 'success');
        }
      } catch (err) {
        setMsg(`❌ Parou após ${enviadosTotal} enviadas: ${err.message}. Toque em Enviar para retomar.`);
        notify(err.message, 'error');
        if (bar) bar.style.display = 'none';
      } finally {
        enviandoFotos = false;
        pausarEnvioSolicitado = false;
        if (bPause) bPause.style.display = 'none';
        await manterTelaAcesa(false);
        atualizarGaleria();
        ghFotosCache = null;
        if (typeof renderGaleriaGitHubRef === 'function') renderGaleriaGitHubRef(true);
      }
    });

    document.getElementById('rm-btn-share')?.addEventListener('click', async () => {
      const pend = (await listarFotosIdb()).filter(f => !f.sent);
      if (!pend.length) { notify('Nenhuma foto pendente'); return; }
      const files = pend.slice(0, 15).map(f => new File([f.blob], `${f.cat}-${f.id}.jpg`, { type: 'image/jpeg' }));
      if (navigator.canShare && navigator.canShare({ files })) {
        try { await navigator.share({ files, title: 'Fotos Rotina Matheus' }); } catch (e) {}
      } else {
        notify('Compartilhamento nativo não suportado neste navegador', 'warning');
      }
    });

    const ghSel = document.getElementById('rm-gh-filtro');
    const catSel = document.getElementById('rm-f-cat');
    if (ghSel && catSel) {
      [...catSel.options].forEach(o => ghSel.add(new Option(o.textContent, o.value)));
      ghSel.value = ghFiltroAtual;
    }
    const setGhMsg = (t) => { const el = document.getElementById('rm-gh-msg'); if (el) el.textContent = t; };

    const renderGaleriaGitHub = renderGaleriaGitHubRef = async (force = false) => {
      const g = document.getElementById('rm-gh-gal');
      const cnt = document.getElementById('rm-gh-cnt');
      const btnMais = document.getElementById('rm-btn-gh-mais');
      if (!g) return;
      const cfg = getGhCfg();
      if (!cfg.repo || !cfg.tok) {
        setGhMsg('Configure o repositório e o token em "Conexão com o GitHub" para ver as fotos salvas.');
        if (cnt) cnt.textContent = '—';
        return;
      }
      setGhMsg('Buscando fotos no GitHub...');
      let info;
      try {
        info = await listarFotosGitHub(force);
      } catch (err) {
        setGhMsg('❌ ' + err.message);
        return;
      }
      const filtradas = info.list.filter(f => ghFiltroAtual === 'todas' || f.cat === ghFiltroAtual);
      if (cnt) cnt.textContent = `${filtradas.length} fotos`;
      const st3El = document.getElementById('rm-st3n');
      if (st3El && st3El.textContent === '0' && info.list.length) st3El.textContent = `${info.list.length} ☁️`;
      setGhMsg(info.list.length
        ? `${info.list.length} fotos no repositório ${info.repo}${info.truncated ? ' (lista parcial — repositório muito grande)' : ''}. Toque para ampliar.`
        : 'Nenhuma foto encontrada no repositório ainda.');
      g.innerHTML = '';
      if (!filtradas.length) {
        if (btnMais) btnMais.style.display = 'none';
        if (info.list.length) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:1rem 0;font-size:0.84rem;">Nenhuma foto nesta categoria.</div>';
        return;
      }
      const limite = ghPagina * GH_FOTOS_POR_PAGINA;
      const visiveis = filtradas.slice(0, limite);
      if (btnMais) {
        btnMais.style.display = filtradas.length > limite ? 'inline-flex' : 'none';
        btnMais.textContent = `Mostrar mais (${filtradas.length - limite} restantes)`;
      }
      const fila = [];
      visiveis.forEach(f => {
        const d = document.createElement('div');
        d.style.cssText = 'position:relative;aspect-ratio:1;background:rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;cursor:zoom-in;';
        d.innerHTML = `
          <div class="rm-gh-ph" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--text-muted);">carregando…</div>
          <span style="position:absolute;left:4px;bottom:4px;font-size:0.65rem;background:rgba(0,0,0,0.75);color:#fff;border-radius:6px;padding:2px 5px;">☁️ ${f.cat}</span>
        `;
        g.appendChild(d);
        fila.push({ f, d });
      });
      // Baixa as miniaturas com no máximo 4 downloads simultâneos
      const workers = Array.from({ length: Math.min(4, fila.length) }, async () => {
        while (fila.length) {
          const { f, d } = fila.shift();
          if (!d.isConnected) continue;
          try {
            const url = await baixarFotoGitHub(f);
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            d.querySelector('.rm-gh-ph')?.remove();
            d.prepend(img);
            d.addEventListener('click', () => abrirFotoTelaCheia(url, f.cat));
          } catch (err) {
            const ph = d.querySelector('.rm-gh-ph');
            if (ph) ph.textContent = '⚠️ falhou';
          }
        }
      });
      await Promise.all(workers);
    };

    ghSel?.addEventListener('change', (e) => {
      ghFiltroAtual = e.target.value;
      ghPagina = 1;
      renderGaleriaGitHub();
    });
    document.getElementById('rm-btn-gh-load')?.addEventListener('click', () => { ghPagina = 1; renderGaleriaGitHub(true); });
    document.getElementById('rm-btn-gh-mais')?.addEventListener('click', () => { ghPagina++; renderGaleriaGitHub(); });
    document.getElementById('rm-btn-test-cfg')?.addEventListener('click', () => setTimeout(() => renderGaleriaGitHub(true), 1500));

    atualizarGaleria();
    renderGaleriaGitHub();
    return;
  }

  /* -------------------- SUB-ABA 5: CICLOS -------------------- */
  if (subtab === 'ciclos') {
    const calcDias = (k) => {
      if (!rm.ds[k]) return null;
      return Math.floor((new Date(H) - new Date(rm.ds[k])) / 864e5);
    };
    container.innerHTML = `
      <div class="dash-card">
        <h3 style="margin:0 0 0.5rem;">🔔 Ciclos & Compromissos Pessoais</h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem;">
          ${ROTINA_CICLOS.map(c => {
            const n = calcDias(c.k);
            const rest = n === null ? null : c.d - n;
            const st = n === null ? 'Sem registro' : (n === 0 ? 'Feito hoje ✅' : (rest > 0 ? `Há ${n}d · faltam ${rest} dias` : `Há ${n}d · atrasado ${-rest} dias`));
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0;border-bottom:1px solid var(--border-subtle);">
                <div>
                  <strong>${c.n}</strong> <small style="color:var(--text-muted);">ciclo de ${c.d}d</small>
                  <div style="font-size:0.78rem;color:var(--brand-moss);">${st}</div>
                </div>
                <div style="display:flex;gap:0.35rem;">
                  <button type="button" class="btn btn-secondary btn-sm" data-rm-ciclo="${c.k}">Feito hoje</button>
                  ${rm.ds[c.k] ? `<button type="button" class="btn btn-secondary btn-sm" data-rm-ciclo-clear="${c.k}">×</button>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    container.querySelectorAll('[data-rm-ciclo]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-rm-ciclo');
        rm.ds[k] = H;
        save();
        renderRotinaMatheusTab(state, callbacks);
        notify('Ciclo atualizado ✅', 'success');
      });
    });
    container.querySelectorAll('[data-rm-ciclo-clear]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-rm-ciclo-clear');
        delete rm.ds[k];
        save();
        renderRotinaMatheusTab(state, callbacks);
      });
    });
  }
}
