const CHAVE_TOKEN = 'portal_token';
const CHAVE_USUARIO = 'portal_usuario';

export const getToken = () => localStorage.getItem(CHAVE_TOKEN);

export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIO));
  } catch {
    return null;
  }
}

export function setSessao(token, usuario) {
  localStorage.setItem(CHAVE_TOKEN, token);
  setUsuario(usuario);
}

export const setUsuario = (usuario) => localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export const estaAutenticado = () => Boolean(getToken());

export function logout() {
  limparSessao();
  location.hash = '#/login';
}