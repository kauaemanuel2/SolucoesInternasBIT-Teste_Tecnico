# Memorial Técnico de Desenvolvimento

**Portal de Solicitações Internas — bit Soluções**  
Teste técnico para a vaga de Desenvolvedor(a) de Sistemas Júnior

Este documento registra as tecnologias escolhidas, as decisões de arquitetura e uma avaliação crítica do que foi entregue. Escrevi tentando deixar explícito o raciocínio por trás de cada decisão, inclusive nos pontos em que a solução é deliberadamente simples e naqueles que eu faria diferente se o destino fosse produção corporativa.

## 1. Tecnologias utilizadas

**Linguagens:** JavaScript (Node.js no backend, navegador no frontend), SQL no dialeto SQLite, HTML e CSS.

**Backend:** Node.js, Express, better-sqlite3, jsonwebtoken, bcryptjs, dotenv.

**Banco de dados:** SQLite, em modo WAL, com integridade referencial ativada.

**Frontend:** HTML, CSS e JavaScript puro com ES Modules. Sem framework, sem etapa de build. Fetch API para consumo da API. Roteamento por hash escrito na aplicação. Fonte Inter via Google Fonts.

**Ferramentas:** npm, Git.

Deixei de fora desta entrega: frameworks frontend, ORM, biblioteca de validação, Docker, testes automatizados e CI/CD. As razões estão na seção 4, junto com o plano para incorporá-los.

## 2. Justificativa técnica

### 2.1 Node.js

O enunciado deixa a stack livre, e a primeira decisão que tomei foi usar uma linguagem só nas duas pontas. Com JavaScript no servidor e no navegador, não há troca de contexto mental, as convenções de nomenclatura e os formatos de dados são compartilhados, e quem for executar o projeto precisa instalar um único runtime — a API, o script de banco e o servidor de arquivos estáticos saem do mesmo processo. Para uma API de consultas curtas como esta, o modelo de I/O assíncrono do Node sobra.

Comparei com as alternativas que conheço. Java com Spring Boot e C# com ASP.NET oferecem mais estrutura para sistemas grandes, mas a cerimônia de configuração e o tempo de partida seriam desproporcionais para cinco dias de prazo e dez rotas. Python com Flask é igualmente viável; Django traria autenticação e ORM prontos, mas com um volume de convenções que eu teria que aprender e justificar sem aproveitar. A unificação com o frontend pesou a favor do Node. Em manutenção, o ecossistema npm e a disponibilidade de profissionais são pontos fortes; a escalabilidade horizontal é possível enquanto o estado ficar fora do processo, o que a autenticação sem sessão em memória favorece.

### 2.2 Express

Para dez rotas, o necessário é roteamento, leitura de JSON, arquivos estáticos e um ponto central de tratamento de erros. O Express entrega exatamente isso com uma API pequena e estável, e é o framework mais difundido do ecossistema — qualquer pessoa que mexa no projeto depois vai reconhecer os padrões.

O Fastify tem desempenho superior e validação de esquema integrada, mas throughput não é um problema para uma aplicação interna de baixo volume, e a validação por esquema acrescentaria um segundo mecanismo ao lado da validação que já faço na camada de serviço — prefiro um mecanismo só, bem colocado. O NestJS traria arquitetura opinativa, injeção de dependência e TypeScript; acho valioso em equipes grandes, mas a curva e a quantidade de código estrutural não se pagam aqui. A escolha do Express tem um custo que reconheço: ele não impõe nada. Nada impede que uma rota acesse o banco diretamente pulando as camadas — a arquitetura depende de disciplina e de revisão. Como contrapartida, a separação em rotas, controllers, services e models fica como decisão explícita do projeto, e não algo que o framework faz por mim.

### 2.3 SQLite com better-sqlite3

O sistema precisa persistir três tabelas para uma quantidade pequena de usuários. O SQLite dispensa servidor de banco, usuário, senha e configuração de rede: o banco é um arquivo criado por `npm run db:init`. Isso atende ao requisito de execução sem adaptações — quem avalia não instala SGBD nenhum. E, ainda que simples, é relacional de verdade: transações, chaves estrangeiras, restrições CHECK e índices, o que me deixa manter as regras de integridade no próprio banco e não só no código.

Contra MySQL e PostgreSQL, o SQLite perde em concorrência de escrita (um único escritor por vez), em ferramentas administrativas, em variedade de tipos e em replicação. Para o volume esperado, essas limitações não aparecem — e o modo WAL permite leituras concorrentes durante uma escrita. O que ganho é simplicidade operacional e reprodutibilidade do ambiente. Se precisar migrar amanhã, o acesso a dados está isolado na camada de models e o SQL usado é majoritariamente padrão; os pontos que exigirão atenção são as funções de data (`datetime`, `date`) e o `LIKE` com `ESCAPE`, que são dialeto.

