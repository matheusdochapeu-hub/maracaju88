// ============================================================
//  MARACAJU - UTILITÁRIOS DE MOEDA & VALORES FINANCEIROS
//  Suporte completo a valores decimais quebrados (ex: R$ 264,33)
// ============================================================

/**
 * Converte qualquer entrada (string "264,33", "R$ 264,33", "1.250,50", "264.33", número, etc.)
 * para um float limpo e arredondado para 2 casas decimais.
 */
export function parseCurrency(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.round(Math.max(0, val) * 100) / 100;
  }

  let str = String(val).trim();
  if (!str) return 0;

  // Remove prefixos como R$, r$, espaços comuns e não-quebráveis
  str = str.replace(/R\$/gi, '').replace(/\s+/g, '');

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    // Caso clássico brasileiro: 1.250,50 (pontos = milhares, vírgula = decimal)
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Caso anglo-saxão: 1,250.50 (vírgulas = milhares, ponto = decimal)
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Caso com apenas vírgula: 264,33 -> 264.33
    str = str.replace(',', '.');
  }

  // Mantém apenas dígitos, sinal negativo e ponto
  str = str.replace(/[^0-9.-]/g, '');

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  return Math.round(Math.max(0, num) * 100) / 100;
}

/**
 * Formata um número ou string monetária no padrão pt-BR com 2 casas decimais (ex: "264,33").
 */
export function formatCurrency(val) {
  const num = parseCurrency(val);
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata com prefixo R$ (ex: "R$ 264,33").
 */
export function formatCurrencyWithSymbol(val) {
  return `R$ ${formatCurrency(val)}`;
}
