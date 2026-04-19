import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/errors';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authService.forgotPassword({ email });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink relative overflow-hidden">
      <div className="absolute inset-0 dotted-bg pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-violet-brand/10 blur-3xl pointer-events-none" />

      {/* Navbar */}
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
              <Link to="/login" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">Entrar</Link>
              <Link to="/cadastro" className="text-sm text-ink/75 hover:text-ink transition-colors font-medium">Criar conta</Link>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-ink text-canvas text-xs font-bold px-4 md:px-5 py-2.5 rounded-full hover:bg-ink/85 transition-colors uppercase tracking-wide"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex items-center justify-center px-4 md:px-8 pt-12 md:pt-20 pb-20">
        <div className="w-full max-w-xl animate-fade-in-up">
          {/* Heading editorial */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-brand" />
              </span>
              Esqueceu a senha
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1] tracking-tight text-ink mb-4">
              Recupere o <span className="underline-brush">acesso</span><br />
              à sua agenda.
            </h1>
            <p className="text-ink-soft text-base max-w-md mx-auto leading-relaxed">
              Informe o email cadastrado e enviaremos um link seguro para você
              criar uma nova senha.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-ink-line bg-white p-8 sm:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
            {isSubmitSuccessful ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-ink text-canvas mx-auto mb-5">
                  <MailCheck size={22} />
                </div>
                <h2 className="font-display text-2xl font-bold text-ink mb-2">Verifique seu email</h2>
                <p className="text-sm text-ink-soft max-w-sm mx-auto leading-relaxed">
                  Se o endereço existir na nossa base, enviamos um link de recuperação.
                  O link expira em 30 minutos.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-ink hover:text-violet-brand transition-colors"
                >
                  <ArrowLeft size={14} /> Voltar ao login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-ink-soft mb-2">
                    Email cadastrado
                  </label>
                  <input
                    type="email"
                    placeholder="você@empresa.com"
                    autoComplete="email"
                    autoFocus
                    className={`w-full bg-canvas border rounded-2xl px-4 py-3.5 text-sm text-ink
                                placeholder:text-ink/35 focus:outline-none focus:bg-white
                                focus:border-ink transition-colors
                                ${errors.email ? 'border-red-500' : 'border-ink-line'}`}
                    {...register('email', {
                      required: 'Email é obrigatório.',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
                    })}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-ink w-full group py-4 !rounded-full !text-sm"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Enviar link de recuperação
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-[12px] text-ink-soft text-center leading-relaxed">
                  Por segurança, não confirmamos se o email existe na nossa base.
                </p>
              </form>
            )}
          </div>

          {/* Voltar */}
          {!isSubmitSuccessful && (
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors"
              >
                <ArrowLeft size={14} /> Lembrei a senha, voltar ao login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
