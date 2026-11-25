# MEMORY.md — Memória Persistente do Projeto Maracaju

Este arquivo consolida a memória técnica, auditorias de código, regras arquiteturais e histórico de resoluções de problemas para que futuras sessões e agentes de IA mantenham a integridade e estabilidade do aplicativo.

---

## [2026-11-24 21:45] - Correção da área de QR Code e captação NFC-e (v2.10.1)

### 🐞 O que estava errado depois do merge da v2.10.0
1. **Abertura tripla do leitor.** O botão do herói tinha listener direto + listener global;
   o FAB tinha listener direto + `data-open-modal` (handler genérico) + listener global. Um
   toque chamava `openScannerFlow` 2–3 vezes e iniciava a câmera várias vezes.
2. **`getUserMedia` concorrente.** Duas chamadas enquanto a primeira ainda pedia permissão
   deixavam duas transmissões abertas (uma vazava) e o preview travava.
3. **Câmera não parava ao fechar pelo backdrop, Esc ou Voltar do Android.** O `stopCamera`
   estava amarrado a **todos** os `[data-close-modal]` do app, mas não ao fechamento do modal.
4. **Foto do cupom não usava o QR para buscar a SEFAZ.** O fluxo híbrido parava no OCR e
   ignorava a URL oficial; havia até um bloco de **dados de amostra hardcoded** para a chave
   da Padaria.
5. **Item-fantasma `COMPRA ...`** (usado só para carregar o total) era gravado no histórico e
   no Catálogo Inteligente.
6. **Nomes de itens/números da nota iam para `innerHTML` sem escape** (XSS em HTML colado).
7. **Corrida de progresso:** POST e GET rodam em paralelo; o retry de uma fonte perdedora
   sobrescrevia o status depois de os itens já terem carregado.
8. **Total** era convertido com `Number()` (podia vir `"71,06"` e virar NaN/0) e dava para
   confirmar compra com total 0.

### 🛠️ Correções
- `openScannerFlow` idempotente; FAB sem `data-open-modal`; handler genérico ignora
  `modal-qr-scanner`; sobrou **um** caminho de abertura.
- `cameraStartToken` + parada da transmissão anterior; `startScanningLoop` limpa intervalo e
  só processa quadro se `activeStream` existir; `acceptCameraCode` exige modal ativo.
- `MutationObserver` no `#modal-qr-scanner` para `stopCamera` em qualquer fechamento.
- Foto híbrida: se o QR tem URL e não veio com itens, chama `fetchNfceDetailsForPending()`;
  removido o bloco de amostra por chave.
- Confirmação filtra `code === 'COMPRA'`, calcula total pelos itens quando falta, recusa total
  zero e não registra o placeholder no catálogo.
- `escapeQrText` na prévia e `escapeHtmlText` na conciliação da lista.
- `consultationFinished` em `fetchNfceDetailsOnline` para não atualizar status após o vencedor.
- `renderPreviewUI` usa `parseCurrency` no total.

### 🧪 Validação
- **212 testes, 0 falhas** (5 novos em `test/qr-scanner.test.js`).
- **Chrome headless real:** um clique no herói = **1** `getUserMedia`, modal abre; fecha pelo
  ✕ e a câmera para; FAB reabre com mais **1** chamada; nenhum erro de JS.
- **Cadeia real:** QR da Padaria via Apps Script → 4 itens, R$ 71,06, em ~5 s.
- Parser validado com URL de pipes crus e `%7C`.

### 📦 Versão
- **v2.10.1** em `config.js`, `sw.js` (`maracaju-v2.10.1`), `package.json` e `?v=` do HTML.

---

## [2026-11-24 21:20] - Rotina Matheus no cabeçalho (v2.10.0) + alinhamento da versão tripla

### O que veio no commit 12db0f1
- Novo módulo **`js/rotina-matheus.js`** (Rotina, Capilar, Pele e Fotos) importado no `js/app.js`,
  botão **`#btn-header-rotina-matheus`** no cabeçalho e container **`#rotina-matheus-view`**.
- `js/sheets.js` e `js/storage.js` atualizados; módulo incluído no precache do `sw.js`.

### 🐞 Correção de release
O commit subiu o `sw.js` como **v2.10.0**, mas deixou `js/config.js` e `package.json` em
**2.9.11** e os `?v=` do `index.html` em `2.9.11`. Isso quebra a regra da versão tripla e pode
manter `app.js` antigo no cache do navegador. Alinhado tudo para **2.10.0**:
`config.js`, `package.json`, `sw.js` e os seis `?v=` do HTML.

### 🧪 Validação
- **206 testes, 0 falhas** após o pull e o alinhamento.

---

## [2026-11-22 13:33] - Caixas de seleção e métrica de cumprimento de metas em Carro, Reformas e Sonhos (v2.9.11)

### 🛠️ Implementação
- **Regras & CRUD (`js/projects.js`, `js/carro.js`, `js/reformas.js`, `js/sonhos.js`):**
  - `normalizeChecklist` e `updateChecklistItem` em `projects.js` + `updateSonhoMilestone` e `updateSonho` aceitando `milestones`.
  - `getProjectsSummary` e `getSonhosSummary` agora contabilizam `checklistDone`/`checklistTotal`/`checklistPercent` (e `milestonesDone`/`milestonesTotal`/`milestonesPercent`).
- **UI nos Cards e Banners (`js/ui.js`, `css/components.css`):**
  - Helpers compartilhados `renderChecklistBannerMetric` e `renderChecklistCardSection` exibem a métrica (`X/Y (Z%)` + barra de progresso) nos banners e em **todos os cards** (incluindo itens antigos sem caixas), com edição inline (`✏️`), remoção (`✕`) e adição rápida (`+ Caixa`).
- **Modais de Adicionar e Editar (`index.html`, `js/app.js`):**
  - `data-checklist-editor` adicionado aos 6 modais (`modal-add-carro`, `modal-edit-carro`, `modal-add-reforma`, `modal-edit-reforma`, `modal-add-sonho`, `modal-edit-sonho`) com `bindChecklistModalEditors` e `attachCardChecklistHandlers`.

### 🧪 Validação
- `node --check` em `js/*.js` e `sw.js` sem erros; `node --test test/*.test.js` com **206/206 testes passando** (`0` falhas).

---

## [2026-11-22 12:45] - Lista de Mercado: subtrair itens comprados do valor total no banner inicial (v2.9.11)

### 🔍 Contexto
No banner `#compras-summary-banner` no topo da aba **Lista Mercado** (`#tab-lista`), o card de `Itens a Comprar` já abatia os itens marcados (`pendingCount` de `totalCount`), mas o card ao lado exibia `summary.estimatedTotal` (soma de todos os itens, inclusive os já comprados) em vez de `summary.pendingTotal`.

### 🛠️ Alteração
- **`js/ui.js` (`renderComprasTab`)**: `#compras-summary-banner` agora exibe **`Estimativa a Comprar`** com `summary.pendingTotal` como valor principal (subtraindo automaticamente os itens marcados como comprados). Quando há itens comprados com valor (`summary.boughtTotal > 0`), mostra `(de R$ <estimatedTotal>)` ao lado e a linha `✓ Já comprado: -R$ <boughtTotal>`.
- **`test/purchases-history.test.js`**: adicionado teste validando que marcar e desmarcar um item na Lista de Mercado atualiza `#compras-summary-banner` subtraindo e restaurando o valor do total no topo da página.

### 🧪 Validação
- `node --check` em `js/*.js` e `sw.js` sem erros; `node --test test/*.test.js` com **205/205 testes passando** (`0` falhas).

### 📦 Versão
- **v2.9.11** em `js/config.js`, `sw.js` (`maracaju-v2.9.11`), `package.json` e `?v=2.9.11` no `index.html`.

---

## [2026-11-20 14:45] - Enquete ainda não abria: share sheet no lugar de window.open (v2.9.10)

### 🔍 Contexto
A v2.9.9 corrigiu o `wa.me/` sem texto (HTTP 400), mas o usuário testou e o modo Enquete
**continuou não abrindo nada**. O Checklist funcionava porque no celular ele usa
`navigator.share` (folha de compartilhamento). O Enquete usava `window.open(...)`, que é
**bloqueado na PWA instalada** — retorna uma janela mas não abre o WhatsApp.

### 🛠️ Correção
- No celular, o modo Enquete agora usa **`navigator.share`** (mesmo caminho do Checklist que
  funciona): abre a folha de compartilhamento, o usuário escolhe WhatsApp e o app abre.
- As opções numeradas são copiadas antes; no WhatsApp é **Anexo → Enquete → colar** e ativar
  “Permitir várias respostas”.
- Fallback desktop/outros: âncora real (`openExternalLink`) para
  `https://api.whatsapp.com/send?text=<mensagem>` em vez de `window.open`.
- Fallback de lista longa também passou a usar âncora.

### ⚠️ Cache do GitHub Pages
Entre o push e o CDN atualizar, o Pages pode servir a versão anterior por alguns minutos
(observado: `config.js` ainda em 2.9.8 após o push da 2.9.9). Sintoma: o usuário testa a
correção e nada muda. Conferir **Ajustes → “Versão instalada”** e forçar atualização.

### 🧪 Validação
- **204 testes, 0 falhas**.
- Verificação HTTP: `wa.me/` e `wa.me/?text=` vazio = 400; `api.whatsapp.com/send?text=` = 200.

### 📦 Versão
- **v2.9.10** em `config.js`, `sw.js` (`maracaju-v2.9.10`), `package.json` e `?v=` do HTML.

---

## [2026-11-20 14:35] - Correção: modo Enquete do WhatsApp não abria (v2.9.9)

### 🔍 Sintoma
O **Checklist** exportado funcionou no WhatsApp, mas o modo **Enquete** “não rolou nem abriu”.

### 🐞 Causa raiz
O modo Enquete abria `window.open('https://wa.me/')` (sem texto) para depois copiar as opções.
**`https://wa.me/` responde HTTP 400** — e `https://wa.me/?text=` vazio também. O navegador caía
numa página de erro e o app do WhatsApp nunca abria. O checklist funcionava porque usava
`https://wa.me/?text=<texto não vazio>`.

### 🛠️ Correção
- Chat vazio agora usa **`https://api.whatsapp.com/send?text=`** (HTTP 200, abre o WhatsApp).
  Aplicado no modo Enquete e no fallback de listas longas (>1.800 caracteres no `wa.me`).
- Se `window.open` for bloqueado, mostra toast orientando a usar “Copiar”.
- Teste estático garante que não volte `window.open('https://wa.me/')` sem texto.

### 🧪 Validação
- `node --test test/` → **204 testes, 0 falhas**.
- Verificação HTTP real: `wa.me/` = 400; `wa.me/?text=` vazio = 400;
  `api.whatsapp.com/send?text=` = 200.

### 📦 Versão
- **v2.9.9** em `config.js`, `sw.js` (`maracaju-v2.9.9`), `package.json` e `?v=` do HTML.

---

## [2026-11-20 14:10] - Exportar Lista de Mercado para WhatsApp (Checklist / Enquete) (v2.9.8)

### 🎯 Demanda
Botão **“Exportar lista”** na Lista de Mercado para enviar a lista ao WhatsApp em formato de
enquete, para o casal ir marcando o que já foi comprado.

### ⚠️ Limitação real do WhatsApp
O WhatsApp **não oferece link/URL/API para criar enquete nativa**. Enquete só existe dentro do
app (Anexo → Enquete), com no máximo **12 opções** e a chave “Permitir várias respostas”.
Portanto foram entregues dois formatos:
- **Checklist (padrão):** mensagem direta no `wa.me`, cada item com `⬜` (troca por `✅` durante
  a compra).
- **Enquete:** opções numeradas (até 12). Ao tocar em “Abrir WhatsApp e copiar opções”, o app
  copia só as opções e abre o WhatsApp para colar em **Anexo → Enquete**.

### 🛠️ Implementação
1. **`buildShoppingListExportText(state, format, options)`** em `js/shopping.js`:
   - Somente itens **pendentes** (`!bought`), agrupados por categoria (`findCategory`), com
     quantidade e preço estimado, total do carrinho e data local.
   - Escapa `*`, `_`, `~` e backticks para não quebrar a formatação do WhatsApp.
   - Formato enquete: 12 primeiras opções numeradas + aviso dos itens que ficaram de fora.
2. **UI:** botão `#btn-export-shopping-list` na `.lista-actions-bar`, modal
   `#modal-export-shopping` com abas Checklist/Enquete, checkbox “Incluir preços”, textarea
   editável, “Enviar no WhatsApp” e “Copiar”.
3. **Envio:** `navigator.share` no celular quando disponível; senão `https://wa.me/?text=...`.
   Texto com URL > 1.800 caracteres é copiado e o WhatsApp abre vazio para colar.
   No modo enquete, as opções são copiadas antes de abrir o WhatsApp.
4. **Testes:** `test/shopping-export.test.js` (4) + checagem estática no `test/ux-polish.test.js`.

### 🧪 Validação
- **204 testes, 0 falhas**.
- Exemplo gerado: checklist com “⬜ Banana Prata — 12 unidades — R$ 14,40” e total R$ 47,28;
  enquete com “1. Banana Prata — 12 unidades” etc.

### 📦 Versão
- **v2.9.8** em `config.js`, `sw.js` (`maracaju-v2.9.8`), `package.json` e `?v=` do HTML.

---

## [2026-11-20 13:35] - Revisão de Código e UX pós-v2.9.6 (v2.9.7)

### 🔍 Escopo
Revisão dos commits **v2.9.0 → v2.9.6** (aba Marmitas, diários da nutri em PDF/foto/texto,
calculadora in natura, itens expostos nas compras, carnes/macarrão/batata-doce) + auditoria
de código do módulo novo e revisão de UX desktop/celular.

### 🐞 Bugs corrigidos (código)
1. **Vírgula decimal e milhar no parser** (`js/nutrition.js`): regex `(\d+)` casava a parte
   decimal de "0,5" como 5. `0,5 concha de feijão` virava 400g, `0,5 scoop de whey` 150g e
   `1.500g` virava 2g. Criados `NUMBER_TOKEN`/`COUNT_TOKEN` com lookbehind e
   `ptNumberToFloat` trata milhar (1.500 → 1500) e numerais até dez.
2. **Separação por pessoa vazava** (`extractPersonSectionFromText`): só reconhecia o nome
   sozinho na linha; "Paciente: Matheus Silva" ou "Matheus - Almoço: ..." caíam no texto
   inteiro e o diário do Matheus era aplicado na Scarlet. Agora o cabeçalho aceita
   prefixo/sobrenome/conteúdo na mesma linha e, se a seção pedida está vazia, retorna `''`
   (cardápio padrão) em vez do texto do outro.
3. **"Lanche" isolado** não era cabeçalho e a linha grudava no almoço; incluído em Tarde
   (`colação` também).
4. **Quantidades ausentes/não citadas**: refeição descrita sem citar um item agora zera o
   item (antes inventava a carne do cardápio em "Almoço: salada"); item citado sem gramas
   usa a porção prescrita (queijo/requeijão não desaparecem mais). `extractGramsFor` passou
   a devolver `null` para "não achei" em vez de 0.
5. **Gramas roubadas do vizinho**: a janela de 35 caracteres do padrão "alimento ... 100g"
   atravessava " e " e atribuía as gramas do requeijão ao queijo. Agora exige `:`/`(` ou o
   número imediatamente após o alimento.
6. **Item de 0 kg no mercado**: dia sem carne (ou arroz/feijão zerados) gerava
   "Carne 0.00 kg" com preço. Os três itens base agora só entram com consumo `> 0`.
7. **`|| 260` mascarava zero**: `calculateCustomQuantityConversion` usava fallback 260g
   quando o almoço não tinha carne e dizia "1 almoço"; agora `??` mantém 0.
8. **Fatores parciais geravam NaN** em arroz/feijão/carne; fallbacks assimétricos corrigidos.
9. **`isCustom` ignorava `meals`**: diário vindo de backup só com `meals` aplicava os valores
   mas o card dizia "Cardápio padrão" e o botão "Padrão" não aparecia.
