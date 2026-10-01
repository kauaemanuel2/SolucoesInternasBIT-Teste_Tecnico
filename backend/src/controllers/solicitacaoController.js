const solicitacaoService = require('../services/solicitacaoService');
const AppError = require('../utils/AppError');

function lerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(404, 'Solicitação não encontrada');
  return id;
}

const listar = (req, res) => res.json(solicitacaoService.listar(req.query));

const obter = (req, res) => res.json(solicitacaoService.obter(lerId(req)));

const criar = (req, res) => res.status(201).json(solicitacaoService.criar(req.usuario, req.body));

const atualizar = (req, res) =>
  res.json(solicitacaoService.atualizar(lerId(req), req.usuario, req.body));

const remover = (req, res) => {
  solicitacaoService.remover(lerId(req), req.usuario);
  res.status(204).end();
};

const alterarStatus = (req, res) =>
  res.json(solicitacaoService.alterarStatus(lerId(req), req.body));

module.exports = { listar, obter, criar, atualizar, remover, alterarStatus };