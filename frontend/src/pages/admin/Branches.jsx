import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, Building2 } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { branchesService } from '@/services/branches.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const EMPTY_FORM = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  phone: '',
  is_active: true,
};

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    branchesService.getAll()
      .then(setBranches)
      .catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar filiais.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal('create');
  };

  const openEdit = (branch) => {
    setForm({
      name:      branch.name,
      address:   branch.address   || '',
      city:      branch.city      || '',
      state:     branch.state     || '',
      zip_code:  branch.zip_code  || '',
      phone:     branch.phone     || '',
      is_active: branch.is_active,
    });
    setModal(branch);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await branchesService.create(form);
        toast.success('Filial criada!');
      } else {
        await branchesService.update(modal.id, form);
        toast.success('Filial atualizada!');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await branchesService.delete(deleteTarget.id);
      toast.success('Filial removida.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filiais</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as unidades do seu estabelecimento
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Nova filial
        </Button>
      </div>

      {branches.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma filial cadastrada</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Adicione unidades do seu estabelecimento para organizar melhor seus atendimentos.
            </p>
            <Button icon={Plus} onClick={openCreate}>
              Cadastrar primeira filial
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch.id} className={!branch.is_active ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 size={17} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{branch.name}</p>
                    {!branch.is_active && (
                      <span className="text-xs text-gray-400">Inativa</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(branch)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(branch)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-gray-500">
                {(branch.address || branch.city) && (
                  <div className="flex items-start gap-1.5">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                    <span>
                      {[branch.address, branch.city, branch.state].filter(Boolean).join(', ')}
                      {branch.zip_code && ` — CEP ${branch.zip_code}`}
                    </span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="shrink-0 text-gray-400" />
                    <span>{branch.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nova filial' : 'Editar filial'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da filial *</label>
            <Input
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Ex: Unidade Centro"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <Input
              value={form.address}
              onChange={handleChange('address')}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <Input
                value={form.city}
                onChange={handleChange('city')}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <Input
                value={form.state}
                onChange={handleChange('state')}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <Input
                value={form.zip_code}
                onChange={handleChange('zip_code')}
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <Input
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange('is_active')}
              className="rounded border-gray-300 text-blue-600"
            />
            Filial ativa
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {modal === 'create' ? 'Criar filial' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remover filial"
      >
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja remover a filial <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Remover
          </Button>
        </div>
      </Modal>
    </div>
  );
}