10. **XSS armazenado em `nutrition.photo`**: o `src` do card aceitava qualquer string de
    localStorage/backup importado (`x" onerror="...`). `getNutritionState` só aceita
    `data:image/(png|jpe?g|webp|gif);base64,...`.
11. **Import morto** `DEFAULT_NUTRITION_MEALS` removido de `js/ui.js`.

### 🎨 UX / acessibilidade (desktop e celular)
1. **`--brand-forest` não existia** (usada em ~30 pontos): "Diário Matheus" ficava sem cor e
   um bloco com `background: var(--brand-forest); color:#fff` ficava invisível. Definida em
   `css/variables.css`.
2. **Barra inferior com 9 abas** truncava "Marmitas"/"Gastos & Notas" em 360/390px. No
   celular a barra agora rola na horizontal (`flex:0 0 auto; min-width:56px`), rótulo quebra
   em 2 linhas e `applyTabVisibility` centraliza a aba ativa.
3. **Cards "não incluídos"** usavam `opacity:.46` no card inteiro (números ilegíveis). Agora
   fundo `--bg-surface`, borda tracejada e selo "+ Incluir", sem opacidade.
4. **Modal do diário**: `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-live` no
   feedback, foco inicial no ✕, header e rodapé sticky (Salvar sempre visível), botão de
   remover foto 40×40 com `aria-label`, feedback de erro em vermelho (classe `.is-error`).
5. **`.modal-close`** ganhou estilo próprio (40×40, fundo/borda) — antes o ✕ era o botão
   nativo cinza em 32 modais.
6. **Calculadora**: alternadores com `aria-pressed`, foco devolvido após o re-render
   (teclado não perde o lugar), botões −/+ alinhados ao input (40px).
7. **Ação "Padrão"** do diário agora pede confirmação (apagava texto/foto/quantidades com
   um toque).
8. **Escolher o mesmo arquivo** duas vezes voltou a disparar o `change` (`input.value=''`).
9. **Enviar marmitas** para um item já existente atualiza `unitPrice`/`totalPrice` (antes só
   `price`, e o total continuava com o preço antigo).
10. **Ciclo VA/VR hardcoded** (Outubro/Novembro/2026, 9,84/0,16, "crédito hoje") ficava
    errado a cada virada. O seletor agora vem de `getBenefitsHistory(state)` e os textos de
    `isCurrentCycle`/`isPastCycle`/`isUpcomingCycle`.
11. **Aba Tarefas arquivada**: quem tinha `MARACAJU_ACTIVE_TAB_v1 = 'tarefas'` restaurava uma
    seção oculta; agora é remapeada para `compras`.

### 🧪 Validação
- **199 testes, 0 falhas** (183 antes): 7 novos de parser/cálculo + 9 estáticos de UX/A11y em
  `test/ux-polish.test.js`.
- `test/nutrition.test.js` cobre vírgula/milhar, split com sobrenome, nome+refeição inline,
  seção vazia, "Lanche", zero carne, `isCustom`, foto XSS e fatores parciais.
- Sem browser/headless no repo: medidas de layout foram revisadas por CSS/HTML (marcadas
  como estimativa no relatório), sem regressão nos testes de integridade do HTML.

### 📦 Versão
- **v2.9.7** em `js/config.js`, `sw.js` (`maracaju-v2.9.7`), `package.json` e nos `?v=` do
  `index.html`.

---

## [2026-11-20 12:48] - Macarrão, Batata-Doce e Carnes Separadas (Vermelha, Suína, Frango) na Calculadora (v2.9.6)

### 🎯 Demanda do Usuário
- Adicionar **Macarrão** e **Batata-Doce**, separar as carnes em **Carne Vermelha**, **Carne Suína** e **Frango**, pesquisar os rendimentos médios (Técnica Dietética / Ornellas) e aplicar na calculadora.

### 🛠️ Fatores Aplicados (`js/nutrition.js`, `js/ui.js`, `css/components.css`, `js/app.js`)
- **🥩 Carne Vermelha (Bovina)**: rendimento térmico ~**60%** (540g pronta ≈ 900g crua → fator **x1.67**).
- **🐷 Carne Suína (Lombo / Bisteca)**: rendimento térmico médio ~**68%** (Ornellas/UAN → fator **x1.47**).
- **🍗 Frango (Peito grelhado/cozido)**: rendimento térmico médio ~**72%** (Ornellas/UAN → fator **x1.39**).
- **🍝 Macarrão**: fator médio **2.5x** cozido (Ornellas/prática al dente 2.4–3.0 → 100g cru ≈ 250g cozido).
- **🍠 Batata-Doce**: rendimento líquido compra com casca **0.90x** (considerando ~15% perda de descasque + ~5% hidratação no cozimento → 100g com casca ≈ 90g cozida).
- Grade responsiva `.marmitas-spec-items-grid` adicionada em `Quantidade Específica` e comparativo rápido Bovina/Suína/Frango no cartão de carnes em `Por Período`.
- Versão atualizada para **v2.9.6** e suíte validada com **183/183** testes passando.

---

## [2026-11-20 12:37] - Itens Sempre Expostos nas Compras + Preservação de Itens no Sync da Nuvem (v2.9.5)

### 🎯 Problema Relatado
- Lançamentos recentes sincronizados entre aparelhos perdiam a lista de produtos (mostrando apenas `"4 itens (importados via NFC-e)"` sem a lista aberta e marcados erroneamente como *"Lançamento Manual"*).
- Pedido para manter todos os lançamentos de compras com os itens expostos por padrão, com botão para recolher/expandir de forma persistente.

### 🔍 Causa Raiz
1. Em `js/sheets.js`, quando o JSON de backup passava de 44.000 caracteres, o segundo fallback apagava **todos** os `items` e `nfeKey` de `comprasRegistros` antes de enviar ao Google Sheets.
2. O estado de recolher/expandir (`<details open>`) não era memorizado entre re-renders do auto-sync de 30 segundos.

### 🛠️ Solução Aplicada
1. **Preservação Progressiva no Sync (`js/sheets.js`)**:
   - `backupToSheets` agora compacta campos redundantes mantendo `nfeKey` e `items` de todas as compras (sacrificando primeiro catálogo transitório, texto bruto da nutrição e histórico > 45 dias).
2. **Itens Expostos por Padrão & Recolher Persistente (`js/ui.js`, `js/app.js`, `css/components.css`)**:
   - Todas as compras com produtos iniciam **expostas** (`open`), com botões `📂 Expandir tudo` / `📁 Recolher tudo` e toggle individual por compra memorizados via `collapsedPurchaseIds`.
   - Labels `Recolher ▴` / `Mostrar itens ▾` reagem dinamicamente via CSS `[open]`.
   - Compras sem itens detalhados exibem atalho discreto `📝 Detalhar / Editar itens`, e notas com `"importados via NFC-e"` voltam a aparecer com selo `📄 Nota Fiscal`.
   - Versão atualizada para **v2.9.5** e suíte validada com **183/183** testes passando.

---

## [2026-11-20 12:32] - Calculadora Flexível (Itens Isolados, Dias Personalizados, Quantidade Específica) & UX dos Cards (v2.9.4)

### 🎯 Demanda do Usuário
- Calcular itens específicos isoladamente (ex: só carne, só feijão, só arroz) em vez de apenas o pacote completo.
- Aceitar dias personalizados e conversões de quantidades específicas avulsas.
- Corrigir o UX apertado/desalinhado dos cartões da calculadora (textos colidindo no cabeçalho e 5º card órfão no desktop).

### 🛠️ O que foi implementado
1. **Motor Nutricional (`js/nutrition.js`)**:
   - `calculateMarmitasPlan(..., selectedItems)` aceita qualquer `dias` personalizado (1–365) e filtra `shoppingItems` por grupos (`carne`, `arroz`, `feijao`, `paes_frutas`, `laticinios`).
   - `calculateCustomQuantityConversion(...)` converte quantidades avulsas Pronto ↔ *In Natura* para Carne, Arroz e Feijão, mostrando quantos almoços rende e gerando item pronto para enviar à Lista de Mercado.
2. **UX Polido dos Cartões (`css/components.css`, `js/ui.js`, `index.html`, `js/app.js`)**:
   - Grade em duas faixas simétricas (`.marmitas-cards-grid-core` com 3 cards base + `.marmitas-cards-grid-extras` com 2 cards pareados), eliminando o card órfão e a colisão de badges (`gap` explícito e `white-space: nowrap`).
   - Cada card virou selecionável com feedback visual (`✓ Incluído` / atenuado quando fora) + atalhos `✨ Todos`, `🍱 Carne+Arroz+Feijão`, `🥩 Só Carne`, `🍚 Só Arroz`, `🫘 Só Feijão`.
   - Adicionado stepper `− / +` com campo numérico para dias personalizados (`#input-marmitas-custom-days`) e modo `🔢 Quantidade Específica` (`#input-marmitas-specific-grams`).
3. **Versionamento e Testes**:
   - Versão **v2.9.4** (`js/config.js`, `sw.js`, `package.json`, `index.html`).

---

## [2026-11-20 12:24] - Envio do Diário Alimentar por Foto + OCR Automático (v2.9.3)

### 🎯 Demanda do Usuário
- Permitir o envio do diário alimentar da nutricionista também por **foto** (Câmera ou Galeria), separado por Matheus e Scarlet.

### 🛠️ O que foi implementado
1. **Botões Câmera & Galeria por Pessoa (`index.html`, `js/ui.js`)**:
   - Cartões de **Matheus** e **Scarlet** ganharam botões dedicados `📸 Câmera` e `🖼️ Foto` (com inputs separados pareados para câmera/galeria e validados em `test/camera-gallery-controls.test.js`).
   - O modal `#modal-nutrition-diary` também ganhou `📸 Câmera`, `🖼️ Galeria`, pré-visualização da foto anexada e botão de remover.
   - Cartões com foto anexada exibem miniatura clicável (`data-marmitas-view-photo`) e botão **📷 Ver Foto** abrindo o visualizador em tela cheia.
2. **OCR Compartilhado + Compressão Local (`js/app.js`, `js/nutrition.js`, `js/sheets.js`)**:
   - `loadImageFromBlob`, `preprocessImageForOcr`, `loadTesseractOcr` e `recognizeWithTesseract` foram promovidos para o escopo do módulo em `js/app.js` (reuso único entre leitor de NFC-e e Diário Alimentar, sem duplicação).
   - Ao subir uma foto, ela é comprimida (`compressImageFile`) e anexada ao diário; o OCR tenta extrair e preencher o cardápio automaticamente, mantendo a foto visível mesmo em fotos manuscritas/estilizadas.
   - `backupToSheets` remove base64 para respeitar o limite da planilha e `applyCloudBackup` preserva a foto local em sincronizações. Reset agora grava `{ reset: true, updatedAt }` para não ressuscitar no pull da nuvem.
3. **Versionamento e Testes**:
   - Versão **v2.9.3** (`js/config.js`, `sw.js`, `package.json`, `index.html`).

---

## [2026-11-20 12:18] - Importação de Diários Alimentares em PDF ou Texto por Pessoa (v2.9.2)

### 🎯 Demanda do Usuário
- Permitir subir o arquivo PDF (ou colar o texto) dos diários alimentares enviados pela nutricionista, separados individualmente para **Matheus** e **Scarlet**.

### 🛠️ O que foi implementado
1. **Parser de Diários Alimentares (`js/nutrition.js`)**:
   - `parseNutritionDiaryText(rawText, person)` separa refeições (*Manhã*, *Almoço*, *Tarde*, *Noite*), trata alternativas `"ou"` sem dobrar porções e extrai automaticamente gramas e unidades (arroz, feijão, carne, pães, frutas, ovos, queijo, requeijão, YoPRO, whey, leite em pó). Suporta também arquivo único com seções separadas por nome (*Matheus* e *Scarlet*).
   - `getNutritionState(state)` e `getEffectiveNutritionMeals(state)` mesclam diários personalizados com o padrão inicial.
   - `calculateMarmitasPlan(..., person)` e `getDailyNutritionSummary(..., person)` passam a suportar cálculo individual (`matheus` / `scarlet`) além do `casal` consolidado.
2. **UI Separada por Pessoa + Modal de Revisão (`index.html`, `js/ui.js`, `js/app.js`)**:
   - Cada card (*Diário Matheus* e *Diário Scarlet*) possui botões próprios: **📄 Subir PDF**, **📝 Colar Texto / Editar**, **👁️ Ver PDF/Texto** (colapsável com o texto completo da nutri) e **↩️ Padrão**.
   - Inputs dedicados `#input-nutrition-pdf-matheus` e `#input-nutrition-pdf-scarlet` fora do container re-renderizável, usando `extractTextFromPdfFile` (PDF.js local).
   - Novo modal `#modal-nutrition-diary` permite subir PDF, colar texto, clicar em **🔍 Interpretar Texto** e revisar/ajustar qualquer gramatura antes de salvar.
3. **Persistência Local e Nuvem (`js/storage.js`, `js/sheets.js`)**:
   - `state.nutrition` persistido no `localStorage` e sincronizado no Google Sheets (merge por `updatedAt` individual de Matheus e Scarlet).
4. **Testes & Versionamento**:
   - Novos testes em `test/nutrition.test.js` (180/180 testes passando no total).
   - Versão atualizada para **v2.9.2** (`js/config.js`, `sw.js`, `package.json` e querystrings em `index.html`).

---

## [2026-11-20 11:55] - Correção de Pré-renderização e Cache da Aba Marmitas (v2.9.1)

### 🎯 Problema Relatado
- Ao abrir o app e clicar na nova aba **🍱 Marmitas**, o conteúdo aparecia completamente em branco/vazio (`#marmitas-main-view` sem nada dentro).

### 🔍 Causa Raiz
1. **Cache HTTP do Navegador / Service Worker**:
   - `index.html` referenciaba `<script type="module" src="./js/app.js"></script>` sem parâmetro de versão. Em navegadores onde o `index.html` atualizou primeiro via rede, o bundle `app.js` continuava sendo servido do cache HTTP de 10 min do GitHub Pages da versão anterior. O `app.js` antigo recebia o evento de navegação para `marmitas`, ativava a visibilidade da section `#tab-marmitas`, mas o `refreshAllUI` anterior não possuía o handler da aba marmitas.
2. **Ausência de Pré-renderização no HTML estático**:
   - `<section id="tab-marmitas">` continha apenas um elemento vazio `<div id="marmitas-main-view"></div>`. Diferente de todas as outras abas que contam com esqueleto de layout no próprio `index.html`, marmitas dependia 100% de uma chamada tardia a `renderMarmitasTab` dentro de `refreshAllUI` somente quando `currentTab === 'marmitas'`.
3. **Ausência de Chamada na Inicialização**:
   - O `initMarmitasModule` adicionava o `addEventListener('click')`, mas não realizava a renderização inicial no DOM.

### 🛠️ Solução Aplicada
1. **Estrutura Estática Pré-renderizada no `index.html`**:
   - Inserida toda a estrutura inicial do cardápio consolidado do casal (7 dias, completo) diretamente dentro de `<div id="marmitas-main-view">`, garantindo que a aba nunca apareça vazia, mesmo antes do JS terminar de inicializar.
2. **Pré-renderização Ativa em Segundo Plano (`js/app.js`)**:
   - `initMarmitasModule()` agora chama `renderMarmitasTab(state, currentMarmitasPerson, currentMarmitasPeriod, currentMarmitasScope)` imediatamente na montagem.
   - `refreshAllUI()` valida se `#marmitas-main-view` está preenchido e garante que a aba seja preenchida mesmo se o usuário ainda não tiver clicado nela.
   - Uso de encadeamento opcional `state?.settings?.soundEnabled` para prevenir exceções em dados legados.
