import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  CalendarCheck,
  ChevronRight,
  Shield,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { superAdminService } from '@/services/super-admin.service';

function MetricCard({ label, value, description, icon: Icon }) {
  return (
    <div className="super-admin-soft-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="super-admin-label">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{value ?? '--'}</p>
          <p className="mt-2 text-sm text-stone-950">{description}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700 shadow-sm">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminService
      .getDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const highlights = useMemo(() => {
    if (!stats) return [];

    return [
      {
        label: 'Base cadastrada',
        value: `${stats.totalEstablishments || 0} operacoes`,
        description: 'Quantidade total de estabelecimentos sob gestao da plataforma.',
      },
      {
        label: 'Saude da rede',
        value: `${stats.activeEstablishments || 0} ativos`,
        description: 'Estabelecimentos com acesso liberado e operando normalmente.',
      },
      {
        label: 'Volume operacional',
        value: `${stats.totalAppointments || 0} agendamentos`,
        description: 'Historico consolidado usado para acompanhar adocao e crescimento.',
      },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <section className="super-admin-panel overflow-hidden border-none bg-stone-950 text-white shadow-2xl shadow-stone-950/20">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-stone-400">
              Command Center
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white">
              Uma camada mais silenciosa para operar toda a plataforma.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
              O Super Admin agora fica visualmente alinhado ao sistema, mas com uma presenca
              neutra e institucional para distinguir governanca, onboarding e acesso global.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/super-admin/estabelecimentos"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-stone-950 transition-transform hover:-translate-y-0.5"
              >
                Abrir estabelecimentos
                <ChevronRight size={15} />
              </Link>
              <Link
                to="/super-admin/usuarios"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-stone-100 transition-colors hover:bg-white/[0.08]"
              >
                Revisar usuarios
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
                  {item.label}
                </p>
                <p className="mt-3 text-xl font-semibold text-white">{loading ? '--' : item.value}</p>
                <p className="mt-1 text-sm text-stone-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Estabelecimentos"
          value={loading ? '...' : stats?.totalEstablishments}
          description="Base total operada no ambiente."
          icon={Building2}
        />
        <MetricCard
          label="Ativos"
          value={loading ? '...' : stats?.activeEstablishments}
          description="Operacoes liberadas e saudaveis."
          icon={Activity}
        />
        <MetricCard
          label="Usuarios"
          value={loading ? '...' : stats?.totalUsers}
          description="Perfis com acesso ao sistema."
          icon={Users}
        />
        <MetricCard
          label="Agendamentos"
          value={loading ? '...' : stats?.totalAppointments}
          description="Volume consolidado da plataforma."
          icon={CalendarCheck}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="super-admin-panel p-6">
          <p className="super-admin-label">Leitura rapida</p>
          <h3 className="mt-3 text-xl font-semibold text-stone-950">O que esta sob controle</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              {
                title: 'Estrutura',
                text: 'Crie e acompanhe estabelecimentos em um fluxo unico de operacao.',
              },
              {
                title: 'Acesso',
                text: 'Centralize usuarios admins, clientes e acessos globais no mesmo lugar.',
              },
              {
                title: 'Financeiro',
                text: 'O detalhe do estabelecimento concentra links, admins e integracoes.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-stone-950">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="super-admin-soft-panel p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-700">
              <Shield size={18} />
            </div>
            <div>
              <p className="super-admin-label">Governanca</p>
              <h3 className="mt-1 text-lg font-semibold text-stone-950">Camada institucional</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-950">
            O objetivo desta area e parecer menos uma extensao do painel operacional e mais uma
            cabine de controle da plataforma. Por isso a paleta foi reduzida para pedra, branco
            e grafite, deixando a cor do sistema apenas onde ela realmente precisa aparecer.
          </p>
        </div>
      </section>
    </div>
  );
}
