# Memória de Atualizações — Maracaju 88 (`maracaju88`)

**Data da última consolidação:** `02/11/2026`  
**Repositório GitHub:** [https://github.com/matheusdochapeu-hub/maracaju88](https://github.com/matheusdochapeu-hub/maracaju88)  
**App no Ar (PWA / GitHub Pages):** [https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)  
**Versão Atual:** `v1.1.0`

---

## Histórico de Versões

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
