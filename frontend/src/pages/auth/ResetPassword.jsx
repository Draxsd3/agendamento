import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Lock } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/errors';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p className="text-red-400 font-medium">Link inválido ou expirado.</p>
          <Link to="/recuperar-senha" className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async ({ newPassword }) => {
    try {
      await authService.resetPassword({ token, newPassword });
      toast.success('Senha redefinida! Faça login com a nova senha.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-600/30 mb-4">
            <CalendarCheck size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Nova senha</h1>
          <p className="text-gray-400 mt-1">Escolha uma senha forte para sua conta</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nova senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Nova senha é obrigatória.',
                minLength: { value: 6, message: 'Mínimo de 6 caracteres.' },
              })}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmação é obrigatória.',
                validate: (val) =>
                  val === watch('newPassword') || 'As senhas não coincidem.',
              })}
            />
            <Button type="submit" loading={isSubmitting} className="w-full">
              Redefinir senha
            </Button>
            <p className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Voltar ao login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
