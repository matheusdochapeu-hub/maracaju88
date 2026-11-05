// ============================================================
//  MARACAJU - PARSER DE NOTAS FISCAIS EM PDF E TEXTO (NFC-e / DANFE)
//  Extrai itens, códigos, quantidades, valores, mercado e data.
// ============================================================

import { parseCurrency } from './currency.js';
import { guessMarketNameFromCnpj, formatCnpj } from './nfce.js';

// Dicionário de abreviações comuns de cupom fiscal para nomes populares
const POPULAR_ABBREVIATIONS = [
  { match: /\bACUCAR REF CARAVELAS\b/i, replace: "Açúcar Refinado Caravelas" },
  { match: /\bACUCAR REF\b/i, replace: "Açúcar Refinado" },
  { match: /\bACUCAR CRISTAL\b/i, replace: "Açúcar Cristal" },
  { match: /\bCHA MATE LEAO LIMA T\b/i, replace: "Chá Matte Leão Limão" },
  { match: /\bCHA MATE LEAO\b/i, replace: "Chá Matte Leão" },
  { match: /\bCHA CAMOMILA DR OETK\b/i, replace: "Chá de Camomila Dr. Oetker" },
  { match: /\bCHA CAMOMILA\b/i, replace: "Chá de Camomila" },
  { match: /\bMAIONESE RECEITA CAS\b/i, replace: "Maionese Receita Caseira" },
  { match: /\bMEL ORG CARREFOUR BI\b/i, replace: "Mel Orgânico Carrefour" },
  { match: /\bTOMATE GRAPE CRFO ME\b/i, replace: "Tomate Grape" },
  { match: /\bABACAXI PEROLA CRFO\b/i, replace: "Abacaxi Pérola" },
  { match: /\bBEB LAC ZL PROFORCE\b/i, replace: "Bebida Láctea Proforce Zero Lactose" },
  { match: /\bBEB LAC\b/i, replace: "Bebida Láctea" },
  { match: /\bOVO GDE BRANCO BULNE\b/i, replace: "Ovos Brancos Grandes" },
  { match: /\bOVO GDE BRANCO\b/i, replace: "Ovos Brancos Grandes" },
  { match: /\bOVO GDE VERM\b/i, replace: "Ovos Vermelhos Grandes" },
  { match: /\bMAMAO FORMOSA ORG\b/i, replace: "Mamão Formosa Orgânico" },
  { match: /\bMAMAO PAPAIA\b/i, replace: "Mamão Papaia" },
  { match: /\bBANANA NANICA CRF Kg\b/i, replace: "Banana Nanica" },
  { match: /\bBANANA PRATA\b/i, replace: "Banana Prata" },
  { match: /\bQJ MUSSARELA INTERFO\b/i, replace: "Queijo Mussarela Interfolhado" },
  { match: /\bQJ MUSSARELA\b/i, replace: "Queijo Mussarela" },
  { match: /\bQJ PRATO\b/i, replace: "Queijo Prato" },
  { match: /\bESPONJA DE ACO BOMBR\b/i, replace: "Esponja de Aço Bombril" },
  { match: /\bESPONJA DE ACO\b/i, replace: "Esponja de Aço" },
  { match: /\bMIX FOLHAS LA VITA\b/i, replace: "Mix de Folhas La Vita" },
  { match: /\bREQUEIJAO CREMOSO LI\b/i, replace: "Requeijão Cremoso Light" },
  { match: /\bREQUEIJAO CREMOSO\b/i, replace: "Requeijão Cremoso" },
  { match: /\bDESINF\b/i, replace: "Desinfetante" },
  { match: /\bDETERG\b/i, replace: "Detergente" },
  { match: /\bSAB PO\b/i, replace: "Sabão em Pó" },
  { match: /\bAMAC\b/i, replace: "Amaciante" },
  { match: /\bPAP HIG\b/i, replace: "Papel Higiênico" },
  { match: /\bCR LEITE\b/i, replace: "Creme de Leite" },
  { match: /\bLT COND\b/i, replace: "Leite Condensado" }
];

/**
 * Converte nomes estranhos ou truncados de cupom fiscal em um nome popular amigável.
 */
