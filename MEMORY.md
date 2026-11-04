# MEMORY.md — Memória Persistente do Projeto Maracaju

Este arquivo consolida a memória técnica, auditorias de código, regras arquiteturais e histórico de resoluções de problemas para que futuras sessões e agentes de IA mantenham a integridade e estabilidade do aplicativo.

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
2. **Gamificação:**
   - A gamificação (placar, badges, streak, níveis) foi deliberadamente descontinuada a pedido do casal. O app agora foca em utilidade prática: Tarefas, Histórico, Carro, Reformas, Sonhos, Mercado e Ajustes. Não reintroduzir a aba Placar.
3. **Estratégia de Cache PWA:**
   - Arquivos `.js`, `.css` e `.html` **DEVEM** sempre seguir a estratégia Network-First no Service Worker com fallback de cache. Qualquer mudança estrutural deve incrementar `CACHE_NAME` no `sw.js` e a query string `?v=...` no `index.html`.
4. **Valores Decimais Quebrados:**
   - Todos os inputs de valores financeiros devem utilizar `parseCurrency` e `formatCurrency` de `js/currency.js` para garantir centavos precisos (ex: R$ 264,33).
5. **Manutenção do MEMORY.md:**
   - Sempre que o comando `/revisar` ou `/autofix` for executado, este arquivo deve ser atualizado na raiz com o histórico fidedigno das correções.
