import { esc } from './dom.js';
import { icone } from './icones.js';

export function confirmar({ titulo, mensagem, rotulo = 'Confirmar' }) {
  return new Promise((resolve) => {
    const fundo = document.createElement('div');
    fundo.className = 'modal-fundo';
    fundo.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="modal-topo">
          <span class="modal-icone">${icone('aviso')}</span>
          <div>
            <h2 id="modal-titulo">${esc(titulo)}</h2>
            <p>${esc(mensagem)}</p>
          </div>
        </div>
        <div class="modal-acoes">
          <button type="button" class="btn btn-secondary" data-acao="cancelar">Cancelar</button>
          <button type="button" class="btn btn-danger" data-acao="confirmar">${esc(rotulo)}</button>
        </div>
      </div>`;

    const fechar = (resultado) => {
      document.removeEventListener('keydown', aoTeclar);
      fundo.remove();
      resolve(resultado);
    };
    const aoTeclar = (e) => { if (e.key === 'Escape') fechar(false); };

    fundo.addEventListener('click', (e) => {
      if (e.target === fundo || e.target.dataset.acao === 'cancelar') fechar(false);
      if (e.target.dataset.acao === 'confirmar') fechar(true);
    });
    document.addEventListener('keydown', aoTeclar);
    document.body.appendChild(fundo);
    fundo.querySelector('[data-acao="cancelar"]').focus();
  });
}