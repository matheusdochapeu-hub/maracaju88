// ============================================================
//  MARACAJU 88 — MÓDULO: MEU ESPAÇO (ROTINA MATHEUS — OPÇÃO B)
//  Acesso exclusivo no cabeçalho superior (#btn-header-rotina-matheus)
//  ao lado do botão 👨‍💻 Matheus, sem adicionar 9ª aba na barra inferior.
//  Inclui 100% do app Rotina: Hoje, Capilar, Pele & Estilo,
//  Fotos em Grande Volume (Git Data API) e Ciclos.
// ============================================================

// ============================================================
//  CATÁLOGO INTELIGENTE DE PRODUTOS (26 FOTOS DO GITHUB + OCR)
// ============================================================
export const CATALOGO_PRODUTOS_ROTINA = [
  // --- CABELO (11 produtos fotografados) ---
  {
    key: 'wella_nutri_shampoo',
    nome: 'Wella Professionals Invigo Nutri-Enrich Shampoo (1L · Goji Berry)',
    curto: 'Shampoo Wella Invigo Nutri-Enrich',
    cat: 'cremes-cabelo',
    slot: 'shampoo_nutritivo',
    quando: '💈 Domingo (Cronograma) e Quinta pós-corrida',
    comoUsar: 'Aplicar só no couro cabeludo 1 a 2× na semana, massagear por 2 min e enxaguar.',
    photoIds: ['1795572214673-000-i34d'],
    keywords: ['wella', 'invigo', 'nutri-enrich', 'shampoo', 'champu']
  },
  {
    key: 'wella_nutri_mascara',
    nome: 'Wella Professionals Invigo Nutri-Enrich Máscara de Nutrição Profunda (500ml)',
    curto: 'Máscara Wella Invigo Nutri-Enrich',
    cat: 'cremes-cabelo',
    slot: 'mascara_nutricao',
    quando: '💈 Todo Domingo no banho (10 min)',
    comoUsar: 'Tirar o excesso de água, enluvar mecha a mecha por 10 min enquanto esfolia o corpo e enxaguar 100%.',
    photoIds: ['1795572275880-000-py8h'],
    keywords: ['wella', 'invigo', 'nutri-enrich', 'mascara', 'tratamiento intensivo']
  },
  {
    key: 'wella_nutri_condicionador',
    nome: 'Wella Professionals Invigo Nutri-Enrich Condicionador (1L · Goji Berry)',
    curto: 'Condicionador Wella Invigo Nutri-Enrich',
    cat: 'cremes-cabelo',
    slot: 'condicionador_nutritivo',
    quando: '💈 Domingo após a máscara e lavagens nutritivas',
    comoUsar: 'Aplicar do meio às pontas por 2 min após enxaguar a máscara para selar a cutícula.',
    photoIds: ['1795572199358-000-zl1l'],
    keywords: ['wella', 'invigo', 'nutri-enrich', 'condicionador', 'acondicionador']
  },
  {
    key: 'elseve_glycolic_shampoo',
    nome: "L'Oréal Elseve [Glycolic] Gloss Shampoo Extra Gloss (200ml · 3% Ácido Glicólico)",
    curto: 'Shampoo Elseve [Glycolic] Gloss',
    cat: 'cremes-cabelo',
    slot: 'shampoo_gloss',
    quando: '✨ Semana 3 (Banho de Brilho / Anti-Porosidade)',
    comoUsar: 'Usar na Semana 3 ou quando o fio estiver opaco/poroso para alinhar a cutícula com pH ácido.',
    photoIds: ['1795572225345-000-mhqt'],
    keywords: ['elseve', 'glycolic', 'shampoo extra gloss', 'combate a porosidade']
  },
  {
    key: 'elseve_glycolic_condicionador',
    nome: "L'Oréal Elseve [Glycolic] Gloss Condicionador Sela Gloss (400ml · 4% Ácido Glicólico)",
    curto: 'Condicionador Elseve [Glycolic] Sela Gloss',
    cat: 'cremes-cabelo',
    slot: 'condicionador_gloss',
    quando: '✨ Semana 3 e selagem anti-porosidade',
    comoUsar: 'Deixar agir 2 a 3 min após a máscara ou shampoo Glycolic para laminar a cutícula e dar brilho espelhado.',
    photoIds: ['1795572236743-000-us4h'],
    keywords: ['elseve', 'glycolic', 'condicionador sela gloss', 'lamina a cuticula']
  },
  {
    key: 'elseve_glycolic_creme_uv',
    nome: "L'Oréal Elseve [Glycolic] Gloss Creme Super Gloss com Filtro UV (250ml)",
    curto: 'Creme Super Gloss Elseve (Filtro UV)',
    cat: 'cremes-cabelo',
    slot: 'leavein_uv_corrida',
    quando: '🏃 Pré-corrida no sol (Qui/Sáb/Dom) e Semana 3',
    comoUsar: 'Passar 1 moeda nos fios antes de correr no sol de Ribeirão Preto para blindar contra raios UV e suor.',
    photoIds: ['1795572038284-000-rtbu'],
    keywords: ['elseve', 'glycolic', 'creme super gloss', 'com filtro uv']
  },
  {
    key: 'apice_nutri_waves',
    nome: 'Ápice Nutri Waves Condicionador · Leave-In · Acidificante (Proteína do Arroz · 0% Sulfato)',
    curto: 'Ápice Nutri Waves (Acidificante / Co-Wash / Leave-In)',
    cat: 'cremes-cabelo',
    slot: 'acidificante_leavein_cowash',
    quando: '🏃 Pós-corrida (Co-Wash) e 🧱 Semana 4 (Acidificante + Proteína)',
    comoUsar: 'Curinga 3 em 1: usar como Co-Wash limpante pós-corrida (0% sulfato/silicone) e como Acidificante reconstrutor por 5 min na Semana 4.',
    photoIds: ['1795572245691-000-wa1c'],
    keywords: ['apice', 'nutri waves', 'acidificante', 'proteina do arroz']
  },
  {
    key: 'amend_gold_black_creme',
    nome: 'Amend Gold Black Hidratação Nutritiva Creme para Pentear (250ml · Coco, Karité e D-Pantenol)',
    curto: 'Creme de Pentear Amend Gold Black',
    cat: 'cremes-cabelo',
    slot: 'creme_pentear',
    quando: '🌅 Manhã (revitalização) e pós-banho',
    comoUsar: 'Com o cabelo úmido, aplicar do meio às pontas para definir e nutrir os cachos/crespos sem enxágue.',
    photoIds: ['1795572016292-000-bsou'],
    keywords: ['amend', 'gold black', 'creme para pentear', 'crema para peinar']
  },
  {
    key: 'amend_gold_black_gelatina',
    nome: 'Amend Gold Black Hidratação Nutritiva Gelatina Modeladora de Cachos (500g)',
    curto: 'Gelatina Modeladora Amend Gold Black',
    cat: 'cremes-cabelo',
    slot: 'gelatina_cachos',
    quando: '💈 Finalização pós-banho para definição de 2 a 3 dias',
    comoUsar: 'Misturar na palma da mão com o Creme de Pentear Gold Black para segurar a definição e travar o frizz.',
    photoIds: ['1795572027148-000-qdei'],
    keywords: ['amend', 'gold black', 'gelatina', 'modeladora de cachos']
  },
  {
    key: 'elseve_oleo_extraordinario',
    nome: "L'Oréal Elseve Óleo Extraordinário Tratamento Sublime (100ml)",
    curto: 'Elseve Óleo Extraordinário',
    cat: 'cremes-cabelo',
    slot: 'oleo_capilar',
    quando: '🌅 Manhã (2 gotas no cabelo + 2 na barba) e pós-finalização',
    comoUsar: 'Espalhar 2 a 3 gotas nas mãos e amassar as pontas do cabelo (quebra o durinho da gelatina) e hidratar a barba.',
    photoIds: ['1795572006556-000-a7dz'],
    keywords: ['elseve', 'oleo extraordinario', 'tratamento sublime', 'flores preciosas']
  },
  {
    key: 'charming_cera_matte',
    nome: 'Charming Cless Cera Finalizadora Capilar Efeito Matte Fixação Extraforte (50g)',
    curto: 'Cera Charming Efeito Matte',
    cat: 'cremes-cabelo',
    slot: 'cera_modeladora',
    quando: '💈 Acabamento a seco (laterais do fade / eventos)',
    comoUsar: 'Pegar uma ponta de dedo a seco para alinhar as laterais do taper fade ou fios rebeldes com acabamento fosco.',
    photoIds: ['1795571915034-000-w6p6'],
    keywords: ['charming', 'cera finalizadora', 'efeito matte', 'cless']
  },

  // --- PELE, SKINCARE, CORPO & PERFUMES (15 produtos fotografados) ---
  {
    key: 'creamy_gel_limpeza',
    nome: 'Creamy Skincare Gel de Limpeza Facial (200ml · PCA Zinco + Centella Asiática + Camomila)',
    curto: 'Creamy Gel de Limpeza (PCA Zinco + Centella)',
    cat: 'pele-perfumes',
    slot: 'limpeza_facial',
    quando: '🌅 Manhã (05h50) e 🌙 Noite (banho)',
    comoUsar: '1 pump no rosto e barba úmidos por 30s. Limpa sem sulfato, controla oleosidade e acalma a pele.',
    photoIds: ['1795572255299-000-208i'],
    keywords: ['creamy', 'gel de limpeza', 'pca zinco', 'centella asiatica']
  },
  {
    key: 'creamy_vitamina_c',
    nome: 'Creamy Skincare Sérum Facial 10% Vitamina C (+ Ácido Ferúlico + Vitamina E · 30ml)',
    curto: 'Creamy Sérum 10% Vitamina C + Ferúlico',
    cat: 'pele-perfumes',
    slot: 'vitamina_c_manha',
    quando: '🌅 Manhã (após lavar o rosto e antes do protetor)',
    comoUsar: '3 a 4 gotas no rosto seco pela manhã: antioxidante que multiplica a proteção solar e uniformiza o tom da pele negra.',
    photoIds: ['1795572056900-000-btp7'],
    keywords: ['creamy', 'serum facial', '10% vitamina c', 'acido ferulico']
  },
  {
    key: 'creamy_eye_cream',
    nome: 'Creamy Skincare Eye Cream (15g · Matrixyl + Ácido Kójico Dipalmitato + Cafeisilane C)',
    curto: 'Creamy Eye Cream (Olheiras & Pálpebras)',
    cat: 'pele-perfumes',
    slot: 'area_olhos',
    quando: '🌅 Manhã e 🌙 Noite',
    comoUsar: '1 grão de arroz dando leves batidinhas abaixo dos olhos: Cafeisilane desincha de manhã e Ácido Kójico clareia olheiras.',
    photoIds: ['1795572049290-000-qpod'],
    keywords: ['creamy', 'eye cream', 'matrixyl', 'acido kojico', 'cafeisilane']
  },
  {
    key: 'creamy_calming_cream',
    nome: 'Creamy Skincare Calming Cream (40g · Hypskin + Vitamina E + Alfa-Bisabolol)',
    curto: 'Creamy Calming Cream (Hidratante Leve & Pós-Barba)',
    cat: 'pele-perfumes',
    slot: 'hidratante_facial_manha',
    quando: '🌅 Manhã e pós-barba',
    comoUsar: 'Aplicar após a Vitamina C pela manhã e no pescoço após fazer a barba: acalma irritação e protege contra o ar-condicionado.',
    photoIds: ['1795571978882-000-suwe'],
    keywords: ['creamy', 'calming cream', 'hypskin', 'alfa-bisabolol']
  },
  {
    key: 'creamy_ceramide_repair',
    nome: 'Creamy Skincare Ceramide Skin Repair (40g · Prata Pura Ag+ + Esqualano + Ceramidas + CicaRecover)',
    curto: 'Creamy Ceramide Skin Repair (Reparador Noturno Ag+)',
    cat: 'pele-perfumes',
    slot: 'hidratante_facial_noite',
    quando: '🌙 Noite (último passo facial antes de dormir)',
    comoUsar: 'Aplicar à noite no rosto e contorno da barba: as Ceramidas regeneram a barreira e a Prata Pura (Ag+) previne foliculite/pelo encravado.',
    photoIds: ['1795571973296-000-6ccw'],
    keywords: ['creamy', 'ceramide skin repair', 'prata pura', 'cicarecover', 'esqualano']
  },
  {
    key: 'creamy_watery_lotion_fps60',
    nome: 'Creamy Skincare Watery Lotion Protetor Solar FPS 60 UVA+UVB (50ml · Resistente ao Suor)',
    curto: 'Creamy Watery Lotion FPS 60 (Toque Aquoso Invisível)',
    cat: 'pele-perfumes',
    slot: 'protetor_solar_dia',
    quando: '🌅 Manhã — dias de trabalho e rotina urbana',
    comoUsar: 'Aplicar 3 dedos no rosto, pálpebras e pescoço. Textura aquosa invisível na pele negra e não arde os olhos.',
    photoIds: ['1795571986790-000-atc3'],
    keywords: ['creamy', 'watery lotion', 'locao aquosa', 'protetor solar', '60']
  },
  {
    key: 'natura_fotoequilibrio_fps60',
    nome: 'Natura Fotoequilíbrio Facial Gel Creme Protetor Solar FPS 60 / FPUVA 20 (50g)',
    curto: 'Natura Fotoequilíbrio Facial FPS 60',
    cat: 'pele-perfumes',
    slot: 'protetor_solar_corrida',
    quando: '🏃 Dias de corrida ao ar livre (Qui/Sáb/Dom) e pescoço/orelhas',
    comoUsar: 'Usar nos treinos de corrida e sol forte (resistente à água e ao suor), poupando o Creamy Watery Lotion para o trabalho.',
    photoIds: ['1795572071725-000-h08p'],
    keywords: ['natura', 'fotoequilibrio', 'gel creme', 'fpuva 20']
  },
  {
    key: 'nivea_milk_400ml',
    nome: 'Nivea Loção Deo-Hidratante Milk 72h (400ml · Ácido Hialurônico Puro + Óleo de Amêndoas)',
    curto: 'Nivea Loção Milk 72h (400ml)',
    cat: 'pele-perfumes',
    slot: 'hidratante_corporal',
    quando: '🌙 Noite (nos 2 min pós-banho com a pele úmida)',
    comoUsar: 'Passar no corpo todo (braços, pernas, cotovelos e tronco) logo ao sair do chuveiro. Zera o aspecto acinzentado e fixa o perfume.',
    photoIds: ['1795571949506-000-eoxp'],
    keywords: ['nivea', 'locao deo-hidratante', 'milk', 'acido hialuronico puro', '400ml']
  },
  {
    key: 'nivea_creme_lata',
    nome: 'Nivea Creme Lata Azul (56g · Hidratação Oclusiva Intensiva)',
    curto: 'Nivea Creme Lata Azul (56g)',
    cat: 'pele-perfumes',
    slot: 'hidratante_oclusivo_pes',
    quando: '🦶 Terça e Sábado à noite nos pés + mãos no trabalho',
    comoUsar: 'Camada generosa nos calcanhares/pés antes de dormir (Ter/Sáb) contra calos da corrida, e nos cotovelos/mãos ressecados.',
    photoIds: ['1795571926049-000-srls'],
    keywords: ['nivea creme', '56g', 'lata']
  },
  {
    key: 'natura_seve_amendoas',
    nome: 'Natura Sève Óleo Corporal Amêndoas Doces Intensa com Enxágue (200ml)',
    curto: 'Óleo Corporal Natura Sève Amêndoas Doces',
    cat: 'pele-perfumes',
    slot: 'oleo_banho',
    quando: '🌙 Banho noturno (dias rápidos ou saída com a Scarlet)',
    comoUsar: 'Aplicar no corpo molhado no fim do banho e enxaguar levemente: deixa a pele acetinada e perfumada em 30 segundos.',
    photoIds: ['1795572081685-000-26nw'],
    keywords: ['natura', 'seve', 'amendoas doces', 'oleo corporal']
  },
  {
    key: 'corpo_dourado_esfoliante_maracuja',
    nome: 'Corpo Dourado Esfoliante Corporal Maracujá com Argila Branca e Camomila (300g)',
    curto: 'Esfoliante Corpo Dourado Maracujá (Argila Branca + Camomila)',
    cat: 'pele-perfumes',
    slot: 'esfoliante_corporal',
    quando: '💈 Todo Domingo no banho (enquanto a máscara capilar age)',
    comoUsar: 'Massagear corpo, pescoço e região da barba no banho de Domingo (e 48h antes da depilação) para renovar a pele e desencravar pelos.',
    photoIds: ['1795572264351-000-q249'],
    keywords: ['corpo dourado', 'esfoliante', 'maracuja', 'argila branca']
  },
  {
    key: 'oleo_coco_virgem_pote',
    nome: 'Óleo de Coco Virgem 100% Vegetal (Pote de Vidro)',
    curto: 'Óleo de Coco Virgem Puro',
    cat: 'pele-perfumes',
    slot: 'umectacao_oleo_vegetal',
    quando: '🥑 Semana 2 — Umectação Capilar 30 min pré-banho',
    comoUsar: 'Aquecer 1 colher de chá nas mãos, aplicar nos fios secos 30 min antes do banho de Domingo (Sem 2) e remover com Co-Wash Ápice Nutri Waves.',
    photoIds: ['1795571905429-000-r8xz'],
    keywords: ['oleo de coco', 'coco virgem']
  },
  {
    key: 'natura_erva_doce_rollon',
    nome: 'Natura Erva Doce Desodorante Antitranspirante Roll-On 72h Secagem Rápida (70ml)',
    curto: 'Natura Erva Doce Roll-On 72h',
    cat: 'pele-perfumes',
    slot: 'antitranspirante',
    quando: '🌙 Noite (axila seca pós-banho) e 🌅 Manhã',
    comoUsar: 'Aplicar à noite antes de dormir (atua nas glândulas em repouso dobrando a proteção) e reaplicar de manhã.',
    photoIds: ['1795571897035-000-vadf'],
    keywords: ['natura', 'erva doce', '72h', '70ml', 'desodorante antitranspirante']
  },
  {
    key: 'boticario_uomini_infinite',
    nome: 'O Boticário Uomini Infinite Desodorante Colônia',
    curto: 'O Boticário Uomini Infinite',
    cat: 'pele-perfumes',
    slot: 'perfume_dia',
    quando: '🌅 Manhã (trabalho/dia) e 🍷 Saídas',
    comoUsar: '5 a 6 borrifadas sobre a pele hidratada (2× pescoço/orelhas, 1× nuca, 1× peito, 1× dobras do cotovelo sem esfregar).',
    photoIds: ['1795571882555-000-uvfr'],
    keywords: ['uomini', 'infinite', 'boticario']
  },
  {
    key: 'nativa_spa_ameixa_splash',
    nome: 'O Boticário Nativa SPA Ameixa Body Splash Desodorante Colônia (200ml)',
    curto: 'Body Splash Nativa SPA Ameixa',
    cat: 'pele-perfumes',
    slot: 'body_splash_noite',
    quando: '🌙 Pós-banho noturno / ficar cheiroso em casa e ao dormir',
    comoUsar: 'Borrifar no peito, braços e nuca após o hidratante Nivea Milk à noite para dormir cheiroso com a Scarlet.',
    photoIds: ['1795572094095-000-6m7d'],
    keywords: ['nativa spa', 'ameixa', 'body splash']
  }
];

