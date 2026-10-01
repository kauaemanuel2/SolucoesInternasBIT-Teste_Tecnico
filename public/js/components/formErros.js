import { toast } from './toast.js';

export function limparErros(form) {
  form.querySelectorAll('[data-erro]').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.invalid').forEach((el) => {
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
  });
}

// Remove o erro do campo assim que o usuário volta a digitar.
export function ativarLimpeza(form) {
  if (form.dataset.limpeza) return;
  form.dataset.limpeza = '1';
  form.addEventListener('input', (e) => {
    const campo = e.target;
    if (!campo.name) return;
    campo.classList.remove('invalid');
    campo.removeAttribute('aria-invalid');
    const alvo = form.querySelector(`[data-erro="${campo.name}"]`);
    if (alvo) alvo.textContent = '';
  });
}

export function mostrarErros(form, erro) {
  limparErros(form);
  ativarLimpeza(form);
  const gerais = [];
  let primeiro = null;

  for (const item of erro.mensagens || []) {
    const pos = item.indexOf(':');
    const nome = item.slice(0, pos).trim();
    const motivo = item.slice(pos + 1).trim();
    const alvo = form.querySelector(`[data-erro="${nome}"]`);
    if (alvo) {
      alvo.textContent = motivo;
      const campo = form.elements[nome];
      campo?.classList.add('invalid');
      campo?.setAttribute('aria-invalid', 'true');
      primeiro = primeiro || campo;
    } else {
      gerais.push(item);
    }
  }

  primeiro?.focus();
  if (!(erro.mensagens || []).length || gerais.length) {
    toast(gerais.join(' ') || erro.message, 'erro');
  }
}