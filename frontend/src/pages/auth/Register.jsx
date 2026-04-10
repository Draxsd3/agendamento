import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck, Mail, Lock, User, Phone } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Conta criada com sucesso!');
      const activeSlug = localStorage.getItem('activeEstablishmentSlug');
      const from = location.state?.from;
      navigate(from || (activeSlug ? `/${activeSlug}/cliente` : '/minha-conta'), { replace: true });
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
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-gray-500 mt-1 text-sm">Rápido e gratuito</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Nome completo" placeholder="João Silva" icon={User} required
              error={errors.name?.message}
              {...register('name', { required: 'Nome é obrigatório.' })}
            />
            <Input label="Email" type="email" placeholder="seu@email.com" icon={Mail} required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido.' },
              })}
            />
            <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" icon={Phone}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" icon={Lock} required
              error={errors.password?.message}
              {...register('password', {
                required: 'Senha é obrigatória.',
                minLength: { value: 6, message: 'Mínimo 6 caracteres.' },
              })}
            />
            <Input label="Confirmar senha" type="password" placeholder="Repita a senha" icon={Lock} required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmação é obrigatória.',
                validate: (v) => v === watch('password') || 'As senhas não coincidem.',
              })}
            />
            <Button type="submit" loading={isSubmitting} className="w-full mt-2">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