function normTxt(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Identifica um produto do catálogo a partir do ID da foto no GitHub, caminho, ou texto lido via OCR.
 * Caso o OCR traga um produto novo fora do catálogo base, extrai o nome e classifica automaticamente pela categoria/palavras-chave.
 */
export function identificarProdutoPorTextoOuId({ id = '', path = '', cat = '', ocrText = '' } = {}) {
  const cleanId = String(id || path || '').replace(/^.*\//, '').replace(/\.[^.]+$/, '');
  // 1. Match instantâneo por photoId conhecido do repositório
  for (const prod of CATALOGO_PRODUTOS_ROTINA) {
    if (prod.photoIds && prod.photoIds.some(pid => cleanId.includes(pid) || pid.includes(cleanId))) {
      return { ...prod, matchedBy: 'photoId', photoId: cleanId };
    }
  }

  // 2. Match por palavras-chave no texto OCR ou nome do arquivo
  const blobTxt = normTxt(ocrText + ' ' + cleanId + ' ' + path);
  if (blobTxt.trim()) {
    let best = null;
    let bestScore = 0;
    let bestMatches = 0;
    for (const prod of CATALOGO_PRODUTOS_ROTINA) {
      let score = 0;
      let matches = 0;
      for (const kw of (prod.keywords || [])) {
        if (blobTxt.includes(normTxt(kw))) {
          score += kw.length >= 6 ? 2 : 1;
          matches++;
        }
      }
      if (matches >= 2 && score > bestScore) {
        bestScore = score;
        bestMatches = matches;
        best = prod;
      }
    }
    if (best && bestMatches >= 2 && bestScore >= 3) {
      return { ...best, matchedBy: 'ocr', photoId: cleanId };
    }
  }

  // 3. Produto novo detectado por OCR (heurística automática para futuros uploads)
  const rawLines = String(ocrText || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length >= 3 && /[a-zA-ZÀ-ÿ]{3,}/.test(l));
  if (rawLines.length > 0) {
    const label = rawLines.slice(0, 3).join(' · ').slice(0, 90);
    const t = normTxt(rawLines.join(' '));
    let slot = cat === 'cremes-cabelo' ? 'creme_pentear' : 'hidratante_facial_manha';
    let quando = cat === 'cremes-cabelo' ? '💈 Rotina Capilar' : '🧴 Rotina de Skincare';
    let comoUsar = 'Produto identificado via leitura automática do rótulo.';
    if (/shampoo|champu/.test(t)) { slot = 'shampoo_nutritivo'; quando = '💈 Lavagem Capilar (1-2×/sem)'; comoUsar = 'Aplicar no couro cabeludo molhado, massagear e enxaguar.'; }
    else if (/mascara|tratamento|nutricao|hidratacao|reconstrucao/.test(t) && cat === 'cremes-cabelo') { slot = 'mascara_nutricao'; quando = '💈 Domingo (Cronograma 10 min)'; comoUsar = 'Enluvar mecha a mecha por 10 min após o shampoo e enxaguar.'; }
    else if (/acidificante|co-wash|cowash/.test(t)) { slot = 'acidificante_leavein_cowash'; quando = '🏃 Pós-corrida / Semana 4'; comoUsar = 'Usar para selar cutículas ou lavar suavemente pós-corrida.'; }
    else if (/condicionador|acondicionador/.test(t)) { slot = 'condicionador_nutritivo'; quando = '💈 Pós-máscara (2 min)'; comoUsar = 'Selar pontas por 2 min e enxaguar.'; }
    else if (/gelatina|cera|pomada|matte/.test(t)) { slot = 'gelatina_cachos'; quando = '💈 Finalização e definição'; comoUsar = 'Modelar os fios para segurar a definição.'; }
    else if (/protetor|fps|spf|solar|uva|uvb/.test(t)) { slot = 'protetor_solar_dia'; quando = '🌅 Manhã (3 dedos rosto e pescoço)'; comoUsar = 'Aplicar toda manhã como último passo facial.'; }
    else if (/limpeza|sabonete|cleanser|gel/.test(t) && cat !== 'cremes-cabelo') { slot = 'limpeza_facial'; quando = '🌅 Manhã e 🌙 Noite'; comoUsar = 'Lavar o rosto suavemente por 30s.'; }
    else if (/serum|vitamina c|niacinamida|acido/.test(t)) { slot = 'vitamina_c_manha'; quando = '🌅 Manhã / 🌙 Noite (Sérum)'; comoUsar = 'Aplicar 3-4 gotas na pele limpa e seca antes do hidratante.'; }
    else if (/olhos|eye/.test(t)) { slot = 'area_olhos'; quando = '🌅 Manhã e 🌙 Noite'; comoUsar = 'Dar leves batidinhas na região das olheiras.'; }
    else if (/esfoliante/.test(t)) { slot = 'esfoliante_corporal'; quando = '💈 Domingo no banho'; comoUsar = 'Massagear pele úmida para renovar e desencravar pelos.'; }
    else if (/desodorante|antitranspirante|roll-on/.test(t)) { slot = 'antitranspirante'; quando = '🌙 Noite e 🌅 Manhã'; comoUsar = 'Aplicar nas axilas secas.'; }
    else if (/colonia|perfume|parfum|toilette|splash/.test(t)) { slot = 'perfume_dia'; quando = '🌅 Manhã / Pós-banho'; comoUsar = 'Aplicar nos pontos de pulsação sobre a pele hidratada.'; }

    return {
      key: 'custom_' + (cleanId || Date.now()),
      nome: label,
      curto: label,
      cat: cat || 'pele-perfumes',
      slot,
      quando,
      comoUsar,
      photoIds: cleanId ? [cleanId] : [],
      matchedBy: 'ocr_custom',
      photoId: cleanId
    };
  }

  return null;
}

/**
 * Analisa uma lista de fotos (do GitHub ou do IndexedDB) e retorna a lista deduplicada de produtos identificados.
 */
export function analisarListaFotosArsenal(fotos = [], savedOcrMap = {}) {
  const byKey = new Map();
  (Array.isArray(fotos) ? fotos : []).forEach(f => {
    if (!f) return;
    const id = f.id || (f.path ? f.path.split('/').pop().replace(/\.[^.]+$/, '') : '');
    const ocrText = f.ocrText || savedOcrMap[id] || '';
    const detected = identificarProdutoPorTextoOuId({ id, path: f.path || '', cat: f.cat || '', ocrText });
    if (detected && !byKey.has(detected.key)) {
      byKey.set(detected.key, detected);
    }
  });
  return Array.from(byKey.values());
}

/**
 * Gera um diagnóstico estruturado de rotina (Manhã, Corrida, Noite e Cronograma Capilar) a partir dos produtos detectados.
 */
export function gerarPlanoRotinaDoArsenal(produtos = []) {
  const list = Array.isArray(produtos) && produtos.length ? produtos : CATALOGO_PRODUTOS_ROTINA;
  const pick = (slot, fallback) => {
    const found = list.filter(p => p.slot === slot);
    return found.length ? found.map(p => p.curto).join(' ou ') : fallback;
  };
  return {
    totalProdutos: list.length,
    totalCabelo: list.filter(p => p.cat === 'cremes-cabelo').length,
    totalPele: list.filter(p => p.cat === 'pele-perfumes').length,
    manhaRosto: [
      `1. Limpeza: ${pick('limpeza_facial', 'Creamy Gel de Limpeza (PCA Zinco + Centella)')}`,
      `2. Antioxidante: ${pick('vitamina_c_manha', 'Creamy Sérum 10% Vitamina C + Ácido Ferúlico')}`,
      `3. Área dos Olhos: ${pick('area_olhos', 'Creamy Eye Cream (Cafeisilane + Ácido Kójico)')}`,
      `4. Hidratação Leve / Pós-Barba: ${pick('hidratante_facial_manha', 'Creamy Calming Cream')}`,
      `5. Fotoproteção: ${pick('protetor_solar_dia', 'Creamy Watery Lotion FPS 60')}`
    ],
    manhaCabeloPresenca: [
      `Cabelo & Barba: Água + ${pick('creme_pentear', 'Creme Amend Gold Black')} + 2 gotas de ${pick('oleo_capilar', 'Elseve Óleo Extraordinário')} (e ${pick('cera_modeladora', 'Cera Charming Matte')} a seco nas laterais se precisar)`,
      `Axilas & Perfume: ${pick('antitranspirante', 'Natura Erva Doce Roll-On 72h')} + 5 borrifadas de ${pick('perfume_dia', 'O Boticário Uomini Infinite')}`
    ],
    diasCorrida: [
      `Antes de sair pro sol (Qui/Sáb/Dom): ${pick('protetor_solar_corrida', 'Natura Fotoequilíbrio Facial FPS 60')} no rosto + ${pick('leavein_uv_corrida', 'Creme Super Gloss Elseve [Glycolic] com Filtro UV')} nos fios`,
      `Banho pós-corrida (Co-Wash sem ressecar): ${pick('acidificante_leavein_cowash', 'Ápice Nutri Waves (0% sulfato/silicones)')} + finalização com ${pick('creme_pentear', 'Amend Gold Black')}`
    ],
    noiteRecuperacao: [
      `Banho & Corpo (2 min pós-banho): ${pick('hidratante_corporal', 'Nivea Loção Milk 72h (400ml)')} ou ${pick('oleo_banho', 'Óleo Natura Sève Amêndoas Doces')} + ${pick('body_splash_noite', 'Body Splash Nativa SPA Ameixa')}`,
      `Pés & Cotovelos (Terça e Sábado): ${pick('hidratante_oclusivo_pes', 'Nivea Creme Lata Azul (56g)')} + ${pick('antitranspirante', 'Natura Erva Doce Roll-On 72h')} noturno`,
      `Rosto Noturno: ${pick('limpeza_facial', 'Creamy Gel de Limpeza')} → ${pick('area_olhos', 'Creamy Eye Cream')} → ${pick('hidratante_facial_noite', 'Creamy Ceramide Skin Repair (Prata Ag+ + Ceramidas)')}`
    ],
    cronogramaDomingo: [
      `Sem 1 (Hidratação Nutritiva): ${pick('shampoo_nutritivo', 'Shampoo Wella Nutri-Enrich')} → ${pick('mascara_nutricao', 'Máscara Wella Nutri-Enrich')} 10 min (enquanto passa o ${pick('esfoliante_corporal', 'Esfoliante Corpo Dourado Maracujá')} no corpo/barba) → ${pick('condicionador_nutritivo', 'Condicionador Wella Nutri-Enrich')}`,
      `Sem 2 (Umectação + Nutrição): Pré-banho 30 min com ${pick('umectacao_oleo_vegetal', 'Óleo de Coco Virgem')} → remover com ${pick('acidificante_leavein_cowash', 'Ápice Nutri Waves')} → ${pick('mascara_nutricao', 'Máscara Wella Nutri-Enrich')} + 3 gotas de ${pick('oleo_capilar', 'Elseve Óleo Extraordinário')}`,
      `Sem 3 (Banho de Gloss Anti-Porosidade): ${pick('shampoo_gloss', 'Shampoo Elseve [Glycolic] Gloss')} → ${pick('mascara_nutricao', 'Máscara Wella Nutri-Enrich')} 5 min → ${pick('condicionador_gloss', 'Condicionador Elseve Sela Gloss')} → ${pick('leavein_uv_corrida', 'Creme Super Gloss Elseve')}`,
      `Sem 4 (Acidificação & Proteína do Arroz): ${pick('shampoo_nutritivo', 'Shampoo Wella Nutri-Enrich')} → ${pick('acidificante_leavein_cowash', 'Ápice Nutri Waves (Acidificante + Proteína do Arroz)')} 5 min → ${pick('mascara_nutricao', 'Máscara Wella Nutri-Enrich')} 10 min → ${pick('creme_pentear', 'Amend Gold Black Creme')} + ${pick('gelatina_cachos', 'Gelatina Gold Black')}`
    ]
  };
}


// ============================================================
//  MOTOR AUTOMÁTICO DE GUARDA-ROUPA & MONTADOR DE LOOKS
// ============================================================
export const CATEGORIAS_GUARDA_ROUPA = ['roupa-trabalho', 'roupa-casual', 'calcados', 'acessorios', 'eu-vestido'];

export const LOOKS_BASE_SUGERIDOS = [
  {
    id: 'look_trabalho_usp',
    titulo: '🏢 Look 1 · Trabalho / USP (Elegante & Fresco para Ribeirão Preto)',
    pecas: 'Camisa de botão manga longa dobrada no antebraço (azul-marinho, branca, verde-oliva ou linho areia) OU Polo estruturada + Calça Chino ou Jeans Escuro reto sem sobra na barra + Tênis casual limpo (branco/couro) ou Sapato casual + Relógio.',
    grooming: 'Cabelo finalizado com Amend Gold Black + 2 gotas de Elseve Óleo Extraordinário (laterais alinhadas com Cera Charming Matte) · Rosto protegido com Creamy Watery Lotion FPS 60 · 5 a 6 borrifadas de O Boticário Uomini Infinite pela manhã.'
  },
  {
    id: 'look_encontro_scarlet',
    titulo: '🍷 Look 2 · Encontro / Jantar com a Scarlet (Presença & Contraste)',
    pecas: 'Camiseta encorpada lisa (preta, vinho/bordô, verde-musgo ou off-white de algodão pesado) ou Camisa preta/marinho aberta sobre camiseta + Calça escura bem cortada + Calçado impecável + Relógio/Corrente discreta.',
    grooming: 'Banho pré-saída com Óleo Natura Sève Amêndoas Doces + Nivea Loção Milk 72h no pescoço/braços (segura o perfume pelo dobro do tempo) + 6 borrifadas de O Boticário Uomini Infinite · Cabelo com brilho espelhado da linha Elseve [Glycolic] Gloss.'
  },
  {
    id: 'look_casual_fds',
    titulo: '☀️ Look 3 · Casual / Fim de Semana & Passeio',
    pecas: 'Camiseta lisa de ótimo caimento no ombro (off-white, terracota, verde-oliva, preta ou cinza-chumbo) + Bermuda de sarja/linho 1 a 2 dedos acima do joelho + Tênis limpo + Óculos de sol.',
    grooming: 'Rosto com Creamy Vitamina C + Creamy Watery Lotion FPS 60 · Cabelo com volume solto no topo e protegido do sol com Creme Super Gloss Elseve (Filtro UV) · Natura Erva Doce Roll-On 72h + Uomini Infinite.'
  },
  {
    id: 'look_corrida_treino',
    titulo: '🏃 Look 4 · Corrida (Qui 5km · Sáb 5km · Dom 10km) & Pós-Banho em Casa',
    pecas: 'Camiseta dry-fit/poliamida leve + Shorts de corrida acima do joelho + Meia de poliamida (anti-bolha) + Tênis de corrida · Pós-banho em casa: roupa confortável limpa.',
    grooming: 'Pré-corrida: Natura Fotoequilíbrio Facial FPS 60 (resistente ao suor) + Elseve Creme Super Gloss UV no cabelo · Pós-corrida: Co-Wash com Ápice Nutri Waves + Nivea Milk 72h + Body Splash Nativa SPA Ameixa.'
  }
];

/**
 * Classifica o tom/cor dominante a partir de valores médios RGB (0-255).
 */
export function classificarCorRgb(r = 128, g = 128, b = 128) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r * 0.299 + g * 0.587 + b * 0.114);
  const sat = max === 0 ? 0 : (max - min) / max;

  if (lum < 52) return { id: 'preto', nome: 'Preto / Grafite', hex: '#222222' };
  if (lum > 205 && sat < 0.18) return { id: 'branco', nome: 'Branco / Off-White', hex: '#f3f3ee' };
  if (sat < 0.16) return { id: 'cinza', nome: 'Cinza / Chumbo', hex: '#7a7f85' };
  if (b > r + 20 && b > g + 10) return { id: 'marinho', nome: 'Azul-Marinho / Jeans', hex: '#1e3a5f' };
  if (g >= r && g > b + 12) return { id: 'oliva', nome: 'Verde-Oliva / Musgo', hex: '#3d5a3c' };
  if (r > g + 35 && g < 90 && b < 90) return { id: 'vinho', nome: 'Vinho / Terracota', hex: '#6e262b' };
  if (r > b + 25 && g > b + 15 && lum > 150) return { id: 'bege', nome: 'Bege / Areia / Caqui', hex: '#cbb799' };
  if (r > b + 20 && g >= b) return { id: 'terroso', nome: 'Marrom / Caramelo', hex: '#6e4b32' };
  return { id: 'neutro', nome: 'Tom Neutro', hex: '#666666' };
}

