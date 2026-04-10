import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, Check, Percent, Crown } from 'lucide-react';
import BookingShowcaseCard from '@/components/branding/BookingShowcaseCard';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { plansService, subscriptionsService } from '@/services/plans.service';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { getBrandingTheme } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const WEEKDAY_LABELS = {
  sunday: 'Dom', monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
  thursday: 'Qui', friday: 'Sex', saturday: 'Sáb',
};

const INTERVAL_LABEL = {
  monthly: 'mês', quarterly: 'trimestre', annual: 'ano',
};

export default function EstablishmentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [establishment, setEstablishment] = useState(null);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [plans, setPlans] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe flow
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const estab = await publicEstablishmentsService.getBySlug(slug);
        setEstablishment(estab);

        const [svcData, profData, hoursData, plansData] = await Promise.all([
          publicEstablishmentsService.getServices(estab.id),
          publicEstablishmentsService.getProfessionals(estab.id),
          publicEstablishmentsService.getBusinessHours(estab.id),
          plansService.getPublicPlans(slug).catch(() => []),
        ]);

        setServices(svcData);
        setProfessionals(profData);
        setBusinessHours(hoursData);
        setPlans(plansData);

        // If logged in as customer, load their subscriptions
        if (isAuthenticated && user?.role === 'customer') {
          const subs = await subscriptionsService.getMine().catch(() => []);
          setMySubscriptions(subs);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Estabelecimento não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, isAuthenticated]);

  const handleSubscribe = async () => {
    if (!confirmPlan) return;
    if (!isAuthenticated || user?.role !== 'customer') {
      toast.error('Faça login como cliente para assinar um plano.');
      navigate(`/${slug}/login`, { state: { from: `/${slug}/planos` } });
      return;
    }
    setSubscribing(true);
    try {
      await subscriptionsService.subscribe(confirmPlan.id);
      toast.success(`Plano "${confirmPlan.name}" assinado!`);
      setConfirmPlan(null);
      const subs = await subscriptionsService.getMine().catch(() => []);
      setMySubscriptions(subs);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  const isSubscribed = (planId) =>
    mySubscriptions.some((s) => s.plan_id === planId && s.status === 'active');

  const hasActiveSubHere = mySubscriptions.some(
    (s) => s.establishment_id === establishment?.id && s.status === 'active'
  );

  const branding = getBrandingTheme(establishment);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <BookingShowcaseCard
        establishment={establishment}
        theme={branding}
        eyebrow="Agenda online personalizada"
        details={
          <div>
            {establishment.description ? (
              <p className="text-gray-500 leading-7">{establishment.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              {establishment.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {establishment.address}
                </span>
              )}
              {establishment.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {establishment.phone}
                </span>
              )}
            </div>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate(`/${slug}/agendar`)}
              style={{
                backgroundColor: branding.primaryColor,
                color: branding.primaryTextColor,
              }}
            >
              Agendar agora
            </Button>
            <Link
              to={`/${slug}/planos`}
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium border transition-colors"
              style={{
                borderColor: branding.subtleBorder,
                color: branding.accentColor,
                backgroundColor: branding.softAccent,
              }}
            >
              Ver planos
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Services + Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Serviços</h2>
            <div className="space-y-2">
              {services.map((svc) => (
                <Card
                  key={svc.id}
                  className="flex items-center justify-between p-4"
                  style={{ borderColor: branding.subtleBorder }}
                >
                  <div>
                    <p className="font-medium text-gray-900">{svc.name}</p>
                    {svc.description && <p className="text-sm text-gray-400">{svc.description}</p>}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} /> {svc.duration_minutes} min
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 ml-4 shrink-0">
                    {Number(svc.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Plans / Clube do Assinante */}
          {plans.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Star size={20} className="text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-900">Clube do Assinante</h2>
              </div>
              {hasActiveSubHere && (
                <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
                  <Crown size={15} />
                  Você já é assinante deste estabelecimento!
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.map((plan) => {
                  const active = isSubscribed(plan.id);
                  return (
                    <Card
                      key={plan.id}
                      className={active ? 'border-amber-300 bg-amber-50/30' : ''}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-900">{plan.name}</p>
                        {active && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Ativo
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                      )}
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        R$ {Number(plan.price).toFixed(2).replace('.', ',')}
                        <span className="text-sm font-normal text-gray-400 ml-1">
                          /{INTERVAL_LABEL[plan.billing_interval]}
                        </span>
                      </p>
                      <ul className="space-y-1.5 mb-4">
                        {plan.discount_percent > 0 && (
                          <li className="flex items-center gap-2 text-sm text-gray-600">
                            <Percent size={13} className="text-green-500 shrink-0" />
                            {plan.discount_percent}% de desconto nos serviços
                          </li>
                        )}
                        {(plan.benefits || []).map((b, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <Check size={13} className="text-green-500 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                      {!active && (
                        <Button
                          className="w-full"
                          icon={Star}
                          onClick={() => setConfirmPlan(plan)}
                        >
                          Assinar plano
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Profissionais</h3>
            <div className="space-y-2">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-full border flex items-center justify-center text-sm font-semibold"
                    style={{
                      backgroundColor: branding.softPrimary,
                      borderColor: branding.subtleBorder,
                      color: branding.primaryColor,
                    }}
                  >
                    {prof.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{prof.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Horários</h3>
            <div className="space-y-1.5">
              {businessHours.map((bh) => (
                <div key={bh.weekday} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{WEEKDAY_LABELS[bh.weekday]}</span>
                  {bh.is_open ? (
                    <span className="text-gray-700">{bh.start_time.slice(0,5)} — {bh.end_time.slice(0,5)}</span>
                  ) : (
                    <span className="text-gray-300">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm subscribe modal */}
      <Modal
        isOpen={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        title="Assinar plano"
      >
        <p className="text-gray-600 mb-2">
          Você está assinando o plano <strong>{confirmPlan?.name}</strong> de{' '}
          <strong>{establishment?.name}</strong>.
        </p>
        <p className="text-gray-600 mb-6">
          Valor:{' '}
          <strong>
            R$ {Number(confirmPlan?.price || 0).toFixed(2).replace('.', ',')}
            {' '}/{' '}
            {INTERVAL_LABEL[confirmPlan?.billing_interval]}
          </strong>
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmPlan(null)}>
            Cancelar
          </Button>
          <Button loading={subscribing} onClick={handleSubscribe} icon={Star}>
            Confirmar assinatura
          </Button>
        </div>
      </Modal>
    </div>
  );
}
