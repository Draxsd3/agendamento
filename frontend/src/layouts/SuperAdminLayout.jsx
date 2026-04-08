import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { LayoutDashboard, Building2, Users } from 'lucide-react';

const navItems = [
  { to: '/super-admin',                  label: 'Dashboard',        icon: LayoutDashboard, end: true },
  { to: '/super-admin/estabelecimentos', label: 'Estabelecimentos', icon: Building2 },
  { to: '/super-admin/usuarios',         label: 'Usuários',         icon: Users },
];

export default function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar navItems={navItems} title="Super Admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
