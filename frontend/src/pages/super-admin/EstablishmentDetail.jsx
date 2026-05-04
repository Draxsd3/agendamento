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

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-sm text-gray-900">{value}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-blue-600"
              title="Abrir"
            >
              <ExternalLink size={14} strokeWidth={1.75} />
            </a>
          ) : null}
          <button
            type="button"
            onClick={copy}
            className="text-gray-500 transition-colors hover:text-green-600"
            title="Copiar"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} strokeWidth={1.75} />}
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
      toast.error(getErrorMessage(err, 'Estabelecimento nao encontrado.'));
      navigate('/super-admin/estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleToggleStatus = async () => {
    const next = establishment.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await establishmentsService.setStatus(id, next);
      setEstablishment(updated);
      toast.success(`Estabelecimento ${next === 'active' ? 'ativado' : 'inativado'}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar status.'));
    }
  };

  const onCreateAdmin = async (data) => {
    try {
      await superAdminService.createAdminUser({ ...data, establishmentId: id });
      toast.success('Usuario admin criado com sucesso.');
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  const bookingUrl = `${origin}/${establishment.slug}`;
  const loginUrl = `${origin}/${establishment.slug}/login`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/super-admin/estabelecimentos')}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{establishment.name}</h1>
            <p className="text-sm text-gray-500">/{establishment.slug}</p>
          </div>
          <Badge value={establishment.status} />
        </div>

        <div className="flex gap-2">
          <Link to={`/super-admin/estabelecimentos/${id}/editar`}>
            <Button variant="secondary" icon={Pencil} size="sm">
              Editar
            </Button>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Informacoes" />
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {[
                { label: 'Nome', value: establishment.name },
                { label: 'Slug', value: establishment.slug },
                { label: 'Telefone', value: establishment.phone || '-' },
                { label: 'Criado em', value: new Date(establishment.created_at).toLocaleDateString('pt-BR') },
              ].map((item) => (
                <div key={item.label}>
                  <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">{item.label}</p>
                  <p className="text-gray-900">{item.value}</p>
                </div>
              ))}

              {establishment.address ? (
                <div className="sm:col-span-2">
                  <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Endereco</p>
                  <p className="text-gray-900">{establishment.address}</p>
                </div>
              ) : null}

              {establishment.description ? (
                <div className="sm:col-span-2">
                  <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Descricao</p>
                  <p className="text-gray-900">{establishment.description}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="URLs de acesso"
              description="Copie e envie ao dono e clientes do estabelecimento."
            />
            <div className="space-y-4">
              <CopyField
                label="Pagina publica de agendamento (clientes)"
                value={bookingUrl}
                href={bookingUrl}
              />

              <div>
                <CopyField label="Login do admin do estabelecimento" value={loginUrl} />
                <p className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                  <LogIn size={11} strokeWidth={1.75} />
                  Envie ao dono junto com as credenciais criadas abaixo.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Usuario Admin"
              description="Responsavel por gerenciar este estabelecimento."
              action={(
                <Button icon={UserPlus} size="sm" onClick={() => { reset(); setShowAdminModal(true); }}>
                  Criar
                </Button>
              )}
            />

            {admins.length === 0 ? (
              <div className="py-6 text-center">
                <Users size={32} className="mx-auto mb-2 text-gray-400" strokeWidth={1.75} />
                <p className="text-sm text-gray-600">Nenhum admin vinculado.</p>
                <p className="mt-1 text-xs text-gray-500">Crie um usuario admin para este estabelecimento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white shrink-0">
                      <span className="text-xs font-semibold text-gray-700">
                        {u.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="truncate text-xs text-gray-500">{u.email}</p>
                    </div>
                    <Badge value={u.is_active ? 'active' : 'inactive'}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Acoes rapidas" />
            <div className="space-y-2">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Globe size={16} className="text-blue-600" strokeWidth={1.75} />
                <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                  Ver pagina publica
                </span>
                <ExternalLink size={12} className="text-gray-400" strokeWidth={1.75} />
              </a>

              <div className="flex cursor-not-allowed select-none items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 opacity-70">
                <LogIn size={16} className="text-gray-400" strokeWidth={1.75} />
                <span className="flex-1 text-sm text-gray-500">
                  Login do admin
                </span>
                <span className="text-xs italic text-gray-400">use o campo de copia acima</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Criar Usuario Admin"
      >
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
          Este usuario tera acesso ao painel de administracao do <strong>{establishment.name}</strong>.
        </div>

        <form onSubmit={handleSubmit(onCreateAdmin)} className="space-y-4">
          <Input
            label="Nome completo"
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

          <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <p className="mb-2 font-medium text-gray-700">Credenciais para entregar ao dono:</p>
            <p>URL de acesso: <span className="font-mono text-blue-600">{loginUrl}</span></p>
            <p>Email: o que foi cadastrado acima</p>
            <p>Senha: a que foi cadastrada acima</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdminModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} icon={UserPlus}>
              Criar usuario
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
