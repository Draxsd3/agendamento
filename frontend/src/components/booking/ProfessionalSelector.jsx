import { User } from 'lucide-react';

export default function ProfessionalSelector({
  professionals,
  selected,
  onSelect,
  showNoPreference = true,
  theme,
}) {
  const noPreference = {
    id: null,
    name: 'Sem preferencia',
    bio: 'Qualquer profissional disponivel',
    avatar_url: null,
  };
  const items = showNoPreference ? [...professionals, noPreference] : professionals;

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
        Escolha o profissional
      </p>
      <div className="grid grid-cols-3 gap-3">
        {items.map((professional) => {
          const isSelected = selected?.id === professional.id;

          return (
            <button
              key={professional.id ?? 'no-pref'}
              onClick={() => onSelect(professional)}
              className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-all"
              style={isSelected
                ? {
                    borderColor: theme?.primaryColor || '#111827',
                    backgroundColor: theme?.accentColor || '#111827',
                  }
                : {
                    borderColor: theme?.subtleBorder || '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border shrink-0"
                style={{
                  backgroundColor: theme?.softPrimary || '#F3F4F6',
                  borderColor: isSelected ? 'rgba(255,255,255,0.18)' : (theme?.subtleBorder || '#E5E7EB'),
                }}
              >
                {professional.avatar_url ? (
                  <img src={professional.avatar_url} alt={professional.name} className="h-full w-full object-cover" />
                ) : (
                  <User size={28} style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : (theme?.primaryColor || '#9CA3AF') }} />
                )}
              </div>
              <p
                className="text-center text-xs font-medium leading-tight"
                style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : '#1F2937' }}
              >
                {professional.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
