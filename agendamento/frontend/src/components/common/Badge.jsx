const variants = {
  // appointment status
  pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  confirmed:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed:  'bg-green-500/10 text-green-400 border border-green-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
  no_show:    'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  // establishment status
  active:     'bg-green-500/10 text-green-400 border border-green-500/20',
  inactive:   'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  suspended:  'bg-red-500/10 text-red-400 border border-red-500/20',
  // generic
  default:    'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

const labels = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
};

export default function Badge({ value, children }) {
  const variant = variants[value] || variants.default;
  return (
    <span className={`badge ${variant}`}>
      {children || labels[value] || value}
    </span>
  );
}
