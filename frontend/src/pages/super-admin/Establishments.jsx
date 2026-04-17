import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, Eye } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { establishmentsService } from '@/services/establishments.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

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
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar status.'));
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
      label: 'Acoes',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Link
            to={`/super-admin/estabelecimentos/${row.id}`}
            className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-700"
            title="Ver detalhes"
          >
            <Eye size={15} strokeWidth={1.75} />
          </Link>
          <Link
            to={`/super-admin/estabelecimentos/${row.id}/editar`}
            className="text-xs text-gray-600 transition-colors hover:text-gray-900"
          >
            Editar
          </Link>
          {row.status === 'active' ? (
            <button
              onClick={() => handleSetStatus(row.id, 'inactive')}
              className="text-xs text-red-500 transition-colors hover:text-red-600"
            >
              Inativar
            </button>
          ) : (
            <button
              onClick={() => handleSetStatus(row.id, 'active')}
              className="text-xs text-green-600 transition-colors hover:text-green-700"
            >
              Ativar
            </button>
          )}
          <a
            href={`/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 transition-colors hover:text-gray-800"
            title="Pagina publica"
          >
            <ExternalLink size={13} strokeWidth={1.75} />
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
