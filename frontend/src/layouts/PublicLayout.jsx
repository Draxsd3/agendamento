import { Outlet, Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <CalendarCheck size={18} />
            Agendamento
          </span>
          {isAuthenticated ? (
            <span className="text-sm text-gray-600">{user?.name}</span>
          ) : (
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
