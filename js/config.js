// ============================================================
//  MARACAJU - CONFIGURAÇÃO E DADOS INICIAIS
// ============================================================

export const APP_CONFIG = {
  appName: "Maracaju",
  version: "2.2.3",
  storageKey: "MARACAJU_STATE_v1",
  legacyStorageKeys: ["MARACAJU88_STATE_v1"],
  deviceStorageKey: "MARACAJU_DEVICE_v1",
  autoLockMinutes: 5
};

export const AUTHORIZED_USERS_LIST = [
  {
    id: "matheus",
    name: "Matheus",
    email: "matheusdochapeu@gmail.com",
    aliases: ["matheusdochpaeu@gmail.com"],
    avatarEmoji: "👨‍💻"
  },
  {
    id: "scarlet",
    name: "Scarlet",
    email: "scarletsantos7@gmail.com",
    aliases: [],
    avatarEmoji: "👩‍💼"
  }
];

export const DEFAULT_USERS = {
  user1: { id: "matheus", name: "Matheus", email: "matheusdochapeu@gmail.com", avatarEmoji: "👨‍💻" },
  user2: { id: "scarlet", name: "Scarlet", email: "scarletsantos7@gmail.com", avatarEmoji: "👩‍💼" }
};

export const FREQUENCIES = [
  { id: "diaria", label: "Diárias", single: "Diária", icon: "☀️", period: "hoje" },
  { id: "semanal", label: "Semanais", single: "Semanal", icon: "📅", period: "esta semana" },
  { id: "mensal", label: "Mensais", single: "Mensal", icon: "🗓️", period: "este mês" },
  { id: "anual", label: "Anuais", single: "Anual", icon: "🎯", period: "este ano" }
];

