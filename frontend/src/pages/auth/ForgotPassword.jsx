import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CalendarCheck, Mail } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
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
      // Mensagem genérica independente de o e-mail existir (evita enumeração)
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
          <h1 className="text-2xl font-bold text-gray-100">Recuperar senha</h1>
          <p className="text-gray-400 mt-1">Enviaremos um link para seu email</p>
        </div>

        <div className="card p-8">
          {isSubmitSuccessful ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-green-400" />
              </div>
              <p className="text-gray-100 font-medium">Email enviado!</p>
              <p className="text-gray-400 text-sm mt-2">
                Verifique sua caixa de entrada e siga as instruções.
              </p>
              <Link
                to="/login"
                className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
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
              <Button type="submit" loading={isSubmitting} className="w-full">
                Enviar instruções
              </Button>
              <p className="text-center text-sm text-gray-400">
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
