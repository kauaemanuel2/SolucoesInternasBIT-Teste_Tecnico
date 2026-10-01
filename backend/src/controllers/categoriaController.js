const categoriaService = require('../services/categoriaService');

module.exports = { listar: (req, res) => res.json(categoriaService.listar()) };