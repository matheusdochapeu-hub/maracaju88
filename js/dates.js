// ============================================================
//  MARACAJU - UTILITÁRIOS DE DATA (FUSO LOCAL)
// ============================================================
// `new Date().toISOString()` converte para UTC. No Brasil (UTC-3), entre
// 21:00 e 23:59 o valor já é o DIA SEGUINTE — o que jogava compras, ciclos
// de VA/VR e lançamentos de pets para a data/mês errados.
// Use sempre estes helpers para datas de calendário (não para timestamps).

export function getLocalDateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalMonthKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
