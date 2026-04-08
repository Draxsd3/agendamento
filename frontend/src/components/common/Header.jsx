import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user } = useAuth();

  const roleLabel = {
    super_admin: 'Super Admin',
    establishment_admin: 'Administrador',
    customer: 'Cliente',
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-400">{roleLabel[user?.role]}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-blue-700">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
