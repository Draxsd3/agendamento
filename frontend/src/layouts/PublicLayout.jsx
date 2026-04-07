import { Outlet, Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <CalendarCheck size={22} />
            Agendamento
          </span>
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">
            Entrar
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
