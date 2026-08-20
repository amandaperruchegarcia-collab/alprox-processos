/**
 * Escapa caracteres HTML especiais para evitar XSS
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado e seguro para inserir em HTML
 */
export function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Verifica se uma URL é segura (HTTP ou HTTPS)
 * @param {string} url - URL a verificar
 * @returns {boolean} true se segura, false caso contrário
 */
export function ehUrlSegura(url) {
  if (!url) return false;
  try {
    const analisada = new URL(url);
    return analisada.protocol === 'http:' || analisada.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Formata uma data ISO (YYYY-MM-DD) para formato BR (DD/MM/YYYY)
 * @param {string} dataISO - Data em formato ISO
 * @returns {string} Data formatada em DD/MM/YYYY
 */
export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}
