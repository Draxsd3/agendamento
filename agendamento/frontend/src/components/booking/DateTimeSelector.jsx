import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { publicEstablishmentsService } from '@/services/establishments.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DateTimeSelector({ establishmentId, professionalId, serviceId, onSelect }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const next14Days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  useEffect(() => {
    if (!selectedDate || !professionalId || !serviceId) return;

    setLoadingSlots(true);
    publicEstablishmentsService
      .getSlots(establishmentId, {
        professionalId,
        serviceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
      })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, establishmentId, professionalId, serviceId]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Escolha a Data</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {next14Days.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`shrink-0 flex flex-col items-center p-3 rounded-xl border w-16 transition-all ${
                selectedDate && isSameDay(selectedDate, day)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <span className="text-xs text-gray-400 capitalize">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold text-gray-100">{format(day, 'd')}</span>
              <span className="text-xs text-gray-500">{format(day, 'MMM', { locale: ptBR })}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Escolha o Horário</h3>
          {loadingSlots ? (
            <LoadingSpinner />
          ) : slots.filter((s) => s.available).length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhum horário disponível para este dia.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots
                .filter((s) => s.available)
                .map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => onSelect({ date: selectedDate, slot })}
                    className="p-2.5 rounded-lg border border-gray-800 bg-gray-900 hover:border-blue-500 hover:bg-blue-500/10 text-sm font-medium text-gray-200 transition-all"
                  >
                    {format(new Date(slot.start), 'HH:mm')}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
