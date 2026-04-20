import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Check,
  Percent,
  Crown,
  Instagram,
  Globe,
  MessageCircle,
  AlignLeft,
  ChevronRight,
  Calendar,
  Users,
  Scissors,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Quote,
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
  sunday: 'Domingo',
  monday: 'Segunda',
  tuesday: 'Terca',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sabado',
};

const WEEKDAY_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const INTERVAL_LABEL = {
  monthly: 'mes',
  quarterly: 'trimestre',
  annual: 'ano',
};

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function hexToRgb(hex) {
  const value = (hex || '').replace('#', '');
  if (value.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function splitHighlight(text = '') {
  const numberMatch = text.match(/^\d[\d+k.,%]*/);
  const number = numberMatch ? numberMatch[0] : '';
  const label = text.replace(/^\d[\d+k.,%]*\s*/, '') || text;
  return { number, label };
}

function SocialLinks({ establishment, variant = 'dark' }) {
  const links = [
    establishment.instagram_url && {
      href: establishment.instagram_url,
      icon: Instagram,
      label: 'Instagram',
    },
    establishment.facebook_url && {
      href: establishment.facebook_url,
      icon: Globe,
      label: 'Facebook',
    },
    establishment.tiktok_url && {
      href: establishment.tiktok_url,
      icon: AlignLeft,
      label: 'TikTok',
    },
    establishment.whatsapp && {
      href: `https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`,
      icon: MessageCircle,
      label: 'WhatsApp',
    },
  ].filter(Boolean);

  if (!links.length) {
    return null;
  }

  const baseClass =
    variant === 'light'
      ? 'border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink'
      : 'border-ink-line bg-white text-ink-soft hover:border-ink hover:text-ink';

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
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${baseClass}`}
        >
          <Icon size={16} strokeWidth={1.75} />
        </a>
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, align = 'left', accent }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-ink-soft">
        {accent ? <Sparkles size={11} style={{ color: accent }} /> : null}
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-ink-soft">{description}</p>
      ) : null}
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
          const subscriptions = await subscriptionsService.getMine().catch(() => []);
          setMySubscriptions(subscriptions);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Estabelecimento nao encontrado.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, isAuthenticated, user?.role]);

  const handleSubscribe = async () => {
    if (!confirmPlan) {
      return;
    }

    if (!isAuthenticated || user?.role !== 'customer') {
      toast.error('Faca login como cliente para assinar um plano.');
      navigate(`/${slug}/login`, { state: { from: `/${slug}/planos` } });
      return;
    }

    setSubscribing(true);

    try {
      const result = await subscriptionsService.subscribe(confirmPlan.id);

      if (result?.checkout?.url) {
        window.location.href = result.checkout.url;
        return;
      }

      toast.success(`Plano "${confirmPlan.name}" assinado com sucesso!`);
      setConfirmPlan(null);
      const subscriptions = await subscriptionsService.getMine().catch(() => []);
      setMySubscriptions(subscriptions);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubscribing(false);
    }
  };

  const isSubscribed = (planId) =>
    mySubscriptions.some((subscription) => subscription.plan_id === planId && subscription.status === 'active');

  const hasActiveSub = mySubscriptions.some(
    (subscription) => subscription.establishment_id === establishment?.id && subscription.status === 'active'
  );

  const todayKey = Object.keys(WEEKDAY_INDEX).find(
    (key) => WEEKDAY_INDEX[key] === new Date().getDay()
  );
  const todayHours = businessHours.find((businessHour) => businessHour.weekday === todayKey);
  const isOpenToday = todayHours?.is_open;

  const branding = getBrandingTheme(establishment);
  const primary = branding.primaryColor || '#0f172a';
  const accent = branding.accentColor || '#6d28d9';

  const gallery = Array.isArray(establishment?.gallery)
    ? establishment.gallery.filter((image) => image?.url)
    : [];
  const highlights = Array.isArray(establishment?.highlights)
    ? establishment.highlights.filter(Boolean)
    : [];

  const heroGallery = gallery.slice(0, 3);
  const topServices = services.slice(0, 6);
  const heroHighlights = highlights.slice(0, 3).map(splitHighlight);

  const featuredService = useMemo(() => {
    if (!services.length) {
      return null;
    }

    return [...services].sort((a, b) => Number(b.price) - Number(a.price))[0];
  }, [services]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas px-6">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center text-center">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-ink-soft">Ops</p>
            <h1 className="font-display text-4xl font-bold text-ink">{error}</h1>
            <Link to="/" className="mt-8 inline-flex btn-ink">
              Voltar ao inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const brandGradient = `linear-gradient(135deg, ${primary}, ${accent})`;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[34rem] opacity-80"
        style={{
          background: `radial-gradient(circle at top left, ${rgba(accent, 0.2)} 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at top right, ${rgba(primary, 0.12)} 0%, rgba(255,255,255,0) 40%)`,
        }}
      />

      <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink-line/80 bg-white/80 px-4 py-2.5 backdrop-blur-xl shadow-[0_20px_50px_-35px_rgba(15,23,42,0.55)]">
          <Link to={`/${slug}`} className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
              style={{ background: brandGradient }}
            >
              {establishment.logo_url ? (
                <img src={establishment.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{(establishment.name || 'E').charAt(0)}</span>
              )}
            </div>
            <div className="leading-tight">
              <span className="block font-display text-sm font-bold text-ink sm:text-base">
                {establishment.name}
              </span>
              <span className="block text-xs text-ink-soft">/{establishment.slug}</span>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {establishment.about ? (
              <a href="#sobre" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Sobre
              </a>
            ) : null}
            {services.length > 0 ? (
              <a href="#servicos" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Servicos
              </a>
            ) : null}
            {professionals.length > 0 ? (
              <a href="#equipe" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Equipe
              </a>
            ) : null}
            {plans.length > 0 ? (
              <a href="#planos" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
                Planos
              </a>
            ) : null}
            <a href="#contato" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              Contato
            </a>
          </div>

          <button
            onClick={() => navigate(`/${slug}/agendar`)}
            className="btn-ink group hidden sm:inline-flex"
            style={{ background: primary }}
          >
            Agendar
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => navigate(`/${slug}/agendar`)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white sm:hidden"
            style={{ background: primary }}
            aria-label="Agendar"
          >
            <Calendar size={16} />
          </button>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-ink-line bg-ink text-canvas shadow-[0_36px_90px_-45px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-0">
              {establishment.cover_url ? (
                <img src={establishment.cover_url} alt="" className="h-full w-full object-cover opacity-65" />
              ) : (
                <div className="h-full w-full" style={{ background: brandGradient }} />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(120deg, ${rgba(primary, 0.72)} 0%, rgba(0,0,0,0.46) 46%, rgba(0,0,0,0.9) 100%)`,
                }}
              />
            </div>
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-50 blur-3xl"
              style={{ background: accent }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 to-transparent" />

            <div className="relative z-10 grid gap-10 px-6 py-14 sm:px-10 sm:py-20 md:grid-cols-[1.08fr_0.92fr] md:items-end md:px-14 md:py-24">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-sm">
                  <Sparkles size={11} />
                  Portfolio oficial · /{establishment.slug}
                </div>

                <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.92] tracking-tight text-white md:text-7xl">
                  {establishment.name}
                </h1>

                {establishment.tagline ? (
                  <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-white/88 md:text-2xl">
                    {establishment.tagline}
                  </p>
                ) : null}

                {establishment.about ? (
                  <p className="mt-6 max-w-2xl text-sm leading-7 text-white/74 md:text-base">
                    {establishment.about}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap gap-2">
                  {isOpenToday !== undefined ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
                      style={
                        isOpenToday
                          ? {
                              borderColor: 'rgba(134,239,172,0.4)',
                              background: 'rgba(134,239,172,0.14)',
                              color: '#bbf7d0',
                            }
                          : {
                              borderColor: 'rgba(252,165,165,0.35)',
                              background: 'rgba(252,165,165,0.12)',
                              color: '#fecaca',
                            }
                      }
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isOpenToday ? 'bg-emerald-300' : 'bg-red-300'}`} />
                      {isOpenToday
                        ? `Aberto hoje · ${todayHours.start_time.slice(0, 5)}-${todayHours.end_time.slice(0, 5)}`
                        : 'Fechado hoje'}
                    </span>
                  ) : null}

                  {establishment.address ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
                      <MapPin size={12} /> {establishment.address}
                    </span>
                  ) : null}

                  {establishment.phone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/85 backdrop-blur-sm">
                      <Phone size={12} /> {establishment.phone}
                    </span>
                  ) : null}
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(`/${slug}/agendar`)}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold uppercase tracking-wide text-ink transition-all hover:gap-3"
                  >
                    <Calendar size={16} />
                    Agendar agora
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {plans.length > 0 ? (
                    <Link
                      to={`/${slug}/planos`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10"
                    >
                      <Star size={15} />
                      Clube do assinante
                    </Link>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-wrap items-end gap-6">
                  <SocialLinks establishment={establishment} variant="light" />

                  {heroHighlights.length > 0 ? (
                    <div className="flex flex-wrap gap-5 text-white/78">
                      {heroHighlights.map(({ number, label }, index) => (
                        <div key={`${label}-${index}`}>
                          <p className="font-display text-2xl font-bold text-white">{number || '•'}</p>
                          <p className="max-w-[10rem] text-[11px] uppercase tracking-[0.22em]">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:justify-items-end">
                {heroGallery.length > 0 ? (
                  <div className="grid w-full max-w-md grid-cols-3 gap-3">
                    {heroGallery.map((image, index) => (
                      <button
                        key={image.url || index}
                        type="button"
                        onClick={() => setLightboxImg(image.url)}
                        className={`group relative overflow-hidden rounded-[1.7rem] border border-white/15 bg-white/10 backdrop-blur-sm ${
                          index === 0 ? 'col-span-3 aspect-[1.2/0.9]' : 'aspect-square'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                      </button>
                    ))}
                  </div>
                ) : null}

                {featuredService ? (
                  <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
                    <div className="absolute inset-x-0 top-0 h-px bg-white/35" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/68">
                          Assinatura visual
                        </p>
                        <h3 className="font-display text-2xl font-bold leading-tight text-white">
                          {featuredService.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/75">
                        destaque
                      </span>
                    </div>

                    {featuredService.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                        {featuredService.description}
                      </p>
                    ) : null}

                    <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5">
                      <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Duracao</p>
                        <p className="mt-2 font-display text-2xl font-bold text-white">
                          {featuredService.duration_minutes}
                          <span className="ml-1 text-sm font-medium text-white/70">min</span>
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Investimento</p>
                        <p className="mt-2 font-display text-2xl font-bold text-white">
                          {fmt(featuredService.price)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/${slug}/agendar`)}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink transition-transform hover:translate-y-[-1px]"
                    >
                      Reservar agora
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {highlights.length > 0 ? (
          <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
            <div className="grid gap-3 rounded-[2rem] border border-ink-line bg-white p-4 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] sm:grid-cols-2 md:grid-cols-4 md:p-6">
              {highlights.slice(0, 4).map((highlight, index) => {
                const { number, label } = splitHighlight(highlight);
                return (
                  <div
                    key={`${highlight}-${index}`}
                    className="rounded-[1.4rem] border border-ink-line/70 bg-canvas px-4 py-5"
                  >
                    <p className="font-display text-3xl font-bold tracking-tight" style={{ color: primary }}>
                      {number || '•'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{label}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {establishment.about || gallery.length > 0 ? (
          <section id="sobre" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[2rem] border border-ink-line bg-white p-8 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)]">
                <SectionHeading
                  eyebrow="Manifesto"
                  title="Uma presenca publica que vende antes mesmo do primeiro contato."
                  description={
                    establishment.about ||
                    'Seu portfolio precisa parecer uma marca premium: forte no primeiro impacto, claro na oferta e facil de converter em agendamento.'
                  }
                  accent={accent}
                />

                <div className="mt-8 grid gap-3">
                  {topServices.slice(0, 3).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => navigate(`/${slug}/agendar`)}
                      className="group flex items-center justify-between rounded-[1.4rem] border border-ink-line bg-canvas px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-transparent"
                      style={{ boxShadow: `inset 0 0 0 1px ${rgba(primary, 0)}` }}
                    >
                      <div>
                        <p className="font-display text-lg font-bold text-ink">{service.name}</p>
                        <p className="mt-1 text-sm text-ink-soft">
                          {service.duration_minutes} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-ink">{fmt(service.price)}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                          reservar <ArrowUpRight size={12} />
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {gallery.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gallery.slice(0, 5).map((image, index) => (
                    <button
                      key={image.url || index}
                      type="button"
                      onClick={() => setLightboxImg(image.url)}
                      className={`group relative overflow-hidden rounded-[2rem] border border-ink-line bg-white shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] ${
                        index === 0 ? 'sm:col-span-2 aspect-[1.45/0.9]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                        portfolio
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {services.length > 0 ? (
          <section id="servicos" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Servicos"
                title="Sessao, estilo e investimento apresentados com clareza."
                description="Cada item vira uma oferta clara, com tempo estimado e faixa de valor para facilitar a decisao do cliente."
              />

              <button
                onClick={() => navigate(`/${slug}/agendar`)}
                className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
              >
                Ver agenda
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => navigate(`/${slug}/agendar`)}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-ink-line bg-white p-6 text-left shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:shadow-[0_32px_70px_-40px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: rgba(primary, 0.1), color: primary }}
                    >
                      <Scissors size={18} strokeWidth={1.75} />
                    </div>
                    <span
                      className="font-display text-xs font-bold uppercase tracking-widest"
                      style={{ color: primary }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold leading-tight text-ink">
                    {service.name}
                  </h3>

                  {service.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-soft">
                      {service.description}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between border-t border-ink-line pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                      <Clock size={12} />
                      {service.duration_minutes} min
                    </span>
                    <span className="font-display text-2xl font-bold text-ink">
                      {fmt(service.price)}
                    </span>
                  </div>

                  <div
                    className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ background: brandGradient }}
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {professionals.length > 0 ? (
          <section id="equipe" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Equipe"
                title="Quem assina o trabalho e sustenta a reputacao da casa."
                description="Uma apresentacao forte dos profissionais ajuda a transformar curiosidade em confianca."
              />
              <Users size={26} className="hidden text-ink-soft md:block" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {professionals.map((professional) => (
                <div
                  key={professional.id}
                  className="group relative overflow-hidden rounded-[2rem] border border-ink-line bg-white p-6 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-1"
                >
                  <div
                    className="mb-5 flex h-44 items-center justify-center overflow-hidden rounded-[1.6rem]"
                    style={{ background: rgba(accent, 0.08) }}
                  >
                    {professional.avatar_url ? (
                      <img
                        src={professional.avatar_url}
                        alt={professional.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex h-20 w-20 items-center justify-center rounded-full font-display text-3xl font-bold text-white"
                        style={{ background: brandGradient }}
                      >
                        {initials(professional.name)}
                      </span>
                    )}
                  </div>

                  <p className="font-display text-lg font-bold leading-tight text-ink">
                    {professional.name}
                  </p>

                  {professional.specialty ? (
                    <p className="mt-1 text-sm text-ink-soft">{professional.specialty}</p>
                  ) : null}

                  <div
                    className="mt-4 h-[2px] w-8 rounded-full transition-all group-hover:w-16"
                    style={{ background: primary }}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {gallery.length > 0 ? (
          <section id="galeria" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Portfolio"
                title="Visual forte, composicao limpa e trabalho em primeiro plano."
                description="A galeria vira uma vitrine real da marca, com ritmo visual e mais peso para as melhores pecas."
              />
              <span className="text-sm text-ink-soft">
                {gallery.length} {gallery.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((image, index) => {
                const isBig = index % 5 === 0;
                return (
                  <button
                    key={image.url || index}
                    type="button"
                    onClick={() => setLightboxImg(image.url)}
                    className={`group relative overflow-hidden rounded-[1.8rem] border border-ink-line bg-white shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] ${
                      isBig ? 'col-span-2 row-span-2' : ''
                    }`}
                    style={{ aspectRatio: isBig ? '1 / 1' : '4 / 3' }}
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowUpRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {plans.length > 0 ? (
          <section id="planos" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
            <div className="mb-10">
              <SectionHeading
                eyebrow="Clube do assinante"
                title="Planos com cara de beneficio real, nao de tabela fria."
                description="Beneficios exclusivos, descontos e prioridade na agenda para quem quer manter recorrencia com o estudio."
                accent={accent}
              />
            </div>

            {hasActiveSub ? (
              <div
                className="mb-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: rgba(accent, 0.35),
                  background: rgba(accent, 0.1),
                  color: primary,
                }}
              >
                <Crown size={16} />
                Voce ja e assinante deste estabelecimento.
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const active = isSubscribed(plan.id);
                const featured = index === Math.floor(plans.length / 2);

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col overflow-hidden rounded-[2rem] border p-7 shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-1 ${
                      featured ? 'text-white' : 'border-ink-line bg-white text-ink'
                    }`}
                    style={featured ? { background: brandGradient, borderColor: 'transparent' } : {}}
                  >
                    {featured ? (
                      <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                        <Sparkles size={10} />
                        Popular
                      </span>
                    ) : null}

                    {active && !featured ? (
                      <span
                        className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: rgba(accent, 0.15), color: accent }}
                      >
                        <Crown size={10} />
                        Ativo
                      </span>
                    ) : null}

                    <p
                      className={`text-[11px] font-bold uppercase tracking-[0.28em] ${
                        featured ? 'text-white/80' : 'text-ink-soft'
                      }`}
                    >
                      Plano
                    </p>
                    <h3 className={`mt-2 font-display text-2xl font-bold leading-tight ${featured ? 'text-white' : 'text-ink'}`}>
                      {plan.name}
                    </h3>

                    {plan.description ? (
                      <p className={`mt-2 text-sm leading-6 ${featured ? 'text-white/85' : 'text-ink-soft'}`}>
                        {plan.description}
                      </p>
                    ) : null}

                    <div className="mt-6 flex items-baseline gap-1.5">
                      <span className="font-display text-4xl font-bold tracking-tight">
                        {fmt(plan.price)}
                      </span>
                      <span className={`text-sm ${featured ? 'text-white/80' : 'text-ink-soft'}`}>
                        /{INTERVAL_LABEL[plan.billing_interval]}
                      </span>
                    </div>

                    <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                      {plan.discount_percent > 0 ? (
                        <li className="flex items-start gap-2">
                          <Percent
                            size={14}
                            className={`mt-0.5 shrink-0 ${featured ? 'text-white' : ''}`}
                            style={!featured ? { color: accent } : {}}
                          />
                          <span className={featured ? 'text-white/90' : 'text-ink-soft'}>
                            {plan.discount_percent}% de desconto nos servicos
                          </span>
                        </li>
                      ) : null}

                      {(plan.benefits || []).map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <Check
                            size={14}
                            className={`mt-0.5 shrink-0 ${featured ? 'text-white' : ''}`}
                            style={!featured ? { color: accent } : {}}
                          />
                          <span className={featured ? 'text-white/90' : 'text-ink-soft'}>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {!active ? (
                      <button
                        onClick={() => setConfirmPlan(plan)}
                        className={`group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
                          featured ? 'bg-white text-ink hover:gap-3' : 'bg-ink text-canvas hover:gap-3'
                        }`}
                      >
                        Assinar plano
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ) : (
                      <div className="mt-7 rounded-full border border-current/20 px-5 py-3 text-center text-xs font-bold uppercase tracking-widest">
                        Plano ativo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section id="contato" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2.4rem] border border-ink-line bg-white shadow-[0_28px_60px_-45px_rgba(15,23,42,0.35)]">
            <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-ink-line bg-ink px-8 py-10 text-canvas md:border-b-0 md:border-r">
                <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/65">
                  <MessageCircle size={11} />
                  Contato
                </p>
                <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight">
                  Tudo pronto para transformar visita em agendamento.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
                  Endereco, horarios, canais oficiais e um CTA forte no mesmo bloco para fechar a conversao.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate(`/${slug}/agendar`)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-ink"
                  >
                    <Calendar size={15} />
                    Agendar agora
                  </button>
                  <SocialLinks establishment={establishment} variant="light" />
                </div>
              </div>

              <div className="grid gap-0 md:grid-cols-3">
                {businessHours.length > 0 ? (
                  <div className="border-b border-ink-line px-6 py-8 md:border-b-0 md:border-r">
                    <div className="mb-5 inline-flex items-center gap-2">
                      <div
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: rgba(primary, 0.12), color: primary }}
                      >
                        <Clock size={16} />
                      </div>
                      <h3 className="font-display text-lg font-bold text-ink">Horarios</h3>
                    </div>

                    <ul className="space-y-2 text-sm">
                      {businessHours.map((businessHour) => {
                        const isToday = businessHour.weekday === todayKey;

                        return (
                          <li
                            key={businessHour.weekday}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                              isToday ? 'bg-canvas' : ''
                            }`}
                          >
                            <span
                              className={`font-medium ${
                                businessHour.is_open ? 'text-ink' : 'text-ink-soft'
                              } ${isToday ? 'font-bold' : ''}`}
                            >
                              {WEEKDAY_LABELS[businessHour.weekday]}
                            </span>
                            {businessHour.is_open ? (
                              <span className="font-semibold tabular-nums text-ink">
                                {businessHour.start_time.slice(0, 5)} · {businessHour.end_time.slice(0, 5)}
                              </span>
                            ) : (
                              <span className="text-ink-soft">Fechado</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}

                <div className="border-b border-ink-line px-6 py-8 md:border-b-0 md:border-r">
                  <div className="mb-5 inline-flex items-center gap-2">
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: rgba(primary, 0.12), color: primary }}
                    >
                      <MapPin size={16} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">Onde estamos</h3>
                  </div>

                  {establishment.address ? (
                    <>
                      <p className="text-sm leading-7 text-ink-soft">{establishment.address}</p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink underline-offset-4 hover:underline"
                      >
                        Abrir no mapa
                        <ArrowUpRight size={13} />
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-ink-soft">Endereco sob consulta.</p>
                  )}

                  {establishment.phone ? (
                    <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-soft">
                      <Phone size={13} />
                      {establishment.phone}
                    </p>
                  ) : null}
                </div>

                <div className="px-6 py-8">
                  <div className="mb-5 inline-flex items-center gap-2">
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: rgba(primary, 0.12), color: primary }}
                    >
                      <Star size={16} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink">Destaque</h3>
                  </div>

                  {featuredService ? (
                    <div className="rounded-[1.4rem] border border-ink-line bg-canvas p-4">
                      <p className="font-display text-xl font-bold text-ink">{featuredService.name}</p>
                      <p className="mt-2 text-sm leading-6 text-ink-soft">
                        {featuredService.description || 'Servico em destaque para apresentar o melhor da casa logo no primeiro scroll.'}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-ink-soft">
                          {featuredService.duration_minutes} min
                        </span>
                        <span className="font-display text-2xl font-bold text-ink">
                          {fmt(featuredService.price)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-7 text-ink-soft">
                      Ative servicos para exibir uma oferta principal nesta area.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.6rem] bg-ink px-6 py-16 text-canvas sm:px-12 sm:py-20">
            <div className="dotted-bg-dark pointer-events-none absolute inset-0 opacity-60" />
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-30 blur-3xl"
              style={{ background: accent }}
            />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <Quote size={28} className="mx-auto mb-4 text-canvas/60" />
              <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight md:text-6xl">
                Sua proxima visita
                <br />
                comeca aqui.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-canvas/80 md:text-lg">
                Agendamento em segundos, confirmacao automatica e um portfolio com cara de marca premium.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate(`/${slug}/agendar`)}
                  className="group inline-flex items-center gap-2 rounded-full bg-canvas px-8 py-4 text-sm font-bold uppercase tracking-wide text-ink transition-all hover:gap-3"
                >
                  <Calendar size={16} />
                  Agendar agora
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>

                {plans.length > 0 ? (
                  <Link
                    to={`/${slug}/planos`}
                    className="inline-flex items-center gap-2 rounded-full border border-canvas/30 px-8 py-4 text-sm font-bold uppercase tracking-wide text-canvas transition-colors hover:border-canvas hover:bg-white/10"
                  >
                    <Star size={15} />
                    Ver planos
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-20 max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 border-t border-ink-line pt-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white"
              style={{ background: brandGradient }}
            >
              {establishment.logo_url ? (
                <img src={establishment.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{(establishment.name || 'E').charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-display text-base font-bold text-ink">{establishment.name}</p>
              <p className="text-xs text-ink-soft">/{establishment.slug}</p>
            </div>
          </div>

          <p className="text-xs text-ink-soft">
            Portfolio desenvolvido em{' '}
            <a
              href="https://streetlabs.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              StreetLabs
            </a>
          </p>
        </div>
      </footer>

      {lightboxImg ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt=""
            className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-ink"
            onClick={() => setLightboxImg(null)}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      ) : null}

      <Modal isOpen={!!confirmPlan} onClose={() => setConfirmPlan(null)} title="Assinar plano">
        <p className="mb-2 text-ink-soft">
          Voce esta assinando o plano <strong className="text-ink">{confirmPlan?.name}</strong> de{' '}
          <strong className="text-ink">{establishment?.name}</strong>.
        </p>
        <p className="mb-6 text-ink-soft">
          Valor:{' '}
          <strong className="text-ink">
            {fmt(confirmPlan?.price || 0)} / {INTERVAL_LABEL[confirmPlan?.billing_interval]}
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
        <p className="mt-4 text-xs text-ink-soft">
          Se o checkout nao abrir, complete CPF, telefone e endereco no seu perfil.
        </p>
      </Modal>
    </div>
  );
}
