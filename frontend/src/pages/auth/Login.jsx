import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getErrorMessage } from '@/utils/errors';

/**
 * StreetLabs — Tela de login.
 * Mesma linguagem visual do website:
 *  - Canvas off-white (hsl 40 20% 97%)
 *  - Ink quase-preto para tipografia e CTA
 *  - Space Grotesk em títulos + Inter no corpo
 *  - Pincelada violeta (underline-brush)
 *  - Textura dotted-bg
 *  - Logo hexagonal StreetLabs
 */
export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const getRedirect = (loggedUser) => {
    const from = location.state?.from;
    const activeSlug = localStorage.getItem('activeEstablishmentSlug');
    if (from && loggedUser.role === 'customer') return from;
    if (loggedUser.role === 'establishment_admin') {
      return loggedUser.establishmentSlug ? `/${loggedUser.establishmentSlug}/admin` : '/admin';
    }
    if (activeSlug) return `/${activeSlug}/cliente`;
    return '/minha-conta';
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role === 'super_admin') {
      navigate('/super-admin', { replace: true });
      return;
    }
    navigate(getRedirect(user), { replace: true });
  }, [isAuthenticated, user, navigate, location.state]);

  const onSubmit = async (data) => {
    try {
      const loggedUser = await login(data);
      if (loggedUser.role === 'super_admin') {
        toast.error('Use o painel de acesso restrito para Super Admin.');
        localStorage.removeItem('token');
        window.location.href = '/super-admin/login';
        return;
      }
      navigate(getRedirect(loggedUser), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink relative overflow-hidden">
      {/* Textura pontilhada no canvas inteiro */}
      <div className="absolute inset-0 dotted-bg pointer-events-none opacity-70" />

      {/* Círculos de glow para profundidade */}
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-violet-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-brand/5 blur-3xl pointer-events-none" />

      {/* ===== NAVBAR (igual website) ===== */}
      <nav className="relative z-20 px-3 md:px-6 pt-4 md:pt-6">
        <div className="max-w-6xl mx-auto rounded-full bg-canvas/80 backdrop-blur-xl border border-ink-line shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between h-14 md:h-16 pl-5 pr-2 md:pl-7 md:pr-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink">
                <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
                <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
              </svg>
              <span className="font-display font-bold text-ink text-lg tracking-tight">
                StreetLabs
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Início
              </Link>
              <Link to="/cadastro" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Criar conta
              </Link>
              <Link to="/recuperar-senha" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">
                Recuperar acesso
              </Link>
            </div>

            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 bg-ink text-canvas text-xs font-bold px-4 md:px-5 py-2.5 rounded-full hover:bg-ink/85 transition-colors uppercase tracking-wide"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== CONTEÚDO ===== */}
      <main className="relative z-10 container mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Coluna esquerda — editorial */}
          <section className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-brand" />
              </span>
              Plataforma de agendamento · StreetLabs
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-ink mb-6">
              Entre e comande<br />
              sua <span className="underline-brush">agenda</span>.
            </h1>

            <p className="text-lg text-ink-soft max-w-lg leading-relaxed mb-8">
              Acesse o painel para acompanhar reservas, equipe, clientes e faturamento em
              tempo real. Feito para quem vive de agenda.
            </p>

            {/* Card decorativo — mock de métricas */}
            <div className="relative max-w-md">
              <div className="absolute -inset-3 bg-gradient-to-br from-violet-brand/20 via-violet-brand/5 to-transparent rounded-[2rem] blur-2xl" />
              <div className="relative rounded-3xl border border-ink-line bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-ink-soft font-semibold">
                      Hoje · 19 abr
                    </p>
                    <p className="font-display text-2xl font-bold text-ink leading-tight">
                      12 agendamentos
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink text-canvas px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                    +18%
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { hr: '09:00', name: 'Mariana Silva', svc: 'Corte + Escova', dot: 'bg-violet-brand' },
                    { hr: '10:30', name: 'Rafael Dias',  svc: 'Barba completa', dot: 'bg-ink' },
                    { hr: '14:00', name: 'Laura Mendes', svc: 'Coloração',      dot: 'bg-amber-400' },
                  ].map((it) => (
                    <div
                      key={it.hr}
                      className="flex items-center gap-3 rounded-2xl border border-ink-line bg-canvas/60 px-3.5 py-2.5"
                    >
                      <span className={`h-2 w-2 rounded-full ${it.dot}`} />
                      <span className="text-xs text-ink-soft w-12 font-semibold">{it.hr}</span>
                      <span className="flex-1 text-sm font-medium text-ink">{it.name}</span>
                      <span className="text-xs text-ink-soft">{it.svc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Coluna direita — formulário */}
          <section className="animate-fade-in-up">
            <div className="max-w-md w-full mx-auto lg:ml-auto lg:mr-0">
              <div className="rounded-3xl border border-ink-line bg-white p-8 sm:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-semibold mb-3">
                  Acesso restrito
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-2">
                  Bem-vindo<br />de volta.
                </h2>
                <p className="text-sm text-ink-soft mb-8">
                  Entre com o email cadastrado. Sem truques, sem ruído.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Email */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="você@empresa.com"
                      autoComplete="email"
                      className={`w-full bg-canvas border rounded-2xl px-4 py-3.5 text-sm text-ink
                                  placeholder:text-ink/35 focus:outline-none focus:bg-white
                                  focus:border-ink transition-colors
                                  ${errors.email ? 'border-red-500' : 'border-ink-line'}`}
                      {...register('email', {
                        required: 'Email é obrigatório.',
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
                      })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft">
                        Senha
                      </label>
                      <Link
                        to="/recuperar-senha"
                        className="text-xs font-semibold text-ink hover:text-violet-brand transition-colors"
                      >
                        Esqueci a senha
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`w-full bg-canvas border rounded-2xl px-4 pr-11 py-3.5 text-sm text-ink
                                    placeholder:text-ink/35 focus:outline-none focus:bg-white
                                    focus:border-ink transition-colors
                                    ${errors.password ? 'border-red-500' : 'border-ink-line'}`}
                        {...register('password', { required: 'Senha é obrigatória.' })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink p-1 rounded-md transition-colors"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Remember */}
                  <label className="inline-flex items-center gap-2.5 text-sm text-ink-soft cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-line accent-[hsl(263_85%_58%)]"
                      {...register('remember')}
                    />
                    Manter conectado neste dispositivo
                  </label>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-ink w-full group py-4 !rounded-full !text-sm"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Entrar na plataforma
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 pt-7 border-t border-ink-line text-center">
                  <p className="text-sm text-ink-soft">
                    Ainda não tem conta?{' '}
                    <Link
                      to="/cadastro"
                      className="font-semibold text-ink hover:text-violet-brand transition-colors underline-brush"
                    >
                      Começar grátis
                    </Link>
                  </p>
                </div>
              </div>

              {/* Microassinatura */}
              <p className="text-center text-[11px] text-ink-soft mt-6 uppercase tracking-[0.25em]">
                © {new Date().getFullYear()} · StreetLabs · Feito para barbearias, estúdios & salões
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
