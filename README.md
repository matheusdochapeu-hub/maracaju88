# 🏠 Maracaju - Gestão do Lar, Mercado, Carro, Reformas & Sonhos do Casal

> Aplicativo PWA progressivo, moderno e elegante feito especialmente para a gestão do lar de **Matheus** e **Scarlet** no **Maracaju**. Permite gerenciar rotinas domésticas com periodicidades personalizáveis, montar a **lista de compras de mercado colaborativa**, registrar compras escaneando o **QR Code da nota fiscal (NFC-e)** com separação por mês, acompanhar manutenções do **carro** com fotos e links, planejar **reformas** da casa, cultivar **sonhos** conjuntos, definir categorias com emojis, autenticar com **senhas individuais e biometria do celular**, com suporte a valores com centavos (`R$ 264,33`) e backup sincronizado no **Google Sheets**.

---

## 🌟 Principais Recursos

### 1. 🧹 Tarefas do Lar (Diárias, Semanais, Mensais e Anuais) com Edição
- **Divisão Clara por Ciclos:**
  - ☀️ **Diárias:** Louça, fogão/bancada, lixo da pia, arrumar cama, guardar roupas, lixo do banheiro.
  - 📅 **Semanais:** Lavar box/sanitário, trocar roupa de cama e toalhas, passar pano na casa toda, lavar roupas, tirar pó.
  - 🗓️ **Mensais:** Limpeza profunda de geladeira, fornos e micro-ondas, vidros e janelas, tapetes, lavagem da máquina.
  - 🎯 **Anuais:** Lavar cortinas, higienização de sofás e estofados, revisão de calhas e telhado, limpeza de caixa d'água, dedetização.
- **Edição Completa de Tarefas (✏️):** Permite alterar título, cômodo/categoria, responsável padrão e mudar periodicidade a qualquer momento.
- **Filtro por Cômodos e Categorias Personalizadas:** Cozinha 🍳, Sala 🛋️, Quartos 🛏️, Banheiros 🚿, Lavanderia 🧺, Cuidados/Plantas 🪴 e Garagem 🚗, com suporte a criação de novas categorias com emojis customizados.
- **Seletor de Quem Fez:** Alterne com 1 toque entre **Matheus** e **Scarlet** para registrar quem realizou a tarefa.

### 2. 🛒 Mercado & Lista de Compras com Leitor de Nota Fiscal (NFC-e)
- **Lista de Compras do Mês Colaborativa:** Matheus e Scarlet adicionam itens conforme forem lembrando durante o mês, com quantidade, preço estimado, quem lembrou e observações.
- **Leitor de QR Code de Nota Fiscal (NFC-e):**
  - Câmera integrada com guia de leitura e mira laser.
  - Suporte a upload de foto do QR Code ou entrada de chave de 44 dígitos / link SEFAZ.
  - Extração automática de dados: Supermercado (detecção inteligente de CNPJs de Carrefour, Pão de Açúcar, Assaí, Atacadão, etc.), data da compra e valor total com centavos.
- **Histórico Mensal de Compras:** Compras agrupadas automaticamente por mês com total acumulado por período.
- **Limpeza Rápida de Comprados:** Botão para limpar itens concluídos mantendo a lista enxuta.

### 3. 💵 Suporte a Valores com Centavos em Todo o App
- Suporte a valores quebrados com centavos (ex: `R$ 264,33`, `264,33` ou `264.33`) em todas as categorias: Mercado, Carro, Reformas e Sonhos.
- Teclado numérico decimal otimizado para celulares (`inputmode="decimal"`).

### 4. 🏷️ Categorias e Emojis Personalizáveis
- Crie, edite e personalize categorias e emojis para filtros em Tarefas, Mercado, Carro, Reformas e Sonhos.
- Grade de emojis rápidos e visualização em tempo real do chip de filtro.

### 5. 🚗 Aba do Carro & Manutenção (Fotos, Links e Peças)
- **Controle Completo do Veículo:** Revisão & Óleo, Mecânica Geral, Pneus & Freios, Estética & Lavagem, Elétrica & Acessórios.
- **Fotos e Links Direto do Celular:** Anexe fotos da peça ou defeito (comprimidas automaticamente client-side para ~40-70KB) e links de compras (Mercado Livre, lojas de autopeças).
- **Checklist e Orçamento:** Subtarefas interativas e previsão orçamentária.

### 6. 🔨 Reformas & Melhorias na Casa (Fotos, Inspirações e Links)
- **Controle de Projetos:** Status de Ideia, Em Orçamento, Em Andamento e Concluído.
- **Fotos e Inspirações:** Galeria com upload de fotos da câmera/galeria com visualizador ampliado.
- **Links e Lojas:** Links diretos de lojas (Leroy Merlin, Pinterest, Mercado Livre).
- **Controle Orçamentário:** Estimativa de custo vs Gasto real investido.

### 7. ✨ Mural dos Sonhos & Metas
- **Planejamento do Casal:** Categorias para Viagens ✈️, Casa & Conforto 🏡, Conquistas 🚗 e Vida a Dois 💖.
- **Controle de Metas:** Valor alvo com centavos e marcos intermediários.

### 8. 📅 Histórico & Verificação Diária
- **Verificação Dia a Dia:** Navegue entre os dias (`◀ Ontem`, `Hoje`, `Amanhã ▶` ou selecione data no calendário) para auditar exatamente o que foi feito e o que ficou pendente.
- **Mini Calendário de Consistência:** Visualize o percentual de tarefas concluídas nos últimos 7 dias.

### 9. 🔐 Senhas Individuais & Desbloqueio por Biometria do Celular
- **Acesso Restrito Exclusivo:** Matheus (`matheusdochapeu@gmail.com`) e Scarlet (`scarletsantos7@gmail.com`).
- **Senhas Pessoais / PINs:** Cada morador pode configurar sua própria senha ou PIN na aba Ajustes.
- **Biometria do Celular (WebAuthn):** Desbloqueio rápido utilizando Face ID, Touch ID / Impressão Digital ou bloqueio de tela do smartphone.

### 10. ☁️ Backup & Sincronização no Google Sheets
- Sincronização automática e manual com planilha Google pessoal via Apps Script.

---

## 📲 Como Instalar o App no Celular (Passo a Passo)

Abra o link no celular: **[https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)**

### No iPhone / iPad (Safari):
1. Abra o link no navegador **Safari**.
2. Toque no botão de **Compartilhar** (ícone de quadrado com uma seta para cima `⎋` no rodapé da tela).
3. Role as opções para baixo e toque em **"Adicionar à Tela de Início"** (ícone `+`).
4. Toque em **"Adicionar"** no canto superior direito.
5. Pronto! O aplicativo terá seu próprio ícone no seu celular e abrirá em tela cheia como um app nativo.

### No Android (Google Chrome):
1. Abra o link no **Google Chrome**.
2. Toque no botão verde **"📲 Instalar App"** no topo da tela (ou toque nos três pontinhos `⋮` no topo direito).
3. Toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

---

## 🧪 Rodando os Testes

Para executar os testes unitários das regras de negócio:

```bash
node --test test/app.test.js
```
