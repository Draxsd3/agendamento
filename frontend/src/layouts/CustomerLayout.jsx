import { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CustomerBrandPanel from '@/components/branding/CustomerBrandPanel';
import { publicEstablishmentsService } from '@/services/establishments.service';
import { getBrandingTheme } from '@/utils/branding';
import {
  Home, CalendarDays, CreditCard, Layers, UserCircle, LogOut, Menu,
} from 'lucide-react';

function SidebarContent({ navItems, onNavClick, onLogout, establishment, slug, branding }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <CustomerBrandPanel
        establishment={establishment}
        branding={branding}
        slug={slug}
        className="shrink-0"
      />

      <nav className="flex-1 px-4 pt-5 pb-2 space-y-0.5">
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
            style={({ isActive }) => (isActive
              ? {
                  color: branding.accentColor,
                  backgroundColor: branding.softAccent,
                }
              : undefined)}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  className={!isActive ? 'text-gray-400 group-hover:text-gray-600' : ''}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={isActive ? { color: branding.primaryColor } : undefined}
                />
                <span className={`text-base ${isActive ? '' : 'font-medium text-gray-500 group-hover:text-gray-800'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 w-full px-3 py-3.5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors group"
        >
          <LogOut size={22} strokeWidth={1.5} className="group-hover:text-gray-600" />
          <span className="text-base font-medium text-gray-500 group-hover:text-gray-800">Sair</span>
        </button>
      </div>

      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
        <p className="text-[11px] text-gray-300 text-center">
          {new Date().getFullYear()} &copy; AgendaFacil | v2.0
        </p>
      </div>
    </div>
  );
}

export default function CustomerLayout() {
  const { logout } = useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [establishment, setEstablishment] = useState(null);

  useEffect(() => {
    if (!slug) return;
    publicEstablishmentsService.getBySlug(slug).then(setEstablishment).catch(() => {});
  }, [slug]);

  const branding = useMemo(() => getBrandingTheme(establishment), [establishment]);

  const basePath = slug ? `/${slug}/cliente` : '/minha-conta';
  const navItems = [
    { to: basePath, label: 'Inicio', icon: Home, end: true },
    { to: `${basePath}/agendamentos`, label: 'Agendamentos', icon: CalendarDays },
    { to: `${basePath}/clube`, label: 'Clube do assinante', icon: CreditCard },
    { to: `${basePath}/plano`, label: 'Plano', icon: Layers },
    { to: `${basePath}/perfil`, label: 'Perfil', icon: UserCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate(slug ? `/${slug}/login` : '/login');
  };

  const sidebarProps = { navItems, onLogout: handleLogout, establishment, slug, branding };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-screen shadow-sm">
        <SidebarContent {...sidebarProps} onNavClick={() => {}} />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 shadow-xl transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 sticky top-0 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: branding.accentColor }}
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm truncate" style={{ color: branding.accentColor }}>
            {establishment?.name || (slug ? 'Minha area' : 'Minha Conta')}
          </span>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-8">
          <Outlet context={{ establishment, slug, branding }} />
        </main>
      </div>
    </div>
  );
}
