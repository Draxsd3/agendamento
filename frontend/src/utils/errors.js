/**
 * Mapeia erros de API para mensagens amigaveis em portugues.
 * Uso: toast.error(getErrorMessage(err))
 */

const BACKEND_MESSAGES = {
  'Credenciais inválidas.': 'Email ou senha incorretos.',
  'Credenciais invalidas.': 'Email ou senha incorretos.',
  'Email já está em uso.': 'Este email já está cadastrado.',
  'Email ja esta em uso.': 'Este email já está cadastrado.',
  'Conta desativada. Entre em contato com o suporte.': 'Sua conta está desativada. Entre em contato com o suporte.',
  'Esta conta de administrador não pertence a este estabelecimento.': 'Acesso não autorizado para este estabelecimento.',
  'Esta conta de administrador nao pertence a este estabelecimento.': 'Acesso não autorizado para este estabelecimento.',
  'Usuário não encontrado.': 'Usuário não encontrado.',
  'Usuario nao encontrado.': 'Usuário não encontrado.',
  'Senha atual incorreta.': 'Senha atual incorreta.',
  'Slug já está em uso.': 'Este endereço já está em uso.',
  'Slug ja esta em uso.': 'Este endereço já está em uso.',
  'Estabelecimento não encontrado.': 'Estabelecimento não encontrado.',
  'Estabelecimento nao encontrado.': 'Estabelecimento não encontrado.',
  'Profissional não encontrado.': 'Profissional não encontrado.',
  'Profissional nao encontrado.': 'Profissional não encontrado.',
  'Serviço não encontrado.': 'Serviço não encontrado.',
  'Servico nao encontrado.': 'Serviço não encontrado.',
  'Horário não disponível.': 'Este horário não está mais disponível. Escolha outro.',
  'Horario nao disponivel.': 'Este horário não está mais disponível. Escolha outro.',
  'Assinatura não encontrada.': 'Assinatura não encontrada.',
  'Assinatura nao encontrada.': 'Assinatura não encontrada.',
  'Você já possui uma assinatura ativa.': 'Você já tem um plano ativo.',
  'Voce ja possui uma assinatura ativa.': 'Você já tem um plano ativo.',
  'Voce ja possui uma assinatura ativa para este estabelecimento.': 'Você já tem um plano ativo neste estabelecimento.',
};

const STATUS_MESSAGES = {
  400: 'Dados inválidos. Verifique as informações e tente novamente.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este registro já existe.',
  422: 'Dados inválidos. Verifique as informações e tente novamente.',
  429: 'Muitas tentativas. Aguarde um momento e tente novamente.',
  500: 'Erro interno. Tente novamente em instantes.',
  502: 'Servidor indisponível. Tente novamente em instantes.',
  503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
};

export function getErrorMessage(err, fallback = 'Ocorreu um erro. Tente novamente.') {
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'A requisição demorou demais. Verifique sua conexão.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }

  const backendMessage = err.response?.data?.error;

  if (backendMessage?.startsWith('Complete seu perfil antes de assinar:')) {
    return backendMessage;
  }

  if (backendMessage && BACKEND_MESSAGES[backendMessage]) {
    return BACKEND_MESSAGES[backendMessage];
  }

  if (backendMessage) {
    return backendMessage;
  }

  const statusMessage = STATUS_MESSAGES[err.response?.status];
  if (statusMessage) return statusMessage;

  return fallback;
}
