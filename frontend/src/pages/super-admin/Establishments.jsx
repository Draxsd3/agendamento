import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Eye, Plus } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { establishmentsService } from '@/services/establishments.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

function SummaryCard({ label, value, note }) {
  return (
    <div className="super-admin-soft-panel p-4">
      <p className="super-admin-label">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{value}</p>
      <p className="mt-2 text-sm text-stone-600">{note}</p>
    </div>
  );
}

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

  const metrics = useMemo(() => {
    const active = data.filter((item) => item.status === 'active').length;
    return {
      total: data.length,
      active,
      inactive: data.length - active,
    };
  }, [data]);

  const columns = [
    {
      key: 'name',
      label: 'Estabelecimento',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900">{row.name}</p>
          <p className="text-xs text-stone-600">/{row.slug}</p>
        </div>
      ),
    },
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
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-stone-300 hover:bg-white"
            title="Ver detalhes"
          >
            <Eye size={14} />
            Abrir
          </Link>
          <Link
            to={`/super-admin/estabelecimentos/${row.id}/editar`}
            className="text-xs font-medium text-stone-600 transition-colors hover:text-stone-950"
          >
            Editar
          </Link>
          {row.status === 'active' ? (
            <button
              onClick={() => handleSetStatus(row.id, 'inactive')}
              className="text-xs font-medium text-rose-500 transition-colors hover:text-rose-600"
            >
              Inativar
            </button>
          ) : (
            <button
              onClick={() => handleSetStatus(row.id, 'active')}
              className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Ativar
            </button>
          )}
          <a
            href={`/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-500 transition-colors hover:text-stone-800"
            title="Pagina publica"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="super-admin-label">Operacao</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            Rede de estabelecimentos
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Acompanhe criacao, ativacao e acesso publico em uma lista mais limpa e alinhada
            com a identidade institucional do Super Admin.
          </p>
        </div>
        <Link to="/super-admin/estabelecimentos/novo">
          <Button icon={Plus} className="rounded-2xl bg-stone-900 hover:bg-stone-800">
            Novo estabelecimento
          </Button>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Base total" value={metrics.total} note="Todos os estabelecimentos cadastrados." />
        <SummaryCard label="Operando" value={metrics.active} note="Acessos liberados e ativos." />
        <SummaryCard label="Pausados" value={metrics.inactive} note="Operacoes temporariamente inativas." />
      </section>

      <Card className="super-admin-panel overflow-hidden border-none p-0 shadow-none" padding={false}>
        <div className="border-b border-stone-200/80 px-6 py-5">
          <p className="super-admin-label">Lista principal</p>
          <h3 className="mt-2 text-lg font-semibold text-stone-950">Estabelecimentos cadastrados</h3>
        </div>
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
