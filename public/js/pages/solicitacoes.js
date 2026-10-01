import { api } from '../api.js';
import { esc, formatarData, badge } from '../components/dom.js';
import { skeletonTabela } from '../components/skeleton.js';
import { toast } from '../components/toast.js';

const STATUS = ['Aberto', 'Em Atendimento', 'Concluído'];

const tabela = (itens) => (!itens.length
  ? '<div class="card vazio">Nenhuma solicitação encontrada.</div>'
  : `<div class="tabela-wrap card"><table class="tabela">
      <thead><tr>
        <th>Código</th><th>Título</th><th>Categoria</th><th>Solicitante</th><th>Data de abertura</th><th>Status</th>
      </tr></thead>
      <tbody>${itens.map((s) => `
        <tr data-id="${s.id}">
          <td><a class="link-codigo" href="#/solicitacoes/${s.id}">${esc(s.codigo)}</a></td>
          <td>${esc(s.titulo)}</td>
          <td>${esc(s.categoria)}</td>
          <td>${esc(s.solicitante)}</td>
          <td>${formatarData(s.data_criacao)}</td>
          <td>${badge(s.status)}</td>
        </tr>`).join('')}
      </tbody></table></div>`);

export async function render(pagina) {
  pagina.innerHTML = `
    <header class="pagina-topo">
      <h1>Solicitações</h1>
      <a class="btn btn-primary" href="#/solicitacoes/nova">Nova solicitação</a>
    </header>
    <form class="card filtros" id="filtros" novalidate>
      <div class="campo"><label for="f-q">Título</label><input id="f-q" name="q" type="search" placeholder="Buscar por título"></div>
      <div class="campo"><label for="f-categoria">Categoria</label>
        <select id="f-categoria" name="categoria"><option value="">Todas</option></select></div>
      <div class="campo"><label for="f-status">Status</label>
        <select id="f-status" name="status"><option value="">Todos</option>
          ${STATUS.map((s) => `<option value="${s}">${s}</option>`).join('')}</select></div>
      <div class="campo"><label for="f-ini">Data inicial</label><input id="f-ini" name="data_ini" type="date"></div>
      <div class="campo"><label for="f-fim">Data final</label><input id="f-fim" name="data_fim" type="date"></div>
      <div class="filtros-acoes">
        <button class="btn btn-primary" type="submit">Filtrar</button>
        <button class="btn btn-secondary" type="button" id="limpar">Limpar</button>
      </div>
    </form>
    <div id="resultado"></div>`;

  const form = pagina.querySelector('#filtros');
  const resultado = pagina.querySelector('#resultado');
  let sequencia = 0;

  async function carregar() {
    const atual = ++sequencia;
    const params = new URLSearchParams();
    for (const [chave, valor] of new FormData(form)) {
      if (String(valor).trim()) params.set(chave, String(valor).trim());
    }
    resultado.innerHTML = skeletonTabela(6, 6);
    try {
      const itens = await api.solicitacoes(params.toString());
      if (atual === sequencia) resultado.innerHTML = tabela(itens);
    } catch (erro) {
      resultado.innerHTML = '';
      if (erro.status !== 401) toast(erro.mensagens[0] || erro.message, 'erro');
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); carregar(); });
  pagina.querySelector('#limpar').addEventListener('click', () => { form.reset(); carregar(); });
  resultado.addEventListener('click', (e) => {
    const linha = e.target.closest('tr[data-id]');
    if (linha && !e.target.closest('a')) location.hash = `#/solicitacoes/${linha.dataset.id}`;
  });

  api.categorias()
    .then((cats) => {
      form.categoria.insertAdjacentHTML('beforeend',
        cats.map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join(''));
    })
    .catch(() => {});

  await carregar();
}