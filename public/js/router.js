import { estaAutenticado } from './auth.js';
import { montarShell, desmontarShell, marcarAtivo } from './components/layout.js';
import { toast } from './components/toast.js';

const rotas = [
  { padrao: /^\/login$/, publica: true, carregar: () => import('./pages/login.js') },
  { padrao: /^\/dashboard$/, carregar: () => import('./pages/dashboard.js') },
  { padrao: /^\/solicitacoes$/, carregar: () => import('./pages/solicitacoes.js') },
  { padrao: /^\/solicitacoes\/nova$/, carregar: () => import('./pages/formulario.js') },
  { padrao: /^\/solicitacoes\/(\d+)$/, carregar: () => import('./pages/detalhe.js') },
  { padrao: /^\/solicitacoes\/(\d+)\/editar$/, carregar: () => import('./pages/formulario.js') },
];

let versao = 0;

async function resolver() {
  const caminho = location.hash.slice(1).split('?')[0] || '/dashboard';
  const rota = rotas.find((r) => r.padrao.test(caminho));
  const autenticado = estaAutenticado();

  if (!rota) return (location.hash = autenticado ? '#/dashboard' : '#/login');
  if (!rota.publica && !autenticado) return (location.hash = '#/login');
  if (rota.publica && autenticado) return (location.hash = '#/dashboard');

  const minha = ++versao;
  const params = caminho.match(rota.padrao).slice(1);
  const modulo = await rota.carregar();
  if (minha !== versao) return undefined;

  const app = document.getElementById('app');
  let pagina;
  if (rota.publica) {
    desmontarShell(app);
    app.innerHTML = '';
    pagina = app;
  } else {
    const conteudo = montarShell(app);
    marcarAtivo(caminho);
    conteudo.innerHTML = '';
    pagina = document.createElement('div');
    pagina.className = 'pagina';
    conteudo.appendChild(pagina);
  }

  try {
    await modulo.render(pagina, params);
  } catch (erro) {
    if (erro.status !== 401) toast(erro.message || 'Erro inesperado', 'erro');
  }
  return undefined;
}

export function iniciarRouter() {
  window.addEventListener('hashchange', resolver);
  resolver();
}