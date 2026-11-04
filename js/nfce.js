// ============================================================
//  MARACAJU - LEITOR & PARSER DE NOTA FISCAL (NFC-e / QR CODE)
//  Extrai automaticamente mercado, data da compra, total e itens.
// ============================================================

import { parseCurrency } from './currency.js';

// Dicionário de CNPJ conhecidos para identificação instantânea de redes de mercado
export const KNOWN_MARKETS = {
  '45543915': 'Carrefour',
  '47508411': 'Pão de Açúcar / Extra',
  '71676316': 'Assaí Atacadista',
  '61585865': 'Atacadão',
  '50190886': 'Dia Supermercados',
  '93209765': 'St. Marche',
  '06057223': 'Mambo Supermercados',
  '43214055': 'Sonda Supermercados',
  '03007331': 'Supermercados BH',
  '16694610': 'Supermercado Savegnago',
  '00360305': 'Hipermercado Muffato',
  '75315333': 'Supermercados Condor'
};

/**
 * Normaliza e formata CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(cnpjDigits) {
  const d = String(cnpjDigits || '').replace(/\D/g, '').padStart(14, '0').slice(-14);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/**
 * Identifica o nome fantasia do mercado a partir do CNPJ (8 primeiros dígitos)
 */
export function guessMarketNameFromCnpj(cnpjDigits) {
  const root = String(cnpjDigits || '').replace(/\D/g, '').slice(0, 8);
  if (KNOWN_MARKETS[root]) return KNOWN_MARKETS[root];
  return '';
}

/**
 * Extrai informações fundamentais do texto/URL de um QR Code de NFC-e brasileiro
 */
export function parseNfceQrCodeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto ou URL do QR Code não fornecido.');
  }

  const text = rawText.trim();
  let chNFe = '';
  let total = 0;
  let dateStr = '';
  let cnpj = '';

  // 1. Procura chave de 44 dígitos na string (padrão nacional de NFC-e)
  const keyMatch = text.match(/\b(\d{44})\b/);
  if (keyMatch) {
    chNFe = keyMatch[1];
  } else {
    // Pode vir como parâmetro p=CHAVE|2|1|1|...
    const pParam = text.match(/[?&]p=([0-9]{44})/i);
    if (pParam) {
      chNFe = pParam[1];
    } else {
      // Chave em parâmetro chNFe
      const chParam = text.match(/[?&]chNFe=([0-9]{44})/i);
      if (chParam) chNFe = chParam[1];
    }
  }

  // 2. Extração de informações codificadas na chave de 44 dígitos
  // Estrutura: cUF(2) + AAMM(4) + CNPJ(14) + mod(2) + serie(3) + nNF(9) + tpEmis(1) + cNF(8) + cDV(1)
  if (chNFe && chNFe.length === 44) {
    const aa = chNFe.substring(2, 4);
    const mm = chNFe.substring(4, 6);
    cnpj = chNFe.substring(6, 20);

    const fullYear = `20${aa}`;
    // Se o mês for válido, monta data estimada do mês
    if (Number(mm) >= 1 && Number(mm) <= 12) {
      const today = new Date();
      const currentYear = String(today.getFullYear());
      const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
      // Se for do mês atual, usa a data de hoje, senão dia 1 do mês da nota
      if (fullYear === currentYear && mm === currentMonth) {
        dateStr = today.toISOString().substring(0, 10);
      } else {
        dateStr = `${fullYear}-${mm}-01`;
      }
    }
  }

  // 3. Extração de valor total se presente nos parâmetros da URL (vNF ou vProd)
  const vNfMatch = text.match(/[?&]vNF=([0-9]+(?:\.[0-9]+)?)/i) || text.match(/[?&]vProd=([0-9]+(?:\.[0-9]+)?)/i);
  if (vNfMatch) {
    total = parseFloat(vNfMatch[1]) || 0;
  } else {
    // Parâmetro no formato p=CHAVE|VERSAO|TPAMB|DIA_EMISSAO|VALOR_TOTAL|...
    const pipeParts = text.split('|');
    if (pipeParts.length >= 5) {
      // O valor normalmente é a 5ª parte
      const candidateVal = pipeParts[4];
      if (/^[0-9]+(?:\.[0-9]+)?$/.test(candidateVal)) {
        total = parseFloat(candidateVal) || 0;
      }
    }
  }

  // 4. Extração de data de emissão se presente no formato dhEmi (ex: 2026-11-04T12:30:00)
  const dhMatch = text.match(/[?&]dhEmi=([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (dhMatch) {
    dateStr = dhMatch[1];
  }

  // Nome sugerido do mercado
  let marketName = guessMarketNameFromCnpj(cnpj);
  if (!marketName && cnpj) {
    marketName = `Supermercado (CNPJ ${formatCnpj(cnpj)})`;
  } else if (!marketName) {
    marketName = 'Supermercado';
  }

  if (!dateStr) {
    dateStr = new Date().toISOString().substring(0, 10);
  }

  return {
    rawUrl: text.startsWith('http') ? text : '',
    nfeKey: chNFe,
    cnpj: cnpj ? formatCnpj(cnpj) : '',
    marketName,
    date: dateStr,
    total: Math.round(total * 100) / 100,
    items: []
  };
}

/**
 * Tenta buscar online a página da SEFAZ para extrair itens detalhados e Razão Social
 * Possui fallback gracioso caso haja restrição de CORS
 */
export async function fetchNfceDetailsOnline(url, baseInfo = {}) {
  if (!url || !url.startsWith('http')) {
    return baseInfo;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml' }
    });
    clearTimeout(timeout);

    if (!response.ok) return baseInfo;
    const htmlText = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // Nome da Empresa / Supermercado
    const titleEl = doc.querySelector('.txtTopo') || doc.querySelector('.txtTit') || doc.querySelector('#u20') || doc.querySelector('.text');
    let storeName = titleEl ? titleEl.textContent.trim() : '';

    // Valor Total
    const totalEl = doc.querySelector('.totalNFe') || doc.querySelector('.txtMax') || doc.querySelector('.vtotal');
    let totalVal = totalEl ? parseCurrency(totalEl.textContent) : 0;

    // Itens da compra
    const items = [];
    const itemRows = doc.querySelectorAll('tr[id^="Item"], .txtItens, table.tCols tr');
    itemRows.forEach(row => {
      const nameEl = row.querySelector('.txtTit2') || row.querySelector('.desc') || row.querySelector('td:first-child');
      const valEl = row.querySelector('.valor') || row.querySelector('.total') || row.querySelector('td:last-child');
      if (nameEl && valEl) {
        const name = nameEl.textContent.trim();
        const price = parseCurrency(valEl.textContent);
        if (name && price > 0) {
          items.push({ name, price });
        }
      }
    });

    return {
      ...baseInfo,
      marketName: storeName || baseInfo.marketName || 'Supermercado',
      total: totalVal > 0 ? totalVal : baseInfo.total,
      items: items.length > 0 ? items : baseInfo.items
    };
  } catch (err) {
    // CORS ou offline: usa com sucesso os dados extraídos localmente do QR Code
    return baseInfo;
  }
}