/**
 * Extrai a cor dominante do centro de uma imagem/blob no navegador (recorta 50% centrais para ignorar fundo).
 */
async function extrairCorDominanteBlob(blob) {
  try {
    if (typeof document === 'undefined') return null;
    const img = await carregarImgElemento(blob);
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');
    const sx = Math.round((img.naturalWidth || img.width) * 0.25);
    const sy = Math.round((img.naturalHeight || img.height) * 0.25);
    const sw = Math.max(1, Math.round((img.naturalWidth || img.width) * 0.5));
    const sh = Math.max(1, Math.round((img.naturalHeight || img.height) * 0.5));
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 32, 32);
    const data = ctx.getImageData(0, 0, 32, 32).data;
    let r = 0, g = 0, b = 0, cnt = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]; cnt++;
    }
    return classificarCorRgb(Math.round(r / cnt), Math.round(g / cnt), Math.round(b / cnt));
  } catch (e) {
    return null;
  }
}

/**
 * Monta combinações automáticas de looks cruzando as fotos de roupas, calçados e acessórios enviadas com os produtos de higiene/perfumaria.
 */
export function gerarLooksDoGuardaRoupa(fotosList = []) {
  const pecas = (Array.isArray(fotosList) ? fotosList : []).filter(f => f && CATEGORIAS_GUARDA_ROUPA.includes(f.cat));
  const porCat = {
    'roupa-trabalho': pecas.filter(p => p.cat === 'roupa-trabalho'),
    'roupa-casual': pecas.filter(p => p.cat === 'roupa-casual'),
    'calcados': pecas.filter(p => p.cat === 'calcados'),
    'acessorios': pecas.filter(p => p.cat === 'acessorios'),
    'eu-vestido': pecas.filter(p => p.cat === 'eu-vestido')
  };

  const fmtPeca = (p, idx, prefix) => {
    const cor = (p.corNome || (p.cor && p.cor.nome) || '').trim();
    const lbl = (p.productLabel || p.ocrText || '').trim().slice(0, 40);
    return `${prefix} #${idx + 1}${cor ? ' (' + cor + ')' : ''}${lbl ? ' — ' + lbl : ''}`;
  };

  const looksMontados = [];
  if (porCat['roupa-trabalho'].length || porCat['calcados'].length) {
    porCat['roupa-trabalho'].slice(0, 4).forEach((top, i) => {
      const calc = porCat['calcados'][i % Math.max(1, porCat['calcados'].length)];
      const aces = porCat['acessorios'][i % Math.max(1, porCat['acessorios'].length)];
      looksMontados.push({
        titulo: `🏢 Look Trabalho Fotografado #${i + 1}`,
        combinacao: [
          fmtPeca(top, i, 'Peça Trabalho'),
          calc ? fmtPeca(calc, i % porCat['calcados'].length, 'Calçado') : 'Calçado casual limpo',
          aces ? fmtPeca(aces, i % porCat['acessorios'].length, 'Acessório') : 'Relógio / acessório discreto'
        ].join(' + '),
        acabamento: 'Creamy Watery Lotion FPS 60 + Cabelo alinhado com Amend Gold Black & Cera Charming Matte + 5 borrifadas de Uomini Infinite'
      });
    });
  }
  if (porCat['roupa-casual'].length) {
    porCat['roupa-casual'].slice(0, 4).forEach((cas, i) => {
      const calc = porCat['calcados'][(i + 1) % Math.max(1, porCat['calcados'].length)];
      const aces = porCat['acessorios'][(i + 1) % Math.max(1, porCat['acessorios'].length)];
      looksMontados.push({
        titulo: `☀️ Look Casual / Encontro Fotografado #${i + 1}`,
        combinacao: [
          fmtPeca(cas, i, 'Peça Casual'),
          calc ? fmtPeca(calc, (i + 1) % porCat['calcados'].length, 'Calçado') : 'Tênis casual limpo',
          aces ? fmtPeca(aces, (i + 1) % porCat['acessorios'].length, 'Acessório') : 'Acessório do dia'
        ].join(' + '),
        acabamento: 'Pele hidratada com Nivea Milk 72h + Cabelo com Elseve [Glycolic] Gloss & Óleo Extraordinário + Uomini Infinite (ou Nativa SPA Ameixa à noite)'
      });
    });
  }

  return {
    totalFotosGuardaRoupa: pecas.length,
    contagem: {
      trabalho: porCat['roupa-trabalho'].length,
      casual: porCat['roupa-casual'].length,
      calcados: porCat['calcados'].length,
      acessorios: porCat['acessorios'].length,
      euVestido: porCat['eu-vestido'].length
    },
    looksFotografados: looksMontados,
    looksBase: LOOKS_BASE_SUGERIDOS
  };
}

