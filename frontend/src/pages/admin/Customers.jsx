import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { customersService } from '@/services/customers.service';
import { getErrorMessage } from '@/utils/errors';
import toast from 'react-hot-toast';
import {
  BadgePercent,
  CalendarCheck,
  CreditCard,
  Crown,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Tag,
  UserCircle,
  Users,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  date_of_birth: '',
  city: '',
  province: '',
  notes: '',
  password: '',
};

const STATUS_LABELS = {
  active: 'Ativo',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluido',
  cancelled: 'Cancelado',
  no_show: 'Faltou',
  manual_confirmed: 'Confirmado',
  awaiting_confirmation: 'Aguardando',
};

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function valueOrFallback(value, fallback = 'Nao informado') {
  return value || fallback;
}

function formatDate(value) {
  if (!value) return 'Nao informado';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
  }
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return 'Nao informado';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'Nao informado';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status || 'Nao informado';
}

function DetailSection({ icon: Icon, title, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-gray-100 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{item.label}</p>
          <p className="text-sm text-gray-800 mt-0.5 break-words">{valueOrFallback(item.value)}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyDetail({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-400">
      {children}
    </div>
  );
}

function compactPayload(data) {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => value !== '')
  );
}

export default function AdminCustomers() {
  const { user } = useAuth();
  const ctx = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary = branding.primaryColor || '#111827';
  const accent = branding.accentColor || '#111827';

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback((q = '') => {
    if (!user?.establishmentId) return;
    setLoading(true);
    customersService
      .getByEstablishment(user.establishmentId, { search: q, limit: 100 })
      .then((res) => {
        setCustomers(res.data || []);
        setTotal(res.total || 0);
      })
      .catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar clientes.')))
      .finally(() => setLoading(false));
  }, [user?.establishmentId]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length === 0 || value.length >= 2) load(value);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setTemporaryPassword('');
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.establishmentId) return;

    setSaving(true);
    try {
      const result = await customersService.createForEstablishment(
        user.establishmentId,
        compactPayload(form)
      );

      toast.success(result.linked_existing_user ? 'Cliente vinculado.' : 'Cliente cadastrado.');
      load(search);

      if (result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
      } else {
        setShowCreate(false);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao cadastrar cliente.'));
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (customer) => {
    if (!user?.establishmentId) return;

    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const result = await customersService.getEstablishmentCustomerDetail(
        user.establishmentId,
        customer.id
      );
      setDetail(result);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar cliente.'));
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const withAppt = customers.filter((c) => c.origin?.has_appointment).length;
  const withSub = customers.filter((c) => c.origin?.has_subscription).length;
  const withManual = customers.filter((c) => c.origin?.has_manual || c.origin?.has_self_signup).length;
  const detailCustomer = detail?.customer;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">Cadastre, acompanhe e visualize o historico do cliente</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Novo cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total', value: total, iconColor: primary },
          { icon: UserCircle, label: 'Cadastrados', value: withManual, iconColor: accent },
          { icon: CalendarCheck, label: 'Com agendamento', value: withAppt, iconColor: primary },
          { icon: Crown, label: 'Assinantes', value: withSub, iconColor: '#f59e0b' },
        ].map(({ icon: Icon, label, value, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: iconColor + '18' }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '-' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative max-w-sm w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nome, e-mail, telefone ou CPF..."
            className="input-base pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-medium">
          <div className="flex-1">Cliente</div>
          <div className="w-32">Telefone</div>
          <div className="flex-1">Vinculo</div>
          <div className="w-20 text-center">Conta</div>
          <div className="w-16 text-right">Acoes</div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <Users size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum cliente encontrado</p>
            <p className="text-xs text-gray-300 mt-1">
              Cadastre um cliente agora ou aguarde um agendamento/assinatura.
            </p>
            <Button icon={Plus} className="mt-5" onClick={openCreate}>
              Novo cliente
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map((customer) => {
              const name = customer.users?.name || '-';
              return (
                <div key={customer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {initials(name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">{customer.users?.email || '-'}</p>
                  </div>

                  <div className="w-32 hidden sm:block text-sm text-gray-500">
                    {customer.phone || <span className="text-gray-300">-</span>}
                  </div>

                  <div className="flex-1 hidden sm:flex flex-wrap gap-1.5">
                    {(customer.origin?.has_manual || customer.origin?.has_self_signup) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        <UserCircle size={11} /> Cadastro
                      </span>
                    )}
                    {customer.origin?.has_appointment && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: primary + '12', color: primary }}
                      >
                        <CalendarCheck size={11} /> Agendamento
                      </span>
                    )}
                    {customer.origin?.has_subscription && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        <Crown size={11} /> {customer.active_subscription?.plans?.name || 'Plano'}
                      </span>
                    )}
                  </div>

                  <div className="w-20 hidden sm:flex justify-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={customer.users?.is_active
                        ? { backgroundColor: primary + '18', color: primary }
                        : { backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                      {customer.users?.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="w-16 flex justify-end">
                    <button
                      type="button"
                      title="Visualizar cliente"
                      aria-label="Visualizar cliente"
                      onClick={() => openDetail(customer)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={temporaryPassword ? 'Cliente cadastrado' : 'Novo cliente'}
        size="lg"
      >
        {temporaryPassword ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">Cliente criado com senha temporaria</p>
              <p className="text-xs text-green-700 mt-1">Informe essa senha ao cliente no primeiro acesso.</p>
              <div className="mt-3 rounded-lg bg-white border border-green-100 px-3 py-2 font-mono text-sm text-gray-900">
                {temporaryPassword}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowCreate(false)}>Fechar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Nome</span>
                <input
                  className="input-base"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">E-mail</span>
                <input
                  className="input-base"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Telefone</span>
                <input
                  className="input-base"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">CPF</span>
                <input
                  className="input-base"
                  value={form.cpf}
                  onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Nascimento</span>
                <input
                  className="input-base"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Senha inicial</span>
                <input
                  className="input-base"
                  type="password"
                  minLength={6}
                  placeholder="Opcional"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Cidade</span>
                <input
                  className="input-base"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-500">Estado</span>
                <input
                  className="input-base"
                  value={form.province}
                  onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                />
              </label>
            </div>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-gray-500">Observacoes</span>
              <textarea
                className="input-base min-h-[92px] resize-y"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Cadastrar
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailCustomer?.users?.name || 'Cliente'}
        size="xl"
      >
        {detailLoading ? (
          <div className="py-16 flex items-center justify-center">
            <span className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
          </div>
        ) : detail ? (
          <div className="max-h-[74vh] overflow-y-auto pr-1 space-y-7">
            <DetailSection icon={UserCircle} title="Perfil">
              <InfoGrid
                items={[
                  { label: 'Nome', value: detailCustomer?.users?.name },
                  { label: 'E-mail', value: detailCustomer?.users?.email },
                  { label: 'Telefone', value: detailCustomer?.phone },
                  { label: 'CPF', value: detailCustomer?.cpf },
                  { label: 'Nascimento', value: formatDate(detailCustomer?.date_of_birth) },
                  { label: 'Cidade/Estado', value: [detailCustomer?.city, detailCustomer?.province].filter(Boolean).join(' / ') },
                  { label: 'Conta', value: detailCustomer?.users?.is_active ? 'Ativa' : 'Inativa' },
                  { label: 'Cliente desde', value: formatDate(detailCustomer?.created_at) },
                ]}
              />
              {detailCustomer?.notes && (
                <div className="rounded-lg border border-gray-100 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Observacoes</p>
                  <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{detailCustomer.notes}</p>
                </div>
              )}
            </DetailSection>

            <DetailSection icon={CalendarCheck} title="Agendamentos">
              {detail.appointments.length === 0 ? (
                <EmptyDetail>Nenhum agendamento para este cliente.</EmptyDetail>
              ) : (
                <div className="space-y-2">
                  {detail.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-lg border border-gray-100 px-3 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{appointment.services?.name || 'Servico'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {appointment.professionals?.name || 'Profissional nao informado'} - {formatDateTime(appointment.start_time)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 w-fit">
                          {statusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                        <span>Valor: {formatCurrency(appointment.total_price ?? appointment.services?.price)}</span>
                        <span>Pagamento: {valueOrFallback(appointment.payment_method)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            <DetailSection icon={Crown} title="Plano">
              {detail.subscriptions.length === 0 ? (
                <EmptyDetail>Nenhum plano ou assinatura vinculada.</EmptyDetail>
              ) : (
                <div className="space-y-2">
                  {detail.subscriptions.map((subscription) => (
                    <div key={subscription.id} className="rounded-lg border border-gray-100 px-3 py-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{subscription.plans?.name || 'Plano'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatCurrency(subscription.plans?.price)} - {valueOrFallback(subscription.plans?.billing_interval)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 w-fit">
                          {statusLabel(subscription.status)}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                        <span>Inicio: {formatDate(subscription.started_at)}</span>
                        <span>Expira: {formatDate(subscription.expires_at)}</span>
                        <span>Desconto: {Number(subscription.plans?.discount_percent || 0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            <DetailSection icon={CreditCard} title="Pagamentos">
              {detail.payments.length === 0 ? (
                <EmptyDetail>Nenhum pagamento encontrado.</EmptyDetail>
              ) : (
                <div className="space-y-2">
                  {detail.payments.map((payment) => (
                    <div key={`${payment.source}-${payment.id}`} className="rounded-lg border border-gray-100 px-3 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{payment.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {payment.source === 'appointment' ? 'Agendamento' : 'Plano'} - {formatDateTime(payment.date)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-gray-400">{statusLabel(payment.status)} - {valueOrFallback(payment.method)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            <DetailSection icon={BadgePercent} title="Descontos">
              {detail.discounts.length === 0 ? (
                <EmptyDetail>Nenhum desconto ativo.</EmptyDetail>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detail.discounts.map((discount) => (
                    <div key={discount.id} className="rounded-lg border border-gray-100 px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">
                          {discount.type === 'percent' ? discount.label : discount.service}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{discount.plan}</p>
                      <p className="text-sm font-bold text-gray-900 mt-2">
                        {discount.type === 'percent' ? `${discount.value}%` : formatCurrency(discount.value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </DetailSection>

            <DetailSection icon={Mail} title="Contato rapido">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={`mailto:${detailCustomer?.users?.email || ''}`}
                  className="rounded-lg border border-gray-100 px-3 py-3 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Mail size={15} className="text-gray-400" />
                  {detailCustomer?.users?.email || 'E-mail nao informado'}
                </a>
                <a
                  href={detailCustomer?.phone ? `tel:${detailCustomer.phone}` : undefined}
                  className="rounded-lg border border-gray-100 px-3 py-3 flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Phone size={15} className="text-gray-400" />
                  {detailCustomer?.phone || 'Telefone nao informado'}
                </a>
              </div>
            </DetailSection>
          </div>
        ) : (
          <EmptyDetail>Nao foi possivel carregar os detalhes.</EmptyDetail>
        )}
      </Modal>
    </div>
  );
}
