import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Briefcase, User, Plus, ArrowRight, Crown } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { appointmentsService } from '@/services/appointments.service';
import { subscriptionsService } from '@/services/plans.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerDashboard() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const establishment = outletContext?.establishment || null;
  const branding = outletContext?.branding || null;

  const [appointments, setAppointments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentsService.getMyAppointments(),
      subscriptionsService.getMine().catch(() => []),
    ]).then(([appts, subs]) => {
      setAppointments(appts);
      setSubscriptions(subs);
    }).finally(() => setLoading(false));
  }, []);

  const basePath = slug ? `/${slug}/cliente` : '/minha-conta';

  const upcoming = appointments
    .filter((appointment) => {
      const isFuture = new Date(appointment.start_time) >= new Date() && appointment.status !== 'cancelled';
      if (!slug) return isFuture;
      return isFuture && appointment.establishments?.slug === slug;
    })
    .sort((left, right) => new Date(left.start_time) - new Date(right.start_time));

  const activeSub = subscriptions.find((subscription) => {
    if (subscription.status !== 'active') return false;
    if (!slug) return true;
    return subscription.establishments?.slug === slug;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">
          Ola, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: branding?.primaryColor || '#9CA3AF' }}>
          {establishment?.name || 'Area do cliente'}
        </p>
      </div>

      {activeSub ? (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={15} className="text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Seu plano</span>
          </div>
          <p className="font-bold text-gray-900 text-base">{activeSub.plans?.name}</p>
          <p className="text-sm text-gray-500 mt-1">
            Voce esta aproveitando as vantagens do {activeSub.plans?.name}
          </p>
          <Link
            to={`${basePath}/plano`}
            className="inline-flex items-center gap-1 text-sm font-medium mt-4 transition-colors"
            style={{ color: branding?.primaryColor || '#374151' }}
          >
            Detalhes sobre o plano <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div
          className="rounded-lg p-5 flex items-center justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${branding?.accentColor || '#0F172A'} 0%, ${branding?.primaryColor || '#2563EB'} 100%)`,
          }}
        >
          <div>
            <p className="text-white font-bold text-base">Conheca o Clube do assinante</p>
            <p className="text-white/75 text-sm mt-0.5">e pegue seu cupom com vantagens</p>
          </div>
          <Link
            to={`${basePath}/clube`}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold rounded px-4 py-2 transition-colors"
            style={{
              backgroundColor: branding?.primaryTextColor || '#FFFFFF',
              color: branding?.accentColor || '#0F172A',
            }}
          >
            Ver <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {activeSub && (
        <Link
          to={`${basePath}/clube`}
          className="flex items-center justify-between gap-4 rounded-lg p-5 transition-colors"
          style={{
            background: `linear-gradient(135deg, ${branding?.accentColor || '#0F172A'} 0%, ${branding?.primaryColor || '#2563EB'} 100%)`,
          }}
        >
          <div>
            <p className="text-white font-bold text-base">Conheca o Clube do assinante</p>
            <p className="text-white/75 text-sm mt-0.5">e pegue seu cupom com vantagens</p>
          </div>
          <ArrowRight size={18} className="text-white/75 shrink-0" />
        </Link>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Proximos agendamentos</h2>
          <Link
            to={`${basePath}/agendamentos`}
            className="text-sm font-medium"
            style={{ color: branding?.primaryColor || '#6B7280' }}
          >
            Ver tudo
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-sm">Nenhum agendamento futuro.</p>
            {slug && (
              <Link
                to={`/${slug}/agendar`}
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: branding?.primaryColor || '#374151' }}
              >
                Agendar agora -&gt;
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 3).map((appointment) => {
              const date = new Date(appointment.start_time);
              const dateLabel = format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
              const price = Number(appointment.total_price ?? appointment.services?.price ?? 0);

              return (
                <div
                  key={appointment.id}
                  className="bg-white border border-gray-200 rounded-lg p-5"
                >
                  <p className="text-sm font-semibold text-gray-500 mb-3 capitalize">{dateLabel}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase size={14} className="text-gray-400 shrink-0" />
                      <span className="font-medium">{appointment.services?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <span>{appointment.professionals?.name}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Total</span>
                    <span className="text-sm font-bold text-gray-900">
                      R$ {price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={() => navigate(slug ? `/${slug}/agendar` : '/')}
        className="w-full font-semibold rounded-lg py-4 flex items-center justify-center gap-2 transition-colors mt-2"
        style={{
          backgroundColor: branding?.primaryColor || '#111827',
          color: branding?.primaryTextColor || '#FFFFFF',
        }}
      >
        <Plus size={18} />
        Novo agendamento
      </button>
    </div>
  );
}