export const ROTINA_BLOCOS_HOJE = {
  m1: [
    { id: 'agua', t: 'Beber 1 copo cheio de água', d: 'Logo ao levantar da cama para despertar o corpo', surv: true },
    { id: 'escova_m', t: 'Escovar os dentes', d: 'Higiene matinal base por 2 minutos', surv: true },
    { id: 'raspador', t: 'Passar o raspador de língua', d: 'Remove 80% da saburra em 10 segundos e garante hálito limpo', surv: true }
  ],
  m2: [
    { id: 'gel_m', t: 'Lavar o rosto com Creamy Gel de Limpeza Facial', d: 'Frasco verde-água (PCA Zinco + Centella Asiática + Camomila) — limpa sem sulfato e acalma a barba' },
    { id: 'vitc_m', t: 'Aplicar Creamy Sérum 10% Vitamina C + Ácido Ferúlico', d: 'Frasco laranja · 3 a 4 gotas no rosto seco: antioxidante que multiplica a proteção solar e uniformiza o tom' },
    { id: 'olhos_m', t: 'Aplicar Creamy Eye Cream na área dos olhos', d: 'Frasco cinza · 1 grão de arroz nas olheiras: Cafeisilane C desincha às 05h50 e Ácido Kójico clareia' },
    { id: 'hid_m', t: 'Aplicar Creamy Calming Cream (Hidratante Leve)', d: 'Bisnaga coral (Hypskin + Vitamina E + Alfa-bisabolol) — acalma pós-barba e blinda contra o ar-condicionado' },
    { id: 'prot_m', t: 'Passar Protetor Solar FPS 60 (Creamy Watery Lotion ou Natura Fotoequilíbrio)', d: '3 dedos no rosto e pescoço — Creamy Watery Lotion FPS 60 no escritório ou Natura Fotoequilíbrio FPS 60 nos dias de corrida', surv: true }
  ],
  m3: [
    { id: 'cab_m', t: 'Revitalizar o cabelo com Amend Gold Black + Elseve Óleo Extraordinário', d: 'Borrifar água + Creme para Pentear Amend Gold Black + 2 gotas do Óleo Extraordinário Elseve (e Cera Charming Matte a seco nas laterais se precisar)' },
    { id: 'barba_m', t: 'Alinhar e hidratar a barba', d: '2 gotas do Elseve Óleo Extraordinário nos fios da barba + Creamy Calming Cream no pescoço' },
    { id: 'desod_m', t: 'Aplicar Natura Erva Doce Roll-On 72h', d: 'Secagem rápida e aroma limpo que não briga com o perfume', surv: true },
    { id: 'roupa_m', t: 'Vestir a roupa já separada ontem', d: 'Zero gasto de energia decidindo roupa às 05h50', surv: true },
    { id: 'perf_m', t: 'Aplicar O Boticário Uomini Infinite', d: '5 a 6 borrifadas: 2× pescoço e orelhas, 1× nuca, 1× peito, 1× dobras do cotovelo sem esfregar', surv: true }
  ],
  t1: [
    { id: 'labial_t', t: 'Hidratar mãos e cotovelos com Nivea Creme (Lata Azul)', d: '1 a 2× durante o expediente no ar-condicionado', opt: true }
  ],
  n1: [
    { id: 'casa_pia', t: 'Reset Casa 1/3: Cozinha — pia zerada e lixo', d: 'Guardar louça e lavar copo ou prato usado' },
    { id: 'casa_quarto', t: 'Reset Casa 2/3: Sala e Quarto — zero roupa fora do lugar', d: 'Roupa suja no cesto, tênis e mochila no lugar fixo' },
    { id: 'casa_banh', t: 'Reset Casa 3/3: Banheiro — pia seca e toalha aberta', d: 'Toalha sempre estendida em local ventilado' },
    { id: 'roupa_n', t: 'Separar roupa de amanhã + mochila e tênis', d: 'Deixar pendurada no gancho antes do banho' }
  ],
  n2: [
    { id: 'banho_n', t: 'Banho morno (Sabonete + Óleo Natura Sève / Co-Wash Ápice pós-corrida)', d: 'Pós-corrida (Qui/Sáb/Dom): lavar o cabelo com Ápice Nutri Waves (0% sulfato) · Domingo: Esfoliante Corpo Dourado Maracujá' },
    { id: 'hid_corpo', t: 'Nivea Loção Milk 72h (400ml) + Body Splash Nativa SPA Ameixa nos 2 min pós-banho', d: 'Com a pele ainda úmida em braços, pernas e tronco (Ácido Hialurônico + Óleo de Amêndoas)' },
    { id: 'desod_n', t: 'Aplicar Natura Erva Doce Roll-On 72h noturno', d: 'Com axila seca antes de dormir — bloqueia o suor 2× melhor no dia seguinte' },
    { id: 'pes_n', t: 'Nivea Creme Lata Azul (56g) nos pés, cotovelos e joelhos', d: 'Terça e Sábado — oclusão profunda que previne calos, rachaduras e atrito das corridas', days: [2, 6] },
    { id: 'fio_n', t: 'Passar o Fio Dental', d: 'Seu hábito âncora consolidado — nunca pular' },
    { id: 'escova_n', t: 'Escovar os dentes', d: 'Higiene noturna completa' },
    { id: 'gel_n', t: 'Lavar o rosto com Creamy Gel de Limpeza Facial', d: 'Remove protetor solar FPS 60, suor da corrida e poluição sem agredir a barreira' },
    { id: 'olhos_n', t: 'Aplicar Creamy Eye Cream nas olheiras e pálpebras', d: 'Tratamento noturno com Ácido Kójico Dipalmitato + Peptídeos Matrixyl' },
    { id: 'hid_n', t: 'Aplicar Creamy Ceramide Skin Repair (Bisnaga Azul-Petróleo)', d: 'Ultra reparador noturno com Ceramidas, Esqualano, CicaRecover e Prata Pura (Ag+) contra pelos encravados' },
    { id: 'cetim_n', t: 'Dormir na Fronha de Cetim Escura', d: 'Evita quebra do cabelo crespo crescendo · Meta pós-04/12: dormir às 22h30' }
  ]
};

