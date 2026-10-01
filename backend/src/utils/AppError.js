class AppError extends Error {
  constructor(status, erro, mensagens = []) {
    super(erro);
    this.status = status;
    this.mensagens = mensagens;
  }
}

module.exports = AppError;