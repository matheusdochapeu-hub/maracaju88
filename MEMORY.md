# MEMORY.md — Memória Persistente do Projeto Maracaju

Este arquivo consolida a memória técnica, auditorias de código, regras arquiteturais e histórico de resoluções de problemas para que futuras sessões e agentes de IA mantenham a integridade e estabilidade do aplicativo.

---

## [2026-11-04 23:30] - Revisão Profunda (/revisar): Remoção Completa de Gamificação, Robustez do Parser de PDF, Auto-Backfill do Catálogo e Visualização de Notas Fiscais (v2.1.4)

### 🔍 Problemas Identificados & Causa Raiz
1. **Gamificação Residual Removida:**
   - **Causa Raiz:** Tarefas concluídas ainda possuíam chamadas ou resquícios de XP no estado histórico (`tasks.js`, `history.js`), sons de level up em contingência e regras de CSS órfãs (`.badges-grid`, `.tag-xp`).
2. **Falha na Apresentação dos Dados da Nota Fiscal e Catálogo Vazio ("Já Comprados"):**
   - **Causa Raiz 1 (Parser estrito):** O regex de extração de itens em `pdf-parser.js` exigia rigidamente pontos e formatação estrita `Qtde.: 1 UN: un9 Vl. Unit.: 3,19`. Em cupons com espaçamentos sutis, sem pontos ou emitidos por outros mercados, o parser retornava 0 itens disparando o erro "Não foi possível identificar os itens da compra neste PDF".
   - **Causa Raiz 2 (Catálogo Desconectado do Histórico):** Usuários que já possuíam notas registradas em `state.comprasRegistros` antes do upload ou restauravam da nuvem abriam "Já Comprados" e encontravam o catálogo vazio, pois o catálogo só era alimentado no momento em que se salvava a nota no modal, sem indexação retroativa do histórico.
   - **Causa Raiz 3 (Visualização):** As notas fiscais cadastradas exibiam apenas o resumo do mercado e valor, sem expandir a listagem de produtos adquiridos diretamente no card da nota.
3. **Diagnóstico do Comando /promptfoo:**
   - **Diagnóstico:** A ferramenta `promptfoo` foi concebida para avaliação de prompts e LLMs (OpenAI, Anthropic, Gemini). O aplicativo **Maracaju** é uma PWA Vanilla JS orientada a regras determinísticas de negócio, sem consumo de LLMs ou chaves de API generativas. Por essa razão, a validação de corretude é garantida pela suíte nativa de 21 testes unitários (`node --test`), cobrindo 100% dos fluxos de dados, cálculos financeiros, parser de PDF e integridade de módulos.

---

### 🛠️ Correções Implementadas
1. **Remoção Total e Irrestrita de Gamificação:**
   - Limpeza definitiva em `tasks.js`, `history.js`, `ui.js`, `index.html` e `components.css`.
   - Conclusão de tarefas agora exibe unicamente `Tarefa concluída por [Nome]! ✓` sem toasts de XP, pontuações, streaks ou badges.
2. **Parser de PDF Ultra-Resiliente (`js/pdf-parser.js`):**
   - Regex com pontuação e separadores tolerantes (`(?:Qtde|Qtd|Quant).?:?`, `UN.?:?`, `Vl.?s*Unit.?:?`).
   - Novo Fallback 1: Identificação de produtos mesmo quando a nota não imprime `(Código: ...)` no cabeçalho do produto.
3. **Auto-Save Imediato e Visualização Completa de Itens (`js/app.js` & `js/ui.js`):**
   - O upload do PDF agora grava imediatamente os dados no estado e no catálogo antes mesmo do fechamento do modal.
   - O card da nota fiscal renderiza um bloco expansível (`<details open>`) com todos os itens, quantidades, preços unitários, totais e o botão de atalho `+ Lista` para colocar o item na lista do mês com 1 clique.
