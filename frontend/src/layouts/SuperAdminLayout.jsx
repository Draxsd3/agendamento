import { useMemo, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  {
    to: '/super-admin',
    label: 'Dashboard',
    description: 'Visao geral da plataforma',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/super-admin/estabelecimentos',
    label: 'Estabelecimentos',
    description: 'Operacao, acesso e onboarding',
    icon: Building2,
  },
  {
    to: '/super-admin/usuarios',
    label: 'Usuarios',
    description: 'Perfis com acesso ao sistema',
    icon: Users,
  },
];

const pageMeta = [
  { match: '/super-admin/estabelecimentos', eyebrow: 'Operacao', title: 'Estabelecimentos' },
  { match: '/super-admin/usuarios', eyebrow: 'Governanca', title: 'Usuarios' },
  { match: '/super-admin', eyebrow: 'Plataforma', title: 'Super Admin' },
];

function SidebarContent({ onNavigate, onLogout, user }) {
  return (
    <div className="flex h-full flex-col rounded-[32px] border border-stone-800/80 bg-stone-950 px-4 py-5 text-stone-100 shadow-2xl shadow-stone-950/35">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <Shield size={19} className="text-stone-100" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-500">
              Controle Global
            </p>
            <p className="mt-1 text-lg font-semibold text-white">Super Admin</p>
            <p className="mt-1 text-sm text-stone-400">
              Camada neutra para operar toda a plataforma.
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-2">
        {navItems.map(({ to, label, description, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-start gap-3 rounded-2xl px-3.5 py-3 transition-all ${
                isActive
                  ? 'bg-white text-stone-950 shadow-lg shadow-black/10'
                  : 'text-stone-400 hover:bg-white/[0.05] hover:text-stone-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    isActive
                      ? 'border-stone-200 bg-stone-100 text-stone-900'
                      : 'border-white/10 bg-white/[0.04] text-stone-400 group-hover:text-stone-100'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.1 : 1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isActive ? 'text-stone-950' : 'text-stone-100'}`}>
                    {label}
                  </p>
                  <p className={`mt-0.5 text-xs ${isActive ? 'text-stone-500' : 'text-stone-500'}`}>
                    {description}
                  </p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100 text-sm font-bold text-stone-900">
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Super Admin'}</p>
            <p className="truncate text-xs text-stone-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-stone-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentMeta = useMemo(
    () => pageMeta.find((item) => location.pathname.startsWith(item.match)) || pageMeta[pageMeta.length - 1],
    [location.pathname]
  );

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="super-admin-shell flex">
      <aside className="hidden lg:block lg:w-[308px] lg:p-5 lg:pr-0">
        <div className="sticky top-5 h-[calc(100vh-2.5rem)]">
          <SidebarContent onNavigate={() => {}} onLogout={handleLogout} user={user} />
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-stone-950/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[308px] p-4 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-stone-300"
            onClick={() => setMobileOpen(false)}
          >
            <X size={16} />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} user={user} />
        </div>
      </aside>

      <div className="min-h-screen flex-1 p-4 lg:p-5">
        <div className="super-admin-panel flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden">
          <header className="border-b border-stone-200/80 px-5 py-4 lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 shadow-sm lg:hidden"
                >
                  <Menu size={18} />
                </button>

                <div>
                  <p className="super-admin-label">{currentMeta.eyebrow}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold text-stone-950">{currentMeta.title}</h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500">
                      <Sparkles size={12} />
                      Neutro e consistente
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-950">{user?.name}</p>
                  <p className="text-xs text-stone-500">Super Admin</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