export const ETAPAS_CAPILARES = [
  {
    titulo: 'Semana 1 · 💧 Hidratação Nutritiva Wella + Definição Gold Black',
    foco: 'Repor água e nutrientes perdidos no ar-condicionado e no sol de Ribeirão Preto usando seu trio Wella Invigo Nutri-Enrich + dupla Amend Gold Black.',
    cremes: 'Shampoo Wella Invigo Nutri-Enrich (1L) • Máscara Wella Nutri-Enrich (500ml) • Condicionador Wella Nutri-Enrich (1L) • Creme + Gelatina Amend Gold Black • Elseve Óleo Extraordinário',
    passos: [
      '<b>1. Shampoo Wella Invigo Nutri-Enrich · 2 min:</b> Molhe bem, aplique só no couro cabeludo, massageie com as pontas dos dedos e enxágue.',
      '<b>2. Tirar excesso de água:</b> Aperte suavemente com toalha de microfibra ou camiseta de algodão para a máscara não escorrer.',
      '<b>3. Máscara Wella Invigo Nutri-Enrich · 10 min:</b> Enluve mecha a mecha da raiz às pontas e desembarace no banho.',
      '<b>4. Esfoliação Corporal & Barba durante a pausa:</b> Enquanto a máscara age, massageie o <b>Esfoliante Corpo Dourado Maracujá (Argila Branca + Camomila)</b> no corpo e pescoço/barba.',
      '<b>5. Condicionador Wella Invigo Nutri-Enrich · 2 min:</b> Enxágue 100% da máscara, aplique o condicionador Wella por 2 min para selar a cutícula e enxágue.',
      '<b>6. Finalização Gold Black:</b> Com o cabelo úmido, aplique o <b>Creme para Pentear Amend Gold Black</b> + um toque da <b>Gelatina Amend Gold Black</b> e finalize com 2 gotas do <b>Elseve Óleo Extraordinário</b>.'
    ]
  },
  {
    titulo: 'Semana 2 · 🥑 Umectação com Óleo de Coco + Nutrição Profunda',
    foco: 'A etapa rainha do cabelo crespo: seu Óleo de Coco Virgem repõe lipídios profundos e o trio Wella + Elseve Óleo Extraordinário elimina o ressecamento.',
    cremes: 'Óleo de Coco Virgem (pote de vidro) • Ápice Nutri Waves (Co-Wash 0% sulfato) • Máscara Wella Invigo Nutri-Enrich • Elseve Óleo Extraordinário',
    passos: [
      '<b>1. Umectação Pré-Banho · 30 min:</b> Espalhe 1 colher de chá do seu <b>Óleo de Coco Virgem</b> nos fios secos 30 min antes do banho.',
      '<b>2. Emulsificação Suave com Ápice Nutri Waves:</b> No banho, aplique o <b>Ápice Nutri Waves (0% sulfato/silicones)</b> por cima do óleo por 3 a 5 min para soltar o excesso sem agredir, enxágue e lave o couro com 1 pump do <b>Shampoo Wella Nutri-Enrich</b>.',
      '<b>3. Máscara Wella + Óleo Extraordinário · 10 min:</b> Misture 1 colher da <b>Máscara Wella Invigo Nutri-Enrich</b> com 3 gotas do <b>Elseve Óleo Extraordinário</b>, enluve por 10 min e enxágue.',
      '<b>4. Selagem & Finalização:</b> Sele com <b>Condicionador Wella Nutri-Enrich</b> por 2 min e finalize com <b>Creme para Pentear Amend Gold Black</b>.'
    ]
  },
  {
    titulo: 'Semana 3 · ✨ Banho de Gloss & Alinhamento Anti-Porosidade ([Glycolic] Gloss)',
    foco: 'Usar sua linha completa L’Oréal Elseve [Glycolic] Gloss com Ácido Glicólico para fechar a porosidade do fio, alinhar as escamas e blindar com filtro UV.',
    cremes: 'Shampoo Elseve [Glycolic] Gloss (3%) • Máscara Wella Nutri-Enrich • Condicionador Elseve [Glycolic] Sela Gloss (4%) • Creme Super Gloss Elseve (Com Filtro UV)',
    passos: [
      '<b>1. Shampoo Elseve [Glycolic] Gloss · 2 min:</b> Lave o couro cabeludo com o Shampoo Extra Gloss (3% complexo com Ácido Glicólico, anti-sal) e enxágue.',
      '<b>2. Pausa Nutritiva Rápida · 5 min:</b> Aplique uma camada leve da <b>Máscara Wella Nutri-Enrich</b> por 5 min e enxágue.',
      '<b>3. Condicionador Elseve Sela Gloss (4% Ácido Glicólico) · 3 min:</b> Enluve os fios para laminar a cutícula e travar o brilho espelhado, depois enxágue.',
      '<b>4. Blindagem com Filtro UV:</b> Finalize com o <b>Creme Super Gloss Elseve [Glycolic] Gloss (Com Filtro UV)</b> combinado ao <b>Amend Gold Black</b> + 2 gotas de <b>Elseve Óleo Extraordinário</b>.'
    ]
  },
  {
    titulo: 'Semana 4 · 🧱 Acidificação & Reconstrução com Proteína do Arroz (Ápice + Wella)',
    foco: 'Repor aminoácidos com a Proteína do Arroz do seu Ápice Nutri Waves e reequilibrar o pH do fio contra quebra e ressecamento.',
    cremes: 'Shampoo Wella Invigo Nutri-Enrich • Ápice Nutri Waves (Acidificante + Proteína do Arroz) • Máscara Wella Nutri-Enrich • Amend Gold Black + Cera Charming Matte',
    passos: [
      '<b>1. Shampoo Wella Invigo Nutri-Enrich:</b> Lave o couro cabeludo e enxágue bem.',
      '<b>2. Etapa Acidificante + Proteína do Arroz · 5 min:</b> Tire o excesso de água e aplique o <b>Ápice Nutri Waves (Condicionador / Leave-In / Acidificante com Proteína do Arroz)</b> enluvando bem por 3 a 5 min para fechar as escamas e repor proteína vegetal. Enxágue.',
      '<b>3. Máscara Wella Nutri-Enrich · 10 min:</b> Aplique a máscara por 10 min para devolver maciez após a acidificação e enxágue 100%.',
      '<b>4. Finalização Estruturada:</b> Finalize com <b>Creme + Gelatina Amend Gold Black</b> nos cachos e, depois de seco, use uma ponta de dedo da <b>Cera Charming Efeito Matte</b> nas laterais do fade.'
    ]
  }
];

