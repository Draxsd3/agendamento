import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Star, Users, Check, X, Crown } from 'lucide-react';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { plansService } from '@/services/plans.service';
import { servicesService } from '@/services/services.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const BILLING_TYPE_OPTIONS = [
  { value: 'manual',  label: 'Manual', desc: 'Voce confirma o pagamento manualmente' },
  { value: 'asaas',   label: 'Asaas', desc: 'Cliente paga via checkout recorrente Asaas' },
];

const PAYMENT_STATUS_LABEL = {
  awaiting_confirmation: 'Aguardando confirmacao',
  checkout_created: 'Checkout gerado',
  checkout_paid: 'Checkout pago',
  manual_confirmed: 'Confirmado manualmente',
  received: 'Recebido',
  confirmed: 'Confirmado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

const EMPTY_FORM = {
  name: '', description: '', price: '', billing_interval: 'monthly',
  max_appointments: '', discount_percent: '0', benefits: '', is_active: true,
  billing_type: 'manual',
};
const INTERVAL_OPTIONS = [
  { value: 'monthly',   label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'annual',    label: 'Anual' },
];
const INTERVAL_LABEL = { monthly: 'Mensal', quarterly: 'Trimestral', annual: 'Anual' };
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function AdminPlans() {
  const ctx      = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary  = branding.primaryColor || '#111827';
  const accent   = branding.accentColor  || '#111827';

  const [plans,       setPlans]       = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState('plans');
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [planServices,  setPlanServices]  = useState([]);
  const [addServiceId,  setAddServiceId]  = useState('');
  const [addServicePrice, setAddServicePrice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, s, svc] = await Promise.all([
        plansService.getAll(),
        plansService.getSubscribers(),
        servicesService.getAll(),
      ]);
      setPlans(p); setSubscribers(s); setAllServices(svc);
    } catch (err) { toast.error(getErrorMessage(err, 'Erro ao carregar planos.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const loadPlanServices = async (planId) => {
    try { setPlanServices(await plansService.getPlanServices(planId)); }
    catch { setPlanServices([]); }
  };

  const handleAddPlanService = async () => {
    if (!addServiceId || typeof modal !== 'object') return;
    try {
      await plansService.addPlanService(modal.id, addServiceId, addServicePrice !== '' ? Number(addServicePrice) : null);
      setAddServiceId(''); setAddServicePrice('');
      loadPlanServices(modal.id);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleRemovePlanService = async (serviceId) => {
    if (typeof modal !== 'object') return;
    try { await plansService.removePlanService(modal.id, serviceId); loadPlanServices(modal.id); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const openCreate = () => { setPlanServices([]); setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (plan) => {
    loadPlanServices(plan.id);
    setForm({
      name: plan.name, description: plan.description || '',
      price: plan.price, billing_interval: plan.billing_interval,
      max_appointments: plan.max_appointments || '',
      discount_percent: plan.discount_percent || '0',
      benefits: (plan.benefits || []).join('\n'),
      is_active: plan.is_active,
      billing_type: plan.billing_type || 'manual',
    });
    setModal(plan);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price:            Number(form.price),
        discount_percent: Number(form.discount_percent),
        max_appointments: form.max_appointments ? Number(form.max_appointments) : null,
        benefits:         form.benefits ? form.benefits.split('\n').filter(Boolean) : [],
      };
      if (modal === 'create') { await plansService.create(payload); toast.success('Plano criado!'); }
      else                    { await plansService.update(modal.id, payload); toast.success('Plano atualizado!'); }
      setModal(null); load();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await plansService.delete(deleteTarget.id); toast.success('Plano removido.'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleActivate = async (subId) => {
    try { await plansService.activateSubscription(subId); toast.success('Assinatura ativada!'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleAdminCancel = async (subId) => {
    try { await plansService.cancelSubscription(subId); toast.success('Assinatura cancelada.'); load(); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleGenerateCheckout = async (subId) => {
    try {
      const result = await plansService.generateCheckout(subId);
      if (result.checkout?.url) window.open(result.checkout.url, '_blank');
      toast.success('Checkout gerado!');
      load();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  if (loading) return <LoadingSpinner />;

  const activeCount   = subscribers.filter((s) => s.status === 'active').length;
  const pendingCount  = subscribers.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Clube do Assinante</h1>
          <p className="text-sm text-gray-400 mt-0.5">Crie planos para fidelizar seus clientes</p>
        </div>
        {tab === 'plans' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            <Plus size={16} /> Novo plano
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#f59e0b18' }}>
            <Star size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
            <p className="text-xs text-gray-500">Planos</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: primary + '18' }}>
            <Users size={18} style={{ color: primary }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-500">Assinantes ativos</p>
          </div>
        </div>
        {pendingCount > 0 && (
          <div className="bg-white rounded-xl border border-amber-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50">
              <Users size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
          </div>
        )}
      </div>

      {/* tabs */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
        {[{ v: 'plans', l: 'Planos' }, { v: 'subscribers', l: 'Assinantes' }].map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* plans grid */}
      {tab === 'plans' && (
        plans.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-20 text-center">
            <Star size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum plano criado ainda</p>
            <button onClick={openCreate}
              className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}>
              Criar primeiro plano
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const subCount = subscribers.filter((s) => s.plan_id === plan.id && s.status === 'active').length;
              return (
                <div key={plan.id}
                  className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col ${!plan.is_active ? 'opacity-60' : ''}`}
                >
                  {/* colored top bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: primary }} />

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{plan.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{INTERVAL_LABEL[plan.billing_interval]}</p>
                      </div>
                      {!plan.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativo</span>
                      )}
                    </div>

                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        {fmt(plan.price)}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">/mês</span>
                    </div>

                    {plan.description && (
                      <p className="text-sm text-gray-500 -mt-1">{plan.description}</p>
                    )}

                    <div className="space-y-1.5 flex-1">
                      {plan.discount_percent > 0 && (
                        <p className="text-xs text-green-700 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check size={10} strokeWidth={3} />
                          </span>
                          {plan.discount_percent}% de desconto nos serviços
                        </p>
                      )}
                      {(plan.benefits || []).map((b, i) => (
                        <p key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: primary + '18' }}>
                            <Check size={10} strokeWidth={3} style={{ color: primary }} />
                          </span>
                          {b}
                        </p>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={12} />
                        {subCount} assinante{subCount !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(plan)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(plan)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* subscribers table */}
      {tab === 'subscribers' && (
        subscribers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-20 text-center">
            <Crown size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum assinante ainda</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="hidden lg:flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-medium">
              <div className="flex-1">Cliente</div>
              <div className="w-32">Plano</div>
              <div className="w-20 text-center">Status</div>
              <div className="w-36">Pagamento</div>
              <div className="w-28 text-right">Vencimento</div>
              <div className="w-32 text-right">Acoes</div>
            </div>
            <div className="divide-y divide-gray-50">
              {subscribers.map((sub) => {
                const billingType = sub.plans?.billing_type || 'manual';
                return (
                  <div key={sub.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
                      style={{ backgroundColor: accent }}>
                      {initials(sub.customers?.users?.name || '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{sub.customers?.users?.name || '—'}</p>
                      <p className="text-xs text-gray-400 truncate">{sub.customers?.users?.email || ''}</p>
                    </div>
                    <div className="w-32 hidden lg:block">
                      <span className="text-sm text-gray-700 font-medium">{sub.plans?.name || '—'}</span>
                      <p className="text-xs text-gray-400">{billingType === 'asaas' ? 'Asaas' : 'Manual'}</p>
                    </div>
                    <div className="w-20 hidden lg:flex justify-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        sub.status === 'active' ? 'bg-green-50 text-green-700' :
                        sub.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {sub.status === 'active' ? 'Ativo' : sub.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </div>
                    <div className="w-36 hidden lg:block text-xs text-gray-500">
                      {PAYMENT_STATUS_LABEL[sub.payment_status] || sub.payment_status || '—'}
                    </div>
                    <div className="w-28 hidden lg:block text-right text-xs text-gray-400">
                      {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('pt-BR') : '—'}
                    </div>
                    <div className="w-32 hidden lg:flex justify-end gap-1.5">
                      {sub.status === 'pending' && billingType === 'manual' && (
                        <button
                          onClick={() => handleActivate(sub.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium transition-colors"
                        >
                          Ativar
                        </button>
                      )}
                      {sub.status === 'pending' && billingType === 'asaas' && sub.checkout_url && (
                        <a
                          href={sub.checkout_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                        >
                          Ver checkout
                        </a>
                      )}
                      {sub.status === 'pending' && billingType === 'asaas' && !sub.checkout_url && (
                        <button
                          onClick={() => handleGenerateCheckout(sub.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                        >
                          Gerar checkout
                        </button>
                      )}
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleAdminCancel(sub.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* Create/Edit modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Novo plano' : 'Editar plano'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Nome do plano *" value={form.name} onChange={handleChange('name')} placeholder="Ex: Plano Ouro" required />
          <Input label="Descrição" value={form.description} onChange={handleChange('description')} placeholder="Breve descrição" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Preço (R$) *" type="number" min="0" step="0.01" value={form.price} onChange={handleChange('price')} placeholder="49.90" required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cobrança</label>
              <select value={form.billing_interval} onChange={handleChange('billing_interval')} className="w-full input-base">
                {INTERVAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Desconto (%)" type="number" min="0" max="100" value={form.discount_percent} onChange={handleChange('discount_percent')} placeholder="0" />
            <Input label="Máx. agendamentos" type="number" min="1" value={form.max_appointments} onChange={handleChange('max_appointments')} placeholder="Ilimitado" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefícios (um por linha)</label>
            <textarea value={form.benefits} onChange={handleChange('benefits')} rows={3}
              placeholder="Prioridade no agendamento&#10;Acesso a horários exclusivos" className="w-full input-base resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cobrança do plano</label>
            <div className="grid grid-cols-2 gap-2">
              {BILLING_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, billing_type: opt.value }))}
                  className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    form.billing_type === opt.value
                      ? 'border-current bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400'
                  }`}
                  style={form.billing_type === opt.value ? { backgroundColor: primary, borderColor: primary } : {}}
                >
                  <p className="font-medium">{opt.label}</p>
                  <p className={`text-xs mt-0.5 ${form.billing_type === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={handleChange('is_active')} className="rounded border-gray-300" />
            Plano ativo (visível para clientes)
          </label>

          {/* Plan services — only when editing */}
          {typeof modal === 'object' && modal !== null && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-1">Serviços incluídos no plano</p>
              <p className="text-xs text-gray-400 mb-3">R$0 = gratuito · em branco = desconto do plano</p>
              {planServices.length > 0 && (
                <div className="space-y-2 mb-3">
                  {planServices.map((ps) => (
                    <div key={ps.service_id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ps.services?.name}</p>
                        <p className="text-xs text-gray-400">
                          {ps.price_override !== null
                            ? ps.price_override === 0 ? 'Grátis' : fmt(ps.price_override)
                            : `Desconto do plano (${form.discount_percent}%)`}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleRemovePlanService(ps.service_id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Serviço</label>
                  <select value={addServiceId} onChange={(e) => setAddServiceId(e.target.value)} className="w-full input-base text-sm">
                    <option value="">Selecionar...</option>
                    {allServices.filter((s) => !planServices.some((ps) => ps.service_id === s.id))
                      .map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500 mb-1 block">Preço (R$)</label>
                  <input type="number" min="0" step="0.01" value={addServicePrice}
                    onChange={(e) => setAddServicePrice(e.target.value)}
                    placeholder="0,00" className="w-full input-base text-sm" />
                </div>
                <button type="button" onClick={handleAddPlanService} disabled={!addServiceId}
                  className="px-3 py-2.5 rounded-lg text-white text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primary }}>
                  <Plus size={15} />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}>
              {saving ? 'Salvando...' : modal === 'create' ? 'Criar plano' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remover plano">
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja remover o plano <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Remover</Button>
        </div>
      </Modal>
    </div>
  );
}
