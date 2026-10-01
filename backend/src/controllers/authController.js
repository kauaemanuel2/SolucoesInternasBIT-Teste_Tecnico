const authService = require('../services/authService');

const login = (req, res) => res.json(authService.login(req.body));

const me = (req, res) => res.json({ usuario: req.usuario });

module.exports = { login, me };