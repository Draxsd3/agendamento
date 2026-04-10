import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Globe,
  LogIn,
  UserPlus,
  Users,
  Building2,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { establishmentsService } from '@/services/establishments.service';
import { superAdminService } from '@/services/super-admin.service';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

function CopyField({ label, value, href }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5">
        <span className="flex-1 text-sm text-gray-300 truncate font-mono">{value}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-400 transition-colors"
              title="Abrir"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={copy}
            className="text-gray-500 hover:text-green-400 transition-colors"
            title="Copiar"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [establishment, setEstablishment] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const origin = window.location.origin;

  const load = async () => {
    setLoading(true);
    try {
      const [estab, adminsData] = await Promise.all([
        establishmentsService.getById(id),
        api.get(`/super-admin/establishments/${id}/admins`).then((r) => r.data).catch(() => []),
      ]);
      setEstablishment(estab);
      setAdmins(adminsData);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Estabelecimento não encontrado.'));
      navigate('/super-admin/estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleToggleStatus = async () => {
    const next = establishment.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await establishmentsService.setStatus(id, next);
      setEstablishment(updated);
      toast.success(`Estabelecimento ${next === 'active' ? 'ativado' : 'inativado'}.`);
    } catch {
      toast.error(getErrorMessage(err, 'Erro ao atualizar status.'));
    }
  };

  const onCreateAdmin = async (data) => {
    try {
      await superAdminService.createAdminUser({ ...data, establishmentId: id });
      toast.success('Usuário admin criado com sucesso!');
      setShowAdminModal(false);
      reset();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
      </div>
    );
  }

  const bookingUrl = `${origin}/${establishment.slug}`;
  const loginUrl = `${origin}/${establishment.slug}/login`;           // admin do estabelecimento e clientes
  const superAdminLoginUrl = `${origin}/super-admin/login`; // exclusivo super admin

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/super-admin/estabelecimentos')}
            className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">{establishment.name}</h1>
            <p className="text-sm text-gray-500">/{establishment.slug}</p>
          </div>
          <Badge value={establishment.status} />
        </div>
        <div className="flex gap-2">
          <Link to={`/super-admin/estabelecimentos/${id}/editar`}>
            <Button variant="secondary" icon={Pencil} size="sm">Editar</Button>
          </Link>
          <Button
            variant={establishment.status === 'active' ? 'danger' : 'primary'}
            size="sm"
            icon={establishment.status === 'active' ? ToggleLeft : ToggleRight}
            onClick={handleToggleStatus}
          >
            {establishment.status === 'active' ? 'Inativar' : 'Ativar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Info */}
          <Card>
            <CardHeader title="Informações" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Nome', value: establishment.name },
                { label: 'Slug', value: establishment.slug },
                { label: 'Telefone', value: establishment.phone || '—' },
                { label: 'Criado em', value: new Date(establishment.created_at).toLocaleDateString('pt-BR') },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-gray-200">{item.value}</p>
                </div>
              ))}
              {establishment.address && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Endereço</p>
                  <p className="text-gray-200">{establishment.address}</p>
                </div>
              )}
              {establishment.description && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Descrição</p>
                  <p className="text-gray-200">{establishment.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* URLs */}
          <Card>
            <CardHeader
              title="URLs de Acesso"
              description="Copie e envie ao dono e clientes do estabelecimento."
            />
            <div className="space-y-4">
              <CopyField
                label="Página pública de agendamento (clientes)"
                value={bookingUrl}
                href={bookingUrl}
              />
              <div>
                <CopyField
                  label="Login do admin do estabelecimento"
                  value={loginUrl}
                />
                <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                  <LogIn size={11} />
                  Envie ao dono junto com as credenciais criadas abaixo.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Admins */}
          <Card>
            <CardHeader
              title="Usuário Admin"
              description="Responsável por gerenciar este estabelecimento."
              action={
                <Button icon={UserPlus} size="sm" onClick={() => { reset(); setShowAdminModal(true); }}>
                  Criar
                </Button>
              }
            />
            {admins.length === 0 ? (
              <div className="text-center py-6">
                <Users size={32} className="text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhum admin vinculado.</p>
                <p className="text-xs text-gray-600 mt-1">Crie um usuário admin para este estabelecimento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-800">
                    <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-blue-400">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-100 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <Badge value={u.is_active ? 'active' : 'inactive'}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader title="Ações rápidas" />
            <div className="space-y-2">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 transition-colors group"
              >
                <Globe size={16} className="text-blue-400" />
                <span className="text-sm text-gray-300 group-hover:text-gray-100 flex-1">
                  Ver página pública
                </span>
                <ExternalLink size={12} className="text-gray-600" />
              </a>

              {/* Login link — apenas cópia, não navegável pelo super admin */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-800/20 opacity-60 cursor-not-allowed select-none">
                <LogIn size={16} className="text-gray-600" />
                <span className="text-sm text-gray-600 flex-1">
                  Login do admin
                </span>
                <span className="text-xs text-gray-700 italic">use o campo de cópia acima</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal criar admin */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Criar Usuário Admin"
      >
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
          Este usuário terá acesso ao painel de administração do <strong>{establishment.name}</strong>.
        </div>
        <form onSubmit={handleSubmit(onCreateAdmin)} className="space-y-4">
          <Input
            label="Nome completo"
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

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300 mb-2">Credenciais para entregar ao dono:</p>
            <p>• URL de acesso: <span className="text-blue-400 font-mono">{loginUrl}</span></p>
            <p>• Email: <span className="text-gray-300">o que foi cadastrado acima</span></p>
            <p>• Senha: <span className="text-gray-300">a que foi cadastrada acima</span></p>
            <p className="text-gray-600 pt-1 border-t border-gray-700 mt-2">
              O Super Admin usa uma URL diferente: <span className="font-mono">/super-admin/login</span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdminModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} icon={UserPlus}>
              Criar usuário
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
