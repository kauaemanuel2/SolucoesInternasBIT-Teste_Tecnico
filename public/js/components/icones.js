const CAMINHOS = {
  sucesso: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/>',
  erro: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
  aviso: '<path d="M12 3.5 21.5 20h-19Z"/><path d="M12 10v4.5M12 17.5v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
  fechar: '<path d="m6 6 12 12M18 6 6 18"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  olhoOff: '<path d="M3 3l18 18"/><path d="M10.6 6A9 9 0 0 1 12 5.5C18 5.5 21.5 12 21.5 12a16 16 0 0 1-3 3.8M6.6 7.6A16 16 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1"/>',
  painel: '<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>',
  lista: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6v.01M4 12v.01M4 18v.01"/>',
  mais: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
};

export const icone = (nome) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CAMINHOS[nome] || ''}</svg>`;