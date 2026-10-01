const db = require('../config/database');

const findById = (id) =>
  db.prepare('SELECT id, nome, usuario FROM usuarios WHERE id = ?').get(id);

const findByUsuario = (usuario) =>
  db.prepare('SELECT id, nome, usuario, senha_hash FROM usuarios WHERE usuario = ?').get(usuario);

module.exports = { findById, findByUsuario };