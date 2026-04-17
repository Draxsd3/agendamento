import { useEffect, useState } from 'react';
import { Building2, Users, CalendarCheck, Activity } from 'lucide-react';
import { StatCard } from '@/components/common/Card';
import { superAdminService } from '@/services/super-admin.service';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminService
      .getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Estabelecimentos"
          value={loading ? '...' : stats?.totalEstablishments}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Ativos"
          value={loading ? '...' : stats?.activeEstablishments}
          icon={Activity}
          color="green"
        />
        <StatCard
          label="Usuarios"
          value={loading ? '...' : stats?.totalUsers}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Agendamentos"
          value={loading ? '...' : stats?.totalAppointments}
          icon={CalendarCheck}
          color="orange"
        />
      </div>
    </div>
  );
}
