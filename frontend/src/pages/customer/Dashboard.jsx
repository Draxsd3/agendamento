import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, X } from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { appointmentsService } from '@/services/appointments.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentsService
      .getMyAppointments()
      .then(setAppointments)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    try {
      await appointmentsService.cancel(id);
      toast.success('Agendamento cancelado.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cancelar.');
    }
  };

  const upcoming = appointments.filter(
    (a) => new Date(a.start_time) >= new Date() && a.status !== 'cancelled'
  );
  const past = appointments.filter(
    (a) => new Date(a.start_time) < new Date() || a.status === 'cancelled'
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Meus Agendamentos</h1>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Próximos
        </h2>
        {upcoming.length === 0 ? (
          <Card>
            <div className="text-center py-6">
              <CalendarCheck size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum agendamento futuro.</p>
              <p className="text-sm text-gray-600 mt-1">
                Visite a página de um estabelecimento para agendar.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((appt) => (
              <Card key={appt.id} className="hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge value={appt.status} />
                      <span className="text-sm font-semibold text-gray-100">
                        {appt.establishments?.name}
                      </span>
                    </div>
                    <p className="text-gray-300">{appt.services?.name}</p>
                    <p className="text-sm text-gray-500">
                      com {appt.professionals?.name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock size={14} />
                      <span className="capitalize">
                        {format(new Date(appt.start_time), "EEEE, d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  {appt.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={() => handleCancel(appt.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Histórico
          </h2>
          <div className="space-y-2">
            {past.map((appt) => (
              <Card key={appt.id} className="opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{appt.services?.name}</p>
                    <p className="text-xs text-gray-500">
                      {appt.establishments?.name} ·{' '}
                      {format(new Date(appt.start_time), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge value={appt.status} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