export function suggestPopularName(rawName) {
  if (!rawName) return '';
  let cleaned = rawName.trim();

  // Remove códigos extras no nome como "(Código: ...)"
  cleaned = cleaned.replace(/\(C[oó]digo:.*?\)/gi, '').trim();

  // Aplica substituições conhecidas
  for (const item of POPULAR_ABBREVIATIONS) {
    if (item.match.test(cleaned)) {
      return item.replace;
    }
  }

  // Se não encontrar uma regra exata, limpa sufixos genéricos de supermercado
  cleaned = cleaned
    .replace(/\bCRFO\b/gi, '')
    .replace(/\bCRF\b/gi, '')
    .replace(/\bME\b/gi, '')
    .replace(/\bBI\b/gi, '')
    .replace(/\bKg\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Converte para Title Case
  return cleaned.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

/**
 * Detecta a categoria mais provável a partir do nome do produto.
 */
export function detectCategoryFromItemName(name) {
  const n = (name || '').toLowerCase();

  if (/cha|chá|mate|leite|suco|agua|água|beb|refrigerante|coca|guarana|cerveja|cafe|café|nectar|energetico/.test(n)) {
    return 'bebidas';
  }
  if (/tomate|abacaxi|mamao|mamão|banana|maca|maçã|uva|laranja|folhas|legume|fruta|cebola|alho|batata|cenoura|alface|couve|manga|limao|limão|morango/.test(n)) {
    return 'hortifruti';
  }
  if (/queijo|mussarela|mucarela|requeijao|requeijão|iogurte|manteiga|presunto|frios|salame|mortadela|parmesao|gouda/.test(n)) {
    return 'frios';
  }
  if (/carne|frango|bife|alcatra|peixe|costela|linguica|linguiça|acougue|açougue|peito|patinho|contra|coxa|salmao|tilapia/.test(n)) {
    return 'acougue';
  }
  if (/pao|pão|bolo|torrada|biscoito|bolacha|croissant|brioche|padaria/.test(n)) {
    return 'padaria';
  }
  if (/esponja|bombril|detergente|sabao|sabão|amaciante|desinfetante|papel hig|agua sanitaria|alvejante|limpeza|multiuso/.test(n)) {
    return 'limpeza';
  }

  return 'mercearia';
}

/**
 * Analisa e extrai dados de comprovantes de NFC-e / Danfe a partir do texto extraído do PDF.
 */
export function parseNfceDanfeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto do PDF vazio ou não fornecido.');
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let marketName = '';
  let cnpj = '';
  let dateStr = '';
  let nfeKey = '';
  let total = 0;
  const items = [];

  // 1. Extração de Chave de Acesso (44 dígitos)
  const fullText = lines.join(' ');
  const keyMatch = fullText.match(/\b([0-9\s]{44,60})\b/);
  if (keyMatch) {
    const rawDigits = keyMatch[1].replace(/\s/g, '');
    if (rawDigits.length === 44) {
      nfeKey = rawDigits;
    }
  }

  // 2. Extração de CNPJ
  const cnpjMatch = fullText.match(/CNPJ:\s*([0-9\.\/\-]+)/i);
  if (cnpjMatch) {
    cnpj = cnpjMatch[1].trim();
  }

  // 3. Extração da Data da Compra
  // Formato: 03/11/2026 09:41:43 ou Emiss ã o: 03/11/2026
  const dateMatch = fullText.match(/(?:Emiss\s*[aã]\s*o|Data\/Hora):\s*(\d{2})\/(\d{2})\/(\d{4})/i) ||
                    fullText.match(/(\d{2})\/(\d{2})\/(\d{4})\s+\d{2}:\d{2}/);
  if (dateMatch) {
    const day = dateMatch[1];
    const month = dateMatch[2];
    const year = dateMatch[3];
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = new Date().toISOString().substring(0, 10);
  }

  // 4. Razão Social / Mercado
  if (cnpj) {
    marketName = guessMarketNameFromCnpj(cnpj);
  }
  if (!marketName) {
    // Procura o cabeçalho antes do CNPJ
    for (let i = 0; i < lines.length; i++) {
      if (/CNPJ:/i.test(lines[i])) {
        if (i > 0 && lines[i - 1].length > 3) {
          const candidate = lines[i - 1];
          if (/CARREFOUR/i.test(candidate)) marketName = 'Carrefour';
          else if (/PAO DE ACUCAR|EXTRA/i.test(candidate)) marketName = 'Pão de Açúcar';
          else if (/ASSAI/i.test(candidate)) marketName = 'Assaí Atacadista';
          else if (/ATACADAO/i.test(candidate)) marketName = 'Atacadão';
          else marketName = candidate;
        }
        break;
      }
    }
  }
  if (!marketName) marketName = 'Supermercado';

  // 5. Extração de Valor Total Pago
  const totalMatch = fullText.match(/Valor\s+a\s+pagar\s+R\$:\s*([\d\.,]+)/i) ||
                     fullText.match(/Valor\s+total\s+R\$:\s*([\d\.,]+)/i);
  if (totalMatch) {
    total = parseCurrency(totalMatch[1]);
  }

  // 6. Extração de Itens da Compra
  // Padrão identificado na nota Carrefour / NFC-e padrão:
  // Linha 1: NOME DO ITEM (Código: SS010604) Vl. Total
  // Linha 2: Qtde.: 1 UN: un9 Vl. Unit.: 3,19 3,19
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Procura linha de item com código (com tolerância a espaçamentos e pontuações do OCR/PDF: "(C ó digo: ...)")
    const codeMatch = line.match(/^(.*?)\s*\(\s*C\s*[oó]?\s*d(?:igo)?\.?:?\s*([A-Za-z0-9_-]+)\s*\)/i);
    if (codeMatch) {
      const rawName = codeMatch[1].trim();
      const code = codeMatch[2].trim();

      let qty = '1';
      let unit = 'un';
      let unitPrice = 0;
      let totalPrice = 0;

      // Inspeciona as próximas linhas procurando quantidade e valores até encontrar o próximo item
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const nextLine = lines[j];

        // Se encontrar o cabeçalho de outro produto, interrompe a busca deste produto
        if (/\(\s*C\s*[oó]?\s*d(?:igo)?\.?:?/i.test(nextLine)) {
          break;
        }

        const qtyMatch = nextLine.match(/(?:Qtde|Qtd|Quant)\.?:?\s*([\d\.,]+)\s*(?:UN\.?:?\s*([A-Za-z0-9]+))?\s*(?:Vl\.?\s*Unit\.?:?\s*([\d\.,]+))?(?:\s+([\d\.,]+))?/i);
        if (qtyMatch) {
          qty = qtyMatch[1].trim();
          if (qtyMatch[2]) {
            unit = qtyMatch[2].trim().toLowerCase().replace(/[0-9]/g, '');
          }
          if (qtyMatch[3]) {
            unitPrice = parseCurrency(qtyMatch[3]);
          }
          if (qtyMatch[4]) {
            totalPrice = parseCurrency(qtyMatch[4]);
          }
          break;
        }

        const totalRowMatch = nextLine.match(/^Vl\.\s*Total$/i);
        if (totalRowMatch && lines[j + 1]) {
          const candidateVal = parseCurrency(lines[j + 1]);
          if (candidateVal > 0) {
            totalPrice = candidateVal;
          }
        } else if (/^Vl\.\s*Total\s*([\d\.,]+)$/i.test(nextLine)) {
          const directMatch = nextLine.match(/^Vl\.\s*Total\s*([\d\.,]+)$/i);
          totalPrice = parseCurrency(directMatch[1]);
        }
      }

      if (totalPrice === 0 && unitPrice > 0) {
        const numQty = parseFloat(qty.replace(',', '.')) || 1;
        totalPrice = Math.round(unitPrice * numQty * 100) / 100;
      }

      if (rawName && (unitPrice > 0 || totalPrice > 0)) {
        const alias = suggestPopularName(rawName);
        const category = detectCategoryFromItemName(alias || rawName);

        items.push({
          code,
          rawName,
          alias,
          category,
          qty,
          unit: unit || 'un',
          unitPrice,
          totalPrice: totalPrice || unitPrice,
          selected: true
        });
      }
    }
  }

  // Fallback 1: Produtos sem "(Código: ...)" no título mas com linha "Qtde: ... Vl. Unit: ..."
  if (items.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const qtyMatch = line.match(/(?:Qtde|Qtd|Quant)\.?:?\s*([\d\.,]+)\s*(?:UN\.?:?\s*([A-Za-z0-9]+))?\s*(?:Vl\.?\s*Unit\.?:?\s*([\d\.,]+))?(?:\s+([\d\.,]+))?/i);
      if (qtyMatch && i > 0 && qtyMatch[3]) {
        let rawName = lines[i - 1].replace(/^\d+\s+/, '').trim();
        // Ignora cabeçalhos
        if (!/CNPJ|Total|Emissão|Chave|Consumidor|Danfe|NFC-e|Rua|Avenida/i.test(rawName) && rawName.length > 2) {
          const qty = qtyMatch[1].trim();
          const unit = qtyMatch[2] ? qtyMatch[2].trim().toLowerCase().replace(/[0-9]/g, '') : 'un';
          const unitPrice = parseCurrency(qtyMatch[3]);
          const numQty = parseFloat(qty.replace(',', '.')) || 1;
          const totalPrice = qtyMatch[4] ? parseCurrency(qtyMatch[4]) : Math.round(unitPrice * numQty * 100) / 100;

          if (unitPrice > 0) {
            const alias = suggestPopularName(rawName);
            items.push({
              code: 'ITEM_' + (items.length + 1),
              rawName,
              alias,
              category: detectCategoryFromItemName(alias || rawName),
              qty,
              unit: unit || 'un',
              unitPrice,
              totalPrice,
              selected: true
            });
          }
        }
      }
    }
  }

  // Fallback 2 para outros formatos de NFC-e (ex: 001 PRODUTO 1 UN X 12,00)
  if (items.length === 0) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const altQtyMatch = line.match(/(\d+[\.,]?\d*)\s*(?:UN|KG|LT|CX|PC)\s*(?:[xX]|\*)\s*([\d\.,]+)/i);
      if (altQtyMatch && i > 0) {
        const rawName = lines[i - 1].replace(/^\d+\s+/, '').trim();
        const qty = altQtyMatch[1];
        const unitPrice = parseCurrency(altQtyMatch[2]);
        const numQty = parseFloat(qty.replace(',', '.')) || 1;
        const totalPrice = Math.round(unitPrice * numQty * 100) / 100;
        if (rawName.length > 2 && unitPrice > 0) {
          const alias = suggestPopularName(rawName);
          items.push({
            code: 'ITEM_' + (items.length + 1),
            rawName,
            alias,
            category: detectCategoryFromItemName(alias || rawName),
            qty,
            unit: 'un',
            unitPrice,
            totalPrice,
            selected: true
          });
        }
      }
    }
  }

  // Se não extraiu o total pelo regex ou deu 0, soma os itens extraídos
  if (total === 0 && items.length > 0) {
    total = Math.round(items.reduce((sum, it) => sum + (it.totalPrice || 0), 0) * 100) / 100;
  }

  return {
    marketName,
    cnpj: cnpj ? formatCnpj(cnpj) : '',
    date: dateStr,
    total,
    nfeKey,
    items
  };
}

