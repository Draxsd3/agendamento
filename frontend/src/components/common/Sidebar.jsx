import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, CalendarCheck } from 'lucide-react';

export default function Sidebar({ navItems, title, subtitle }) {
  const { logout, user } = useAuth();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarCheck size={18} className="text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 truncate font-mono">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2.5 mb-2 px-1">
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-blue-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500
                     hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
