import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, CalendarCheck,
  Users, Scissors, Building2, ChevronDown, RefreshCw, CreditCard, ExternalLink,
} from 'lucide-react';
import { financialService } from '@/services/financial.service';
import { branchesService } from '@/services/branches.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const PERIOD_OPTS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'year',  label: 'Este ano' },
];

const PAYMENT_LABELS = {
  dinheiro:       'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito:  'Cartão de Débito',
  pix:            'Pix',
  cortesia:       'Cortesia',
  plano:          'Plano',
};

const PAYMENT_COLORS = {
  dinheiro:       'bg-green-100 text-green-700',
  cartao_credito: 'bg-blue-100 text-blue-700',
  cartao_debito:  'bg-indigo-100 text-indigo-700',
  pix:            'bg-purple-100 text-purple-700',
  cortesia:       'bg-orange-100 text-orange-700',
  plano:          'bg-yellow-100 text-yellow-800',
};

// ─── sub-components ──────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, growth, loading }) {
  const hasGrowth = growth !== null && growth !== undefined;
  const up = growth >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="p-2 rounded-lg bg-gray-50">
          <Icon size={18} className="text-gray-400" />
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      )}
      <div className="flex items-center gap-2 text-xs">
        {hasGrowth && !loading && (
          <span className={`flex items-center gap-0.5 font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

function BarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex-1 bg-gray-100 rounded-t animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    );
  }
  if (!data?.length) return <p className="text-sm text-gray-400 py-8 text-center">Sem dados no período</p>;

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div
          key={d.date}
          className="group relative flex flex-1 items-end h-full"
          style={{ height: '100%' }}
        >
          <div className="flex items-end w-full h-full">
            <div
              className="w-full bg-gray-900 rounded-t transition-all hover:opacity-80 cursor-default"
              style={{ height: d.total === 0 ? '0%' : `${Math.max((d.total / max) * 100, 6)}%` }}
            />
          </div>
          {/* tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              <p>{fmtDate(d.date + 'T12:00:00')}</p>
              <p className="font-bold">{fmt(d.total)}</p>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankTable({ rows, valueKey = 'total', nameKey = 'name', loading, emptyMsg }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
            <div className="flex-1 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
  if (!rows?.length) return <p className="text-sm text-gray-400 text-center py-4">{emptyMsg || 'Sem dados'}</p>;

  const max = Math.max(...rows.map((r) => r[valueKey]), 1);

  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div key={row[nameKey] + i} className="flex items-center gap-3 group">
          <span className="text-xs font-bold text-gray-300 w-4 shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700 truncate">{row[nameKey]}</span>
              <span className="text-sm font-semibold text-gray-900 ml-2 shrink-0">{fmt(row[valueKey])}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all"
                style={{ width: `${(row[valueKey] / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-400 w-8 text-right shrink-0">{row.count}x</span>
        </div>
      ))}
    </div>
  );
}

