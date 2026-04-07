import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  const roleLabel = {
    super_admin: 'Super Admin',
    establishment_admin: 'Administrador',
    customer: 'Cliente',
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-100 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
          <Bell size={18} />
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-100">{user?.name}</p>
          <p className="text-xs text-gray-500">{roleLabel[user?.role]}</p>
        </div>
      </div>
    </header>
  );
}
