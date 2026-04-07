import { Outlet, useParams } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarCheck,
  Settings,
} from 'lucide-react';

export default function AdminLayout() {
  const { slug } = useParams();
  const base = `/admin/${slug}`;

  const navItems = [
    { to: base,                     label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: `${base}/profissionais`,  label: 'Profissionais', icon: Users },
    { to: `${base}/servicos`,       label: 'Serviços',      icon: Scissors },
    { to: `${base}/agendamentos`,   label: 'Agendamentos',  icon: CalendarCheck },
    { to: `${base}/clientes`,       label: 'Clientes',      icon: Users },
    { to: `${base}/configuracoes`,  label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar navItems={navItems} title="Painel Admin" subtitle={`/${slug}`} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
