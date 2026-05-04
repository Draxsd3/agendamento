import { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { customersService } from '@/services/customers.service';
import { useAuth } from '@/contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

function FieldRow({ label, children, branding }) {
  return (
    <div
      className="rounded-lg border bg-white px-4 py-3"
      style={{ borderColor: branding?.subtleBorder || '#E5E7EB' }}
    >
      <p className="mb-0.5 text-xs text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function FieldInput({ label, branding, ...props }) {
  return (
    <FieldRow label={label} branding={branding}>
      <input
        {...props}
        className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300"
      />
    </FieldRow>
  );
}

export default function CustomerProfile() {
  const { user } = useAuth();
  const outletContext = useOutletContext();
  const branding = outletContext?.branding || null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    date_of_birth: '',
    city: '',
    province: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    notes: '',
  });

  useEffect(() => {
    customersService.getProfile()
      .then((data) => {
        const rawAddress = data.address || '';
        let street = '';
        let number = '';
        let complement = '';
        let cep = '';

        try {
          const parsed = JSON.parse(rawAddress);
          street = parsed.street || '';
          number = parsed.number || '';
          complement = parsed.complement || '';
          cep = parsed.cep || '';
        } catch {
          street = rawAddress;
        }

        setForm({
          name: data.users?.name || '',
          email: data.users?.email || '',
          phone: data.phone || '',
          cpf: data.cpf || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          city: data.city || '',
          province: data.province || '',
          cep,
          street,
          number,
          complement,
          notes: data.notes || '',
        });
      })
      .catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar perfil.')))
      .finally(() => setLoading(false));
  }, []);

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const addressJson = JSON.stringify({
        street: form.street,
        number: form.number,
        complement: form.complement,
        cep: form.cep,
      });
      await customersService.updateProfile({ ...form, address: addressJson });
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-3">
      <div className="flex flex-col items-center gap-2 pb-2">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: branding?.softPrimary || '#E5E7EB' }}
        >
          <User size={36} style={{ color: branding?.primaryColor || '#9CA3AF' }} />
        </div>
        <button type="button" className="text-xs transition-colors" style={{ color: branding?.primaryColor || '#6B7280' }}>
          Altere sua foto de perfil
        </button>
      </div>

      <FieldInput label="Nome completo *" branding={branding} value={form.name} onChange={setField('name')} placeholder={user?.name} />
      <FieldInput label="Email *" branding={branding} type="email" value={form.email} onChange={setField('email')} placeholder={user?.email} />
      <FieldInput label="Telefone *" branding={branding} value={form.phone} onChange={setField('phone')} placeholder="(11) 99999-9999" />
      <FieldInput label="Data nascimento *" branding={branding} type="date" value={form.date_of_birth} onChange={setField('date_of_birth')} />
      <FieldInput label="CPF *" branding={branding} value={form.cpf} onChange={setField('cpf')} placeholder="000.000.000-00" />
      <FieldInput label="CEP *" branding={branding} value={form.cep} onChange={setField('cep')} placeholder="00000-000" />
      <FieldInput label="Rua *" branding={branding} value={form.street} onChange={setField('street')} placeholder="Nome da rua" />
      <FieldInput label="Numero *" branding={branding} value={form.number} onChange={setField('number')} placeholder="123" />
      <FieldInput label="Bairro *" branding={branding} value={form.province} onChange={setField('province')} placeholder="Centro" />
      <FieldInput label="Cidade *" branding={branding} value={form.city} onChange={setField('city')} placeholder="Sao Paulo" />
      <FieldInput label="Complemento" branding={branding} value={form.complement} onChange={setField('complement')} placeholder="Apto, bloco..." />

      <FieldRow label="Observacoes" branding={branding}>
        <textarea
          value={form.notes}
          onChange={setField('notes')}
          rows={2}
          placeholder="Alergias, preferencias..."
          className="w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300"
        />
      </FieldRow>

      <p className="text-xs text-gray-400">
        CPF, telefone e endereço completo são obrigatórios para assinar planos.
      </p>

      <button
        type="submit"
        disabled={saving}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold transition-colors disabled:opacity-60"
        style={{
          backgroundColor: branding?.primaryColor || '#111827',
          color: branding?.primaryTextColor || '#FFFFFF',
        }}
      >
        <Save size={16} />
        {saving ? 'Salvando...' : 'Salvar alteracoes'}
      </button>
    </form>
  );
}
