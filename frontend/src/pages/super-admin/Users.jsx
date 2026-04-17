import { useEffect, useState } from 'react';
import { Building2, Filter, Plus, Search, Shield, UserCog, Users } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { superAdminService } from '@/services/super-admin.service';
import { establishmentsService } from '@/services/establishments.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const roleLabel = {
  super_admin: 'Super Admin',
  establishment_admin: 'Usuario de estabelecimento',
  customer: 'Cliente de estabelecimento',
};

const roleSummary = {
  super_admin: {
    title: 'Super Admins',
    description: 'Acessam e administram todo o sistema.',
    icon: Shield,
    tone: 'border-stone-200 bg-stone-100 text-stone-700',
  },
  establishment_admin: {
    title: 'Usuarios de estabelecimento',
    description: 'Administram agenda, servicos e operacao do estabelecimento.',
    icon: UserCog,
    tone: 'border-stone-300 bg-stone-50 text-stone-700',
  },
  customer: {
    title: 'Clientes de estabelecimento',
    description: 'Clientes vinculados por agendamentos nos estabelecimentos.',
    icon: Users,
    tone: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  },
};

const filterOptions = [
  { value: 'all', label: 'Todos os usuarios' },
  { value: 'establishment_admin', label: 'Usuarios de estabelecimento' },
  { value: 'customer', label: 'Clientes de estabelecimento' },
  { value: 'super_admin', label: 'Super Admins' },
];

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

