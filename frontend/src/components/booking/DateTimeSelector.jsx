import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { publicEstablishmentsService } from '@/services/establishments.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DateTimeSelector({ establishmentId, professionalId, serviceId, onSelect, theme }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const next14Days = Array.from({ length: 14 }, (_, index) => addDays(new Date(), index));

  useEffect(() => {
    if (!selectedDate || !serviceId) return;

    setLoadingSlots(true);
    publicEstablishmentsService
      .getSlots(establishmentId, {
        professionalId: professionalId || undefined,
        serviceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
      })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, establishmentId, professionalId, serviceId]);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
          Escolha a data
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {next14Days.map((day) => {
            const isSelected = selectedDate && isSameDay(selectedDate, day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className="flex w-14 shrink-0 flex-col items-center rounded-lg border p-2.5 transition-all"
                style={isSelected
                  ? {
                      borderColor: theme?.primaryColor || '#111827',
                      backgroundColor: theme?.accentColor || '#111827',
                      color: theme?.accentTextColor || '#FFFFFF',
                    }
                  : {
                      borderColor: theme?.subtleBorder || '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#374151',
                    }}
              >
                <span className="text-xs capitalize" style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : '#9CA3AF' }}>
                  {format(day, 'EEE', { locale: ptBR })}
                </span>
                <span className="mt-0.5 text-base font-bold" style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : '#111827' }}>
                  {format(day, 'd')}
                </span>
                <span className="text-xs capitalize" style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : '#9CA3AF' }}>
                  {format(day, 'MMM', { locale: ptBR })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate ? (
        <div>
          <p className="mb-3 text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
            Horarios disponiveis
          </p>
          {loadingSlots ? (
            <LoadingSpinner />
          ) : slots.filter((slot) => slot.available).length === 0 ? (
            <p className="py-4 text-sm" style={{ color: '#9CA3AF' }}>
              Nenhum horario disponivel para este dia.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots
                .filter((slot) => slot.available)
                .map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => onSelect({ date: selectedDate, slot })}
                    className="rounded-lg border p-2.5 text-sm font-medium transition-all"
                    style={{
                      borderColor: theme?.subtleBorder || '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: theme?.accentColor || '#374151',
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.borderColor = theme?.primaryColor || '#111827';
                      event.currentTarget.style.backgroundColor = theme?.accentColor || '#111827';
                      event.currentTarget.style.color = theme?.accentTextColor || '#FFFFFF';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.borderColor = theme?.subtleBorder || '#E5E7EB';
                      event.currentTarget.style.backgroundColor = '#FFFFFF';
                      event.currentTarget.style.color = theme?.accentColor || '#374151';
                    }}
                  >
                    {format(new Date(slot.start), 'HH:mm')}
                  </button>
                ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
