import { User } from 'lucide-react';

export default function ProfessionalSelector({ professionals, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-100">Escolha o Profissional</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {professionals.map((prof) => (
          <button
            key={prof.id}
            onClick={() => onSelect(prof)}
            className={`text-left p-4 rounded-xl border transition-all ${
              selected?.id === prof.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                {prof.avatar_url ? (
                  <img
                    src={prof.avatar_url}
                    alt={prof.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-100">{prof.name}</p>
                {prof.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{prof.bio}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
