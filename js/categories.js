// ============================================================
//  MARACAJU - GESTÃO DE CATEGORIAS & EMOJIS DE FILTRO
// ============================================================

export const DEFAULT_CATEGORIES = {
  tarefas: [
    { id: "cozinha", label: "Cozinha", icon: "🍳" },
    { id: "sala", label: "Sala", icon: "🛋️" },
    { id: "quartos", label: "Quartos", icon: "🛏️" },
    { id: "banheiros", label: "Banheiros", icon: "🚿" },
    { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
    { id: "cuidados", label: "Cuidados & Plantas", icon: "🪴" },
    { id: "garagem", label: "Garagem", icon: "🚗" }
  ],
  carro: [
    { id: "oleo_revisao", label: "Revisão & Óleo", icon: "🛢️" },
    { id: "mecanica", label: "Mecânica Geral", icon: "🔧" },
    { id: "pneus_freios", label: "Pneus & Freios", icon: "🛞" },
    { id: "estetica", label: "Estética & Lavagem", icon: "✨" },
    { id: "eletrica", label: "Elétrica & Acessórios", icon: "🔌" },
    { id: "outros", label: "Outros & Documentos", icon: "📦" }
  ],
  reformas: [
    { id: "cozinha", label: "Cozinha", icon: "🍳" },
    { id: "sala", label: "Sala", icon: "🛋️" },
    { id: "quartos", label: "Quartos", icon: "🛏️" },
    { id: "banheiros", label: "Banheiros", icon: "🚿" },
    { id: "varanda", label: "Varanda & Quintal", icon: "🌿" },
    { id: "geral", label: "Geral da Casa", icon: "🏡" }
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
  { id: "carro", label: "Carro", icon: "🚗" },
  { id: "reformas", label: "Reformas", icon: "🔨" },
  { id: "sonhos", label: "Sonhos", icon: "✨" },
  { id: "compras", label: "Compras", icon: "🛒" }
];

export const QUICK_EMOJIS_LIST = [
  "🍳", "🛋️", "🛏️", "🚿", "🧺", "🪴", "🚗", "🌿", "💻", "🍖", 
  "🐶", "🐱", "🏊", "🥫", "🎨", "🧹", "🔧", "🛢️", "🛞", "🔌", 
  "✨", "📦", "✈️", "🏡", "💖", "💡", "📐", "🛠️", "🎯", "🛒",
  "📱", "☕", "🍺", "🍷", "🍕", "🍔", "📚", "🎮", "🎸", "🚲",
  "🥦", "🥩", "🧀", "🥖", "🥤", "🧽", "🧴", "🐾", "👶", "💊"
];

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
  if (!state.categories) {
    state.categories = {};
  }
  for (const mod of Object.keys(DEFAULT_CATEGORIES)) {
    if (!Array.isArray(state.categories[mod]) || state.categories[mod].length === 0) {
      state.categories[mod] = DEFAULT_CATEGORIES[mod].map(c => ({ ...c }));
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
    icon: (icon || "").trim() || (moduleName === "carro" ? "🚗" : "🏷️")
  };

  list.push(newCat);
  state.categories[moduleName] = list;
  return newCat;
}

export function updateCategory(state, moduleName, id, { label, icon }) {
  ensureStateCategories(state);
  const list = state.categories[moduleName] || [];
  const index = list.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Categoria não encontrada.");

  const cleanLabel = (label || "").trim();
  if (!cleanLabel) throw new Error("O nome da categoria é obrigatório.");

  list[index] = {
    ...list[index],
    label: cleanLabel,
    icon: (icon || "").trim() || list[index].icon || "🏷️"
  };

  return list[index];
}

export function deleteCategory(state, moduleName, id) {
  ensureStateCategories(state);
  const list = state.categories[moduleName] || [];
  if (list.length <= 1) {
    throw new Error("Não é possível excluir todas as categorias. Mantenha ao menos uma.");
  }

  state.categories[moduleName] = list.filter(c => c.id !== id);
  return true;
}
