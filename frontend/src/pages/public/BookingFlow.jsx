import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogIn, UserPlus, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { appointmentsService } from '@/services/appointments.service';
import { subscriptionsService } from '@/services/plans.service';
import ServiceSelector from '@/components/booking/ServiceSelector';
import ProfessionalSelector from '@/components/booking/ProfessionalSelector';
import DateTimeSelector from '@/components/booking/DateTimeSelector';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getBrandingTheme } from '@/utils/branding';
import toast from 'react-hot-toast';

const STEPS = ['Filial', 'Servico', 'Profissional', 'Horario', 'Confirmar'];

export default function BookingFlow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [establishment, setEstablishment] = useState(null);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [planServices, setPlanServices] = useState([]);
  const [planDiscountPercent, setPlanDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [step, setStep] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const foundEstablishment = await publicEstablishmentsService.getBySlug(slug);
        setEstablishment(foundEstablishment);

        const [serviceData, professionalData, branchData, subscriptions] = await Promise.all([
          publicEstablishmentsService.getServices(foundEstablishment.id),
          publicEstablishmentsService.getProfessionals(foundEstablishment.id),
          publicEstablishmentsService.getBranches(foundEstablishment.id),
          isAuthenticated && user?.role === 'customer'
            ? subscriptionsService.getMine().catch(() => [])
            : Promise.resolve([]),
        ]);

        setServices(serviceData);
        setProfessionals(professionalData);
        setBranches(branchData);

        if (branchData.length === 0) {
          setStep(1);
        }

        const activeSubscription = (subscriptions || []).find((subscription) => {
          const matchesSlug = subscription.establishments?.slug === slug;
          const matchesEstablishmentId =
            String(subscription.establishment_id || subscription.establishments?.id || subscription.plans?.establishment_id) ===
            String(foundEstablishment.id);

          return subscription.status === 'active' && (matchesSlug || matchesEstablishmentId);
        });

        setPlanServices(activeSubscription?.plans?.plan_services || []);
        setPlanDiscountPercent(Number(activeSubscription?.plans?.discount_percent || 0));
      } catch {
        toast.error('Estabelecimento nao encontrado.');
        navigate(`/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, navigate, isAuthenticated, user]);

  const branding = getBrandingTheme(establishment);

  const filteredProfessionals = (() => {
    if (!selectedService) return professionals;
    const linkedProfessionals = professionals.filter((professional) =>
      professional.professional_services?.some((professionalService) => professionalService.service_id === selectedService.id)
    );
    return linkedProfessionals.length > 0 ? linkedProfessionals : professionals;
  })();

  const resolvePrice = () => {
    if (!selectedService) return undefined;

    const planService = planServices.find((item) => String(item.service_id) === String(selectedService.id));
    if (planService) {
      if (planService.price_override !== null) {
        return Number(planService.price_override);
      }

      if (planDiscountPercent > 0) {
        return Number(selectedService.price) * (1 - planDiscountPercent / 100);
      }
    }

    if (planDiscountPercent > 0) {
      return Number(selectedService.price) * (1 - planDiscountPercent / 100);
    }

    return undefined;
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await appointmentsService.book({
        establishmentId: establishment.id,
        professionalId: selectedProfessional?.id || null,
        serviceId: selectedService.id,
        startTime: selectedDateTime.slot.start,
        branchId: selectedBranch?.id || null,
      });
      toast.success('Agendamento realizado!');
      navigate(`/${slug}/cliente`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao agendar. Tente outro horario.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: branding.subtleBorder }}>
          <div className="flex items-center gap-4 border-b p-6" style={{ borderColor: branding.subtleBorder }}>
            {establishment?.logo_url ? (
              <img
                src={establishment.logo_url}
                alt={establishment.name}
                className="h-14 w-14 rounded-lg border object-cover"
                style={{ borderColor: branding.subtleBorder }}
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg text-xl font-bold"
                style={{ backgroundColor: branding.softPrimary, color: branding.primaryColor }}
              >
                {establishment?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Agendamento online</p>
              <h1 className="mt-0.5 text-lg font-bold text-gray-900">{establishment?.name}</h1>
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className="mb-1 text-base font-bold text-gray-900">Faca login para agendar</h2>
            <p className="mb-6 text-sm text-gray-500">Voce precisa de uma conta de cliente para realizar agendamentos.</p>
            <div className="flex flex-col gap-3">
              <Link
                to={`/${slug}/login`}
                state={{ from: `/${slug}/agendar` }}
                className="flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
                style={{ backgroundColor: branding.primaryColor, color: branding.primaryTextColor }}
              >
                <LogIn size={16} /> Entrar
              </Link>
              <Link
                to={`/${slug}/cadastro`}
                state={{ from: `/${slug}/agendar` }}
                className="flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium"
                style={{
                  borderColor: branding.subtleBorder,
                  color: branding.accentColor,
                  backgroundColor: branding.softAccent,
                }}
              >
                <UserPlus size={16} /> Criar conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const visibleSteps = STEPS.filter((_, index) => branches.length > 0 || index > 0);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
      <div className="flex items-center gap-3 rounded-lg border bg-white p-4" style={{ borderColor: branding.subtleBorder }}>
        {establishment?.logo_url ? (
          <img
            src={establishment.logo_url}
            alt={establishment.name}
            className="h-12 w-12 shrink-0 rounded-lg border object-cover"
            style={{ borderColor: branding.subtleBorder }}
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
            style={{ backgroundColor: branding.softPrimary, color: branding.primaryColor }}
          >
            {establishment?.name?.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Agendamento</p>
          <p className="truncate font-bold text-gray-900">{establishment?.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {visibleSteps.map((label, index) => {
          const realStep = branches.length > 0 ? index : index + 1;
          const active = step === realStep;
          const done = step > realStep;

          return (
            <div key={label} className="flex items-center gap-1">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                style={done
                  ? {
                      backgroundColor: branding.primaryColor,
                      color: branding.primaryTextColor,
                    }
                  : active
                    ? {
                        backgroundColor: branding.softPrimary,
                        color: branding.accentColor,
                        border: `1px solid ${branding.subtleBorder}`,
                      }
                    : {
                        backgroundColor: '#F3F4F6',
                        color: '#9CA3AF',
                      }}
              >
                {index + 1}
              </div>
              <span
                className="text-xs"
                style={{ color: active ? branding.accentColor : '#9CA3AF', fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
              {index < visibleSteps.length - 1 ? <ChevronRight size={12} style={{ color: '#D1D5DB' }} /> : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border bg-white p-5" style={{ borderColor: branding.subtleBorder }}>
        {step === 0 && branches.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
              Escolha a filial
            </p>
            <div className="space-y-2">
              {branches.map((branch) => {
                const isSelected = selectedBranch?.id === branch.id;

                return (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setStep(1);
                    }}
                    className="w-full rounded-lg border p-4 text-left transition-all"
                    style={isSelected
                      ? {
                          borderColor: branding.primaryColor,
                          backgroundColor: branding.accentColor,
                          color: branding.accentTextColor,
                        }
                      : {
                          borderColor: branding.subtleBorder,
                          backgroundColor: '#FFFFFF',
                        }}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : branding.primaryColor }}
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: isSelected ? (branding.accentTextColor || '#FFFFFF') : '#111827' }}
                        >
                          {branch.name}
                        </p>
                        {branch.address ? (
                          <p
                            className="mt-0.5 text-xs"
                            style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : '#9CA3AF' }}
                          >
                            {branch.address}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <ServiceSelector
              services={services}
              selected={selectedService}
              planServices={planServices}
              planDiscountPercent={planDiscountPercent}
              theme={branding}
              onSelect={(service) => {
                setSelectedService(service);
                setSelectedProfessional(null);
                setSelectedDateTime(null);
                setStep(2);
              }}
            />
            {branches.length > 0 ? (
              <button onClick={() => setStep(0)} className="text-xs" style={{ color: branding.primaryColor }}>
                Voltar para filiais
              </button>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <ProfessionalSelector
              professionals={filteredProfessionals}
              selected={selectedProfessional}
              showNoPreference
              theme={branding}
              onSelect={(professional) => {
                setSelectedProfessional(professional);
                setSelectedDateTime(null);
                setStep(3);
              }}
            />
            <button onClick={() => setStep(1)} className="text-xs" style={{ color: branding.primaryColor }}>
              Voltar para servicos
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <DateTimeSelector
              establishmentId={establishment.id}
              professionalId={selectedProfessional?.id || null}
              serviceId={selectedService?.id}
              theme={branding}
              onSelect={(dateTime) => {
                setSelectedDateTime(dateTime);
                setStep(4);
              }}
            />
            <button onClick={() => setStep(2)} className="text-xs" style={{ color: branding.primaryColor }}>
              Voltar para profissionais
            </button>
          </div>
        ) : null}

        {step === 4 && selectedDateTime ? (
          <BookingConfirmation
            booking={{
              establishment,
              branch: selectedBranch,
              service: selectedService,
              professional: selectedProfessional,
              date: selectedDateTime.date,
              slot: selectedDateTime.slot,
              planPrice: resolvePrice(),
            }}
            theme={branding}
            onConfirm={handleConfirm}
            onBack={() => setStep(3)}
            loading={confirming}
          />
        ) : null}
      </div>
    </div>
  );
}
