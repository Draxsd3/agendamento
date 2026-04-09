import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { ArrowRight, Check, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { subscriptionsService } from '@/services/plans.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const INTERVAL_FULL = {
  monthly: 'mes',
  quarterly: 'trimestre',
  annual: 'ano',
};

export default function CustomerPlan() {
  const { slug } = useParams();
  const outletContext = useOutletContext();
  const branding = outletContext?.branding || null;
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionsService.getMine()
      .then(setSubscriptions)
      .catch(() => toast.error('Erro ao carregar planos.'))
      .finally(() => setLoading(false));
  }, []);

  const activeSubs = subscriptions.filter((subscription) => subscription.status === 'active');
  const tenantActiveSubs = slug
    ? activeSubs.filter((subscription) => subscription.establishments?.slug === slug)
    : activeSubs;
  const basePath = slug ? `/${slug}/cliente` : '/minha-conta';

  if (loading) return <LoadingSpinner />;

  if (tenantActiveSubs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
        <p className="font-semibold text-gray-700">Sem plano ativo</p>
        <p className="mt-2 text-sm text-gray-400">
          Acesse o{' '}
          <Link to={`${basePath}/clube`} className="font-medium underline" style={{ color: branding?.primaryColor || '#111827' }}>
            Clube do Assinante
          </Link>{' '}
          para ver os planos disponiveis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tenantActiveSubs.map((subscription, index) => {
        const price = Number(subscription.plans?.price || 0);
        const interval = subscription.plans?.billing_interval;
        const expires = subscription.expires_at
          ? format(new Date(subscription.expires_at), 'dd/MM/yyyy', { locale: ptBR })
          : 'Indeterminado';

        return (
          <div
            key={subscription.id}
            className="overflow-hidden rounded-lg border bg-white"
            style={{ borderColor: branding?.subtleBorder || '#E5E7EB' }}
          >
            {index === 0 ? (
              <div className="px-5 pt-4">
                <span
                  className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: branding?.primaryColor || '#2563EB',
                    color: branding?.primaryTextColor || '#FFFFFF',
                  }}
                >
                  Mais vendido
                </span>
              </div>
            ) : null}

            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{subscription.plans?.name}</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Tempo de vigencia: <span className="font-semibold text-gray-700">{expires}</span>
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">R$ {price.toFixed(2).replace('.', ',')}</p>
                <p className="text-sm text-gray-400">Por {INTERVAL_FULL[interval] || interval}</p>
              </div>

              {(subscription.plans?.benefits || []).length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Beneficios</p>
                  <ul className="space-y-1.5">
                    {subscription.plans.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} className="shrink-0 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {subscription.plans?.discount_percent > 0 ? (
                <p className="text-sm font-medium text-green-600">
                  {subscription.plans.discount_percent}% de desconto nos servicos
                </p>
              ) : null}

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <Link
                  to={`${basePath}/clube`}
                  className="flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: branding?.primaryColor || '#1F2937' }}
                >
                  Confira as vantagens <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-semibold transition-colors"
                  style={{ color: branding?.accentColor || '#1F2937' }}
                >
                  Termos de uso <FileText size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
