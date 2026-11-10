# AGENTS.md — Maracaju 88 (Casa, Mercado, VA & VR)

> Contexto para agentes de IA. Escopo: **esta pasta**.

## O que é

PWA de gestão do lar do casal: tarefas domésticas por periodicidade, lista de mercado
colaborativa, leitura de QR Code de NFC-e, controle do carro, reformas, sonhos e
controle de **VA/VR** (Vale Alimentação e Vale Refeição). É o app mais maduro em testes
do ecossistema.

## Stack

- PWA em HTML/CSS/vanilla JS, modularizado em ES modules (`js/*.js` com `import`/`export`).
- Backend: Google Apps Script (`apps_script.gs`) + Google Sheets.
- Sem frameworks e sem build.

## Rodar localmente

```powershell
python -m http.server 8000   # abrir http://localhost:8000
```

## Testes

```powershell
node --test test/**/*.test.js   # 119 testes
```

## Deploy

- GitHub Pages a partir da `main`: <https://matheusdochapeu-hub.github.io/maracaju88/>
- CI de testes em `.github/workflows/test.yml`.

## Arquivos-chave

| Arquivo | Papel |
|---|---|
| `index.html` | SPA (tarefas, mercado, carro, reformas, sonhos) |
| `js/app.js` | Núcleo de UI e orquestração |
| `js/pets.js` | Lançamentos e edição de registros dos pets |
| `js/nfce.js` | Leitor de QR Code da nota fiscal (NFC-e) |
| `js/shopping.js`, `js/history.js` | Mercado e histórico mensal |
| `apps_script.gs` | Backend do Sheets |
| `sw.js` | Service Worker (`maracaju-vX.Y.Z`) |
| `config.js` | Versão e constantes do app |

## Regras críticas

1. **Versão tripla:** ao publicar, atualizar a mesma versão em **`config.js`**, **`sw.js`**
   (`CACHE_NAME`) e **`package.json`**. Já foi fonte de bug quando saíram dessincronizados.
2. **Valores com centavos** (`R$ 264,33`) são requisito em todas as categorias; use
   `inputmode="decimal"` e não trunque para inteiro.
3. **O app é a autoridade sobre VA/VR.** O Matrix consome esses saldos
   (`state.satellites.maracaju`) — não recalcule VR por dias úteis em outro lugar.
4. **Nada de exclusão destrutiva** de compras/itens: use os fluxos de desfazer/limpar
   já existentes.
5. Fotos anexadas devem continuar sendo comprimidas no cliente (~40–70 KB) antes de subir.

## Vizinhança (ecossistema)

- `../matrix` — recebe VA/VR e contas da casa; é o app central.
- A regra do 4º dia útil (recarga VA/VR) está documentada em `../matrix/GEMINI.md`.
