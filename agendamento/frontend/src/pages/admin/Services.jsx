import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { servicesService } from '@/services/services.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    servicesService.getAll().then(setServices).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', description: '', duration_minutes: 30, price: '' });
    setShowModal(true);
  };

  const openEdit = (svc) => {
    setEditTarget(svc);
    reset(svc);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        duration_minutes: Number(data.duration_minutes),
        price: Number(data.price),
      };
      if (editTarget) {
        await servicesService.update(editTarget.id, payload);
        toast.success('Serviço atualizado.');
      } else {
        await servicesService.create(payload);
        toast.success('Serviço criado.');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try {
      await servicesService.delete(id);
      toast.success('Serviço removido.');
      load();
    } catch {
      toast.error('Erro ao excluir.');
    }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'duration_minutes',
      label: 'Duração',
      render: (row) => `${row.duration_minutes} min`,
    },
    {
      key: 'price',
      label: 'Preço',
      render: (row) =>
        Number(row.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
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
        <div className="flex gap-3">
          <button onClick={() => openEdit(row)} className="text-xs text-blue-400 hover:text-blue-300">Editar</button>
          <button onClick={() => handleDelete(row.id)} className="text-xs text-red-400 hover:text-red-300">Excluir</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Serviços</h1>
        <Button icon={Plus} onClick={openCreate}>Novo Serviço</Button>
      </div>

      <Card padding={false}>
        <Table columns={columns} data={services} loading={loading} emptyMessage="Nenhum serviço cadastrado." />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome do serviço"
            placeholder="Corte de cabelo"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Descrição</label>
            <textarea className="input-base resize-none h-20" placeholder="Descrição do serviço..." {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duração (min)"
              type="number"
              min="5"
              step="5"
              required
              error={errors.duration_minutes?.message}
              {...register('duration_minutes', { required: 'Obrigatório.', min: { value: 5, message: 'Mínimo 5 min.' } })}
            />
            <Input
              label="Preço (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              error={errors.price?.message}
              {...register('price', { required: 'Obrigatório.' })}
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
