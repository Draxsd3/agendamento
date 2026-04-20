import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Phone, Clock, Check, Percent, Crown,
  Instagram, Globe, MessageCircle, AlignLeft,
  Calendar, ArrowRight, ArrowUpRight, Scissors, Star,
} from 'lucide-react';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { plansService, subscriptionsService } from '@/services/plans.service';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { getBrandingTheme, hexToRgba } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

/* ────────────────────────────────────────────────────────────
   CONFIG — todos os textos e dias da semana em UM lugar.
   Altere aqui ou sobrescreva via campos do establishment.
   ──────────────────────────────────────────────────────────── */
const COPY = {
  sectionAbout: 'Sobre',
  sectionServices: 'Serviços',
  sectionTeam: 'Equipe',
  sectionGallery: 'Galeria',
  sectionPlans: 'Clube',
  sectionContact: 'Contato',
  ctaSchedule: 'Agendar',
  ctaSeeServices: 'Ver serviços',
  ctaSeePlans: 'Ver planos',
  ctaSubscribe: 'Assinar',
  openNow: 'Aberto agora',
  closedNow: 'Fechado',
  todayUntil: 'até',
  aboutFallbackHeading: 'Sobre nós',
  servicesHeading: 'Serviços',
  teamHeading: 'Equipe',
  galleryHeading: 'Galeria',
  plansHeading: 'Planos',
  contactHeading: 'Contato',
  hoursLabel: 'Horários',
  addressLabel: 'Endereço',
  socialsLabel: 'Redes',
  seeOnMap: 'Ver no mapa',
  finalCtaHeading: 'Vamos marcar seu próximo horário?',
  finalCtaBody: 'Agendamento em segundos, confirmação automática.',
  footerTagline: 'Portfolio',
};

const WEEKDAY_LABELS = {
  sunday: 'Domingo', monday: 'Segunda', tuesday: 'Terça', wednesday: 'Quarta',
  thursday: 'Quinta', friday: 'Sexta', saturday: 'Sábado',
};
const WEEKDAY_INDEX = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};
const INTERVAL_LABEL = { monthly: 'mês', quarterly: 'trimestre', annual: 'ano' };

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

/* Montagem centralizada do tema.
   Mudar primary_color / accent_color nas configs do
   estabelecimento troca TUDO automaticamente. */
function buildTheme(establishment) {
  const branding = getBrandingTheme(establishment);
  const primary = branding.primaryColor;
  const accent = branding.accentColor;
  return {
    primary,
    accent,
    primaryText: branding.primaryTextColor,
    soft: hexToRgba(primary, 0.08),
    softBorder: hexToRgba(primary, 0.18),
    accentSoft: hexToRgba(accent, 0.08),
  };
}

/* ────────────────────────────────────────────────────────────
   Mini componentes
   ──────────────────────────────────────────────────────────── */
function Logo({ establishment, theme, size = 'md' }) {
  const s = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`flex ${s} items-center justify-center overflow-hidden rounded-full font-bold`}
      style={{ background: theme.primary, color: theme.primaryText }}
    >
      {establishment.logo_url ? (
        <img src={establishment.logo_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{(establishment.name || 'E').charAt(0)}</span>
      )}
    </div>
  );
}

function SocialLinks({ establishment, theme }) {
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition-colors hover:text-black"
          style={{ '--hover-bg': theme.soft }}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme.soft; e.currentTarget.style.borderColor = theme.softBorder; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; }}
        >
          <Icon size={16} strokeWidth={1.75} />
        </a>
      ))}
    </div>
  );
}

