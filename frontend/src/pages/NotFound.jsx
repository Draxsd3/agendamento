import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-black text-gray-800 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Página não encontrada</h1>
        <p className="text-gray-400 mb-8">A página que você está procurando não existe.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 btn-primary"
        >
          <CalendarCheck size={18} />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