export const ROTINA_ONDAS = [
  { ini: '2026-11-25', fim: '2026-12-08', t: 'Onda 1 · Bandeja Creamy na Pia + Raspador', d: 'Foco único: deixar Gel de Limpeza Creamy + Vitamina C + Calming Cream + Watery Lotion FPS 60 visíveis ao lado da escova.' },
  { ini: '2026-12-09', fim: '2026-12-22', t: 'Onda 2 · Pós-Banho Nivea Milk + Uomini Infinite', d: 'Foco único: Nivea Milk 72h nos 2 min pós-banho + Natura Erva Doce Roll-On à noite + 5 borrifadas de Uomini Infinite.' },
  { ini: '2026-12-23', fim: '2027-01-05', t: 'Onda 3 · Reset 5 min da Casa + Roupa à Noite', d: 'Foco único: Timer de 5 min da casa antes do banho e deixar a roupa da manhã pendurada.' },
  { ini: '2027-01-06', fim: '2027-01-19', t: 'Onda 4 · Ritual de Domingo Wella + Corpo Dourado', d: 'Foco único: Cronograma capilar de 15 min no domingo (Wella/Elseve/Ápice) + esfoliação Corpo Dourado Maracujá + troca da fronha.' }
];

export const ROTINA_CICLOS = [
  { k: 'nutri', n: '🥗 Nutricionista', d: 45 },
  { k: 'depil', n: '🪒 Depilação Corporal', d: 90 },
  { k: 'desc', n: '🎨 Descoloração Segura', d: 90 },
  { k: 'corte', n: '✂️ Barbeiro', d: 18 },
  { k: 'cetim', n: '🛏️ Trocar Fronha de Cetim & Toalhas', d: 7 }
];

