import { icone } from './icones.js';
import { esc } from './dom.js';

export const limparAlerta = (alvo) => { alvo.innerHTML = ''; };

export function mostrarAlerta(alvo, { tipo = 'erro', titulo, mensagem }) {
  alvo.innerHTML = `
    <div class="alerta alerta-${tipo}" role="alert">
      <span class="alerta-icone">${icone(tipo)}</span>
      <div class="alerta-corpo">
        <strong>${esc(titulo)}</strong>
        <span>${esc(mensagem)}</span>
      </div>
      <button type="button" class="alerta-fechar" aria-label="Fechar alerta">${icone('fechar')}</button>
    </div>`;
  alvo.querySelector('.alerta-fechar').addEventListener('click', () => limparAlerta(alvo));
}