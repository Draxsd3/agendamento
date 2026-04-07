import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, Clock, User, Scissors } from 'lucide-react';
import Button from '@/components/common/Button';

export default function BookingConfirmation({ booking, onConfirm, onBack, loading }) {
  const { establishment, service, professional, date, slot } = booking;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-100">Confirmar Agendamento</h3>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <CalendarCheck size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Estabelecimento</p>
            <p className="font-medium text-gray-100">{establishment?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Scissors size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Serviço</p>
            <p className="font-medium text-gray-100">{service?.name}</p>
            <p className="text-sm text-gray-400">
              {Number(service?.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              {' · '}
              {service?.duration_minutes} min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <User size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Profissional</p>
            <p className="font-medium text-gray-100">{professional?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Clock size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Data e Horário</p>
            <p className="font-medium text-gray-100 capitalize">
              {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-sm text-gray-400">
              {format(new Date(slot.start), 'HH:mm')} — {format(new Date(slot.end), 'HH:mm')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button onClick={onConfirm} loading={loading} className="flex-1">
          Confirmar Agendamento
        </Button>
      </div>
    </div>
  );
}
