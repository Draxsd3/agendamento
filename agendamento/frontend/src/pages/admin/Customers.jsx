import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import api from '@/services/api';

export default function AdminCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.establishmentId) return;
    api
      .get(`/customers/establishment/${user.establishmentId}`)
      .then((res) => setCustomers(res.data.data || []))
      .finally(() => setLoading(false));
  }, [user]);

  const columns = [
    { key: 'name',  label: 'Nome',     render: (row) => row.users?.name || '—' },
    { key: 'email', label: 'Email',    render: (row) => row.users?.email || '—' },
    { key: 'phone', label: 'Telefone', render: (row) => row.phone || '—' },
    {
      key: 'status', label: 'Conta',
      render: (row) => (
        <span className={`text-xs font-medium ${row.users?.is_active ? 'text-green-600' : 'text-red-500'}`}>
          {row.users?.is_active ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
      </div>
      <Card padding={false}>
        <Table columns={columns} data={customers} loading={loading} emptyMessage="Nenhum cliente encontrado." />
      </Card>
    </div>
  );
}