function PaymentBadge({ method, appointmentId, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const select = async (value) => {
    setOpen(false);
    setSaving(true);
    try {
      await onUpdate(appointmentId, value);
    } finally {
      setSaving(false);
    }
  };

  const label  = PAYMENT_LABELS[method] || 'Registrar';
  const colors = PAYMENT_COLORS[method] || 'bg-gray-100 text-gray-500';

  return (
    <div className="relative inline-block">
      <button
        disabled={saving}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${colors} border border-transparent hover:border-current transition-colors`}
      >
        {saving ? '...' : label}
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] overflow-hidden">
            {Object.entries(PAYMENT_LABELS).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => select(val)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${method === val ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminFinancial() {
  const [period,    setPeriod]    = useState('month');
  const [branchId,  setBranchId]  = useState('');
  const [branches,  setBranches]  = useState([]);

  const [summary,         setSummary]         = useState(null);
  const [asaasSubaccount, setAsaasSubaccount] = useState({ configured: false });
  const [byDay,           setByDay]           = useState([]);
  const [byBranch,        setByBranch]        = useState([]);
  const [byProfessional,  setByProfessional]  = useState([]);
  const [byService,       setByService]       = useState([]);
  const [transactions,    setTransactions]    = useState({ data: [], total: 0 });
  const [txPage,          setTxPage]          = useState(1);

  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingTx,   setLoadingTx]   = useState(true);
  const [loadingAsaas, setLoadingAsaas] = useState(true);

  // ── load branches once ────────────────────────────────────────────────────
  useEffect(() => {
    branchesService.getAll().then((res) => setBranches(res.data || res || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingAsaas(true);
    financialService.getAsaasSubaccount()
      .then(setAsaasSubaccount)
      .catch(() => setAsaasSubaccount({ configured: false }))
      .finally(() => setLoadingAsaas(false));
  }, []);

  // ── load main data on filter change ──────────────────────────────────────
  const loadMain = useCallback(async () => {
    setLoadingMain(true);
    const params = { period, ...(branchId ? { branchId } : {}) };
    try {
      const [s, d, b, p, sv] = await Promise.all([
        financialService.getSummary(params),
        financialService.getRevenueByDay(params),
        financialService.getRevenueByBranch(params),
        financialService.getRevenueByProfessional(params),
        financialService.getRevenueByService(params),
      ]);
      setSummary(s);
      setByDay(d);
      setByBranch(b);
      setByProfessional(p);
      setByService(sv);
    } catch {
      toast.error(getErrorMessage(err, 'Erro ao carregar dados financeiros.'));
    } finally {
      setLoadingMain(false);
    }
  }, [period, branchId]);

  useEffect(() => { loadMain(); }, [loadMain]);

  // ── load transactions ─────────────────────────────────────────────────────
  const loadTx = useCallback(async () => {
    setLoadingTx(true);
    const params = { period, page: txPage, limit: 20, ...(branchId ? { branchId } : {}) };
    try {
      const res = await financialService.getTransactions(params);
      setTransactions(res);
    } catch {
      toast.error(getErrorMessage(err, 'Erro ao carregar transações.'));
    } finally {
      setLoadingTx(false);
    }
  }, [period, branchId, txPage]);

  useEffect(() => { loadTx(); }, [loadTx]);

  const handlePaymentUpdate = async (appointmentId, paymentMethod) => {
    await financialService.updatePaymentMethod(appointmentId, paymentMethod);
    toast.success('Forma de pagamento registrada.');
    loadTx();
  };

  const handleSyncAsaas = async () => {
    setLoadingAsaas(true);
    try {
      const result = await financialService.syncAsaasSubaccount();
      setAsaasSubaccount(result);
      toast.success('Dados da subconta Asaas atualizados.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao sincronizar subconta.'));
    } finally {
      setLoadingAsaas(false);
    }
  };

  const totalPages = Math.ceil(transactions.total / 20);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-1">Receita e transações das filiais.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* period filter */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {PERIOD_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setPeriod(opt.value); setTxPage(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* branch filter */}
          {branches.length > 0 && (
            <select
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setTxPage(1); }}
              className="input-base text-sm py-2 pl-3 pr-8 h-9"
            >
              <option value="">Todas as filiais</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => { loadMain(); loadTx(); }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
            title="Atualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Subconta Asaas</h2>
            <p className="text-sm text-gray-500 mt-1">Dados financeiros da conta que recebe as assinaturas do estabelecimento.</p>
          </div>
          {asaasSubaccount.configured ? (
            <button
              onClick={handleSyncAsaas}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500"
              title="Sincronizar Asaas"
            >
              <RefreshCw size={16} className={loadingAsaas ? 'animate-spin' : ''} />
            </button>
          ) : null}
        </div>

        {loadingAsaas ? (
          <div className="h-16 bg-gray-50 rounded animate-pulse" />
        ) : !asaasSubaccount.configured ? (
          <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500 flex items-center gap-3">
            <CreditCard size={18} className="text-gray-400" />
            A subconta Asaas ainda nao foi configurada pelo super-admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Wallet ID</p>
              <p className="font-mono text-gray-700 break-all">{asaasSubaccount.wallet_id || '—'}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Status Geral</p>
              <p className="font-semibold text-gray-800">{asaasSubaccount.status?.general || 'PENDING'}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Documentacao</p>
              <p className="font-semibold text-gray-800">{asaasSubaccount.status?.documentation || 'PENDING'}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">API Key</p>
              <p className="font-mono text-gray-700 break-all">{asaasSubaccount.api_key_masked || '—'}</p>
            </div>
          </div>
        )}

        {asaasSubaccount.onboarding_links?.length > 0 ? (
          <div className="mt-4 space-y-2">
            {asaasSubaccount.onboarding_links.map((item) => (
              <a
                key={item.id}
                href={item.onboardingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title || item.type}</p>
                  <p className="text-xs text-gray-400">{item.status || 'PENDING'}</p>
                </div>
                <ExternalLink size={14} className="text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Receita total"
          value={fmt(summary?.total)}
          growth={summary?.growth?.revenue}
          sub="vs. período anterior"
          loading={loadingMain}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Atendimentos"
          value={summary?.count ?? '—'}
          growth={summary?.growth?.appointments}
          sub="concluídos"
          loading={loadingMain}
        />
        <KpiCard
          icon={TrendingUp}
          label="Ticket médio"
          value={fmt(summary?.avg)}
          loading={loadingMain}
          sub="por atendimento"
        />
        <KpiCard
          icon={Users}
          label="Profissionais ativos"
          value={byProfessional.length || '—'}
          loading={loadingMain}
          sub="com receita no período"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Receita por dia</h2>
        <BarChart data={byDay} loading={loadingMain} />
        <div className="flex justify-between mt-2">
          {byDay.length > 0 && (
            <>
              <span className="text-xs text-gray-400">{fmtDate(byDay[0]?.date + 'T12:00:00')}</span>
              <span className="text-xs text-gray-400">{fmtDate(byDay[byDay.length - 1]?.date + 'T12:00:00')}</span>
            </>
          )}
        </div>
      </div>

      {/* Breakdown tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By branch */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Por filial</h2>
          </div>
          <RankTable
            rows={byBranch}
            nameKey="name"
            valueKey="total"
            loading={loadingMain}
            emptyMsg="Sem filiais no período"
          />
        </div>

        {/* By professional */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Por profissional</h2>
          </div>
          <RankTable
            rows={byProfessional}
            nameKey="name"
            valueKey="total"
            loading={loadingMain}
            emptyMsg="Sem atendimentos no período"
          />
        </div>

        {/* By service */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scissors size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Por serviço</h2>
          </div>
          <RankTable
            rows={byService}
            nameKey="name"
            valueKey="total"
            loading={loadingMain}
            emptyMsg="Sem serviços no período"
          />
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Transações
            {!loadingTx && (
              <span className="ml-2 text-gray-400 font-normal">({transactions.total})</span>
            )}
          </h2>
        </div>

        {loadingTx ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 flex-1 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : transactions.data.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">
            Nenhum atendimento concluído no período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Data</th>
                  <th className="px-5 py-3 text-left font-medium">Cliente</th>
                  <th className="px-5 py-3 text-left font-medium">Serviço</th>
                  <th className="px-5 py-3 text-left font-medium">Profissional</th>
                  {branches.length > 0 && (
                    <th className="px-5 py-3 text-left font-medium">Filial</th>
                  )}
                  <th className="px-5 py-3 text-left font-medium">Pagamento</th>
                  <th className="px-5 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.data.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      <span className="font-medium text-gray-800">{fmtDate(tx.start_time)}</span>
                      <span className="block text-xs text-gray-400">{fmtTime(tx.start_time)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-gray-800 font-medium">
                        {tx.customers?.users?.name || '—'}
                      </span>
                      <span className="block text-xs text-gray-400">
                        {tx.customers?.users?.email || ''}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {tx.services?.name || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {tx.professionals?.name || '—'}
                    </td>
                    {branches.length > 0 && (
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {tx.branches?.name || <span className="text-gray-300">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-3">
                      <PaymentBadge
                        method={tx.payment_method}
                        appointmentId={tx.id}
                        onUpdate={handlePaymentUpdate}
                      />
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {fmt(tx.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Página {txPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={txPage <= 1}
                onClick={() => setTxPage((p) => p - 1)}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <button
                disabled={txPage >= totalPages}
                onClick={() => setTxPage((p) => p + 1)}
                className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
