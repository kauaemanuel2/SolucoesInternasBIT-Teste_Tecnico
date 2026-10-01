import { api } from '../api.js';
import { getUsuario } from '../auth.js';
import { esc, formatarData, badge } from '../components/dom.js';
import { skeletonBloco } from '../components/skeleton.js';
import { confirmar } from '../components/modal.js';
import { toast } from '../components/toast.js';

const STATUS = ['Aberto', 'Em Atendimento', 'Concluído'];

export async function render(pagina, [id]) {
  pagina.innerHTML = `
    <header class="pagina-topo">
      <h1>Detalhe da solicitação</h1>
      <a class="btn btn-secondary" href="#/solicitacoes">Voltar</a>
    </header>
    <div id="detalhe">${skeletonBloco()}</div>`;
  const alvo = pagina.querySelector('#detalhe');

  function desenhar(s) {
    const eu = getUsuario();
    const podeAlterar = eu && s.usuario_id === eu.id && s.status === 'Aberto';
    alvo.innerHTML = `
      <article class="card detalhe">
        <div class="detalhe-topo">
          <div><span class="detalhe-codigo">${esc(s.codigo)}</span><h2>${esc(s.titulo)}</h2></div>
          ${badge(s.status)}
        </div>
        <dl class="campos">
          <div><dt>Categoria</dt><dd>${esc(s.categoria)}</dd></div>
          <div><dt>Solicitante</dt><dd>${esc(s.solicitante)}</dd></div>
          <div><dt>Data de abertura</dt><dd>${formatarData(s.data_criacao)}</dd></div>
          <div><dt>Última atualização</dt><dd>${formatarData(s.data_atualizacao)}</dd></div>
        </dl>
        <div class="descricao"><h3>Descrição</h3><p>${esc(s.descricao)}</p></div>
        <div class="acoes-status">
          <label for="novo-status">Alterar status</label>
          <select id="novo-status">
            ${STATUS.map((o) => `<option value="${o}"${o === s.status ? ' selected' : ''}>${o}</option>`).join('')}
          </select>
          <button class="btn btn-primary" type="button" id="salvar-status">Atualizar status</button>
        </div>
        ${podeAlterar ? `
          <div class="acoes">
            <a class="btn btn-secondary" href="#/solicitacoes/${s.id}/editar">Editar</a>
            <button class="btn btn-danger" type="button" id="excluir">Excluir</button>
          </div>` : ''}
      </article>`;

    const botaoStatus = alvo.querySelector('#salvar-status');
    botaoStatus.addEventListener('click', async () => {
      botaoStatus.disabled = true;
      try {
        desenhar(await api.alterarStatus(s.id, alvo.querySelector('#novo-status').value));
        toast('Status atualizado.');
      } catch (erro) {
        botaoStatus.disabled = false;
        if (erro.status !== 401) toast(erro.mensagens[0] || erro.message, 'erro');
      }
    });

    alvo.querySelector('#excluir')?.addEventListener('click', async () => {
      const ok = await confirmar({
        titulo: 'Excluir solicitação',
        mensagem: `A solicitação ${s.codigo} será removida. Esta ação não pode ser desfeita.`,
        rotulo: 'Excluir',
      });
      if (!ok) return;
      try {
        await api.excluir(s.id);
        toast('Solicitação excluída.');
        location.hash = '#/solicitacoes';
      } catch (erro) {
        if (erro.status !== 401) toast(erro.message, 'erro');
      }
    });
  }

  try {
    desenhar(await api.solicitacao(id));
  } catch (erro) {
    if (erro.status === 401) return;
    alvo.innerHTML = `<div class="card vazio">${erro.status === 404 ? 'Solicitação não encontrada.' : esc(erro.message)}</div>`;
    toast(erro.message, 'erro');
  }
}