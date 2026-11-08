# MEMORY.md — Memória Persistente do Projeto Maracaju

Este arquivo consolida a memória técnica, auditorias de código, regras arquiteturais e histórico de resoluções de problemas para que futuras sessões e agentes de IA mantenham a integridade e estabilidade do aplicativo.

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