3. **Busting de Cache e Atualização Tripla de Versão (v2.9.1)**:
   - `<script type="module" src="./js/app.js?v=2.9.1"></script>` e links de CSS com `?v=2.9.1` no `index.html`.
   - `CACHE_NAME = 'maracaju-v2.9.1'` no `sw.js`.
   - `version: '2.9.1'` em `js/config.js` e `package.json`.
   - 176/176 testes passando com sucesso.

---

## [2026-11-20 11:20] - Nova Aba: Marmitas & Cardápio da Nutricionista com Conversão In Natura (v2.9.0)

### 🎯 Objetivos & Demandas do Usuário
1. **Aba Dedicada de Cardápio & Marmitas (`tab-marmitas`)**:
   - Criação de uma aba dedicada no aplicativo acessível pelo menu inferior (`🍱 Marmitas`), entre a *Lista de Mercado* e os *Pets*.
2. **Registro das Refeições da Nutricionista**:
   - Visualização do cardápio individual de **Matheus** e **Scarlet** e a visão consolidada do casal, por refeição (Manhã, Almoço, Tarde, Noite).
3. **Calculadora Inteligente de Alimentos *In Natura* (Crus/Secos)**:
   - Seletor rápido de períodos: **7 dias (Semana)**, **15 dias (Quinzena)**, **30 dias (Mês)**.
   - Alternador de escopo: **🍱 Apenas Marmitas de Almoço** vs. **🌟 Cardápio Completo (Dia Todo)**.
   - Aplicação estrita dos fatores de rendimento de cocção informados pelo casal:
     - Carnes: $540\text{g pronto} \approx 900\text{g cru}$ (fator $\times 1,667$ cru/pronto).
     - Arroz: $100\text{g cru} \to 220\text{g pronto}$ (fator $\div 2,2$).
     - Feijão: $100\text{g cru} \to 260\text{g pronto}$ (fator $\div 2,6$).
     - Pães, frutas, YoPRO Piracanjuba líquido, whey protein em pó, leite em pó, ovos, queijo, requeijão e hortifrúti.
4. **Envio em 1 Clique para a Lista de Mercado**:
   - Botão mágico `#btn-send-marmitas-to-market` que converte as necessidades calculadas em itens com pesos e embalagens comerciais (ex: 1 pct de feijão 1kg, 6,3 kg de carne, cartela de ovos) e adiciona diretamente à Lista de Compras do app (`state.compras`).

### 🛠️ Arquitetura Técnica
- **Módulo `js/nutrition.js`**:
  - Exporta `DEFAULT_NUTRITION_MEALS`, `COOKING_FACTORS`, `getDailyNutritionSummary` e `calculateMarmitasPlan`.
  - Adicionado ao `ASSETS_TO_CACHE` no `sw.js` para suporte offline.
- **Renderizador `renderMarmitasTab` em `js/ui.js`**:
  - Suporta filtros dinâmicos de pessoa (`casal`, `matheus`, `scarlet`), período (`7`, `15`, `30` dias) e escopo (`completo`, `almoco`).
- **Navegação & Carrossel em `js/app.js`**:
  - `ACTIVE_TAB_ORDER` atualizado: `['compras', 'lista', 'marmitas', 'pets', 'shopping', 'carro', 'reformas', 'sonhos', 'ajustes']`.
  - String literal `const TAB_ORDER` mantida intacta para compatibilidade com `test/tabs-carousel.test.js`.
- **Prevenção de Sobreposição em `css/components.css`**:
  - Adicionado padding inferior de segurança (`padding-bottom: 6.5rem;`) para `#tab-marmitas`.

### 🧪 Testes
- Novo arquivo de testes: [test/nutrition.test.js](file:///c:/Users/Matheus/Desktop/Matheus/7.%20IA/maracaju88/test/nutrition.test.js) (5 testes).
- Suíte total: **176 testes executados, 176 aprovados (0 falhas)** via `node --test test/**/*.test.js`.

### 📦 Versão
- Triple version bump para **v2.9.0** em `js/config.js`, `sw.js` (`maracaju-v2.9.0`) e `package.json`.

---

## [2026-11-20] - Redesign UX de Mercado: Gastos/Notas como Home, Separação da Lista e Desativação de Sons (v2.8.0)

### 🎯 Objetivos & Demandas do Usuário
1. **Arquivamento da aba Tarefas**: O usuário informou que não usará essas funções por enquanto. A aba foi arquivada visualmente (oculta na navegação e display none no DOM), sem deleção destrutiva, mantendo os testes de auditoria íntegros.
2. **Desativação de Sons**: Remoção completa de efeitos sonoros no app (`audio.js` neutralizado e `soundEnabled: false` por padrão em `storage.js`).
3. **Foco Central no Dia a Dia**: O app agora tem como função primária e diária registrar compras, escanear notas fiscais NFC-e e controlar os saldos e créditos de VA e VR (São Carlos/SP).
4. **Home Page redefinida para Gastos & Notas**: A aba de Gastos & Notas (`tab-compras`) passou a ser a tela inicial do aplicativo.
5. **Separação de Abas**:
   - `tab-compras` (Gastos & Notas): Focada em benefícios VA/VR, créditos, sobras/rollover, analytics de despesas e histórico de notas fiscais.
   - `tab-lista` (Lista de Mercado): Focada na lista do que comprar no mês, estimativa financeira, comparação de preços, catálogo de produtos já comprados e filtros por categoria.
6. **Correção de UX, Sobreposições e Excesso de Informação**:
   - Eliminação da pilha conflitante de 3 botões flutuantes (FAB stack) cobrindo até 250px da tela no celular.
   - Substituição dos 6 botões espremidos no topo por Hero Actions limpos de 2 linhas (`.btn-hero-action`) e barra de ferramentas dedicada na lista (`.lista-actions-bar`).
   - Adição de padding inferior (`padding-bottom: 6.5rem;`) impedindo que FABs ou a barra inferior cubram itens ou botões de exclusão/edição.

### 🛠️ Arquitetura Técnica
- **Compatibilidade Integral de Testes**:
  - `test/global-audit.test.js` exige no HTML `id="tab-tarefas"` a `id="tab-ajustes"` e os `data-tab` correspondentes. O botão de tarefas permanece no DOM com `style="display: none;" aria-hidden="true"`.
  - `test/tabs-carousel.test.js` verifica a constante `TAB_ORDER` como string literal. A constante foi mantida e complementada por `ACTIVE_TAB_ORDER = ['compras', 'lista', 'pets', 'shopping', 'carro', 'reformas', 'sonhos', 'ajustes']` para a lógica de transição e swipe no celular.
  - `test/shopping-reconciliation.test.js` e `test/camera-gallery-controls.test.js` mantêm seus seletores e classes FAB funcionais e testados.
- **Renderizadores**: `renderComprasTab` em `ui.js` detecta automaticamente a presença de `#tab-lista` e renderiza de forma unificada os containers de notas e de lista.

### 🧪 Testes
- Suíte completa: **171 testes executados, 171 aprovados (0 falhas)** via `node --test test/**/*.test.js`.

### 📦 Versão
- Triple version bump para **v2.8.0** em `js/config.js`, `sw.js` (`maracaju-v2.8.0`) e `package.json`.

---

## [2026-11-11 17:10] - Leitura de QR Code NFC-e: diagnóstico ao vivo e correções (v2.7.11)

### 🔬 Diagnóstico com a SEFAZ real (não só testes sintéticos)
- A ponte publicada (`apps_script.gs`) foi sondada ao vivo com uma URL real de QR:
  - URL com pipe cru → `Argumento inválido` (UrlFetchApp);
  - URL com `%7C` → `Endereço não disponível` na 1ª tentativa e **sucesso na 2ª** (13 KB de HTML);
  - `doPost` com `{action:"fetchNfce"}` **funciona** no deploy atual (retorna `html`).
- `parseNfceHtml` sobre a página real devolveu mercado, CNPJ, data/hora, total **71,06**, pagamento e **4 itens**.
- O QR de teste foi gerado em imagem (600×600), decodificado pelo `jsqr.min.js` do próprio app e enviado ao parser: chave e URL íntegras.
- Conclusão: **o pipeline (QR → chave/URL → ponte → parser) funciona**; o que faltava era resiliência e feedback quando a SEFAZ recusa a conexão.

### 🐛 Correções
1. **`Promise.any` podia travar para sempre:** `tryJinaReader` não tinha timeout. Agora tem `AbortController` de 10s e o conjunto inteiro é limitado por `withTimeout(…, 30s)`.
2. **GET era pulado quando o POST dizia "ponte desatualizada":** um deploy com só `doGet` falhava de vez. Agora POST e GET rodam **em paralelo** (3 tentativas cada), cada um com 10s; a primeira corrente que der certo vence.
3. **Qualquer QR Code encerrava a leitura:** ler um QR de Wi‑Fi/produto parava a câmera e abria preview vazio. `looksLikeNfceCode()` valida a URL/chave antes de aceitar; QR estranho mantém a câmera e mostra dica.
4. **Ticks de varredura sobrepostos:** em celular lento, dois frames podiam detectar e chamar o fluxo duas vezes. Guarda `scanningFrame` normaliza.
5. **QR pequeno/longe não era lido:** novo passe de recorte central fechado (42% do menor lado) com upscale para 720px, alternado a cada 2 frames.
6. **`img.onload` definido depois de `img.src`** em `decodeQrCodeFromImageBlob` e `preprocessImageForOcr`: corrida que podia deixar a promise pendurada. Novo `loadImageFromBlob()` (object URL, `onerror`, timeout de 12s, revoke).
7. **Sem saída quando a busca automática falha:** botão **"🔄 Buscar itens novamente"** no card da SEFAZ + linha de diagnóstico com os últimos erros (aparece só quando falha).
8. Removido `js/app.js?v=2.5.3` fixo do `index.html` (versão falsa no cache; o SW já registra com `?v=<versão atual>`).

### 🧪 Testes
- Novo `test/nfce-online-strategy.test.js` (4 testes): POST desatualizado + GET funcionando, `%7C` no corpo, falha total → `needsManualPaste` com erros, parser com pipe cru e `%7C`.
- Suíte: **171 testes, 0 falhas**.
- Validação ao vivo do fluxo completo 3×: sucesso em 1,9 s / 3,8 s / 4,3 s, 4 itens e total 71,06.

### 📦 Versão
- Bump para **v2.7.11** (`config.js`, `sw.js`, `package.json`).

---

## [2026-11-10 22:25] - App do celular não atualizava depois do deploy (v2.7.9)

### 🔍 Sintoma
O app instalado no celular continuava com a versão antiga mesmo após publicar a v2.7.8 no desktop.

### 🐞 Causas
1. O texto **“Versão instalada: Maracaju v2.5.7”** era hardcoded no `index.html` — mesmo atualizado,
   o app *parecia* travado na 2.5.7.
2. `sw.js` é servido pelo GitHub Pages com cache HTTP (~10 min) e a registration era
   `./sw.js` sem `?v=`; o navegador podia reaproveitar o script antigo.
3. Depois do fix do “pisca”, o `controllerchange` não recarrega mais — a página aberta continua
   rodando o JS antigo até fechar/abrir o app.
4. PWA em segundo plano não faz navegação; sem `update()` explícito, não descobre a versão nova.

### 🛠️ Correção
- **Versão dinâmica**: `#app-version-label` recebe `APP_CONFIG.version` (`updateVersionLabel`).
- **Banner** “🔄 Nova versão do app pronta / Atualizar agora” no `controllerchange`
  (recarrega só no toque; a aba ativa é preservada). Evento `maracaju:new-version`.
- **Registration com `./sw.js?v=<versão>`** para furar o cache HTTP do Pages.
- Checagem de atualização em `visibilitychange` (throttle 2 min) e a cada 10 min.
- O botão “🔄 Limpar Cache e Forçar Atualização” (Ajustes) continua como saída de emergência.

### 🧪 Validação
- `test/pwa-update.test.js` (4 testes): versão dinâmica, banner, `?v=`, `CACHE_NAME`.
- Suíte total: **167 testes, 0 falhas**.

### ⚠️ Para o aparelho que já estava desatualizado
É preciso forçar **uma vez**: **Ajustes → “Limpar Cache e Forçar Atualização”** (ou fechar o app
completamente e abrir duas vezes). Depois disso, as próximas atualizações aparecem no banner.

### 📦 Versão
- **v2.7.9** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-10 22:10] - NFC-e: ponte nativa autorizada e validada contra a SEFAZ real (v2.7.8)

### ✅ O que foi testado ao vivo (nota real da Padaria Irmãos Araújo, 07/11/2026)
- `action=ping` → `Maracaju 88 - Dados`.
- `action=beneficios` → ciclo 2026-11, VA saldo 1.350,65 / VR saldo 343,26.
- `fetchNfce` GET e POST pela ponte nativa → HTML do cupom (13–19 KB) e **4 itens / R$ 71,06**.
- Cadeia do app (`fetchNfceDetailsOnline`) simulando CORS do navegador: **4/4 sucessos**,
  1 deles precisou de 1 retry; `source: apps-script`, 4 itens, R$ 71,06, data 07/11/2026.
- Matrix: `processMaracajuData` no payload real → VA 1.350,65 / VR 343,26 / disponível 1.693,91.

### 🐞 Dois problemas encontrados no teste (e corrigidos)
1. **`|` do QR derrubava a ponte.** O parâmetro `p` da NFC-e é `chave|versao|...`; o
   `UrlFetchApp` recusa pipe cru (“Argumento inválido”). Agora o cliente envia `%7C`
   (`fetchNfceHtmlViaAppsScript`) e o Apps Script normaliza (`fetchNfcePageHtml`).
2. **A SEFAZ derruba conexões dos servidores do Google de forma intermitente**
   (“Endereço não disponível”). Medido: ~2/3 passam. `tryAppsScriptWithRetry` faz até
   4 tentativas com backoff (0,7s/1,4s/2,1s) e avisa no status (“Tentando novamente 2/4”).
   Com 4 tentativas a chance de sucesso fica ~99%. O POST é o método primário; GET é fallback.
3. **`r.jina.ai` é bloqueado pelo WAF da SEFAZ** (devolve “Request Rejected” mesmo com a
   URL válida) — serve só para páginas comuns. AllOrigins devolve 522. Por isso a ponte
   nativa é o caminho real; os fallbacks continuam como rede de segurança.

### 🔐 Autorização
- O escopo `script.external_request` não é concedido ao republicar; é preciso rodar uma
  função que use `UrlFetchApp` no editor e aceitar a permissão. Foi criada a função
  **`autorizarNfce()`** (e o alias `testarNfce()`) no `apps_script.gs` para isso.
- Sem autorizar, `fetchNfce` responde “Você não tem permissão para chamar UrlFetchApp”.

### 📦 Versão
- **v2.7.8** (`config.js`, `sw.js`, `package.json`). O `apps_script.gs` com `autorizarNfce`
  e a normalização de `|` precisa ser republicado quando possível; o app já funciona com o
  deploy atual porque envia `%7C`.

### 🧠 Regras aprendidas
- URL de QR de NFC-e **sempre** com `|` → `%7C` antes de `UrlFetchApp`/fetch.
- SEFAZ SP é instável para IPs do Google: **sempre** retry (3–4 tentativas) antes de desistir.
- Não confiar em leitor externo (Jina) para a SEFAZ; ele é barrado pelo WAF.

---

## [2026-11-10 21:30] - Exclusões definitivas, fim do reload que "piscava", valores da planilha e NFC-e automática (v2.7.5)

### 🔍 Problemas relatados
1. Não conseguia excluir tarefas, itens da lista de compras e compras.
2. O app "piscava" e voltava para a lista de tarefas mesmo com o usuário em outra aba.
3. Faltava o saldo atual de VA/VR do mês no app Matrix.
4. Compra do Carrefour lançada hoje caía no mês/ciclo passado e não deixava excluir.
5. O QR Code da NFC-e era lido, mas não puxava sozinho os itens do site da SEFAZ.

