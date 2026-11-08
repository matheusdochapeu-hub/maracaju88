// ============================================================
//  MARACAJU - LEITOR & PARSER DE NOTA FISCAL (NFC-e / QR CODE)
//  Extrai automaticamente mercado, data da compra, total e itens.
// ============================================================

import { parseCurrency } from './currency.js';
import { RECOVERABLE_PURCHASES } from './storage.js';

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
  '75315333': 'Supermercados Condor',
  '50489095': 'Padaria e Mercearia Irmãos Araújo'
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
 * Mapeia o texto da forma de pagamento da SEFAZ para o enum do app Maracaju:
 * 'credito' | 'debito' | 'dinheiro' | 'pix' | 'va' | 'vr'
 */
export function mapPaymentMethodToApp(rawMethod) {
  if (!rawMethod || typeof rawMethod !== 'string') return 'va';
  const norm = rawMethod.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (norm.includes('credit') || norm.includes('credito')) return 'credito';
  if (norm.includes('debit') || norm.includes('debito')) return 'debito';
  if (norm.includes('dinheiro') || norm.includes('especie')) return 'dinheiro';
  if (norm.includes('pix') || norm.includes('instantaneo')) return 'pix';
  if (norm.includes('alimentac') || norm.includes('vale alimentacao') || norm.includes('alelo alimentacao') || norm.includes('ticket alimentacao')) return 'va';
  if (norm.includes('refeic') || norm.includes('vale refeicao') || norm.includes('alelo refeicao') || norm.includes('ticket restaurante')) return 'vr';

  return 'va';
}

/**
 * Realiza o parse completo de uma página HTML de consulta pública de NFC-e (SEFAZ SP e demais estados)
 * Extrai Razão Social, CNPJ, Endereço, Data, Hora, Número, Série, Chave de Acesso, Valor Total,
 * Forma de Pagamento e Todos os Itens Detalhados (Nome, Código, Qtd, Unidade, Valor Unitário e Total).
 */