/**
 * Reconstrói linhas de texto respeitando a posição espacial (coordenadas X e Y)
 * de cada fragmento extraído pelo PDF.js.
 */
export function reconstructSpatialLines(items) {
  if (!items || !items.length) return '';

  const validItems = items
    .filter(it => it && typeof it.str === 'string' && it.str.length > 0 && it.transform)
    .map(it => ({
      str: it.str,
      x: it.transform[4],
      y: it.transform[5]
    }));

  if (validItems.length === 0) {
    return items.map(it => (it && it.str) || '').join('\n');
  }

  // Agrupa itens que estão na mesma linha horizontal (mesmo Y com tolerância de até 3.5 pontos)
  const rows = [];
  for (const item of validItems) {
    let matchedRow = null;
    for (const row of rows) {
      if (Math.abs(row.y - item.y) <= 3.5) {
        matchedRow = row;
        break;
      }
    }
    if (matchedRow) {
      matchedRow.items.push(item);
    } else {
      rows.push({
        y: item.y,
        items: [item]
      });
    }
  }

  // Ordena linhas do topo para a base (Y decrescente)
  rows.sort((a, b) => b.y - a.y);

  // Para cada linha, ordena da esquerda para a direita (X crescente)
  const lineStrings = rows.map(row => {
    row.items.sort((a, b) => a.x - b.x);
    return row.items
      .map(it => it.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }).filter(line => line.length > 0);

  return lineStrings.join('\n');
}

/**
 * Lê o arquivo PDF no navegador usando pdf.js e extrai todo o texto com reconstrução espacial.
 */
export async function extractTextFromPdfFile(fileOrBlob) {
  if (typeof window === 'undefined' || !window.pdfjsLib) {
    throw new Error('A biblioteca de leitura de PDF (PDF.js) não está carregada no navegador.');
  }

  // Garante que o worker do PDF.js esteja configurado com URL absoluta compatível com PWA
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    try {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('js/vendor/pdf.worker.min.js', window.location.href).href;
    } catch {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = './js/vendor/pdf.worker.min.js';
    }
  }

  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let p = 1; p <= numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const pageText = reconstructSpatialLines(content.items);
    fullText += pageText + '\n';
  }

  return fullText;
}