// Cômodos padrão oficiais da casa
export const ROOMS = [
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

export const EFFORT_LEVELS = {
  leve: { label: "Leve", icon: "⚡" },
  media: { label: "Média", icon: "⚡⚡" },
  pesada: { label: "Pesada", icon: "⚡⚡⚡" }
};

export const LEVELS = [];

export const BADGES = [];

export const CARRO_CATEGORIES = [
  { id: "oleo_revisao", label: "Revisão & Óleo", icon: "🛢️" },
  { id: "mecanica", label: "Mecânica Geral", icon: "🔧" },
  { id: "pneus_freios", label: "Pneus & Freios", icon: "🛞" },
  { id: "estetica", label: "Estética & Lavagem", icon: "✨" },
  { id: "eletrica", label: "Elétrica & Acessórios", icon: "🔌" },
  { id: "outros", label: "Outros", icon: "📦" }
];

export const ASSIGNEES = [
  { id: "ambos", label: "Casal" },
  { id: "matheus", label: "Matheus" },
  { id: "scarlet", label: "Scarlet" }
];

export const CARRO_STATUSES = [
  { id: "pendente", label: "Pendente", icon: "⏳" },
  { id: "orcamento", label: "Em orçamento", icon: "📐" },
  { id: "andamento", label: "Em andamento", icon: "🛠️" },
  { id: "concluido", label: "Concluído", icon: "✅" }
];

export const REFORMA_STATUSES = [
  { id: "ideia", label: "Ideia", icon: "💡" },
  { id: "orcamento", label: "Em orçamento", icon: "📐" },
  { id: "andamento", label: "Em andamento", icon: "🛠️" },
  { id: "concluido", label: "Concluído", icon: "✅" }
];

export const SONHO_STATUSES = [
  { id: "sonhando", label: "Sonhando", icon: "💭" },
  { id: "planejando", label: "Planejando", icon: "🗺️" },
  { id: "poupando", label: "Poupando", icon: "🐷" },
  { id: "realizado", label: "Realizado", icon: "🎉" }
];

export const PRIORITIES = [
  { id: "baixa", label: "Baixa" },
  { id: "media", label: "Média" },
  { id: "alta", label: "Alta" },
  { id: "urgente", label: "Urgente" }
];

export const INITIAL_TASKS = [
  // --- TAREFAS DIÁRIAS ---
  { id: "task_1", title: "Lavar e guardar a louça", room: "cozinha", assignedTo: "ambos", frequency: "diaria", notes: "Deixar a pia seca e higienizada" },
  { id: "task_2", title: "Limpar o fogão e bancada", room: "cozinha", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_3", title: "Tirar o lixo orgânico da pia", room: "cozinha", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_4", title: "Organizar almofadas e mantas da sala", room: "sala", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_5", title: "Varrer ou aspirar o chão da sala/cozinha", room: "sala", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_6", title: "Arrumar a cama ao levantar", room: "quartos", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_7", title: "Guardar roupas soltas e sapatos", room: "quartos", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_8", title: "Higienizar a pia e espelho do banheiro", room: "banheiros", assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_9", title: "Tirar o lixo do banheiro", room: "banheiros", assignedTo: "ambos", frequency: "diaria", notes: "" },

  // --- TAREFAS SEMANAIS ---
  { id: "task_10", title: "Lavar o box, chão e vaso sanitário", room: "banheiros", assignedTo: "ambos", frequency: "semanal", notes: "Limpeza profunda semanal" },
  { id: "task_11", title: "Trocar roupas de cama e toalhas de banho", room: "quartos", assignedTo: "ambos", frequency: "semanal", notes: "Lençóis, fronhas e toalhas limpas" },
  { id: "task_12", title: "Passar pano úmido na casa inteira", room: "cuidados", assignedTo: "ambos", frequency: "semanal", notes: "" },
  { id: "task_13", title: "Lavar, estender e dobrar roupas da semana", room: "lavanderia", assignedTo: "ambos", frequency: "semanal", notes: "Separar roupas claras e escuras" },
  { id: "task_14", title: "Tirar pó de móveis, prateleiras e rodapés", room: "sala", assignedTo: "ambos", frequency: "semanal", notes: "" },
  { id: "task_15", title: "Regar e adubar as plantas", room: "cuidados", assignedTo: "ambos", frequency: "semanal", notes: "Conferir umidade do solo" },
  { id: "task_16", title: "Colocar lixo reciclável para coleta", room: "cuidados", assignedTo: "ambos", frequency: "semanal", notes: "" },

  // --- TAREFAS MENSAIS ---
  { id: "task_17", title: "Limpeza completa da geladeira", room: "cozinha", assignedTo: "ambos", frequency: "mensal", notes: "Descartar vencidos e higienizar gavetas" },
  { id: "task_18", title: "Limpar forno, micro-ondas e airfryer", room: "cozinha", assignedTo: "ambos", frequency: "mensal", notes: "" },
  { id: "task_19", title: "Limpar vidros das janelas e portas", room: "sala", assignedTo: "ambos", frequency: "mensal", notes: "" },
  { id: "task_20", title: "Lavar tapetes e panos de chão", room: "lavanderia", assignedTo: "ambos", frequency: "mensal", notes: "" },
  { id: "task_21", title: "Autolimpeza da máquina de lavar", room: "lavanderia", assignedTo: "ambos", frequency: "mensal", notes: "Ciclo quente com vinagre" },
  { id: "task_22", title: "Organizar armários de mantimentos", room: "cozinha", assignedTo: "ambos", frequency: "mensal", notes: "" },

  // --- TAREFAS ANUAIS ---
  { id: "task_23", title: "Lavar cortinas e persianas", room: "sala", assignedTo: "ambos", frequency: "anual", notes: "" },
  { id: "task_24", title: "Higienização do sofá e colchões", room: "sala", assignedTo: "ambos", frequency: "anual", notes: "" },
  { id: "task_25", title: "Limpar calhas, ralos e telhado", room: "cuidados", assignedTo: "ambos", frequency: "anual", notes: "Antes do período de chuvas" },
  { id: "task_26", title: "Limpar caixa d'água e trocar filtros", room: "cuidados", assignedTo: "ambos", frequency: "anual", notes: "" },
  { id: "task_27", title: "Dedetização preventiva", room: "cuidados", assignedTo: "ambos", frequency: "anual", notes: "" }
];

export const INITIAL_CARRO = [
  {
    id: "car_1",
    title: "Troca de óleo 5W30 e filtros",
    category: "oleo_revisao",
    status: "andamento",
    priority: "alta",
    estimatedCost: 350,
    actualCost: 320.5,
    targetKm: 80000,
    targetDate: "2026-11-20",
    notes: "Óleo sintético 5W30, filtro de óleo, combustível, ar e cabine.",
    photos: [],
    links: [{ id: "lnk_1", title: "Kit óleo no Mercado Livre", url: "https://www.mercadolivre.com.br" }],
    checklist: [
      { id: "chk_c1", title: "Comprar kit de óleo e filtros", done: true },
      { id: "chk_c2", title: "Agendar troca na oficina", done: false }
    ],
    createdAt: "2026-11-01T20:00:00.000Z"
  }
];

export const INITIAL_REFORMAS = [
  {
    id: "ref_1",
    title: "Iluminação aconchegante da sala",
    room: "sala",
    priority: "alta",
    status: "ideia",
    estimatedCost: 1500,
    actualCost: 0,
    targetDate: "2027-04-30",
    description: "Fita de LED quente indireta e prateleira suspensa.",
    photos: [],
    links: [],
    checklist: [
      { id: "chk_1", title: "Pesquisar modelos de painel ripado", done: true },
      { id: "chk_2", title: "Fita de LED 3000K e perfil", done: false }
    ]
  }
];

export const INITIAL_SONHOS = [
  {
    id: "sonho_1",
    title: "Viagem para a Serra Gaúcha",
    category: "viagem",
    status: "planejando",
    targetAmount: 5000,
    savedAmount: 0,
    targetDate: "2027-07-01",
    description: "Fondue, vinícolas e clima de inverno juntos.",
    milestones: [
      { id: "m_1", title: "Definir a semana em julho", done: true },
      { id: "m_2", title: "Monitorar passagens", done: false }
    ]
  }
];

export const INITIAL_COMPRAS = [];
