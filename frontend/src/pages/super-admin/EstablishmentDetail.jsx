import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  LogIn,
  Pencil,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Users,
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

function CopyField({ label, value, href, note }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="super-admin-label">{label}</p>
          <p className="mt-3 truncate rounded-2xl border border-stone-200 bg-white px-4 py-3 font-mono text-sm text-stone-950">
            {value}
          </p>
          {note ? <p className="mt-2 text-xs text-stone-950">{note}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-950 transition-colors hover:opacity-75"
              title="Abrir"
            >
              <ExternalLink size={15} />
            </a>
          ) : null}

          <button
            type="button"
            onClick={copy}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-950 transition-colors hover:opacity-75"
            title="Copiar"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, full = false }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <p className="super-admin-label">{label}</p>
      <p className="mt-2 text-sm leading-6 text-stone-950">{value || '-'}</p>
    </div>
  );
}

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [establishment, setEstablishment] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [asaasSubaccount, setAsaasSubaccount] = useState({ configured: false });
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAsaasModal, setShowAsaasModal] = useState(false);
  const [syncingAsaas, setSyncingAsaas] = useState(false);
  const [creatingAsaas, setCreatingAsaas] = useState(false);
  const [asaasForm, setAsaasForm] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    birthDate: '',
    companyType: 'MEI',
    incomeValue: '5000',
    phone: '',
    mobilePhone: '',
    address: '',
    addressNumber: '',
    complement: '',
    province: '',
    postalCode: '',
  });

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

      const subaccount = await superAdminService
        .getAsaasSubaccount(id)
        .catch(() => ({ configured: false }));

      setAsaasSubaccount(subaccount);
      setAsaasForm((current) => ({
        ...current,
        name: estab.name || '',
        phone: estab.phone || '',
      }));
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

  const setAsaasField = (field) => (event) => {
    setAsaasForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreateAsaasSubaccount = async (event) => {
    event.preventDefault();
    setCreatingAsaas(true);

    try {
      const result = await superAdminService.createAsaasSubaccount(id, asaasForm);
      setAsaasSubaccount(result);
      setShowAsaasModal(false);
      toast.success('Subconta Asaas criada com sucesso.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCreatingAsaas(false);
    }
  };

  const handleSyncAsaas = async () => {
    setSyncingAsaas(true);

    try {
      const result = await superAdminService.syncAsaasSubaccount(id);
      setAsaasSubaccount(result);
      toast.success('Dados da subconta Asaas atualizados.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSyncingAsaas(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
      </div>
    );
  }

  const bookingUrl = `${origin}/${establishment.slug}`;
  const loginUrl = `${origin}/${establishment.slug}/login`;

  return (
    <div className="space-y-6">
      <section className="super-admin-panel overflow-hidden border-none bg-stone-950 text-white shadow-2xl shadow-stone-950/20">
        <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/super-admin/estabelecimentos')}
              className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-stone-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">
                Detalhe do estabelecimento
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-white">{establishment.name}</h2>
                <Badge value={establishment.status} />
              </div>
              <p className="mt-2 text-sm text-stone-300">/{establishment.slug}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to={`/super-admin/estabelecimentos/${id}/editar`}>
              <Button variant="secondary" icon={Pencil} className="rounded-2xl border-white/10 bg-white text-stone-900 hover:bg-stone-100">
                Editar
              </Button>
            </Link>
            <Button
              variant={establishment.status === 'active' ? 'danger' : 'primary'}
              size="md"
              icon={establishment.status === 'active' ? ToggleLeft : ToggleRight}
              className={establishment.status === 'active' ? 'rounded-2xl' : 'rounded-2xl bg-stone-100 text-stone-900 hover:bg-white'}
              onClick={handleToggleStatus}
            >
              {establishment.status === 'active' ? 'Inativar' : 'Ativar'}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <Card className="super-admin-panel border-none shadow-none">
            <CardHeader
              title="Informacoes principais"
              description="Dados institucionais usados para operacao, links e identificacao."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <InfoItem label="Nome" value={establishment.name} />
              <InfoItem label="Slug" value={establishment.slug} />
              <InfoItem label="Telefone" value={establishment.phone || '-'} />
              <InfoItem label="Criado em" value={new Date(establishment.created_at).toLocaleDateString('pt-BR')} />
              <InfoItem label="Endereco" value={establishment.address || '-'} full />
              <InfoItem label="Descricao" value={establishment.description || '-'} full />
            </div>
          </Card>

          <Card className="super-admin-panel border-none shadow-none">
            <CardHeader
              title="URLs de acesso"
              description="Atalhos prontos para compartilhar com clientes e com o dono do estabelecimento."
            />
            <div className="space-y-4">
              <CopyField
                label="Pagina publica de agendamento"
                value={bookingUrl}
                href={bookingUrl}
                note="Link para clientes acessarem a agenda publica."
              />
              <CopyField
                label="Login do admin do estabelecimento"
                value={loginUrl}
                note="Entregue esse link junto com as credenciais criadas abaixo."
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="super-admin-panel border-none shadow-none">
            <CardHeader
              title="Usuario admin"
              description="Responsavel pela operacao do estabelecimento."
              action={(
                <Button
                  icon={UserPlus}
                  size="sm"
                  className="rounded-2xl bg-stone-900 hover:bg-stone-800"
                  onClick={() => {
                    reset();
                    setShowAdminModal(true);
                  }}
                >
                  Criar
                </Button>
              )}
            />

            {admins.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
                <Users size={28} className="mx-auto mb-3 text-stone-400" />
                <p className="text-sm font-medium text-stone-950">Nenhum admin vinculado.</p>
                <p className="mt-1 text-xs text-stone-950">
                  Crie um usuario admin para liberar o acesso ao painel deste estabelecimento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((u) => (
                  <div key={u.id} className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-sm font-semibold text-stone-950">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-stone-900">{u.name}</p>
                        <p className="truncate text-xs text-stone-950">{u.email}</p>
                      </div>
                      <Badge value={u.is_active ? 'active' : 'inactive'}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="super-admin-panel border-none shadow-none">
            <CardHeader
              title="Subconta Asaas"
              description="Conta financeira usada para cobrancas e assinaturas."
              action={
                asaasSubaccount.configured ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={RefreshCw}
                    onClick={handleSyncAsaas}
                    loading={syncingAsaas}
                    className="rounded-2xl"
                  >
                    Sincronizar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    icon={CreditCard}
                    className="rounded-2xl bg-stone-900 hover:bg-stone-800"
                    onClick={() => setShowAsaasModal(true)}
                  >
                    Criar subconta
                  </Button>
                )
              }
            />

            {!asaasSubaccount.configured ? (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
                <CreditCard size={28} className="mx-auto mb-3 text-stone-400" />
                <p className="text-sm font-medium text-stone-950">Nenhuma subconta Asaas criada.</p>
                <p className="mt-1 text-xs text-stone-950">
                  Configure a subconta para separar recebimentos na conta do estabelecimento.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <InfoItem label="Account ID" value={asaasSubaccount.account_id || '-'} />
                <InfoItem label="Wallet ID" value={asaasSubaccount.wallet_id || '-'} />
                <InfoItem label="API Key" value={asaasSubaccount.api_key_masked || '-'} />
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem label="Status geral" value={asaasSubaccount.status?.general || 'PENDING'} />
                  <InfoItem label="Documentacao" value={asaasSubaccount.status?.documentation || 'PENDING'} />
                </div>

                {asaasSubaccount.onboarding_links?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="super-admin-label">Onboarding</p>
                    {asaasSubaccount.onboarding_links.map((item) => (
                      <a
                        key={item.id}
                        href={item.onboardingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 transition-colors hover:bg-white"
                      >
                        <span className="truncate">{item.title || item.type}</span>
                        <ExternalLink size={14} className="shrink-0 text-stone-950" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </Card>

          <Card className="super-admin-panel border-none shadow-none">
            <CardHeader title="Acoes rapidas" />
            <div className="space-y-3">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950 transition-colors hover:bg-white"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-stone-950">
                  <Globe size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">Ver pagina publica</p>
                  <p className="text-xs text-stone-950">Abrir experiencia do cliente em nova aba.</p>
                </div>
                <ExternalLink size={14} className="text-stone-950" />
              </a>

              <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-950">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-stone-950">
                  <LogIn size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">Login do admin</p>
                  <p className="text-xs text-stone-950">Use o campo de copia acima para compartilhar o acesso.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Criar usuario admin"
      >
        <div className="mb-4 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-950">
          Esse usuario tera acesso ao painel administrativo de <strong>{establishment.name}</strong>.
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

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-950">
            <p className="mb-2 font-medium text-stone-800">Entregue ao dono:</p>
            <p>URL de acesso: <span className="font-mono text-stone-800">{loginUrl}</span></p>
            <p>Email: o informado acima</p>
            <p>Senha: a cadastrada acima</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAdminModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting} icon={UserPlus} className="bg-stone-900 hover:bg-stone-800">
              Criar usuario
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAsaasModal}
        onClose={() => setShowAsaasModal(false)}
        title="Criar subconta Asaas"
      >
        <form onSubmit={handleCreateAsaasSubaccount} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome / Razao social" required value={asaasForm.name} onChange={setAsaasField('name')} />
            <Input label="Email" type="email" required value={asaasForm.email} onChange={setAsaasField('email')} />
            <Input label="CPF/CNPJ" required value={asaasForm.cpfCnpj} onChange={setAsaasField('cpfCnpj')} />
            <Input label="Data de nascimento" type="date" value={asaasForm.birthDate} onChange={setAsaasField('birthDate')} />
            <Input label="Tipo de empresa" hint="Ex.: MEI" value={asaasForm.companyType} onChange={setAsaasField('companyType')} />
            <Input label="Faturamento/Renda mensal" type="number" required value={asaasForm.incomeValue} onChange={setAsaasField('incomeValue')} />
            <Input label="Telefone" required value={asaasForm.phone} onChange={setAsaasField('phone')} />
            <Input label="Celular" required value={asaasForm.mobilePhone} onChange={setAsaasField('mobilePhone')} />
            <Input label="CEP" required value={asaasForm.postalCode} onChange={setAsaasField('postalCode')} />
            <Input label="Endereco" required className="sm:col-span-2" value={asaasForm.address} onChange={setAsaasField('address')} />
            <Input label="Numero" required value={asaasForm.addressNumber} onChange={setAsaasField('addressNumber')} />
            <Input label="Bairro" required value={asaasForm.province} onChange={setAsaasField('province')} />
            <Input label="Complemento" className="sm:col-span-2" value={asaasForm.complement} onChange={setAsaasField('complement')} />
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-950">
            A subconta sera criada abaixo da conta raiz da plataforma para separar recebimentos
            e acelerar o onboarding financeiro.
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAsaasModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" icon={CreditCard} loading={creatingAsaas} className="bg-stone-900 hover:bg-stone-800">
              Criar subconta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
