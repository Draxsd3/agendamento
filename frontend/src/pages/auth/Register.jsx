import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getErrorMessage } from '@/utils/errors';

const BENEFITS = [
  'Agenda, clientes e equipe num só lugar',
  'Lembretes automáticos de WhatsApp',
  'Cliente agenda em 30 segundos',
  'Relatórios de faturamento em tempo real',
];

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const createdUser = await registerUser({
        ...data,
        accountType: 'establishment_admin',
      });
      toast.success('Conta criada com sucesso!');
      navigate(createdUser.establishmentSlug ? `/${createdUser.establishmentSlug}/admin` : '/admin', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fieldCls = (hasError) =>
    `w-full bg-canvas border rounded-2xl px-4 py-3.5 text-sm text-ink
     placeholder:text-ink/35 focus:outline-none focus:bg-white
     focus:border-ink transition-colors
     ${hasError ? 'border-red-500' : 'border-ink-line'}`;

  return (
    <div className="min-h-screen bg-canvas text-ink relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-violet-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-brand/5 blur-3xl pointer-events-none" />

      {/* ===== NAVBAR ===== */}
      <nav className="relative z-20 px-3 md:px-6 pt-4 md:pt-6">
        <div className="max-w-6xl mx-auto rounded-full bg-canvas/80 backdrop-blur-xl border border-ink-line shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between h-14 md:h-16 pl-5 pr-2 md:pl-7 md:pr-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink">
                <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
                <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
              </svg>
              <span className="font-display font-bold text-ink text-lg tracking-tight">StreetLabs</span>
            </Link>
            <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
              <Link to="/" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">Início</Link>
              <Link to="/login" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">Entrar</Link>
              <Link to="/recuperar-senha" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">Recuperar acesso</Link>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-ink text-canvas text-xs font-bold px-4 md:px-5 py-2.5 rounded-full hover:bg-ink/85 transition-colors uppercase tracking-wide"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== CONTEÚDO ===== */}
      <main className="relative z-10 container mx-auto px-4 md:px-8 pt-10 md:pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Esquerda - editorial */}
          <section className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-brand" />
              </span>
              Crie seu acesso · StreetLabs
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-ink mb-6">
              Comece em<br />
              <span className="underline-brush">30 segundos</span>.
            </h1>

            <p className="text-lg text-ink-soft max-w-lg leading-relaxed mb-8">
              Cadastro gratuito e sem cartão. Organize sua agenda, sua equipe e seus
              clientes em uma plataforma pensada para barbearias, estúdios e salões.
            </p>

            <ul className="space-y-3 mb-8 max-w-md">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-ink/85">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink text-canvas shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { k: '+2.500', v: 'clientes ativos' },
                { k: '99,9%',  v: 'uptime' },
                { k: 'LGPD',   v: 'dados protegidos' },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-ink-line bg-white/70 p-3 text-center">
                  <p className="font-display text-xl font-bold text-ink leading-none">{s.k}</p>
                  <p className="text-[10px] uppercase tracking-wider text-ink-soft mt-1">{s.v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Direita - formulario */}
          <section className="animate-fade-in-up">
            <div className="max-w-md w-full mx-auto lg:ml-auto lg:mr-0">
              <div className="rounded-3xl border border-ink-line bg-white p-8 sm:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-soft font-semibold mb-3">Novo por aqui</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-2">
                  Criar acesso do dono.
                </h2>
                <p className="text-sm text-ink-soft mb-8">
                  Sem burocracia. Sem treinamento. Em 30 segundos você está dentro.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                      Nome do estabelecimento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Studio Central"
                      autoComplete="organization"
                      className={fieldCls(errors.businessName)}
                      {...register('businessName', { required: 'Nome do estabelecimento é obrigatório.' })}
                    />
                    {errors.businessName && <p className="text-xs text-red-500 mt-1.5">{errors.businessName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      placeholder="Como podemos te chamar?"
                      autoComplete="name"
                      className={fieldCls(errors.name)}
                      {...register('name', { required: 'Nome é obrigatório.' })}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="você@empresa.com"
                        autoComplete="email"
                        className={fieldCls(errors.email)}
                        {...register('email', {
                          required: 'Email é obrigatório.',
                          pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
                        })}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        className={fieldCls(errors.phone)}
                        {...register('phone')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        className={fieldCls(errors.password) + ' pr-11'}
                        {...register('password', {
                          required: 'Senha é obrigatória.',
                          minLength: { value: 6, message: 'Mínimo 6 caracteres.' },
                        })}
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
                    {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        autoComplete="new-password"
                        className={fieldCls(errors.confirmPassword) + ' pr-11'}
                        {...register('confirmPassword', {
                          required: 'Confirmação é obrigatória.',
                          validate: (v) => v === watch('password') || 'As senhas não coincidem.',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink p-1 rounded-md transition-colors"
                        aria-label="Alternar visibilidade"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword.message}</p>}
                  </div>

                  <p className="text-[11px] text-ink-soft leading-relaxed">
                    Ao criar sua conta, você concorda com os{' '}
                    <a href="#" className="underline hover:text-ink">Termos de uso</a> e a{' '}
                    <a href="#" className="underline hover:text-ink">Política de privacidade</a>.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-ink w-full group py-4 !rounded-full !text-sm"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        Criar minha conta
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-7 pt-7 border-t border-ink-line text-center">
                  <p className="text-sm text-ink-soft">
                    Já tem conta?{' '}
                    <Link to="/login" className="font-semibold text-ink hover:text-violet-brand transition-colors underline-brush">
                      Entrar agora
                    </Link>
                  </p>
                </div>
              </div>

              <p className="text-center text-[11px] text-ink-soft mt-6 uppercase tracking-[0.25em]">
                &copy; {new Date().getFullYear()} · StreetLabs
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
