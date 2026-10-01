const db = require('../config/database');
const gerarCodigo = require('../utils/codigo');
const { randomUUID } = require('crypto');

const BASE = `
  SELECT s.id, s.codigo, s.titulo, s.descricao, s.status,
         s.data_criacao, s.data_atualizacao,
         s.categoria_id, c.nome AS categoria,
         s.usuario_id, u.nome AS solicitante
  FROM solicitacoes s
  JOIN categorias c ON c.id = s.categoria_id
  JOIN usuarios u ON u.id = s.usuario_id`;

const escapeLike = (texto) => texto.replace(/[\\%_]/g, (c) => `\\${c}`);

function listar({ data_ini, data_fim, categoria, status, q } = {}) {
  const where = [];
  const params = [];

  if (data_ini) { where.push('date(s.data_criacao) >= date(?)'); params.push(data_ini); }
  if (data_fim) { where.push('date(s.data_criacao) <= date(?)'); params.push(data_fim); }
  if (categoria) { where.push('(c.id = ? OR c.nome = ?)'); params.push(categoria, categoria); }
  if (status) { where.push('s.status = ?'); params.push(status); }
  if (q) { where.push("s.titulo LIKE ? ESCAPE '\\'"); params.push(`%${escapeLike(q)}%`); }

  const sql = `${BASE}${where.length ? ` WHERE ${where.join(' AND ')}` : ''}
    ORDER BY s.data_criacao DESC, s.id DESC`;
  return db.prepare(sql).all(...params);
}

const findById = (id) => db.prepare(`${BASE} WHERE s.id = ?`).get(id);

const inserir = db.transaction(({ titulo, descricao, categoriaId, usuarioId }) => {
  const info = db
    .prepare(
      `INSERT INTO solicitacoes
        (codigo, titulo, descricao, categoria_id, usuario_id, status, data_criacao, data_atualizacao)
       VALUES (?, ?, ?, ?, ?, 'Aberto', datetime('now','localtime'), datetime('now','localtime'))`
    )
    .run(`TMP-${randomUUID()}`, titulo, descricao, categoriaId, usuarioId);
  const id = Number(info.lastInsertRowid);
  db.prepare('UPDATE solicitacoes SET codigo = ? WHERE id = ?').run(gerarCodigo(id), id);
  return id;
});

const atualizar = (id, { titulo, descricao, categoriaId }) =>
  db
    .prepare(
      `UPDATE solicitacoes
         SET titulo = ?, descricao = ?, categoria_id = ?, data_atualizacao = datetime('now','localtime')
       WHERE id = ?`
    )
    .run(titulo, descricao, categoriaId, id);

const atualizarStatus = (id, status) =>
  db
    .prepare("UPDATE solicitacoes SET status = ?, data_atualizacao = datetime('now','localtime') WHERE id = ?")
    .run(status, id);

const remover = (id) => db.prepare('DELETE FROM solicitacoes WHERE id = ?').run(id);

const contarPorStatus = () =>
  db
    .prepare(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(status = 'Aberto'), 0) AS abertos,
              COALESCE(SUM(status = 'Em Atendimento'), 0) AS em_atendimento,
              COALESCE(SUM(status = 'Concluído'), 0) AS concluidos
       FROM solicitacoes`
    )
    .get();

module.exports = {
  listar, findById, inserir, atualizar, atualizarStatus, remover, contarPorStatus,
};