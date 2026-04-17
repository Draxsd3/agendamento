import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { establishmentsService } from '@/services/establishments.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

export default function EstablishmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isEdit) {
      establishmentsService.getById(id).then((data) => {
        Object.entries(data).forEach(([k, v]) => setValue(k, v));
      });
    }
  }, [id, isEdit, setValue]);

  const name = watch('name');
  useEffect(() => {
    if (!isEdit && name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setValue('slug', slug);
    }
  }, [name, isEdit, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await establishmentsService.update(id, data);
        toast.success('Estabelecimento atualizado.');
      } else {
        await establishmentsService.create(data);
        toast.success('Estabelecimento criado.');
      }
      navigate('/super-admin/estabelecimentos');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.75} />
          </button>
          <h1 className="page-title">{isEdit ? 'Editar' : 'Novo'} Estabelecimento</h1>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nome"
            placeholder="Barbearia Alpha"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Nome e obrigatorio.' })}
          />

          <Input
            label="Slug (URL)"
            placeholder="barbearia-alpha"
            required
            hint="Usado na URL publica: /{slug}"
            error={errors.slug?.message}
            {...register('slug', {
              required: 'Slug e obrigatorio.',
              pattern: {
                value: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                message: 'Use apenas letras minusculas, numeros e hifens.',
              },
            })}
          />

          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descricao</label>
            <textarea
              className="input-base h-24 resize-none"
              placeholder="Breve descricao do estabelecimento..."
              {...register('description')}
            />
          </div>

          <Input
            label="Endereco"
            placeholder="Rua das Flores, 123 - Sao Paulo, SP"
            {...register('address')}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Salvar alteracoes' : 'Criar estabelecimento'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