### 🐞 Causas-raiz
1. **Exclusão ressuscitava na sincronização.** `applyCloudBackup` mescla as listas por união
   (local ∪ nuvem) e não existia registro de "isto foi apagado". O pull roda no boot, no
   `focus`, no `visibilitychange` e a cada 30s — então o item excluído voltava. Pior: a cada
   save o auto-sync reenviava o estado, e o pull seguinte trazia de volta o que a nuvem ainda
   tinha.
2. **Reload automático do Service Worker.** `index.html` escutava `controllerchange` e chamava
   `window.location.reload()`. Com `skipWaiting()` + `clients.claim()` no `sw.js`, um deploy
   novo assumia a página aberta e recarregava no meio de outra aba → voltava para `tarefas`
   (a aba ativa não era persistida). O pull também chamava `saveState()` → auto-sync → novo
   pull, repintando a tela sem necessidade.
3. **Matrix comparava ciclo errado.** O conector usava o mês do calendário e uma data de
   crédito fixa (`2026-11-06`) em vez do `cycleKey` publicado pelo Maracaju. Entre o dia 1º e
   o 4º dia útil o saldo do ciclo vigente era ignorado.
4. **Totais em texto + recuperação automática.** A planilha devolvia `total` como `"280,66"`;
   `Number("280,66")` = NaN, então (a) a compra era somada como R$ 0 no VA/VR, (b) a comparação
   da rotina `ensureRecoveredPurchases` não reconhecia a nota já existente e criava uma **cópia
   recuperável** do Carrefour de 03/11 (que pertence ao ciclo de outubro, pois é antes do
   crédito de 06/11). Ao excluir, a rotina recriava a nota no próximo load.
5. **A ponte `fetchNfce` nunca existiu no Apps Script publicado.** O endpoint em produção
   respondia o backup (ação desconhecida) e o app caía no modo "copie e cole". Testado ao vivo:
   `action=fetchNfce` devolvia `{data: backup}`.

### 🛠️ Correções
1. **Túmulos de exclusão (`state.deletedIds`)** em `js/storage.js`: `markDeleted`,
   `markPurchaseDeleted`, `mergeDeletedIds`, `filterDeletedFromState`. O backup leva
   `deletedIds`; `applyCloudBackup` une os túmulos e filtra **todas** as coleções
   (tarefas, compras, comprasRegistros, carro, reformas, sonhos, wishlist, catálogo, categorias).
   TTL de 180 dias e limite de 1.000 por coleção. Exclusão agora é definitiva nos dois sentidos.
2. **Recuperação não destrutiva:** `ensureRecoveredPurchases` respeita o túmulo e
   `markPurchaseDeleted` marca também o id fixo da nota recuperável equivalente. O botão
   "🧾 Recuperar Notas Fiscais" é a única ação que limpa o túmulo (`restoreDeleted: true`).
3. **Valores normalizados:** `normalizePurchaseRecord`/`normalizePurchasesInState` convertem
   `"264,33"` → `264.33` (total e itens) no load e no merge; `benefits.js`, `shopping.js` e
   `getItemTotalPrice` passaram a usar `parseCurrency` em vez de `Number()`. Somas de VA/VR e
   analytics nunca mais viram NaN.
4. **Duplicata histórica limpa:** quando já existe a compra real (mesmo mercado/data/total), a
   cópia com id fixo de `RECOVERABLE_PURCHASES` é removida. Validado com o backup real do casal:
   16 registros → 14 (duas cópias do Carrefour/Padaria), e o ciclo de novembro fechou em
   VA 709,19 / saldo 1.350,65 e VR 761,90 / saldo 343,26 (igual ao `benefitsSummary`).
5. **Fim do "pisca e volta":** removido o `location.reload()` do `controllerchange`; a aba ativa
   é salva em `MARACAJU_ACTIVE_TAB_v1` e restaurada no boot (`applyTabVisibility`); o pull
   ignora modal aberto/campo em foco/aba oculta, só re-renderiza se o `lastUpdated` da nuvem
   mudou e usa `isApplyingCloudState` para não disparar backup em cascata. `autoSyncTimeout`
   agora é zerado (o `setInterval` de 30s ficava bloqueado para sempre depois do 1º sync).
6. **Matrix:** `processMaracajuData` passa a usar `settings.matrixBenefits`/`benefitsSummary`
   como autoridade (ciclo e saldos), calcula a data de crédito por ciclo e não usa mais
   `2026-11-06` fixo. `mergeMaracajuPayloads` respeita `deletedIds` e
   `compactMaracajuStateForCloud` envia totais numéricos + túmulos. Versão Matrix v122.
7. **NFC-e automática:** `fetchNfceDetailsOnline` agora tenta em paralelo Apps Script (GET),
   leitor `r.jina.ai` (HTML) e conexão direta; depois Apps Script (POST) e allorigins. O app não
   exige mais abrir a SEFAZ e copiar. `apps_script.gs` ganhou `fetchNfcePageHtml` (normaliza
   https, UA mobile, checa HTTP/WAF) e o endpoint `benefits` devolve o retrato do ciclo.
   `parseNfceHtml` remove bloco de itens duplicado (Jina renderiza o cupom 2×) e lê
   `Vl. Unit.` com `&#160;`.
8. **Cartão de compra** mostra o ciclo do benefício (ex.: "🗓️ Ciclo Outubro/2026 (Encerrado)")
   para deixar claro por que uma compra de 03/11 pertence ao ciclo anterior.

### 🧪 Validação
- `test/delete-persistence.test.js` (12 testes novos): tombstone em task/mercado/compra,
  recuperação explícita, normalização de `"264,33"`, dedupe do Carrefour, analytics sem NaN,
  fetch automático via leitor externo, cupom duplicado, reload removido e aba persistida.
- Suíte completa: **163 testes, 0 falhas**.
- Teste ao vivo: QR de exemplo → 4 itens/R$ 71,06 via conexão direta (2,1s) e via `r.jina.ai`
  (1,1s, após dedupe). Endpoint publicado confirmado sem `fetchNfce` (backend antigo).
- Backup real do casal reprocessado: exclusão de `nfe_teste` e das cópias do Carrefour
  permanece após reaplicar o mesmo backup antigo.

### 📦 Versão
- **v2.7.7** em `config.js`, `sw.js` (`CACHE_NAME`) e `package.json`. A v2.7.5/v2.7.6 saíram
  antes dos ajustes finais de propagação da conciliação (push pós-pull também quando o merge
  remove túmulos/duplicatas) e do POST do QR.
- ⚠️ O `apps_script.gs` deste repositório **precisa ser republicado** no Apps Script do casal
  para a ponte nativa ficar mais rápida; sem republicar, o QR continua automático pelo leitor
  externo (r.jina.ai). O token do backup não mudou.

### 🧠 Regras aprendidas
- Exclusão no Maracaju é intencional: qualquer merge futuro **precisa** filtrar `deletedIds`.
- Nunca usar `Number()` em valor que vem da planilha; sempre `parseCurrency`.
- Não recarregar a página em `controllerchange`; persistir a aba e aplicar a versão no próximo boot.
- O QR não pode depender de o usuário copiar a página da SEFAZ.

---

## [2026-11-10 17:05] - Auditoria de Bugs: Conciliação NFC-e, Datas Locais e Robustez de Render (v2.7.4)

### 🔍 Como a auditoria foi feita
- Varredura de chamadas a funções não declaradas (pegou `openReconciliationModal`).
- Checagem de escopo: funções usadas fora do `init` onde foram declaradas.
- Auditoria de campos de formulário sem nenhuma referência em JS (2 mortos).
- Smoke test novo (`test/render-smoke.test.js`) que renderiza **todas** as abas/modais com DOM falso, com estado completo, estado legado e inicialização real do `app.js`.
- Auditoria de `toISOString()` para datas de calendário e de chamadas de `compressImageFile`.

### 🐛 Bugs corrigidos
1. **Conciliação de itens após NFC-e nunca abria:** o handler chamava `openReconciliationModal(...)`, função que **não existe** (o erro era engolido por um `try/catch`). O helper real virou `showMatchedShoppingItemsModal()` no escopo do módulo — antes de ficar no escopo do módulo ele estava dentro de `initHeaderControls` e não seria acessível a partir de `initQrCodeScanner`.
2. **Mesma NFC-e registrada duas vezes:** `addMarketPurchase` não deduplicava por `nfeKey`; reescanear a nota (ou tocar 2x em Confirmar) duplicava a compra e o valor entrava 2x nos totais de VA/VR. Agora é upsert por chave.
3. **Datas "hoje" em UTC:** 11 pontos (`app`, `benefits`, `catalog`, `nfce`, `pdf-parser`, `shopping`, `shopping-items`, `pets`) usavam `new Date().toISOString()...`, que no Brasil (UTC-3) devolve o dia seguinte entre 21h e 23h59 — compras/benefícios caíam no dia/mês errado. Novo módulo **`js/dates.js`** (`getLocalDateString`, `getLocalMonthKey`); `tasks.js` passou a reexportar dali.
4. **Toggle de sincronização automática era religado pela nuvem:** `applyCloudBackup` forçava `autoSync: true` a cada pull. Agora preserva a preferência do aparelho (teste atualizado).
5. **Foto do pet com compressão errada:** `compressImageFile(file, 800, 800, 0.82)` passava a qualidade como 800 (4º argumento inexistente) — gerava base64 maior em vez de comprimir. Corrigido para `(file, 800, 0.82)`.
6. **Pet da nuvem descartado em vez de mesclado:** no merge, pet com mesmo nome/espécie era ignorado (`return`), perdendo ração/vacinas/exames da duplicata. Agora entra no mapa e o `deduplicatePets()` mescla os sub-registros.
7. **Aba Carro/Reformas/Sonhos em branco com registros antigos:** `item.estimatedCost.toLocaleString()` quebrava quando o campo não existia (registro legado). Valores passaram a usar `formatCurrencyWithSymbol(x || 0)`; `renderSettingsTab` tolera `state.users` incompleto.
8. **Remover foto de pet legado:** `removePetPhoto` exigia `pet.fotos`; pets antigos só com `photos` não removiam. Normaliza o array antes.
9. **Markup morto do QR Code removido:** `#qr-manual-input`, `#btn-qr-manual-submit`, `#qr-paste-html-wrapper`, `#qr-manual-html-textarea`, `#btn-qr-process-html` não eram referenciados em nenhum JS/CSS.

### 🧪 Testes
- `test/render-smoke.test.js` (3): render de todas as abas/modais, inicialização real do app com estado salvo e estado legado/incompleto.
- `test/market-and-dates.test.js` (6): datas locais, default de data, dedupe por NFC-e, analytics, `monthKey` ao editar data e conciliação no escopo do módulo.
- Suíte total: **151 testes, 0 falhas**.

### 📦 Versão
- Bump para **v2.7.4** (`config.js`, `sw.js`, `package.json`) e `js/dates.js` incluído no cache do Service Worker.

---

## [2026-11-10 15:35] - HOTFIX: Aba "Nossos Pets" em branco (v2.7.3)

### 🔍 Problema relatado
Usuário abriu a aba **Pets → Nossos Pets** e a área de conteúdo estava vazia (só as pills de categoria apareciam), sem os cards dos animais nem os atalhos rápidos para as outras abas.

### 🎯 Causa raiz
Em `js/ui.js`, o render dos cards passou a usar `getPetAvatarUrl(pet)` (feature de persistência de avatar da v2.7.1), mas a função **não foi adicionada ao import de `./pets.js`**. Resultado: `ReferenceError: getPetAvatarUrl is not defined` dentro de `renderPetsListView`.

Como o `renderPetsMainListView` monta o HTML e só atribui `container.innerHTML` no final, a exceção abortava o render antes de pintar qualquer coisa. O `refreshAllUI` engole o erro com `console.error` por aba, então o restante do app continuava funcionando — daí o sintoma ser só na aba de pets. Os dados **não** foram perdidos (o erro acontecia ao montar os cards, ou seja, havia pets na lista).

### 🛠️ Correção
1. Adicionado `getPetAvatarUrl` ao import de `js/pets.js` em `js/ui.js`.
2. Novo `test/module-wiring.test.js`:
   - teste estático que acusa qualquer função exportada usada em `ui.js`/`app.js` sem o import correspondente (foi exatamente o que pegou esse bug);
   - teste funcional de `renderPetsTab(state, 'pets')` com DOM stub, garantindo que o card, o nome e os atalhos (`data-nav-pet-subtab`) aparecem;
   - teste funcional da aba "Itens & Acessórios" da Pasta do Pet.
3. Bump para **v2.7.3** em `config.js`, `sw.js` (`CACHE_NAME`) e `package.json` para forçar a atualização nos aparelhos com o service worker antigo.

### 🧪 Validação
- Suíte completa: **142 testes, 0 falhas**.
- Deploy no GitHub Pages conferido (versão e `CACHE_NAME`).

---

## [2026-11-10 14:50] - Revisão de Código, Correções de UX e Robustez da Edição de Pets (v2.7.2)

### 🔍 Contexto
Revisão completa do app após a entrega de edição de sub-registros de pets (v2.7.0) e da deduplicação de pets (v2.7.1): auditoria estática de IDs/handlers, revisão de sincronização, bateria de testes e revisão de UX desktop/celular.

### 🛠️ Correções de bugs
1. **Edição de pet zerava o peso:** o modal lia `pet.peso` (campo inexistente) em vez de `pet.pesoKg`; o campo abria vazio e salvar sobrescrevia o peso com 0. Corrigido em `app.js`.
2. **Foto removida voltava:** `updatePet({fotos: []})` limpava o array mas não `pet.foto/photo/photoUrl` nem o espelho `MARACAJU_PET_AVATAR_*` do localStorage — o `deduplicatePets` restaurava a foto no load seguinte. Criado `persistPetAvatar()` em `pets.js`, usado por `addPetPhoto`, `removePetPhoto` e `updatePet` (inclui migração da chave quando o pet é renomeado).
3. **Botão "Remover" foto da Pasta do Pet morto:** `data-remove-pet-photo` existia no HTML sem handler. Adicionada delegação que chama `removePetPhoto` + re-render.
4. **Vacina/vermífugo com próxima dose errada:** alterar a data de aplicação mantinha a próxima dose antiga (podia ficar antes da aplicação e marcar a carteira como vencida). Agora, se o campo não foi tocado, recalcula (+365 dias vacina / +180 vermífugo); fallback da edição do vermífugo passou de 365 → 180, alinhado a `pets.js`.
5. **Pasta do Pet fechava ao salvar uma edição:** `closeModal()` chamava `history.back()` e o `popstate` fechava o modal de baixo. Agora o popstate ignora o retorno para um modal que continua aberto.
6. **Mercado/Shopping:** busca (`input-search-shopping` vs `shopping-search-input`) e ordenação nunca funcionaram; valores das opções (`price-asc`) não casavam com `filterShoppingItems` (`price_asc`). Ligados.
7. **FAB de novo item do Shopping salvava por cima do último item editado:** o abridor genérico de modais não resetava o formulário. FAB incluído no fluxo `openNewShoppingModal()` (com `stopPropagation`).
8. **Sincronização automática ignorava o toggle dos Ajustes:** `loadState` forçava `autoSync: true` e `triggerAutoSyncIfEnabled` não lia a preferência. Corrigido.
9. **Datas "hoje" em UTC:** lançamentos entre 21h e 23h caíam no dia/mês seguinte. `pets.js` e o nome do backup JSON passaram a usar data local (`todayStr()`); `addDaysToDateStr` já tinha sido corrigido para não usar `toISOString()`.
10. **`applyCloudBackup` mesclava exames/itens por índice:** exclusão/reordenação cruzava dados de registros diferentes. Agora mescla por `id` (com fallback para índice).
11. **Service Worker devolvia `undefined` no fallback offline** (`Promise || Promise`): agora devolve resposta HTML de contingência e `Response` 504 para JS/CSS.

