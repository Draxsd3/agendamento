import { Home, CalendarDays, CreditCard, Layers, UserCircle, LogOut, Plus, ArrowRight } from 'lucide-react';
import CustomerBrandPanel from './CustomerBrandPanel';

const PREVIEW_NAV_ITEMS = [
  { label: 'Inicio', icon: Home, active: true },
  { label: 'Agendamentos', icon: CalendarDays },
  { label: 'Clube do assinante', icon: CreditCard },
  { label: 'Plano', icon: Layers },
  { label: 'Perfil', icon: UserCircle },
];

function PreviewSidebar({ establishment, branding, slug }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <CustomerBrandPanel
        establishment={establishment}
        branding={branding}
        slug={slug}
        className="shrink-0"
      />

      <nav className="flex-1 px-4 py-5 space-y-1">
        {PREVIEW_NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl px-3 py-3"
            style={active
              ? {
                  backgroundColor: branding.softAccent,
                  color: branding.accentColor,
                }
              : undefined}
          >
            <Icon
              size={18}
              className={active ? '' : 'text-gray-400'}
              style={active ? { color: branding.primaryColor } : undefined}
            />
            <span className={`text-sm ${active ? 'font-semibold' : 'font-medium text-gray-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-500">
          <LogOut size={18} />
          <span className="text-sm font-medium">Sair</span>
        </div>
      </div>
    </div>
  );
}

function PreviewDashboard({ establishment, branding }) {
  return (
    <div className="space-y-4 p-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Ola, Cliente</h3>
        <p className="text-sm" style={{ color: branding.primaryColor }}>
          {establishment?.name || 'Area do cliente'}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Seu plano</p>
        <p className="mt-2 font-bold text-gray-900">Plano Bronze</p>
        <p className="mt-1 text-sm text-gray-500">Voce esta aproveitando as vantagens do plano.</p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: branding.primaryColor }}>
          Detalhes sobre o plano <ArrowRight size={14} />
        </div>
      </div>

      <div
        className="rounded-2xl p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${branding.accentColor} 0%, ${branding.primaryColor} 100%)`,
        }}
      >
        <p className="font-bold">Conheca o Clube do assinante</p>
        <p className="mt-1 text-sm text-white/75">e pegue seu cupom com vantagens</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-sm font-semibold text-gray-900">Proximos agendamentos</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-500">11 de Abril, 10:30</p>
          <p className="text-sm text-gray-800">Corte de cabelo</p>
          <p className="text-sm text-gray-500">Barbeiro Teste</p>
        </div>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold"
        style={{
          backgroundColor: branding.primaryColor,
          color: branding.primaryTextColor,
        }}
      >
        <Plus size={16} />
        Novo agendamento
      </button>
    </div>
  );
}

export default function CustomerAreaPreview({ establishment, branding, slug, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-[28px] border border-gray-200 bg-gray-50 shadow-sm ${className}`}>
      <div className="grid min-h-[560px] grid-cols-[252px_minmax(0,1fr)]">
        <div className="border-r border-gray-100">
          <PreviewSidebar establishment={establishment} branding={branding} slug={slug} />
        </div>
        <PreviewDashboard establishment={establishment} branding={branding} />
      </div>
    </div>
  );
}
