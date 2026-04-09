import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Briefcase, User, Circle, Plus, ArrowLeft, Store, ChevronRight } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { appointmentsService } from '@/services/appointments.service';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { subscriptionsService } from '@/services/plans.service';
import ServiceSelector from '@/components/booking/ServiceSelector';
import ProfessionalSelector from '@/components/booking/ProfessionalSelector';
import DateTimeSelector from '@/components/booking/DateTimeSelector';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'upcoming', label: 'Agendados' },
  { key: 'past', label: 'Anteriores' },
];

const EDIT_STEPS = ['Servico', 'Profissional', 'Horario', 'Confirmar'];

function AppointmentEdit({ appt, branding, onBack, onSaved }) {
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [planServices, setPlanServices] = useState([]);
  const [planDiscountPercent, setPlanDiscountPercent] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const establishmentId = appt.establishment_id || appt.establishments?.id;

  useEffect(() => {
    const load = async () => {
      try {
        const [serviceData, professionalData, mySubscriptions] = await Promise.all([
          publicEstablishmentsService.getServices(establishmentId),
          publicEstablishmentsService.getProfessionals(establishmentId),
          subscriptionsService.getMine().catch(() => []),
        ]);

        setServices(serviceData);
        setProfessionals(professionalData);
        setSelectedService(serviceData.find((service) => service.id === appt.service_id) || null);
        setSelectedProfessional(professionalData.find((professional) => professional.id === appt.professional_id) || null);

        const activeSubscription = (mySubscriptions || []).find((subscription) => {
          const subscriptionEstablishmentId =
            subscription.establishment_id || subscription.establishments?.id || subscription.plans?.establishment_id;
          return subscription.status === 'active' && subscriptionEstablishmentId === establishmentId;
        });

        setPlanServices(activeSubscription?.plans?.plan_services || []);
        setPlanDiscountPercent(Number(activeSubscription?.plans?.discount_percent || 0));
      } catch {
        toast.error('Erro ao carregar dados do estabelecimento.');
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [establishmentId, appt.service_id, appt.professional_id]);

  const filteredProfessionals = (() => {
    if (!selectedService) return professionals;
    const linked = professionals.filter((professional) =>
      professional.professional_services?.some((professionalService) => professionalService.service_id === selectedService.id)
    );
    return linked.length > 0 ? linked : professionals;
  })();

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await appointmentsService.reschedule(appt.id, {
        professionalId: selectedProfessional.id,
        serviceId: selectedService.id,
        startTime: selectedDateTime.slot.start,
      });
      toast.success('Agendamento atualizado!');
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao reagendar.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <LoadingSpinner />;

  const stepLabel = (index) => {
    if (index === 0) return selectedService?.name || '-';
    if (index === 1) return selectedProfessional?.name || '-';
    if (index === 2) {
      return selectedDateTime
        ? format(new Date(selectedDateTime.slot.start), "d MMM, HH:mm", { locale: ptBR })
        : '-';
    }
    return 'Confirmar';
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: branding?.primaryColor || '#9CA3AF' }}
      >
        <ArrowLeft size={15} /> Voltar
      </button>

      <h2 className="text-base font-semibold text-gray-900">Editar agendamento</h2>

      <div className="flex flex-wrap items-center gap-1">
        {EDIT_STEPS.map((label, index) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                index === step ? 'border border-gray-300 bg-gray-100 text-gray-900' : 'bg-gray-100 text-gray-400'
              }`}
              style={index < step ? { backgroundColor: branding?.primaryColor || '#111827', color: branding?.primaryTextColor || '#FFFFFF' } : undefined}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs ${index === step ? 'font-medium' : 'text-gray-400'}`}
              style={index === step ? { color: branding?.accentColor || '#111827' } : undefined}
            >
              {label}
            </span>
            {index < EDIT_STEPS.length - 1 ? <ChevronRight size={12} className="text-gray-300" /> : null}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        {step === 0 ? (
          <ServiceSelector
            services={services}
            planServices={planServices}
            planDiscountPercent={planDiscountPercent}
            theme={branding}
            selected={selectedService}
            onSelect={(service) => {
              setSelectedService(service);
              setSelectedProfessional(null);
              setSelectedDateTime(null);
              setStep(1);
            }}
          />
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <ProfessionalSelector
              professionals={filteredProfessionals}
              selected={selectedProfessional}
              theme={branding}
              onSelect={(professional) => {
                setSelectedProfessional(professional);
                setSelectedDateTime(null);
                setStep(2);
              }}
            />
            <button onClick={() => setStep(0)} className="text-sm" style={{ color: branding?.primaryColor || '#9CA3AF' }}>
              Voltar para servicos
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <DateTimeSelector
              establishmentId={establishmentId}
              professionalId={selectedProfessional?.id}
              serviceId={selectedService?.id}
              theme={branding}
              onSelect={(dateTime) => {
                setSelectedDateTime(dateTime);
                setStep(3);
              }}
            />
            <button onClick={() => setStep(1)} className="text-sm" style={{ color: branding?.primaryColor || '#9CA3AF' }}>
              Voltar para profissionais
            </button>
          </div>
        ) : null}

        {step === 3 && selectedDateTime ? (
          <div className="space-y-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Resumo das alteracoes</p>
            <div className="space-y-3">
              {[
                { label: 'Servico', value: stepLabel(0) },
                { label: 'Profissional', value: stepLabel(1) },
                { label: 'Horario', value: stepLabel(2) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b border-gray-100 pb-2 text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 rounded-lg py-3 text-sm font-semibold transition-colors disabled:opacity-60"
                style={{
                  backgroundColor: branding?.primaryColor || '#111827',
                  color: branding?.primaryTextColor || '#FFFFFF',
                }}
              >
                {saving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AppointmentDetail({ appt, branding, onBack, onEdit, onCancel }) {
  const now = new Date();
  const date = new Date(appt.start_time);
  const dateLabel = format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
  const price = Number(appt.total_price ?? appt.services?.price ?? 0);
  const canEdit = appt.status !== 'cancelled' && date > now;

  const branch = appt.branches;
  let branchAddress = branch?.address || '';
  try {
    const parsed = JSON.parse(branchAddress);
    branchAddress = [parsed.street, parsed.number, parsed.complement, parsed.cep].filter(Boolean).join(', ');
  } catch {}

  return (
    <div className="space-y-3">
      <button
        onClick={onBack}
        className="mb-1 flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: branding?.primaryColor || '#9CA3AF' }}
      >
        <ArrowLeft size={15} /> Voltar
      </button>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Circle size={10} fill="currentColor" className="shrink-0" style={{ color: branding?.primaryColor || '#9CA3AF' }} />
          <span className="text-sm font-semibold capitalize text-gray-800">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Briefcase size={15} className="shrink-0 text-gray-500" />
          <span>{appt.services?.name}</span>
        </div>
        {branch?.name || appt.establishments?.name ? (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Store size={15} className="mt-0.5 shrink-0 text-gray-500" />
            <div>
              <p>{branch?.name || appt.establishments?.name}</p>
              {branchAddress ? <p className="mt-0.5 text-xs text-gray-400">{branchAddress}</p> : null}
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-sm">
          <User size={15} className="shrink-0 text-gray-500" />
          <span className="font-medium" style={{ color: branding?.primaryColor || '#2563EB' }}>
            Profissional {appt.professionals?.name}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="mb-4 font-semibold text-gray-800">Pagamento</p>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm text-gray-600">
          <span>{appt.services?.name}</span>
          <span>R$ {price.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex items-center justify-between pt-3 text-sm font-bold text-gray-900">
          <span>Total</span>
          <span>R$ {price.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>

      {canEdit ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onEdit}
            className="rounded-lg py-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: branding?.softAccent || '#F3F4F6',
              color: branding?.accentColor || '#374151',
            }}
          >
            Editar
          </button>
          <button
            onClick={() => onCancel(appt.id)}
            className="rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Cancelar
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function CustomerAppointments() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const branding = outletContext?.branding || null;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    appointmentsService
      .getMyAppointments()
      .then(setAppointments)
      .catch(() => toast.error('Erro ao carregar agendamentos.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    try {
      await appointmentsService.cancel(id);
      toast.success('Agendamento cancelado.');
      setView('list');
      setSelected(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao cancelar.');
    }
  };

  const now = new Date();
  const tenantAppointments = slug
    ? appointments.filter((appointment) => appointment.establishments?.slug === slug)
    : appointments;

  const filtered = tenantAppointments.filter((appointment) => {
    if (tab === 'upcoming') return new Date(appointment.start_time) >= now && appointment.status !== 'cancelled';
    return new Date(appointment.start_time) < now || appointment.status === 'cancelled';
  });

  if (loading) return <LoadingSpinner />;

  if (view === 'edit' && selected) {
    return (
      <AppointmentEdit
        appt={selected}
        branding={branding}
        onBack={() => setView('detail')}
        onSaved={() => {
          setView('list');
          setSelected(null);
          load();
        }}
      />
    );
  }

  if (view === 'detail' && selected) {
    return (
      <AppointmentDetail
        appt={selected}
        branding={branding}
        onBack={() => {
          setView('list');
          setSelected(null);
        }}
        onEdit={() => setView('edit')}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              tab === key ? '' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            style={tab === key ? { borderColor: branding?.accentColor || '#111827', color: branding?.accentColor || '#111827' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate(slug ? `/${slug}/agendar` : '/')}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold transition-colors"
        style={{
          backgroundColor: branding?.primaryColor || '#111827',
          color: branding?.primaryTextColor || '#FFFFFF',
        }}
      >
        <Plus size={17} />
        Novo agendamento
      </button>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-gray-400">Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((appointment) => {
            const date = new Date(appointment.start_time);
            const dateLabel = format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
            const price = Number(appointment.total_price ?? appointment.services?.price ?? 0);

            return (
              <button
                key={appointment.id}
                onClick={() => {
                  setSelected(appointment);
                  setView('detail');
                }}
                className="w-full rounded-lg border bg-white p-5 text-left transition-colors"
                style={{ borderColor: branding?.subtleBorder || '#E5E7EB' }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Circle size={10} fill="currentColor" className="shrink-0" style={{ color: branding?.primaryColor || '#9CA3AF' }} />
                    <span className="text-sm font-semibold capitalize text-gray-800">{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase size={14} className="shrink-0 text-gray-400" />
                    <span>{appointment.services?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="shrink-0 text-gray-400" />
                    <span>{appointment.professionals?.name}</span>
                  </div>
                  <p className="pt-1 text-sm font-medium text-gray-700">
                    Total: R$ {price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
