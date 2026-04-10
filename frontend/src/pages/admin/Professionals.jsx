import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Camera, User, Pencil, Power, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { professionalsService } from '@/services/professionals.service';
import { servicesService } from '@/services/services.service';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function AdminProfessionals() {
  const { user } = useAuth();
  const ctx      = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary  = branding.primaryColor || '#111827';
  const accent   = branding.accentColor  || '#111827';

  const [professionals, setProfessionals] = useState([]);
  const [services,      setServices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editTarget,    setEditTarget]    = useState(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [savingServices, setSavingServices] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const fileInputRef   = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([professionalsService.getAll(user?.establishmentId), servicesService.getAll()])
      .then(([profs, svcs]) => { setProfessionals(profs); setServices(svcs); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [user]);

  const openCreate = () => {
    setEditTarget(null); setSelectedServiceIds([]);
    setAvatarPreview(null); setAvatarFile(null);
    reset({ name: '', bio: '' }); setShowModal(true);
  };
  const openEdit = (prof) => {
    setEditTarget(prof);
    setSelectedServiceIds(prof.professional_services?.map((ps) => ps.service_id) || []);
    setAvatarPreview(prof.avatar_url || null); setAvatarFile(null);
    reset({ name: prof.name, bio: prof.bio || '' });
    setShowModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const toggleServiceId = (id) =>
    setSelectedServiceIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const onSubmit = async (data) => {
    try {
      let profId = editTarget?.id;
      if (editTarget) { await professionalsService.update(editTarget.id, data); }
      else { const created = await professionalsService.create(data); profId = created.id; }

      if (avatarFile && profId) {
        setUploadingAvatar(true);
        try {
          const base64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (e) => res(e.target.result.split(',')[1]);
            r.onerror = rej;
            r.readAsDataURL(avatarFile);
          });
          await professionalsService.uploadAvatar(profId, { fileName: avatarFile.name, contentType: avatarFile.type, base64 });
        } finally { setUploadingAvatar(false); }
      }

      setSavingServices(true);
      const current = editTarget?.professional_services?.map((ps) => ps.service_id) || [];
      const toAdd    = selectedServiceIds.filter((id) => !current.includes(id));
      const toRemove = current.filter((id) => !selectedServiceIds.includes(id));
      await Promise.all([
        ...toAdd.map((sid) => professionalsService.addService(profId, sid)),
        ...toRemove.map((sid) => professionalsService.removeService(profId, sid)),
      ]);

      toast.success(editTarget ? 'Profissional atualizado.' : 'Profissional criado.');
      setShowModal(false);
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSavingServices(false); }
  };

  const handleToggle = async (prof) => {
    try { await professionalsService.update(prof.id, { is_active: !prof.is_active }); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este profissional?')) return;
    try { await professionalsService.delete(id); toast.success('Profissional removido.'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Profissionais</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          <Plus size={16} />
          Novo Profissional
        </button>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 animate-pulse">
              <div className="w-14 h-14 bg-gray-100 rounded-xl" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
              <div className="h-2.5 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-20 text-center">
          <User size={40} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">Nenhum profissional cadastrado</p>
          <button
            onClick={openCreate}
            className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            Adicionar profissional
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {professionals.map((prof) => {
            const svcs = prof.professional_services?.map((ps) => ps.services?.name).filter(Boolean) || [];
            return (
              <div
                key={prof.id}
                className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 transition-opacity ${!prof.is_active ? 'opacity-50' : ''}`}
              >
                {/* avatar */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: accent }}>
                    {prof.avatar_url
                      ? <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover" />
                      : <span className="text-lg font-bold text-white">{initials(prof.name)}</span>
                    }
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={prof.is_active
                      ? { backgroundColor: primary + '18', color: primary }
                      : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                  >
                    {prof.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* info */}
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{prof.name}</p>
                  {prof.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{prof.bio}</p>}
                  {svcs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {svcs.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {svcs.length > 3 && (
                        <span className="text-xs text-gray-400">+{svcs.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(prof)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex-1 justify-center"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleToggle(prof)}
                    title={prof.is_active ? 'Inativar' : 'Ativar'}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(prof.id)}
                    title="Excluir"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editTarget ? 'Editar Profissional' : 'Novo Profissional'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center cursor-pointer relative group"
              style={{ backgroundColor: accent }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-white">
                    {(editTarget?.name || '?').charAt(0).toUpperCase()}
                  </span>
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              {avatarPreview ? 'Alterar foto' : 'Adicionar foto'}
            </button>
          </div>

          <Input label="Nome" placeholder="João Silva" required error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório.' })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea className="input-base resize-none h-20" placeholder="Especialidades, experiência..." {...register('bio')} />
          </div>

          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Serviços que realiza</label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((svc) => {
                  const checked = selectedServiceIds.includes(svc.id);
                  return (
                    <label
                      key={svc.id}
                      className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors"
                      style={checked
                        ? { borderColor: primary, backgroundColor: primary + '0f' }
                        : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}
                    >
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300"
                        checked={checked} onChange={() => toggleServiceId(svc.id)} />
                      <span className="text-sm text-gray-700">{svc.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <button
              type="submit"
              disabled={isSubmitting || savingServices || uploadingAvatar}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              {isSubmitting || savingServices || uploadingAvatar ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
