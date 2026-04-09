import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Scissors, User, Clock } from 'lucide-react';

export default function BookingConfirmation({ booking, onConfirm, onBack, loading, theme }) {
  const { establishment, branch, service, professional, date, slot, planPrice } = booking;

  const displayPrice = planPrice !== undefined ? planPrice : Number(service?.price || 0);
  const originalPrice = Number(service?.price || 0);
  const hasDiscount = planPrice !== undefined && planPrice < originalPrice;

  const rows = [
    { icon: Scissors, label: 'Servico', value: service?.name },
    { icon: User, label: 'Profissional', value: professional?.id ? professional?.name : 'Sem preferencia' },
    { icon: MapPin, label: 'Filial', value: branch?.name || establishment?.name },
    {
      icon: Clock,
      label: 'Data e horario',
      value: `${format(date, "d 'de' MMMM", { locale: ptBR })}, ${format(new Date(slot.start), 'HH:mm')}`,
    },
  ].filter((row) => row.value);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
        Confirmar agendamento
      </p>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: theme?.subtleBorder || '#E5E7EB' }}>
        {rows.map(({ icon: Icon, label, value }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? 'border-t' : ''}`}
            style={index > 0 ? { borderColor: theme?.subtleBorder || '#F3F4F6' } : undefined}
          >
            <Icon size={15} className="shrink-0" style={{ color: theme?.primaryColor || '#9CA3AF' }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{label}</p>
              <p className="text-sm font-medium text-gray-800">{value}</p>
            </div>
          </div>
        ))}

        <div
          className="flex items-center justify-between border-t px-4 py-3"
          style={{ borderColor: theme?.subtleBorder || '#E5E7EB', backgroundColor: theme?.softPrimary || '#F8FAFC' }}
        >
          <span className="text-sm font-semibold text-gray-800">Total</span>
          <div className="text-right">
            {hasDiscount ? (
              <p className="text-xs line-through" style={{ color: '#9CA3AF' }}>
                {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            ) : null}
            <p className="text-base font-bold" style={{ color: theme?.accentColor || '#111827' }}>
              {displayPrice === 0
                ? 'Gratis'
                : displayPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg py-3 text-sm font-medium transition-colors"
          style={{
            backgroundColor: theme?.softAccent || '#F3F4F6',
            color: theme?.accentColor || '#374151',
          }}
        >
          Voltar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-60"
          style={{
            backgroundColor: theme?.primaryColor || '#111827',
            color: theme?.primaryTextColor || '#FFFFFF',
          }}
        >
          {loading ? 'Confirmando...' : 'Confirmar agendamento'}
        </button>
      </div>
    </div>
  );
}
