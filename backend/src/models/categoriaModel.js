const db = require('../config/database');

const listar = () => db.prepare('SELECT id, nome FROM categorias ORDER BY id').all();

const findByIdOuNome = (valor) => {
  if (typeof valor !== 'number' && typeof valor !== 'string') return undefined;
  return db.prepare('SELECT id, nome FROM categorias WHERE id = ? OR nome = ?').get(valor, String(valor));
};

module.exports = { listar, findByIdOuNome };