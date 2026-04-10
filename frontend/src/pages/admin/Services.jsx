import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Scissors, Clock, Pencil, Trash2 } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { servicesService } from '@/services/services.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function AdminServices() {
  const ctx     = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary  = branding.primaryColor || '#111827';
  const accent   = branding.accentColor  || '#111827';

  const [services,    setServices]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);

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
      const payload = { ...data, duration_minutes: Number(data.duration_minutes), price: Number(data.price) };
      if (editTarget) { await servicesService.update(editTarget.id, payload); toast.success('Serviço atualizado.'); }
      else            { await servicesService.create(payload); toast.success('Serviço criado.'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try { await servicesService.delete(id); toast.success('Serviço removido.'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Serviços</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          <Plus size={16} />
          Novo Serviço
        </button>
      </div>

      {/* list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* thead */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-medium">
          <div className="flex-1">Nome</div>
          <div className="w-24 text-center">Duração</div>
          <div className="w-28 text-right">Preço</div>
          <div className="w-16 text-center">Status</div>
          <div className="w-20" />
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Scissors size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum serviço cadastrado</p>
            <button
              onClick={openCreate}
              className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              Criar primeiro serviço
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {services.map((svc) => (
              <div key={svc.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors ${!svc.is_active ? 'opacity-50' : ''}`}>
                {/* icon */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accent + '18' }}
                >
                  <Scissors size={16} style={{ color: accent }} />
                </div>

                {/* name + desc */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{svc.name}</p>
                  {svc.description && (
                    <p className="text-xs text-gray-400 truncate">{svc.description}</p>
                  )}
                </div>

                {/* duration */}
                <div className="w-24 hidden sm:flex items-center justify-center gap-1 text-sm text-gray-500">
                  <Clock size={13} className="text-gray-300" />
                  {svc.duration_minutes} min
                </div>

                {/* price */}
                <div className="w-28 text-right hidden sm:block">
                  <span className="text-sm font-bold text-gray-900">{fmt(svc.price)}</span>
                </div>

                {/* status */}
                <div className="w-16 hidden sm:flex justify-center">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={svc.is_active
                      ? { backgroundColor: primary + '18', color: primary }
                      : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                  >
                    {svc.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* actions */}
                <div className="flex items-center gap-1 w-20 justify-end">
                  <button
                    onClick={() => openEdit(svc)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome do serviço" placeholder="Corte de cabelo" required error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea className="input-base resize-none h-20" placeholder="Descrição do serviço..." {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duração (min)" type="number" min="5" step="5" required error={errors.duration_minutes?.message}
              {...register('duration_minutes', { required: 'Obrigatório.', min: { value: 5, message: 'Mínimo 5 min.' } })} />
            <Input label="Preço (R$)" type="number" min="0" step="0.01" required error={errors.price?.message}
              {...register('price', { required: 'Obrigatório.' })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
