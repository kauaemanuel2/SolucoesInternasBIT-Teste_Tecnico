export const skeletonTabela = (linhas = 6, colunas = 6) => `
  <div class="tabela-wrap card"><table class="tabela"><tbody>
    ${Array.from({ length: linhas }, () =>
      `<tr>${Array.from({ length: colunas }, () => '<td><span class="skeleton"></span></td>').join('')}</tr>`
    ).join('')}
  </tbody></table></div>`;

export const skeletonCards = (quantidade = 4) => `
  <div class="grid-kpi">
    ${Array.from({ length: quantidade }, () =>
      '<div class="card kpi"><span class="skeleton sk-sm"></span><span class="skeleton sk-lg"></span></div>'
    ).join('')}
  </div>`;

export const skeletonBloco = () => `
  <div class="card">
    <span class="skeleton sk-sm"></span><br>
    <span class="skeleton"></span><br>
    <span class="skeleton"></span><br>
    <span class="skeleton sk-sm"></span>
  </div>`;