# 🏠 Maracaju 88 - Gestão do Lar, Gamificação & Sonhos do Casal

> Aplicativo PWA progressivo, moderno e gamificado feito especialmente para o dia a dia do casal no **Maracaju 88**. Permite gerenciar rotinas de limpeza, verificar o que foi feito ou não diariamente, planejar reformas e melhorias na casa, cultivar sonhos conjuntos e manter backup sincronizado em tempo real com o **Google Sheets**.

---

## 🌟 Principais Recursos

### 1. 🧹 Tarefas Diárias & Rotina Gamificada
- **Gamificação Divertida**: Ganhe pontos de experiência (**XP**) a cada tarefa concluída (+10 XP leve, +25 XP média, +50 XP pesada).
- **Sequência de Dias (Streak 🔥)**: Mantenha a sequência ativa cuidando da casa todos os dias.
- **Celebração com Confetti e Som**: Chuva de confetti animada via Canvas e efeitos sonoros gerados nativamente via Web Audio API.
- **Seletor de Quem Fez**: Alterne com 1 toque entre **Matheus** e **Esposa** para pontuar o perfil de quem realizou a tarefa.
- **Filtro por Cômodos**: Cozinha 🍳, Sala 🛋️, Quartos 🛏️, Banheiros 🚿, Lavanderia 🧺 e Cuidados Gerais/Plantas 🪴.
- **Tarefas Customizadas**: Adicione novas tarefas com frequência, esforço e instruções personalizadas.

### 2. 📅 Histórico & Verificação Diária
- **Verificação Dia a Dia**: Navegue entre os dias (Hoje, Ontem ou qualquer data no calendário) para auditar exatamente o que foi feito e o que ficou pendente.
- **Registro Detalhado**: Saiba quem realizou a tarefa, em qual horário e quantos XP foram conquistados.
- **Mini Calendário de Consistência**: Visualize o percentual de tarefas concluídas nos últimos 7 dias.

### 3. 🔨 Reformas & Melhorias na Casa
- **Controle de Projetos**: Registre ideias de melhorias organizadas por status:
  - 💡 *Ideia / Planejamento*
  - 📐 *Em Orçamento*
  - 🛠️ *Em Andamento*
  - ✅ *Concluído*
- **Controle Orçamentário**: Estimativa de custo (R$) vs Gasto real investido.
- **Checklist de Etapas**: Subtarefas interativas (ex: pesquisar materiais, contratar mão de obra, comprar tintas).

### 4. ✨ Mural dos Sonhos & Metas
- **Bucket List do Casal**: Categorias de *Viagens* ✈️, *Casa & Conforto* 🏡, *Conquistas* 🚗 e *Vida a Dois* 💖.
- **Metas Financeiras e Prazos**: Estipule metas de valor e datas alvo.
- **Marcos para Realização**: Acompanhe o percentual de passos concluídos até alcançar o sonho.

### 5. 🏆 Placar & Conquistas Desbloqueáveis
- **Níveis do Lar**: De *Iniciantes do Lar* (Nível 1) até *Reis do Maracaju 88* e *Lenda Doméstica Suprema*.
- **Divisão Saudável de Tarefas**: Gráfico comparativo de XP entre Matheus e Esposa.
- **Badges / Conquistas**: Desbloqueie medalhas exclusivas como *Semana Impecável*, *Mestre da Cozinha*, *Casa dos Sonhos* e muito mais.

### 6. ☁️ Backup & Sincronização no Google Sheets
- **Integração sem Servidor**: Utiliza um script do Google Apps Script (`apps_script.gs`) vinculado à sua planilha Google pessoal.
- **Abas Formatadas Automaticamente na Planilha**:
  - `Resumo_Geral`: Nível, XP do casal, streak e estatísticas.
  - `Tarefas`: Lista de todas as tarefas cadastradas.
  - `Historico_Log`: Log diário de cada tarefa realizada com data, horário e responsável.
  - `Reformas`: Projetos, orçamentos e status.
  - `Sonhos`: Sonhos e metas.
  - `Backup_JSON`: Snapshot integral para restauração exata com 1 clique.
- **Backup Local**: Botões de Exportar e Importar arquivo JSON para garantia offline total.

---

## 🚀 Como Instalar o Backup no Google Sheets (Passo a Passo)