export const PRODUTOS_SUGERIDOS_SHOPPING = [
  { title: 'Máscara de Hidratação Pura — Lola Morte Súbita (450g) ou Widi Care Juba Hidro-Nutritiva', price: 42, category: 'beleza_pessoal', notes: 'Prioridade 1 (Cremes) — Sua Wella Nutri-Enrich é de Nutrição; falta uma máscara de Hidratação pura para as Semanas 1 e 3' },
  { title: 'Máscara de Reconstrução — Lola Tarja Preta (Queratina Vegetal 230g)', price: 45, category: 'beleza_pessoal', notes: 'Prioridade 2 (Cremes) — Reposição forte de massa na Semana 4 (indispensável se for descolorir/colorir)' },
  { title: 'Co-Wash Dedicado 500ml — Widi Care Juba Co-Wash ou Lola Comigo Ninguém Pode', price: 39, category: 'beleza_pessoal', notes: 'Prioridade 3 (Cremes) — Para lavar o suor nos 3 dias de corrida (Qui/Sáb/Dom) sem gastar todo o seu Ápice Nutri Waves' },
  { title: 'Óleo 100% Vegetal em Pump — Lola Pinga! (Patauá & Moringa ou Açaí & Pracaxi 55ml)', price: 29, category: 'beleza_pessoal', notes: 'Prioridade 4 (Óleos) — Óleo vegetal líquido sem silicone para batizar a máscara (seu Elseve tem silicones de selagem e o de coco solidifica no frio)' },
  { title: '2 Fronhas de Cetim Escuras (Preta / Azul-Marinho)', price: 48, category: 'beleza_pessoal', notes: 'Prioridade 1 (Acessórios Capilares) — Evita que o algodão sugue o Amend Gold Black e quebre o cabelo à noite' },
  { title: 'Borrifador Spray de Névoa Contínua (200ml)', price: 18, category: 'beleza_pessoal', notes: 'Prioridade 2 (Acessórios Capilares) — Umedece o cabelo em 5s às 05h50 para reativar o Creme Amend Gold Black' },
  { title: 'Kit Escova Polvo Flexível + Pente Garfo Dentes Largos', price: 26, category: 'beleza_pessoal', notes: 'Prioridade 3 (Acessórios Capilares) — Escova polvo desembaraça no banho com a máscara Wella; pente garfo dá volume na raiz' },
  { title: 'Raspador de Língua em Inox ou Cobre', price: 18, category: 'beleza_pessoal', notes: 'Complemento Higiene & Presença — Hálito limpo em 10 segundos às 05h50' },
  { title: 'Tonalizante Sem Amônia Kamaleão Color (150ml) + Luvas Pretas', price: 38, category: 'beleza_pessoal', notes: 'Opcional (apenas quando for colorir de Vermelho, Azul ou Platinado)' }
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
  if (!state.rotinaMatheus.ocrMap || typeof state.rotinaMatheus.ocrMap !== 'object') state.rotinaMatheus.ocrMap = {};
  if (state.rotinaMatheus.autoRotinaFotos === undefined) state.rotinaMatheus.autoRotinaFotos = true;
  if (!Array.isArray(state.rotinaMatheus.arsenal) || state.rotinaMatheus.arsenal.length === 0) {
    state.rotinaMatheus.arsenal = CATALOGO_PRODUTOS_ROTINA.map(p => ({ key: p.key, nome: p.nome, curto: p.curto, cat: p.cat, slot: p.slot, quando: p.quando }));
  }
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
  base.ocrMap = { ...((cloudRM && cloudRM.ocrMap) || {}), ...((localRM && localRM.ocrMap) || {}) };
  base.autoRotinaFotos = (localRM && localRM.autoRotinaFotos !== undefined)
    ? localRM.autoRotinaFotos
    : ((cloudRM && cloudRM.autoRotinaFotos !== undefined) ? cloudRM.autoRotinaFotos : true);
  const mapArs = new Map();
  CATALOGO_PRODUTOS_ROTINA.forEach(p => mapArs.set(p.key, { key: p.key, nome: p.nome, curto: p.curto, cat: p.cat, slot: p.slot, quando: p.quando }));
  [((cloudRM && cloudRM.arsenal) || []), ((localRM && localRM.arsenal) || [])].forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(item => { if (item && item.key) mapArs.set(item.key, item); });
  });
  base.arsenal = Array.from(mapArs.values());
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
  const { onSaveState, onAddWishlistItem, onToast, onOcrImage } = callbacks;
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
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>1. Antes de correr no sol (Seus produtos das fotos):</b> No rosto passe o <b>Natura Fotoequilíbrio Facial FPS 60</b> (resistente à água e ao suor) e no cabelo passe 1 moeda do seu <b>Creme Super Gloss Elseve [Glycolic] Gloss (Com Filtro UV)</b>.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>2. Lavagem pós-corrida com Co-Wash (Seu produto):</b> Nos dias de corrida sem shampoo, use o seu <b>Ápice Nutri Waves (0% sulfatos, parabenos, sal e silicones)</b> como Co-Wash limpante suave: massageie o couro cabeludo por 1 min e enxágue 100%.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>3. Selagem rápida pós-corrida:</b> Com o cabelo úmido, passe o <b>Creme para Pentear Amend Gold Black</b> + <b>2 gotas do Elseve Óleo Extraordinário</b> amassando de baixo para cima.</div>
          <div style="padding:0.5rem;border-radius:var(--radius-sm);background:rgba(0,0,0,0.03);"><b>4. Dias de Shampoo Nutritivo:</b> Use o seu <b>Shampoo Wella Invigo Nutri-Enrich (1L)</b> apenas <b>1 a 2× na semana</b> (Quinta pós-corrida e Domingo antes da máscara Wella; ou o <b>Shampoo Elseve [Glycolic] Gloss</b> na Semana 3).</div>
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
        <h3 style="margin:0 0 0.4rem;">🧴 Seu Arsenal Real de Skincare (15 Fotos do GitHub)</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>1. Limpeza Facial — Manhã e Noite:</b> <b>Creamy Gel de Limpeza (frasco verde-água 200ml)</b> com PCA Zinco + Centella Asiática + Camomila (sem sulfato e sem fragrância).</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>2. Combo Facial da Manhã (Ordem Exata):</b> 1º <b>Creamy Sérum 10% Vitamina C + Ácido Ferúlico (frasco laranja)</b> → 2º <b>Creamy Eye Cream (frasco cinza)</b> nas olheiras → 3º <b>Creamy Calming Cream (bisnaga coral)</b> no rosto/pós-barba → 4º <b>Creamy Watery Lotion FPS 60</b> (trabalho) ou <b>Natura Fotoequilíbrio Facial FPS 60</b> (dias de corrida).</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>3. Combo Facial da Noite (Reparação Profunda):</b> 1º <b>Creamy Gel de Limpeza</b> → 2º <b>Creamy Eye Cream</b> (Ácido Kójico clareador) → 3º <b>Creamy Ceramide Skin Repair (bisnaga azul-petróleo)</b> com Ceramidas, Esqualano, CicaRecover e Prata Pura (Ag+) que regenera a pele e evita foliculite na barba.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>4. Corpo, Banho & Pés:</b> <b>Nivea Loção Milk 72h (400ml)</b> nos 2 min pós-banho com pele úmida • <b>Óleo Natura Sève Amêndoas Doces</b> no banho noturno • <b>Esfoliante Corpo Dourado Maracujá (Argila Branca + Camomila)</b> todo Domingo • <b>Nivea Creme Lata Azul (56g)</b> nos pés (Terça e Sábado) e cotovelos.</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">✨ As 5 Camadas do Homem Sempre Cheiroso (Com Seus Produtos)</h3>
        <div style="font-size:0.84rem;display:flex;flex-direction:column;gap:0.45rem;">
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Camadas 1 a 3 — Base, Suor & Barba:</b> Raspador de língua de manhã + fio dental à noite + <b>Natura Erva Doce Roll-On 72h</b> à noite com axila seca e de manhã + 2 gotas do <b>Elseve Óleo Extraordinário</b> na barba.</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>Camada 4 — Fixação com Hidratante:</b> Passar <b>Nivea Loção Milk 72h</b> no pescoço/peito/braços antes de borrifar o perfume (pele hidratada segura a fragrância pelo dobro do tempo).</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>☀️ Perfume Principal (Trabalho, Dia & Encontros):</b> <b>O Boticário Uomini Infinite</b> — 5 a 6 borrifadas (2× pescoço/orelhas, 1× nuca, 1× peito, 1× dobras do cotovelo sem esfregar).</div>
          <div style="padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);"><b>🌙 Pós-Banho Noturno & Dormir Cheiroso com a Scarlet:</b> <b>O Boticário Nativa SPA Ameixa Body Splash (200ml)</b> combinado ao <b>Óleo Natura Sève Amêndoas Doces</b>.</div>
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;border-left:3px solid var(--brand-moss);">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.4rem;">
          <h3 style="margin:0;">👔 Looks Sugeridos & Montador Automático</h3>
          <span class="chip">Pronto para suas fotos</span>
        </div>
        <p style="margin:0 0 0.55rem;font-size:0.8rem;color:var(--text-muted);">Assim que você bater e enviar as fotos nas categorias <b>🏢 Roupas — trabalho</b>, <b>☀️ Roupas — casual</b>, <b>👟 Calçados</b>, <b>⌚ Acessórios</b> e <b>🧍 Eu vestido</b> na aba Fotos, o app detecta a cor/tipo de cada peça e monta seus looks automaticamente. Abaixo estão os 4 looks-base já cruzados com seus perfumes e finalizadores atuais:</p>
        <div style="font-size:0.83rem;display:flex;flex-direction:column;gap:0.5rem;">
          ${LOOKS_BASE_SUGERIDOS.map(l => `
            <div style="padding:0.55rem;background:rgba(46,89,51,0.06);border-radius:var(--radius-sm);">
              <b>${l.titulo}</b>
              <div style="margin-top:0.2rem;"><b>Peças:</b> ${l.pecas}</div>
              <div style="margin-top:0.2rem;color:var(--brand-moss);"><b>Cabelo, Pele & Perfume:</b> ${l.grooming}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dash-card" style="margin-bottom:0.85rem;">
        <h3 style="margin:0 0 0.4rem;">🎨 Paleta de Roupas & Cores com Cabelo Colorido</h3>
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

      <div class="dash-card" style="margin-bottom:0.85rem;border-left:3px solid var(--brand-moss);">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.4rem;">
          <h3 style="margin:0;">🧠 Produtos & Rotina Automática das Fotos</h3>
          <span class="chip" id="rm-ai-badge">${(rm.arsenal || CATALOGO_PRODUTOS_ROTINA).length} produtos ativos</span>
        </div>
        <p id="rm-ai-status" style="margin:0 0 0.55rem;font-size:0.8rem;color:var(--text-muted);">Cada foto adicionada ou enviada ao GitHub é analisada automaticamente (catálogo + OCR do rótulo) e encaixada na sua rotina de Manhã, Corrida, Noite e Cronograma Capilar.</p>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.65rem;">
          <label style="display:inline-flex;align-items:center;gap:0.4rem;font-size:0.8rem;font-weight:600;cursor:pointer;">
            <input type="checkbox" id="rm-chk-auto-rotina" ${rm.autoRotinaFotos !== false ? 'checked' : ''} style="accent-color:var(--brand-moss);width:16px;height:16px;" />
            Atualizar rotina automaticamente a cada upload de fotos
          </label>
          <button type="button" class="btn btn-secondary btn-sm" id="rm-btn-reanalisar-fotos">🔍 Reanalisar fotos</button>
        </div>
        <div id="rm-ai-resumo" style="display:flex;flex-direction:column;gap:0.45rem;font-size:0.82rem;"></div>
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
        const localTag = f.productLabel || (identificarProdutoPorTextoOuId({ id: f.id, cat: f.cat, ocrText: f.ocrText || rm.ocrMap[f.id] || '' }) || {}).curto || f.cat;
        d.innerHTML = `
          <img src="${u}" loading="lazy" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;" />
          <span style="position:absolute;left:4px;right:4px;bottom:4px;font-size:0.63rem;background:rgba(0,0,0,0.78);color:#fff;border-radius:6px;padding:2px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.sent ? '✅' : '⏳'} ${localTag}</span>
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
          let ocrText = '';
          let prod = identificarProdutoPorTextoOuId({ id: files[i].name || id, cat });
          if (!prod && rm.autoRotinaFotos !== false && typeof onOcrImage === 'function') {
            setImpMsg(`🔍 Lendo rótulo da foto ${i + 1} de ${files.length} para ajustar sua rotina...`);
            ocrText = await onOcrImage(blob, (st) => setImpMsg(st));
            if (ocrText) {
              rm.ocrMap[id] = ocrText;
              prod = identificarProdutoPorTextoOuId({ id, cat, ocrText });
            }
          }
          let corInfo = null;
          if (CATEGORIAS_GUARDA_ROUPA.includes(cat)) {
            corInfo = await extrairCorDominanteBlob(thumb || blob);
          }
          const autoLabel = prod ? prod.curto : (corInfo ? corInfo.nome : null);
          await idbFoto('readwrite', s => s.put({ id, cat, blob, thumb, size, sent: false, ocrText, corNome: corInfo ? corInfo.nome : null, productKey: prod ? prod.key : null, productLabel: autoLabel }));
          n++;
        } catch (err) {
          falhas++;
        }
      }
      if (barImpI) barImpI.style.width = '100%';
      setTimeout(() => { if (barImp) barImp.style.display = 'none'; }, 600);
      if (bGal) bGal.disabled = false;
      if (bCam) bCam.disabled = false;
      setImpMsg(n ? `✅ ${n} fotos prontas na fila e analisadas na rotina${falhas ? ` · ${falhas} falharam` : ''}` : '');
      await manterTelaAcesa(false);
      await sincronizarArsenalERotina(false);
      notify(`${n} fotos adicionadas e rotina atualizada 🧠`, 'success');
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
        const det = identificarProdutoPorTextoOuId({ id: f.id, path: f.path, cat: f.cat, ocrText: rm.ocrMap[f.id] || '' });
        const tag = det ? det.curto : f.cat;
        d.style.cssText = 'position:relative;aspect-ratio:1;background:rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;cursor:zoom-in;';
        d.innerHTML = `
          <div class="rm-gh-ph" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--text-muted);">carregando…</div>
          <span title="${det ? det.nome : f.cat}" style="position:absolute;left:4px;right:4px;bottom:4px;font-size:0.63rem;background:rgba(0,0,0,0.78);color:#fff;border-radius:6px;padding:2px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">☁️ ${tag}</span>
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
            d.addEventListener('click', () => abrirFotoTelaCheia(url, det ? `${det.nome} · ${det.quando}` : f.cat));
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

    const renderResumoAi = (produtos, todasFotos = []) => {
      const box = document.getElementById('rm-ai-resumo');
      const badge = document.getElementById('rm-ai-badge');
      if (!box) return;
      const plano = gerarPlanoRotinaDoArsenal(produtos);
      if (badge) badge.textContent = `${plano.totalProdutos} produtos (${plano.totalCabelo} cabelo · ${plano.totalPele} pele/perfume)`;
      box.innerHTML = `
        <div style="padding:0.55rem;background:rgba(46,89,51,0.07);border-radius:var(--radius-sm);">
          <b>🌅 Manhã — Rosto (Ordem ideal dos seus produtos):</b>
          <div style="margin-top:0.25rem;color:var(--text-secondary);">${plano.manhaRosto.join('<br>')}</div>
        </div>
        <div style="padding:0.55rem;background:rgba(46,89,51,0.07);border-radius:var(--radius-sm);">
          <b>💈 Manhã — Cabelo, Barba & Perfume:</b>
          <div style="margin-top:0.25rem;color:var(--text-secondary);">${plano.manhaCabeloPresenca.join('<br>')}</div>
        </div>
        <div style="padding:0.55rem;background:rgba(46,89,51,0.07);border-radius:var(--radius-sm);">
          <b>🏃 Dias de Corrida (Quinta, Sábado e Domingo):</b>
          <div style="margin-top:0.25rem;color:var(--text-secondary);">${plano.diasCorrida.join('<br>')}</div>
        </div>
        <div style="padding:0.55rem;background:rgba(46,89,51,0.07);border-radius:var(--radius-sm);">
          <b>🌙 Noite — Pós-Banho, Pés & Reparação Facial:</b>
          <div style="margin-top:0.25rem;color:var(--text-secondary);">${plano.noiteRecuperacao.join('<br>')}</div>
        </div>
        <div style="padding:0.55rem;background:rgba(46,89,51,0.07);border-radius:var(--radius-sm);">
          <b>📅 Cronograma Capilar de Domingo (4 Semanas):</b>
          <div style="margin-top:0.25rem;color:var(--text-secondary);">${plano.cronogramaDomingo.join('<br>')}</div>
        </div>
        ${(() => {
          const w = gerarLooksDoGuardaRoupa(todasFotos);
          if (w.totalFotosGuardaRoupa > 0) {
            return `
              <div style="padding:0.55rem;background:rgba(46,89,51,0.11);border-radius:var(--radius-sm);border-left:3px solid var(--brand-moss);">
                <b>👔 Looks Montados com suas Fotos (${w.totalFotosGuardaRoupa} peças: ${w.contagem.trabalho} trab · ${w.contagem.casual} casual · ${w.contagem.calcados} calçados · ${w.contagem.acessorios} acess.):</b>
                <div style="margin-top:0.3rem;display:flex;flex-direction:column;gap:0.35rem;">
                  ${w.looksFotografados.map(lk => `<div><b>${lk.titulo}:</b> ${lk.combinacao}<br><span style="font-size:0.76rem;color:var(--brand-moss);">✨ ${lk.acabamento}</span></div>`).join('')}
                </div>
              </div>
            `;
          }
          return `
            <div style="padding:0.55rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);">
              <b>👔 Montador Automático de Looks (Aguardando fotos de Roupas, Calçados e Acessórios):</b>
              <div style="margin-top:0.2rem;color:var(--text-muted);">Selecione acima <b>🏢 Roupas — trabalho</b>, <b>☀️ Roupas — casual</b>, <b>👟 Calçados</b> ou <b>⌚ Acessórios</b> e envie suas fotos: o app detecta a cor de cada peça e monta seus looks automaticamente aqui.</div>
            </div>
          `;
        })()}
        <details style="margin-top:0.2rem;">
          <summary style="cursor:pointer;font-weight:700;color:var(--brand-moss);">📋 Ver todos os ${ (produtos || CATALOGO_PRODUTOS_ROTINA).length } produtos identificados nas fotos</summary>
          <div style="display:flex;flex-direction:column;gap:0.35rem;margin-top:0.4rem;">
            ${(produtos || CATALOGO_PRODUTOS_ROTINA).map(p => `
              <div style="padding:0.4rem 0.5rem;background:rgba(0,0,0,0.03);border-radius:var(--radius-sm);">
                <b>${p.nome}</b> <span class="chip" style="font-size:0.68rem;padding:1px 6px;">${p.quando}</span>
                <div style="font-size:0.76rem;color:var(--text-muted);margin-top:2px;">${p.comoUsar || ''}</div>
              </div>
            `).join('')}
          </div>
        </details>
      `;
    };

    const sincronizarArsenalERotina = async (runDeepOcr = false) => {
      const stEl = document.getElementById('rm-ai-status');
      const localFs = await listarFotosIdb();
      const ghFs = (ghFotosCache && Array.isArray(ghFotosCache.list)) ? ghFotosCache.list : [];
      if (runDeepOcr && typeof onOcrImage === 'function') {
        // Roda OCR nas fotos que ainda não possuem match no catálogo nem texto OCR salvo
        for (const f of localFs) {
          if (!identificarProdutoPorTextoOuId({ id: f.id, cat: f.cat, ocrText: f.ocrText || rm.ocrMap[f.id] || '' }) && f.blob) {
            if (stEl) stEl.textContent = `🔍 Lendo rótulo da foto local ${f.id}...`;
            const txt = await onOcrImage(f.blob);
            if (txt) { f.ocrText = txt; rm.ocrMap[f.id] = txt; await idbFoto('readwrite', s => s.put(f)); }
          }
        }
        for (const gf of ghFs) {
          if (!identificarProdutoPorTextoOuId({ id: gf.id, path: gf.path, cat: gf.cat, ocrText: rm.ocrMap[gf.id] || '' })) {
            try {
              if (stEl) stEl.textContent = `🔍 Lendo rótulo da foto do GitHub ${gf.id}...`;
              const url = await baixarFotoGitHub(gf);
              const txt = await onOcrImage(url);
              if (txt) rm.ocrMap[gf.id] = txt;
            } catch (e) {}
          }
        }
      }
      const todasFotos = [
        ...CATALOGO_PRODUTOS_ROTINA.map(p => ({ id: (p.photoIds && p.photoIds[0]) || p.key, cat: p.cat })),
        ...ghFs,
        ...localFs
      ];
      const detectados = analisarListaFotosArsenal(todasFotos, rm.ocrMap);
      if (detectados.length) {
        rm.arsenal = detectados.map(p => ({ key: p.key, nome: p.nome, curto: p.curto, cat: p.cat, slot: p.slot, quando: p.quando, comoUsar: p.comoUsar }));
        save();
      }
      renderResumoAi(detectados.length ? detectados : CATALOGO_PRODUTOS_ROTINA, [...ghFs, ...localFs]);
      if (stEl) {
        stEl.textContent = `✅ ${detectados.length || CATALOGO_PRODUTOS_ROTINA.length} produtos identificados nas fotos e integrados nas abas Hoje, Capilar e Pele & Estilo.`;
      }
    };

    document.getElementById('rm-chk-auto-rotina')?.addEventListener('change', (e) => {
      rm.autoRotinaFotos = Boolean(e.target.checked);
      save();
      notify(rm.autoRotinaFotos ? 'Atualização automática de rotina ativada ✅' : 'Atualização automática pausada');
    });

    document.getElementById('rm-btn-reanalisar-fotos')?.addEventListener('click', async () => {
      await sincronizarArsenalERotina(true);
      notify('Arsenal de fotos reanalisado e rotina sincronizada! 🧠', 'success');
    });

    renderResumoAi(CATALOGO_PRODUTOS_ROTINA);
    atualizarGaleria();
    renderGaleriaGitHub().then(() => {
      if (rm.autoRotinaFotos !== false) sincronizarArsenalERotina(false);
    });
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
