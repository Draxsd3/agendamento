import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck, Mail, Lock, User, Phone } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Conta criada com sucesso!');
      navigate('/minha-conta', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600/20 border border-blue-600/30 mb-4">
            <CalendarCheck size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Criar sua conta</h1>
          <p className="text-gray-400 mt-1">Rápido e gratuito</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nome completo"
              placeholder="João Silva"
              icon={User}
              required
              error={errors.name?.message}
              {...register('name', { required: 'Nome é obrigatório.' })}
            />

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

            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              icon={Phone}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              icon={Lock}
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Senha é obrigatória.',
                minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres.' },
              })}
            />

            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              icon={Lock}
              required
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

          <p className="text-center text-sm text-gray-400 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
