import { Clock, DollarSign } from 'lucide-react';

export default function ServiceSelector({ services, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-100">Escolha o Serviço</h3>
      <div className="grid gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selected?.id === service.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-100">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                )}
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="font-semibold text-gray-100">
                  {Number(service.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                  <Clock size={12} />
                  {service.duration_minutes} min
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