Sobre o driver: escolhi `better-sqlite3` em vez do `sqlite3` pela API síncrona. Como o SQLite é local e rápido, a chamada síncrona elimina callbacks e promessas no acesso a dados e simplifica transações. O custo é bloquear o laço de eventos durante a consulta — aceitável para consultas curtas, e um ponto a revisar se aparecerem consultas pesadas. Há ainda o custo do módulo nativo: depende de binário pré-compilado ou de toolchain de compilação. Isso me mordeu durante o desenvolvimento — detalho na seção 4.5 — e acabou virando requisito explícito de versão LTS no README.

### 2.4 JWT com jsonwebtoken

A autenticação emite um token assinado, enviado no cabeçalho `Authorization`, com validade de 8 horas. Sem sessão em memória, a API é sem estado: reiniciar o servidor não derruba ninguém, rodar mais de uma instância é viável e o frontend pode ser substituído sem tocar no backend.

Contra cookies de sessão, o JWT no cabeçalho evita CSRF (o navegador não anexa o token automaticamente) e facilita o consumo por outros clientes. As contrapartidas são conhecidas: não dá para revogar um token individual sem manter lista no servidor, e o armazenamento no cliente tem limitações que discuto na seção 3.5. Para reduzir a primeira, o middleware confere a cada requisição se o usuário ainda existe no banco, o que invalida tokens de contas excluídas. A biblioteca `jsonwebtoken` é a implementação de referência do ecossistema e cobre assinatura e expiração sem configuração extra.

### 2.5 bcryptjs

Senhas existem no banco apenas como hash bcrypt com fator de custo 10. Escolhi bcrypt por ser algoritmo adaptativo, com sal embutido e custo configurável, projetado para encarecer força bruta — funções rápidas como SHA-256 são inadequadas para senha. A implementação em JavaScript puro (`bcryptjs`) é mais lenta que o pacote `bcrypt`, que é nativo, mas evita uma segunda dependência nativa no projeto — depois do episódio com o `better-sqlite3` na seção 4.5, ter o mínimo possível de módulos nativos passou a ser critério deliberado para um projeto que precisa rodar em qualquer máquina de avaliação sem fricção. Em produção eu consideraria Argon2, hoje recomendado por oferecer maior resistência a hardware dedicado. Como o hash é autodescritivo, elevar o custo no futuro não exige mudança no modelo de dados.

### 2.6 dotenv

O segredo do JWT e as variáveis que mudam entre ambientes (porta, caminho do banco) ficam fora do código, em `.env`, versionado apenas como `.env.example`. O módulo de configuração interrompe a inicialização se `JWT_SECRET` estiver ausente — prefiro a aplicação falhando na largada com mensagem clara a rodando com segredo vazio e explodindo no primeiro login. Em produção, as variáveis viriam do orquestrador ou de um gerenciador de segredos, sem mudança no código.

### 2.7 JavaScript puro com ES Modules no frontend

O frontend tem seis telas e formulários simples. A complexidade de estado não justifica framework, e a ausência de build tem um benefício que valorizo nesta entrega específica: o código que o avaliador lê é exatamente o código que roda, e a execução fica em um comando, sem cadeia de dependências de desenvolvimento.

Contra React, perco o modelo declarativo, a reatividade e o ecossistema, e ganho transparência total sobre DOM, roteamento e HTTP — coisas que, no nível júnior, valem saber fazer à mão. Reconheço o limite: renderização por concatenação de strings com atualização manual do DOM não escala para telas complexas; acima desse porte, framework com TypeScript seria a recomendação. Para reduzir o risco do modelo atual, todo dado vindo da API passa por uma função única de escape antes de entrar no HTML, o que bloqueia injeção de script, e a organização em `pages/` e `components/` mantém a reutilização. As páginas são carregadas sob demanda com `import()` no roteador.

### 2.8 CSS puro e Fetch API

Estilos e animações em CSS puro com variáveis para a paleta da marca — a identidade visual da bit (gradiente ciano-azul) está toda em `styles.css`, sem Tailwind e sem biblioteca de animação. As transições ficam entre 150 e 250 ms com easing suave, e há regra de mídia para reduzir movimento quando o sistema operacional o solicita. A comunicação com a API usa a Fetch API nativa, encapsulada em um módulo único (`api.js`) que injeta o token, converte erro em exceção padronizada e trata 401 de forma global. O Axios ofereceria interceptadores prontos; o encapsulamento próprio tem poucas linhas e uma dependência a menos.

