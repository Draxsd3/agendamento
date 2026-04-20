import { useEffect, useState } from 'react';
import {
  Check, CreditCard, RefreshCw, ChevronDown, ChevronUp, Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { asaasService } from '@/services/asaas.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const WEEKDAYS = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
];

const defaultHours = WEEKDAYS.map(({ key }) => ({
  weekday: key,
  start_time: '08:00',
  end_time: '18:00',
  is_open: key !== 'sunday',
}));

function SaveButton({ loading, disabled = false, onClick, children }) {
  return (
    <button
      type="button"
      disabled={loading || disabled}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : <Check size={15} strokeWidth={2.5} />}
      {children}
    </button>
  );
}

export default function AdminSettings() {
  const { user } = useAuth();

  const [hours, setHours] = useState(defaultHours);
  const [loading, setLoading] = useState(true);
  const [savingHours, setSavingHours] = useState(false);

  const [asaas, setAsaas] = useState(null);
  const [asaasLoading, setAsaasLoading] = useState(true);
  const [asaasLoadError, setAsaasLoadError] = useState('');
  const [asaasFormOpen, setAsaasFormOpen] = useState(false);
  const [savingAsaas, setSavingAsaas] = useState(false);
  const [syncingAsaas, setSyncingAsaas] = useState(false);
  const [asaasForm, setAsaasForm] = useState({
    name: '', email: '', cpfCnpj: '', personType: 'FISICA',
    birthDate: '', companyType: '', incomeValue: '',
    phone: '', address: '', addressNumber: '', complement: '',
    province: '', postalCode: '',
  });

  useEffect(() => {
    if (!user?.establishmentId) return;
    asaasService.getSubaccount()
      .then((data) => {
        setAsaasLoadError('');
        setAsaas(data);
        if (data.configured) setAsaasFormOpen(false);
      })
      .catch((err) => {
        setAsaas(null);
        setAsaasLoadError(getErrorMessage(err, 'Nao foi possivel carregar o status da integracao Asaas.'));
      })
      .finally(() => setAsaasLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user?.establishmentId) return;
    const load = async () => {
      try {
        const hoursRes = await api.get('/business-hours', { params: { establishmentId: user.establishmentId } });
        if (hoursRes.data?.length) {
          const map = {};
          hoursRes.data.forEach((item) => { map[item.weekday] = item; });
          setHours(defaultHours.map((item) => (map[item.weekday] ? { ...item, ...map[item.weekday] } : item)));
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar configurações.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const updateHour = (weekday, field, value) =>
    setHours((prev) => prev.map((item) => item.weekday === weekday ? { ...item, [field]: value } : item));

  const handleCreateSubaccount = async () => {
    if (asaasLoadError) {
      toast.error(asaasLoadError);
      return;
    }

    setSavingAsaas(true);
    try {
      const data = await asaasService.createSubaccount({
        ...asaasForm,
        incomeValue: Number(asaasForm.incomeValue),
      });
      setAsaasLoadError('');
      setAsaas(data);
      setAsaasFormOpen(false);
      toast.success('Subconta Asaas criada com sucesso!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingAsaas(false);
    }
  };

  const handleSyncAsaas = async () => {
    setSyncingAsaas(true);
    try {
      const data = await asaasService.syncSubaccount();
      setAsaas(data);
      toast.success('Status sincronizado.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSyncingAsaas(false);
    }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      await api.put('/business-hours', { hours });
      toast.success('Horários salvos.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar horários.'));
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="space-y-6 max-w-none">
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configurações gerais do sistema e integrações do estabelecimento.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <CreditCard size={16} className="text-gray-700" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Integração Asaas</p>
              <p className="text-xs text-gray-400">Cobranças recorrentes via checkout Asaas</p>
            </div>
          </div>
          {!asaasLoading && asaas && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              asaas.configured
                ? 'bg-green-50 text-green-700'
                : asaas.integration_ready === false
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              {asaas.configured
                ? 'Conectado'
                : asaas.integration_ready === false
                  ? 'Backend nao configurado'
                  : 'Nao configurado'}
            </span>
          )}
        </div>

        {asaasLoading ? (
          <div className="p-6 space-y-3">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : asaas?.configured ? (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email da subconta</p>
                <p className="font-medium text-gray-800">{asaas.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Chave de API</p>
                <p className="font-mono text-gray-700">{asaas.api_key_masked || '—'}</p>
              </div>
              {asaas.cpf_cnpj && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">CPF/CNPJ</p>
                  <p className="font-medium text-gray-800">{asaas.cpf_cnpj}</p>
                </div>
              )}
              {asaas.last_synced_at && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Última sincronia</p>
                  <p className="text-gray-600">{new Date(asaas.last_synced_at).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>

            {asaas.onboarding_links?.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">Documentação pendente</p>
                <div className="space-y-1.5">
                  {asaas.onboarding_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.onboardingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 underline"
                    >
                      {link.title || link.type}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">Checkout recorrente</p>
              <p className="text-xs text-gray-500 mt-1">
                O sistema usa checkout hospedado do Asaas como fluxo padrão de cobrança recorrente.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncAsaas}
              disabled={syncingAsaas}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncingAsaas ? 'animate-spin' : ''} />
              Sincronizar status
            </button>
          </div>
        ) : (
          <div className="p-6">
            {asaasLoadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-900">Não foi possível carregar a integração Asaas.</p>
                <p className="mt-1 text-xs text-red-700">{asaasLoadError}</p>
              </div>
            )}

            {asaas?.integration_ready === false && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">A integração raiz do Asaas não está configurada neste backend.</p>
                <p className="mt-1 text-xs text-amber-700">
                  Configure a variável `ASAAS_API_KEY` no servidor antes de tentar criar a subconta.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Configure uma subconta Asaas para aceitar pagamentos recorrentes diretamente pelos seus planos.
            </p>

            <button
              type="button"
              onClick={() => setAsaasFormOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {asaasFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {asaasFormOpen ? 'Fechar formulário' : 'Configurar subconta Asaas'}
            </button>

            {asaasFormOpen && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Nome *</label>
                    <input className="input-base text-sm" value={asaasForm.name} onChange={(e) => setAsaasForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                    <input type="email" className="input-base text-sm" value={asaasForm.email} onChange={(e) => setAsaasForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">CPF / CNPJ *</label>
                    <input className="input-base text-sm" value={asaasForm.cpfCnpj} onChange={(e) => setAsaasForm((f) => ({ ...f, cpfCnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de pessoa</label>
                    <select className="input-base text-sm" value={asaasForm.personType} onChange={(e) => setAsaasForm((f) => ({ ...f, personType: e.target.value }))}>
                      <option value="FISICA">Pessoa Física</option>
                      <option value="JURIDICA">Pessoa Jurídica</option>
                    </select>
                  </div>
                  {asaasForm.personType === 'FISICA' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Data de nascimento</label>
                      <input type="date" className="input-base text-sm" value={asaasForm.birthDate} onChange={(e) => setAsaasForm((f) => ({ ...f, birthDate: e.target.value }))} />
                    </div>
                  )}
                  {asaasForm.personType === 'JURIDICA' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de empresa</label>
                      <select className="input-base text-sm" value={asaasForm.companyType} onChange={(e) => setAsaasForm((f) => ({ ...f, companyType: e.target.value }))}>
                        <option value="">Selecione...</option>
                        <option value="MEI">MEI</option>
                        <option value="LIMITED">Ltda</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="ASSOCIATION">Associação</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Renda mensal (R$) *</label>
                    <input type="number" min="0" step="0.01" className="input-base text-sm" value={asaasForm.incomeValue} onChange={(e) => setAsaasForm((f) => ({ ...f, incomeValue: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Telefone *</label>
                    <input className="input-base text-sm" value={asaasForm.phone} onChange={(e) => setAsaasForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">CEP *</label>
                    <input className="input-base text-sm" value={asaasForm.postalCode} onChange={(e) => setAsaasForm((f) => ({ ...f, postalCode: e.target.value }))} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Rua *</label>
                    <input className="input-base text-sm" value={asaasForm.address} onChange={(e) => setAsaasForm((f) => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Número *</label>
                    <input className="input-base text-sm" value={asaasForm.addressNumber} onChange={(e) => setAsaasForm((f) => ({ ...f, addressNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Complemento</label>
                    <input className="input-base text-sm" value={asaasForm.complement} onChange={(e) => setAsaasForm((f) => ({ ...f, complement: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Bairro *</label>
                    <input className="input-base text-sm" value={asaasForm.province} onChange={(e) => setAsaasForm((f) => ({ ...f, province: e.target.value }))} />
                  </div>
                </div>

                <SaveButton
                  loading={savingAsaas}
                  disabled={Boolean(asaasLoadError) || asaas?.integration_ready === false}
                  onClick={handleCreateSubaccount}
                >
                  Criar subconta Asaas
                </SaveButton>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <Clock size={16} className="text-gray-700" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Horário de funcionamento</p>
            <p className="text-xs text-gray-400">Configure os dias e horários de atendimento.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-2">
              {hours.map((item) => {
                const day = WEEKDAYS.find((w) => w.key === item.weekday);
                return (
                  <div
                    key={item.weekday}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                      item.is_open ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => updateHour(item.weekday, 'is_open', !item.is_open)}
                      className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                      style={{ backgroundColor: item.is_open ? '#111827' : '#d1d5db' }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: item.is_open ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>

                    <span className="text-sm font-medium w-32 shrink-0" style={{ color: item.is_open ? '#111827' : '#9ca3af' }}>
                      {day?.label}
                    </span>

                    {item.is_open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={item.start_time}
                          onChange={(e) => updateHour(item.weekday, 'start_time', e.target.value)}
                          className="input-base w-32 text-sm py-2"
                        />
                        <span className="text-gray-300 text-sm font-medium">→</span>
                        <input
                          type="time"
                          value={item.end_time}
                          onChange={(e) => updateHour(item.weekday, 'end_time', e.target.value)}
                          className="input-base w-32 text-sm py-2"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <SaveButton loading={savingHours} onClick={handleSaveHours}>
                Salvar horários
              </SaveButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