/* Titulo de secao padrao — pequeno, com linha divisora */
function SectionHeading({ label, title, theme, children }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: theme.primary }}
        >
          <span className="h-[1px] w-6" style={{ background: theme.primary }} />
          {label}
        </p>
        <h2 className="font-display text-3xl font-bold leading-[1.05] tracking-tight text-black md:text-4xl">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Portfolio minimalista
   ════════════════════════════════════════════════════════════ */
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
    const onScroll = () => setScrolled(window.scrollY > 32);
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

  const theme = useMemo(() => (establishment ? buildTheme(establishment) : null), [establishment]);

  const todayKey = Object.keys(WEEKDAY_INDEX).find(
    (k) => WEEKDAY_INDEX[k] === new Date().getDay()
  );
  const todayHours = businessHours.find((bh) => bh.weekday === todayKey);
  const isOpenToday = todayHours?.is_open;

  const gallery = Array.isArray(establishment?.gallery)
    ? establishment.gallery.filter((g) => g?.url)
    : [];
  const highlights = Array.isArray(establishment?.highlights)
    ? establishment.highlights.filter(Boolean)
    : [];

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-black/50">Ops</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-black">{error}</h1>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  /* campos configuraveis com fallback:
     sobrescrever via establishment.heading_* nas configs para customizar */
  const heading = {
    hero: establishment.tagline || '',
    about: establishment.about_heading || COPY.aboutFallbackHeading,
    services: establishment.services_heading || COPY.servicesHeading,
    team: establishment.team_heading || COPY.teamHeading,
    gallery: establishment.gallery_heading || COPY.galleryHeading,
    plans: establishment.plans_heading || COPY.plansHeading,
    contact: establishment.contact_heading || COPY.contactHeading,
    finalCta: establishment.final_cta_heading || COPY.finalCtaHeading,
    finalCtaBody: establishment.final_cta_body || COPY.finalCtaBody,
  };

  return (
    <div className="min-h-screen bg-white text-black">

      {/* ══════════════════════ NAVBAR ══════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-4'
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled
                ? 'rounded-full border border-black/5 bg-white/95 px-4 py-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md'
                : 'px-2 py-2'
            }`}
          >
            <Link to={`/${slug}`} className="flex items-center gap-2.5">
              <Logo establishment={establishment} theme={theme} size="sm" />
              <span
                className={`font-display text-base font-bold tracking-tight transition-colors ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                {establishment.name}
              </span>
            </Link>

            <div className="hidden items-center gap-7 md:flex">
              {[
                { id: 'sobre', label: COPY.sectionAbout, show: !!establishment.about },
                { id: 'servicos', label: COPY.sectionServices, show: services.length > 0 },
                { id: 'equipe', label: COPY.sectionTeam, show: professionals.length > 0 },
                { id: 'galeria', label: COPY.sectionGallery, show: gallery.length > 0 },
                { id: 'planos', label: COPY.sectionPlans, show: plans.length > 0 },
                { id: 'contato', label: COPY.sectionContact, show: true },
              ].filter((i) => i.show).map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`text-sm transition-colors ${
                    scrolled ? 'text-black/70 hover:text-black' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 sm:inline-flex sm:items-center sm:gap-2"
              style={{ background: theme.primary, color: theme.primaryText }}
            >
              {COPY.ctaSchedule}
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full sm:hidden"
              style={{ background: theme.primary, color: theme.primaryText }}
              aria-label="Agendar"
            >
              <Calendar size={15} />
            </button>
          </nav>
        </div>
      </header>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="inicio" className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {establishment.cover_url ? (
            <img src={establishment.cover_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: theme.primary }} />
          )}
          {/* Overlay simples */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-14 sm:px-6 md:pb-20">
          {isOpenToday !== undefined && (
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-md">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: isOpenToday ? '#4ade80' : '#f87171' }}
              />
              {isOpenToday
                ? `${COPY.openNow} · ${COPY.todayUntil} ${todayHours.end_time.slice(0, 5)}`
                : COPY.closedNow}
            </div>
          )}

          <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-[-0.02em] text-white md:text-7xl">
            {establishment.name}
          </h1>

          {heading.hero && (
            <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-white/80 md:text-lg">
              {heading.hero}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: theme.primary, color: theme.primaryText }}
            >
              <Calendar size={15} />
              {COPY.ctaSchedule}
              <ArrowRight size={14} />
            </button>
            {services.length > 0 && (
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {COPY.ctaSeeServices}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════ INFO STRIP ══════════════════════ */}
      <section className="border-b border-black/5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-6 text-sm text-black/60 sm:px-6">
          {establishment.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} style={{ color: theme.primary }} />
              <span>{establishment.address}</span>
            </div>
          )}
          {establishment.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color: theme.primary }} />
              <span>{establishment.phone}</span>
            </div>
          )}
          {todayHours && isOpenToday && (
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: theme.primary }} />
              <span>
                Hoje: {todayHours.start_time.slice(0, 5)} — {todayHours.end_time.slice(0, 5)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════ SOBRE ══════════════════════ */}
      {establishment.about && (
        <section id="sobre" className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-start md:gap-16">
            <div>
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: theme.primary }}
              >
                {COPY.sectionAbout}
              </p>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-black md:text-4xl">
                {heading.about}
              </h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-black/70 md:text-xl">
                {establishment.about}
              </p>
              {highlights.length > 0 && (
                <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                  {highlights.slice(0, 6).map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-black/70">
                      <Check
                        size={16}
                        strokeWidth={2.25}
                        className="mt-0.5 shrink-0"
                        style={{ color: theme.primary }}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ SERVIÇOS ══════════════════════ */}
      {services.length > 0 && (
        <section id="servicos" className="border-t border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
              label={COPY.sectionServices}
              title={heading.services}
              theme={theme}
            >
              <button
                onClick={() => navigate(`/${slug}/agendar`)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-black/70 hover:text-black"
              >
                Ver agenda <ArrowUpRight size={13} />
              </button>
            </SectionHeading>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-black/5 bg-black/5 md:grid-cols-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => navigate(`/${slug}/agendar`)}
                  className="group flex items-start justify-between gap-6 bg-white p-6 text-left transition-colors hover:bg-neutral-50"
                >
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold leading-tight text-black">
                      {svc.name}
                    </h3>
                    {svc.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-black/55">
                        {svc.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-black/50">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {svc.duration_minutes}min
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums" style={{ color: theme.primary }}>
                      {fmt(svc.price)}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      Agendar <ArrowRight size={10} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ EQUIPE ══════════════════════ */}
      {professionals.length > 0 && (
        <section id="equipe" className="border-t border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
              label={COPY.sectionTeam}
              title={heading.team}
              theme={theme}
            />
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {professionals.map((prof) => (
                <div key={prof.id} className="group">
                  <div
                    className="relative aspect-[3/4] overflow-hidden rounded-2xl"
                    style={{ background: theme.soft }}
                  >
                    {prof.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span
                          className="font-display text-5xl font-bold tracking-tight"
                          style={{ color: theme.primary }}
                        >
                          {initials(prof.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-base font-bold leading-tight text-black">
                      {prof.name}
                    </p>
                    {prof.specialty && (
                      <p className="mt-0.5 text-sm text-black/55">{prof.specialty}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ GALERIA ══════════════════════ */}
      {gallery.length > 0 && (
        <section id="galeria" className="border-t border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
              label={COPY.sectionGallery}
              title={heading.gallery}
              theme={theme}
            >
              <span className="text-xs uppercase tracking-widest text-black/45">
                {gallery.length} {gallery.length === 1 ? 'foto' : 'fotos'}
              </span>
            </SectionHeading>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {gallery.map((img, idx) => (
                <button
                  key={img.url || idx}
                  type="button"
                  onClick={() => setLightboxImg(img.url)}
                  className="group relative overflow-hidden rounded-2xl bg-black/5"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ background: hexToRgba(theme.primary, 0.35) }}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ PLANOS ══════════════════════ */}
      {plans.length > 0 && (
        <section id="planos" className="border-t border-black/5">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <SectionHeading
              label={COPY.sectionPlans}
              title={heading.plans}
              theme={theme}
            />

            {hasActiveSub && (
              <div
                className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                style={{
                  borderColor: theme.softBorder,
                  background: theme.soft,
                  color: theme.primary,
                }}
              >
                <Crown size={14} />
                Você já é assinante.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const active = isSubscribed(plan.id);
                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 ${
                      active ? '' : 'border-black/10 bg-white hover:shadow-md'
                    }`}
                    style={active ? { borderColor: theme.softBorder, background: theme.soft } : {}}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-display text-xl font-bold text-black">
                        {plan.name}
                      </h3>
                      {active && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                          style={{ background: theme.primary, color: theme.primaryText }}
                        >
                          <Crown size={10} /> Ativo
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="mt-2 text-sm text-black/60">{plan.description}</p>
                    )}

                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold tabular-nums text-black">
                        {fmt(plan.price)}
                      </span>
                      <span className="text-sm text-black/50">
                        /{INTERVAL_LABEL[plan.billing_interval]}
                      </span>
                    </div>

                    <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                      {plan.discount_percent > 0 && (
                        <li className="flex items-start gap-2">
                          <Percent
                            size={14}
                            strokeWidth={2.25}
                            className="mt-0.5 shrink-0"
                            style={{ color: theme.primary }}
                          />
                          <span className="text-black/75">
                            <strong>{plan.discount_percent}%</strong> de desconto nos serviços
                          </span>
                        </li>
                      )}
                      {(plan.benefits || []).map((b, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <Check
                            size={14}
                            strokeWidth={2.25}
                            className="mt-0.5 shrink-0"
                            style={{ color: theme.primary }}
                          />
                          <span className="text-black/75">{b}</span>
                        </li>
                      ))}
                    </ul>

                    {!active ? (
                      <button
                        onClick={() => setConfirmPlan(plan)}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                        style={{ background: theme.primary, color: theme.primaryText }}
                      >
                        {COPY.ctaSubscribe} <ArrowRight size={14} />
                      </button>
                    ) : (
                      <div
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-widest"
                        style={{ borderColor: theme.softBorder, color: theme.primary }}
                      >
                        Plano ativo
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════ CONTATO ══════════════════════ */}
      <section id="contato" className="border-t border-black/5">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionHeading
            label={COPY.sectionContact}
            title={heading.contact}
            theme={theme}
          />
          <div className="grid gap-10 md:grid-cols-3">
            {/* Horarios */}
            {businessHours.length > 0 && (
              <div>
                <p
                  className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/50"
                >
                  {COPY.hoursLabel}
                </p>
                <ul className="space-y-2 text-sm">
                  {businessHours.map((bh) => {
                    const isToday = bh.weekday === todayKey;
                    return (
                      <li
                        key={bh.weekday}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={bh.is_open ? (isToday ? 'font-semibold' : 'text-black/70') : 'text-black/35'}
                          style={isToday ? { color: theme.primary } : {}}
                        >
                          {WEEKDAY_LABELS[bh.weekday]}
                        </span>
                        {bh.is_open ? (
                          <span className="tabular-nums text-black/80">
                            {bh.start_time.slice(0, 5)} — {bh.end_time.slice(0, 5)}
                          </span>
                        ) : (
                          <span className="text-black/35">Fechado</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Endereco */}
            {establishment.address && (
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/50">
                  {COPY.addressLabel}
                </p>
                <p className="text-sm leading-relaxed text-black/75">
                  {establishment.address}
                </p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(establishment.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: theme.primary }}
                >
                  {COPY.seeOnMap} <ArrowUpRight size={13} />
                </a>
                {establishment.phone && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-black/65">
                    <Phone size={13} /> {establishment.phone}
                  </p>
                )}
              </div>
            )}

            {/* Social */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-black/50">
                {COPY.socialsLabel}
              </p>
              <SocialLinks establishment={establishment} theme={theme} />
              {establishment.whatsapp && (
                <a
                  href={`https://wa.me/${establishment.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA FINAL ══════════════════════ */}
      <section className="border-t border-black/5">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-black md:text-5xl">
            {heading.finalCta}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-black/60">
            {heading.finalCtaBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/${slug}/agendar`)}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: theme.primary, color: theme.primaryText }}
            >
              <Calendar size={15} /> {COPY.ctaSchedule} <ArrowRight size={14} />
            </button>
            {plans.length > 0 && (
              <a
                href="#planos"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold text-black hover:border-black"
              >
                <Star size={14} /> {COPY.ctaSeePlans}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="border-t border-black/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-black/50 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo establishment={establishment} theme={theme} size="sm" />
            <span className="text-black/80">{establishment.name}</span>
            <span className="text-black/30">· /{establishment.slug}</span>
          </div>
          <span>
            © {new Date().getFullYear()} {establishment.name}. {COPY.footerTagline} por{' '}
            <a
              href="https://streetlabs.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-black/70 hover:text-black"
            >
              StreetLabs
            </a>
          </span>
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
            className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black"
            onClick={() => setLightboxImg(null)}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════ MODAL ASSINAR ══════════════════════ */}
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
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
