const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const usuarioModel = require('../models/usuarioModel');
const AppError = require('../utils/AppError');

function login(body) {
  const usuario = typeof body?.usuario === 'string' ? body.usuario.trim() : '';
  const senha = typeof body?.senha === 'string' ? body.senha : '';
  const mensagens = [];
  if (!usuario) mensagens.push('usuario: campo obrigatório');
  if (!senha) mensagens.push('senha: campo obrigatório');
  if (mensagens.length) throw new AppError(400, 'Dados inválidos', mensagens);

  const registro = usuarioModel.findByUsuario(usuario);
  if (!registro || !bcrypt.compareSync(senha, registro.senha_hash)) {
    throw new AppError(401, 'Usuário ou senha inválidos');
  }

  const token = jwt.sign({ sub: registro.id }, jwtSecret, { expiresIn: jwtExpiresIn });
  return { token, usuario: { id: registro.id, nome: registro.nome, usuario: registro.usuario } };
}

module.exports = { login };