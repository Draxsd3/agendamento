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

  // Auto-generate slug from name
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
            className="text-gray-400 hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
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
            {...register('name', { required: 'Nome é obrigatório.' })}
          />

          <Input
            label="Slug (URL)"
            placeholder="barbearia-alpha"
            required
            hint="Usado na URL pública: /{slug}"
            error={errors.slug?.message}
            {...register('slug', {
              required: 'Slug é obrigatório.',
              pattern: {
                value: /^[a-z0-9]+(-[a-z0-9]+)*$/,
                message: 'Use apenas letras minúsculas, números e hífens.',
              },
            })}
          />

          <Input
            label="Telefone"
            placeholder="(11) 99999-9999"
            {...register('phone')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Descrição</label>
            <textarea
              className="input-base resize-none h-24"
              placeholder="Breve descrição do estabelecimento..."
              {...register('description')}
            />
          </div>

          <Input
            label="Endereço"
            placeholder="Rua das Flores, 123 — São Paulo, SP"
            {...register('address')}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Salvar alterações' : 'Criar estabelecimento'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
