const dashboardService = require('../services/dashboardService');

module.exports = { resumo: (req, res) => res.json(dashboardService.resumo()) };