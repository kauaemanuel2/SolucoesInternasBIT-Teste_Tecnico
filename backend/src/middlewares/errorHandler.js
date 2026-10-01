const AppError = require('../utils/AppError');

function naoEncontrado(req, res, next) {
  next(new AppError(404, 'Rota não encontrada'));
}

// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ erro: err.message, mensagens: err.mensagens });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Corpo da requisição inválido', mensagens: ['corpo: JSON malformado'] });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor', mensagens: [] });
}

module.exports = { naoEncontrado, tratarErros };