1. Abra o [Google Sheets](https://sheets.google.com) e crie uma nova planilha (ex: `Maracaju 88 - Dados`).
2. No menu superior da planilha, clique em: **Extensões** > **Apps Script**.
3. Apague todo o conteúdo que estiver no editor e cole o código completo do arquivo [`apps_script.gs`](./apps_script.gs).
4. *(Opcional)* Se desejar alterar o token de segurança, mude a constante `SHARED_SECRET` no topo do arquivo.
5. Salve o projeto no Apps Script (**Ctrl + S**).
6. Clique no botão azul **Implantar** (canto superior direito) > **Nova implantação**.
7. Clique no ícone de engrenagem ⚙️ (Selecionar tipo) > **App da Web**.
8. Preencha as opções:
   - **Descrição**: `Maracaju 88 Web API`
   - **Executar como**: `Eu (seu e-mail)`
   - **Quem pode acessar**: `Qualquer pessoa` *(necessário para o aplicativo web enviar o backup)*
9. Clique em **Implantar** e autorize as permissões de acesso da sua conta Google.
10. Copie a **URL do App da Web** gerada (termina com `/exec`).
11. No aplicativo Maracaju 88, vá até a aba **Ajustes** (⚙️), cole a URL e a chave secreta e clique em **Testar Conexão** e depois em **Fazer Backup Agora**!

---

## 📱 Como Usar como Aplicativo no Celular (PWA)

O Maracaju 88 é uma **Progressive Web App (PWA)** completa com Service Worker, manifesto e ícones de alta resolução:

- **No iPhone / iPad (Safari)**:
  1. Acesse o app no Safari.
  2. Toque no botão de **Compartilhar** (ícone de quadrado com seta para cima).
  3. Escolha **"Adicionar à Tela de Início"**.
  4. O app terá seu próprio ícone e abrirá em tela cheia como um aplicativo nativo!

- **No Android (Chrome)**:
  1. Acesse o app no Chrome.
  2. Toque nos três pontinhos no canto superior direito.
  3. Toque em **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

- **No Computador (Chrome/Edge)**:
  1. Clique no ícone de computador/instalação no canto direito da barra de endereço.
  2. Clique em **"Instalar"**.

---

## 📂 Arquitetura do Projeto (Pensada para Expansão Contínua)

O código foi estruturado em módulos limpos, sem dependências externas pesadas e com fácil manutenibilidade:

```
maracaju88/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Deploy automático no GitHub Pages
├── css/
│   ├── variables.css           # Design tokens, cores, espaçamentos
│   ├── base.css                # Layout responsivo, cabeçalho e navegação
│   ├── components.css          # Cards, checklists, modais, botões e toasts
│   └── animations.css          # Efeitos visuais, confetti e brilho de nível
├── js/
│   ├── config.js               # Dados iniciais, cômodos, níveis e badges
│   ├── storage.js              # Gerenciador do localStorage, backup JSON e migrações
│   ├── audio.js                # Sintetizador Web Audio (efeitos sonoros nativos offline)
│   ├── gamification.js         # Cálculos de XP, níveis, streaks e desbloqueio de badges
│   ├── tasks.js                # Ciclo de vida das tarefas diárias e pontuação
│   ├── history.js              # Auditoria diária de tarefas feitas vs pendentes
│   ├── reformas.js             # Gestão de reformas e orçamentos da casa
│   ├── sonhos.js               # Mural de sonhos e marcos
│   ├── sheets.js               # Conexão e sincronização com Google Apps Script
│   ├── ui.js                   # Renderização das abas, animação de confetti e modais
│   └── app.js                  # Ponto de entrada, Service Worker e eventos
├── icons/
│   ├── icon.svg                # Ícone vetorial base
│   ├── icon-192.png            # Ícone 192x192 para Android/PWA
│   ├── icon-512.png            # Ícone 512x512 para PWA
│   ├── apple-touch-icon.png    # Ícone para iOS
│   └── favicon.png             # Favicon
├── scripts/
│   └── generate-icons.ps1      # Script de regeneração de ícones
├── test/
│   └── app.test.js             # Testes unitários das regras de negócio
├── apps_script.gs              # Código do Google Apps Script para a planilha
├── index.html                  # Interface única, semântica e acessível
├── manifest.json               # Manifesto PWA
├── sw.js                       # Service Worker com cache offline (Stale-While-Revalidate)
├── package.json                # Metadados do projeto e scripts de teste
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Documentação completa
```

---

## 🧪 Rodando os Testes

Para rodar os testes automatizados de regras de negócio:

```bash
node --test test/app.test.js
```

---

## 💖 Feito para o Maracaju 88
*Construído com carinho para organizar a rotina, cuidar da nossa casa e realizar todos os nossos sonhos juntos.*
