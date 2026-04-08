import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { professionalsService } from '@/services/professionals.service';
import { servicesService } from '@/services/services.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminProfessionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [savingServices, setSavingServices] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const load = () => {
    setLoading(true);
    Promise.all([professionalsService.getAll(user?.establishmentId), servicesService.getAll()])
      .then(([profs, svcs]) => { setProfessionals(profs); setServices(svcs); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const openCreate = () => { setEditTarget(null); setSelectedServiceIds([]); reset({ name: '', bio: '' }); setShowModal(true); };
  const openEdit = (prof) => {
    setEditTarget(prof);
    setSelectedServiceIds(prof.professional_services?.map((ps) => ps.service_id) || []);
    reset({ name: prof.name, bio: prof.bio || '' });
    setShowModal(true);
  };

  const toggleServiceId = (id) =>
    setSelectedServiceIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const onSubmit = async (data) => {
    try {
      let profId = editTarget?.id;
      if (editTarget) { await professionalsService.update(editTarget.id, data); }
      else { const created = await professionalsService.create(data); profId = created.id; }

      setSavingServices(true);
      const current = editTarget?.professional_services?.map((ps) => ps.service_id) || [];
      const toAdd = selectedServiceIds.filter((id) => !current.includes(id));
      const toRemove = current.filter((id) => !selectedServiceIds.includes(id));
      await Promise.all([
        ...toAdd.map((sid) => professionalsService.addService(profId, sid)),
        ...toRemove.map((sid) => professionalsService.removeService(profId, sid)),
      ]);

      toast.success(editTarget ? 'Profissional atualizado.' : 'Profissional criado.');
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar.'); }
    finally { setSavingServices(false); }
  };

  const handleToggle = async (prof) => {
    try { await professionalsService.update(prof.id, { is_active: !prof.is_active }); toast.success('Status atualizado.'); load(); }
    catch { toast.error('Erro ao atualizar.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este profissional?')) return;
    try { await professionalsService.delete(id); toast.success('Profissional removido.'); load(); }
    catch { toast.error('Erro ao excluir.'); }
  };

  const columns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'services', label: 'Serviços',
      render: (row) => row.professional_services?.length > 0
        ? row.professional_services.map((ps) => ps.services?.name).join(', ')
        : <span className="text-gray-400">—</span>,
    },
    {
      key: 'is_active', label: 'Status',
      render: (row) => (
        <span className={`text-xs font-medium ${row.is_active ? 'text-green-600' : 'text-gray-400'}`}>
          {row.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="flex items-center gap-3">
          <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:text-blue-700">Editar</button>
          <button onClick={() => handleToggle(row)} className="text-xs text-gray-500 hover:text-gray-700">
            {row.is_active ? 'Inativar' : 'Ativar'}
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-xs text-red-500 hover:text-red-600">Excluir</button>
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
          <Input label="Nome" placeholder="João Silva" required error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea className="input-base resize-none h-20" placeholder="Especialidades, experiência..." {...register('bio')} />
          </div>

          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Serviços que realiza</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((svc) => (
                  <label
                    key={svc.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedServiceIds.includes(svc.id)
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      checked={selectedServiceIds.includes(svc.id)}
                      onChange={() => toggleServiceId(svc.id)}
                    />
                    <span className="text-sm text-gray-700">{svc.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting || savingServices}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
