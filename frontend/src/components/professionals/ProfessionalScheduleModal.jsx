import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { professionalsService } from '@/services/professionals.service';
import { getErrorMessage } from '@/utils/errors';
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

const defaultEntries = (establishmentHours = []) => {
  const byWeekday = new Map();
  for (const entry of establishmentHours || []) {
    byWeekday.set(entry.weekday, entry);
  }
  return WEEKDAYS.map(({ key }) => {
    const fallback = byWeekday.get(key);
    return {
      weekday: key,
      start_time: fallback?.start_time?.slice(0, 5) || '09:00',
      end_time: fallback?.end_time?.slice(0, 5) || '18:00',
      is_working: key !== 'sunday',
      using_fallback: true,
    };
  });
};

function normalizeTime(value) {
  if (!value) return '';
  return String(value).slice(0, 5);
}

export default function ProfessionalScheduleModal({
  isOpen,
  onClose,
  professional,
  establishmentHours,
}) {
  const [entries, setEntries] = useState(defaultEntries(establishmentHours));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasCustomSchedule, setHasCustomSchedule] = useState(false);

  useEffect(() => {
    if (!isOpen || !professional?.id) return undefined;

    let active = true;
    setLoading(true);

    professionalsService.getSchedule(professional.id)
      .then((rows) => {
        if (!active) return;
        if (Array.isArray(rows) && rows.length > 0) {
          const map = new Map(rows.map((row) => [row.weekday, row]));
          setEntries(
            WEEKDAYS.map(({ key }) => {
              const stored = map.get(key);
              if (stored) {
                return {
                  weekday: key,
                  start_time: normalizeTime(stored.start_time),
                  end_time: normalizeTime(stored.end_time),
                  is_working: !!stored.is_working,
                  using_fallback: false,
                };
              }
              const fallback = (establishmentHours || []).find((bh) => bh.weekday === key);
              return {
                weekday: key,
                start_time: normalizeTime(fallback?.start_time) || '09:00',
                end_time: normalizeTime(fallback?.end_time) || '18:00',
                is_working: fallback?.is_open ?? (key !== 'sunday'),
                using_fallback: true,
              };
            })
          );
          setHasCustomSchedule(true);
        } else {
          setEntries(defaultEntries(establishmentHours));
          setHasCustomSchedule(false);
        }
      })
      .catch((err) => {
        if (!active) return;
        toast.error(getErrorMessage(err, 'Não foi possível carregar os horários.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, professional?.id, establishmentHours]);

  const updateEntry = (weekday, patch) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.weekday === weekday
          ? { ...entry, ...patch, using_fallback: false }
          : entry
      )
    );
  };

  const applyEstablishmentHours = () => {
    setEntries(defaultEntries(establishmentHours));
    toast.success('Horários redefinidos para o padrão do estabelecimento.');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const invalid = entries.find(
      (entry) => entry.is_working && entry.start_time >= entry.end_time
    );
    if (invalid) {
      const dayLabel = WEEKDAYS.find((w) => w.key === invalid.weekday)?.label || invalid.weekday;
      toast.error(`Horário inválido em ${dayLabel}: o início precisa ser antes do fim.`);
      return;
    }

    setSaving(true);
    try {
      await professionalsService.replaceSchedule(
        professional.id,
        entries.map(({ weekday, start_time, end_time, is_working }) => ({
          weekday,
          start_time,
          end_time,
          is_working,
        }))
      );
      toast.success('Horários do profissional salvos.');
      setHasCustomSchedule(true);
      onClose?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar os horários.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Horários · ${professional?.name || 'Profissional'}`}
      size="lg"
    >
      {loading ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-700">
            <Clock size={14} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Horário específico do profissional</p>
              <p className="mt-0.5">
                {hasCustomSchedule
                  ? 'Esses horários sobrepõem o horário de funcionamento do estabelecimento para este profissional.'
                  : 'Por enquanto este profissional segue o horário de funcionamento do estabelecimento. Ajuste abaixo para personalizar.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {entries.map((entry) => {
              const day = WEEKDAYS.find((w) => w.key === entry.weekday);
              return (
                <div
                  key={entry.weekday}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    entry.is_working ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => updateEntry(entry.weekday, { is_working: !entry.is_working })}
                    className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                    style={{ backgroundColor: entry.is_working ? '#111827' : '#d1d5db' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                      style={{ transform: entry.is_working ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>

                  <span
                    className="text-sm font-medium w-32 shrink-0"
                    style={{ color: entry.is_working ? '#111827' : '#9ca3af' }}
                  >
                    {day?.label}
                  </span>

                  {entry.is_working ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={entry.start_time}
                        onChange={(e) => updateEntry(entry.weekday, { start_time: e.target.value })}
                        className="input-base w-32 text-sm py-2"
                      />
                      <span className="text-gray-300 text-sm font-medium">→</span>
                      <input
                        type="time"
                        value={entry.end_time}
                        onChange={(e) => updateEntry(entry.weekday, { end_time: e.target.value })}
                        className="input-base w-32 text-sm py-2"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Não atende</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={applyEstablishmentHours}
              className="text-xs font-medium text-gray-500 hover:text-gray-800"
            >
              Restaurar horário do estabelecimento
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving} icon={Clock}>
                Salvar horários
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