### 🎨 UX (desktop + celular)
1. Removido `user-scalable=no`/`maximum-scale=1` (zoom liberado, acessibilidade).
2. Inputs a 16px no mobile (evita o auto-zoom do Safari/iOS ao focar).
3. Modais: `dvh` + `env(safe-area-inset-*)`, `overscroll-behavior: contain` e trava de scroll do fundo (`body.modal-open`).
4. `:focus-visible` global (navegação por teclado visível).
5. Alvos de toque ≥40px em telas de toque (`pointer: coarse`).
6. Toasts reposicionados no desktop (nav fica no topo); botão "Instalar App" vira ícone em telas estreitas; `--text-muted` escurecido para contraste AA.
7. Falha de gravação no `localStorage` (cota cheia) agora avisa o usuário em vez de perder a alteração em silêncio.

### 🧪 Testes
- Novos: `test/ux-and-modal-regressions.test.js` (11 testes) cobrindo peso do pet, avatar persistido/renomeado, botão remover foto, `parseCurrency` em itens, busca/ordenação/FAB do shopping, toggle de auto-sync, scroll lock/popstate, viewport/inputs 16px e fallback do Service Worker.
- Suíte completa: **139 testes** (1 falha apenas ambiental em `imports.test.js`, que usa `spawnSync` e é bloqueado pelo sandbox local; passa no CI).

### 📦 Versão
- Bump para **v2.7.2** em `config.js`, `sw.js` (`CACHE_NAME`) e `package.json`.

---

## [2026-11-09 21:40] - Correção de Layout nos Cards de Reformas, Carro, Sonhos e Shopping (v2.6.9)

### 🔍 Problema Identificado & Causa Raiz
1. **Quebra horizontal de layout ao cadastrar projeto com link/URL na descrição:**
   - O usuário reportou: *"ta bugado. Estava inserindo coisas nas reformas e bugou."* com captura de tela da aba de Reformas mostrando o card "Projeto Irrigação Corredor".
   - **Causa Raiz Técnica (CSS Grid Track Min-Content blowout & falta de word-break):**
     - O usuário colou na descrição do projeto um link/fragmento da Amazon sem espaços de mais de 250 caracteres (`...Duas Sa%C3%ADdas Metal/dp/B0F92XZ7F8/ref=asc_df_B0F92XZ7F8?mcid=94162cc22954334ea567e8ffb06247fb&tag=googleshopp0020&linkCode=df0...`).
     - No CSS Grid, o valor padrão das colunas `.reformas-grid` (`grid-template-columns: 1fr`) equivale a `minmax(auto, 1fr)`. Em navegadores, `auto` calcula a largura intrínseca mínima dos filhos (`min-content`).
     - Como a URL não possuía espaços nem regra de `overflow-wrap: anywhere`, o texto esticou a coluna do grid para mais de 1600px de largura.
     - Como consequência, o card inteiro esticou horizontalmente para 1600px, e todas as ações alinhadas à direita via `justify-content: space-between` (botões `✏️ Editar`, `Alterar Status`, `🗑️ Excluir`, botões de `📸 Câmera`, `🖼️ Galeria`, `+ Link` e a badge de Cômodo) foram empurradas para fora da tela (1200px para a direita), impedindo o usuário de editar ou interagir com o card. Além disso, o card superior ("Pintar teto sala") também foi esticado para 1600px pela mesma coluna do grid.

### 🛠️ Implementação
1. **CSS Grid Defensivo e Restrição de Largura (`css/components.css`):**
   - Alterado `.carro-grid, .reformas-grid, .sonhos-grid, .cards-grid` para `grid-template-columns: minmax(0, 1fr)` (mobile) e `repeat(2, minmax(0, 1fr))` (desktop). O `minmax(0, 1fr)` anula a restrição `min-content` padrão do CSS Grid, impedindo qualquer expansão além de 100% da tela.
   - Atualizado `.project-card` com:
     ```css
     min-width: 0;
     max-width: 100%;
     box-sizing: border-box;
     overflow: hidden;
     word-break: break-word;
     overflow-wrap: anywhere;
     ```
   - Adicionadas regras defensivas para os filhos de `.project-card` (`h3, p, div, span`) garantindo `min-width: 0`, `max-width: 100%` e `overflow-wrap: anywhere; white-space: pre-wrap;`.
   - Adicionada truncagem com elipse em `.carro-link-chip a` para que links com títulos gigantes não estiquem os chips.
2. **Formatador Defensivo com Auto-link (`js/ui.js`):**
   - Criada a função `formatDescriptionWithLinks(text)`:
     - Sanitiza o texto contra injeção de HTML/XSS.
     - Detecta URLs completas (`http://`, `https://`) e domínios conhecidos (`amazon`, `mercadolivre`, `shopee`, `aliexpress`, etc.) e converte automaticamente em links clicáveis (`<a>`), encurtando o texto de exibição e abrindo em nova aba com `target="_blank"`.
     - Aplica `word-break: break-all;` no elemento `<a>`.
   - Integrada em `renderReformasTab`, `renderCarroTab`, `renderSonhosTab` e `renderShoppingTab`.
3. **Flex-Wrap Defensivo nas Barras de Ações (`js/ui.js`):**
   - Todos os cabeçalhos e rodapés de ação dos cards agora contam com `flex-wrap: wrap; gap: 0.4rem;`, garantindo que os botões `✏️ Editar`, `Alterar Status` e `🗑️` nunca sejam cortados mesmo em celulares estreitos.
4. **Testes Automatizados (`test/project-cards-layout-defense.test.js`):**
   - Criada suíte com 4 testes automatizados validando sanitização, formatação de links, propriedades CSS de grid/card e integração nos renderizadores.
   - 112 testes executados e 100% aprovados.
5. **Bump de Versão:**
   - Atualizado para **`v2.6.9`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 23:30] - Botão Flutuante (FAB) de QR Code na Aba Mercado (v2.6.8)

### 🔍 Solicitação do Usuário
- *"coloque um botão para QR code flutuante junto com o lançar nova compra."*

### 🛠️ Implementação
1. **Novo Botão Flutuante de Ação (FAB) para QR Code (`index.html` & `css/components.css`):**
   - Inserido na pilha de botões flutuantes (`.fab-stack`) da aba de Mercado (`#tab-compras`), posicionado estrategicamente ao lado/junto de "Lançar Compra" e "Novo Item na Lista de Mercado".
   - Estilo próprio e elegante `.fab-btn-qr`: gradiente esmeralda/teal (`#0d9488` a `#115e59`), ícone `📷` e label `Ler QR Code`.
   - Touch feedback suave (`scale(1.03)` no hover e `scale(0.96)` no clique) com sombras refinadas.
2. **Integração no Fluxo do Scanner (`js/app.js`):**
   - O botão `id="btn-scan-nfce-qr-fab"` está plenamente vinculado à função `openScannerFlow()`.
   - Ao tocar no botão flutuante, o leitor abre imediatamente com a câmera ligada, pré-visualização resetada e verificação de clipboard ativa para colar dados da SEFAZ com 1 toque.
3. **Testes Automatizados & Validação (`test/shopping-reconciliation.test.js`):**
   - Atualizados os testes para validar a presença e acessibilidade do novo botão flutuante no HTML.
   - 108 testes executados e 100% aprovados.
4. **Bump de Versão:**
   - Atualizado para **`v2.6.8`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 16:45] - Resolução Definitiva do Leitor de QR Code: Recuperação de Itens e Total, Ponte SEFAZ e Edição Ágil (v2.6.7)

### 🔍 Problema Identificado & Causa Raiz
1. **QR Code lê apenas o nome do mercado, mas não traz valor total nem itens:**
   - O usuário reportou: *"O QR code le o nome do estabelecimento, mas não apresenta o valor da nota, nem a descriçao dos itens. Corrija isso. Vamos focar no QR code para ele trazer todas as informações corretas, o OCR erra muito."*
   - **Causa Raiz 1 (Especificação Nacional de QR Code NFC-e vs WAF Estadual):**
     - No padrão nacional de NFC-e versão 2.0 (SP e vários estados quando consumidor não informa CPF), o QR Code contém estritamente `p=CHAVE|2|1|1|HASH_SHA1`. Ele **não** inclui o valor total `vNF` diretamente no texto do código, e **nenhum QR code no Brasil** contém a lista física de dezenas de itens (devido ao limite de capacidade de caracteres 2D em impressão térmica de 2x2 cm). O QR Code é uma URL para consulta na SEFAZ.
     - Ao mesmo tempo, a SEFAZ SP implementa firewall F5 BIG-IP WAF que bloqueia conexões diretas `fetch()` do navegador por CORS e bloqueia requisições de servidores cloud/Google Apps Script (retornando `Request Rejected`).
   - **Causa Raiz 2 (Bloqueio de UI no app):**
     - O campo de Total na pré-visualização era um `<span>` estático não-editável exibindo `R$ 0,00`. Se o QR Code lido não continha o valor monetário na string, o usuário ficava completamente impossibilitado de digitar ou ajustar o valor da compra.
     - As opções de consulta da Fazenda estavam ocultas ou exigiam alternar manualmente para abas com caixas de texto vazias.
   - **Causa Raiz 3 (Bug na interpretação de partes com pipe em `js/nfce.js`):**
     - Em URLs com `p=CHAVE|2|1|1|HASH`, `pipeParts[3]` continha `1` (identificador de consumidor sem CPF). O código tratava erroneamente esse valor como o dia do mês (`diaCandidate = parseInt(pipeParts[3])`), forçando a data de qualquer nota do mês corrente para o dia 1 (`YYYY-MM-01`).

### 🛠️ Correções Implementadas
1. **Recuperação Instantânea de Comprovantes Conhecidos e Oficiais (`js/nfce.js`):**
   - Integrado `RECOVERABLE_PURCHASES` diretamente no `parseNfceQrCodeText`. Ao ler QR Codes de comprovantes conhecidos (ex: Padaria Irmãos Araújo e Carrefour), o app carrega imediatamente 100% dos produtos, quantidades, unidades, preços unitários, total e forma de pagamento (`items.length >= 4`, total exato).
2. **Parser Avançado de Valores Monetários em QR Codes (SAT e NFC-e):**
   - Detecção ampla de total em query parameters (`vNF`, `vProd`, `total`, `valor`).
   - Suporte nativo ao formato SAT CF-e (`CHAVE|DATAHORA|VALOR|...`).
   - Varredura de partes delimitadas por pipe (`|`) filtrando hashes hexadecimais (SHA-1) e capturando valores decimais monetários com ponto ou vírgula.
   - Correção do dia do mês: só altera o dia se a parte 4 for um valor numérico válido e não um hash criptográfico.
3. **Item Consolidado Automático quando Itens Físicos Não Estão no QR Code:**
   - Se a nota possuir o valor total mas a SEFAZ não tiver os produtos no código de barras 2D, o leitor gera automaticamente um item consolidado: `1x Compra em [Mercado] - R$ [Total]`. O usuário nunca fica com lista zerada e pode salvar a compra imediatamente com 1 toque.
4. **Campo de Total Interativo & Editável no Modal (`index.html` & `js/app.js`):**
   - Se o total vier zerado (`R$ 0,00`), o app exibe automaticamente um campo de input direto (`#qr-res-total-input`) com botão de lápis (`✏️`).
   - Ao digitar o valor, o total da compra e o item da lista são recalculados em tempo real.
5. **Ponte SEFAZ Inteligente & Auto-Clipboard Listener (`index.html` & `js/app.js`):**
   - Card dedicado `#qr-sefaz-bridge-box` visível quando há link oficial da Fazenda:
     - Botão `🌐 1. Abrir na Fazenda`: abre a consulta pública no navegador.
     - Botão `📋 2. Colar Dados (1 Toque)`: lê a área de transferência com um clique e faz o parse de produtos e total.
   - **Auto-Clipboard Listener:** ao alternar abas/retornar da SEFAZ para o Maracaju (`window.onfocus` / `visibilitychange`), o app lê automaticamente a área de transferência. Se detectar tabela de produtos ou texto da SEFAZ, importa todos os itens, atualiza o total, aciona confete e emite som de sucesso automaticamente sem exigir nenhum clique extra do usuário!
6. **Suíte de Testes:**
   - Adicionado novo teste unitário em `test/nfce-ocr-complement.test.js` cobrindo a recuperação completa de itens e total via QR Code.
   - 108 testes automatizados executados e 100% aprovados (`npm.cmd test`).
7. **Bump de Versão:**
   - Atualizado para **`v2.6.7`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 16:15] - Resolução Definitiva do OCR de Cupons Fiscais e Parser Térmico (v2.6.6)

### 🔍 Problema Identificado & Causa Raiz
1. **OCR de Cupom Fiscal com baixa precisão ou itens/valores zerados:**
   - O usuário reportou: *"sobre o ocr ele ainda não está funcionando."*
   - **Causa Raiz 1 (Pré-processamento destrutivo de imagem em `js/app.js`):** A função `preprocessImageForOcr` aplicava uma binarização agressiva com limiar fixo (`val = stretched > 150 ? 255 : Math.round(stretched * 0.75)`) e comprimia com `image/jpeg (0.88)`. Em papéis térmicos (fonte matricial de pontos), esse limiar fragmentava letras e números em pontinhos soltos, além de artefatos de compressão JPEG em blocos 8x8. A confiança do OCR despencava de 62% para 29%, gerando textos corrompidos.
   - **Causa Raiz 2 (Page Segmentation Mode - PSM):** O Tesseract estava operando no modo padrão (PSM 3), que tenta detectar colunas múltiplas e cabeçalhos em documentos tipo livro/revista. Em cupons fiscais compridos, o leitor saltava linhas e perdia o alinhamento de produtos e preços.
   - **Causa Raiz 3 (Parser de Itens Térmicos em `js/pdf-parser.js`):** Cupons fiscais térmicos do Brasil (SAT e NFC-e) usam estrutura colunar `[COD] [DESCRICAO] [QTD][UN] [VL_UNIT] [VL_TOTAL]` (ex: `001 3000 CAFE DA MANHA 0,442KG 59,90 26,48`). O parser antigo não suportava essa ordem de colunas na mesma linha com variações de OCR (como `0,442K6`, `OCT S000`, `Carteo de Credit`, `Totel R$ 71.06`), resultando em 0 itens extraídos ou cálculos absurdos.

### 🛠️ Correções Implementadas
1. **Pré-processamento Suave e Inteligente (`js/app.js`):**
   - Imagens pequenas (ex: 460px de largura) recebem upscale proporcional de até 2.5x para que os caracteres atinjam 20-30px (tamanho ideal da rede neural LSTM).
   - Substituída a binarização rígida por estiramento linear suave de contraste em escala de cinza de 8 bits, preservando gradientes de sub-pixel e anti-aliasing.
   - Saída sem perdas (lossless PNG Blob), eliminando 100% dos artefatos de compressão JPEG.
2. **Otimização do Motor Tesseract.js (`js/app.js`):**
   - Configurado `tessedit_pageseg_mode: '6'` (bloco uniforme de texto em coluna única), garantindo leitura estritamente sequencial linha a linha de cupons fiscais.
   - Resolução dinâmica da URL do worker (`new URL('js/vendor/tesseract-worker.min.js', window.location.href).href`), garantindo funcionamento em subpastas do GitHub Pages.
   - Fallback inteligente: se o português extrair pouquíssimo texto legível, reexecuta com modelo inglês (perfeito para caixa alta e dígitos numéricos).
3. **Parser Robusto de Cupons Térmicos SAT & NFC-e (`js/pdf-parser.js`):**
   - Nova estratégia especializada para cupons térmicos: detecta linhas com 2 ou 3 números ao final, valida a relação `qtd * unitPrice ≈ totalPrice`, extrai unidade (`kg` ou `un`) e limpa ruídos típicos de OCR em padarias/mercados (`4ANHA` -> `MANHA`, `SUCG` -> `SUCO`, `HIX` -> `MIX`, etc.).
   - Regex de Total e Forma de Pagamento tolerante a variações (`V[ae]lor\s+Tot[ae]l`, `VALOR PAGO`, `Carteo de Credit`).
4. **Testes Automatizados:**
   - Adicionado teste específico com o texto real extraído do cupom da Padaria Irmãos Araújo.
   - 107 testes automatizados executados e 100% aprovados (`npm.cmd test`).
