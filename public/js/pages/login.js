import { api } from '../api.js';
import { setSessao } from '../auth.js';
import { logo } from '../components/logo.js';
import { icone } from '../components/icones.js';
import { mostrarAlerta, limparAlerta } from '../components/alerta.js';
import { mostrarErros, limparErros, ativarLimpeza } from '../components/formErros.js';

export function render(app) {
  app.innerHTML = `
    <div class="login">
      <form class="login-card" id="form-login" novalidate>
        ${logo()}
        <h1>Acesso ao sistema</h1>
        <p class="login-sub">Informe usuário e senha para continuar.</p>
        <div id="alerta" aria-live="assertive"></div>
        <div class="campo">
          <label for="usuario">Usuário</label>
          <div class="input-icone">
            ${icone('usuario')}
            <input id="usuario" name="usuario" autocomplete="username" placeholder="Seu usuário" autofocus>
          </div>
          <span class="erro-campo" data-erro="usuario"></span>
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <div class="input-icone com-toggle">
            ${icone('cadeado')}
            <input id="senha" name="senha" type="password" autocomplete="current-password" placeholder="Sua senha">
            <button type="button" class="toggle-senha" id="toggle-senha" aria-label="Mostrar senha" aria-pressed="false">${icone('olho')}</button>
          </div>
          <span class="erro-campo" data-erro="senha"></span>
        </div>
        <span class="dica-caps" id="caps" hidden>Caps Lock ativado.</span>
        <button class="btn btn-primary btn-lg btn-bloco" type="submit">
          <span class="spinner"></span><span class="btn-rotulo">Entrar</span>
        </button>
      </form>
    </div>`;

  const form = app.querySelector('#form-login');
  const alerta = app.querySelector('#alerta');
  const caps = app.querySelector('#caps');
  const botao = form.querySelector('button[type="submit"]');
  const rotulo = botao.querySelector('.btn-rotulo');
  const toggle = app.querySelector('#toggle-senha');

  ativarLimpeza(form);
  form.addEventListener('input', () => limparAlerta(alerta));

  toggle.addEventListener('click', () => {
    const visivel = form.senha.type === 'text';
    form.senha.type = visivel ? 'password' : 'text';
    toggle.innerHTML = icone(visivel ? 'olho' : 'olhoOff');
    toggle.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
    toggle.setAttribute('aria-pressed', String(!visivel));
    form.senha.focus();
  });

  form.senha.addEventListener('keyup', (e) => { caps.hidden = !e.getModifierState('CapsLock'); });
  form.senha.addEventListener('blur', () => { caps.hidden = true; });

  const tremer = () => {
    form.classList.remove('tremer');
    void form.offsetWidth;
    form.classList.add('tremer');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparAlerta(alerta);
    limparErros(form);
    botao.disabled = true;
    botao.classList.add('carregando');
    rotulo.textContent = 'Entrando';

    try {
      const { token, usuario } = await api.login({
        usuario: form.usuario.value,
        senha: form.senha.value,
      });
      setSessao(token, usuario);
      location.hash = '#/dashboard';
    } catch (erro) {
      if (erro.status === 400) {
        mostrarErros(form, erro);
      } else if (erro.status === 401) {
        mostrarAlerta(alerta, {
          titulo: 'Falha na autenticação',
          mensagem: 'Usuário ou senha inválidos. Verifique os dados e tente novamente.',
        });
        [form.usuario, form.senha].forEach((c) => {
          c.classList.add('invalid');
          c.setAttribute('aria-invalid', 'true');
        });
        form.senha.value = '';
        form.senha.focus();
      } else {
        mostrarAlerta(alerta, {
          titulo: erro.status === 0 ? 'Servidor indisponível' : 'Erro no servidor',
          mensagem: erro.message,
        });
      }
      tremer();
    } finally {
      botao.disabled = false;
      botao.classList.remove('carregando');
      rotulo.textContent = 'Entrar';
    }
  });
}