// ============================================================
//  MARACAJU 88 - CONFIGURAÇÃO E DADOS INICIAIS
// ============================================================

export const APP_CONFIG = {
  appName: "Maracaju 88",
  version: "1.0.0",
  storageKey: "MARACAJU88_STATE_v1",
  syncIntervalMs: 60000 // 1 min auto-check
};

export const DEFAULT_USERS = {
  user1: { id: "matheus", name: "Matheus", avatarEmoji: "👨‍💻", xp: 0 },
  user2: { id: "esposa", name: "Esposa", avatarEmoji: "👩‍💼", xp: 0 }
};

export const ROOMS = [
  { id: "tudo", label: "Todos os Cômodos", icon: "🏠" },
  { id: "cozinha", label: "Cozinha", icon: "🍳" },
  { id: "sala", label: "Sala", icon: "🛋️" },
  { id: "quartos", label: "Quartos", icon: "🛏️" },
  { id: "banheiros", label: "Banheiros", icon: "🚿" },
  { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
  { id: "cuidados", label: "Cuidados & Plantas", icon: "🪴" }
];

export const EFFORT_LEVELS = {
  leve: { label: "Leve", xp: 10, icon: "⚡" },
  media: { label: "Média", xp: 25, icon: "⚡⚡" },
  pesada: { label: "Pesada", xp: 50, icon: "⚡⚡⚡" }
};

export const LEVELS = [
  { level: 1, minXp: 0, title: "Iniciantes do Lar", icon: "🌱" },
  { level: 2, minXp: 150, title: "Dupla Organizada", icon: "🤝" },
  { level: 3, minXp: 400, title: "Mestres do Conforto", icon: "🛋️" },
  { level: 4, minXp: 800, title: "Guardiões da Casa", icon: "🛡️" },
  { level: 5, minXp: 1500, title: "Reis do Maracaju 88", icon: "👑" },
  { level: 6, minXp: 2500, title: "Lenda Doméstica Suprema", icon: "✨" }
];

export const BADGES = [
  { id: "primeira_tarefa", name: "Primeiro Passo", desc: "Completar a primeira tarefa diária", icon: "🌟", reqType: "tasks_count", reqValue: 1 },
  { id: "faxina_10", name: "Mão na Massa", desc: "Completar 10 tarefas", icon: "🧹", reqType: "tasks_count", reqValue: 10 },
  { id: "streak_3", name: "Pegando o Ritmo", desc: "3 dias consecutivos de tarefas", icon: "🔥", reqType: "streak", reqValue: 3 },
  { id: "streak_7", name: "Semana Impecável", desc: "7 dias seguidos de casa cuidada", icon: "⚡", reqType: "streak", reqValue: 7 },
  { id: "mestre_cozinha", name: "Chef da Louça", desc: "15 tarefas de cozinha concluídas", icon: "🍳", reqType: "room_cozinha", reqValue: 15 },
  { id: "reforma_iniciada", name: "Visão de Futuro", desc: "Cadastrar a primeira ideia de reforma", icon: "🛠️", reqType: "reformas_count", reqValue: 1 },
  { id: "primeiro_sonho", name: "Sonhadores", desc: "Cadastrar um sonho do casal", icon: "✨", reqType: "sonhos_count", reqValue: 1 },
  { id: "tarefas_100", name: "Casa dos Sonhos", desc: "Completar 100 tarefas no total", icon: "🏆", reqType: "tasks_count", reqValue: 100 }
];

export const INITIAL_TASKS = [
  // Cozinha
  { id: "task_1", title: "Lavar e guardar a louça", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria", notes: "Deixar a pia seca e limpa" },
  { id: "task_2", title: "Limpar o fogão e bancada", room: "cozinha", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_3", title: "Tirar o lixo orgânico da pia", room: "cozinha", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  // Sala
  { id: "task_4", title: "Organizar almofadas e mantas da sala", room: "sala", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_5", title: "Varrer ou aspirar o chão da sala", room: "sala", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria", notes: "" },
  // Quartos
  { id: "task_6", title: "Arrumar a cama ao levantar", room: "quartos", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_7", title: "Guardar roupas soltas no cabide/gaveta", room: "quartos", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  // Banheiros
  { id: "task_8", title: "Higienizar a pia e espelho do banheiro", room: "banheiros", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_9", title: "Tirar o lixo do banheiro", room: "banheiros", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_10", title: "Lavar o box e o vaso sanitário", room: "banheiros", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal", notes: "Limpeza profunda semanal" },
  // Lavanderia
  { id: "task_11", title: "Colocar máquina de lavar para rodar", room: "lavanderia", effort: "media", xp: 25, assignedTo: "ambos", frequency: "dias_alternados", notes: "" },
  { id: "task_12", title: "Recolher e dobrar roupas secas", room: "lavanderia", effort: "media", xp: 25, assignedTo: "ambos", frequency: "dias_alternados", notes: "" },
  // Cuidados & Plantas
  { id: "task_13", title: "Regar as plantinhas da casa", room: "cuidados", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "dias_alternados", notes: "" },
  { id: "task_14", title: "Passar pano úmido com cheirinho na casa", room: "cuidados", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal", notes: "" }
];

export const INITIAL_REFORMAS = [
  {
    id: "ref_1",
    title: "Iluminação aconchegante da sala e painel de TV",
    room: "sala",
    priority: "alta",
    status: "ideia",
    estimatedCost: 1500,
    actualCost: 0,
    targetDate: "2027-04-30",
    description: "Instalar fitas de LED quente indireta e prateleira suspensa para decoração e fotos.",
    checklist: [
      { id: "chk_1", title: "Pesquisar modelos de painel ripado", done: true },
      { id: "chk_2", title: "Fita de LED 3000K e perfil de alumínio", done: false },
      { id: "chk_3", title: "Contratar instalação elétrica", done: false }
    ]
  },
  {
    id: "ref_2",
    title: "Organizadores inteligentes dos armários da cozinha",
    room: "cozinha",
    priority: "media",
    status: "orcamento",
    estimatedCost: 650,
    actualCost: 120,
    targetDate: "2026-12-15",
    description: "Prateleiras aramadas, porta-temperos magnético e gaveteiro deslizante.",
    checklist: [
      { id: "chk_4", title: "Medir profundidade dos armários", done: true },
      { id: "chk_5", title: "Comprar porta-temperos", done: true },
      { id: "chk_6", title: "Comprar aramados de canto", done: false }
    ]
  }
];

export const INITIAL_SONHOS = [
  {
    id: "sonho_1",
    title: "Viagem romântica para a Serra Gaúcha / Gramado",
    category: "viagem",
    status: "planejando",
    targetAmount: 5000,
    targetDate: "2027-07-01",
    description: "Fondue, passeios pelas vinícolas, clima de inverno e muito descanso juntos.",
    milestones: [
      { id: "m_1", title: "Definir melhor semana em julho", done: true },
      { id: "m_2", title: "Monitorar passagens aéreas", done: false },
      { id: "m_3", title: "Reservar pousada charmosa", done: false }
    ]
  },
  {
    id: "sonho_2",
    title: "Cantinho do Café & Barzinho Aconchegante",
    category: "casa",
    status: "sonhando",
    targetAmount: 2200,
    targetDate: "2027-02-28",
    description: "Máquina de café espresso especial, xícaras de cerâmica artesanal e taças.",
    milestones: [
      { id: "m_4", title: "Escolher o espaço perfeito na sala", done: false },
      { id: "m_5", title: "Pesquisar cafeteira de moagem de grãos", done: false }
    ]
  }
];