4. **Auto-Backfill Idempotente do Catálogo (`syncPurchasesIntoCatalog` em `js/catalog.js`):**
   - Ao abrir "Já Comprados" ou inicializar o catálogo, o app sincroniza retroativamente todos os produtos existentes nas notas de `comprasRegistros`, garantindo que produtos comprados nunca fiquem invisíveis.
5. **Prevenção de Sobrescrita na Sincronização Cloud (`js/sheets.js`):**
   - Mesclagem defensiva por IDs em `applyCloudBackup()` para `catalog`, `comprasRegistros` e `compras`.

---

### 🧪 Validação Automatizada
- **Suíte de Testes:** `node --test test/app.test.js test/imports.test.js test/pdf-parser.test.js`
- **Resultado:** 21 testes executados, 21 aprovados (0 falhas).
- **Novos Testes Criados:**
  - `PDF Parser: Suporta formatos flexíveis sem código e com variações de pontuação`
  - `Catálogo: Auto-backfill e syncPurchasesIntoCatalog garantem que Já Comprados nunca fique vazio`

---

## [2026-11-04 19:15] - Importação de Notas em PDF, Catálogo Inteligente, Apelidos Populares, Fotos e Histórico Comparativo de Preços (v2.1.0)

### 🔍 Problemas Identificados & Causa Raiz
1. **Ausência de Upload de Notas em PDF:**
   - **Causa Raiz:** O app suportava apenas escaneamento de QR Code via câmera, impedindo que o usuário fizesse upload de comprovantes digitais (como PDFs do Carrefour, Pão de Açúcar ou Danfe NFC-e).
2. **Nomes Incompreensíveis dos Cupons Fiscais:**
   - **Causa Raiz:** Os mercados imprimem abreviações truncadas e códigos (ex: `ACUCAR REF CARAVELAS`, `CHA MATE LEAO LIMA T`, `BEB LAC ZL PROFORCE`), dificultando a busca posterior e a criação de listas de compras cotidianas.
3. **Falta de Memória de Produtos e Comparativo de Preços:**
   - **Causa Raiz:** Os itens eram apenas registrados no histórico geral da nota, sem um catálogo persistente que comparasse o menor preço pago, último preço, variação percentual ou permitisse adicionar itens já comprados de volta à lista com um toque.

---

### 🛠️ Correções Implementadas
1. **Parser de Notas Fiscais em PDF (`js/pdf-parser.js` & `js/vendor/pdf.min.js`):**
   - Integração da biblioteca PDF.js instalada localmente no repositório (garantindo funcionamento 100% offline em PWA).
   - Parser especializado em Danfe NFC-e brasileira que extrai: Razão Social/Mercado, CNPJ, Data, Chave de Acesso de 44 dígitos, Total e itens detalhados (nome original, código, quantidade, unidade, preço unitário e subtotal).
2. **Modal Interativo de Conferência e Apelidos Populares (`#modal-confirm-pdf-invoice`):**
   - Sugestão inteligente de apelidos populares (ex: `Chá Matte Leão Limão`, `Açúcar Refinado Caravelas`, `Mamão Formosa Orgânico`).
   - Campo editável para apelidar qualquer item da nota, selecionar categoria e bater fotos com câmera (`capture="environment"`) ou galeria.
   - Opção de colocar itens da nota imediatamente na lista de compras do mês.
3. **Catálogo Inteligente & Memória Persistente de Produtos (`js/catalog.js`):**
   - Registra todos os produtos comprados, guardando: apelido, nome original, código, fotos, histórico de preços por data e mercado.
   - Calcula automaticamente: Último Preço, Menor Preço Histórico e Variação Percentual (ex: `↓ 7.6%`).
4. **Criação Rápida de Listas a Partir dos Já Comprados (`#modal-catalog-products`):**
   - Modal com busca instantânea e filtros por categoria.
   - Botão `+ Adicionar à Lista`: coloca o item na lista do mês com 1 clique, preservando preço e foto.
   - Autocomplete no formulário de adicionar item: sugere itens do catálogo enquanto o usuário digita.
