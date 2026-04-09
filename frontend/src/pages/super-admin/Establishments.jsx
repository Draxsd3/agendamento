import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { establishmentsService } from '@/services/establishments.service';
import toast from 'react-hot-toast';

export default function SuperAdminEstablishments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    establishmentsService
      .getAll()
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSetStatus = async (id, status) => {
    try {
      await establishmentsService.setStatus(id, status);
      toast.success('Status atualizado.');
      load();
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge value={row.status} />,
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/super-admin/estabelecimentos/${row.id}`}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="Ver detalhes"
          >
            <Eye size={15} />
          </Link>
          <Link
            to={`/super-admin/estabelecimentos/${row.id}/editar`}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Editar
          </Link>
          {row.status === 'active' ? (
            <button
              onClick={() => handleSetStatus(row.id, 'inactive')}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Inativar
            </button>
          ) : (
            <button
              onClick={() => handleSetStatus(row.id, 'active')}
              className="text-xs text-green-400 hover:text-green-300"
            >
              Ativar
            </button>
          )}
          <a
            href={`/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-300 transition-colors"
            title="Página pública"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Estabelecimentos</h1>
        <Link to="/super-admin/estabelecimentos/novo">
          <Button icon={Plus}>Novo Estabelecimento</Button>
        </Link>
      </div>

      <Card padding={false}>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="Nenhum estabelecimento cadastrado."
        />
      </Card>
    </div>
  );
}
