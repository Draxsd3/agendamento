import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import {
  Star, Check, X, Crown, Percent, Search,
  Building2, ChevronDown, ChevronUp,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { subscriptionsService, plansService } from '@/services/plans.service';
import { customersService } from '@/services/customers.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const INTERVAL_LABEL = { monthly: 'mes', quarterly: 'trimestre', annual: 'ano' };

function PlanItem({ plan, isActive, branding, onSubscribe }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 ${
        isActive ? 'border-amber-300 bg-amber-50/30' : 'bg-white'
      }`}
      style={!isActive ? { borderColor: branding?.subtleBorder || '#E5E7EB' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{plan.name}</p>
          {plan.description ? <p className="mt-0.5 text-xs text-gray-400">{plan.description}</p> : null}
        </div>
        {isActive ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <Crown size={10} /> Ativo
          </span>
        ) : null}
      </div>

      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-gray-900">
          R$ {Number(plan.price).toFixed(2).replace('.', ',')}
        </span>
        <span className="mb-0.5 text-xs text-gray-400">/{INTERVAL_LABEL[plan.billing_interval]}</span>
      </div>

      <ul className="space-y-1">
        {plan.discount_percent > 0 ? (
          <li className="flex items-center gap-1.5 text-xs text-gray-600">
            <Percent size={11} className="shrink-0 text-green-500" />
            {plan.discount_percent}% de desconto nos servicos
          </li>
        ) : null}
        {(plan.benefits || []).map((benefit, index) => (
          <li key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
            <Check size={11} className="shrink-0 text-green-500" /> {benefit}
          </li>
        ))}
      </ul>

      {!isActive ? (
        <Button
          size="sm"
          icon={Star}
          onClick={() => onSubscribe(plan)}
          className="w-full justify-center"
          style={{
            backgroundColor: branding?.primaryColor || '#2563EB',
            color: branding?.primaryTextColor || '#FFFFFF',
          }}
        >
          Assinar
        </Button>
      ) : null}
    </div>
  );
}

function EstablishmentSection({ estab, subscriptions, branding, onSubscribe }) {
  const [open, setOpen] = useState(true);
  const activeSub = subscriptions.find((subscription) => subscription.establishment_id === estab.id && subscription.status === 'active');

  return (
    <Card className="overflow-hidden p-0">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-bold"
            style={{
              backgroundColor: branding?.softPrimary || '#EFF6FF',
              borderColor: branding?.subtleBorder || '#DBEAFE',
              color: branding?.primaryColor || '#2563EB',
            }}
          >
            {estab.name.charAt(0)}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate font-semibold text-gray-900">{estab.name}</p>
            {activeSub ? (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <Crown size={10} /> Assinante ativo
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {estab.plans.length > 0 ? (
            <span className="text-xs text-gray-400">
              {estab.plans.length} plano{estab.plans.length !== 1 ? 's' : ''}
            </span>
          ) : null}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open ? (
        <div className="border-t border-gray-100 px-5 pb-5">
          {estab.plans.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Este estabelecimento nao possui planos ativos.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
              {estab.plans.map((plan) => (
                <PlanItem
                  key={plan.id}
                  plan={plan}
                  isActive={subscriptions.some((subscription) => subscription.plan_id === plan.id && subscription.status === 'active')}
                  branding={branding}
                  onSubscribe={onSubscribe}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export default function CustomerClub() {
  const { slug } = useParams();
  const outletContext = useOutletContext();
  const branding = outletContext?.branding || null;
  const [subscriptions, setSubscriptions] = useState([]);
  const [myEstablishments, setMyEstablishments] = useState([]);
  const [searchEstabs, setSearchEstabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSlug, setSearchSlug] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [subscriptionData, establishmentData] = await Promise.all([
        subscriptionsService.getMine(),
        customersService.getMyEstablishments(),
      ]);
      setSubscriptions(subscriptionData);
      setMyEstablishments(establishmentData);
    } catch {
      toast.error(getErrorMessage(err, 'Erro ao carregar dados.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSearch = async () => {
    if (!searchSlug.trim()) return;
    setSearchLoading(true);
    try {
      const plans = await plansService.getPublicPlans(searchSlug.trim());
      if (plans.length === 0) {
        toast('Nenhum plano encontrado para este slug.', { icon: 'i' });
        setSearchEstabs([]);
      } else {
        setSearchEstabs([{
          id: plans[0].establishment_id,
          name: searchSlug,
          slug: searchSlug,
          plans,
        }]);
      }
    } catch {
      toast.error(getErrorMessage(err, 'Estabelecimento não encontrado.'));
      setSearchEstabs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!confirmPlan) return;
    setSubscribing(true);
    try {
      await subscriptionsService.subscribe(confirmPlan.id);
      toast.success(`Plano "${confirmPlan.name}" assinado!`);
      setConfirmPlan(null);
      setSearchEstabs([]);
      setSearchSlug('');
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await subscriptionsService.cancel(cancelTarget.id);
      toast.success('Assinatura cancelada.');
      setCancelTarget(null);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  const scopedSubscriptions = slug
    ? subscriptions.filter((subscription) => subscription.establishments?.slug === slug)
    : subscriptions;
  const scopedEstablishments = slug
    ? myEstablishments.filter((establishment) => establishment.slug === slug)
    : myEstablishments;
  const activeSubs = scopedSubscriptions.filter((subscription) => subscription.status === 'active');
  const inactiveSubs = scopedSubscriptions.filter((subscription) => subscription.status !== 'active');

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-900">
          <Star size={24} style={{ color: branding?.primaryColor || '#F59E0B' }} />
          Clube do Assinante
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Assine planos dos estabelecimentos que voce frequenta e aproveite beneficios exclusivos.
        </p>
      </div>

      {activeSubs.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Suas assinaturas ativas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeSubs.map((subscription) => (
              <Card key={subscription.id} className="flex items-start gap-3 border-amber-200 bg-amber-50/20">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Crown size={16} className="text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{subscription.plans?.name}</p>
                  <p className="truncate text-xs text-gray-500">{subscription.establishments?.name}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Valida ate {subscription.expires_at ? format(new Date(subscription.expires_at), 'dd/MM/yyyy', { locale: ptBR }) : 'Indefinido'}
                  </p>
                </div>
                <button
                  onClick={() => setCancelTarget(subscription)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {scopedEstablishments.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {slug ? 'Planos deste estabelecimento' : 'Estabelecimentos que voce frequenta'}
          </h2>
          <div className="space-y-3">
            {scopedEstablishments.map((establishment) => (
              <EstablishmentSection
                key={establishment.id}
                estab={establishment}
                subscriptions={scopedSubscriptions}
                branding={branding}
                onSubscribe={setConfirmPlan}
              />
            ))}
          </div>
        </section>
      ) : null}

      {scopedEstablishments.length === 0 && activeSubs.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Building2 size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Nenhum estabelecimento encontrado</p>
            <p className="mt-1 text-sm text-gray-400">
              Realize um agendamento para vincular um estabelecimento a sua conta.
            </p>
          </div>
        </Card>
      ) : null}

      {!slug ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Buscar outro estabelecimento
          </h2>
          <Card>
            <div className="mb-1 flex gap-2">
              <Input
                value={searchSlug}
                onChange={(event) => setSearchSlug(event.target.value)}
                placeholder="Slug do estabelecimento (ex: barbearia-imigrantes)"
                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              />
              <Button
                icon={Search}
                onClick={handleSearch}
                loading={searchLoading}
                variant="secondary"
                className="shrink-0"
                style={{
                  borderColor: branding?.subtleBorder || '#D1D5DB',
                  color: branding?.accentColor || '#374151',
                  backgroundColor: branding?.softAccent || '#FFFFFF',
                }}
              >
                Buscar
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              O slug fica na URL da pagina publica: /<strong>slug</strong>
            </p>

            {searchEstabs.length > 0 ? (
              <div className="mt-4 space-y-3">
                {searchEstabs.map((establishment) => (
                  <EstablishmentSection
                    key={establishment.id}
                    estab={establishment}
                    subscriptions={subscriptions}
                    branding={branding}
                    onSubscribe={setConfirmPlan}
                  />
                ))}
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      {inactiveSubs.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Historico de assinaturas
          </h2>
          <div className="space-y-2">
            {inactiveSubs.map((subscription) => (
              <Card key={subscription.id} className="opacity-60">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{subscription.plans?.name}</p>
                    <p className="truncate text-sm text-gray-500">{subscription.establishments?.name}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      subscription.status === 'cancelled'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {subscription.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <Modal isOpen={!!confirmPlan} onClose={() => setConfirmPlan(null)} title="Confirmar assinatura">
        <p className="mb-2 text-gray-600">
          Voce esta assinando o plano <strong>{confirmPlan?.name}</strong>.
        </p>
        <p className="mb-6 text-lg font-semibold text-gray-800">
          R$ {Number(confirmPlan?.price || 0).toFixed(2).replace('.', ',')}
          <span className="ml-1 text-sm font-normal text-gray-400">
            / {INTERVAL_LABEL[confirmPlan?.billing_interval]}
          </span>
        </p>
        {(confirmPlan?.benefits || []).length > 0 ? (
          <ul className="mb-6 space-y-1">
            {confirmPlan.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <Check size={13} className="text-green-500" /> {benefit}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmPlan(null)}>Cancelar</Button>
          <Button
            loading={subscribing}
            onClick={handleSubscribe}
            icon={Star}
            style={{
              backgroundColor: branding?.primaryColor || '#2563EB',
              color: branding?.primaryTextColor || '#FFFFFF',
            }}
          >
            Confirmar
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar assinatura">
        <p className="mb-6 text-gray-600">
          Deseja cancelar a assinatura do plano <strong>{cancelTarget?.plans?.name}</strong>?
          Esta acao nao pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelTarget(null)}>Voltar</Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>
            Cancelar assinatura
          </Button>
        </div>
      </Modal>
    </div>
  );
}
