import { getUsuario, logout } from '../auth.js';
import { logo } from './logo.js';
import { icone } from './icones.js';

const NAV = [
  { href: '#/dashboard', rotulo: 'Dashboard', chave: 'dashboard', icone: 'painel' },
  { href: '#/solicitacoes', rotulo: 'Solicitações', chave: 'solicitacoes', icone: 'lista' },
  { href: '#/solicitacoes/nova', rotulo: 'Nova solicitação', chave: 'nova', icone: 'mais' },
];

export function montarShell(app) {
  if (app.dataset.shell !== '1') {
    app.dataset.shell = '1';
    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar">
          ${logo()}
          <nav class="nav" aria-label="Principal">
            ${NAV.map((n) => `<a href="${n.href}" data-chave="${n.chave}">${icone(n.icone)}<span>${n.rotulo}</span></a>`).join('')}
          </nav>
          <div class="usuario-box">
            <div class="usuario-info">
              <span class="avatar" id="avatar"></span>
              <div class="usuario-dados">
                <span class="usuario-nome" id="usuario-nome"></span>
                <span class="usuario-login" id="usuario-login"></span>
              </div>
            </div>
            <button type="button" class="btn-sair" id="btn-sair">Sair</button>
          </div>
        </aside>
        <main class="conteudo" id="conteudo"></main>
      </div>`;
    app.querySelector('#btn-sair').addEventListener('click', logout);
  }
  const usuario = getUsuario();
  app.querySelector('#usuario-nome').textContent = usuario?.nome || '';
  app.querySelector('#usuario-login').textContent = usuario?.usuario || '';
  app.querySelector('#avatar').textContent = (usuario?.nome || '?').charAt(0);
  return app.querySelector('#conteudo');
}

export const desmontarShell = (app) => { delete app.dataset.shell; };

export function marcarAtivo(caminho) {
  let chave = 'dashboard';
  if (caminho === '/solicitacoes/nova') chave = 'nova';
  else if (caminho.startsWith('/solicitacoes')) chave = 'solicitacoes';
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('ativo', a.dataset.chave === chave));
}