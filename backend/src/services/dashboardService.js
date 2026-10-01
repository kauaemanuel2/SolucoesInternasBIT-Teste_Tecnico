const solicitacaoModel = require('../models/solicitacaoModel');

module.exports = { resumo: () => solicitacaoModel.contarPorStatus() };