# Memória de Atualizações — Maracaju 88 (`maracaju88`)

**Data da última consolidação:** `02/11/2026`  
**Repositório GitHub:** [https://github.com/matheusdochapeu-hub/maracaju88](https://github.com/matheusdochapeu-hub/maracaju88)  
**App no Ar (PWA / GitHub Pages):** [https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)  
**Versão Atual:** `v1.2.0`

---

## Histórico de Versões

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
