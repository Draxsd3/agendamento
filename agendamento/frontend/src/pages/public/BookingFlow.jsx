import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { appointmentsService } from '@/services/appointments.service';
import ServiceSelector from '@/components/booking/ServiceSelector';
import ProfessionalSelector from '@/components/booking/ProfessionalSelector';
import DateTimeSelector from '@/components/booking/DateTimeSelector';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STEPS = ['Serviço', 'Profissional', 'Horário', 'Confirmar'];

export default function BookingFlow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [establishment, setEstablishment] = useState(null);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const estab = await publicEstablishmentsService.getBySlug(slug);
        setEstablishment(estab);
        const [svcData, profData] = await Promise.all([
          publicEstablishmentsService.getServices(estab.id),
          publicEstablishmentsService.getProfessionals(estab.id),
        ]);
        setServices(svcData);
        setProfessionals(profData);
      } catch {
        toast.error('Estabelecimento não encontrado.');
        navigate(`/agendamento/${slug}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, navigate]);

  const filteredProfessionals = (() => {
    if (!selectedService) return professionals;
    const linked = professionals.filter((p) =>
      p.professional_services?.some((ps) => ps.service_id === selectedService.id)
    );
    // fallback: if none are linked to this service, show all active professionals
    return linked.length > 0 ? linked : professionals;
  })();

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedProfessional(null);
    setSelectedDateTime(null);
    setStep(1);
  };

  const handleProfessionalSelect = (prof) => {
    setSelectedProfessional(prof);
    setSelectedDateTime(null);
    setStep(2);
  };

  const handleDateTimeSelect = ({ date, slot }) => {
    setSelectedDateTime({ date, slot });
    setStep(3);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await appointmentsService.book({
        establishmentId: establishment.id,
        professionalId: selectedProfessional.id,
        serviceId: selectedService.id,
        startTime: selectedDateTime.slot.start,
      });
      toast.success('Agendamento realizado com sucesso!');
      navigate('/minha-conta');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao agendar. Tente outro horário.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Auth gate: must be logged in as customer to book
  if (!isAuthenticated || user?.role !== 'customer') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-600/30 mb-6">
          <LogIn size={28} className="text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-100 mb-2">Faça login para agendar</h2>
        <p className="text-gray-400 text-sm mb-8">
          Você precisa de uma conta de cliente para realizar agendamentos em{' '}
          <span className="text-gray-200 font-medium">{establishment?.name}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/cadastro"
            state={{ from: `/agendamento/${slug}/agendar` }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Criar conta
          </Link>
          <Link
            to="/login"
            state={{ from: `/agendamento/${slug}/agendar` }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm font-medium transition-colors"
          >
            <LogIn size={16} />
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step
                    ? 'bg-blue-600 text-white'
                    : i === step
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${i === step ? 'text-gray-100' : 'text-gray-600'}`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-700" />}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">{establishment?.name}</p>
      </div>

      {/* Step content */}
      <div className="card p-6">
        {step === 0 && (
          <ServiceSelector
            services={services}
            selected={selectedService}
            onSelect={handleServiceSelect}
          />
        )}

        {step === 1 && (
          <div className="space-y-4">
            <ProfessionalSelector
              professionals={filteredProfessionals}
              selected={selectedProfessional}
              onSelect={handleProfessionalSelect}
            />
            <button
              onClick={() => setStep(0)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar para serviços
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <DateTimeSelector
              establishmentId={establishment.id}
              professionalId={selectedProfessional?.id}
              serviceId={selectedService?.id}
              onSelect={handleDateTimeSelect}
            />
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Voltar para profissionais
            </button>
          </div>
        )}

        {step === 3 && selectedDateTime && (
          <BookingConfirmation
            booking={{
              establishment,
              service: selectedService,
              professional: selectedProfessional,
              date: selectedDateTime.date,
              slot: selectedDateTime.slot,
            }}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
            loading={confirming}
          />
        )}
      </div>
    </div>
  );
}
