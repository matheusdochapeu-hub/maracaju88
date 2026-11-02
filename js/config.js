// ============================================================
//  MARACAJU 88 - CONFIGURAÇÃO E DADOS INICIAIS
// ============================================================

export const APP_CONFIG = {
  appName: "Maracaju 88",
  version: "1.1.0",
  storageKey: "MARACAJU88_STATE_v1",
  syncIntervalMs: 60000
};

export const DEFAULT_USERS = {
  user1: { id: "matheus", name: "Matheus", avatarEmoji: "👨‍💻", xp: 0 },
  user2: { id: "esposa", name: "Esposa", avatarEmoji: "👩‍💼", xp: 0 }
};

export const FREQUENCIES = [
  { id: "diaria", label: "Diárias", icon: "☀️", period: "dia" },
  { id: "semanal", label: "Semanais", icon: "📅", period: "semana" },
  { id: "mensal", label: "Mensais", icon: "🗓️", period: "mes" },
  { id: "anual", label: "Anuais", icon: "🎯", period: "ano" }
];

export const ROOMS = [
  { id: "tudo", label: "Todos os Cômodos", icon: "🏠" },
  { id: "cozinha", label: "Cozinha", icon: "🍳" },
  { id: "sala", label: "Sala", icon: "🛋️" },
  { id: "quartos", label: "Quartos", icon: "🛏️" },
  { id: "banheiros", label: "Banheiros", icon: "🚿" },
  { id: "lavanderia", label: "Lavanderia", icon: "🧺" },
  { id: "cuidados", label: "Cuidados & Plantas", icon: "🪴" },
  { id: "garagem", label: "Garagem", icon: "🚗" }
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
  { id: "primeira_tarefa", name: "Primeiro Passo", desc: "Completar a primeira tarefa", icon: "🌟", reqType: "tasks_count", reqValue: 1 },
  { id: "faxina_10", name: "Mão na Massa", desc: "Completar 10 tarefas", icon: "🧹", reqType: "tasks_count", reqValue: 10 },
  { id: "streak_3", name: "Pegando o Ritmo", desc: "3 dias consecutivos de tarefas", icon: "🔥", reqType: "streak", reqValue: 3 },
  { id: "streak_7", name: "Semana Impecável", desc: "7 dias seguidos de casa cuidada", icon: "⚡", reqType: "streak", reqValue: 7 },
  { id: "mestre_cozinha", name: "Chef da Louça", desc: "15 tarefas de cozinha concluídas", icon: "🍳", reqType: "room_cozinha", reqValue: 15 },
  { id: "primeiro_carro", name: "Piloto do Maracaju", desc: "Cadastrar a primeira manutenção do carro", icon: "🚗", reqType: "carro_count", reqValue: 1 },
  { id: "reforma_iniciada", name: "Visão de Futuro", desc: "Cadastrar uma ideia de reforma", icon: "🛠️", reqType: "reformas_count", reqValue: 1 },
  { id: "primeiro_sonho", name: "Sonhadores", desc: "Cadastrar um sonho do casal", icon: "✨", reqType: "sonhos_count", reqValue: 1 },
  { id: "tarefas_100", name: "Casa dos Sonhos", desc: "Completar 100 tarefas no total", icon: "🏆", reqType: "tasks_count", reqValue: 100 }
];

export const CARRO_CATEGORIES = [
  { id: "oleo_revisao", label: "Revisão & Óleo", icon: "🛢️" },
  { id: "mecanica", label: "Mecânica Geral", icon: "🔧" },
  { id: "pneus_freios", label: "Pneus & Freios", icon: "🛞" },
  { id: "estetica", label: "Estética & Lavagem", icon: "✨" },
  { id: "eletrica_acessorios", label: "Elétrica & Acessórios", icon: "🔌" }
];

