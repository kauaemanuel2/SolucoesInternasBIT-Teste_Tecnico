-- Reinicializa a estrutura; dados existentes são descartados.
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS solicitacoes;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
PRAGMA foreign_keys = ON;

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE solicitacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  status TEXT NOT NULL DEFAULT 'Aberto'
    CHECK (status IN ('Aberto','Em Atendimento','Concluído')),
  data_criacao TEXT NOT NULL,
  data_atualizacao TEXT NOT NULL
);

CREATE INDEX idx_solicitacoes_data ON solicitacoes(data_criacao);
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX idx_solicitacoes_categoria ON solicitacoes(categoria_id);
CREATE INDEX idx_solicitacoes_usuario ON solicitacoes(usuario_id);