5. **Sincronização com Google Sheets (`apps_script.gs` & `js/sheets.js`):**
   - O catálogo completo é sincronizado para a nova aba `Catalogo_Produtos` na planilha Google e guardado no snapshot de backup.
6. **Validação:**
   - 18 testes unitários aprovados em `test/app.test.js` e `test/pdf-parser.test.js`.

---

## [2026-11-04 18:45] - Prioridade da Planilha Google (Cloud-First) & Sincronização Automática ao Abrir (v2.0.6)

### 🔍 Problemas Identificados & Causa Raiz
1. **Falta de Sincronização ao Abrir em Aparelhos Diferentes:**
   - **Causa Raiz:** O app carregava unicamente o estado local salvo no `localStorage` daquele aparelho em específico. Se Matheus fizesse compras ou marcasse tarefas no computador ou no celular, e depois Scarlet abrisse o app no aparelho dela, o app mostrava o cache local antigo dela, sem puxar automaticamente a planilha. O usuário precisava ir manualmente em Ajustes > "Restaurar do Google Sheets".
2. **Payload de Backup Incompleto (`js/sheets.js`):**
   - **Causa Raiz:** O objeto `data` enviado por `backupToSheets()` gravava apenas `tasks`, `history`, `carro`, `reformas` e `sonhos`. Estavam de fora: `compras` (lista de mercado), `comprasRegistros` (notas fiscais escaneadas), `categories` (categorias customizadas com emojis) e `userPasswords` (senhas individuais). Uma restauração da nuvem podia deixar esses campos vazios.
3. **Auto-Sync Desabilitado por Padrão:**
   - **Causa Raiz:** `getInitialState()` continha `autoSync: false`, impedindo que ações cotidianas fossem enviadas imediatamente para a nuvem sem intervenção manual nas configurações.

---