### 2.9 Ferramentas auxiliares

A fonte Inter vem do Google Fonts com reserva na pilha de fontes do sistema; é legível em interfaces densas e adequada ao clima corporativo que a interface pede. O npm centraliza dependências e scripts (`start`, `dev`, `db:init`). O Git versiona a entrega e o `.gitignore` exclui `node_modules`, `.env` e arquivos de banco.

## 3. Justificativa conceitual

### 3.1 Estrutura geral

A aplicação é um monólito com dois módulos num único processo: uma API REST sob `/api` e o frontend estático servido de `public/`. Servir os dois pela mesma origem elimina configuração de CORS, reduz a um processo e uma porta, e mantém a API como único ponto de acesso aos dados — o frontend é um cliente dela e pode ser substituído sem tocar no servidor.

### 3.2 Organização das camadas

O backend segue rotas → controllers → services → models, com uma responsabilidade por camada. As rotas declaram método, caminho e a ordem dos middlewares; a autenticação é aplicada uma única vez, no roteador principal, depois das rotas de `/auth` — toda rota nova herda a proteção por padrão e a exceção (login) fica explícita. Os controllers traduzem HTTP: leem parâmetros, corpo e usuário da requisição, chamam o service e definem o código de resposta, sem regra de negócio. Os services concentram as regras — validação de campos, existência da categoria, permissão de editar e excluir, filtros, transições de status — e lançam um erro de aplicação carregando código HTTP e mensagens. Os models encapsulam todo o SQL, sempre parametrizado, o que elimina injeção de SQL por construção. Os middlewares cuidam da autenticação e do tratamento centralizado de erros, que converte qualquer exceção no formato `{ erro, mensagens }` e responde 500 sem vazar detalhes internos.

A separação torna cada regra localizável e testável isoladamente. O custo é a quantidade de arquivos e alguns repasses sem lógica própria — o service de categorias, por exemplo, só delega ao model. Mantive assim em favor da consistência do fluxo: prefiro um caminho uniforme com um ponto "vazio" a criar atalho.

### 3.3 Modelagem de dados

Três tabelas normalizadas: `usuarios`, `categorias`, `solicitacoes`. As categorias viraram tabela própria, e não coluna de texto livre, para garantir integridade referencial, permitir que a API exponha a lista e aceitar novas categorias sem mudança de código. O status ficou como texto com restrição `CHECK`: o conjunto é pequeno e estável, e uma quarta tabela traria junções sem benefício correspondente.

O campo `data_criacao` é único e representa a data de abertura — o enunciado usa os dois nomes, "data de criação" nos campos automáticos e "data de abertura" na listagem; tratei como um campo só, exibido com o rótulo de abertura na interface. O `data_atualizacao` registra a última alteração. As datas são gravadas como texto `AAAA-MM-DD HH:MM:SS`, formato que ordena corretamente de forma lexicográfica e é aceito pelas funções de data do SQLite; os filtros de período usam `date()` para incluir o dia final por completo.

O código `SOL-00001` é gerado no backend, dentro de uma transação: a linha é inserida com um valor provisório único, o `id` gerado pelo banco é lido e o código definitivo é gravado a partir dele com preenchimento de cinco dígitos. Fiz assim para evitar a condição de corrida do esquema "consulte o maior código e some um", e porque o `AUTOINCREMENT` garante que códigos de solicitações excluídas não sejam reaproveitados. Índices foram criados nas colunas de filtro e ordenação (`data_criacao`, `status`, `categoria_id`, `usuario_id`) — para o volume atual o efeito é pequeno, mas eles registram o padrão de acesso que a listagem e o dashboard exercitam.

### 3.4 Padrões utilizados

Arquitetura em camadas; objeto de erro de domínio (`AppError`) com código HTTP e lista de mensagens, lançado pelos services e convertido em resposta por um único middleware, de modo que o formato de erro é idêntico em toda a API; encapsulamento de acesso a dados nos models, no estilo repositório; módulos de responsabilidade única no frontend (`api.js` para transporte, `auth.js` para sessão, `router.js` para navegação, `pages/` e `components/` para telas e elementos reutilizáveis — toast, modal, skeleton, tratamento de erro de formulário); escape centralizado de conteúdo dinâmico antes de qualquer inserção no HTML; e descarte de respostas obsoletas por contador de versão, para que um resultado atrasado não sobrescreva uma listagem mais recente depois de uma troca de filtro ou de página.