function UsersSummaryCard({ title, description, value, icon: Icon, tone, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left transition-all ${
        active ? `${tone} shadow-sm` : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-stone-950">{value}</p>
          <p className="mt-2 text-sm text-stone-500">{description}</p>
        </div>
        <div className={`rounded-xl border p-3 ${active ? 'border-current/20 bg-white/60' : 'border-stone-200 bg-stone-50'}`}>
          <Icon size={20} />
        </div>
      </div>
    </button>
  );
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    establishmentId: 'all',
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdminService.getAllUsers({ limit: 500 }),
      establishmentsService.getAll({ limit: 500 }),
    ])
      .then(([usersRes, estabRes]) => {
        setUsers(usersRes.data || []);
        setEstablishments(estabRes.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (userId) => {
    try {
      await superAdminService.toggleUserStatus(userId);
      toast.success('Status atualizado.');
      load();
    } catch {
      toast.error(getErrorMessage(err, 'Erro ao atualizar status.'));
    }
  };

  const onSubmit = async (data) => {
    try {
      await superAdminService.createAdminUser(data);
      toast.success('Admin criado com sucesso.');
      setShowModal(false);
      reset();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      establishmentId: 'all',
    });
  };

  const counts = {
    total: users.length,
    super_admin: users.filter((user) => user.role === 'super_admin').length,
    establishment_admin: users.filter((user) => user.role === 'establishment_admin').length,
    customer: users.filter((user) => user.role === 'customer').length,
  };

  const normalizedSearch = filters.search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch) ||
      user.establishments?.some((item) => item.name?.toLowerCase().includes(normalizedSearch));

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && user.is_active) ||
      (filters.status === 'inactive' && !user.is_active);
    const matchesEstablishment =
      filters.establishmentId === 'all' ||
      user.establishments?.some((item) => item.id === filters.establishmentId);

    return matchesSearch && matchesRole && matchesStatus && matchesEstablishment;
  });

  const columns = [
    {
      key: 'name',
      label: 'Usuario',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900">{row.name}</p>
          <p className="text-xs text-stone-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Tipo',
      render: (row) => {
        const summary = roleSummary[row.role];
        return (
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${summary?.tone || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
            {roleLabel[row.role] || row.role}
          </span>
        );
      },
    },
    {
      key: 'establishments',
      label: 'Vinculo',
      render: (row) => {
        if (row.role === 'super_admin') {
          return <span className="text-sm text-stone-500">Acesso global ao sistema</span>;
        }

        if (!row.establishments?.length) {
          return <span className="text-sm text-stone-400">Sem vinculo identificado</span>;
        }

        return (
          <div className="flex flex-wrap gap-2">
            {row.establishments.map((item) => (
              <span
                key={`${row.id}-${item.id}-${item.relationship}`}
                className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700"
              >
                <Building2 size={12} />
                {item.name}
                <span className="text-stone-400">
                  {item.relationship === 'admin' ? 'admin' : 'cliente'}
                </span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge value={row.is_active ? 'active' : 'inactive'}>
          {row.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (row) => new Date(row.created_at).toLocaleDateString('pt-BR'),
    },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) =>
        row.role !== 'super_admin' ? (
          <button
            onClick={() => handleToggle(row.id)}
            className={`text-xs font-medium ${
              row.is_active
                ? 'text-red-500 hover:text-red-600'
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {row.is_active ? 'Desativar' : 'Ativar'}
          </button>
        ) : (
          <span className="text-xs text-stone-400">-</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <p className="super-admin-label">Governanca</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Usuarios</h1>
          <p className="mt-2 text-sm text-stone-500">
            Separe rapidamente quem opera estabelecimentos e quem agenda como cliente.
          </p>
        </div>
        <Button icon={Plus} className="rounded-2xl bg-stone-900 hover:bg-stone-800" onClick={() => { reset(); setShowModal(true); }}>
          Novo Admin
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <UsersSummaryCard
          title={roleSummary.establishment_admin.title}
          description={roleSummary.establishment_admin.description}
          value={counts.establishment_admin}
          icon={roleSummary.establishment_admin.icon}
          tone={roleSummary.establishment_admin.tone}
          active={filters.role === 'establishment_admin'}
          onClick={() => handleFilterChange('role', filters.role === 'establishment_admin' ? 'all' : 'establishment_admin')}
        />
        <UsersSummaryCard
          title={roleSummary.customer.title}
          description={roleSummary.customer.description}
          value={counts.customer}
          icon={roleSummary.customer.icon}
          tone={roleSummary.customer.tone}
          active={filters.role === 'customer'}
          onClick={() => handleFilterChange('role', filters.role === 'customer' ? 'all' : 'customer')}
        />
        <UsersSummaryCard
          title={roleSummary.super_admin.title}
          description={roleSummary.super_admin.description}
          value={counts.super_admin}
          icon={roleSummary.super_admin.icon}
          tone={roleSummary.super_admin.tone}
          active={filters.role === 'super_admin'}
          onClick={() => handleFilterChange('role', filters.role === 'super_admin' ? 'all' : 'super_admin')}
        />
      </div>

      <Card className="super-admin-panel space-y-5 border-none shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Filter size={16} />
              Filtragem organizada
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Filtre por tipo de usuario, status e estabelecimento para localizar mais rapido.
            </p>
          </div>
          <Button variant="secondary" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          <Input
            label="Buscar"
            placeholder="Nome, email ou estabelecimento"
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
            icon={Search}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Tipo de usuario</label>
            <select
              className="input-base"
              value={filters.role}
              onChange={(event) => handleFilterChange('role', event.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Status</label>
            <select
              className="input-base"
              value={filters.status}
              onChange={(event) => handleFilterChange('status', event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Estabelecimento</label>
            <select
              className="input-base"
              value={filters.establishmentId}
              onChange={(event) => handleFilterChange('establishmentId', event.target.value)}
            >
              <option value="all">Todos os estabelecimentos</option>
              {establishments.map((establishment) => (
                <option key={establishment.id} value={establishment.id}>
                  {establishment.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <span className="rounded-full bg-stone-100 px-3 py-1">
            {filteredUsers.length} de {counts.total} usuarios exibidos
          </span>
          {filters.role !== 'all' && (
            <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-700">
              Tipo: {filterOptions.find((option) => option.value === filters.role)?.label}
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
              Status: {statusOptions.find((option) => option.value === filters.status)?.label}
            </span>
          )}
          {filters.establishmentId !== 'all' && (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
              Estabelecimento: {establishments.find((item) => item.id === filters.establishmentId)?.name}
            </span>
          )}
        </div>
      </Card>

      <Card className="super-admin-panel border-none shadow-none" padding={false}>
        <Table
          columns={columns}
          data={filteredUsers}
          loading={loading}
          emptyMessage="Nenhum usuario encontrado com os filtros aplicados."
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Criar Admin de Estabelecimento"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="Joao Silva"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Nome e obrigatorio.' })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="admin@email.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email e obrigatorio.',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalido.' },
            })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Minimo 6 caracteres"
            required
            error={errors.password?.message}
            {...register('password', {
              required: 'Senha e obrigatoria.',
              minLength: { value: 6, message: 'Minimo 6 caracteres.' },
            })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Estabelecimento <span className="text-red-500">*</span>
            </label>
            <select
              className="input-base"
              {...register('establishmentId', { required: 'Selecione um estabelecimento.' })}
            >
              <option value="">Selecione...</option>
              {establishments.map((establishment) => (
                <option key={establishment.id} value={establishment.id}>
                  {establishment.name}
                </option>
              ))}
            </select>
            {errors.establishmentId && (
              <p className="text-xs text-red-500">{errors.establishmentId.message}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Criar Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
