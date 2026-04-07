import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
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

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    Promise.all([
      superAdminService.getAllUsers(),
      establishmentsService.getAll(),
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
      toast.error('Erro ao atualizar status.');
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
      toast.error(err.response?.data?.error || 'Erro ao criar usuário.');
    }
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    establishment_admin: 'Admin',
    customer: 'Cliente',
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Perfil',
      render: (row) => (
        <span className="text-xs font-medium text-gray-300">
          {roleLabel[row.role] || row.role}
        </span>
      ),
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
      label: 'Ações',
      render: (row) =>
        row.role !== 'super_admin' ? (
          <button
            onClick={() => handleToggle(row.id)}
            className={`text-xs font-medium ${
              row.is_active
                ? 'text-red-400 hover:text-red-300'
                : 'text-green-400 hover:text-green-300'
            }`}
          >
            {row.is_active ? 'Desativar' : 'Ativar'}
          </button>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuários</h1>
        <Button icon={Plus} onClick={() => { reset(); setShowModal(true); }}>
          Novo Admin
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="Nenhum usuário encontrado."
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
            placeholder="João Silva"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="admin@email.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email é obrigatório.',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
            })}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            error={errors.password?.message}
            {...register('password', {
              required: 'Senha é obrigatória.',
              minLength: { value: 6, message: 'Mínimo 6 caracteres.' },
            })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">
              Estabelecimento <span className="text-red-400">*</span>
            </label>
            <select
              className="input-base"
              {...register('establishmentId', { required: 'Selecione um estabelecimento.' })}
            >
              <option value="">Selecione...</option>
              {establishments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            {errors.establishmentId && (
              <p className="text-xs text-red-400">{errors.establishmentId.message}</p>
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
