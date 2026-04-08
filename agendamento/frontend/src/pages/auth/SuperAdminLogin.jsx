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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  if (isAuthenticated && user?.role === 'super_admin') {
    navigate('/super-admin', { replace: true });
    return null;
  }
  if (isAuthenticated && user?.role !== 'super_admin') {
    navigate('/', { replace: true });
    return null;
  }

  const onSubmit = async (data) => {
    try {
      const loggedUser = await login(data);
      if (loggedUser.role !== 'super_admin') {
        toast.error('Acesso negado. Área exclusiva para Super Admin.');
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 mb-4">
            <ShieldCheck size={24} className="text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acesso Restrito</h1>
          <p className="text-gray-500 mt-1 text-sm">Painel exclusivo Super Admin</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-5 p-3 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-700 text-center">
            Esta área é exclusiva para administradores da plataforma.
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Email" type="email" placeholder="admin@plataforma.com" icon={Mail} required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
              })}
            />
            <Input label="Senha" type="password" placeholder="••••••••" icon={Lock} required
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
