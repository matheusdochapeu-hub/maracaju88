# 🏠 Maracaju 88 - Gestão do Lar, Gamificação, Carro & Sonhos do Casal

> Aplicativo PWA progressivo, moderno e gamificado feito especialmente para o dia a dia do casal no **Maracaju 88**. Permite gerenciar rotinas domésticas (**diárias, semanais, mensais e anuais**), acompanhar manutenções do **carro** com fotos e links de peças, verificar o que foi feito ou não diariamente, planejar reformas da casa, cultivar sonhos conjuntos e manter backup sincronizado em tempo real com o **Google Sheets**.

---

## 🌟 Principais Recursos

### 1. 🧹 Tarefas Divididas por Periodicidade (Diárias, Semanais, Mensais e Anuais)
- **Divisão Clara por Ciclos:**
  - ☀️ **Diárias:** Louça, fogão/bancada, lixo da pia, arrumar cama, guardar roupas, lixo do banheiro.
  - 📅 **Semanais:** Lavar box/sanitário, trocar roupa de cama e toalhas, passar pano na casa toda, lavar roupas, tirar pó.
  - 🗓️ **Mensais:** Limpeza profunda de geladeira, fornos e micro-ondas, vidros e janelas, tapetes, lavagem da máquina.
  - 🎯 **Anuais:** Lavar cortinas, higienização de sofás e estofados, revisão de calhas e telhado, limpeza de caixa d'água, dedetização.
- **Filtro Secundário por Cômodos:** Cozinha 🍳, Sala 🛋️, Quartos 🛏️, Banheiros 🚿, Lavanderia 🧺, Cuidados/Plantas 🪴 e Garagem 🚗.
- **Gamificação Divertida:** Ganhe pontos de experiência (**XP**) a cada tarefa concluída (+10 XP leve, +25 XP média, +50 XP pesada).
- **Sequência de Dias (Streak 🔥):** Mantenha a sequência ativa cuidando da casa todos os dias.
- **Celebração com Confetti e Som:** Chuva de confetti animada via Canvas e efeitos sonoros nativos via Web Audio API.
- **Seletor de Quem Fez:** Alterne com 1 toque entre **Matheus** e **Scarlet** para pontuar o perfil de quem realizou a tarefa.

### 2. 🚗 Aba do Carro & Manutenção (Fotos, Links e Peças)
- **Controle Completo do Veículo:**
  - Categorias: 🛢️ *Revisão & Óleo*, 🔧 *Mecânica Geral*, 🛞 *Pneus & Freios*, ✨ *Estética & Lavagem*, 🔌 *Elétrica & Acessórios*.
- **Fotos Direto do Celular:**
  - Anexe fotos de peças, notas, orçamentos ou referências tiradas com a câmera do celular ou da galeria.
  - As fotos são **comprimidas automaticamente** via Canvas nativo (~40-70KB) para não pesar na memória.
  - Toque na foto para visualizar em tamanho ampliado.
- **Links Úteis:**
  - Guarde links diretos para compras no Mercado Livre, Shopee, manuais e vídeos de tutoriais do YouTube.
- **Controle por KM e Data:** Acompanhe a quilometragem alvo para trocas de óleo, pneus e revisões.
- **Checklist e Orçamento:** Subtarefas de cada manutenção e controle de custo estimado vs gasto real.

### 3. 📅 Histórico & Verificação Diária
- **Verificação Dia a Dia:** Navegue entre os dias (`◀ Ontem`, `Hoje`, `Amanhã ▶` ou qualquer data no calendário) para auditar exatamente o que foi feito e o que ficou pendente.
- **Registro Detalhado:** Saiba quem realizou a tarefa, em qual horário e quantos XP foram conquistados.
- **Mini Calendário de Consistência:** Visualize o percentual de tarefas concluídas nos últimos 7 dias.

### 4. 🔨 Reformas & Melhorias na Casa
- **Controle de Projetos:** Registre ideias de melhorias organizadas por status (💡 *Ideia*, 📐 *Em Orçamento*, 🛠️ *Em Andamento*, ✅ *Concluído*).
- **Controle Orçamentário:** Estimativa de custo (R$) vs Gasto real investido.
- **Checklist de Etapas:** Subtarefas interativas por projeto.

### 5. 🏆 Placar & Conquistas Desbloqueáveis
- **Níveis do Lar:** De *Iniciantes do Lar* (Nível 1) até *Reis do Maracaju 88* e *Lenda Doméstica Suprema*.
- **Divisão Saudável de Tarefas:** Gráfico comparativo de XP entre Matheus e Scarlet.
- **Badges / Conquistas:** Desbloqueie medalhas exclusivas como *Piloto do Maracaju*, *Semana Impecável*, *Chef da Louça*, etc.

### 6. 🔐 Acesso Exclusivo & Validação dos Moradores
- **Portão de Entrada Restrito:** Apenas duas contas de e-mail autorizadas possuem acesso ao sistema:
  - 👨‍💻 **Matheus:** `matheusdochapeu@gmail.com`
  - 👩‍💼 **Scarlet:** `scarletsantos7@gmail.com`
- **Atalho Rápido de 1 Toque:** No celular, basta selecionar o morador para validação imediata sem atrito.
- **Bloqueio de Intrusos:** Qualquer e-mail não listado é imediatamente barrado.
- **Sessão Persistente:** O acesso fica salvo com segurança no aparelho com opção de troca rápida de usuário ou logout.

### 7. ☁️ Backup & Sincronização no Google Sheets
- **Abas Formatadas na Planilha:**
  - `Resumo_Geral`: Nível, XP do casal, streak e estatísticas.
  - `Tarefas`: Lista de todas as tarefas cadastradas (com periodicidade).
  - `Historico_Log`: Log diário de cada tarefa com data, horário e responsável.
  - `Carro`: Manutenções do carro, orçamentos, KM e links.
  - `Reformas`: Projetos da casa e custos.
  - `Sonhos`: Sonhos e metas do casal.
  - `Backup_JSON`: Snapshot integral para restauração com 1 clique.

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
