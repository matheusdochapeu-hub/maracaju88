# Memória de Atualizações — Maracaju (`maracaju`)

**Data da última consolidação:** `04/11/2026`  
**Repositório GitHub:** [https://github.com/matheusdochapeu-hub/maracaju88](https://github.com/matheusdochapeu-hub/maracaju88)  
**App no Ar (PWA / GitHub Pages):** [https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)  
**Versão Atual:** `v2.0.1`

---

## Histórico de Versões

### Versão 2.0.1 (`04/11/2026`) — Correção Crítica de Acesso no Celular & Estratégia de Cache PWA
1. **Desbloqueio Imediato e Acesso sem Travamento:**
   - **Correção da Sessão Legada:** Adicionada verificação de chaves de autenticação de versões anteriores (`MARACAJU88_AUTH_USER_v1` e `MARACAJU_AUTH_USER_v1`) no `localStorage`. Dispositivos que já estavam conectados continuam com a sessão ativa sem deslogar.
   - **Acesso em 1 Toque Restaurado:** Tocar no perfil de **Matheus** ou **Scarlet** na tela de login realiza a entrada direta instantânea caso o usuário ainda não tenha definido uma senha pessoal em Ajustes.
   - **Correção do Fluxo de Validação:** Corrigida a validação de formulário que apresentava erro `undefined` ao submeter credenciais sem senha configurada.
   - **Biometria Segura:** Detecção assíncrona do suporte à biometria do dispositivo (`isBiometricsSupported`), evitando travamentos em navegadores sem WebAuthn ativo.

2. **Estratégia Network-First para o PWA no Celular:**
   - Atualizado o Service Worker para a versão de cache `maracaju-v2.0.1`.
   - Implementada a estratégia **Network-First** para navegação (`index.html`), garantindo que o celular sempre carregue os arquivos mais recentes publicados no GitHub Pages, sem prender a tela em versões desatualizadas ou em branco.
   - Invocado `reg.update()` automático no carregamento do app para atualização em segundo plano.

### Versão 2.0.0 (`04/11/2026`) — Nova Identidade Maracaju, Lista de Mercado & Leitor NFC-e, Senhas Individuais, Biometria e Fim da Gamificação
1. **Identidade Visual Limpa e Nome Estritamente "Maracaju":**
   - Removido "Nosso Lar" do cabeçalho do aplicativo e de todos os componentes da interface.
   - Removido o número "88" do ícone e de todas as telas. O ícone da casa agora é minimalista e acolhedor com contornos botânicos.
   - Paleta verde musgo suave e elegante (`#1b3820`, `#2e5933`, `#f4f6f1`) em todos os cards e modais.

2. **Remoção Completa da Gamificação:**
   - Removidos contadores de streak (dias seguidos), pontos de XP, níveis e badges.
   - A aba "Placar" foi completamente substituída pela aba **Mercado** (Lista de Compras & Histórico de Notas Fiscais).

3. **Nova Aba Mercado & Lista de Compras do Casal (`js/shopping.js`, `#tab-compras`):**
   - Lista colaborativa para Matheus e Scarlet anotarem itens de supermercado conforme forem lembrando durante o mês.
   - Registro de quantidade, categoria com emoji, preço unitário/estimado, quem lembrou e notas.
   - Checkbox para marcar itens comprados e botão para limpar comprados mantendo histórico.
   - Painel com contagem de itens pendentes e estimativa total de gastos do mês.

4. **Leitor de QR Code de Nota Fiscal (NFC-e) & Compras Mensais (`js/nfce.js`, `#modal-qr-scanner`):**
   - Scanner de câmera com guia visual e linha laser animada para ler o QR Code impresso no cupom fiscal.
   - Opção alternativa para carregar foto do QR Code da galeria ou colar a URL / chave de 44 dígitos.
   - Extração automática de:
     - Supermercado (detecção inteligente de CNPJs de grandes redes: Pão de Açúcar, Carrefour, Atacadão, Assaí, etc.)
     - Data e hora exatas da compra
     - Valor total com centavos
     - Chave de acesso da nota fiscal
   - Separação e agrupamento automático das compras por mês, com total acumulado por período.

5. **Suporte Universal a Valores "Quebrados" com Centavos (`js/currency.js`):**
   - Todas as categorias e campos monetários aceitam valores fracionados com centavos (ex: `R$ 264,33`, `264,33` ou `264.33`).
   - Aplicado em Mercado, Carro, Reformas e Mural dos Sonhos.
   - Inputs configurados com `inputmode="decimal"` evitando rejeição de vírgulas em teclados mobile.

6. **Definição de Categorias Personalizadas e Emojis de Filtro (`js/categories.js`):**
   - Criação, edição e exclusão de categorias personalizadas com emojis para:
     - 🧹 Tarefas do Lar
     - 🛒 Mercado & Compras
     - 🚗 Carro & Manutenção
     - 🔨 Reformas & Melhorias
     - ✨ Mural dos Sonhos
   - Seletor de emojis rápidos e pré-visualização em tempo real do chip.

7. **Edição Completa de Tarefas do Lar (`#modal-edit-task`):**
   - Botão ✏️ em cada tarefa da lista.
   - Permite editar título, cômodo/categoria, responsável padrão, instruções e alterar periodicidade (Diária, Semanal, Mensal ou Anual).

8. **Autenticação Aperfeiçoada com Senhas Individuais & Biometria do Celular (`js/auth.js`):**
   - Senhas ou PINs independentes configuráveis para Matheus e para Scarlet na aba Ajustes.
   - Suporte a desbloqueio nativo por biometria do aparelho (Face ID, Touch ID / Digital ou bloqueio de tela via WebAuthn).
   - Tela de login com seleção de morador, alternador de visualização de senha e botão de biometria.

9. **UX Refinado & Posicionamento Flutuante dos Botões de Ação (FAB):**
   - Botões de adição posicionados no canto inferior direito para acesso fácil com o polegar.
   - Modais uniformes com design botânico e responsivo.
   - Service Worker atualizado para `maracaju-v2.0.0` com cache offline completo.
   - 11 testes automatizados em `test/app.test.js` com 100% de sucesso.

---

## Histórico de Versões

### Versão 1.3.3 (`02/11/2026`) — Reorganização da Barra de Navegação: Histórico ao lado de Placar e Ajustes
1. **Nova Ordem das Abas no Menu e Conteúdo:**
   - A aba **Histórico** (📅) foi movida para ficar ao lado de **Placar** (🏆) e vizinha de **Ajustes** (⚙️). Com isso, as 4 abas ativas de projetos e cuidados da casa ficam unidas no início:
     1. 🧹 **Tarefas** (Rotinas divididas por ciclos)
     2. 🚗 **Carro** (Manutenção do veículo, fotos e links de peças)
     3. 🔨 **Reformas** (Projetos da casa, orçamentos, fotos e links)
     4. ✨ **Sonhos** (Mural de sonhos e metas a dois)
     5. 🏆 **Placar** (Gamificação, pontuação e conquistas)
     6. 📅 **Histórico** (Verificação e auditoria diária de tarefas)
     7. ⚙️ **Ajustes** (Controle de sessão, moradores e Google Sheets)
2. **Sincronia do DOM e Service Worker:**
   - `index.html`: Reordenada a barra `<nav class="bottom-nav">` e as seções `<section id="tab-...">`.
   - `sw.js` e `config.js`: Versão de cache atualizada para `v1.3.3` para forçar recarregamento transparente no celular.

### Versão 1.3.2 (`02/11/2026`) — Botões de Criação Flutuantes no Canto Inferior Direito (FAB)
1. **Migração dos Botões de Adição para Floating Action Buttons (FAB):**
   - Os botões de criação foram transferidos dos cabeçalhos das seções para o canto inferior direito da tela, facilitando o alcance ergonômico com uma mão no celular:
     - Aba Tarefas: `[＋ Nova Tarefa]`
     - Aba Carro: `[＋ Nova Manutenção]`
     - Aba Reformas: `[＋ Nova Reforma]`
     - Aba Sonhos: `[＋ Novo Sonho]`
2. **Estilização e Experiência Mobile-First:**
   - Formato pílula elegante com gradiente Verde Musgo (`#1b3820` a `#2e5933`), borda translúcida, ícone `＋` em dourado suave (`#fcd34d`) e sombra com elevação natural.
   - Posicionamento fixo `fixed` inteligente (`bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 16px) + 1.25rem)`), flutuando confortavelmente acima da barra inferior de navegação.
   - Alinhamento adaptativo para telas grandes (`max(1.25rem, calc((100vw - var(--max-content-width)) / 2 + 1.25rem))`).
   - Aumento do respiro inferior da página (`padding-bottom: +5.5rem`) para assegurar que nenhum cartão ou lista seja encoberto pelo botão flutuante ao rolar até o fim.
   - Reposicionamento dos avisos toast para não sobrepor o botão de ação.
   - Animação de transição de abas via `tabFadeIn` pura, mantendo o botão perfeitamente ancorado sem solavancos visuais.

### Versão 1.3.1 (`02/11/2026`) — Remoção do "88" do Nome do App e do Ícone da Casa
1. **Remoção do "88" da Identidade Visual e Ícones:**
   - `icons/icon.svg`: Removido o badge circular vermelho com o número "88". O ícone da casa agora exibe um desenho limpo, acolhedor e minimalista com porta em arco e coração sutil em verde sobre a entrada, harmonizado com a nova paleta verde musgo claro.
   - `scripts/generate-icons.ps1`: Script PowerShell de geração de bitmaps atualizado para remover o badge numérico 88 e renderizar os novos ícones com acabamento nítido e antialiasing.
   - Ícones regenerados com sucesso: `icon-512.png`, `icon-192.png`, `apple-touch-icon.png`, `favicon.png` e `favicon.ico`.
2. **Atualização do Nome do Aplicativo para "Maracaju":**
   - Nome atualizado de "Maracaju 88" para "Maracaju" em todas as telas, cabeçalhos, títulos (`<title>`, `<meta apple-mobile-web-app-title>`), tela de autenticação restrita, modais de ajuda e instruções de instalação PWA.
   - `manifest.json`: Atualizado para `"name": "Maracaju - Gestão do Lar"` e `"short_name": "Maracaju"`.
   - `js/config.js`: `APP_CONFIG.appName = "Maracaju"`, título do nível 5 atualizado para `"Reis do Maracaju"`, e migração transparente de dados mantida via `legacyStorageKeys` garantindo zero perda de tarefas salvas.
   - `js/ui.js` e `js/app.js`: Mensagens de boas-vindas, toasts e painel de XP atualizados para "Maracaju".
   - `sw.js`: Versão de cache atualizada para `maracaju-v1.3.1` forçando atualização imediata nos navegadores e celulares instalados.

### Versão 1.3.0 (`02/11/2026`) — Fotos e Links em Reformas, Novo Visual Verde Musgo Claro & Correções de UX
1. **Fotos e Links na Aba Reformas (`reformas.js`, `ui.js`, `app.js`):**
   - **Galeria de Fotos da Reforma:** Anexe fotos do "antes e depois", referências de Pinterest/Instagram ou notas fiscais de materiais tiradas diretamente com a câmera do celular ou da galeria.
   - **Compressão Automática Client-Side:** Imagens redimensionadas para WebP/JPEG leve de até 800px (~40-70KB) para garantir velocidade instantânea e não sobrecarregar a memória do navegador.
   - **Visualizador Ampliado:** Clique na miniatura de qualquer foto para abrir o modal de visualização em tela cheia (`modal-photo-viewer`).
   - **Links e Lojas Externas:** Adicione links para compras e referências (Leroy Merlin, Mercado Livre, tutoriais de DIY no YouTube) com tags clicáveis e botão de exclusão.
   - **Formulário de Cadastro Expandido:** O modal de nova reforma (`modal-add-reforma`) agora permite incluir fotos e links já no momento do cadastro inicial.

2. **Identidade Visual Verde Musgo Claro & Orgânico Botânico (`variables.css`, `base.css`, `components.css`):**
   - **Paleta Refinada e Confortável:**
     - Fundo suave estilo linho/sage claro (`#f4f6f1`) para leitura repousante sob qualquer iluminação.
     - Cartões em branco puro (`#ffffff`) com contornos sutis de verde musgo (`rgba(46, 89, 51, 0.12)`) e elevação natural.
     - Cabeçalho superior em gradiente Verde Musgo Nobre profundo (`#1b3820` a `#29532e`) com tipografia branca nítida e detalhes em dourado e verde claro.
     - Barra de navegação inferior em branco translúcido (`rgba(255, 255, 255, 0.96)`) com desfoque de fundo e realce ativo em verde musgo.
   - **Tipografia e Contraste:** Textos escuros em tom floresta profunda (`#19331d`) proporcionando legibilidade impecável e atmosfera acolhedora de lar.

3. **Correções Abrangentes de UX (Experiência do Usuário):**
   - **Espaçamento e Scroll no Mobile:** Ajustado o padding inferior (`calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 20px) + 2rem)`) eliminando o corte de botões e cartões inferiores pela barra de navegação no iPhone e Android.
   - **Controles Segmentados Touch-Friendly:** Botões de frequência e cômodos com rolagem horizontal suave sem scrollbar visível e áreas de toque mínimas de 44px/48px.
   - **Checkboxes Gamificados Aperfeiçoados:** Checkbox circular com feedback tátil, animação suave de marcação e efeito de conclusão sutil.
   - **Cards de Status e Orçamento Mais Claros:** Badges de status coloridos com bordas suaves e caixas de estimativa de custo vs gasto real destacadas.
   - **Transição Suave nos Modais:** Modais com backdrop blur escurecido suave e cantos arredondados modernos (`var(--radius-xl)`).

4. **Sincronização no Google Sheets (`apps_script.gs`):**
   - Atualizada a função `syncReformasSheet` para incluir as colunas `Links` e `Qtd Fotos`, mantendo a planilha do casal 100% alinhada com as informações de reformas.

5. **Testes Automatizados:**
   - Adicionada suíte de testes cobrindo inclusão e remoção de fotos e links em reformas em `test/app.test.js`. 7 testes executando com 100% de aprovação.

---

### Versão 1.2.0 (`02/11/2026`) — Controle de Acesso Restrito (Matheus & Scarlet)
1. **Portão de Entrada com Validação de E-mail (`js/auth.js`, `#auth-gate`):**
   - **Acesso Estritamente Restrito:** Aplicativo configurado com lista de moradores autorizados:
     - 👨‍💻 **Matheus:** `matheusdochapeu@gmail.com` (com suporte a alias tolerante a digitação `matheusdochpaeu@gmail.com`).
     - 👩‍💼 **Scarlet:** `scarletsantos7@gmail.com` (validação case-insensitive).
   - **Bloqueio de E-mails Não Cadastrados:** Qualquer outro endereço é rejeitado com mensagem explicativa em português e animação de alerta visual.
   - **Atalho Rápido de 1 Toque (Otimizado para Celular):** Botões estilizados para Matheus e Scarlet entrarem diretamente em seus respectivos perfis no celular sem atrito de digitação no teclado touch.
   - **Validação Manual por Input:** Campo de digitação de e-mail com verificação em tempo real e botão "🔑 Entrar no Maracaju 88".

2. **Gerenciamento Seguro de Sessão & Desconexão:**
   - **Persistência Local (`localStorage`):** Sessão mantida em chave segura `MARACAJU88_AUTH_USER_v1`, garantindo que no celular o app abra direto após o primeiro acesso.
   - **Verificação de Integridade:** Toda inicialização do app checa se o e-mail gravado na sessão permanece na lista de autorizados antes de liberar o acesso.
   - **Card de Sessão Ativa na Aba Ajustes:** Mostra quem está conectado (avatar, nome e e-mail) e botão destacado `🚪 Sair / Trocar Usuário`.
   - **Troca de Perfil no Cabeçalho:** Alternância rápida entre Matheus e Scarlet preservando o estado e pontuando o XP correto.

3. **Padronização dos Perfis dos Moradores:**
   - Remoção de menções genéricas a "Esposa", atualizando todo o sistema para o nome oficial **Scarlet** (`👩‍💼`).
   - Compatibilidade retroativa mantida nas funções de histórico, pontuação e tarefas (`tasks.js`, `history.js`, `ui.js`).
   - Atualização do script `apps_script.gs` para definir Scarlet por padrão na planilha Google Sheets.

4. **Service Worker & PWA:**
   - Cache elevado para `maracaju88-v1.2.0`.
   - Inclusão do módulo `./js/auth.js` na lista de cache offline (`ASSETS_TO_CACHE`).

5. **Testes Unitários Automatizados:**
   - Adicionada suíte de testes de autenticação em `test/app.test.js`:
     - Normalização de e-mails (trimming e lowercase).
     - Validação de e-mail primário e alias de Matheus.
     - Validação de e-mail de Scarlet (com variações de maiúsculas/minúsculas).
     - Bloqueio estrito de e-mails desconhecidos e entradas vazias.
   - 7 suítes de testes executando e passando 100% com `node --test`.

---

### Versão 1.1.0 (`02/11/2026`) — Tarefas Periódicas, Módulo do Carro & PWA Mobile
1. **Facilidade de Instalação no Celular (PWA Mobile):**
   - **Botão `📲 Instalar App` no Topo:** Captura o evento nativo `beforeinstallprompt` em navegadores Android/Chromium para acionar o diálogo nativo do sistema com 1 toque.
   - **Guia Ilustrado para iPhone e Android (`modal-install-guide`):** Modal com instruções claras e didáticas para instalação no Safari do iOS (Compartilhar ➔ Adicionar à Tela de Início) e no Chrome do Android (Menu ➔ Instalar aplicativo).
   - **Ajustes de Manifesto (`manifest.json`):** Adicionadas entradas explícitas com `purpose: "any"` e `purpose: "maskable"`, `id: "/maracaju88/"` e `prefer_related_applications: false`.
   - **Cache Resiliente no Service Worker (`sw.js`):** Uso de `Promise.all` com `.catch()` individual em `ASSETS_TO_CACHE` para que nenhuma falha pontual de asset interrompa o registro do SW.

2. **Divisão das Tarefas por Periodicidade (Aba 1 — `tasks.js`, `ui.js`):**
   - **Barra Segmentada no Topo:** `☀️ Diárias`, `📅 Semanais`, `🗓️ Mensais` e `🎯 Anuais`, com contadores dinâmicos de progresso em cada ciclo (`X/Y concluídas`).
   - **Ciclos Temporais Inteligentes:**
     - Tarefas **Diárias:** Avaliadas no dia corrente (`YYYY-MM-DD`).
     - Tarefas **Semanais:** Avaliadas na semana corrente (segunda a domingo).
     - Tarefas **Mensais:** Avaliadas no mês corrente (`YYYY-MM`).
     - Tarefas **Anuais:** Avaliadas no ano corrente (`YYYY`).
   - **Filtro Secundário por Cômodos:** Possibilidade de combinar frequência com cômodos (ex: "Tarefas Semanais da Cozinha").
   - **Novas Tarefas Pré-Configuradas:** Lista expandida cobrindo desde rotinas do dia a dia até manutenções anuais (cortinas, calhas, caixa d'água, sofás).

3. **Nova Aba: 🚗 Carro & Manutenção (`js/carro.js`, `ui.js`):**
   - **Controle Completo do Veículo:**
     - Categorias: 🛢️ *Revisão & Óleo*, 🔧 *Mecânica Geral*, 🛞 *Pneus & Freios*, ✨ *Estética & Lavagem*, 🔌 *Elétrica & Acessórios*.
     - Filtros por categoria e por status (Pendente, Orçamento, Em Andamento, Concluído).
   - **Fotos com Compressão Automática Client-Side (`compressImageFile`):**
     - Permite tirar foto da peça/manutenção direto com a câmera do celular ou subir da galeria.
     - Redimensionamento inteligente via Canvas (máximo 800px e qualidade 72%) gerando imagens leves (~40-70KB) para não estourar os limites de armazenamento local e sincronização.
     - Modal de ampliação de fotos ao clicar na miniatura.
   - **Links de Peças e Referências:**
     - Adição de links externos (Mercado Livre, lojas de peças, tutoriais do YouTube) com abertura em nova aba e botão de exclusão.
   - **Controle de KM e Orçamentos:**
     - Acompanhamento de KM atual vs KM alvo, prazo de realização, custo estimado e custo real investido.
     - Checklists de etapas para cada manutenção.

4. **Atualização da Sincronização Google Sheets (`apps_script.gs`, `sheets.js`):**
   - Criação da aba `Carro` na planilha Google pessoal, sincronizando todas as manutenções, status, orçamentos, KM e links.
   - Coluna de Frequência incluída nas abas `Tarefas` e `Historico_Log`.

5. **Testes Automatizados:**
   - 6 suítes de testes unitários validadas com 100% de sucesso (`node --test test/app.test.js`).

---

### Versão 1.0.0 (`01/11/2026`) — Lançamento Inicial do Maracaju 88
- Criação do repositório no GitHub (`matheusdochapeu-hub/maracaju88`) e ativação do GitHub Pages.
- Arquitetura PWA modular em abas (Tarefas, Histórico, Reformas, Sonhos, Placar, Ajustes).
- Sistema de gamificação (XP, níveis do casal, streak de dias seguidos, comemoração com confetti e sons via Web Audio API).
- Auditoria e verificação diária dia a dia no Histórico.
- Script de integração com Google Sheets (`apps_script.gs`).
- Testes unitários com Node Test Runner e workflow de CI no GitHub Actions.
