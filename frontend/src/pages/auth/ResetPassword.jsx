import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/errors';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('newPassword') || '';
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const strengthLabel =
    strength <= 1 ? 'fraca' : strength <= 3 ? 'média' : 'forte';
  const strengthColor =
    strength <= 1 ? 'bg-red-500' : strength <= 3 ? 'bg-amber-500' : 'bg-emerald-500';

  if (!token) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-canvas">
        <div className="pointer-events-none absolute inset-0 dotted-bg opacity-60" />
        <div className="pointer-events-none absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-violet-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[440px] w-[440px] rounded-full bg-violet-brand/10 blur-3xl" />

        <header className="relative z-10 px-6 pt-8 lg:px-12">
          <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink-line bg-white/80 px-5 py-3 backdrop-blur-sm">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-ink">
                <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
                <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
              </svg>
              <span className="font-display text-lg font-bold text-ink">StreetLabs</span>
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Voltar ao login
            </Link>
          </nav>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-6 py-20 text-center lg:px-12">
          <div className="animate-fade-in-up">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink text-canvas">
              <AlertCircle size={30} />
            </div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-ink-soft">
              Link inválido
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
              Este link expirou
              <br />
              ou já foi <span className="underline-brush">usado</span>.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Por segurança, cada link de recuperação vale por um período limitado.
              Solicite um novo agora mesmo.
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/recuperar-senha" className="btn-ink group">
                Solicitar novo link
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-line bg-white px-7 py-4 text-sm font-bold uppercase tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const onSubmit = async ({ newPassword }) => {
    try {
      await authService.resetPassword({ token, newPassword });
      toast.success('Senha redefinida! Faca login com a nova senha.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 dotted-bg opacity-60" />
      <div className="pointer-events-none absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full bg-violet-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[440px] w-[440px] rounded-full bg-violet-brand/10 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-10 px-6 pt-8 lg:px-12">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-ink-line bg-white/80 px-5 py-3 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-ink">
              <path d="M14 2L8 6V12L14 16L20 12V6L14 2Z" fill="currentColor" opacity="0.85" />
              <path d="M8 16V22L14 26L20 22V16L14 20L8 16Z" fill="currentColor" />
            </svg>
            <span className="font-display text-lg font-bold text-ink">StreetLabs</span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Voltar ao login
          </Link>
        </nav>
      </header>

      {/* Conteudo */}
      <main className="relative z-10 mx-auto w-full max-w-xl px-6 py-14 lg:px-12">
        <div className="animate-fade-in-up">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink text-canvas">
              <ShieldCheck size={26} />
            </div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-ink-soft">
              Passo final
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink md:text-[2.75rem]">
              Defina uma
              <br />
              nova <span className="underline-brush">senha</span>.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              Escolha uma senha forte, com letras, números e símbolos. Ela vai proteger
              toda a sua agenda.
            </p>
          </div>

          <div className="rounded-3xl border border-ink-line bg-white p-7 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.18)] md:p-9">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nova senha */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="mínimo 6 caracteres"
                    {...register('newPassword', {
                      required: 'Nova senha é obrigatória.',
                      minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
                    })}
                    className="w-full rounded-2xl border border-ink-line bg-canvas px-11 py-3.5 pr-11 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Strength meter */}
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= strength ? strengthColor : 'bg-ink-line'
                        }`}
                        style={i > strength ? { backgroundColor: 'hsl(var(--border))' } : {}}
                      />
                    ))}
                  </div>
                  {password && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                      {strengthLabel}
                    </span>
                  )}
                </div>

                {errors.newPassword && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirmar senha */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
                  />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="repita a senha"
                    {...register('confirmPassword', {
                      required: 'Confirmação é obrigatória.',
                      validate: (val) =>
                        val === watch('newPassword') || 'As senhas não coincidem.',
                    })}
                    className="w-full rounded-2xl border border-ink-line bg-canvas px-11 py-3.5 pr-11 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Dicas */}
              <div className="rounded-2xl border border-ink-line bg-canvas/60 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  Dica de segurança
                </p>
                <ul className="space-y-1.5 text-xs text-ink-soft">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="shrink-0 text-ink" />
                    Misture letras maiúsculas, minúsculas e números
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="shrink-0 text-ink" />
                    Evite datas de aniversário e nomes próprios
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="shrink-0 text-ink" />
                    Não reutilize senhas de outros serviços
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <button type="submit" disabled={isSubmitting} className="btn-ink group w-full">
                {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
                {!isSubmitting && (
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                )}
              </button>

              <p className="pt-1 text-center text-xs text-ink-soft">
                Ao continuar, você confirma que esta conta é sua.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Mudou de ideia?{' '}
            <Link to="/login" className="font-semibold text-ink underline-offset-4 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
