/**
 * Mapeia erros de API para mensagens amigáveis em português.
 * Uso: toast.error(getErrorMessage(err))
 */

const BACKEND_MESSAGES = {
  'Credenciais inválidas.':                                        'Email ou senha incorretos.',
  'Email já está em uso.':                                         'Este email já está cadastrado.',
  'Conta desativada. Entre em contato com o suporte.':             'Sua conta está desativada. Entre em contato com o suporte.',
  'Esta conta de administrador não pertence a este estabelecimento.': 'Acesso não autorizado para este estabelecimento.',
  'Usuário não encontrado.':                                       'Usuário não encontrado.',
  'Senha atual incorreta.':                                        'Senha atual incorreta.',
  'Slug já está em uso.':                                          'Este endereço já está em uso.',
  'Estabelecimento não encontrado.':                               'Estabelecimento não encontrado.',
  'Profissional não encontrado.':                                  'Profissional não encontrado.',
  'Serviço não encontrado.':                                       'Serviço não encontrado.',
  'Horário não disponível.':                                       'Este horário não está mais disponível. Escolha outro.',
  'Assinatura não encontrada.':                                    'Assinatura não encontrada.',
  'Você já possui uma assinatura ativa.':                          'Você já tem um plano ativo.',
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
  // Sem resposta do servidor (rede, CORS, timeout)
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'A requisição demorou demais. Verifique sua conexão.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }

  const backendMessage = err.response?.data?.error;

  // Tenta mapear mensagem exata do backend
  if (backendMessage && BACKEND_MESSAGES[backendMessage]) {
    return BACKEND_MESSAGES[backendMessage];
  }

  // Tenta mapear pelo status HTTP
  const statusMessage = STATUS_MESSAGES[err.response?.status];
  if (statusMessage) return statusMessage;

  // Retorna mensagem do backend se existir (pode ser útil), senão o fallback
  return backendMessage || fallback;
}
