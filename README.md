# Portal de Solicitações Internas

Aplicação web para registro e acompanhamento de demandas internas da bit Soluções. Colaboradores autenticados abrem solicitações classificadas por categoria (TI, RH, Compras, Financeiro, Infraestrutura), consultam a listagem com filtros combináveis, acompanham o status até a conclusão e visualizam um painel com quatro indicadores.

A API é REST, em Node.js com Express, com persistência em SQLite. O frontend é HTML, CSS e JavaScript puro, servido pelo próprio Express — não há etapa de build. As justificativas das escolhas técnicas estão em `MEMORIAL_TECNICO.md`; a estrutura do banco, em `database/dicionario_dados.md`.

## Pré-requisitos

- Node.js 20 LTS ou superior (testado na 22 e na 24). Recomendo a versão LTS atual. Versões fora da linha LTS podem não ter binário pré-compilado para o driver do banco, forçando compilação nativa (requer Visual Studio C++ Build Tools no Windows).
- Banco de dados: nenhum para instalar. O SQLite é embutido; o arquivo do banco é criado localmente pelo script de inicialização.
- Dependências (instaladas via npm): `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `dotenv`.
- Navegador atual com suporte a ES Modules. A fonte Inter vem do Google Fonts; sem conexão, a interface usa a fonte do sistema.

Recomendação adicional: evite caminhos de diretório com acentos (por exemplo, "Projetos" com ç). O PowerShell do Windows pode corromper a codificação de comandos colados envolvendo esses caminhos.

## Instalação

1. Obtenha o código-fonte e abra a raiz do projeto.

2. Crie o arquivo de configuração a partir do exemplo:

   No Linux/macOS:

   ```bash
   cp .env.example .env
   ```

   No Windows (PowerShell):

   ```powershell
   Copy-Item .env.example .env
   ```

   O arquivo deve ficar na raiz do projeto.

3. Instale as dependências do backend:

   ```bash
   cd backend
   npm install
   ```

4. Crie o banco com tabelas e dados de demonstração:

   ```bash
   npm run db:init
   ```

   O comando aplica `database/schema.sql` e `database/seed.sql`. Ele recria as tabelas: executado sobre um banco existente, descarta os dados anteriores. Não o execute se quiser preservar registros criados por uso.

5. Frontend: não há instalação. Os arquivos de `public/` são servidos pelo Express na mesma porta da API.

## Configuração

As variáveis ficam no `.env`, na raiz do projeto, ao lado de `.env.example` (o `.env` não é versionado):

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `PORT` | Porta HTTP do servidor | `3000` |
| `JWT_SECRET` | Segredo de assinatura dos tokens. Obrigatório. | Texto longo aleatório |
| `JWT_EXPIRES_IN` | Validade do token | `8h` |
| `DB_PATH` | Caminho do arquivo SQLite. Relativo à raiz. | `./database/portal.db` |

A aplicação não inicia sem `JWT_SECRET`. Para gerar um valor adequado:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Execução

Backend e frontend rodam no mesmo processo. A partir de `backend/`:

```bash
npm run dev
```

Modo desenvolvimento, com reinício automático a cada alteração (`node --watch`).

```bash
npm start
```

Modo normal (`node src/server.js`).

## Acesso

- URL: http://localhost:3000 (ou a porta definida em `PORT`)
- Usuários de demonstração, criados pelo seed:

| Usuário | Senha |
| --- | --- |
| `admin` | `admin123` |
| `maria` | `123456` |

Credenciais de avaliação: remover ou alterar fora de ambiente de demonstração.

## Problemas conhecidos

- `ENOENT ... package.json` ao rodar npm: os comandos `install` e `run` executam a partir de `backend/`, onde está o `package.json`. Verifique o diretório atual com `pwd` antes.
- `JWT_SECRET` não definido na inicialização: o `.env` precisa estar na raiz do projeto, não dentro de `backend/`.
- `no such table: usuarios` ao logar: o banco foi criado vazio — execute `npm run db:init` (com o servidor parado) e reinicie.
- Porta em uso (`EADDRINUSE`): troque o valor de `PORT` no `.env`.
- `npm install` falha compilando `better-sqlite3`: use uma versão LTS do Node, que tem binário pré-compilado (ver Pré-requisitos).

## API

Todas as rotas, exceto `POST /api/auth/login`, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Autentica e retorna token e dados do usuário. |
| `GET` | `/api/auth/me` | Dados do usuário autenticado. |
| `GET` | `/api/categorias` | Lista as categorias. |
| `POST` | `/api/solicitacoes` | Cria solicitação. |
| `GET` | `/api/solicitacoes` | Lista com filtros `data_ini`, `data_fim`, `categoria`, `status`, `q`. |
| `GET` | `/api/solicitacoes/:id` | Detalha uma solicitação. |
| `PUT` | `/api/solicitacoes/:id` | Edita. Apenas o solicitante e apenas com status Aberto. |
| `DELETE` | `/api/solicitacoes/:id` | Exclui. Apenas o solicitante e apenas com status Aberto. |
| `PATCH` | `/api/solicitacoes/:id/status` | Altera o status. Qualquer usuário autenticado. |
| `GET` | `/api/dashboard` | Totais por status. |

Erros no formato:

```json
{ "erro": "mensagem", "mensagens": ["campo: motivo"] }
```

com os códigos 400, 401, 403, 404 e 500. Filtros de data no formato `AAAA-MM-DD`. O filtro `categoria` aceita id ou nome.

## Estrutura

```text
backend/
  package.json
  src/
    config/        variáveis de ambiente e conexão com o banco
    controllers/   entrada e saída HTTP
    middlewares/   autenticação e tratamento de erros
    models/        acesso ao SQLite
    routes/        definição dos endpoints
    services/      regras de negócio e validações
    utils/         erro padronizado, validadores, script de inicialização
database/
  schema.sql
  seed.sql
  dicionario_dados.md
public/
  index.html
  css/styles.css
  js/
    app, router, api, auth, pages/, components/
```

Fluxo das camadas no backend: rotas → controllers → services → models.

## Regras de acesso

- Editar e excluir: somente o solicitante original e somente com status Aberto. Nos demais casos, a API responde 403.
- Alterar status: qualquer usuário autenticado.
- Token ausente, inválido ou expirado: 401. O frontend limpa a sessão e retorna ao login.