### 3.5 Estratégia de autenticação

O login valida usuário e senha contra o hash bcrypt e emite o JWT de 8 horas. A resposta de falha é idêntica para usuário inexistente e senha incorreta, para não revelar quais contas existem. O middleware verifica assinatura e validade, confere que o usuário ainda existe e anexa os dados à requisição. A rota `/api/auth/me` devolve o usuário autenticado e o frontend a consulta ao iniciar — é esse par token + consulta que materializa o controle de sessão. A autorização por recurso (editar e excluir) é feita no service, comparando solicitante e status, respondendo 403 quando negada.

O token fica em `localStorage`, como o requisito pede, e essa escolha tem limitações que considero importante explicitar em vez de esconder: qualquer script executado na página — por uma falha de XSS ou por uma dependência de terceiros comprometida — consegue ler o token; o `localStorage` não expira sozinho e não tem proteção contra leitura por JavaScript, ao contrário do cookie `HttpOnly`. As mitigações que adotei foram o escape sistemático de conteúdo dinâmico, a ausência de bibliotecas de terceiros no frontend (além da folha de fonte), a vida curta do token e o tratamento global do 401 que limpa a sessão. Ainda assim não há revogação individual nem renovação. Em produção, minha recomendação seria cookie `HttpOnly`, `Secure` e `SameSite`, com token de acesso curto e token de renovação rotativo, acompanhados de proteção CSRF e de uma política de segurança de conteúdo.

### 3.6 Comunicação entre frontend e backend

REST sobre HTTP, com JSON e códigos de status semânticos: 201 na criação, 204 na exclusão, 400 para validação, 401, 403 e 404 conforme o caso. Os filtros da listagem trafegam por query string. A alteração de status usa `PATCH` em um subrecurso — é uma alteração parcial com regra de acesso distinta da edição completa, e achei correto que ficassem endpoints separados. O corpo de erro padronizado permite que os formulários associem cada mensagem `campo: motivo` ao campo correspondente, inline, enquanto erros gerais vão para toast. O 401 é tratado de forma global: sessão limpa e retorno ao login — exceto na própria rota de login, onde 401 significa credenciais inválidas e não sessão expirada.

### 3.7 Organização do código-fonte

A raiz concentra documentação e configuração (`README.md`, `MEMORIAL_TECNICO.md`, `.env.example`, `.gitignore`); `backend/` tem o código do servidor; `database/`, os scripts SQL e o dicionário de dados; `public/`, o frontend. Os scripts de banco ficam fora do código do servidor por serem artefatos de dados. O `db:init` os aplica em ordem e, no seed, substitui marcadores de senha por hashes bcrypt gerados na execução — nenhum hash fixo fica versionado. A nomenclatura segue português no domínio (solicitação, categoria, solicitante), camelCase no código e snake_case nas colunas.

## 4. Análise crítica

### 4.1 Limitações da solução

- A listagem não tem paginação: retorna todos os registros que atendem aos filtros. Cabe nos dados de demonstração e degrada com o crescimento da base.
- Não há papéis de usuário. Qualquer autenticado altera o status de qualquer solicitação, inclusive revertendo para um status anterior, e não existe histórico de quem alterou o quê.
- A validação foi manual, sem testes automatizados. As regras de acesso e de validação, concentradas nos services, são as candidatas naturais.
- O token não é revogável individualmente, e o `localStorage` carrega as limitações da seção 3.5.
- O login não tem limite de tentativas.
- Faltam cabeçalhos de segurança HTTP (`helmet`) e CSP.
- A concorrência de escrita é limitada pelo SQLite, com banco em arquivo local e execução em instância única.
- As datas são gravadas no horário local do servidor, sem fuso — ambíguo se o servidor mudar de fuso ou se houver usuários em fusos diferentes.
- A fonte depende do Google Fonts, com reserva no sistema em caso de falha.
- A renderização por strings exige escape contínuo e não escala para telas complexas.
- Não há migrações versionadas: o `db:init` recria as tabelas e descarta dados, o que é adequado para demonstração e errado para banco com dados reais.

### 4.2 Problemas encontrados durante o desenvolvimento

Registrei aqui os problemas concretos que enfrentei, porque eles mudaram decisões do projeto.

O primeiro foi a instalação do `better-sqlite3`. Em um ambiente com Node.js em versão fora da linha LTS, não existia binário pré-compilado, e o npm tentou compilar o módulo nativo com `node-gyp`, que falhou por não encontrar o Visual Studio C++ Build Tools. Em vez de instalar uma toolchain de vários gigabytes para contornar, padronizei o ambiente em versão LTS — que tem binário pré-compilado — e transformei a lição em requisito explícito na seção de pré-requisitos do README.

