import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck, LogOut } from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/minha-conta" className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <CalendarCheck size={18} />
            Meus Agendamentos
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
