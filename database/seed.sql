-- Marcadores HASH são trocados por hash bcrypt pelo script db:init.
INSERT INTO usuarios (nome, usuario, senha_hash) VALUES
  ('Administrador', 'admin', '@@HASH:admin123@@'),
  ('Maria Souza', 'maria', '@@HASH:123456@@');

INSERT INTO categorias (nome) VALUES
  ('TI'), ('RH'), ('Compras'), ('Financeiro'), ('Infraestrutura');

INSERT INTO solicitacoes
  (codigo, titulo, descricao, categoria_id, usuario_id, status, data_criacao, data_atualizacao)
VALUES
  ('SOL-00001', 'Instalação de software de modelagem', 'Instalar o software de modelagem 3D na estação do setor de projetos.', 1, 2, 'Aberto', '2026-09-14 09:12:00', '2026-09-14 09:12:00'),
  ('SOL-00002', 'Programação de férias coletivas', 'Definir o período de férias coletivas do setor administrativo.', 2, 1, 'Em Atendimento', '2026-09-15 10:30:00', '2026-09-16 08:00:00'),
  ('SOL-00003', 'Compra de monitores adicionais', 'Adquirir quatro monitores de 24 polegadas para a equipe de suporte.', 3, 2, 'Concluído', '2026-09-16 14:05:00', '2026-09-22 17:10:00'),
  ('SOL-00004', 'Reembolso de despesas de viagem', 'Reembolso de hospedagem e transporte da visita técnica de agosto.', 4, 1, 'Aberto', '2026-09-18 08:45:00', '2026-09-18 08:45:00'),
  ('SOL-00005', 'Manutenção do ar-condicionado da sala 3', 'Equipamento com ruído excessivo e baixa refrigeração.', 5, 2, 'Em Atendimento', '2026-09-21 11:20:00', '2026-09-23 09:30:00'),
  ('SOL-00006', 'Redefinição de acesso à VPN', 'Credencial da VPN bloqueada após tentativas de acesso.', 1, 1, 'Concluído', '2026-09-22 16:40:00', '2026-09-23 10:05:00'),
  ('SOL-00007', 'Atualização de dados cadastrais', 'Atualizar endereço e contato de emergência no cadastro do colaborador.', 2, 2, 'Aberto', '2026-09-24 09:00:00', '2026-09-24 09:00:00'),
  ('SOL-00008', 'Cotação de material de escritório', 'Levantar três cotações de papel, toner e itens de papelaria.', 3, 1, 'Em Atendimento', '2026-09-25 13:15:00', '2026-09-28 15:20:00');