const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const usuarioModel = require('../models/usuarioModel');
const AppError = require('../utils/AppError');

module.exports = function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new AppError(401, 'Token de autenticação não informado'));
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return next(new AppError(401, 'Token inválido ou expirado'));
  }

  const usuario = usuarioModel.findById(payload.sub);
  if (!usuario) return next(new AppError(401, 'Usuário da sessão não encontrado'));

  req.usuario = usuario;
  next();
};