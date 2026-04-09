import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function TenantRegister() {
  const { slug } = useParams();
  const { establishment, branding } = useOutletContext();
  const { register: registerUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(`/${slug}/cliente`, { replace: true });
  }, [isAuthenticated, user, navigate, slug]);

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Conta criada com sucesso!');
      navigate(location.state?.from || `/${slug}/cliente`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="w-full max-w-lg">
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
              <UserPlus size={26} />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Criar conta em {establishment?.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Sua conta vai ficar pronta para agendamentos, planos e acompanhamento dentro deste estabelecimento.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nome completo"
              placeholder="Seu nome"
              icon={User}
              required
              error={errors.name?.message}
              {...register('name', { required: 'Nome e obrigatorio.' })}
            />
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
            <Input
              label="Telefone"
              placeholder="(11) 99999-9999"
              icon={Phone}
              {...register('phone')}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Minimo 6 caracteres"
              icon={Lock}
              required
              error={errors.password?.message}
              {...register('password', {
                required: 'Senha e obrigatoria.',
                minLength: { value: 6, message: 'Minimo 6 caracteres.' },
              })}
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita sua senha"
              icon={Lock}
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmacao obrigatoria.',
                validate: (value) => value === watch('password') || 'As senhas nao coincidem.',
              })}
            />
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
              style={{
                backgroundColor: branding.primaryColor,
                color: branding.primaryTextColor,
              }}
            >
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Ja tem conta?{' '}
            <Link to={`/${slug}/login`} state={{ from: location.state?.from }} className="font-medium transition-colors" style={{ color: branding.primaryColor }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
