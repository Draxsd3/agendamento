const variants = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  no_show:   'bg-gray-100 text-gray-500 border border-gray-200',
  active:    'bg-green-50 text-green-700 border border-green-200',
  inactive:  'bg-gray-100 text-gray-500 border border-gray-200',
  suspended: 'bg-red-50 text-red-600 border border-red-200',
  default:   'bg-gray-100 text-gray-500 border border-gray-200',
};

const labels = {
  pending:   'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show:   'Não compareceu',
  active:    'Ativo',
  inactive:  'Inativo',
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
