export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`card ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  };

  const c = colors[color] || colors.blue;

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon size={20} className={c.text} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
      </div>
    </Card>
  );
}
