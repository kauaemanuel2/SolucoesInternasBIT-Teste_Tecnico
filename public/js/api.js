import { getToken, limparSessao } from './auth.js';
import { toast } from './components/toast.js';

export class ApiError extends Error {
  constructor(status, corpo) {
    super(corpo?.erro || 'Erro inesperado');
    this.status = status;
    this.mensagens = corpo?.mensagens || [];
  }
}

async function request(metodo, caminho, corpo) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (corpo !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`/api${caminho}`, {
      method: metodo,
      headers,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, { erro: 'Falha de conexão com o servidor' });
  }

  if (res.status === 204) return null;
  const dados = await res.json().catch(() => null);

  if (res.status === 401 && caminho !== '/auth/login') {
    if (token) {
      toast('Faça login novamente para continuar.', 'aviso', { titulo: 'Sessão expirada' });
    }
    limparSessao();
    location.hash = '#/login';
    throw new ApiError(401, dados);
  }
  if (!res.ok) throw new ApiError(res.status, dados);
  return dados;
}

export const api = {
  login: (dados) => request('POST', '/auth/login', dados),
  me: () => request('GET', '/auth/me'),
  categorias: () => request('GET', '/categorias'),
  dashboard: () => request('GET', '/dashboard'),
  solicitacoes: (qs = '') => request('GET', `/solicitacoes${qs ? `?${qs}` : ''}`),
  solicitacao: (id) => request('GET', `/solicitacoes/${id}`),
  criar: (dados) => request('POST', '/solicitacoes', dados),
  atualizar: (id, dados) => request('PUT', `/solicitacoes/${id}`, dados),
  alterarStatus: (id, status) => request('PATCH', `/solicitacoes/${id}/status`, { status }),
  excluir: (id) => request('DELETE', `/solicitacoes/${id}`),
};