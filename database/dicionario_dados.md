# Dicionário de Dados

Banco de dados: SQLite. Arquivo definido pela variável `DB_PATH`. Estrutura criada por `database/schema.sql` e dados iniciais carregados por `database/seed.sql`, ambos aplicados pelo comando `npm run db:init`.

Convenções: datas armazenadas como texto no formato `AAAA-MM-DD HH:MM:SS`, em horário local do servidor. Chaves estrangeiras são verificadas com `PRAGMA foreign_keys = ON`.

## Tabela `usuarios`

Cadastro de usuários autorizados a acessar o sistema. Cada usuário é o solicitante das solicitações que registra.

| Campo | Tipo | Nulidade | Chave | Valor padrão | Descrição |
|---|---|---|---|---|---|
| id | INTEGER | NOT NULL | PK (AUTOINCREMENT) | Gerado automaticamente | Identificador único do usuário. |
| nome | TEXT | NOT NULL | - | - | Nome de exibição do usuário. |
| usuario | TEXT | NOT NULL | UNIQUE | - | Identificador de login. Não admite repetição. |
| senha_hash | TEXT | NOT NULL | - | - | Hash bcrypt da senha. A senha em texto puro não é armazenada. |
| criado_em | TEXT | NOT NULL | - | `datetime('now','localtime')` | Data e hora de criação do registro. |

## Tabela `categorias`

Tabela de domínio com as categorias fixas de solicitação: TI, RH, Compras, Financeiro e Infraestrutura.

| Campo | Tipo | Nulidade | Chave | Valor padrão | Descrição |
|---|---|---|---|---|---|
| id | INTEGER | NOT NULL | PK (AUTOINCREMENT) | Gerado automaticamente | Identificador único da categoria. |
| nome | TEXT | NOT NULL | UNIQUE | - | Nome da categoria. Não admite repetição. |

## Tabela `solicitacoes`

Registro das demandas internas e do seu andamento.

| Campo | Tipo | Nulidade | Chave | Valor padrão | Descrição |
|---|---|---|---|---|---|
| id | INTEGER | NOT NULL | PK (AUTOINCREMENT) | Gerado automaticamente | Identificador único interno, usado nas rotas da API. |
| codigo | TEXT | NOT NULL | UNIQUE | Gerado pelo backend | Código de negócio no formato SOL-00001, com cinco dígitos derivados do id. |
| titulo | TEXT | NOT NULL | - | - | Título da solicitação. Validado entre 3 e 120 caracteres. |
| descricao | TEXT | NOT NULL | - | - | Descrição detalhada. Validada com até 2000 caracteres. |
| categoria_id | INTEGER | NOT NULL | FK para `categorias(id)` | - | Categoria da solicitação. |
| usuario_id | INTEGER | NOT NULL | FK para `usuarios(id)` | - | Solicitante. Preenchido com o usuário autenticado. |
| status | TEXT | NOT NULL | - | `'Aberto'` | Situação atual. Restrito por CHECK a Aberto, Em Atendimento ou Concluído. |
| data_criacao | TEXT | NOT NULL | - | Definido na inclusão | Data e hora de abertura. Exibido na interface com o rótulo "Data de abertura". Base dos filtros de período e da ordenação. |
| data_atualizacao | TEXT | NOT NULL | - | Definido na inclusão | Data e hora da última alteração de conteúdo ou de status. |

### Índices

| Índice | Coluna | Finalidade |
|---|---|---|
| idx_solicitacoes_data | data_criacao | Ordenação e filtro por período. |
| idx_solicitacoes_status | status | Filtro por status e contagens do dashboard. |
| idx_solicitacoes_categoria | categoria_id | Filtro por categoria. |
| idx_solicitacoes_usuario | usuario_id | Junção com o solicitante. |

## Relacionamentos

| Origem | Destino | Cardinalidade | Regra |
|---|---|---|---|
| solicitacoes.categoria_id | categorias.id | N para 1 | Toda solicitação possui exatamente uma categoria. |
| solicitacoes.usuario_id | usuarios.id | N para 1 | Toda solicitação possui exatamente um solicitante. |