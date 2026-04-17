import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CustomerBrandPanel from '@/components/branding/CustomerBrandPanel';
import { establishmentsService } from '@/services/establishments.service';
import { getBrandingTheme } from '@/utils/branding';
import {
  LayoutDashboard, Users, Scissors, CalendarCheck, Settings,
  Star, Building2, LogOut, Menu, ChevronRight, DollarSign, ImagePlus,
} from 'lucide-react';

function SidebarContent({ navItems, onNavClick, onLogout, establishment, slug, branding, user }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <CustomerBrandPanel
        establishment={establishment}
        branding={branding}
        slug={slug}
        className="shrink-0"
      />

      <nav className="flex-1 px-4 pt-5 pb-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3.5 rounded-xl transition-colors group ${
                isActive
                  ? 'font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { color: branding.accentColor, backgroundColor: branding.softAccent }
                : undefined
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  className={!isActive ? 'text-gray-400 group-hover:text-gray-600' : ''}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={isActive ? { color: branding.primaryColor } : undefined}
                />
                <span
                  className={`text-base flex-1 ${
                    isActive ? '' : 'font-medium text-gray-500 group-hover:text-gray-800'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <ChevronRight
                    size={16}
                    style={{ color: branding.primaryColor }}
                    strokeWidth={2}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">Administrador</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-4 w-full px-3 py-3 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span className="text-base font-medium text-gray-500 group-hover:text-red-600">Sair</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[11px] text-gray-300 text-center">
          {new Date().getFullYear()} &copy; AgendaFacil | v2.0
        </p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [establishment, setEstablishment] = useState(null);

  useEffect(() => {
    establishmentsService.getMine().then(setEstablishment).catch(() => {});
  }, []);

  const branding = useMemo(() => getBrandingTheme(establishment), [establishment]);

  const base = `/${slug}/admin`;
  const navItems = [
    { to: base,                    label: 'Dashboard',       icon: LayoutDashboard, end: true },
    { to: `${base}/agendamentos`,  label: 'Agendamentos',    icon: CalendarCheck },
    { to: `${base}/profissionais`, label: 'Profissionais',   icon: Users },
    { to: `${base}/servicos`,      label: 'Serviços',        icon: Scissors },
    { to: `${base}/clientes`,      label: 'Clientes',        icon: Users },
    { to: `${base}/clube`,         label: 'Clube Assinante', icon: Star },
    { to: `${base}/filiais`,       label: 'Filiais',         icon: Building2 },
    { to: `${base}/financeiro`,    label: 'Financeiro',      icon: DollarSign },
    { to: `${base}/portfolio`,     label: 'Portfólio',       icon: ImagePlus },
    { to: `${base}/configuracoes`, label: 'Configurações',   icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate(`/${slug}/login`);
  };

  const sidebarProps = { navItems, onLogout: handleLogout, establishment, slug, branding, user };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-screen shadow-sm">
        <SidebarContent {...sidebarProps} onNavClick={() => {}} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 shadow-xl transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: branding.accentColor }}
          >
            <Menu size={20} />
          </button>
          <span
            className="font-semibold text-sm truncate"
            style={{ color: branding.accentColor }}
          >
            {establishment?.name || 'Painel Admin'}
          </span>
        </header>

        <main className="flex-1 p-6 md:p-8">
          <Outlet context={{ establishment, branding, slug }} />
        </main>
      </div>
    </div>
  );
}
