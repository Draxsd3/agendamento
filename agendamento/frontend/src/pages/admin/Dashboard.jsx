import { useEffect, useState } from 'react';
import { CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/common/Card';
import { appointmentsService } from '@/services/appointments.service';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.establishmentId) return;
    appointmentsService
      .getByEstablishment(user.establishmentId, { limit: 10 })
      .then((res) => setAppointments(res.data || []))
      .finally(() => setLoading(false));
  }, [user]);

  const today = appointments.filter(
    (a) => new Date(a.start_time).toDateString() === new Date().toDateString() && a.status !== 'cancelled'
  );
  const pending = appointments.filter((a) => a.status === 'pending');

  const columns = [
    { key: 'customer', label: 'Cliente', render: (row) => row.customers?.users?.name || '—' },
    { key: 'service',  label: 'Serviço', render: (row) => row.services?.name || '—' },
    { key: 'professional', label: 'Profissional', render: (row) => row.professionals?.name || '—' },
    { key: 'start_time', label: 'Data/Hora', render: (row) => format(new Date(row.start_time), 'dd/MM/yyyy HH:mm') },
    { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Hoje" value={today.length} icon={CalendarCheck} color="blue" />
        <StatCard label="Pendentes" value={pending.length} icon={Clock} color="orange" />
        <StatCard label="Recentes" value={appointments.length} icon={TrendingUp} color="green" />
      </div>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm">Agendamentos recentes</h3>
        </div>
        <Table columns={columns} data={appointments} loading={loading} emptyMessage="Nenhum agendamento encontrado." />
      </Card>
    </div>
  );
}
