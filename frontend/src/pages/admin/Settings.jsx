import { useEffect, useState } from 'react';
import {
  Check, Clock, CreditCard, MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const WHATSAPP_NUMBER = '5511999999999';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá! Gostaria de integrar um gateway de pagamento no meu sistema de agendamento.'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

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

const PAYMENT_METHODS = [
  { key: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { key: 'pix', label: 'PIX', icon: '⚡' },
  { key: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { key: 'cartao_debito', label: 'Cartão de Débito', icon: '💳' },
  { key: 'transferencia', label: 'Transferência Bancária', icon: '🏦' },
];

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

      {/* Formas de Recebimento */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <CreditCard size={16} className="text-gray-700" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Formas de Recebimento</p>
            <p className="text-xs text-gray-400">Como você recebe o pagamento dos seus clientes</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Informe aos seus clientes as formas de pagamento que você aceita. O pagamento é combinado
            diretamente entre você e o cliente no momento do atendimento.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.key}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50"
              >
                <span className="text-lg">{method.icon}</span>
                <span className="text-sm font-medium text-gray-700">{method.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">Quer integrar um gateway de pagamento?</p>
            <p className="text-xs text-blue-700 mb-3">
              Podemos integrar com o banco ou solução de pagamentos que você já utiliza — PIX automático,
              link de pagamento, maquininha e muito mais. Entre em contato para saber mais.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={15} />
              Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Horário de Funcionamento */}
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