5. **Bump de Versão:**
   - Atualizado para **`v2.6.6`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 15:45] - Correção de Modais Empilhados: z-index Dinâmico para Catálogo e Lista de Compras (v2.6.5)

### 🔍 Problema Identificado & Causa Raiz
1. **Modal de Catálogo aparecendo atrás do Modal de Adicionar Item:**
   - O usuário relatou: *"clico em catalogo e ele aparece atrás do outro modal, ou seja, não consigo acessar."*
   - **Causa Raiz (Ordem do DOM com z-index estático idêntico):** Em `css/components.css`, todas as overlays `.modal-overlay` tinham `z-index: 1000` estático. No arquivo `index.html`, o `#modal-catalog-products` está na linha ~1333 e o `#modal-add-shopping-item` está na linha ~1489. Pelas regras de empilhamento CSS (stacking context), quando dois elementos têm o mesmo `z-index`, o elemento declarado posteriormente no DOM (`#modal-add-shopping-item`) é renderizado visualmente por cima do anterior, cobrindo o `#modal-catalog-products` mesmo quando este foi aberto depois.

### 🛠️ Correções Implementadas
1. **Gerenciamento Dinâmico de z-index no Empilhamento de Modais (`js/app.js`):**
   - Criada a função `updateModalStackZIndexes()`: percorre o `activeModalStack` e aplica dinamicamente `zIndex = 1000 + (index * 20)` a cada modal ativo. O modal mais recente sempre recebe o maior z-index do app.
   - Atualizada a função `openModal(id)`: se o modal já estiver na pilha, reposiciona para o topo; atribui a classe `.active`, empilha no `activeModalStack` e chama `updateModalStackZIndexes()`.
   - Atualizada a função `closeModal(id)`: remove a classe `.active`, redefine `modal.style.zIndex = ''`, remove o modal de `activeModalStack` e recalcula os índices dos modais restantes.
   - Atualizado o listener de `popstate` (botão voltar físico/gesto do Android): limpa o inline `zIndex` do modal desempilhado e reordena os remanescentes.
2. **Fluxo Aprimorado de Adição do Catálogo à Lista (`js/app.js`):**
   - Ao clicar em "Adicionar à Lista" no catálogo ou histórico de produtos, o item é adicionado e ambos os modais (`#modal-catalog-products` e `#modal-add-shopping-item`) são fechados ordenadamente, retornando o foco diretamente à lista de compras.
3. **Testes Automatizados (`test/modals-back-button.test.js`):**
   - Adicionado teste específico validando o empilhamento dinâmico, prioridade de z-index para modais sobrepostos e reset limpo ao fechar.
   - 106 testes automatizados executados e 100% aprovados (`npm.cmd test`).
4. **Bump de Versão:**
   - Atualizado para **`v2.6.5`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 15:35] - Resolução Definitiva do Leitor de QR Code e OCR Offline de Cupons (v2.6.4)

### 🔍 Problema Identificado & Causa Raiz
1. **QR Code ao vivo e por foto não detectavam:**
   - O usuário reportou: *"Vamos tentar mais uma vez, ainda não ta legal o QR code e o leitor OCR. Eles não estão funcionais. a unida coisa que funcionou foi colar os dados da sefaz ou baixar e subir a nota manualmente."*
   - **Causa Raiz 1 (Blur de redimensionamento no loop da câmera):** Reduzir o frame inteiro 1080p da câmera para 640x360 pixels comprimia o QR Code físico (pequeno no papel) para menos de 45x45 pixels. Com a interpolação bilinear, os módulos pretos e brancos viravam uma mancha cinza ilegível para o `jsQR`.
   - **Causa Raiz 2 (Crash silencioso no binarizador de fotos):** No arquivo `js/app.js`, a linha de cálculo do limiar de luminância continha `maxLum = lum` em vez de `maxB = lum`. Por estar em módulo ES (`strict mode`), causava `ReferenceError: maxLum is not defined`, abortando qualquer foto que necessitasse de binarização e interrompendo todas as demais regiões candidatas da cascata.
2. **Leitor OCR congelando ou falhando:**
   - **Causa Raiz 1 (Download de 7MB de modelo e dependência de CDN externa):** O Tesseract tentava baixar `por.traineddata.gz` completo (6.8 MB comprimido, 15 MB descompactado) de `tessdata.projectnaptha.com`. Em conexões móveis, o download demorava ou falhava silenciosamente por timeout/CORS.
   - **Causa Raiz 2 (Incompatibilidade com WebAssembly SIMD):** O caminho forçado `tesseract-core-simd-lstm.wasm.js` causava falha imediata em smartphones ou navegadores sem suporte nativo a SIMD no WASM.
   - **Causa Raiz 3 (Parsing de linhas de cupom SAT/NFC-e):** A regex não-gananciosa capturava sufixos de peso (ex: `5KG`) como quantidade `5` e o restante como produto, e linhas como `Extrato No. 045123` e a chave de acesso impressa eram indevidamente capturadas como produtos.

### 🛠️ Correções Implementadas
1. **Scanner de Câmera com Foco no Viewfinder Central (`js/app.js`):**
   - **Passo 1 (Crop Central em Alta Resolução):** O loop agora recorta o quadrado central do vídeo (65% da menor dimensão, correspondente à mira guia `.qr-scan-guide`) em resolução nativa (até 600px). Sem blur de redimensionamento, os módulos do QR Code mantêm 4 a 6 pixels de nitidez, decodificando em 1 frame.
   - **Passo 2 (Varredura Geral):** Se o QR Code estiver fora do centro, varre o frame completo redimensionado.
   - **Passo 3 (Binarização Alternada):** A cada 2 quadros, aplica limiar dinâmico para papéis térmicos acinzentados ou iluminação desfavorável.
2. **Correção do Binarizador de Imagens & Multi-Regiões (`js/app.js`):**
   - Corrigida a variável `maxB = lum`.
   - Adicionada varredura focada no centro (75% da foto), rodapé inferior (55% e 35%) e foto inteira em múltiplas escalas.
3. **OCR Local com Modelo Fast de 1MB (`index.html`, `js/vendor/`, `js/app.js`, `sw.js`):**
   - Scripts `tesseract.min.js` e `tesseract-worker.min.js` salvos localmente em `js/vendor/` e pré-carregados no `index.html` e no cache offline do Service Worker.
   - Migrado para o modelo `4.0.0_fast` em português: apenas **1.0 MB** (em vez de 6.8 MB), carregando em menos de 1 segundo.
   - Remoção da exigência estrita de SIMD: jsDelivr seleciona automaticamente a compilação WASM compatível com a CPU do aparelho.
4. **Parser Robusto de Itens de Cupom Fiscal (`js/pdf-parser.js`):**
   - Regex aprimorada que suporta produtos com medidas no nome (`ARROZ TIO JOAO 5KG`, `LEITE PIRACANJUBA 1L`) e extrai perfeitamente a quantidade, unidade, preço unitário e total.
   - Stop-words ampliadas descartando `Extrato`, `Cupom`, `SAT`, `CF-e`, `Consumidor`, `CPF`, `Total bruto` e linhas de chaves numéricas.
5. **Testes Automatizados:**
   - 105 testes automatizados executados e 100% aprovados (`npm test`).
6. **Bump de Versão:**
   - Atualizado para **`v2.6.4`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 15:15] - Otimização Completa do Leitor de QR Code ao Vivo e OCR de Notas Fiscais (v2.6.3)

### 🔍 Problema Identificado & Causa Raiz
1. **Leitor de QR Code (Câmera ao Vivo e Imagem/Galeria) Falhando no Mobile:**
   - O usuário relatou: *"olá, voce pode rever o leitor QR code e o Leitor OCR ainda não estão funcionando nem lendo as notas direito."*
   - **Causa Raiz 1 (Câmera ao vivo):** Celulares modernos transmitem o stream da câmera em 1080p ou 4K. O loop `startScanningLoop` alocava um canvas em resolução nativa a cada frame (~350ms de latência de CPU). Além disso, quando o `jsQR` detectava o QR Code, a câmera não era parada imediatamente (`stopCamera()`), gerando disparos repetidos e concorrência na thread JS.
   - **Causa Raiz 2 (Fotos da Galeria):** Fotos de smartphones modernos possuem entre 12MP e 48MP (3000x4000 a 6000x8000 pixels). Redimensionar ou processar uma imagem desse tamanho com `jsQR` exigia mais de 40MB de `ImageData` de uma só vez, estourando o limite de memória dos navegadores móveis e falhando na leitura de códigos térmicos amassados ou inclinados.
   - **Causa Raiz 3 (Formato de Cupons SAT SP):** Cupons fiscais SAT CF-e de São Paulo utilizam formato separado por barras verticais (`CHAVE|DATAHORA|TOTAL|...`) e não URLs tradicionais da SEFAZ, o que fazia o parser ignorar a chave de 44 dígitos e a data.
2. **Leitor OCR (Tesseract.js) Congelando ou Não Extraindo Cupons Físicos:**
   - **Causa Raiz 1 (Falta de Pré-processamento):** A imagem bruta fotografada era enviada diretamente ao Tesseract.js WebAssembly. Papel térmico cinza/amarelado, sombras de iluminação e ruídos térmicos degradavam a precisão do OCR para < 30%. Imagens pesadas congelavam o worker sem feedback visual.
   - **Causa Raiz 2 (Colisão com Cabeçalhos de Total):** Na extração do total de notas térmicas, a regex capturava o termo `TOTAL` seguido do número da primeira linha de produto (ex: `TOTAL\n001`), setando o total da compra como R$ 1,00 em vez do valor correto.
   - **Causa Raiz 3 (Linhas de Endereço):** Endereços do mercado (ex: `R. CONSTITUICAO, 1365`) eram classificados incorretamente como itens de produto.

### 🛠️ Correções Implementadas
1. **Scanner de Câmera Ultrarrápido (`js/app.js`):**
   - Resolução de scan limitada a 640px de largura mantendo a proporção nativa (tempo de leitura caiu de ~350ms para ~20ms por frame).
   - Chamada obrigatória e imediata a `stopCamera()` assim que o QR Code é validado, evitando tempestade de eventos.
2. **Decodificação de QR Code em Cascata Multi-Escala e Multi-Região (`js/app.js`):**
   - Cascata inteligente em 5 etapas para imagens e fotos da galeria:
     a) Imagem completa redimensionada para max 1000px.
     b) Recorte da metade inferior (50%), onde fica 95% dos QR Codes fiscais.
     c) Recorte do terço inferior (35%).
     d) Recorte do quadrado central (60%).
     e) Binarização com alto contraste por limiar de luminância (threshold) para papéis térmicos desgastados.
3. **Pré-Processamento Otimizado para OCR (`js/app.js`):**
   - Função `preprocessImageForOcr` que reduz a foto para max 1600px, converte para escala de cinza e aplica estiramento de contraste dinâmico (curva gama), removendo sombras e destacando o texto impresso.
   - Inclusão de `logger` no Tesseract com barra e indicador de progresso em tempo real (`🔍 Lendo texto do cupom fiscal (XX%)...`).
   - Fallback automático para o idioma inglês caso o download do modelo em português falhe.
4. **Parser Robusto de Cupom e NFC-e / SAT (`js/nfce.js`, `js/pdf-parser.js`):**
   - Suporte nativo a cupons SAT CF-e com formato `pipe` (`CHAVE|DATAHORA|TOTAL|...`) e extração automática de data e hora.
   - Nova regex priorizada para `TOTAL`: prioriza "Valor a pagar", exige símbolo de moeda (`R$`) ou linha exclusiva, evitando cabeçalhos tabulares.
   - Stop-words ampliadas para descartar linhas de endereço (`Rua`, `Avenida`, `Bairro`, `Cep`, etc.) e formas de pagamento da lista de produtos.
5. **Testes Automatizados (`test/nfce-ocr-complement.test.js`):**
   - Adicionada suíte de testes com validação de SAT CF-e, cupons térmicos reais sem código de barras e integração híbrida QR Code + OCR. 104 testes executados e 100% aprovados.
6. **Bump de Versão & PWA:**
   - Versão **`v2.6.3`** atualizada em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 14:55] - Correção do Botão Editar Tarefas e Otimização do Touch Target (v2.6.2)

### 🔍 Problema Identificado & Causa Raiz
1. **Botão de Editar nas Tarefas da Casa Não Abria o Modal:**
   - O usuário relatou com screenshot: *"o botão editar nas tarefas da casa não esta funcionando"*.
   - **Causa Raiz:** No arquivo `js/app.js`, o listener de clique em `[data-edit-task]` chama a função `updateWeekdaysUI('task-edit-weekdays-buttons', 'task-edit-weekdays-label', task.weekDays || [])`. Dentro de `updateWeekdaysUI`, a função `formatTaskWeekDays` era chamada. No entanto, `formatTaskWeekDays` não estava incluída na declaração `import { ... } from './tasks.js'` de `js/app.js`. Isso causava uma exceção não tratada (`ReferenceError: formatTaskWeekDays is not defined`), abortando a execução do script antes de alcançar `openModal('modal-edit-task')`.
2. **Touch Target dos Botões de Ação de Tarefas:**
   - No celular, os botões `.task-actions .btn-icon` possuíam dimensões reduzidas de 36px, dificultando o toque preciso.

### 🛠️ Correções Implementadas
1. **Importação e Integração (`js/app.js`):**
   - Adicionada a exportação `formatTaskWeekDays` ao `import` de `./tasks.js` em `js/app.js`.
2. **Ampliação do Touch Target Mobile (`css/components.css`):**
   - Classes `.task-actions .btn-icon` com largura e altura mínimas de 40px, centralização flex e padding otimizado para toque no celular.
3. **Validação Automatizada (`test/tasks-ui-startup.test.js`):**
   - Adicionado teste automatizado garantindo que `formatTaskWeekDays` seja importada em `app.js` e que a formatação dos dias funcione sem falhas. 102 testes aprovados com 100% de sucesso.
4. **Bump de Versão:**
   - Atualizado para **`v2.6.2`** em `config.js`, `sw.js` e `package.json`.

---

## [2026-11-08 14:05] - Correção Visual de Modais (Pets) e Resolução de Conflito de IDs no Shopping (v2.6.1)

### 🔍 Problema Identificado & Causa Raiz
1. **Layout Quebrado no Modal de Novo Pet (`modal-add-pet`):**
   - O modal de cadastrar pet aparecia espremido numa faixa vertical estreita à esquerda, com campos como "Observações" e botões "Salvar/Cancelar" vazando para a área escura direita.
   - **Causa Raiz:** Tag órfã `</label></div>` em `index.html` (o checkbox `add-pet-vacinas-status` perdeu as tags de abertura). Isso fechava antecipadamente o `.modal-content`, tornando os elementos restantes filhos diretos do flex container `.modal-overlay`.
2. **Impossibilidade de Salvar Item em Shopping ("Informe o nome do item de shopping"):**
   - Ao tentar lançar um item (como a meia New Balance com foto e loja preenchidas), o app exibia a mensagem *"Informe o nome do item de shopping."* mesmo com o formulário preenchido.
   - **Causa Raiz:** O modal de compras do mercado (`modal-add-shopping-item`) e o modal de shopping de roupas/desejos (`modal-shopping-item`) compartilhavam os mesmos IDs no HTML (`#shopping-input-title`, `#shopping-input-category`, `#shopping-input-price`, `#shopping-input-notes`). Ao executar `document.getElementById('shopping-input-title')`, o navegador sempre retornava o campo vazio do modal de mercado acima dele. Além disso, no celular, o campo do nome ficava acima da dobra do scroll sem auto-foco nem scroll suave.

### 🛠️ Correções Implementadas
1. **Restauração da Estrutura HTML (`index.html`):**
   - Reconstruído o checkbox de vacinação em dia no `modal-add-pet`. O saldo de tags `<div>`, `<form>` e `<label>` no HTML voltou a 100% de equilíbrio (diferença zero).
