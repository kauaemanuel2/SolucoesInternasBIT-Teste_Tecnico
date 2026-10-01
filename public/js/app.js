import { iniciarRouter } from './router.js';
import { getToken, setUsuario } from './auth.js';
import { api } from './api.js';

async function iniciar() {
  if (getToken()) {
    try {
      const { usuario } = await api.me();
      setUsuario(usuario);
    } catch {
      // 401 já tratado em api.js; falha de rede segue para o router
    }
  }
  iniciarRouter();
}

iniciar();