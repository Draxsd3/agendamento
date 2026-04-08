import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import { appointmentsService } from '@/services/appointments.service';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'no_show', 'cancelled'];
const STATUS_LABELS = { pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', no_show: 'Não compareceu', cancelled: 'Cancelado' };

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const load = () => {
    if (!user?.establishmentId) return;
    setLoading(true);
    appointmentsService
      .getByEstablishment(user.establishmentId, { status: filterStatus || undefined, date: filterDate || undefined })
      .then((res) => setAppointments(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user, filterStatus, filterDate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentsService.updateStatus(id, status);
      toast.success('Status atualizado.');
      load();
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const columns = [
    { key: 'customer', label: 'Cliente', render: (row) => row.customers?.users?.name || '—' },
    { key: 'service', label: 'Serviço', render: (row) => row.services?.name || '—' },
    { key: 'professional', label: 'Profissional', render: (row) => row.professionals?.name || '—' },
    { key: 'start_time', label: 'Início', render: (row) => format(new Date(row.start_time), 'dd/MM/yyyy HH:mm') },
    { key: 'status', label: 'Status', render: (row) => <Badge value={row.status} /> },
    {
      key: 'actions', label: '',
      render: (row) =>
        !['cancelled', 'completed'].includes(row.status) ? (
          <select
            value=""
            onChange={(e) => e.target.value && handleStatusUpdate(row.id, e.target.value)}
            className="text-xs bg-white border border-gray-300 text-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alterar...</option>
            {STATUS_OPTIONS.filter((s) => s !== row.status).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agendamentos</h1>
      </div>

      <div className="flex gap-3 mb-5">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-base max-w-xs"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="input-base max-w-xs"
        />
      </div>

      <Card padding={false}>
        <Table columns={columns} data={appointments} loading={loading} emptyMessage="Nenhum agendamento encontrado." />
      </Card>
    </div>
  );
}
