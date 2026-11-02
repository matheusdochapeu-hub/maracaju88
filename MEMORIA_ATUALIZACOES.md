# Memória de Atualizações — Maracaju 88 (`maracaju88`)

**Data da criação e consolidação:** `01/11/2026`  
**Repositório GitHub:** [https://github.com/matheusdochapeu-hub/maracaju88](https://github.com/matheusdochapeu-hub/maracaju88)  
**App no Ar (PWA / GitHub Pages):** [https://matheusdochapeu-hub.github.io/maracaju88/](https://matheusdochapeu-hub.github.io/maracaju88/)  
**Versão:** `v1.0.0`

---

## 1. Visão Geral do Aplicativo
O **Maracaju 88** foi desenvolvido sob medida para Matheus e sua esposa gerenciarem a rotina doméstica, tarefas de limpeza, acompanhamento diário, ideias de reformas/melhorias e mural dos sonhos com gamificação divertida e backup no Google Sheets.

### Diretrizes Centrais de Engenharia:
- **Zero Dependências Pesadas:** Desenvolvido em HTML5 semântico, CSS com variáveis (Design Tokens) e ES6 Modules nativos. Carregamento ultra-rápido (< 50ms).
- **Progressive Web App (PWA):** Manifesto completo, ícones em alta resolução (192px, 512px, Apple Touch e SVG) e Service Worker com estratégia de cache offline *Stale-While-Revalidate*.
- **Sem Dependência de Mídia Externa:** Sons de comemoração e fanfarra sintetizados em tempo real via **Web Audio API** e chuva de confetti em **HTML5 Canvas** (funciona 100% offline, sem requisições a arquivos externos de áudio ou vídeo).
- **Redundância Dupla de Dados:** Armazenamento instantâneo no `localStorage` do navegador + sincronização na nuvem com **Google Sheets** via **Google Apps Script** + exportação/importação de arquivo JSON.

---

## 2. Abas e Módulos Implementados

### Aba 1 — 🧹 Tarefas Diárias & Rotina Gamificada (`js/tasks.js`, `js/gamification.js`)
- **Filtro por Cômodos:**
  - 🍳 *Cozinha* (Louça, fogão/bancada, lixo orgânico)
  - 🛋️ *Sala* (Organizar almofadas, varrer/aspirar)
  - 🛏️ *Quartos* (Arrumar cama, guardar roupas)
  - 🚿 *Banheiros* (Pia, espelho, lixo, lavagem profunda)
  - 🧺 *Lavanderia* (Máquina de lavar, estender/dobrar roupas)
  - 🪴 *Cuidados & Plantas* (Regar plantinhas, passar pano com cheirinho)
- **Gamificação e Recompensas:**
  - Esforço Leve (+10 XP), Médio (+25 XP) e Pesado (+50 XP).
  - Checkbox gamificado com confirmação visual e efeito sonoro harmônico.
  - Sequência de dias seguidos (**Streak 🔥**) mantida ativa automaticamente.
  - Chuva de confetti animada a cada conclusão.
- **Atribuição do Casal:**
  - Botão no cabeçalho para alternar quem está marcando (*Matheus* ou *Esposa*).
  - Registro de quem concluiu cada tarefa no dia com timestamp.
  - Botão na tarefa para alterar o responsável preferencial (*Casal, Matheus, Esposa*).
- **Gestão de Tarefas:**
  - Modal para adicionar tarefas personalizadas com cômodo, esforço, responsável e observações.
  - Exclusão com confirmação.

---

### Aba 2 — 📅 Histórico & Verificação Diária (`js/history.js`)
- **Auditoria Dia a Dia:**
  - Navegação fácil com botões `◀ Ontem`, `Hoje`, `Amanhã ▶` e seletor livre no calendário.
  - Exibe a lista exata do que foi feito: *Nome da tarefa*, *Cômodo*, *Quem realizou*, *Horário da conclusão* e *XP recebido*.
  - Exibe a lista separada de tarefas que ficaram **pendentes** naquele dia.
- **Indicadores de Consistência:**
  - Barra interativa dos últimos 7 dias com círculos coloridos (Verde = 100%, Amarelo = Parcial, Cinza = Vazio) e percentual de cumprimento.
  - Placar do dia discriminando contribuição individual (tarefas e XP de Matheus vs Esposa).

---

### Aba 3 — 🔨 Reformas & Melhorias da Casa (`js/reformas.js`)
- **Painel Financeiro Consolidado:**
  - Total do Orçamento Estimado vs Total Realmente Investido até o momento.
- **Controle por Status:**
  - 💡 *Ideias / Planejamento*
  - 📐 *Em Orçamento*
  - 🛠️ *Em Andamento*
  - ✅ *Concluído*
  - Botão de transição de status com 1 toque no card.
- **Checklist de Etapas:**
  - Cada projeto de reforma possui subtarefas interativas com barra de progresso (ex: "comprar fita LED", "contratar eletricista", "orçar bancada").
- **Campos Detalhados:**
  - Título, cômodo, prioridade (*Baixa, Média, Alta, Urgente*), valor estimado, custo real, data alvo e descrição de inspirações/materiais.

---

### Aba 4 — ✨ Mural dos Sonhos & Metas do Casal (`js/sonhos.js`)
- **Bucket List Conjunta:**
  - Categorias: ✈️ *Viagens & Passeios*, 🏡 *Casa & Conforto*, 🚗 *Conquistas & Bens*, 💖 *Vida a Dois*.
- **Metas e Prazos:**
  - Meta de valor financeiro estipulado e data/ano desejado para realizar.
- **Marcos para Realização:**
  - Subtarefas de preparação para transformar o sonho em realidade (ex: pesquisar roteiro, tirar passaporte, reservar pousada) com barra de progresso dourada.

---

### Aba 5 — 🏆 Placar do Casal & Conquistas (`js/gamification.js`)
- **Níveis do Lar:**
  - Nível 1: *Iniciantes do Lar* (0 a 149 XP)
  - Nível 2: *Dupla Organizada* (150 a 399 XP)
  - Nível 3: *Mestres do Conforto* (400 a 799 XP)
  - Nível 4: *Guardiões da Casa* (800 a 1499 XP)
  - Nível 5: *Reis do Maracaju 88* (1500 a 2499 XP)
  - Nível 6: *Lenda Doméstica Suprema* (2500+ XP)
  - Barra de progresso para o próximo nível com XP faltante.
- **Divisão Saudável de Esforço:**
  - Barra comparativa de percentual de XP entre Matheus e Esposa.
- **Badges / Medalhas Desbloqueáveis:**
  - 🌟 *Primeiro Passo* (1ª tarefa feita)
  - 🧹 *Mão na Massa* (10 tarefas feitas)
  - 🔥 *Pegando o Ritmo* (3 dias seguidos de streak)
  - ⚡ *Semana Impecável* (7 dias seguidos)
  - 🍳 *Chef da Louça* (15 tarefas de cozinha)
  - 🛠️ *Visão de Futuro* (1ª reforma cadastrada)
  - ✨ *Sonhadores* (1º sonho cadastrado)
  - 🏆 *Casa dos Sonhos* (100 tarefas no total)

---

### Aba 6 — ⚙️ Ajustes & Backup no Google Sheets (`js/sheets.js`, `apps_script.gs`)
- **Perfis dos Moradores:**
  - Personalização dos nomes exibidos no app.
- **Google Sheets API (Apps Script):**
  - Vinculação com a planilha pessoal via URL de implantação Web App.
  - Proteção por Token Secreto (`SHARED_SECRET`).
  - Criação automática e atualização de 6 abas na planilha:
    1. `Resumo_Geral`: Nível, streak, XP do casal e estatísticas.
    2. `Tarefas`: Lista de todas as tarefas cadastradas.
    3. `Historico_Log`: Log diário de cada tarefa com data, horário e responsável.
    4. `Reformas`: Projetos, orçamentos e status.
    5. `Sonhos`: Sonhos e metas.
    6. `Backup_JSON`: Snapshot integral para restauração com 1 clique.
  - Botões para **Testar Conexão**, **Fazer Backup Agora**, **Restaurar do Sheets** e opção de sincronização automática a cada alteração.
- **Backup Local:**
  - Botão de exportar arquivo `.json` com download imediato e botão para importar backup local.
- **Preferências:**
  - Chave liga/desliga para efeitos sonoros.

---

## 3. Estrutura de Arquivos do Projeto

```
maracaju88/
├── .github/
│   └── workflows/
│       └── test.yml           # CI automatizado com Node Test Runner
├── apps_script.gs             # Código para colar no Google Apps Script da planilha
├── index.html                 # Interface PWA em abas semântica e responsiva
├── manifest.json              # Configurações de instalação PWA
├── sw.js                      # Service Worker com cache offline Stale-While-Revalidate
├── package.json               # Configurações do projeto e scripts de teste
├── .gitignore                 # Filtros do Git
├── .nojekyll                  # Garante que o GitHub Pages sirva todos os assets
├── README.md                  # Documentação completa de uso e configuração
├── MEMORIA_ATUALIZACOES.md    # Este documento histórico
├── css/
│   ├── variables.css          # Design Tokens (cores, fontes, bordas, sombras)
│   ├── base.css               # Reset, tipografia, layout e navegação
│   ├── components.css         # Cards, listas, checklists, botões e modais
│   └── animations.css         # Animações de confetti e efeitos luminosos
├── js/
│   ├── config.js              # Configurações iniciais, cômodos, níveis e badges
│   ├── storage.js             # Gerenciamento de localStorage, migrações e JSON
│   ├── audio.js               # Sintetizador nativo Web Audio (sem dependências de som)
│   ├── gamification.js        # Regras de XP, níveis, streaks e conquistas
│   ├── tasks.js               # Lógica de tarefas diárias e pontuação
│   ├── history.js             # Histórico diário (o que foi feito vs pendente)
│   ├── reformas.js            # Lógica de reformas e orçamentos
│   ├── sonhos.js              # Lógica do mural de sonhos
│   ├── sheets.js              # Cliente de integração com Google Apps Script
│   ├── ui.js                  # Renderizador do DOM, modais, toasts e confetti
│   └── app.js                 # Ponto de entrada e orquestrador de eventos
├── icons/
│   ├── icon.svg               # Ícone vetorial base do Maracaju 88
│   ├── icon-192.png           # Ícone PWA 192x192
│   ├── icon-512.png           # Ícone PWA 512x512
│   ├── apple-touch-icon.png   # Ícone para dispositivos Apple
│   └── favicon.png            # Favicon
├── scripts/
│   └── generate-icons.ps1     # Script para regenerar os ícones se necessário
└── test/
    └── app.test.js            # 5 suítes de testes unitários automatizados
```

---

## 4. Testes Automatizados Validados
Executados com o Node Test Runner nativo (`node --test`):
- `✔ Gamification: Cálculo de Nível e XP Total do Casal`
- `✔ Tasks: Concluir tarefa diária, pontuar XP e atualizar streak`
- `✔ History: Verificação detalhada de tarefas feitas e pendentes no dia`
- `✔ Reformas: Adicionar projeto, alternar checklist e totalizar orçamento`
- `✔ Sonhos: Adicionar sonho do casal, marcos e metas`

---

## 5. Roteiro de Ideias para Expansões Futuras (Para quando for mexer)
1. **Notificações Push / Lembretes Diários:** Enviar lembrete amigável no celular no início da noite caso faltem tarefas prioritárias.
2. **Foto de Antes & Depois nas Reformas:** Armazenar fotos compactadas de referência ou de progresso diretamente no card da reforma.
3. **Rotina de Faxina Pesada Mensal:** Aba ou filtro especial para tarefas que ocorrem a cada 15 ou 30 dias (ex: limpar geladeira por dentro, lavar cortinas, limpar calhas).
4. **Resumo Mensal do Casal (Premiação):** Relatório no final de cada mês mostrando quem fez mais tarefas, qual cômodo deu mais trabalho e o valor economizado nas reformas.