export const INITIAL_TASKS = [
  // --- TAREFAS DIÁRIAS ---
  { id: "task_1", title: "Lavar e guardar a louça", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria", notes: "Deixar a pia seca e higienizada" },
  { id: "task_2", title: "Limpar o fogão e bancada", room: "cozinha", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_3", title: "Tirar o lixo orgânico da pia", room: "cozinha", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_4", title: "Organizar almofadas e mantas da sala", room: "sala", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_5", title: "Varrer ou aspirar o chão da sala/cozinha", room: "sala", effort: "media", xp: 25, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_6", title: "Arrumar a cama ao levantar", room: "quartos", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_7", title: "Guardar roupas soltas e sapatos", room: "quartos", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_8", title: "Higienizar a pia e espelho do banheiro", room: "banheiros", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },
  { id: "task_9", title: "Tirar o lixo do banheiro", room: "banheiros", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "diaria", notes: "" },

  // --- TAREFAS SEMANAIS ---
  { id: "task_10", title: "Lavar o box, chão e vaso sanitário", room: "banheiros", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal", notes: "Limpeza profunda semanal" },
  { id: "task_11", title: "Trocar roupas de cama e toalhas de banho", room: "quartos", effort: "media", xp: 25, assignedTo: "ambos", frequency: "semanal", notes: "Lençóis, fronhas e toalhas limpas" },
  { id: "task_12", title: "Passar pano úmido com cheirinho na casa inteira", room: "cuidados", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal", notes: "Desinfetante e cera/perfume de ambiente" },
  { id: "task_13", title: "Lavar, estender e dobrar roupas da semana", room: "lavanderia", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "semanal", notes: "Separar roupas claras e escuras" },
  { id: "task_14", title: "Tirar pó de móveis, prateleiras e rodapés", room: "sala", effort: "media", xp: 25, assignedTo: "ambos", frequency: "semanal", notes: "" },
  { id: "task_15", title: "Regar e adubar plantinhas a fundo", room: "cuidados", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "semanal", notes: "Conferir umidade do solo" },
  { id: "task_16", title: "Colocar lixo reciclável para coleta externa", room: "cuidados", effort: "leve", xp: 10, assignedTo: "ambos", frequency: "semanal", notes: "" },

  // --- TAREFAS MENSAIS ---
  { id: "task_17", title: "Limpeza completa da geladeira e descarte de vencidos", room: "cozinha", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "mensal", notes: "Higienizar gavetas e prateleiras com vinagre/álcool" },
  { id: "task_18", title: "Limpar forno, micro-ondas e airfryer por dentro", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "mensal", notes: "Desengordurar resistências e pratos" },
  { id: "task_19", title: "Limpar vidros das janelas e portas de correr", room: "sala", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "mensal", notes: "Pano de microfibra e limpa-vidros" },
  { id: "task_20", title: "Lavar tapetes da casa e panos de chão", room: "lavanderia", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "mensal", notes: "" },
  { id: "task_21", title: "Ciclo de autolimpeza da máquina de lavar roupa", room: "lavanderia", effort: "media", xp: 25, assignedTo: "ambos", frequency: "mensal", notes: "Rodar ciclo quente com água sanitária ou vinagre" },
  { id: "task_22", title: "Organizar armários de mantimentos e temperos", room: "cozinha", effort: "media", xp: 25, assignedTo: "ambos", frequency: "mensal", notes: "" },

  // --- TAREFAS ANUAIS ---
  { id: "task_23", title: "Lavar e higienizar cortinas e persianas", room: "sala", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual", notes: "" },
  { id: "task_24", title: "Higienização profunda do sofá e colchões", room: "sala", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual", notes: "Extratora ou serviço especializado" },
  { id: "task_25", title: "Verificar e lavar calhas, ralos e telhado", room: "cuidados", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual", notes: "Prevenção antes do período de chuvas" },
  { id: "task_26", title: "Higienizar caixa d'água e trocar refil dos filtros", room: "cuidados", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual", notes: "Segurança e qualidade da água da casa" },
  { id: "task_27", title: "Dedetização preventiva da casa", room: "cuidados", effort: "pesada", xp: 50, assignedTo: "ambos", frequency: "anual", notes: "" }
];

export const INITIAL_CARRO = [
  {
    id: "car_1",
    title: "Troca de óleo de motor 5W30 e 4 filtros",
    category: "oleo_revisao",
    status: "andamento",
    priority: "alta",
    estimatedCost: 350,
    actualCost: 320,
    currentKm: 78500,
    targetKm: 80000,
    targetDate: "2026-11-20",
    notes: "Trocar óleo sintético 5W30, filtro de óleo, filtro de combustível, filtro de ar e filtro de cabine (ar-condicionado).",
    photos: [],
    links: [
      { id: "lnk_1", title: "Kit Óleo 5W30 no Mercado Livre", url: "https://www.mercadolivre.com.br" },
      { id: "lnk_2", title: "Vídeo tutorial de troca de filtro", url: "https://youtube.com" }
    ],
    checklist: [
      { id: "chk_c1", title: "Comprar kit de óleo e filtros", done: true },
      { id: "chk_c2", title: "Agendar troca na oficina parceira", done: false },
      { id: "chk_c3", title: "Verificar nível de arrefecimento", done: false }
    ],
    createdAt: "2026-11-01T20:00:00.000Z"
  },
  {
    id: "car_2",
    title: "Alinhamento, balanceamento e rodízio de pneus",
    category: "pneus_freios",
    status: "orcamento",
    priority: "media",
    estimatedCost: 160,
    actualCost: 0,
    currentKm: 78500,
    targetKm: 80000,
    targetDate: "2026-12-10",
    notes: "Sentindo leve puxada para a direita na rodovia. Aproveitar para checar espessura das pastilhas.",
    photos: [],
    links: [],
    checklist: [
      { id: "chk_c4", title: "Cotar valores no autocenter", done: false },
      { id: "chk_c5", title: "Calibrar estepe", done: false }
    ],
    createdAt: "2026-11-01T20:00:00.000Z"
  },
  {
    id: "car_3",
    title: "Lavagem detalhada + vitrificação de pintura",
    category: "estetica",
    status: "pendente",
    priority: "baixa",
    estimatedCost: 280,
    actualCost: 0,
    currentKm: 78500,
    targetKm: 0,
    targetDate: "2027-01-15",
    notes: "Descontaminação da pintura, remoção de micro-riscos e aplicação de cera de carnaúba ou vitrificador.",
    photos: [],
    links: [],
    checklist: [
      { id: "chk_c6", title: "Comprar shampoo neutro e luva de microfibra", done: false }
    ],
    createdAt: "2026-11-01T20:00:00.000Z"
  }
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
