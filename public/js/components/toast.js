import { icone } from './icones.js';
import { esc } from './dom.js';

const TITULOS = {
  sucesso: 'Operação concluída',
  erro: 'Não foi possível concluir',
  aviso: 'Atenção',
  info: 'Informação',
};
const MAXIMO = 4;

export function toast(mensagem, tipo = 'sucesso', opcoes = {}) {
  const duracao = opcoes.duracao ?? (tipo === 'erro' ? 7000 : 4500);

  let caixa = document.getElementById('toasts');
  if (!caixa) {
    caixa = document.createElement('div');
    caixa.id = 'toasts';
    document.body.appendChild(caixa);
  }

  const ativos = [...caixa.children].filter((c) => !c.classList.contains('saindo'));
  if (ativos.length >= MAXIMO) ativos[0]._fechar();

  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
  el.style.setProperty('--duracao', `${duracao}ms`);
  el.innerHTML = `
    <span class="toast-icone">${icone(tipo)}</span>
    <div class="toast-corpo">
      <strong>${esc(opcoes.titulo || TITULOS[tipo])}</strong>
      <span>${esc(mensagem)}</span>
    </div>
    <button type="button" class="toast-fechar" aria-label="Fechar notificação">${icone('fechar')}</button>
    <span class="toast-progresso"></span>`;

  let restante = duracao;
  let inicio = Date.now();
  let fechado = false;
  let timer;

  const fechar = () => {
    if (fechado) return;
    fechado = true;
    clearTimeout(timer);
    el.classList.add('saindo');
    setTimeout(() => el.remove(), 220);
  };
  el._fechar = fechar;

  timer = setTimeout(fechar, restante);
  el.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    restante -= Date.now() - inicio;
    el.classList.add('pausado');
  });
  el.addEventListener('mouseleave', () => {
    if (fechado) return;
    inicio = Date.now();
    timer = setTimeout(fechar, restante);
    el.classList.remove('pausado');
  });
  el.addEventListener('click', fechar);

  caixa.appendChild(el);
  return fechar;
}