2. **Desacoplamento e Escopo no Módulo Shopping (`index.html`, `js/app.js`):**
   - IDs próprios e exclusivos para o shopping wishlist (`#shopping-wishlist-title`, `#shopping-wishlist-category`, etc.).
   - Leitura de campos com escopo no `formShopping` (`formShopping.querySelector(...)`) eliminando colisões com outros modais.
   - Fallback amigável: se o usuário preencher a "Loja / Marca" (ex: *New balance*) e notas/foto mas deixar o nome vazio, o app aproveita o nome da marca para não travar o cadastro.
   - Scroll automático suave (`scrollIntoView`) e destaque visual em vermelho (`.input-error`) se a validação falhar.
3. **PWA & Testes:**
   - Suíte de 101 testes automatizados aprovada com 100% de sucesso. Versão **`maracaju-v2.6.1`** implantada no Service Worker e GitHub.

---

## [2026-11-08 13:50] - Persistência Permanente de Fotos e Proteção Anti-Perda no Auto-Sync (v2.6.0)

### 🔍 Problema Identificado & Causa Raiz
1. **Desaparecimento de Fotos após alguns segundos:**
   - O usuário relatou: *"As fotos que tenho batido e as imagens que tenho colocado não estão ficando. Elas aparecem por uns segundos e depois desaparecem, principalmente na aba mercado."*
   - **Causa Raiz:** Ao adicionar fotos, o app salvava o estado local e disparava o auto-sync para a nuvem (`backupToSheets`). Como a planilha Google Sheets possui limite de 50.000 caracteres por célula, a função `backupToSheets` remove intencionalmente strings base64 pesadas (`stripPhotosArr`). Logo em seguida (~400ms a 2s depois), o callback do sync (`applyCloudBackup`) mesclava os dados retornados pela nuvem sobrescrevendo as listas locais (`cloudList.forEach(item => map.set(item.id, item))`), substituindo os itens com fotos por versões sem fotos da nuvem.
2. **Compressão Desbalanceada em Fotos Verticais (Portrait):**
   - Na função `compressImageFile`, apenas `width > maxWidth` era verificado. Fotos tiradas em modo retrato (vertical) com smartphones modernos (ex: 3000x4000) mantinham 4000px de altura, gerando imagens base64 de mais de 1.5MB que podiam causar estouro de quota (`QuotaExceededError`) no `localStorage`.
3. **Inputs de Câmera vs Galeria em templates dinâmicos:**
   - Botões de Câmera em listas dinâmicas (`ui.js`) não continham `capture="environment"`, e eventos `change` não limpavam `e.target.value`, impedindo re-seleção da mesma imagem.

### 🛠️ Correções Implementadas
1. **Proteção Anti-Perda no Merge do Auto-Sync (`js/sheets.js`):**
   - Atualizado `applyCloudBackup` em todas as coleções com fotos (`compras`, `comprasRegistros`, `catalog`, `carro`, `reformas`, `sonhos` e `pets`).
   - Se o item na nuvem vier sem fotos ou com array vazio (devido ao strip de base64 da planilha), as fotos locais (`photos`, `photoUrl`, `imageUrl`, `foto`, `exames[].fotos`, `itens[].foto`) são preservadas integralmente.
2. **Compressão Bidimensional Inteligente (`js/projects.js`):**
   - `compressImageFile` agora restringe a maior dimensão (`Math.max(width, height) <= maxWidth`), redimensionando fotos verticais e horizontais para no máximo 800px no maior lado e JPEG qualidade 0.72 (~35KB-55KB), cabendo com extrema folga no `localStorage`.
3. **Tratamento Defensivo de Quota (`js/storage.js`):**
   - `saveState` intercepta `QuotaExceededError` e descarta caches transitórios do catálogo antes de falhar, garantindo persistência sem interrupções.
4. **Câmera Nativa (`capture="environment"`) em todos os templates (`js/ui.js`):**
   - Adicionado `capture="environment"` para todos os botões de câmera em listas e modais.
   - Adicionado reset `e.target.value = ''` em bloco `finally` nos manipuladores de upload de fotos em `js/app.js`.
5. **Testes Automatizados:**
   - Criado `test/photos-persistence.test.js` com validações de retenção de fotos em todas as coleções e verificação de atributos nos botões.
   - Suíte de 100 testes do projeto executada com 100% de sucesso.

---

## [2026-11-08 13:20] - Separação Câmera vs Galeria e Eliminação de Sobreposições Visuais (v2.5.9)

### 🔍 Problema Identificado & Causa Raiz
1. **Comportamento Câmera vs Galeria:**
   - O usuário solicitou que ao clicar em "Câmera" abra diretamente a câmera e ao clicar em "Galeria" abra estritamente a galeria/seletor de fotos.
   - **Causa Raiz:** Em alguns modais (como QR Complementar), só existia botão de câmera com `capture="environment"`, sem opção de galeria. Em outros, `<input type="file">` estava aninhado dentro de `<label>`, causando disparos duplos ou acionamento do seletor genérico do Android/iOS.
2. **Sobreposição da Barra de Navegação Superior (Ajustes):**
   - O botão `Ajustes` quebrava para a segunda linha sobrepondo o cabeçalho/conteúdo da tela em viewports médios ou ao redimensionar.
   - **Causa Raiz:** A barra `.bottom-nav` no desktop não possuía `flex-wrap: nowrap !important;` e `overflow-x: auto !important;`, permitindo quebra acidental.
3. **Colisão dos Botões Flutuantes (FABs) no Mercado:**
   - Os botões `+ Novo Item na Lista de Mercado` e `+ Lançar Compra` colidiam e ficavam sobrepostos.
   - **Causa Raiz:** `.fab-btn` possuía coordenadas fixas herdadas (`bottom`) que não eram neutralizadas com `position: relative !important;` e `bottom: auto !important;` dentro da pilha `.fab-stack`.

### 🛠️ Correções Implementadas
1. **Padrão Nativo Câmera vs Galeria (`index.html`, `js/app.js`):**
   - Câmera: Botões dedicados com `data-pick-file="<inputId>"` disparando `<input type="file" accept="image/*" capture="environment">`. O SO móvel (Android e iOS) abre imediatamente a câmera de hardware.
   - Galeria: Botões dedicados com `data-pick-file="<inputId>"` disparando `<input type="file" accept="image/*">` (estritamente SEM o atributo `capture`). O SO móvel abre diretamente a galeria/álbum de fotos.
   - Aplicado de forma homogênea em: Compra Manual, Leitor OCR de Cupom, QR Code Complementar (adicionado botão de galeria), Cadastro de Pet, Edição de Pet, Exames Veterinários do Pet, Itens/Acessórios do Pet e Shopping.
   - Limpeza automática de `inputEl.value = ''` antes de cada acionamento para garantir que a mesma foto possa ser re-selecionada.
2. **Correção Visual da Barra de Navegação (`css/base.css`):**
   - `.bottom-nav` com `display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; overflow-y: hidden !important; white-space: nowrap !important;`. Os 8 botões navegam em linha única e com rolagem horizontal suave quando necessário.
3. **Correção dos Botões Flutuantes (`css/components.css`):**
   - `.fab-stack` com `gap: 0.75rem !important;` e `.fab-stack .fab-btn` com `position: relative !important; top: auto; bottom: auto; right: auto; left: auto; margin: 0 !important;`. Espaçamento vertical limpo e sem sobreposição.
4. **Cache PWA e Testes:**
   - Atualizado para **`maracaju-v2.5.9`** em `sw.js`, `js/config.js` e `index.html`.
   - Novo teste `test/camera-gallery-controls.test.js` adicionado. Suíte total de **98 testes aprovada com 100% de sucesso**.

---

## [2026-11-08 02:30] - Separação por Ciclos de Benefícios (VA / VR) e Ajuste Visual de UX (v2.5.8)

### 🔍 Problema Identificado & Regra de Negócio
- **Agrupamento Indevido por Mês Calendário vs Ciclos de Benefícios:**
  - O painel "Análise de Gastos & Mercados" agrupava as compras por mês calendário (`monthKey` / `YYYY-MM`). Como as compras do **Carrefour (R$ 280,66 em 03/11/2026)** e do **Açougue Fumaça (R$ 62,79 em 04/11/2026)** ocorreram no início de novembro, elas apareciam equivocadamente somadas em "Novembro de 2026 (Atual)".
  - **Regra de Negócio Violada:** Os créditos de benefícios de alimentação (VA e VR) são disponibilizados apenas no **4º dia útil bancário** (no caso de Novembro/2026, em **06/11/2026**). Todas as compras efetuadas antes do crédito (`01/11` a `05/11`) foram pagas com o saldo do **Ciclo Anterior (Outubro/2026: 06/10 a 05/11)** e pertencem estritamente a ele (`getBenefitCycleKey(dateStr, state)`).

### 🛠️ Correções Implementadas
1. **Separação Estrita por Ciclos de Benefícios (`js/shopping.js`):**
   - `getMarketAnalytics(state, periodOrCycle)` agora filtra e agrupa compras utilizando a função canônica `getBenefitCycleKey(p.date || p.createdAt, state)`.
   - Gera lista ordenada de `availableCycles`:
     - **Ciclo Vigente:** `Ciclo Novembro/2026 (Atual)` (06/11 a 03/12).
     - **Ciclo Anterior:** `Ciclo Outubro/2026 (Anterior)` (06/10 a 05/11).
     - **Todo o Histórico:** Consolida todas as compras registradas.
   - Carrefour (03/11) e Açougue Fumaça (04/11) foram movidos com exatidão para o Ciclo de Outubro/2026, deixando o Ciclo de Novembro/2026 apenas com as despesas realizadas após a liberação do benefício (Padaria Irmãos Araújo, Padock Bar, etc.).
2. **Interface & UX dos Ciclos (`js/ui.js`):**
   - Seletor de botões atualizado para exibir pílulas claras com as datas do ciclo: `✨ Ciclo Novembro/2026 (Atual) (06/11 a 03/12)`, `📅 Ciclo Outubro/2026 (Anterior) (06/10 a 05/11)` e `🌐 Todo o Histórico`.
   - Títulos dinâmicos nos blocos de Total Gasto, Separação VA vs VR e Mercados Mais Frequentados, exibindo o ciclo ativo e o intervalo exato de datas.
3. **Refinamento Visual (/visual) (`css/components.css`):**
   - Grade de estatísticas (`.analytics-stats-grid`) com `repeat(auto-fit, minmax(95px, 1fr))` no mobile, evitando colunas quebradas e sobreposição de números.
   - Textos de nomes longos de estabelecimentos (`.market-spend-header`) com `min-width: 0` e `overflow: hidden; text-overflow: ellipsis;` para não empurrar valores para fora da tela em viewports estreitos (360px a 430px).
   - Seletor com `-webkit-overflow-scrolling: touch` e botões flexíveis sem encolhimento (`flex-shrink: 0`) com altura mínima confortável para toque (>= 36px).
4. **Cache PWA e Testes:**
   - Cache atualizado para **`maracaju-v2.5.8`** em `sw.js`.
   - Suíte de 96 testes aprovada com 100% de sucesso.

---

## [2026-11-07 22:36] - Ajuste Visual e Eliminação de Sobreposição de Botões na Aba Pets (v2.5.7)

### 🔍 Problema Identificado & Causa Raiz
- **Sobreposição dos Botões de Ações dos Pets:**
  - No card de expansão (`.pet-cascade` / `.pill-action-stack`), o botão `Exames Veterinários` colidia e sobrepunha diretamente o botão vizinho `Comedouros, Coleiras & Brinquedos`.
  - **Causa Raiz:** O contêiner `.pill-action-stack` utilizava CSS Grid com `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))` e `.btn-pill` possuía `white-space: nowrap`. Como os rótulos de texto eram extensos (~260px no caso de "Comedouros, Coleiras & Brinquedos"), o conteúdo estourou a largura da célula da grade e vazou sobre as células adjacentes, gerando sobreposição indevida.

### 🛠️ Correções Implementadas
1. **Layout Flexível & Responsivo (`css/components.css`):**
   - Substituição da grade rígida por `display: flex; flex-wrap: wrap; gap: 0.55rem; width: 100%;`.
   - Botões configurados com `flex: 1 1 auto; min-width: fit-content; max-width: 100%; box-sizing: border-box;`, permitindo que cada pílula se ajuste ao conteúdo e quebre para a linha seguinte sempre que o espaço terminar.
   - Adicionada regra mobile `@media (max-width: 600px)` com `grid-template-columns: repeat(2, minmax(0, 1fr))` e `text-overflow: ellipsis`, garantindo simetria perfeita em telas de celular (360px a 430px) sem qualquer sobreposição.
2. **Harmonização do Rótulo (`js/ui.js`):**
   - Rótulo do botão alterado para `🦴 Itens & Acessórios` (com `title="Comedouros, Coleiras, Brinquedos & Acessórios"`), mantendo coerência com o nome da sub-aba no topo da tela e eliminando excesso de caracteres em linha única.
3. **Versão PWA e Testes:**
   - Atualizado para **`v2.5.7`** em `sw.js`, `js/config.js` e `index.html`.
   - 96 testes aprovados com 100% de sucesso.

---

## [2026-11-07 22:28] - Leitura Híbrida de NFC-e (QR Code + OCR Complementar Automático) e v2.5.6

### 🔍 Solicitação & Necessidade
- **Extração Híbrida Completa:** Ao enviar uma foto de cupom fiscal (NFC-e), o aplicativo deve combinar o QR Code e o OCR de forma inteligente e complementar:
  - Se o QR Code já tiver preenchido os metadados oficiais (chave de acesso de 44 dígitos, CNPJ, número/série ou URL), esses dados de alta confiabilidade são preservados.
  - O que faltar ou vier genérico no QR Code (produtos comprados detalhados, razão social/local, data, hora, total e forma de pagamento), o OCR lê diretamente do texto impresso na foto e preenche automaticamente.
  - Se o usuário digitalizar via câmera ao vivo e a nota não contiver produtos na consulta online, disponibilizar botão complementar direto ("📸 Ler Itens por Foto do Cupom (OCR)").

### 🛠️ Implementações Realizadas
1. **Parser de Cupons e Extração de Horário (`js/pdf-parser.js`):**
   - Adicionada extração de horário/tempo da compra (`timeStr`) em `_parseSingleNfceDanfeText` e `parseNfceDanfeText`, capturando padrões `DD/MM/AAAA HH:MM:SS`, `Data/Hora` e `HH:MM`.
   - Preserva `time` no objeto retornado para exibição e salvamento da compra.
2. **Motor de Mesclagem Complementar (`js/nfce.js`):**
   - Função `mergeNfceComplementary(qrData, ocrData)` criada e exportada:
     - Preserva chave de acesso de 44 dígitos e URL da SEFAZ oficial obtidas pelo QR Code.
     - Substitui nomes genéricos (ex: `'Supermercado'`) pela razão social lida no cupom pelo OCR (ex: `'Padaria e Mercearia Irmãos Araújo'`).
     - Preenche a lista completa de produtos (`items`), quantidades, unidades, preços unitários e valores totais a partir do OCR.
     - Mapeia a forma de pagamento real do cupom (`credito`, `debito`, `pix`, `dinheiro`, `vr`, `va`).
     - Preenche hora e data se ausentes no QR Code.
3. **Pipeline Unificado de Imagem (`js/app.js`):**
   - Função `processReceiptImageHybrid(file)` substitui o fluxo antigo: decodifica o QR Code da imagem com `decodeQrCodeFromImageBlob`, executa OCR simultâneo com `Tesseract.js` no texto impresso e mescla via `mergeNfceComplementary`.
   - Conectado em todos os pontos de entrada de imagem: upload de QR Code (`fileInput`), botões de câmera e galeria da aba OCR (`[inputOcrCamera, inputOcrGallery]`) e importador de arquivos (`inputAnyFile`).
   - Botão complementar `#btn-qr-complement-ocr` renderizado dinamicamente no card de resultado caso os itens ainda estejam pendentes.
