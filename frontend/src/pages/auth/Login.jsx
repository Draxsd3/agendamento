import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck, Mail, Lock } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const getRedirect = (loggedUser) => {
    const from = location.state?.from;
    const activeSlug = localStorage.getItem('activeEstablishmentSlug');
    if (from && loggedUser.role === 'customer') return from;
    if (loggedUser.role === 'establishment_admin') return `/${loggedUser.establishmentSlug}/admin`;
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 mb-4">
            <CalendarCheck size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-gray-500 mt-1 text-sm">Entre na sua conta para continuar</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
              })}
            />
            <div>
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                required
                error={errors.password?.message}
                {...register('password', { required: 'Senha é obrigatória.' })}
              />
              <div className="flex justify-end mt-1.5">
                <Link to="/recuperar-senha" className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