export function parseNfceHtml(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return null;

  let marketName = '';
  let cnpj = '';
  let address = '';
  let date = '';
  let time = '';
  let nfeNumber = '';
  let nfeSeries = '';
  let accessKey = '';
  let totalAmount = 0;
  let paymentMethod = 'va';
  let paymentMethodName = '';
  const items = [];

  // Se estiver em ambiente com DOMParser (navegadores)
  const hasDOMParser = typeof DOMParser !== 'undefined';

  if (hasDOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');

      // 1. Razão Social / Nome da Empresa
      const titleEl = doc.querySelector('.txtTopo') ||
                      doc.querySelector('#u20') ||
                      doc.querySelector('.txtTit') ||
                      doc.querySelector('.text:first-child');
      if (titleEl) {
        marketName = titleEl.textContent.trim();
      }

      // 2. CNPJ
      const allTexts = Array.from(doc.querySelectorAll('.text, div, span, p'));
      for (const el of allTexts) {
        const t = el.textContent || '';
        const cnpjMatch = t.match(/CNPJ:\s*([\d\.\/\-]+)/i);
        if (cnpjMatch) {
          cnpj = formatCnpj(cnpjMatch[1]);
          break;
        }
      }

      // 3. Endereço
      const endEl = doc.querySelector('.text:nth-of-type(2)') || doc.querySelector('.endereco');
      if (endEl) {
        address = endEl.textContent.replace(/\s+/g, ' ').trim();
      }

      // 4. Data / Número / Série
      const infoContainer = doc.querySelector('#blocoEmitente') || doc.querySelector('.conteudo_especifico') || doc.body;
      if (infoContainer) {
        const infoText = infoContainer.textContent || '';
        const numMatch = infoText.match(/N[úu]mero:\s*(\d+)/i);
        if (numMatch) nfeNumber = numMatch[1];

        const serieMatch = infoText.match(/S[ée]rie:\s*(\d+)/i);
        if (serieMatch) nfeSeries = serieMatch[1];

        const emiMatch = infoText.match(/Emiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/i);
        if (emiMatch) {
          const [d, m, y] = emiMatch[1].split('/');
          date = `${y}-${m}-${d}`;
          time = emiMatch[2] || '';
        }
      }

      // 5. Chave de Acesso
      const chaveEl = doc.querySelector('.chave') || doc.querySelector('#lblChave');
      if (chaveEl) {
        accessKey = chaveEl.textContent.replace(/\D/g, '');
      } else {
        const fullTxt = doc.body ? doc.body.textContent : htmlString;
        const keyM = fullTxt.match(/\b(\d{44})\b/);
        if (keyM) accessKey = keyM[1];
      }

      // 6. Itens da Compra
      const rows = doc.querySelectorAll('#tabResult tr[id^="Item"], tr.linhaItem, tr[id^="Item"]');
      rows.forEach(row => {
        const nameEl = row.querySelector('.txtTit') || row.querySelector('.txtTit2') || row.querySelector('.desc');
        const codeEl = row.querySelector('.RCod');
        const qtdEl = row.querySelector('.Rqtd');
        const unEl = row.querySelector('.RUN');
        const unitPriceEl = row.querySelector('.RvlUnit');
        const totalEl = row.querySelector('.valor') || row.querySelector('.total');

        const name = nameEl ? nameEl.textContent.replace(/<[^>]+>/g, '').trim() : '';
        if (!name) return;

        let code = '';
        if (codeEl) {
          const cMatch = codeEl.textContent.match(/(\d+)/);
          if (cMatch) code = cMatch[1];
        }

        let quantity = 1;
        if (qtdEl) {
          const qMatch = qtdEl.textContent.match(/([\d,\.]+)/);
          if (qMatch) quantity = parseFloat(qMatch[1].replace(',', '.'));
        }

        let unit = 'UN';
        if (unEl) {
          const uMatch = unEl.textContent.match(/([A-Za-z]+)/);
          if (uMatch) unit = uMatch[1].toUpperCase();
        }

        let unitPrice = 0;
        if (unitPriceEl) {
          unitPrice = parseCurrency(unitPriceEl.textContent);
        }

        let itemTotal = 0;
        if (totalEl) {
          itemTotal = parseCurrency(totalEl.textContent);
        } else {
          itemTotal = Math.round(quantity * unitPrice * 100) / 100;
        }

        items.push({
          name,
          rawName: name,
          alias: name,
          code,
          quantity: quantity > 0 ? quantity : 1,
          unit,
          unitPrice,
          price: itemTotal,
          totalPrice: itemTotal
        });
      });

      // 7. Total a Pagar
      const totalEl = doc.querySelector('#totalNota .txtMax') ||
                      doc.querySelector('.totalNumb.txtMax') ||
                      doc.querySelector('.totalNFe') ||
                      doc.querySelector('.vtotal');
      if (totalEl) {
        totalAmount = parseCurrency(totalEl.textContent);
      }

      // 8. Forma de Pagamento
      const payLabel = doc.querySelector('#linhaTotal label.tx') ||
                       doc.querySelector('.formaPagamento') ||
                       doc.querySelector('#conteudo table:last-of-type label');
      if (payLabel) {
        paymentMethodName = payLabel.textContent.trim();
        paymentMethod = mapPaymentMethodToApp(paymentMethodName);
      }
    } catch (err) {
      console.warn('Falha no DOMParser para NFC-e, executando parser via Regex:', err);
    }
  }

  // Fallback via Regex se o DOMParser não estiver disponível ou não tiver encontrado os dados
  if (!marketName) {
    const topoMatch = htmlString.match(/<div[^>]*class=["'][^"']*txtTopo[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                      htmlString.match(/id=["']u20["'][^>]*>([\s\S]*?)<\/div>/i);
    if (topoMatch) {
      marketName = topoMatch[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  if (!cnpj) {
    const cnpjMatch = htmlString.match(/CNPJ:\s*([\d\.\/\-]+)/i);
    if (cnpjMatch) {
      cnpj = formatCnpj(cnpjMatch[1]);
    }
  }

  if (!address) {
    const endMatch = htmlString.match(/<div[^>]*class=["']text["'][^>]*>([\s\S]*?)<\/div>/gi);
    if (endMatch && endMatch.length > 1) {
      address = endMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    }
  }

  if (!nfeNumber || !date) {
    const emissaoMatch = htmlString.match(/N[úu]mero:\s*<\/strong>\s*(\d+)[\s\S]*?S[ée]rie:\s*<\/strong>\s*(\d+)[\s\S]*?Emiss[ãa]o:\s*<\/strong>\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/i) ||
                         htmlString.match(/N[úu]mero:\s*(\d+)[\s\S]*?S[ée]rie:\s*(\d+)[\s\S]*?Emiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/i);
    if (emissaoMatch) {
      nfeNumber = emissaoMatch[1];
      nfeSeries = emissaoMatch[2];
      const [d, m, y] = emissaoMatch[3].split('/');
      date = `${y}-${m}-${d}`;
      time = emissaoMatch[4] || '';
    }
  }

  if (!accessKey) {
    const chaveMatch = htmlString.match(/class=["']chave["'][^>]*>([\s\d]+)<\/span>/i) ||
                       htmlString.match(/Chave de acesso:[\s\S]*?(\d{4}[\s\d]{40,60}\d)/i) ||
                       htmlString.match(/\b(\d{44})\b/);
    if (chaveMatch) {
      accessKey = chaveMatch[1].replace(/\D/g, '');
    }
  }

  if (items.length === 0) {
    const rowRegex = /<tr[^>]*id=["']Item\s*\+\s*\d+["'][^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = rowRegex.exec(htmlString)) !== null) {
      const rowHtml = match[1];

      const nameMatch = rowHtml.match(/<span[^>]*class=["']txtTit["'][^>]*>([\s\S]*?)<\/span>/i);
      const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      const codeMatch = rowHtml.match(/<span[^>]*class=["']RCod["'][^>]*>[\s\S]*?(\d+)[\s\S]*?<\/span>/i);
      const code = codeMatch ? codeMatch[1].trim() : '';

      const qtdMatch = rowHtml.match(/<span[^>]*class=["']Rqtd["'][^>]*>[\s\S]*?Qtde\.:\s*<\/strong>\s*([\d,\.]+)/i);
      const quantity = qtdMatch ? parseFloat(qtdMatch[1].replace(',', '.')) : 1;

      const unMatch = rowHtml.match(/<span[^>]*class=["']RUN["'][^>]*>[\s\S]*?UN:\s*<\/strong>\s*([A-Za-z]+)/i);
      const unit = unMatch ? unMatch[1].trim().toUpperCase() : 'UN';

      const vlUnitMatch = rowHtml.match(/<span[^>]*class=["']RvlUnit["'][^>]*>[\s\S]*?Vl\.\s*Unit\.:\s*<\/strong>\s*([\d,\.]+)/i);
      const unitPrice = vlUnitMatch ? parseCurrency(vlUnitMatch[1]) : 0;

      const valMatch = rowHtml.match(/<span[^>]*class=["']valor["'][^>]*>([\d,\.]+)<\/span>/i);
      const itemTotal = valMatch ? parseCurrency(valMatch[1]) : Math.round(unitPrice * quantity * 100) / 100;

      if (name) {
        items.push({
          name,
          rawName: name,
          alias: name,
          code,
          quantity: quantity > 0 ? quantity : 1,
          unit,
          unitPrice,
          price: itemTotal,
          totalPrice: itemTotal
        });
      }
    }
  }

  if (totalAmount <= 0) {
    const totalMatch = htmlString.match(/<span[^>]*class=["'][^"']*totalNumb\s+txtMax[^"']*["'][^>]*>([\d,\.]+)<\/span>/i) ||
                       htmlString.match(/Valor a pagar R\$:[\s\S]*?<span[^>]*class=["']totalNumb[^"']*["'][^>]*>([\d,\.]+)<\/span>/i) ||
                       htmlString.match(/Valor a pagar R\$:[\s\S]*?(\d+,\d{2})/i);
    if (totalMatch) {
      totalAmount = parseCurrency(totalMatch[1]);
    } else if (items.length > 0) {
      totalAmount = Math.round(items.reduce((acc, it) => acc + (it.price || 0), 0) * 100) / 100;
    }
  }

  if (!paymentMethodName) {
    const payMatch = htmlString.match(/<label[^>]*class=["']tx["'][^>]*>([\s\S]*?)<\/label>/i);
    if (payMatch) {
      paymentMethodName = payMatch[1].replace(/<[^>]+>/g, '').trim();
      paymentMethod = mapPaymentMethodToApp(paymentMethodName);
    }
  }

  // Nome padrão de fallback
  if (!marketName && cnpj) {
    marketName = guessMarketNameFromCnpj(cnpj) || `Mercado (CNPJ ${cnpj})`;
  } else if (!marketName) {
    marketName = 'Supermercado';
  }

  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  }

  return {
    success: true,
    marketName,
    cnpj,
    address,
    date,
    time,
    nfeNumber,
    nfeSeries,
    accessKey,
    nfeKey: accessKey,
    total: totalAmount,
    totalAmount,
    paymentMethod,
    paymentMethodName: paymentMethodName || 'Vale Alimentação',
    items
  };
}

/**
 * Extrai informações fundamentais do texto/URL de um QR Code de NFC-e brasileiro
 * Suporta detecção de chave de 44 dígitos, parâmetros de URL e colagem direta de HTML.
 */
export function parseNfceQrCodeText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Texto ou URL do QR Code não fornecido.');
  }

  const text = rawText.trim();

  // Se o usuário colou diretamente o código HTML da página da Fazenda
  if (text.includes('<tr') || text.includes('txtTit') || text.includes('txtTopo') || text.includes('<html') || text.includes('id="Item')) {
    const fromHtml = parseNfceHtml(text);
    if (fromHtml && (fromHtml.items.length > 0 || fromHtml.totalAmount > 0)) {
      return fromHtml;
    }
  }

  let chNFe = '';
  let total = 0;
  let dateStr = '';
  let timeStr = '';
  let cnpj = '';
  let nfeNumber = '';
  let nfeSeries = '';
  let cUF = '';

  // 1. Procura chave de 44 dígitos na string (padrão nacional de NFC-e ou SAT CF-e)
  // Pode vir como parâmetro p=CHAVE|2|1|1|... ou chaveConsulta=CHAVE ou texto puro com espaços
  const pParam = text.match(/[?&]p=([0-9]{44})/i) || text.match(/[?&]chaveConsulta=([0-9]{44})/i);
  if (pParam) {
    chNFe = pParam[1];
  } else {
    const chParam = text.match(/[?&]chNFe=([0-9]{44})/i);
    if (chParam) {
      chNFe = chParam[1];
    } else {
      const cleanDigits = text.replace(/[\s\.-]/g, '');
      const keyMatch = cleanDigits.match(/\b(\d{44})\b/) || cleanDigits.match(/(\d{44})/);
      if (keyMatch) {
        chNFe = keyMatch[1];
      }
    }
  }

  // 2. Extração de informações codificadas na chave de 44 dígitos
  // Estrutura nacional: cUF(2) + AAMM(4) + CNPJ(14) + mod(2) + serie(3) + nNF(9) + tpEmis(1) + cNF(8) + cDV(1)
  if (chNFe && chNFe.length === 44) {
    cUF = chNFe.substring(0, 2);
    const aa = chNFe.substring(2, 4);
    const mm = chNFe.substring(4, 6);
    cnpj = chNFe.substring(6, 20);
    nfeSeries = String(parseInt(chNFe.substring(22, 25), 10));
    nfeNumber = String(parseInt(chNFe.substring(25, 34), 10));

    const fullYear = `20${aa}`;
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
  const vNfMatch = text.match(/[?&]vNF=([0-9]+(?:\.[0-9]+)?)/i) ||
                   text.match(/[?&]vProd=([0-9]+(?:\.[0-9]+)?)/i) ||
                   text.match(/[?&]total=([0-9]+(?:\.[0-9]+)?)/i) ||
                   text.match(/[?&]valor=([0-9]+(?:\.[0-9]+)?)/i);
  if (vNfMatch) {
    total = parseFloat(vNfMatch[1]) || 0;
  } else {
    // Parâmetro no formato p=CHAVE|VERSAO|TPAMB|DIA_EMISSAO|VALOR_TOTAL|... ou SAT CF-e CHAVE|DATAHORA|TOTAL|...
    const pipeParts = text.split('|');
    // SAT CF-e SP: CHAVE(44)|DATAHORA(14)|TOTAL|...
    if (pipeParts.length >= 3 && /^\d{14}$/.test(pipeParts[1])) {
      const dh = pipeParts[1];
      dateStr = `${dh.substring(0, 4)}-${dh.substring(4, 6)}-${dh.substring(6, 8)}`;
      timeStr = `${dh.substring(8, 10)}:${dh.substring(10, 12)}:${dh.substring(12, 14)}`;
      const candidateVal = pipeParts[2].replace(',', '.');
      if (/^[0-9]+(?:\.[0-9]+)?$/.test(candidateVal)) {
        total = parseFloat(candidateVal) || 0;
      }
    } else if (pipeParts.length >= 5) {
      const isHash = /^[0-9a-fA-F]{30,}$/.test(pipeParts[4].trim());
      if (!isHash) {
        const candidateVal = pipeParts[4].replace(',', '.');
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(candidateVal)) {
          total = parseFloat(candidateVal) || 0;
        }
        // Se pipeParts[3] for o dia do mês (1 a 31)
        const diaCandidate = parseInt(pipeParts[3], 10);
        if (!isNaN(diaCandidate) && diaCandidate >= 1 && diaCandidate <= 31 && dateStr) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            dateStr = `${parts[0]}-${parts[1]}-${String(diaCandidate).padStart(2, '0')}`;
          }
        }
      }
    }

    // Se ainda não achou o total, varre partes procurando padrão monetário numérico (ex: 71.06 ou 71,06)
    if (total === 0 && pipeParts.length >= 3) {
      for (let i = 2; i < Math.min(pipeParts.length, 8); i++) {
        const part = pipeParts[i].trim();
        if (/^[0-9a-fA-F]{20,}$/.test(part)) continue;
        const cand = part.replace(',', '.');
        if (/^[0-9]+(?:\.[0-9]{2})$/.test(cand)) {
          const val = parseFloat(cand);
          if (val > 0) {
            total = val;
            break;
          }
        }
      }
    }
  }

  // 4. Extração de data e hora de emissão se presente no formato dhEmi (ex: 2026-11-04T12:30:00)
  const dhMatch = text.match(/[?&]dhEmi=([0-9]{4}-[0-9]{2}-[0-9]{2})(?:T([0-9]{2}:[0-9]{2}(?::[0-9]{2})?))?/i);
  if (dhMatch) {
    dateStr = dhMatch[1];
    if (dhMatch[2]) timeStr = dhMatch[2];
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

  // 5. Verificação em comprovantes oficiais/recuperáveis conhecidos (ex: Padaria Irmãos Araújo e Carrefour)
  if (chNFe && Array.isArray(RECOVERABLE_PURCHASES)) {
    const known = RECOVERABLE_PURCHASES.find(p => p.nfeKey === chNFe || (p.cnpj && cnpj && p.cnpj.replace(/\D/g, '') === cnpj && p.nfeNumber === nfeNumber));
    if (known) {
      const knownItems = Array.isArray(known.items) ? known.items.map(it => ({ ...it })) : [];
      return {
        success: true,
        rawUrl: text.startsWith('http') ? text : (known.rawUrl || ''),
        nfeKey: known.nfeKey || chNFe,
        accessKey: known.nfeKey || chNFe,
        cnpj: known.cnpj || (cnpj ? formatCnpj(cnpj) : ''),
        marketName: known.marketName || marketName,
        date: known.date || dateStr,
        time: known.time || timeStr || '',
        nfeNumber: known.nfeNumber || nfeNumber,
        nfeSeries: known.nfeSeries || nfeSeries,
        total: known.total || Math.round(total * 100) / 100,
        totalAmount: known.total || Math.round(total * 100) / 100,
        paymentMethod: known.paymentMethod || 'va',
        paymentMethodName: known.paymentMethod === 'credito' ? 'Cartão de Crédito' : (known.paymentMethod === 'va' ? 'Vale Alimentação' : known.paymentMethod),
        items: knownItems
      };
    }
  }

  const finalTotal = Math.round(total * 100) / 100;
  const items = [];
  if (finalTotal > 0) {
    items.push({
      name: `Compra ${marketName}`,
      rawName: `Compra ${marketName}`,
      alias: `Compra ${marketName}`,
      code: 'COMPRA',
      quantity: 1,
      unit: 'UN',
      unitPrice: finalTotal,
      price: finalTotal,
      totalPrice: finalTotal,
      category: 'mercearia'
    });
  }

  return {
    success: true,
    rawUrl: text.startsWith('http') ? text : '',
    nfeKey: chNFe,
    accessKey: chNFe,
    cnpj: cnpj ? formatCnpj(cnpj) : '',
    marketName,
    date: dateStr,
    time: timeStr || '',
    nfeNumber,
    nfeSeries,
    total: finalTotal,
    totalAmount: finalTotal,
    paymentMethod: 'va',
    items
  };
}

/**
 * Tenta buscar online a página da SEFAZ para extrair itens detalhados, Razão Social e valores.
 * Suporta integração via backend do Google Apps Script (sem bloqueio de CORS)
 * e fallback gracioso com os dados locais já extraídos da chave.
 */
export async function fetchNfceDetailsOnline(url, options = {}) {
  const baseInfo = options.baseInfo || (url.startsWith('http') ? parseNfceQrCodeText(url) : {});

  if (!url || !url.startsWith('http')) {
    return { success: false, ...baseInfo };
  }

  // 1. Tenta buscar via Google Apps Script se configurado (zero problemas de CORS!)
  if (options.sheetsUrl) {
    try {
      const { fetchNfceHtmlViaAppsScript } = await import('./sheets.js');
      const htmlText = await fetchNfceHtmlViaAppsScript(options.sheetsUrl, options.sheetsToken, url);
      if (htmlText) {
        const parsed = parseNfceHtml(htmlText);
        if (parsed && (parsed.items.length > 0 || parsed.totalAmount > 0)) {
          return {
            ...baseInfo,
            ...parsed,
            success: true,
            rawUrl: url
          };
        }
      }
    } catch (errAppsScript) {
      console.warn('Busca de NFC-e via Apps Script falhou ou não configurada:', errAppsScript);
    }
  }

  // 2. Tentativa direta pelo navegador (caso a SEFAZ ou proxy permita)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml'
      }
    });
    clearTimeout(timeout);

    if (response.ok) {
      const htmlText = await response.text();
      const parsed = parseNfceHtml(htmlText);
      if (parsed && (parsed.items.length > 0 || parsed.totalAmount > 0)) {
        return {
          ...baseInfo,
          ...parsed,
          success: true,
          rawUrl: url
        };
      }
    }
  } catch (errDirect) {
    // CORS ou restrição de rede no browser
    console.info('Tentativa de conexão direta com a SEFAZ bloqueada por CORS no navegador.');
  }

  // Retorna os dados fundamentais extraídos da chave e indica que pode colar o HTML se desejar
  return {
    ...baseInfo,
    success: true,
    needsManualPaste: true
  };
}

/**
 * Mescla de forma complementar os dados do QR Code com os dados extraídos pelo OCR.
 * Regra: se o QR Code já preencheu a informação (como chave oficial, CNPJ ou total), mantém;
 * o que faltar (produtos comprados, local/mercado, data, hora, total, forma de pagamento)
 * o OCR preenche automaticamente.
 */
export function mergeNfceComplementary(qrData = {}, ocrData = {}) {
  const merged = { ...qrData };

  // 1. Chave de acesso: se o QR code tiver chave oficial de 44 dígitos, mantém; senão usa OCR
  const qrKey = (qrData.nfeKey || qrData.accessKey || '').replace(/\D/g, '');
  const ocrKey = (ocrData.nfeKey || ocrData.accessKey || '').replace(/\D/g, '');
  if (qrKey.length === 44) {
    merged.accessKey = qrKey;
    merged.nfeKey = qrKey;
  } else if (ocrKey.length === 44) {
    merged.accessKey = ocrKey;
    merged.nfeKey = ocrKey;
  }

  // 2. CNPJ
  if (!merged.cnpj || merged.cnpj === '--') {
    merged.cnpj = ocrData.cnpj || '';
  }

  // 3. Estabelecimento / Mercado
  const isGeneric = (name) => !name || /^(?:Supermercado|Mercado|Comprovante|Estabelecimento)$/i.test(name.trim());
  if (isGeneric(merged.marketName) && !isGeneric(ocrData.marketName)) {
    merged.marketName = ocrData.marketName;
  } else if (!merged.marketName) {
    merged.marketName = ocrData.marketName || 'Supermercado';
  }

  // 4. Data
  const todayStr = new Date().toISOString().substring(0, 10);
  if (!merged.date || merged.date === todayStr) {
    if (ocrData.date) {
      merged.date = ocrData.date;
    }
  }

  // 5. Hora
  merged.time = qrData.time || ocrData.time || '';

  // 6. Valor Total
  const qrTotal = Number(qrData.total || qrData.totalAmount || 0);
  const ocrTotal = Number(ocrData.total || ocrData.totalAmount || 0);
  if (qrTotal > 0) {
    merged.total = qrTotal;
    merged.totalAmount = qrTotal;
  } else if (ocrTotal > 0) {
    merged.total = ocrTotal;
    merged.totalAmount = ocrTotal;
  }

  // 7. Forma de Pagamento
  // Se o QR Code veio com valor padrão 'va' mas o OCR detectou forma explícita (ex: 'credito', 'debito', 'pix', 'dinheiro', 'vr')
  if (ocrData.paymentMethod && (merged.paymentMethod === 'va' || !merged.paymentMethod)) {
    merged.paymentMethod = ocrData.paymentMethod;
  }

  // 8. Itens / Produtos Comprados
  const qrItems = Array.isArray(qrData.items) ? qrData.items : [];
  const ocrItems = Array.isArray(ocrData.items) ? ocrData.items : [];
  if (qrItems.length > 0) {
    merged.items = [...qrItems];
  } else if (ocrItems.length > 0) {
    merged.items = [...ocrItems];
  } else {
    merged.items = [];
  }

  // Se o total ainda estiver zerado mas temos itens, totaliza pelos itens
  if ((!merged.total || merged.total === 0) && merged.items.length > 0) {
    merged.total = Math.round(merged.items.reduce((sum, it) => sum + (it.totalPrice || it.price || 0), 0) * 100) / 100;
    merged.totalAmount = merged.total;
  }

  // URL original da SEFAZ
  if (!merged.rawUrl && ocrData.rawUrl) {
    merged.rawUrl = ocrData.rawUrl;
  }

  return merged;
}