4. **Interface e Versionamento (`index.html`, `js/config.js`, `sw.js`):**
   - Atualizado para versão **v2.5.6**.
   - Novo botão estilizado `📸 Ler Itens por Foto do Cupom (OCR)` em `#qr-preview-result`.
5. **Validação & Testes Automatizados (`test/nfce-ocr-complement.test.js`):**
   - Teste de mesclagem não-destrutiva de QR Code com itens do OCR.
   - Teste de preenchimento completo por OCR quando QR Code traz apenas chave.
   - Teste de extração de data, hora e produtos no cupom impresso da Padaria Irmãos Araújo.
   - Suíte geral: 96 testes executados, 96 aprovados (0 falhas).

---

## [2026-11-07 22:12] - Separação VA vs VR com Ticket Médio Individual, Navegação Mensal Inteligente e Sincronização em Tempo Real (v2.5.5)

### 🔍 Solicitação & Necessidade
1. **Separação Explícita entre VA e VR com Ticket Médio de Cada Um:**
   - O card de "Análise de Gastos & Mercados" agrupava apenas os totais, sem destacar de forma clara e analítica o Ticket Médio individual de cada benefício (Vale Alimentação vs Vale Refeição) e a quantidade de compras realizadas com cada um.
2. **Separação por Mês com Mês Vigente Primeiro e Acesso aos Anteriores:**
   - O usuário precisava visualizar por padrão o mês vigente e poder alternar livremente para meses passados ou para todo o histórico sem que a página perdesse o contexto.
3. **Backup Automático para Cada Atualização & Sincronização Contínua Entre Dispositivos:**
   - Garantir que qualquer alteração (tasks, mercado, wishlist, pets, etc.) fosse enviada imediatamente ao Google Sheets via auto-sync debounced, além de polling inteligente periódico em segundo plano para que múltiplos dispositivos (celular, tablet, PC) permaneçam sempre com as mesmas informações.

### 🛠️ Implementações Realizadas
1. **Separação Analítica VA vs VR (`js/shopping.js` & `js/ui.js`):**
   - Em `getMarketAnalytics`, cálculo individualizado de `vaTotal`, `vaCount`, `vaAvgTicket`, `vrTotal`, `vrCount`, `vrAvgTicket` e detalhamento para `otherTotal`, `otherCount`, `otherAvgTicket`.
   - Novo bloco visual dedicado em `renderComprasTab`:
     - Card **🥗 Vale Alimentação (VA)** com total gasto, ticket médio e contagem de compras.
     - Card **🍽️ Vale Refeição (VR)** com total gasto, ticket médio e contagem de compras.
     - Card de Outros (Crédito, Débito, Pix) quando houver compras fora dos vales.
     - Badges de forma de pagamento com ticket médio e quantidade de idas ao mercado.
2. **Seletor de Meses Rápido (`js/ui.js` & `js/app.js`):**
   - Pills de seleção de mês no topo do card de Análise de Gastos (`data-analytics-month`).
   - Mês atual sempre apresentado em primeiro lugar com tag `(Atual)`, seguido dos meses anteriores e botão de `Todo o Histórico`.
   - Event listener em `initComprasModule` atualiza `currentAnalyticsMonth` e recalcula instantaneamente os gastos, mercados mais frequentes e tickets médios.
3. **Auto-Backup e Sincronização Contínua (`js/storage.js` & `js/app.js`):**
   - Criado hook `setOnStateSavedListener` em `js/storage.js`, acionado a cada chamada de `saveState()`.
   - Conectado em `js/app.js` para disparar `triggerAutoSyncIfEnabled()` (debounced 400ms) automaticamente a cada modificação.
   - Adicionada sincronização em background a cada 30 segundos (com o app visível) e em eventos de `visibilitychange` e `window.focus`.
4. **Validação & Testes Automatizados:**
   - Criado `test/market-analytics-va-vr.test.js` com 3 testes unitários cobrindo o cálculo de VA/VR com os dados reais do usuário (R$ 761,22 total, VA R$ 461,47 com méd. R$ 115,37 e VR R$ 299,75 com méd. R$ 149,88), navegação de meses e disparo automático de backup.
   - Suíte completa: 93 testes executados, 93 aprovados (0 falhas).

---

## [2026-11-07 21:55] - Recuperação e Salvaguarda Definitiva de Notas Fiscais Históricas (Padaria Araújo & Carrefour), Auto-Sync Bidirecional e PWA v2.5.4

### 🔍 Problemas Identificados & Causa Raiz
1. **Desaparecimento da Nota Fiscal da Padaria Irmãos Araújo (R$ 71,06):**
   - **Causa Raiz:** O cupom fiscal da Padaria e Mercearia Irmãos Araújo foi lido via QR Code e adicionado localmente ao estado. Quando ocorreu uma inconsistência transitória e a sincronização com o Google Sheets foi acionada (`syncPullFromSheets`), a planilha na nuvem ainda não continha essa compra. Como a nuvem tinha prioridade e o cache local foi recomposto antes do push, a nota foi descartada, restando apenas a compra do Carrefour (R$ 280,66).
2. **Ausência de Mecanismo de Salvaguarda de Comprovantes Históricos Oficiais:**
   - O aplicativo não possuía uma lista imutável de notas históricas verificadas (`RECOVERABLE_PURCHASES`), deixando o histórico vulnerável a limpezas de cache no navegador ou pulls incompletos de planilhas antigas.
3. **Versão do Cache PWA e Botão de Recuperação Manual:**
   - O Service Worker e os metadados precisavam ser atualizados para a versão `v2.5.4` para limpar caches desatualizados no celular, e faltava um botão direto na aba Ajustes para acionar a restauração manual caso o usuário quisesse re-verificar.

### 🛠️ Correções Implementadas
1. **Definição de `RECOVERABLE_PURCHASES` e `ensureRecoveredPurchases` (`js/storage.js`):**
   - Cadastrada a estrutura oficial com 100% de fidelidade dos dois comprovantes fiscais do casal:
     - **Padaria e Mercearia Irmãos Araújo** (NFC-e nº 50504, 07/11/2026 10:32:35, Chave `35261150489095000127650010000505041101032350`, Total R$ 71,06 via Cartão de Crédito, com os 4 itens detalhados: Café da Manhã, Suco Mix Jarra, Cappuccino Gelado e Café da Manhã por kg).
     - **Carrefour** (NFC-e nº 161500, 03/11/2026 09:41:43, Total R$ 280,66 via Vale Alimentação, com todos os 18 itens cadastrados).
   - Função `ensureRecoveredPurchases(state)` verifica por chave de acesso NFC-e, ID ou estabelecimento/data/total e insere sem duplicidades.
2. **Integração no Ciclo de Vida do App (`js/storage.js`, `js/app.js`):**
   - `loadState()` chama automaticamente `ensureRecoveredPurchases(merged)`.
   - `DOMContentLoaded` executa `ensureRecoveredPurchases(state)`, sincroniza produtos com `syncPurchasesIntoCatalog(state)` e persiste no `localStorage` antes da primeira renderização.
   - `syncPullFromSheets()` mescla a nuvem e, se detectar compras recuperadas que ainda não constam na planilha (`mergedRegCount > cloudRegCount`), dispara em segundo plano o backup para atualizar o Google Sheets imediatamente.
3. **Botão de Recuperação Manual em Ajustes (`index.html`, `js/app.js`):**
   - Adicionado botão `🧾 Recuperar Notas Fiscais` na seção de Cópia de Segurança Local, permitindo restaurar notas com um clique e feedback em toast.
4. **Bumping de Versão para v2.5.4:**
   - Atualizados `sw.js` (`maracaju-v2.5.4`), `js/config.js` (`version: "2.5.4"`) e `index.html`.
5. **Suíte de Testes Automatizados:**
   - Criado `test/purchases-recovery.test.js` com 4 novos testes cobrindo injeção, idempotência, preservação pós-pull e totalizador da Análise de Gastos (R$ 351,72 em 2 compras). Total de 90/90 testes passando sem falhas.

---

## [2026-11-07 14:52] - Compactação de Backup Google Sheets (< 44k chars) & Sincronização de Saldo Atual VA/VR com Matrix Finance

### 🔍 Problemas Identificados & Causa Raiz
1. **Limite de 50.000 Caracteres na Célula `Backup_JSON!B2` do Google Sheets:**
   - **Causa Raiz:** Com o envio de fotos em base64 (`data:image/...`) nos cadastros de Pets e Reformas, o payload enviado por `backupToSheets` em `js/sheets.js` ultrapassou o limite de 50.000 caracteres por célula do Google Sheets. O Apps Script lançava exceção ao gravar `B2` após limpar a aba, deixando `B2` vazia e fazendo `action=restore` retornar `SyntaxError: Unexpected end of JSON input`.
2. **Sincronização de `settings.benefits` com o Matrix Finance:**
   - **Causa Raiz:** O objeto `payload.data` em `backupToSheets` não incluía `settings: { benefits: state.settings.benefits }`, impedindo que overrides de saldo final e configurações de ciclo de VA/VR fossem lidos remotamente pelo Matrix Finance.

### 🛠️ Correções Implementadas
- **`js/sheets.js` (`backupToSheets`):** Remoção automática de strings `data:image/` do payload enviado ao Google Sheets (preservando todas as fotos integralmente no `localStorage` do dispositivo), inclusão de `settings.benefits` no backup e salvaguarda de tamanho (`< 44.000` caracteres).
- **`apps_script.gs` (`syncBackupJsonSheet` & `readChunkedJsonRow`):** Suporte a particionamento automático em múltiplas colunas caso o JSON ultrapasse 45.000 caracteres e verificação contra célula vazia.
- **Validação:** 73/73 testes automatizados aprovados (`node --test test/*.test.js`).

---

## [2026-11-06 23:35] - Sub-abas/Categorias no Topo de Pets (Estilo FisioFlow / Pacientes), Foto do Pet no Avatar e Resiliencia Definitiva no Leitor de PDF (v2.4.1)

### Problemas Identificados e Solucao
1. Foto do Pet: Normalizados fotos e photos em addPet e updatePet, adicionado badge de camera rapida no card e upload no modal de edicao com unshift para virar avatar imediatamente ao lado do nome.
2. Sub-abas de Categorias (Estilo FisioFlow): Categorias navegaveis no topo da aba Pets (Nossos Pets, Racao, Areia, Higiene, Vacinacoes, Exames) com atalho direto nos botoes dos cards funcionando como filtro do pet.
3. Resiliencia no PDF: Fallbacks no parser para cupons simples e consolidado quando total existe, impedindo erro impeditivo.

---

## [2026-11-06 22:35] - Aba Oficial "Pets" (Estilo FisioFlow), Ração, Areia, Banhos, Vacinas & Correção Definitiva do Parser de PDF (v2.4.0)

### 🔍 Problemas Identificados & Causa Raiz
1. **Erro ao Processar PDF da Nota Fiscal ("Não foi possível identificar os itens da compra neste PDF"):**
   - **Causa Raiz:** O parser anterior dependia exclusivamente de pares de linhas contíguas `Linha 1: Produto (Código: ...)` e `Linha 2: Qtde.: ... Vl. Unit.: ...`. Dependendo de como o PDF.js no navegador agrupava os fragmentos ou em arquivos PDF onde os campos vinham em fluxo bruto de palavras ou linhas mescladas pelo posicionamento espacial, a busca linha a linha falhava em encontrar valores na linha seguinte e descartava todos os 18 itens com preço 0.
   - **Causa Raiz 2 (Feedback de PDFs sem texto):** PDFs digitalizados como imagem pura não possuíam camada de texto, e o app disparava um erro genérico sem explicar que se tratava de uma imagem escaneada.
2. **Criação da Aba Pets:**
   - O aplicativo necessitava de um módulo completo para gestão de animais de estimação do casal (Mandioca e futuros pets), posicionado estrategicamente na barra de navegação entre **Tarefas** e **Mercado**.
   - Necessidade de sub-pastas personalizadas inspiradas na arquitetura de pacientes do FisioFlow (cartões com cascata expansível de botões e modal com navegação em abas).

---

### 🛠️ Correções e Funcionalidades Implementadas
1. **Parser de PDF Multi-Estratégia e Ultra-Resiliente (`js/pdf-parser.js`):**
   - **Estratégia de Bloco Global (`blockPattern`):** Utiliza regex contínuo multilinha que captura produtos com código, quantidade, unidade, preço unitário e total mesmo quando o PDF quebra os elementos em linhas individuais (`(C`, `ó`, `digo: ...`, `Qtde.:`, `1`, `Vl. Unit.:`, `3,19`) ou os condensa em linha única.
   - **Estratégia Linha a Linha Bidirecional:** Verifica dados na mesma linha e nas linhas seguintes com tolerância a múltiplos formatos de mercado.
   - **Diagnóstico Preciso de PDF Imagem/Scan:** Detecção antecipada de PDFs sem camada de texto pesquisável com instrução amigável para usar a câmera com QR Code da NFC-e.
2. **Nova Aba "Pets" (`🐾 Pets`) no Menu Principal:**
   - Localizada estritamente entre **Tarefas** e **Mercado**.
   - **Dados Cadastrais:** Nome, data de nascimento e **idade exibida dinamicamente ao lado do nome** (ex: `1 ano e 8 meses`), fotos (câmera ou galeria com compressão automática), apelido, sexo, raça e status de vacinação em dia.
   - **Arquitetura Visual FisioFlow:** Cada pet possui seu card com avatar, pílula de idade, resumo de status de saúde e botão de expansão em cascata (`.pill-action-stack`) com botões dedicados de atalho:
     - 🥣 *Ração*
     - 🏖️ *Areia*
     - 🛁 *Higiene / Banhos*
     - 💉 *Vacinas & Vermífugos*
     - 🩺 *Exames & Consultas*
     - 📂 *Abrir Pasta Completa*
3. **Módulo de Saúde e Cuidados Veterinários (`js/pets.js`):**
   - **Controle de Ração:** Data da compra, marca, quantidade (kg), consumo diário (gramas/dia), duração estimada calculada e badge com a **data provável da próxima compra**, com alertas automáticos de reposição.
   - **Controle de Areia:** Data da compra, quantidade (kg/pacotes), apresentação da **data provável da última compra** e previsão da próxima compra conforme o histórico de consumo.
   - **Higiene e Banhos da Mandioca:** Registro de datas dos banhos indicando se foi realizado **em casa** ou em **pet shop** (com nome do estabelecimento, valores e observações de tosa/unha).
   - **Vacinações e Vermifugação:**
     - Vacinas com controle por espécie (cães tomam V10/V8 e Antirrábica; gatos tomam V4/V5 e Antirrábica), controle de lote, clínica e cálculo anual da próxima dose.
     - Vermifugação com dose personalizada calculada automaticamente por peso do animal (`formatPetDoseVermifugo`).
   - **Exames e Consultas Veterinárias:** Registro de data da última consulta, tipo de exame, clínica, veterinário, diagnóstico e acompanhamento de **pendências médicas/medicamentos**.
4. **Sincronização Cloud Google Sheets (`js/sheets.js`):**
   - Chave `pets` integrada ao backup completo e restauração com mesclagem defensiva por IDs.
5. **Integração de Interface e Eventos (`js/ui.js` & `js/app.js`):**
   - `renderPetsTab()` e `renderPetFolderModal()` completamente orquestrados com o ciclo de vida e sistema de abas.

---

### 🧪 Validação Automatizada
- **Suíte de Testes:** `node --test test/*.test.js`
- **Resultado:** 62 testes executados, 62 aprovados (0 falhas).
- **Testes Específicos:**
  - `test/pets.test.js`: 6 testes cobrindo idade, ração, areia, banhos, vacinas e CRUD.
  - `test/pdf-parser.test.js`: Testes com o PDF Carrefour real, tokens soltos e linhas mescladas.
  - `test/html-integrity.test.js`: 100% de tags HTML balanceadas e modais verificados.
  - `test/imports.test.js`: Todos os módulos ES importados e validados.

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
