const STATUS = ['Aberto', 'Em Atendimento', 'Concluído'];
const REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;

function validarCamposSolicitacao(body) {
  const dados = body && typeof body === 'object' ? body : {};
  const mensagens = [];
  const titulo = typeof dados.titulo === 'string' ? dados.titulo.trim() : '';
  const descricao = typeof dados.descricao === 'string' ? dados.descricao.trim() : '';

  if (!titulo) mensagens.push('titulo: campo obrigatório');
  else if (titulo.length < 3 || titulo.length > 120) {
    mensagens.push('titulo: deve ter entre 3 e 120 caracteres');
  }

  if (!descricao) mensagens.push('descricao: campo obrigatório');
  else if (descricao.length > 2000) {
    mensagens.push('descricao: deve ter no máximo 2000 caracteres');
  }

  return { titulo, descricao, categoria: dados.categoria, mensagens };
}

module.exports = { STATUS, REGEX_DATA, validarCamposSolicitacao };