# Memória de Atualizações — Maracaju (`maracaju88`)

**Data da última consolidação:** `02/11/2026`  
**Repositório GitHub:** [https://github.com/matheusdochapeu-hub/maracaju88](https://github.com/matheusdochapeu-hub/maracaju88)  
**App no Ar (PWA / GitHub Pages):** [https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)  
**Versão Atual:** `v1.3.1`

---

## Histórico de Versões

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
