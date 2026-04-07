import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { publicEstablishmentsService } from '@/services/establishments.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

const WEEKDAY_LABELS = {
  sunday: 'Dom', monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
  thursday: 'Qui', friday: 'Sex', saturday: 'Sáb',
};

export default function EstablishmentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [establishment, setEstablishment] = useState(null);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const estab = await publicEstablishmentsService.getBySlug(slug);
        setEstablishment(estab);

        const [svcData, profData, hoursData] = await Promise.all([
          publicEstablishmentsService.getServices(estab.id),
          publicEstablishmentsService.getProfessionals(estab.id),
          publicEstablishmentsService.getBusinessHours(estab.id),
        ]);

        setServices(svcData);
        setProfessionals(profData);
        setBusinessHours(hoursData);
      } catch (err) {
        setError(err.response?.data?.error || 'Estabelecimento não encontrado.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <LoadingSpinner fullScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-gray-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="card p-8">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0 text-3xl font-bold text-blue-400">
            {establishment.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-100">{establishment.name}</h1>
            {establishment.description && (
              <p className="text-gray-400 mt-2">{establishment.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
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
          <Button
            size="lg"
            onClick={() => navigate(`/agendamento/${slug}/agendar`)}
          >
            Agendar agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-100">Serviços</h2>
          <div className="grid gap-3">
            {services.map((svc) => (
              <Card key={svc.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-100">{svc.name}</p>
                  {svc.description && <p className="text-sm text-gray-400">{svc.description}</p>}
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {svc.duration_minutes} min
                  </p>
                </div>
                <p className="font-semibold text-gray-100 ml-4">
                  {Number(svc.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Professionals */}
          <Card>
            <h3 className="font-semibold text-gray-100 mb-3">Profissionais</h3>
            <div className="space-y-2">
              {professionals.map((prof) => (
                <div key={prof.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-semibold text-gray-300">
                    {prof.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-300">{prof.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Business hours */}
          <Card>
            <h3 className="font-semibold text-gray-100 mb-3">Horários</h3>
            <div className="space-y-1.5">
              {businessHours.map((bh) => (
                <div key={bh.weekday} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{WEEKDAY_LABELS[bh.weekday]}</span>
                  {bh.is_open ? (
                    <span className="text-gray-300">{bh.start_time.slice(0,5)} — {bh.end_time.slice(0,5)}</span>
                  ) : (
                    <span className="text-gray-600">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
