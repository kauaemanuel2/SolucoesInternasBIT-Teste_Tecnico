import { api } from '../api.js';
import { getUsuario } from '../auth.js';
import { esc } from '../components/dom.js';
import { mostrarErros, limparErros } from '../components/formErros.js';
import { toast } from '../components/toast.js';

export async function render(pagina, [id]) {
  const edicao = Boolean(id);
  pagina.innerHTML = `
    <header class="pagina-topo"><h1>${edicao ? 'Editar solicitação' : 'Nova solicitação'}</h1></header>
    <div class="card form-card">
      <form id="form" novalidate>
        <div class="campo">
          <label for="titulo">Título</label>
          <input id="titulo" name="titulo" maxlength="120" autocomplete="off">
          <span class="erro-campo" data-erro="titulo"></span>
        </div>
        <div class="campo">
          <label for="categoria">Categoria</label>
          <select id="categoria" name="categoria"><option value="">Selecione</option></select>
          <span class="erro-campo" data-erro="categoria"></span>
        </div>
        <div class="campo">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows="7" maxlength="2000"></textarea>
          <span class="erro-campo" data-erro="descricao"></span>
        </div>
        <div class="form-acoes">
          <button class="btn btn-primary" type="submit">${edicao ? 'Salvar alterações' : 'Registrar solicitação'}</button>
          <a class="btn btn-secondary" href="${edicao ? `#/solicitacoes/${id}` : '#/solicitacoes'}">Cancelar</a>
        </div>
      </form>
    </div>`;

  const form = pagina.querySelector('#form');

  let categorias;
  let solicitacao = null;
  try {
    [categorias, solicitacao] = await Promise.all([
      api.categorias(),
      edicao ? api.solicitacao(id) : null,
    ]);
  } catch (erro) {
    if (erro.status !== 401) toast(erro.message, 'erro');
    if (edicao && erro.status === 404) location.hash = '#/solicitacoes';
    return;
  }

  form.categoria.insertAdjacentHTML('beforeend',
    categorias.map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join(''));

  if (solicitacao) {
    const eu = getUsuario();
    if (solicitacao.usuario_id !== eu?.id || solicitacao.status !== 'Aberto') {
      toast('Apenas o solicitante pode editar, e somente com status Aberto.', 'erro');
      location.hash = `#/solicitacoes/${id}`;
      return;
    }
    form.titulo.value = solicitacao.titulo;
    form.descricao.value = solicitacao.descricao;
    form.categoria.value = String(solicitacao.categoria_id);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;
    limparErros(form);
    const dados = {
      titulo: form.titulo.value,
      descricao: form.descricao.value,
      categoria: form.categoria.value ? Number(form.categoria.value) : '',
    };
    try {
      const salva = edicao ? await api.atualizar(id, dados) : await api.criar(dados);
      toast(edicao ? 'Solicitação atualizada.' : `Solicitação ${salva.codigo} registrada.`);
      location.hash = `#/solicitacoes/${salva.id}`;
    } catch (erro) {
      if (erro.status !== 401) mostrarErros(form, erro);
    } finally {
      botao.disabled = false;
    }
  });
}