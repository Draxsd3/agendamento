import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { professionalsService } from '@/services/professionals.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminProfessionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    professionalsService
      .getAll(user?.establishmentId)
      .then(setProfessionals)
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', bio: '' });
    setShowModal(true);
  };

  const openEdit = (prof) => {
    setEditTarget(prof);
    reset({ name: prof.name, bio: prof.bio || '' });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editTarget) {
        await professionalsService.update(editTarget.id, data);
        toast.success('Profissional atualizado.');
      } else {
        await professionalsService.create(data);
        toast.success('Profissional criado.');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleToggle = async (prof) => {
    try {
      await professionalsService.update(prof.id, { is_active: !prof.is_active });
      toast.success('Status atualizado.');
      load();
    } catch {
      toast.error('Erro ao atualizar.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este profissional?')) return;
    try {
      await professionalsService.delete(id);
      toast.success('Profissional removido.');
      load();
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'services',
      label: 'Serviços',
      render: (row) =>
        row.professional_services?.length > 0
          ? row.professional_services.map((ps) => ps.services?.name).join(', ')
          : <span className="text-gray-600">Nenhum</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs font-medium ${row.is_active ? 'text-green-400' : 'text-gray-500'}`}>
          {row.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEdit(row)} className="text-xs text-blue-400 hover:text-blue-300">
            Editar
          </button>
          <button onClick={() => handleToggle(row)} className="text-xs text-gray-400 hover:text-gray-200">
            {row.is_active ? 'Inativar' : 'Ativar'}
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-xs text-red-400 hover:text-red-300">
            Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profissionais</h1>
        <Button icon={Plus} onClick={openCreate}>Novo Profissional</Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={professionals} loading={loading} emptyMessage="Nenhum profissional cadastrado." />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Editar Profissional' : 'Novo Profissional'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            placeholder="João Silva"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Bio</label>
            <textarea
              className="input-base resize-none h-20"
              placeholder="Especialidades, experiência..."
              {...register('bio')}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
