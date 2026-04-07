import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck, LogOut, User } from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/minha-conta" className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <CalendarCheck size={22} />
            Meus Agendamentos
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <User size={14} />
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
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
