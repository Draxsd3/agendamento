import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function TenantLogin() {
  const { slug } = useParams();
  const { establishment, branding } = useOutletContext();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const getRedirect = (loggedUser) => {
    const from = location.state?.from;
    if (from && loggedUser.role === 'customer') return from;
    if (loggedUser.role === 'establishment_admin') return `/${loggedUser.establishmentSlug}/admin`;
    return `/${slug}/cliente`;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role === 'super_admin') {
      navigate('/super-admin', { replace: true });
      return;
    }

    navigate(getRedirect(user), { replace: true });
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    try {
      const loggedUser = await login(data);
      if (loggedUser.role === 'super_admin') {
        toast.error('Use o acesso exclusivo do Super Admin.');
        localStorage.removeItem('token');
        window.location.href = '/super-admin/login';
        return;
      }
      navigate(getRedirect(loggedUser), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {establishment?.logo_url ? (
            <img
              src={establishment.logo_url}
              alt={`Logo de ${establishment?.name}`}
              className="h-16 w-16 rounded-2xl object-cover mx-auto mb-4 border"
              style={{
                borderColor: branding.subtleBorder,
                backgroundColor: branding.softPrimary,
              }}
            />
          ) : (
            <div
              className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-4 border"
              style={{
                borderColor: branding.subtleBorder,
                backgroundColor: branding.softPrimary,
                color: branding.primaryColor,
              }}
            >
              <LogIn size={26} />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Entrar em {establishment?.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Acesse sua conta para agendar e acompanhar seus planos neste estabelecimento.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email e obrigatorio.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email invalido.' },
              })}
            />

            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha"
                icon={Lock}
                required
                error={errors.password?.message}
                {...register('password', { required: 'Senha e obrigatoria.' })}
              />
              <div className="flex justify-end mt-1.5">
                <Link to="/recuperar-senha" className="text-xs transition-colors" style={{ color: branding.primaryColor }}>
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              style={{
                backgroundColor: branding.primaryColor,
                color: branding.primaryTextColor,
              }}
            >
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ainda nao tem conta?{' '}
            <Link to={`/${slug}/cadastro`} state={{ from: location.state?.from }} className="font-medium transition-colors" style={{ color: branding.primaryColor }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
