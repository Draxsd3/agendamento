import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function SuperAdminLogin() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Se já logado como super_admin, redireciona direto
  if (isAuthenticated && user?.role === 'super_admin') {
    navigate('/super-admin', { replace: true });
    return null;
  }

  // Se logado como outro role, não permite acesso
  if (isAuthenticated && user?.role !== 'super_admin') {
    navigate('/', { replace: true });
    return null;
  }

  const onSubmit = async (data) => {
    try {
      const loggedUser = await login(data);
      if (loggedUser.role !== 'super_admin') {
        toast.error('Acesso negado. Esta área é exclusiva para Super Admin.');
        // Faz logout automático se não for super_admin
        localStorage.removeItem('token');
        window.location.reload();
        return;
      }
      navigate('/super-admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-purple-600/20 border border-purple-600/30 mb-4">
            <ShieldCheck size={28} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Acesso Restrito</h1>
          <p className="text-gray-400 mt-1">Painel exclusivo Super Admin</p>
        </div>

        {/* Form */}
        <div className="card p-8 border-purple-900/30">
          <div className="mb-5 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 text-center">
            Esta área é exclusiva para administradores da plataforma.
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@plataforma.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
              })}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.password?.message}
              {...register('password', { required: 'Senha é obrigatória.' })}
            />

            <Button type="submit" loading={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700">
              Entrar no painel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
