// ============================================================
//  MARACAJU - GESTÃO DE CATEGORIAS & EMOJIS DE FILTRO
// ============================================================

export const DEFAULT_ROOM_CATEGORIES = [
  { id: "suite", label: "Suite", icon: "🛏️" },
  { id: "corredor", label: "Corredor", icon: "🚪" },
  { id: "banheiro_azul", label: "Banheiro Azul", icon: "🚿" },
  { id: "banheiro_rosa", label: "Banheiro Rosa", icon: "🧼" },
  { id: "cozinha", label: "Cozinha", icon: "🍳" },
  { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
  { id: "quintal", label: "Quintal", icon: "🌿" },
  { id: "sala", label: "Sala", icon: "🛋️" },
  { id: "escritorio", label: "Escritório", icon: "💻" },
  { id: "alpendre", label: "Alpendre", icon: "🏡" },
  { id: "area_externa_garagem", label: "Área Externa - Garagem", icon: "🚗" }
];

export const DEFAULT_CATEGORIES = {
  tarefas: [
    { id: "suite", label: "Suite", icon: "🛏️" },
    { id: "corredor", label: "Corredor", icon: "🚪" },
    { id: "banheiro_azul", label: "Banheiro Azul", icon: "🚿" },
    { id: "banheiro_rosa", label: "Banheiro Rosa", icon: "🧼" },
    { id: "cozinha", label: "Cozinha", icon: "🍳" },
    { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
    { id: "quintal", label: "Quintal", icon: "🌿" },
    { id: "sala", label: "Sala", icon: "🛋️" },
    { id: "escritorio", label: "Escritório", icon: "💻" },
    { id: "alpendre", label: "Alpendre", icon: "🏡" },
    { id: "area_externa_garagem", label: "Área Externa - Garagem", icon: "🚗" }
  ],
  reformas: [
    { id: "suite", label: "Suite", icon: "🛏️" },
    { id: "corredor", label: "Corredor", icon: "🚪" },
    { id: "banheiro_azul", label: "Banheiro Azul", icon: "🚿" },
    { id: "banheiro_rosa", label: "Banheiro Rosa", icon: "🧼" },
    { id: "cozinha", label: "Cozinha", icon: "🍳" },
    { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
    { id: "quintal", label: "Quintal", icon: "🌿" },
    { id: "sala", label: "Sala", icon: "🛋️" },
    { id: "escritorio", label: "Escritório", icon: "💻" },
    { id: "alpendre", label: "Alpendre", icon: "🏡" },
    { id: "area_externa_garagem", label: "Área Externa - Garagem", icon: "🚗" }
  ],
  carro: [
    { id: "oleo_revisao", label: "Revisão & Óleo", icon: "🛢️" },
    { id: "mecanica", label: "Mecânica Geral", icon: "🔧" },
    { id: "pneus_freios", label: "Pneus & Freios", icon: "🛞" },
    { id: "estetica", label: "Estética & Lavagem", icon: "✨" },
    { id: "eletrica", label: "Elétrica & Acessórios", icon: "🔌" },
    { id: "outros", label: "Outros & Documentos", icon: "📦" }
  ],
  sonhos: [
    { id: "viagem", label: "Viagens", icon: "✈️" },
    { id: "casa", label: "Casa & Conforto", icon: "🏡" },
    { id: "bens", label: "Conquistas", icon: "🚗" },
    { id: "experiencia", label: "Vida a Dois", icon: "💖" }
  ],
  compras: [
    { id: "hortifruti", label: "Hortifrúti", icon: "🥦" },
    { id: "acougue", label: "Açougue", icon: "🥩" },
    { id: "frios", label: "Frios & Laticínios", icon: "🧀" },
    { id: "padaria", label: "Padaria", icon: "🥖" },
    { id: "mercearia", label: "Mercearia", icon: "🥫" },
    { id: "bebidas", label: "Bebidas", icon: "🥤" },
    { id: "limpeza", label: "Limpeza", icon: "🧽" },
    { id: "higiene", label: "Higiene", icon: "🧴" },
    { id: "pet", label: "Pet", icon: "🐾" },
    { id: "outros", label: "Outros", icon: "🛒" }
  ]
};

export const CATEGORY_MODULES = [
  { id: "tarefas", label: "Tarefas", icon: "🧹" },
  { id: "reformas", label: "Reformas", icon: "🔨" },
  { id: "compras", label: "Mercado", icon: "🛒" },
  { id: "carro", label: "Carro", icon: "🚗" },
  { id: "sonhos", label: "Sonhos", icon: "✨" }
];

export const QUICK_EMOJIS_LIST = [
  "🛏️", "🚪", "🚿", "🧼", "🍳", "🧺", "🌿", "🛋️", "💻", "🏡", "🚗",
  "🪴", "📦", "✨", "🔧", "🛢️", "🛞", "🔌", "✈️", "💖", "💡", "📐",
  "🛠️", "🎯", "🛒", "🥦", "🥩", "🧀", "🥖", "🥫", "🥤", "🧽", "🧴",
  "🐾", "👶", "💊", "☕", "🍺", "🍷", "🍕", "🍔", "📚", "🎮", "🎸"
];

export const LEGACY_ROOM_MAP = {
  quartos: { id: "suite", label: "Suite", icon: "🛏️" },
  banheiros: { id: "banheiro_azul", label: "Banheiro Azul", icon: "🚿" },
  cuidados: { id: "quintal", label: "Quintal", icon: "🌿" },
  garagem: { id: "area_externa_garagem", label: "Área Externa - Garagem", icon: "🚗" },
  varanda: { id: "alpendre", label: "Alpendre", icon: "🏡" },
  geral: { id: "area_externa_garagem", label: "Área Externa - Garagem", icon: "🚗" }
};

export function slugify(text) {
  if (!text) return `cat_${Date.now()}`;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || `cat_${Date.now()}`;
}

export function ensureStateCategories(state) {
  if (!state) return {};
  if (!state.categories) {
    state.categories = {};
  }
  for (const mod of Object.keys(DEFAULT_CATEGORIES)) {
    if (!Array.isArray(state.categories[mod]) || state.categories[mod].length === 0) {
      state.categories[mod] = DEFAULT_CATEGORIES[mod].map(c => ({ ...c }));
    } else if (mod === 'tarefas' || mod === 'reformas') {
      const currentIds = new Set(state.categories[mod].map(c => c.id));
      // Se não possui as categorias padrão como 'suite' ou 'alpendre', substitui pelas 11 oficiais
      if (!currentIds.has('suite') && !currentIds.has('alpendre')) {
        state.categories[mod] = DEFAULT_ROOM_CATEGORIES.map(c => ({ ...c }));
      } else {
        // Assegura que todas as 11 categorias padrão estejam presentes
        DEFAULT_ROOM_CATEGORIES.forEach(defCat => {
          if (!currentIds.has(defCat.id)) {
            state.categories[mod].push({ ...defCat });
          }
        });
      }
    }
  }
  return state.categories;
}

export function getCategories(state, moduleName) {
  ensureStateCategories(state);
  return state.categories[moduleName] || [];
}

export function findCategory(state, moduleName, id) {
  const list = getCategories(state, moduleName);
  const found = list.find(c => c.id === id);
  if (found) return found;

  // Fallback para IDs legados da casa
  if ((moduleName === 'tarefas' || moduleName === 'reformas') && id && LEGACY_ROOM_MAP[id]) {
    const mapped = list.find(c => c.id === LEGACY_ROOM_MAP[id].id);
    if (mapped) return mapped;
    return LEGACY_ROOM_MAP[id];
  }

  // Fallback caso o item tenha id livre ou antigo
  return {
    id: id || "geral",
    label: id ? (id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, " ")) : "Geral",
    icon: moduleName === "carro" ? "🚗" : (moduleName === "sonhos" ? "✨" : "🏠")
  };
}

export function addCategory(state, moduleName, { label, icon, id }) {
  ensureStateCategories(state);
  const cleanLabel = (label || "").trim();
  if (!cleanLabel) throw new Error("O nome da categoria é obrigatório.");

  const list = state.categories[moduleName] || [];
  let baseId = id ? slugify(id) : slugify(cleanLabel);
  let finalId = baseId;
  let counter = 1;

  while (list.some(c => c.id === finalId)) {
    finalId = `${baseId}_${counter++}`;
  }

  const newCat = {
    id: finalId,
    label: cleanLabel,
    icon: icon ? icon.trim() : "🏷️"
  };

  list.push(newCat);
  state.categories[moduleName] = list;
  return newCat;
}

export function updateCategory(state, moduleName, id, { label, icon }) {
  ensureStateCategories(state);
  const list = state.categories[moduleName] || [];
  const cat = list.find(c => c.id === id);
  if (!cat) throw new Error("Categoria não encontrada.");

  if (label !== undefined) {
    const cleanLabel = (label || "").trim();
    if (!cleanLabel) throw new Error("O nome da categoria é obrigatório.");
    cat.label = cleanLabel;
  }
  if (icon !== undefined) {
    cat.icon = (icon || "").trim() || "🏷️";
  }
  return cat;
}

export function deleteCategory(state, moduleName, id) {
  ensureStateCategories(state);
  const list = state.categories[moduleName] || [];
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return null;
  return list.splice(idx, 1)[0];
}
