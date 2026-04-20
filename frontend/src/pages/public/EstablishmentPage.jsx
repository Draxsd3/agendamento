import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Star, Check, Percent, Crown,
  Instagram, Globe, MessageCircle, AlignLeft,
  Calendar, Users, Scissors, ArrowRight, ArrowUpRight,
  Sparkles, Quote, ChevronDown, ShieldCheck, Award,
  Heart, Play,
} from 'lucide-react';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { plansService, subscriptionsService } from '@/services/plans.service';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getBrandingTheme, hexToRgba, getContrastTextColor } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const WEEKDAY_LABELS = {
  sunday: 'Domingo', monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
  thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado',
};
const WEEKDAY_INDEX = {
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

function SocialLinks({ establishment, variant = 'dark', primary }) {
  const links = [
    establishment.instagram_url && { href: establishment.instagram_url, icon: Instagram, label: 'Instagram' },
    establishment.facebook_url  && { href: establishment.facebook_url,  icon: Globe,      label: 'Facebook' },
    establishment.tiktok_url    && { href: establishment.tiktok_url,    icon: AlignLeft,  label: 'TikTok' },
    establishment.whatsapp      && {
      href: `https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`,
      icon: MessageCircle, label: 'WhatsApp',
    },
  ].filter(Boolean);

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ href, icon: Icon, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`group inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all ${
            variant === 'light'
              ? 'border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black'
              : 'border-black/10 bg-white text-black/70 hover:-translate-y-0.5 hover:text-white'
          }`}
          style={variant === 'dark' ? { '--social-hover': primary } : undefined}
          onMouseEnter={(e) => {
            if (variant === 'dark' && primary) {
              e.currentTarget.style.background = primary;
              e.currentTarget.style.borderColor = primary;
            }
          }}
          onMouseLeave={(e) => {
            if (variant === 'dark') {
              e.currentTarget.style.background = '';
              e.currentTarget.style.borderColor = '';
            }
          }}
        >
          <Icon size={17} strokeWidth={1.75} />
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const todayKey = Object.keys(WEEKDAY_INDEX).find(
    (k) => WEEKDAY_INDEX[k] === new Date().getDay()
  );
  const todayHours = businessHours.find((bh) => bh.weekday === todayKey);
  const isOpenToday = todayHours?.is_open;

  const branding = getBrandingTheme(establishment);
  const primary = branding.primaryColor;
  const accent = branding.accentColor;
  const primaryText = branding.primaryTextColor;

  const gallery = Array.isArray(establishment?.gallery)
    ? establishment.gallery.filter((g) => g?.url)
    : [];
  const highlights = Array.isArray(establishment?.highlights)
    ? establishment.highlights.filter(Boolean)
    : [];

  const featuredService = useMemo(() => {
    if (!services.length) return null;
    return [...services].sort((a, b) => Number(b.price) - Number(a.price))[0];
  }, [services]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-black/50">Ops</p>
          <h1 className="font-display text-4xl font-bold text-black">{error}</h1>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const brandGradient = `linear-gradient(135deg, ${primary}, ${accent})`;
  const softPrimary = hexToRgba(primary, 0.08);
  const softAccent = hexToRgba(accent, 0.1);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      <style>{`
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .float-y { animation: floatY 4s ease-in-out infinite; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .scroll-indicator::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 8px;
          width: 3px;
          height: 8px;
          background: currentColor;
          border-radius: 2px;
          transform: translateX(-50%);
          animation: scrollDot 1.6s ease-in-out infinite;
        }
        @keyframes scrollDot {
          0% { transform: translate(-50%, 0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(-50%, 14px); opacity: 0; }
        }
      `}</style>

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            className={`flex items-center justify-between rounded-full border transition-all duration-300 ${
              scrolled
                ? 'border-black/10 bg-white/95 px-4 py-2.5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] backdrop-blur-xl'
                : 'border-white/20 bg-black/20 px-5 py-3 backdrop-blur-md'
            }`}
          >
            <Link to={`/${slug}`} className="flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold shadow-md ring-2 ring-white/60"
                style={{ background: brandGradient, color: primaryText }}
              >
                {establishment.logo_url ? (
                  <img src={establishment.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{(establishment.name || 'E').charAt(0)}</span>
                )}
              </div>
              <span
                className={`font-display text-base font-bold tracking-tight transition-colors sm:text-lg ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                {establishment.name}
              </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              {['Início', 'Sobre', 'Serviços', 'Equipe', 'Planos', 'Contato'].map((item) => {
                const id = item.toLowerCase()
                  .replace('í', 'i').replace('ç', 'c').replace('Í', 'I');
                const hideSobre = item === 'Sobre' && !establishment.about;
                const hideServicos = item === 'Servicos' && !services.length;
                const hideEquipe = item === 'Equipe' && !professionals.length;
                const hidePlanos = item === 'Planos' && !plans.length;
                if (hideSobre || hideServicos || hideEquipe || hidePlanos) return null;
                return (
                  <a
                    key={item}
                    href={`#${id}`}
                    className={`text-sm font-medium transition-colors ${
                      scrolled ? 'text-black/65 hover:text-black' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="group hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide shadow-md transition-all hover:-translate-y-0.5 sm:inline-flex"
              style={{ background: primary, color: primaryText }}
            >
              Agendar
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow-md sm:hidden"
              style={{ background: primary, color: primaryText }}
              aria-label="Agendar"
            >
              <Calendar size={16} />
            </button>
          </nav>
        </div>
      </header>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="inicio" className="relative h-screen min-h-[720px] w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {establishment.cover_url ? (
            <img
              src={establishment.cover_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ background: brandGradient }} />
          )}
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.92) 100%)`,
            }}
          />
          {/* Color wash */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-multiply"
            style={{ background: `linear-gradient(135deg, ${primary}, transparent 70%)` }}
          />
        </div>

        {/* Glow */}
        <div
          className="pointer-events-none absolute -right-28 top-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 md:pb-20">
          {/* Chip */}
          <div
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur-md"
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: isOpenToday ? '#4ade80' : '#f87171' }}
            />
            {isOpenToday ? 'Aberto agora' : 'Fechado no momento'}
            {isOpenToday && todayHours && (
              <span className="text-white/75">
                · até {todayHours.end_time.slice(0, 5)}
              </span>
            )}
          </div>

          {/* Title + tagline */}
          <div className="max-w-4xl">
            <h1 className="font-display text-[2.75rem] font-bold leading-[0.92] tracking-[-0.035em] text-white sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem]">
              {establishment.name}
            </h1>
            {establishment.tagline && (
              <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-white/85 md:text-xl">
                {establishment.tagline}
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide shadow-2xl transition-all hover:gap-3 hover:-translate-y-0.5"
              style={{ background: primary, color: primaryText }}
            >
              <Calendar size={16} />
              Agendar agora
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            {services.length > 0 && (
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/20"
              >
                Ver servicos
              </a>
            )}

            <div className="hidden sm:block">
              <SocialLinks establishment={establishment} variant="light" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 hidden items-center gap-4 md:flex">
            <div className="scroll-indicator relative h-10 w-5 rounded-full border border-white/40 text-white/70" />
            <span className="text-xs uppercase tracking-[0.28em] text-white/60">
              Deslize para explorar
            </span>
          </div>
        </div>

        {/* Marquee de informacoes */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-6 px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
            {establishment.address && (
              <span className="flex items-center gap-2">
                <MapPin size={12} /> {establishment.address}
              </span>
            )}
            {establishment.phone && (
              <span className="hidden items-center gap-2 md:flex">
                <Phone size={12} /> {establishment.phone}
              </span>
            )}
            {services.length > 0 && (
              <span className="hidden items-center gap-2 md:flex">
                <Scissors size={12} /> {services.length} servicos
              </span>
            )}
            {professionals.length > 0 && (
              <span className="hidden items-center gap-2 md:flex">
                <Users size={12} /> Equipe de {professionals.length}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS STRIP ══════════════════════ */}
      <section className="relative z-20 mx-auto -mt-8 max-w-6xl px-4 sm:px-6">
        <div
          className="grid gap-0 rounded-3xl border border-black/5 bg-white p-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.2)] sm:grid-cols-2 md:grid-cols-4"
        >
          {[
            {
              icon: Award,
              value: highlights[0] || 'Qualidade',
              label: highlights[0] ? 'Nossa marca' : 'em cada atendimento',
            },
            {
              icon: Users,
              value: professionals.length || '—',
              label: 'Profissionais',
            },
            {
              icon: Scissors,
              value: services.length || '—',
              label: 'Serviços ativos',
            },
            {
              icon: ShieldCheck,
              value: '100%',
              label: 'Agenda online',
            },
          ].map(({ icon: Ico, value, label }, i) => {
            const extractNum = String(value).match(/^\d[\d+k.,%]*/);
            const display = extractNum ? extractNum[0] : value;
            const subLabel = extractNum
              ? String(value).replace(/^\d[\d+k.,%]*\s*/, '') || label
              : label;
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-5 md:not-last:border-r md:[&:not(:last-child)]:border-r border-black/5"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: softPrimary, color: primary }}
                >
                  <Ico size={22} strokeWidth={1.75} />
                </div>
                <div>
                  <p
                    className="font-display text-2xl font-bold leading-none tracking-tight"
                    style={{ color: primary }}
                  >
                    {display}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-black/55">
                    {subLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════ SOBRE ══════════════════════ */}
      {establishment.about && (
        <section id="sobre" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
          <div className="grid gap-14 md:grid-cols-[1.1fr_1.3fr] md:items-center md:gap-20">
            {/* Visual lateral */}
            <div className="relative">
              <div
                className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/5 shadow-xl"
                style={{ background: brandGradient }}
              >
                {gallery[0]?.url ? (
                  <img src={gallery[0].url} alt="" className="h-full w-full object-cover" />
                ) : establishment.cover_url ? (
                  <img src={establishment.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white">
                    <Scissors size={80} strokeWidth={1} className="opacity-40" />
                  </div>
                )}
              </div>
              {/* Card flutuante */}
              <div className="float-y absolute -bottom-6 -right-6 hidden w-56 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5 md:block">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: softAccent, color: accent }}
                  >
                    <Heart size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold leading-none" style={{ color: primary }}>
                      Estilo único
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-black/50">
                      Nossa essência
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-black/60">
                  Um espaço feito com carinho para você se sentir em casa.
                </p>
              </div>
            </div>

            {/* Texto */}
            <div>
              <p
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: primary }}
              >
                <span className="h-[1px] w-8" style={{ background: primary }} />
                Nossa historia
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl">
                Mais que um serviço,
                <br />
                uma{' '}
                <span
                  className="relative inline-block"
                  style={{ color: primary }}
                >
                  experiência.
                  <span
                    className="absolute bottom-1 left-0 h-[0.35em] w-full opacity-30"
                    style={{ background: primary }}
                  />
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-black/65 md:text-xl">
                {establishment.about}
              </p>

              {highlights.length > 0 && (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {highlights.slice(0, 4).map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: softPrimary, color: primary }}
                      >
                        <Check size={15} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-medium text-black/75">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ SERVICOS ══════════════════════ */}
      {services.length > 0 && (
        <section id="servicos" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: primary }}
              >
                <span className="h-[1px] w-8" style={{ background: primary }} />
                O que fazemos
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl">
                Serviços selecionados
                <br />
                para você.
              </h2>
              <p className="mt-5 text-base text-black/60 md:text-lg">
                Do básico essencial ao premium exclusivo — escolha o que combina com seu estilo.
              </p>
            </div>
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Ver agenda completa
              <ArrowUpRight size={15} />
            </button>
          </div>

          {/* Destaque (primeiro servico mais caro) */}
          {featuredService && (
            <div
              className="mb-6 grid overflow-hidden rounded-[2rem] md:grid-cols-[1.2fr_1fr]"
              style={{ background: brandGradient, color: primaryText }}
            >
              <div className="relative p-8 md:p-12">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <Sparkles size={10} /> Destaque da casa
                </span>
                <h3 className="mt-5 font-display text-3xl font-bold leading-tight md:text-5xl">
                  {featuredService.name}
                </h3>
                {featuredService.description && (
                  <p className="mt-4 max-w-md text-base leading-relaxed opacity-90">
                    {featuredService.description}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest opacity-75">
                      Investimento
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold">
                      {fmt(featuredService.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest opacity-75">
                      Duração
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold">
                      {featuredService.duration_minutes}min
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/${slug}/agendar`)}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-black transition-all hover:gap-3"
                >
                  Reservar agora
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="relative hidden min-h-[280px] md:block">
                {gallery[1]?.url ? (
                  <img src={gallery[1].url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : gallery[0]?.url ? (
                  <img src={gallery[0].url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scissors size={120} strokeWidth={0.8} className="opacity-20" />
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(270deg, transparent 0%, ${primary} 100%)`,
                    mixBlendMode: 'multiply',
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.filter((s) => s.id !== featuredService?.id).map((svc, idx) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => navigate(`/${slug}/agendar`)}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_30px_50px_-25px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: softPrimary, color: primary }}
                  >
                    <Scissors size={19} strokeWidth={1.75} />
                  </div>
                  <span
                    className="font-display text-xs font-bold tracking-widest opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: primary }}
                  >
                    {String(idx + 2).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-5 font-display text-xl font-bold leading-tight text-black">
                  {svc.name}
                </h3>
                {svc.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-black/55">
                    {svc.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-black/55">
                    <Clock size={12} /> {svc.duration_minutes} min
                  </span>
                  <span className="font-display text-xl font-bold text-black">
                    {fmt(svc.price)}
                  </span>
                </div>

                <div
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: brandGradient }}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════ EQUIPE ══════════════════════ */}
      {professionals.length > 0 && (
        <section id="equipe" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: primary }}
              >
                <span className="h-[1px] w-8" style={{ background: primary }} />
                Quem assina
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl">
                Mentes & mãos
                <br />
                por trás.
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {professionals.map((prof) => (
              <div
                key={prof.id}
                className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_28px_50px_-25px_rgba(0,0,0,0.25)]"
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden"
                  style={{ background: brandGradient }}
                >
                  {prof.avatar_url ? (
                    <img
                      src={prof.avatar_url}
                      alt={prof.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className="font-display text-6xl font-bold tracking-tight"
                        style={{ color: primaryText }}
                      >
                        {initials(prof.name)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                <div className="p-5">
                  <p className="font-display text-lg font-bold leading-tight text-black">
                    {prof.name}
                  </p>
                  {prof.specialty && (
                    <p className="mt-1 text-sm text-black/55">{prof.specialty}</p>
                  )}
                  <div
                    className="mt-3 h-[2px] w-10 rounded-full transition-all duration-300 group-hover:w-20"
                    style={{ background: primary }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════ GALERIA ══════════════════════ */}
      {gallery.length > 0 && (
        <section id="galeria" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p
                className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em]"
                style={{ color: primary }}
              >
                <span className="h-[1px] w-8" style={{ background: primary }} />
                Portfolio visual
              </p>
              <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl">
                Momentos do espaço
              </h2>
            </div>
            <span className="text-xs uppercase tracking-widest text-black/50">
              {gallery.length} {gallery.length === 1 ? 'imagem' : 'imagens'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((img, idx) => {
              const isBig = idx % 5 === 0;
              return (
                <button
                  key={img.url || idx}
                  type="button"
                  onClick={() => setLightboxImg(img.url)}
                  className={`group relative overflow-hidden rounded-3xl bg-black/5 ${
                    isBig ? 'col-span-2 row-span-2' : ''
                  }`}
                  style={{ aspectRatio: isBig ? '1/1' : '4/3' }}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(to top, ${hexToRgba(primary, 0.75)} 0%, transparent 70%)`,
                    }}
                  />
                  <div className="absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all group-hover:opacity-100 group-hover:scale-100 scale-75">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════ PLANOS ══════════════════════ */}
      {plans.length > 0 && (
        <section id="planos" className="relative mx-auto mt-32 max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p
              className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em]"
              style={{ color: primary }}
            >
              <Crown size={12} /> Clube do assinante
            </p>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-black md:text-6xl">
              Vire <span style={{ color: primary }}>membro</span> da casa.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-black/60 md:text-lg">
              Benefícios exclusivos, descontos em todos os serviços e prioridade na agenda.
            </p>
          </div>

          {hasActiveSub && (
            <div
              className="mx-auto mb-10 flex max-w-2xl items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm"
              style={{
                borderColor: hexToRgba(accent, 0.35),
                background: hexToRgba(accent, 0.1),
                color: primary,
              }}
            >
              <Crown size={16} />
              Você já é assinante deste estabelecimento.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => {
              const active = isSubscribed(plan.id);
              const featured = i === Math.floor(plans.length / 2);
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border p-8 transition-all hover:-translate-y-2 ${
                    featured
                      ? 'text-white shadow-[0_40px_60px_-25px_rgba(0,0,0,0.35)]'
                      : 'bg-white text-black border-black/5 hover:shadow-[0_28px_50px_-25px_rgba(0,0,0,0.25)]'
                  }`}
                  style={
                    featured
                      ? { background: brandGradient, borderColor: 'transparent', color: primaryText }
                      : {}
                  }
                >
                  {featured && (
                    <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                      <Sparkles size={10} /> Popular
                    </span>
                  )}
                  {active && !featured && (
                    <span
                      className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: hexToRgba(accent, 0.15), color: accent }}
                    >
                      <Crown size={10} /> Ativo
                    </span>
                  )}

                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.28em] ${
                      featured ? 'opacity-80' : 'text-black/55'
                    }`}
                  >
                    Plano
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold leading-tight">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p
                      className={`mt-2 text-sm ${
                        featured ? 'opacity-85' : 'text-black/55'
                      }`}
                    >
                      {plan.description}
                    </p>
                  )}

                  <div className="mt-7 flex items-baseline gap-1.5">
                    <span className="font-display text-5xl font-bold tracking-tight">
                      {fmt(plan.price)}
                    </span>
                    <span
                      className={`text-sm ${
                        featured ? 'opacity-80' : 'text-black/55'
                      }`}
                    >
                      /{INTERVAL_LABEL[plan.billing_interval]}
                    </span>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3 text-sm">
                    {plan.discount_percent > 0 && (
                      <li className="flex items-start gap-2.5">
                        <div
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={
                            featured
                              ? { background: 'rgba(255,255,255,0.2)' }
                              : { background: softAccent, color: accent }
                          }
                        >
                          <Percent size={11} strokeWidth={2.5} />
                        </div>
                        <span className={featured ? 'opacity-90' : 'text-black/75'}>
                          <strong>{plan.discount_percent}%</strong> de desconto nos serviços
                        </span>
                      </li>
                    )}
                    {(plan.benefits || []).map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <div
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={
                            featured
                              ? { background: 'rgba(255,255,255,0.2)' }
                              : { background: softPrimary, color: primary }
                          }
                        >
                          <Check size={11} strokeWidth={2.5} />
                        </div>
                        <span className={featured ? 'opacity-90' : 'text-black/75'}>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {!active ? (
                    <button
                      onClick={() => setConfirmPlan(plan)}
                      className={`group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-xs font-bold uppercase tracking-wider transition-all hover:gap-3 ${
                        featured
                          ? 'bg-white text-black'
                          : 'text-white'
                      }`}
                      style={
                        featured
                          ? {}
                          : { background: primary, color: primaryText }
                      }
                    >
                      Assinar plano
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ) : (
                    <div className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-current/20 px-5 py-3.5 text-xs font-bold uppercase tracking-widest">
                      Plano ativo
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════ CONTATO ══════════════════════ */}
      <section id="contato" className="mx-auto mt-32 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 rounded-[2rem] border border-black/5 bg-white p-8 md:grid-cols-3 md:p-10">
          {/* Horarios */}
          {businessHours.length > 0 && (
            <div>
              <div className="mb-5 flex items-center gap-2.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: softPrimary, color: primary }}
                >
                  <Clock size={17} />
                </div>
                <h3 className="font-display text-lg font-bold text-black">Horários</h3>
              </div>
              <ul className="space-y-1">
                {businessHours.map((bh) => {
                  const isToday = bh.weekday === todayKey;
                  return (
                    <li
                      key={bh.weekday}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                        isToday ? 'font-bold' : ''
                      }`}
                      style={isToday ? { background: softPrimary, color: primary } : {}}
                    >
                      <span className={bh.is_open ? 'text-current' : 'text-black/40'}>
                        {WEEKDAY_LABELS[bh.weekday]}
                        {isToday && (
                          <span
                            className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full align-middle"
                            style={{ background: 'currentColor' }}
                          />
                        )}
                      </span>
                      {bh.is_open ? (
                        <span className="tabular-nums">
                          {bh.start_time.slice(0, 5)} — {bh.end_time.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-black/40">Fechado</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Localizacao */}
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: softPrimary, color: primary }}
              >
                <MapPin size={17} />
              </div>
              <h3 className="font-display text-lg font-bold text-black">Onde estamos</h3>
            </div>
            {establishment.address ? (
              <>
                <p className="text-sm leading-relaxed text-black/70">
                  {establishment.address}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-black underline-offset-4 hover:underline"
                  style={{ color: primary }}
                >
                  Abrir no Google Maps
                  <ArrowUpRight size={13} />
                </a>
                {/* Mapa estatico */}
                <div className="mt-5 overflow-hidden rounded-2xl border border-black/5">
                  <iframe
                    title="Localização"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(establishment.address)}&output=embed`}
                    className="h-40 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-black/60">Endereço sob consulta.</p>
            )}

            {establishment.phone && (
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-black/70">
                <Phone size={13} /> {establishment.phone}
              </p>
            )}
          </div>

          {/* Contato & Social */}
          <div>
            <div className="mb-5 flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: softPrimary, color: primary }}
              >
                <MessageCircle size={17} />
              </div>
              <h3 className="font-display text-lg font-bold text-black">Fale com a gente</h3>
            </div>
            <p className="text-sm leading-relaxed text-black/70">
              Siga nossos canais, acompanhe novidades e mande sua dúvida. Respondemos rápido.
            </p>
            <div className="mt-5">
              <SocialLinks establishment={establishment} primary={primary} />
            </div>

            {establishment.whatsapp && (
              <a
                href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={15} /> Chamar no WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA FINAL ══════════════════════ */}
      <section className="mx-auto mt-32 max-w-7xl px-4 pb-24 sm:px-6">
        <div
          className="relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center sm:px-12 sm:py-24"
          style={{ background: brandGradient, color: primaryText }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(${primaryText} 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
            }}
          />
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
            style={{ background: primaryText }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <Quote size={32} className="mx-auto mb-5 opacity-60" />
            <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight md:text-7xl">
              Sua próxima visita
              <br />
              começa <span className="italic">aqui</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base opacity-85 md:text-lg">
              Agende em segundos. Confirmação automática. Tudo salvo no seu histórico com a{' '}
              <strong>{establishment.name}</strong>.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/${slug}/agendar`)}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-10 py-5 text-sm font-bold uppercase tracking-wide text-black shadow-2xl transition-all hover:gap-3 hover:-translate-y-0.5"
              >
                <Calendar size={16} /> Agendar agora
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              {plans.length > 0 && (
                <Link
                  to={`/${slug}/planos`}
                  className="inline-flex items-center gap-2 rounded-full border border-current/30 px-10 py-5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-white/10"
                >
                  <Star size={15} /> Conhecer planos
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-sm font-bold"
                  style={{ background: brandGradient, color: primaryText }}
                >
                  {establishment.logo_url ? (
                    <img src={establishment.logo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{(establishment.name || 'E').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-black">
                    {establishment.name}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-black/50">
                    /{establishment.slug}
                  </p>
                </div>
              </div>
              {establishment.tagline && (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/60">
                  {establishment.tagline}
                </p>
              )}
              <div className="mt-5">
                <SocialLinks establishment={establishment} primary={primary} />
              </div>
            </div>

            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-widest text-black">
                Explore
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-black/65">
                {services.length > 0 && (
                  <li>
                    <a href="#servicos" className="hover:text-black transition-colors">
                      Servicos
                    </a>
                  </li>
                )}
                {professionals.length > 0 && (
                  <li>
                    <a href="#equipe" className="hover:text-black transition-colors">
                      Equipe
                    </a>
                  </li>
                )}
                {gallery.length > 0 && (
                  <li>
                    <a href="#galeria" className="hover:text-black transition-colors">
                      Galeria
                    </a>
                  </li>
                )}
                {plans.length > 0 && (
                  <li>
                    <a href="#planos" className="hover:text-black transition-colors">
                      Clube do assinante
                    </a>
                  </li>
                )}
                <li>
                  <Link
                    to={`/${slug}/agendar`}
                    className="font-semibold hover:text-black transition-colors"
                    style={{ color: primary }}
                  >
                    Agendar horário
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-widest text-black">
                Contato
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm text-black/65">
                {establishment.address && (
                  <li className="flex items-start gap-2">
                    <MapPin size={13} className="mt-1 shrink-0" />
                    {establishment.address}
                  </li>
                )}
                {establishment.phone && (
                  <li className="flex items-start gap-2">
                    <Phone size={13} className="mt-1 shrink-0" />
                    {establishment.phone}
                  </li>
                )}
                {todayHours && isOpenToday && (
                  <li className="flex items-start gap-2">
                    <Clock size={13} className="mt-1 shrink-0" />
                    Hoje: {todayHours.start_time.slice(0, 5)} — {todayHours.end_time.slice(0, 5)}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-6 text-xs text-black/50 sm:flex-row">
            <span>© {new Date().getFullYear()} {establishment.name}. Todos os direitos reservados.</span>
            <span>
              Portfolio por{' '}
              <a
                href="https://streetlabs.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-black underline-offset-4 hover:underline"
              >
                StreetLabs
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* ══════════════════════ LIGHTBOX ══════════════════════ */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt=""
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
            onClick={() => setLightboxImg(null)}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════ MODAL: Confirmar assinatura ══════════════════════ */}
      <Modal isOpen={!!confirmPlan} onClose={() => setConfirmPlan(null)} title="Assinar plano">
        <p className="mb-2 text-black/70">
          Você está assinando o plano <strong className="text-black">{confirmPlan?.name}</strong> de{' '}
          <strong className="text-black">{establishment?.name}</strong>.
        </p>
        <p className="mb-6 text-black/70">
          Valor:{' '}
          <strong className="text-black">
            {fmt(confirmPlan?.price || 0)} / {INTERVAL_LABEL[confirmPlan?.billing_interval]}
          </strong>
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmPlan(null)}>Cancelar</Button>
          <Button loading={subscribing} onClick={handleSubscribe} icon={Star}>
            Confirmar assinatura
          </Button>
        </div>
        <p className="mt-4 text-xs text-black/50">
          Se o checkout não abrir, complete CPF, telefone e endereço no seu perfil.
        </p>
      </Modal>
    </div>
  );
}
