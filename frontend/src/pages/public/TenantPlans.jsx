import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Check, Crown, Percent, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { plansService, subscriptionsService } from '@/services/plans.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const INTERVAL_LABEL = {
  monthly: 'mes',
  quarterly: 'trimestre',
  annual: 'ano',
};

export default function TenantPlans() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { establishment, branding } = useOutletContext();
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansData, subscriptionsData] = await Promise.all([
          plansService.getPublicPlans(slug),
          isAuthenticated && user?.role === 'customer' ? subscriptionsService.getMine().catch(() => []) : [],
        ]);
        setPlans(plansData);
        setSubscriptions(subscriptionsData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, isAuthenticated, user]);

  const handleSubscribe = async () => {
    if (!confirmPlan) return;

    if (!isAuthenticated || user?.role !== 'customer') {
      navigate(`/${slug}/login`, { state: { from: `/${slug}/planos` } });
      return;
    }

    setSubscribing(true);
    try {
      await subscriptionsService.subscribe(confirmPlan.id);
      const subs = await subscriptionsService.getMine().catch(() => []);
      setSubscriptions(subs);
      toast.success(`Plano "${confirmPlan.name}" assinado!`);
      setConfirmPlan(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  const isSubscribed = (planId) =>
    subscriptions.some((subscription) => subscription.plan_id === planId && subscription.status === 'active');

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-8">
      <div
        className="rounded-[28px] p-[1px]"
        style={{
          background: `linear-gradient(135deg, ${branding.accentColor} 0%, ${branding.primaryColor} 100%)`,
        }}
      >
        <div className="rounded-[27px] bg-white p-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em]" style={{ color: branding.accentColor }}>
              Clube do assinante
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              Planos de {establishment?.name}
            </h1>
            <p className="text-gray-500 mt-3 leading-7">
              Escolha o plano que combina com a rotina dos seus atendimentos e mantenha tudo dentro do sistema da empresa.
            </p>
            <div className="flex gap-3 mt-6 flex-wrap">
              <Button
                onClick={() => navigate(`/${slug}/agendar`)}
                style={{
                  backgroundColor: branding.primaryColor,
                  color: branding.primaryTextColor,
                }}
              >
                Agendar agora
              </Button>
              {!isAuthenticated && (
                <Link
                  to={`/${slug}/login`}
                  state={{ from: `/${slug}/planos` }}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium border transition-colors"
                  style={{
                    borderColor: branding.subtleBorder,
                    color: branding.accentColor,
                    backgroundColor: branding.softAccent,
                  }}
                >
                  Entrar para assinar
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {plans.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-gray-900">Nenhum plano ativo</p>
            <p className="text-sm text-gray-500 mt-2">
              Este estabelecimento ainda nao publicou planos para clientes.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const active = isSubscribed(plan.id);
            return (
              <Card
                key={plan.id}
                className={`h-full flex flex-col ${active ? 'border-amber-300 bg-amber-50/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{plan.name}</p>
                    {plan.description && (
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                    )}
                  </div>
                  {active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5">
                      <Crown size={10} />
                      Ativo
                    </span>
                  )}
                </div>

                <p className="text-3xl font-bold text-gray-900 mt-5">
                  R$ {Number(plan.price).toFixed(2).replace('.', ',')}
                  <span className="text-sm font-normal text-gray-400 ml-1">/{INTERVAL_LABEL[plan.billing_interval]}</span>
                </p>

                <ul className="space-y-2 mt-5 flex-1">
                  {plan.discount_percent > 0 && (
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Percent size={13} className="text-green-500 shrink-0" />
                      {plan.discount_percent}% de desconto nos servicos
                    </li>
                  )}
                  {(plan.benefits || []).map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={13} className="text-green-500 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {!active && (
                  <Button
                    className="w-full mt-6"
                    icon={Star}
                    onClick={() => setConfirmPlan(plan)}
                    style={{
                      backgroundColor: branding.primaryColor,
                      color: branding.primaryTextColor,
                    }}
                  >
                    Assinar plano
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        title="Confirmar assinatura"
      >
        <p className="text-gray-600 mb-3">
          Voce esta assinando o plano <strong>{confirmPlan?.name}</strong> de <strong>{establishment?.name}</strong>.
        </p>
        <p className="text-lg font-semibold text-gray-900 mb-6">
          R$ {Number(confirmPlan?.price || 0).toFixed(2).replace('.', ',')}
          <span className="text-sm font-normal text-gray-400 ml-1">
            / {INTERVAL_LABEL[confirmPlan?.billing_interval]}
          </span>
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmPlan(null)}>
            Cancelar
          </Button>
          <Button
            loading={subscribing}
            onClick={handleSubscribe}
            style={{
              backgroundColor: branding.primaryColor,
              color: branding.primaryTextColor,
            }}
          >
            Confirmar assinatura
          </Button>
        </div>
      </Modal>
    </div>
  );
}
