const MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA[c]);

export function formatarData(texto) {
  if (!texto) return '';
  const [data, hora = ''] = texto.split(' ');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}${hora ? ` ${hora.slice(0, 5)}` : ''}`;
}

const CLASSES = { Aberto: 'aberto', 'Em Atendimento': 'atendimento', Concluído: 'concluido' };

export const badge = (status) =>
  `<span class="badge badge-${CLASSES[status] || 'aberto'}">${esc(status)}</span>`;