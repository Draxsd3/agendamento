import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsService } from '@/services/appointments.service';
import { financialService } from '@/services/financial.service';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle,
  User, Scissors, ChevronRight, TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const STATUS_CONFIG = {
  pending:   { label: 'Pendente',      dot: 'bg-amber-400'  },
  confirmed: { label: 'Confirmado',    dot: 'bg-blue-500'   },
  completed: { label: 'Concluído',     dot: 'bg-green-500'  },
  cancelled: { label: 'Cancelado',     dot: 'bg-red-400'    },
  no_show:   { label: 'Não compareceu',dot: 'bg-gray-400'   },
};

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

// ─── mini bar chart (appointments per day) ───────────────────────────────────
function MiniBarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-end gap-1.5 h-20">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-100 rounded-t animate-pulse"
            style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    );
  }
  if (!data.length) return <p className="text-xs text-gray-400 py-6 text-center">Sem dados</p>;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative" style={{ height: '100%' }}>
          <div className="absolute bottom-0 w-full flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all cursor-default"
              style={{
                height: `${Math.max((d.count / max) * 100, 6)}%`,
                backgroundColor: 'rgb(17 24 39)', // gray-900
                opacity: d.isToday ? 1 : 0.25,
              }}
            />
          </div>
          {/* tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              <p>{d.label}</p>
              <p className="font-bold">{d.count} agendamento{d.count !== 1 ? 's' : ''}</p>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent, loading }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading
          ? <div className="h-8 w-12 bg-gray-100 rounded animate-pulse mt-1" />
          : <p className="text-3xl font-bold text-gray-900 mt-0.5 tabular-nums">{value ?? '—'}</p>
        }
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div
        className="p-2.5 rounded-lg shrink-0"
        style={{ backgroundColor: accent ? `${accent}18` : '#f3f4f6' }}
      >
        <Icon size={20} style={{ color: accent || '#6b7280' }} />
      </div>
    </div>
  );
}

// ─── today appointment row ────────────────────────────────────────────────────
function AgendaRow({ appt, onStatusChange }) {
  const cfg  = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
  const name = appt.customers?.users?.name || '—';
  const time = format(new Date(appt.start_time), 'HH:mm');
  const isDone = ['completed', 'cancelled'].includes(appt.status);

  const STATUS_OPTIONS = ['confirmed', 'completed', 'no_show', 'cancelled'];
  const STATUS_LABELS  = { pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído', no_show: 'Não compareceu', cancelled: 'Cancelado' };

  return (
    <div className={`flex items-center gap-4 py-3 px-4 rounded-xl transition-colors ${isDone ? 'opacity-50' : 'hover:bg-gray-50'}`}>
      {/* time */}
      <span className="text-sm font-bold text-gray-900 w-12 shrink-0 tabular-nums">{time}</span>

      {/* avatar */}
      <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">{initials(name)}</span>
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">
          {appt.services?.name} · {appt.professionals?.name}
        </p>
      </div>

      {/* status + action */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
          appt.status === 'pending'   ? 'bg-amber-50  text-amber-700'  :
          appt.status === 'confirmed' ? 'bg-blue-50   text-blue-700'   :
          appt.status === 'completed' ? 'bg-green-50  text-green-700'  :
          appt.status === 'cancelled' ? 'bg-red-50    text-red-600'    :
                                        'bg-gray-100  text-gray-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
        {!isDone && (
          <select
            defaultValue=""
            onChange={(e) => e.target.value && onStatusChange(appt.id, e.target.value)}
            className="text-xs bg-white border border-gray-200 text-gray-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
          >
            <option value="" disabled>Alterar</option>
            {STATUS_OPTIONS.filter((s) => s !== appt.status).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const { establishment, branding } = useOutletContext() || {};

  const [allAppts,    setAllAppts]    = useState([]);
  const [todayAppts,  setTodayAppts]  = useState([]);
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user?.establishmentId) return;
    const eid = user.establishmentId;

    Promise.all([
      appointmentsService.getByEstablishment(eid, { limit: 60 }),
      appointmentsService.getByEstablishment(eid, { date: todayStr, limit: 50 }),
      financialService.getSummary({ period: 'month' }),
    ])
      .then(([recent, today, fin]) => {
        setAllAppts(recent.data || []);
        setTodayAppts((today.data || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
        setSummary(fin);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // ── bar chart: last 7 days ─────────────────────────────────────────────────
  const chartData = (() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const dateStr = format(d, 'yyyy-MM-dd');
      const count   = allAppts.filter(
        (a) => a.start_time.slice(0, 10) === dateStr && a.status !== 'cancelled'
      ).length;
      return {
        date:    dateStr,
        label:   format(d, 'EEE', { locale: ptBR }),
        count,
        isToday: i === 6,
      };
    });
  })();

  // ── KPI counts ────────────────────────────────────────────────────────────
  const todayActive  = todayAppts.filter((a) => !['cancelled'].includes(a.status)).length;
  const pendingCount = allAppts.filter((a) => a.status === 'pending').length;
  const confirmedCount = allAppts.filter((a) => a.status === 'confirmed').length;

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsService.updateStatus(id, status);
      const eid = user.establishmentId;
      const [recent, today] = await Promise.all([
        appointmentsService.getByEstablishment(eid, { limit: 60 }),
        appointmentsService.getByEstablishment(eid, { date: todayStr, limit: 50 }),
      ]);
      setAllAppts(recent.data || []);
      setTodayAppts((today.data || []).sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    } catch { /* silent */ }
  };

  const primary = branding?.primaryColor || '#2563EB';
  const accent  = branding?.accentColor  || '#0F172A';

  return (
    <div className="space-y-6">
      {/* ── header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        {establishment?.logo_url && (
          <img src={establishment.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
        )}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={CalendarCheck}
          label="Hoje"
          value={todayActive}
          sub="agendamentos ativos"
          accent={primary}
          loading={loading}
        />
        <KpiCard
          icon={Clock}
          label="Pendentes"
          value={pendingCount}
          sub="aguardando confirmação"
          accent="#f59e0b"
          loading={loading}
        />
        <KpiCard
          icon={CheckCircle2}
          label="Confirmados"
          value={confirmedCount}
          sub="prontos para atender"
          accent="#10b981"
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Receita do mês"
          value={fmt(summary?.total)}
          sub={`${summary?.count ?? '—'} atendimentos`}
          accent={accent}
          loading={loading}
        />
      </div>

      {/* ── 2-col grid: chart + today's agenda ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">

        {/* chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Agendamentos — últimos 7 dias</h2>
              <p className="text-xs text-gray-400 mt-0.5">Barras escuras = hoje</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ backgroundColor: primary }}
            >
              {chartData.reduce((s, d) => s + d.count, 0)} total
            </div>
          </div>
          <MiniBarChart data={chartData} loading={loading} />
          <div className="flex justify-between mt-3">
            {chartData.map((d) => (
              <span key={d.date} className={`flex-1 text-center text-xs font-medium ${d.isToday ? 'text-gray-900' : 'text-gray-300'}`}>
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* today's agenda */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid #f3f4f6' }}
          >
            <h2 className="text-sm font-semibold text-gray-900">Agenda de hoje</h2>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: todayActive > 0 ? primary : '#d1d5db' }}
            >
              {todayActive}
            </span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-1">
                  <div className="h-3 w-10 bg-gray-100 rounded animate-pulse" />
                  <div className="h-9 w-9 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <CalendarCheck size={32} className="text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-400">Sem agendamentos hoje</p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5 max-h-80 overflow-y-auto">
              {todayAppts.map((appt) => (
                <AgendaRow key={appt.id} appt={appt} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── recent appointments full table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Agendamentos recentes</h2>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : allAppts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Cliente</th>
                  <th className="px-5 py-3 text-left font-medium">Serviço</th>
                  <th className="px-5 py-3 text-left font-medium">Profissional</th>
                  <th className="px-5 py-3 text-left font-medium">Data</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allAppts.slice(0, 10).map((appt) => {
                  const cfg  = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                  const name = appt.customers?.users?.name || '—';
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">{initials(name)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-400">{appt.customers?.users?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Scissors size={13} className="text-gray-300 shrink-0" />
                          {appt.services?.name || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-gray-300 shrink-0" />
                          {appt.professionals?.name || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        <span className="font-medium text-gray-800">
                          {format(new Date(appt.start_time), 'dd/MM/yyyy')}
                        </span>
                        <span className="block text-xs text-gray-400">
                          {format(new Date(appt.start_time), 'HH:mm')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          appt.status === 'pending'   ? 'bg-amber-50  text-amber-700'  :
                          appt.status === 'confirmed' ? 'bg-blue-50   text-blue-700'   :
                          appt.status === 'completed' ? 'bg-green-50  text-green-700'  :
                          appt.status === 'cancelled' ? 'bg-red-50    text-red-600'    :
                                                        'bg-gray-100  text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
