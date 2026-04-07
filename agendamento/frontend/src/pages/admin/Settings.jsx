import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader } from '@/components/common/Card';
import Button from '@/components/common/Button';
import api from '@/services/api';
import toast from 'react-hot-toast';

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

export default function AdminSettings() {
  const { user } = useAuth();
  const [hours, setHours] = useState(defaultHours);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.establishmentId) return;
    api
      .get('/business-hours', { params: { establishmentId: user.establishmentId } })
      .then((res) => {
        if (res.data?.length) {
          const map = {};
          res.data.forEach((h) => { map[h.weekday] = h; });
          setHours(defaultHours.map((d) => map[d.weekday] ? { ...d, ...map[d.weekday] } : d));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const updateHour = (weekday, field, value) => {
    setHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, [field]: value } : h))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/business-hours', { hours });
      toast.success('Horários salvos com sucesso.');
    } catch {
      toast.error('Erro ao salvar horários.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
      </div>

      <Card>
        <CardHeader title="Horário de Funcionamento" description="Configure os dias e horários de atendimento." />

        {loading ? (
          <p className="text-gray-500 text-sm">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {hours.map((h) => {
              const day = WEEKDAYS.find((w) => w.key === h.weekday);
              return (
                <div key={h.weekday} className="flex items-center gap-4 py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3 w-40 shrink-0">
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) => updateHour(h.weekday, 'is_open', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-blue-600 bg-gray-800 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${h.is_open ? 'text-gray-100' : 'text-gray-600'}`}>
                      {day?.label}
                    </span>
                  </div>
                  {h.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.start_time}
                        onChange={(e) => updateHour(h.weekday, 'start_time', e.target.value)}
                        className="input-base w-32 text-sm"
                      />
                      <span className="text-gray-600">—</span>
                      <input
                        type="time"
                        value={h.end_time}
                        onChange={(e) => updateHour(h.weekday, 'end_time', e.target.value)}
                        className="input-base w-32 text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">Fechado</span>
                  )}
                </div>
              );
            })}

            <div className="pt-4">
              <Button onClick={handleSave} loading={saving}>
                Salvar horários
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