O segundo foi uma inconsistência de configuração que custou a maior parte de uma sessão de depuração. Os dois pontos de entrada do backend carregavam o `.env` de formas diferentes: o servidor via `dotenv.config()` sem caminho (diretório atual) e o script de inicialização do banco dependia apenas do módulo de configuração, que resolve o `.env` na raiz do projeto. Com o arquivo em `backend/`, o servidor subia normalmente enquanto o `db:init` falhava com `JWT_SECRET` não definido — a configuração errada passava despercebida por um dos caminhos. Corrigi movendo o `.env` para a raiz, e o aprendizado ficou: um ponto de carga de configuração só, e validação das variáveis obrigatórias na inicialização.

O terceiro: o SQLite (via driver) cria um arquivo de banco vazio quando a conexão abre sobre caminho inexistente. O resultado foi um servidor subindo sem erro nenhum e estourando `no such table: usuarios` só no primeiro login, com status 500. O diagnóstico correto — `db:init` nunca tinha completado com sucesso por causa do problema anterior — só ficou claro depois. Em produção, eu validaria a presença do schema no boot (fail-fast, como já é feito com o `JWT_SECRET`) ou executaria a migração automaticamente em ambiente de desenvolvimento.

Por último, problemas de codificação com caminhos de diretório contendo acentos no Windows corromperam comandos colados no PowerShell em mais de uma ocasião — o caminho parecia correto na tela e não era encontrado. Padronizar diretórios de projeto sem espaços e sem acentos passou a ser regra pessoal de infraestrutura, e está documentado no README como recomendação.

### 4.3 Melhorias futuras

- Paginação e ordenação configurável na listagem, com contagem total.
- Papéis de usuário (solicitante, atendente, administrador), com transições de status restritas e atribuição de atendente.
- Histórico de alterações de status e de conteúdo, com autor e data.
- Testes automatizados: unitários para os services e de integração para a API, com banco em memória.
- Docker e Docker Compose para padronizar o ambiente; pipeline de CI/CD com lint, testes e build de imagem.
- Validação de esquemas declarativa para as entradas da API.
- Limite de taxa nas rotas de autenticação, cabeçalhos de segurança e logs estruturados.
- Ferramenta de migrações versionadas no lugar do recriar tabelas.
- Comentários e anexos nas solicitações, e notificações de mudança de status.

### 4.4 Requisitos que poderiam ser aperfeiçoados

- A alteração de status é livre: o requisito não define transições, então qualquer usuário pode mover para qualquer estado, inclusive reabrir uma solicitação concluída sem registro. Um fluxo com reabertura controlada evitaria inconsistências.
- A edição só em status Aberto é uma regra clara, mas impede correções depois do início do atendimento; um campo de comentários atenderia a necessidade de complemento sem alterar o conteúdo original.
- As categorias são fixas no seed: adequadas ao escopo, dependentes de script para mudar. Uma administração de categorias seria necessária em uso real.
- O requisito não diz se o dashboard reflete todas as solicitações ou só as do usuário logado. Adotei a visão global e marcaria a decisão para confirmação com quem solicitou o sistema.
- "Data de criação" e "data de abertura" designam o mesmo campo no enunciado; unificaria o termo no requisito.

### 4.5 Decisões diferentes em ambiente corporativo de produção

- **Banco de dados:** PostgreSQL (ou o padrão da empresa), com pool de conexões, backups, réplicas e migrações versionadas, no lugar do SQLite em arquivo local.
- **Autenticação:** integração com o provedor de identidade corporativo (SSO, OIDC ou LDAP), sem base própria de senhas; tokens de acesso curtos, renovação rotativa e cookies `HttpOnly`.
- **Transporte e borda:** HTTPS obrigatório, proxy reverso, cabeçalhos de segurança, CSP e limite de taxa.
- **Segredos:** gerenciador com rotação, em vez de `.env`.
- **Operação:** contêineres, CI/CD, monitoramento, logs estruturados com correlação de requisições e health check.
- **Frontend:** framework com tipagem (TypeScript) e testes de interface, dado o crescimento previsível de telas e de equipe, com ativos estáticos em CDN.
- **Governança:** controle de acesso por papéis, trilha de auditoria e atenção à LGPD para os dados pessoais de usuários e solicitantes.
- **Qualidade:** cobertura de testes exigida na integração, análise estática e revisão obrigatória.