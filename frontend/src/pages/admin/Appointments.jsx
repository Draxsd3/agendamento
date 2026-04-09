import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsService } from '@/services/appointments.service';
import {
  CalendarCheck, User, Scissors, Clock,
  CheckCircle2, XCircle, ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

// ─── constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Pendente',        dot: 'bg-amber-400',   pill: 'bg-amber-50  text-amber-700'  },
  confirmed: { label: 'Confirmado',      dot: 'bg-blue-500',    pill: 'bg-blue-50   text-blue-700'   },
  completed: { label: 'Compareceu',      dot: 'bg-green-500',   pill: 'bg-green-50  text-green-700'  },
  cancelled: { label: 'Cancelado',       dot: 'bg-red-400',     pill: 'bg-red-50    text-red-600'    },
  no_show:   { label: 'Não compareceu',  dot: 'bg-gray-400',    pill: 'bg-gray-100  text-gray-500'   },
};

const STATUS_TABS = [
  { value: '',          label: 'Todos'       },
  { value: 'pending',   label: 'Pendentes'   },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Concluídos'  },
  { value: 'cancelled', label: 'Cancelados'  },
];

const OTHER_ACTIONS = [
  { value: 'confirmed', label: 'Confirmar'   },
  { value: 'cancelled', label: 'Cancelar'    },
];

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

// ─── Quick presence buttons + dropdown for others ────────────────────────────
function ActionCell({ appt, onUpdate, primary }) {
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(null); // which action is saving

  const isDone = ['completed', 'cancelled', 'no_show'].includes(appt.status);
  const cfg    = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

  const handle = async (status) => {
    setOpen(false);
    setSaving(status);
    try {
      await onUpdate(appt.id, status);
    } finally {
      setSaving(null);
    }
  };

  if (isDone) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${cfg.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* ✓ Compareceu */}
      <button
        title="Compareceu"
        disabled={saving !== null}
        onClick={() => handle('completed')}
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-60"
      >
        {saving === 'completed'
          ? <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          : <CheckCircle2 size={14} strokeWidth={2} />}
        <span className="hidden sm:inline">Compareceu</span>
      </button>

      {/* ✗ Não compareceu */}
      <button
        title="Não compareceu"
        disabled={saving !== null}
        onClick={() => handle('no_show')}
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-60"
      >
        {saving === 'no_show'
          ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          : <XCircle size={14} strokeWidth={2} />}
        <span className="hidden sm:inline">Faltou</span>
      </button>

      {/* ··· other actions */}
      <div className="relative">
        <button
          disabled={saving !== null}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Mais ações"
        >
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px] overflow-hidden py-1">
              {OTHER_ACTIONS.filter((a) => a.value !== appt.status).map((a) => (
                <button
                  key={a.value}
                  onClick={() => handle(a.value)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function ApptRow({ appt, onUpdate, primary, accent }) {
  const name  = appt.customers?.users?.name  || '—';
  const email = appt.customers?.users?.email || '';
  const date  = new Date(appt.start_time);
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors border-b border-gray-50 last:border-0">
      {/* avatar */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent }}
      >
        <span className="text-sm font-bold text-white">{initials(name)}</span>
      </div>

      {/* client */}
      <div className="w-44 shrink-0 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{email}</p>
      </div>

      {/* service */}
      <div className="flex-1 min-w-0 hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
        <Scissors size={13} className="text-gray-300 shrink-0" />
        <span className="truncate">{appt.services?.name || '—'}</span>
      </div>

      {/* professional */}
      <div className="w-36 hidden md:flex items-center gap-1.5 text-sm text-gray-500 shrink-0">
        <User size={13} className="text-gray-300 shrink-0" />
        <span className="truncate">{appt.professionals?.name || '—'}</span>
      </div>

      {/* date */}
      <div className="text-right shrink-0 hidden lg:block w-28">
        <p className={`text-sm font-medium tabular-nums ${isToday ? 'font-bold' : 'text-gray-800'}`}
          style={isToday ? { color: primary } : {}}>
          {isToday ? 'Hoje' : format(date, 'dd/MM/yyyy')}
        </p>
        <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
          <Clock size={11} />
          {format(date, 'HH:mm')}
        </p>
      </div>

      {/* actions */}
      <div className="shrink-0">
        <ActionCell appt={appt} onUpdate={onUpdate} primary={primary} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminAppointments() {
  const { user }    = useAuth();
  const ctx         = useOutletContext() || {};
  const branding    = ctx.branding || {};
  const primary     = branding.primaryColor || '#111827';
  const accent      = branding.accentColor  || '#111827';

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate,   setFilterDate]   = useState('');

  const load = useCallback(() => {
    if (!user?.establishmentId) return;
    setLoading(true);
    appointmentsService
      .getByEstablishment(user.establishmentId, {
        status: filterStatus || undefined,
        date:   filterDate   || undefined,
        limit:  100,
      })
      .then((res) => setAppointments(res.data || []))
      .finally(() => setLoading(false));
  }, [user, filterStatus, filterDate]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (id, status) => {
    try {
      await appointmentsService.updateStatus(id, status);
      const label = STATUS_CONFIG[status]?.label || status;
      toast.success(`Marcado como: ${label}`);
      load();
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  // count per status
  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* header */}
      <div>
        <h1 className="page-title">Agendamentos</h1>
        <p className="text-sm text-gray-400 mt-0.5 capitalize">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* status tabs */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {STATUS_TABS.map((tab) => {
            const active = filterStatus === tab.value;
            const cnt    = tab.value ? (counts[tab.value] || 0) : appointments.length;
            return (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {cnt > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={active
                      ? { backgroundColor: primary, color: '#fff' }
                      : { backgroundColor: '#e5e7eb', color: '#6b7280' }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* date filter */}
        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input-base pl-9 w-40 text-sm py-2"
          />
          <CalendarCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Limpar data
          </button>
        )}
      </div>

      {/* hint */}
      {!filterStatus && appointments.some((a) => ['pending','confirmed'].includes(a.status)) && (
        <div
          className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-lg"
          style={{ backgroundColor: primary + '12', color: primary }}
        >
          <CheckCircle2 size={14} />
          Clique em <strong>Compareceu</strong> ou <strong>Faltou</strong> para registrar a presença do cliente.
        </div>
      )}

      {/* list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* thead */}
        <div className="hidden lg:flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-medium">
          <div className="w-10 shrink-0" />
          <div className="w-44 shrink-0">Cliente</div>
          <div className="flex-1">Serviço</div>
          <div className="w-36 shrink-0">Profissional</div>
          <div className="w-28 shrink-0 text-right">Data</div>
          <div className="shrink-0">Presença</div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CalendarCheck size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum agendamento encontrado</p>
            {(filterStatus || filterDate) && (
              <button
                onClick={() => { setFilterStatus(''); setFilterDate(''); }}
                className="mt-2 text-xs hover:underline transition-colors"
                style={{ color: primary }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          appointments.map((appt) => (
            <ApptRow key={appt.id} appt={appt} onUpdate={handleUpdate} primary={primary} accent={accent} />
          ))
        )}
      </div>

      {!loading && appointments.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          {appointments.length} registro{appointments.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
