import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Star, Check, Percent, Crown,
  Instagram, Globe, MessageCircle, AlignLeft, ChevronRight,
  Calendar, Users, Scissors,
} from 'lucide-react';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { plansService, subscriptionsService } from '@/services/plans.service';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getBrandingTheme } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const WEEKDAY_LABELS = {
  sunday: 'Dom', monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua',
  thursday: 'Qui', friday: 'Sex', saturday: 'Sáb',
};
const WEEKDAY_FULL = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};
const INTERVAL_LABEL = { monthly: 'mês', quarterly: 'trimestre', annual: 'ano' };

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

function SocialLinks({ establishment }) {
  const links = [
    establishment.instagram_url && { href: establishment.instagram_url, icon: Instagram, label: 'Instagram', color: '#E1306C' },
    establishment.facebook_url  && { href: establishment.facebook_url,  icon: Globe,      label: 'Facebook',  color: '#1877F2' },
    establishment.tiktok_url    && { href: establishment.tiktok_url,    icon: AlignLeft,  label: 'TikTok',    color: '#010101' },
    establishment.whatsapp      && {
      href: `https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`,
      icon: MessageCircle, label: 'WhatsApp', color: '#25D366',
    },
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <div className="flex items-center gap-3">
      {links.map(({ href, icon: Icon, label, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: color + '18', color }}
        >
          <Icon size={16} strokeWidth={1.75} />
        </a>
      ))}
    </div>
  );
}

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
  const [lightboxImg, setLightboxImg] = useState(null);

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
      const result = await subscriptionsService.subscribe(confirmPlan.id);
      if (result?.checkout?.url) { window.location.href = result.checkout.url; return; }
      toast.success(`Plano "${confirmPlan.name}" assinado com sucesso!`);
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
  const hasActiveSub = mySubscriptions.some(
    (s) => s.establishment_id === establishment?.id && s.status === 'active'
  );

  const todayKey = Object.keys(WEEKDAY_FULL).find(
    (k) => WEEKDAY_FULL[k] === new Date().getDay()
  );
  const todayHours = businessHours.find((bh) => bh.weekday === todayKey);
  const isOpenToday = todayHours?.is_open;

  const branding = getBrandingTheme(establishment);
  const primary = branding.primaryColor || '#111827';
  const accent  = branding.accentColor  || '#111827';

  const gallery = Array.isArray(establishment?.gallery)
    ? establishment.gallery.filter((g) => g?.url)
    : [];
  const highlights = Array.isArray(establishment?.highlights)
    ? establishment.highlights.filter(Boolean)
    : [];

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '72vh' }}>
        {/* Background cover */}
        <div className="absolute inset-0">
          {establishment.cover_url
            ? <img src={establishment.cover_url} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
          }
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-12 pt-20 max-w-5xl mx-auto w-full" style={{ minHeight: '72vh' }}>
          {/* Logo + name */}
          <div className="flex items-end gap-5 mb-6">
            <div
              className="w-20 h-20 rounded-2xl border-2 border-white/30 overflow-hidden shadow-2xl flex items-center justify-center shrink-0 text-2xl font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {establishment.logo_url
                ? <img src={establishment.logo_url} alt="Logo" className="w-full h-full object-cover" />
                : <span>{(establishment.name || 'E').charAt(0)}</span>
              }
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium tracking-wider uppercase mb-1">
                /{establishment.slug}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
                {establishment.name}
              </h1>
              {establishment.tagline && (
                <p className="text-white/80 text-lg mt-2 font-light">{establishment.tagline}</p>
              )}
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-7">
            {isOpenToday !== undefined && (
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                isOpenToday
                  ? 'bg-green-400/20 border-green-400/40 text-green-300'
                  : 'bg-red-400/20 border-red-400/40 text-red-300'
              }`}>
                {isOpenToday
                  ? `Aberto hoje • ${todayHours.start_time.slice(0,5)}–${todayHours.end_time.slice(0,5)}`
                  : 'Fechado hoje'}
              </span>
            )}
            {establishment.address && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80">
                <MapPin size={12} /> {establishment.address}
              </span>
            )}
            {establishment.phone && (
              <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80">
                <Phone size={12} /> {establishment.phone}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              <Calendar size={16} /> Agendar agora
            </button>
            {plans.length > 0 && (
              <Link
                to={`/${slug}/planos`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/15 border border-white/25 text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
              >
                <Star size={15} /> Ver planos
              </Link>
            )}
            <SocialLinks establishment={establishment} />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-14 py-14">

        {/* ── GALLERY ──────────────────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Galeria</h2>
              <span className="text-sm text-gray-400">{gallery.length} fotos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={img.url || idx}
                  type="button"
                  onClick={() => setLightboxImg(img.url)}
                  className={`relative overflow-hidden rounded-xl bg-gray-100 group ${
                    idx === 0 ? 'row-span-2 col-span-1' : ''
                  }`}
                  style={{ aspectRatio: idx === 0 ? '3/4' : '4/3' }}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── ABOUT + HIGHLIGHTS ───────────────────────────────────────────── */}
        {(establishment.about || highlights.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {establishment.about && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre</h2>
                <p className="text-gray-600 leading-relaxed">{establishment.about}</p>
              </div>
            )}
            {highlights.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4 flex flex-col items-center text-center"
                    style={{ borderColor: primary + '30', backgroundColor: primary + '08' }}
                  >
                    <span
                      className="text-2xl font-black leading-none mb-1"
                      style={{ color: primary }}
                    >
                      {h.match(/^\d[\d+k.]*/) ? h.match(/^\d[\d+k.]*/)[0] : '✓'}
                    </span>
                    <span className="text-xs font-medium text-gray-600 leading-snug">
                      {h.replace(/^\d[\d+k.]*\s*/, '')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── SERVICES ─────────────────────────────────────────────────────── */}
        {services.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Serviços</h2>
              <button
                onClick={() => navigate(`/${slug}/agendar`)}
                className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80"
                style={{ color: primary }}
              >
                Agendar <ChevronRight size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: primary + '15' }}
                  >
                    <Scissors size={18} style={{ color: primary }} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{svc.name}</p>
                    {svc.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{svc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} /> {svc.duration_minutes} min
                    </span>
                    <span className="font-bold text-gray-900">{fmt(svc.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TEAM ─────────────────────────────────────────────────────────── */}
        {professionals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Users size={18} className="text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900">Equipe</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  className="snap-start shrink-0 bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center text-center gap-3 w-36 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {initials(prof.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{prof.name}</p>
                    {prof.specialty && (
                      <p className="text-xs text-gray-400 mt-0.5">{prof.specialty}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── PLANS ────────────────────────────────────────────────────────── */}
        {plans.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900">Clube do Assinante</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">Assine um plano e aproveite benefícios exclusivos.</p>

            {hasActiveSub && (
              <div className="mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                <Crown size={15} /> Você já é assinante deste estabelecimento!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const active = isSubscribed(plan.id);
                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
                      active ? 'border-amber-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="h-1.5" style={{ backgroundColor: active ? '#f59e0b' : primary }} />
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-gray-900">{plan.name}</p>
                        {active && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                            Ativo
                          </span>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-gray-500 -mt-1">{plan.description}</p>
                      )}
                      <div>
                        <span className="text-3xl font-black text-gray-900">{fmt(plan.price)}</span>
                        <span className="text-sm text-gray-400 ml-1">/{INTERVAL_LABEL[plan.billing_interval]}</span>
                      </div>
                      <ul className="space-y-1.5 flex-1">
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
                        <button
                          onClick={() => setConfirmPlan(plan)}
                          className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2 transition-opacity hover:opacity-90"
                          style={{ backgroundColor: primary }}
                        >
                          Assinar plano
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── INFO FOOTER ──────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-200 pt-10">
          {/* Hours */}
          {businessHours.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={16} style={{ color: primary }} /> Horários
              </h3>
              <div className="space-y-1.5">
                {businessHours.map((bh) => (
                  <div key={bh.weekday} className="flex items-center justify-between text-sm">
                    <span
                      className="font-medium w-10"
                      style={{ color: bh.is_open ? '#374151' : '#9ca3af' }}
                    >
                      {WEEKDAY_LABELS[bh.weekday]}
                    </span>
                    {bh.is_open ? (
                      <span className="text-gray-700">
                        {bh.start_time.slice(0, 5)} — {bh.end_time.slice(0, 5)}
                      </span>
                    ) : (
                      <span className="text-gray-300">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location + Social */}
          <div className="space-y-5">
            {establishment.address && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={16} style={{ color: primary }} /> Localização
                </h3>
                <p className="text-sm text-gray-500">{establishment.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium mt-2 hover:opacity-80 transition-opacity"
                  style={{ color: primary }}
                >
                  Ver no mapa <ChevronRight size={13} />
                </a>
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Redes sociais</h3>
              <SocialLinks establishment={establishment} />
            </div>
          </div>
        </section>

      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
            onClick={() => setLightboxImg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── CONFIRM SUBSCRIBE MODAL ───────────────────────────────────────── */}
      <Modal isOpen={!!confirmPlan} onClose={() => setConfirmPlan(null)} title="Assinar plano">
        <p className="text-gray-600 mb-2">
          Você está assinando o plano <strong>{confirmPlan?.name}</strong> de{' '}
          <strong>{establishment?.name}</strong>.
        </p>
        <p className="text-gray-600 mb-6">
          Valor:{' '}
          <strong>
            {fmt(confirmPlan?.price || 0)} / {INTERVAL_LABEL[confirmPlan?.billing_interval]}
          </strong>
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmPlan(null)}>Cancelar</Button>
          <Button loading={subscribing} onClick={handleSubscribe} icon={Star}>
            Confirmar assinatura
          </Button>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Se o checkout não abrir, complete CPF, telefone e endereço no seu perfil.
        </p>
      </Modal>
    </div>
  );
}
