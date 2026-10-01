const solicitacaoModel = require('../models/solicitacaoModel');
const categoriaModel = require('../models/categoriaModel');
const AppError = require('../utils/AppError');
const { STATUS, REGEX_DATA, validarCamposSolicitacao } = require('../utils/validators');

function validarDados(body) {
  const { titulo, descricao, categoria, mensagens } = validarCamposSolicitacao(body);
  let categoriaId;

  if (categoria === undefined || categoria === null || categoria === '') {
    mensagens.push('categoria: campo obrigatório');
  } else {
    const encontrada = categoriaModel.findByIdOuNome(categoria);
    if (!encontrada) mensagens.push('categoria: categoria inexistente');
    else categoriaId = encontrada.id;
  }

  if (mensagens.length) throw new AppError(400, 'Dados inválidos', mensagens);
  return { titulo, descricao, categoriaId };
}

function obter(id) {
  const solicitacao = solicitacaoModel.findById(id);
  if (!solicitacao) throw new AppError(404, 'Solicitação não encontrada');
  return solicitacao;
}

function exigirPermissao(solicitacao, usuario) {
  if (solicitacao.usuario_id !== usuario.id) {
    throw new AppError(403, 'Apenas o solicitante pode alterar ou excluir esta solicitação');
  }
  if (solicitacao.status !== 'Aberto') {
    throw new AppError(403, "Solicitações com status diferente de 'Aberto' não podem ser alteradas ou excluídas");
  }
}

function validarFiltros(query) {
  const mensagens = [];
  const filtros = {};

  for (const campo of ['data_ini', 'data_fim']) {
    const valor = query[campo];
    if (valor === undefined || valor === '') continue;
    if (typeof valor !== 'string' || !REGEX_DATA.test(valor)) {
      mensagens.push(`${campo}: formato inválido, use AAAA-MM-DD`);
    } else {
      filtros[campo] = valor;
    }
  }

  if (typeof query.categoria === 'string' && query.categoria.trim()) {
    filtros.categoria = query.categoria.trim();
  }
  if (query.status !== undefined && query.status !== '') {
    if (!STATUS.includes(query.status)) mensagens.push('status: valor inválido');
    else filtros.status = query.status;
  }
  if (typeof query.q === 'string' && query.q.trim()) filtros.q = query.q.trim();

  if (mensagens.length) throw new AppError(400, 'Filtros inválidos', mensagens);
  return filtros;
}

const listar = (query) => solicitacaoModel.listar(validarFiltros(query));

function criar(usuario, body) {
  const dados = validarDados(body);
  const id = solicitacaoModel.inserir({ ...dados, usuarioId: usuario.id });
  return solicitacaoModel.findById(id);
}

function atualizar(id, usuario, body) {
  const solicitacao = obter(id);
  exigirPermissao(solicitacao, usuario);
  solicitacaoModel.atualizar(id, validarDados(body));
  return solicitacaoModel.findById(id);
}

function remover(id, usuario) {
  const solicitacao = obter(id);
  exigirPermissao(solicitacao, usuario);
  solicitacaoModel.remover(id);
}

function alterarStatus(id, body) {
  obter(id);
  const status = body?.status;
  if (!STATUS.includes(status)) {
    throw new AppError(400, 'Dados inválidos', [`status: valor deve ser um de ${STATUS.join(', ')}`]);
  }
  solicitacaoModel.atualizarStatus(id, status);
  return solicitacaoModel.findById(id);
}

module.exports = { listar, obter, criar, atualizar, remover, alterarStatus };