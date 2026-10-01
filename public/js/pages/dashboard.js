import { api } from '../api.js';
import { skeletonCards } from '../components/skeleton.js';
import { toast } from '../components/toast.js';

function contar(el, alvo) {
  const duracao = 800;
  const inicio = performance.now();
  const passo = (agora) => {
    const p = Math.min((agora - inicio) / duracao, 1);
    el.textContent = Math.round(alvo * (1 - (1 - p) ** 3));
    if (p < 1 && el.isConnected) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export async function render(pagina) {
  pagina.innerHTML = `
    <header class="pagina-topo"><h1>Dashboard</h1></header>
    <div id="kpis">${skeletonCards(4)}</div>`;
  const kpis = pagina.querySelector('#kpis');

  try {
    const d = await api.dashboard();
    const itens = [
      ['Total de solicitações', d.total, 'total'],
      ['Abertas', d.abertos, 'aberto'],
      ['Em atendimento', d.em_atendimento, 'atendimento'],
      ['Concluídas', d.concluidos, 'concluido'],
    ];
    kpis.innerHTML = `<div class="grid-kpi">${itens.map(([rotulo, valor, tipo]) => `
      <div class="card kpi kpi-${tipo}">
        <span class="kpi-rotulo">${rotulo}</span>
        <span class="kpi-valor" data-alvo="${valor}">0</span>
      </div>`).join('')}</div>`;
    kpis.querySelectorAll('.kpi-valor').forEach((el) => contar(el, Number(el.dataset.alvo)));
  } catch (erro) {
    kpis.innerHTML = '';
    if (erro.status !== 401) toast(erro.message, 'erro');
  }
}