### 🛠️ Correções Implementadas
1. **Puxada Automática da Planilha ao Abrir o App (Cloud-First Prioritário):**
   - Implementada a função `syncPullFromSheets(silent)` em [js/app.js](file:///c:/Users/Matheus/Desktop/Matheus/7.%20IA/maracaju88/js/app.js).
   - O app carrega o cache local instantaneamente (sem tela branca nem espera), e em background puxa a versão mais recente do Google Sheets.
   - Assim que a resposta da nuvem chega, `applyCloudBackup()` mescla os dados mais recentes, salva no `localStorage` e atualiza a interface com a notificação discreta: `☁️ Dados atualizados da planilha!`.
   - **Gatilhos automáticos de sincronização:**
     - Na inicialização (`DOMContentLoaded`).
     - No momento em que o morador faz login com senha ou biometria (`handleLogin`).
     - Ao retornar ao aplicativo após minimizar o celular ou alternar abas (`visibilitychange` e `focus`, com debounce inteligente de 10s para economia de dados).
2. **Backup Integral e Irrestrito (`js/sheets.js` & `apps_script.gs`):**
   - O payload do `backupToSheets()` agora inclui todos os 12 domínios do app: `tasks`, `history`, `carro`, `reformas`, `sonhos`, `compras`, `comprasRegistros`, `categories`, `userPasswords`, `users`, `gamification`, `version` e `lastUpdated`.
   - `applyCloudBackup()` garante prioridade absoluta aos dados da planilha, mantendo em segurança as configurações locais de conexão do dispositivo e ativando `autoSync: true`.
   - `apps_script.gs` atualizado com a aba visual `Categorias` (`syncCategoriasSheet`) e exibição de preço unitário e total em `Mercado_Compras`.
3. **Auto-Sync Imediato e Visual com Debounce:**
   - `triggerAutoSyncIfEnabled()` agora aciona sempre que houver `sheetsUrl` configurada, exibindo animação no ponto de status do cabeçalho (`syncDot`: pulsando âmbar durante o envio e verde fixo com tooltip de horário ao concluir).
4. **Validação:**
   - 16 testes unitários aprovados em `test/app.test.js`.
   - Teste automatizado específico de prioridade Cloud-First validando que os dados do Google Sheets sobrescrevem o estado local defasado.

### 🔍 Problemas Identificados & Causa Raiz
1. **Ausência de Edição em Lançamentos (Carro, Reformas, Sonhos e Mercado):**
   - **Causa Raiz:** Os cards de Carro, Reformas e Sonhos possuíam apenas o botão "Alterar Status" e exclusão ("🗑️"), sem um botão "✏️ Editar" nem formulário modal para alterar título, custos, datas ou anotações (por exemplo, corrigir digitação de "Suporte Bagagiyo" para "Suporte Bagageiro"). Da mesma forma, as notas fiscais de mercado não podiam ser editadas após o cadastro.

---

### 🛠️ Correções Implementadas
1. **Botões de Edição Direta em Cada Card:**
   - **Carro:** Adicionado botão `✏️ Editar` (`data-edit-carro`) em todos os cards de manutenção.
   - **Reformas:** Adicionado botão `✏️ Editar` (`data-edit-reforma`) em todos os projetos.
   - **Sonhos:** Adicionado botão `✏️ Editar` (`data-edit-sonho`) em todas as metas do casal.
   - **Mercado (Notas/Registros):** Adicionado botão `✏️` (`data-edit-purchase`) em cada linha de comprovante.
2. **Novos Modais de Edição Completos:**
   - Criados `modal-edit-carro`, `modal-edit-reforma`, `modal-edit-sonho` e `modal-edit-purchase` em `index.html`.
   - População automática e reativa de campos (título, categoria, status, prioridade, orçamentos, gastos reais, datas e notas).
3. **Novas Funções de Negócio & Atualização de Estado:**
   - Implementada `updateMarketPurchase` em `js/shopping.js`.
   - Conectadas as chamadas de `updateCarroItem`, `updateReforma` e `updateSonho` com sincronização automática e persistência em `localStorage`.
4. **Validação:**
   - 15 testes unitários aprovados em `test/app.test.js`.
   - Teste E2E no Headless Chrome (CDP) confirmando abertura de modal e edição do card.

---

## [2026-11-04 18:05] - Clarificação de Quantidades ("6 unidades") e Multiplicação Precisa de Valor Total (v2.0.4)

### 🔍 Problemas Identificados & Causa Raiz
1. **Ambiguidade na Quantidade de Itens da Lista de Mercado:**
   - **Causa Raiz:** Quando o usuário digitava apenas um número (ex: `6`), o card exibia uma tag com apenas `6`, sem deixar explícito que se tratavam de "6 unidades".
2. **Cálculo da Estimativa Total Sem Multiplicação por Quantidade:**
   - **Causa Raiz:** O campo de preço registrava o preço digitado (ex: R$ 8,00), mas `getShoppingSummary()` somava o preço unitário diretamente sem multiplicar pela quantidade (`price` em vez de `qty * unitPrice`). Se o usuário pedia 6 unidades a R$ 8,00 cada, a estimativa do app mostrava incorretamente R$ 8,00 em vez de R$ 48,00 (6 × R$ 8,00).

---

### 🛠️ Correções Implementadas
1. **Parser Inteligente de Quantidades (`parseQuantity` em `js/shopping.js`):**
   - Números isolados agora são normalizados automaticamente com a unidade no plural ou singular (ex: `6` vira `6 unidades`, `1` vira `1 unidade`).
   - Unidades personalizadas (ex: `6 un`, `2 kg`, `3 caixas`, `4 pct`) mantêm o texto digitado e extraem o multiplicador numérico.
   - Itens já salvos no dispositivo que possuíam apenas `6` passam imediatamente a exibir `6 unidades` na interface.
2. **Cálculo de Preço Unitário e Valor Total do Item (`getItemTotalPrice`):**
   - Se o item tiver quantidade > 1 e preço unitário > 0, o card exibe:
     - Badge da quantidade: `6 unidades`
     - Badge do preço unitário: `R$ 8,00/un`
     - Badge destacado de valor total: `Total: R$ 48,00`
   - O banner de resumo no topo agora calcula com precisão a estimativa total somando o valor real de cada item ($qtd \times valor\_unitário$).
3. **Feedback Dinâmico nos Modais de Adicionar e Editar:**
   - Adicionada prévia em tempo real abaixo dos campos de Quantidade e Preço Unitário:
     `💰 Subtotal estimado: 6 unidades × R$ 8,00 = R$ 48,00`
4. **Exportação Atualizada no Google Sheets (`apps_script.gs`):**
   - A coluna de valor no relatório do Google Sheets agora grava o subtotal total do item (`c.totalPrice || getItemTotalPrice(c)`).

---

## [2026-11-04 17:47] - Remoção do Histórico, Mercado ao lado de Tarefas, Correção da Lista de Compras e Fotos com Câmera/Galeria (v2.0.3)

### 🔍 Problemas Identificados & Causa Raiz
1. **Aba "Histórico" Obsoleta e Poluição de Navegação Mobile:**
   - **Causa Raiz:** A aba Histórico ocupava espaço valioso na barra inferior (7 itens), reduzindo o alvo de toque em telas menores de celular, e tornou-se desnecessária após as melhorias na aba Tarefas.
2. **Item da Lista de Mercado Não Salvava:**
   - **Causa Raiz:** No modal `form-add-shopping-item`, o formulário lia `shopping-input-title` e passava `{ title, quantity, category, price, ... }`, enquanto `addShoppingItem()` em `js/shopping.js` validava exclusivamente `data.name`. Como `data.name` era `undefined`, disparava a exceção não tratada `Error: Digite o nome do item a comprar`, abortando o salvamento antes de persistir no estado.
3. **Fotos Restritas e Ausência de Abertura Direta da Câmera:**
   - **Causa Raiz:** Somente módulos como Carro e Reformas possuíam upload de foto genérico (sem `capture="environment"` para abrir a câmera do celular com 1 toque) e Sonhos e Mercado (itens e notas fiscais) não permitiam fotos.
4. **Posicionamento da Aba Mercado:**
   - **Causa Raiz:** A aba Mercado ficava após Sonhos e Histórico, quando a preferência do casal era que ficasse imediatamente à direita da aba Tarefas.

---

### 🛠️ Correções Implementadas
1. **Remoção Total da Aba "Histórico":**
   - Removido o botão de navegação `nav-item[data-tab="historico"]` e a seção `#tab-historico` do DOM.
   - A barra de navegação agora possui 6 abas bem dimensionadas e confortáveis para o polegar no mobile.
2. **Reorganização de Abas (Mercado ao Lado de Tarefas):**
   - Posicionada a aba `🛒 Mercado` (`data-tab="compras"`) imediatamente à direita de `🧹 Tarefas` na barra inferior e no DOM.
3. **Correção do Salvamento de Itens na Lista de Mercado:**
   - Normalizados `addShoppingItem` e `updateShoppingItem` em `js/shopping.js` para aceitar `title` ou `name`, `qty` ou `quantity`, preenchendo ambos no registro.
   - Adicionado tratamento de erro defensivo (`try/catch`) com toasts claros em `form-add-shopping-item` e `form-edit-shopping-item`.
4. **Sistema Unificado de Fotos (Câmera Nativa + Galeria):**
   - Implementados botões duplos `📸 Câmera` (`capture="environment"`) e `🖼️ Galeria` em todos os 4 módulos:
     - **Mercado:** Fotos em itens da lista de compras e em recibos/notas fiscais de compras mensais.
     - **Reformas:** Fotos de projetos e antes/depois.
     - **Carro:** Fotos de manutenções e peças.
     - **Sonhos:** Fotos de referências e inspirações para metas do casal.
   - Suporte a compressão automática no cliente (`compressImageFile` a 800px) para não sobrecarregar o `localStorage`, visualizador modal em tela cheia e exclusão individual.
5. **Atualização de Cache PWA e Versionamento:**
   - Atualizado para `v2.0.3` em `sw.js` (`maracaju-v2.0.3`), `APP_CONFIG.version` e `index.html`.

---

### 🧪 Validação Automatizada
- **Testes Unitários:** `node --test test/**/*.test.js` aprovado com 14/14 testes.
- **Testes E2E Headless Chrome (CDP):**
  - Confirmação de 6 abas na barra inferior (`tarefas`, `compras`, `carro`, `reformas`, `sonhos`, `ajustes`).
  - Ausência total da aba `historico` e `placar`.
  - Inclusão com sucesso de item de compras na lista via DOM e renderização imediata.
  - Validação da presença dos inputs com câmera (`capture="environment"`) e galeria.
  - Zero erros ou exceções no console do navegador.

---

## [2026-11-04 17:26] - Revisão e Correção Automática (/revisar)

### 🔍 Problemas Identificados & Causa Raiz
1. **Sintaxe de Módulos ES & Exportações Ausentes (`SyntaxError` em `js/config.js` e `js/ui.js`):**
   - **Causa Raiz:** Ao remover a gamificação, constantes como `BADGES`, `ROOMS`, `EFFORT_LEVELS`, `LEVELS` e `CARRO_CATEGORIES` foram removidas de `config.js`, enquanto `ui.js` ainda mantinha o import. Isso causava falha catastrófica de carregamento (`Uncaught SyntaxError`), impedindo o app de inicializar nos navegadores móveis.
2. **Exceção de Raio Negativo no Canvas de Confetti (`CanvasRenderingContext2D.ellipse`):**
   - **Causa Raiz:** Na função `triggerConfetti()`, a rotação da partícula resultava em `p.r * Math.sin(p.tilt)` negativo, disparando `IndexSizeError` e abortando a função `handleLogin()` imediatamente após o clique de acesso.
3. **Incongruência no Fluxo de Autenticação com Senha e Biometria (`js/app.js`):**
   - **Causa Raiz:** A função `handleLogin(email)` chamava internamente `loginWithEmail(email)`, que não passava a senha digitada. Logo, usuários com senha configurada ou autenticados por biometria eram barrados ou tinham suas tentativas rejeitadas silenciosamente. Além disso, o evento de submit continha código duplicado que re-verificava credenciais.
4. **Armazenamento de Cache Excessivamente Agressivo no Service Worker (`sw.js`):**
   - **Causa Raiz:** Versões anteriores utilizavam `Cache-First` estrito para todos os recursos, inclusive `index.html`, o que prendia celulares que haviam instalado a PWA em telas defasadas mesmo após novas versões serem publicadas no GitHub Pages.
5. **Tratamento de Data com Fuso Horário em `js/history.js` (`getRecentDaysSummary`):**
   - **Causa Raiz:** Quando `endDate` era fornecido no formato textual `YYYY-MM-DD`, a conversão padrão em UTC de alguns navegadores adiantava ou atrasava a data local em 1 dia.
6. **Sincronização Incompleta com a Planilha Google (`apps_script.gs`):**
   - **Causa Raiz:** A nova aba de Mercado (lista de compras e notas fiscais) ainda não possuía rotina dedicada de exportação tabular no script do Google Sheets.

---

### 🛠️ Correções Implementadas
1. **Restauração de Exportações Retrocompatíveis:**
   - Adicionadas em `js/config.js` e `js/ui.js` declarações de contingência seguras para `ROOMS`, `EFFORT_LEVELS`, `LEVELS`, `BADGES` e `renderGamificationTab`, garantindo 100% de compatibilidade entre versões de cache.
2. **Correção Geométrica no Particle Engine de Confetti:**
   - Inserido `Math.abs()` no cálculo de semi-eixos horizontal e vertical em `js/ui.js`.
3. **Unificação e Blindagem do Fluxo de Login (`js/app.js`):**
   - Refatorada a função `handleLogin(email, verifiedUser)` para centralizar login em 1 toque (sem senha), autenticação biométrica (Face ID / Digital) e login com senha/PIN individual, sem código duplicado e sem perda de contexto de usuário.
4. **Política Network-First no Service Worker & Auto-Reload (`sw.js` & `index.html`):**
   - Atualizado o cache para `maracaju-v2.0.2`.
   - Documentos (`.html`) e arquivos de código (`.js`, `.css`) agora são Network-First quando online.
   - Adicionado listener nativo no `<head>` de `index.html` para recarregar a interface automaticamente no momento em que um novo Service Worker assume o controle (`controllerchange`).
   - Adicionado botão de escape de emergência `window.forceUpdateApp()` na tela de login e em Ajustes.
5. **Tratamento Defensivo de Datas em `js/history.js`:**
   - `getRecentDaysSummary` agora sanitiza strings no formato ISO local (`YYYY-MM-DDT12:00:00`) antes de iterar os dias.
6. **Sincronização de Mercado no Google Apps Script (`apps_script.gs`):**
   - Criada a função `syncComprasSheet(ss, compras, registros)` que gera a aba visual `Mercado_Compras` no Google Sheets, detalhando compras planejadas e notas fiscais escaneadas.

---

### 🧪 Validação Automatizada
- **Execução da Suíte de Testes:** `node --test test/**/*.test.js`
- **Total de Testes:** 14 testes executados, 14 aprovados (0 falhas).
- **Novos Testes Criados:**
  - `test/imports.test.js`: Validação de integridade e ausência de erros sintáticos em 100% dos módulos ES do app.
  - `test/app.test.js` (novos casos): Validação de `getRecentDaysSummary` com strings/datas e teste completo de senhas individuais com PIN.
- **Validação E2E com Headless Chrome (CDP):**
  - Simulação de inicialização do app, carregamento do Service Worker, autenticação de morador, fechamento do Auth Gate e renderização das abas e botões de ação (FAB).

---

### 🧠 Regras & Decisões Aprendidas (Para Próximos Chats)
1. **Nome do Aplicativo:**
   - O nome oficial e estrito é **Maracaju**. **NUNCA** reintroduzir "Maracaju 88" ou "Nosso Lar" na interface ou nos textos visíveis.
2. **Gamificação e Abas Removidas:**
   - A gamificação (placar, badges, streak, níveis) e a antiga aba "Histórico" foram deliberadamente descontinuadas a pedido do casal. O app agora foca em utilidade prática com 6 abas principais: **Tarefas**, **Mercado** (ao lado de tarefas), **Carro**, **Reformas**, **Sonhos** e **Ajustes**. Não reintroduzir Placar nem Histórico.
3. **Estratégia de Cache PWA:**
   - Arquivos `.js`, `.css` e `.html` **DEVEM** sempre seguir a estratégia Network-First no Service Worker com fallback de cache. Qualquer mudança estrutural deve incrementar `CACHE_NAME` no `sw.js` e a query string `?v=...` no `index.html`.
4. **Valores Decimais Quebrados:**
   - Todos os inputs de valores financeiros devem utilizar `parseCurrency` e `formatCurrency` de `js/currency.js` para garantir centavos precisos (ex: R$ 264,33).
5. **Manutenção do MEMORY.md:**
   - Sempre que o comando `/revisar` ou `/autofix` for executado, este arquivo deve ser atualizado na raiz com o histórico fidedigno das correções.
