import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Users, CalendarCheck, Crown, Search } from 'lucide-react';
import api from '@/services/api';

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export default function AdminCustomers() {
  const { user }  = useAuth();
  const ctx       = useOutletContext() || {};
  const branding  = ctx.branding || {};
  const primary   = branding.primaryColor || '#111827';
  const accent    = branding.accentColor  || '#111827';

  const [customers, setCustomers] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const load = (q = '') => {
    if (!user?.establishmentId) return;
    setLoading(true);
    api
      .get(`/customers/establishment/${user.establishmentId}`, { params: { search: q } })
      .then((res) => { setCustomers(res.data.data || []); setTotal(res.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    if (v.length === 0 || v.length >= 2) load(v);
  };

  const withAppt = customers.filter((c) => c.origin?.has_appointment).length;
  const withSub  = customers.filter((c) => c.origin?.has_subscription).length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="page-title">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Clientes vinculados via agendamento ou assinatura</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users,        label: 'Total',            value: total,    iconColor: primary },
          { icon: CalendarCheck,label: 'Com agendamento',  value: withAppt, iconColor: primary },
          { icon: Crown,        label: 'Assinantes',       value: withSub,  iconColor: '#f59e0b' },
        ].map(({ icon: Icon, label, value, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: iconColor + '18' }}>
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Buscar por nome ou e-mail..."
          className="input-base pl-9"
        />
      </div>

      {/* table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-medium">
          <div className="flex-1">Cliente</div>
          <div className="w-32">Telefone</div>
          <div className="flex-1">Vínculo</div>
          <div className="w-20 text-center">Conta</div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <Users size={40} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">Nenhum cliente encontrado</p>
            <p className="text-xs text-gray-300 mt-1">
              Clientes aparecem quando fazem um agendamento ou assinam um plano.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map((c) => {
              const name = c.users?.name || '—';
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* avatar */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white text-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {initials(name)}
                  </div>

                  {/* name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.users?.email || '—'}</p>
                  </div>

                  {/* phone */}
                  <div className="w-32 hidden sm:block text-sm text-gray-500">
                    {c.phone || <span className="text-gray-300">—</span>}
                  </div>

                  {/* badges */}
                  <div className="flex-1 hidden sm:flex flex-wrap gap-1.5">
                    {c.origin?.has_appointment && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: primary + '12', color: primary }}
                      >
                        <CalendarCheck size={11} /> Agendamento
                      </span>
                    )}
                    {c.origin?.has_subscription && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        <Crown size={11} /> {c.active_subscription?.plans?.name || 'Assinante'}
                      </span>
                    )}
                  </div>

                  {/* account status */}
                  <div className="w-20 hidden sm:flex justify-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={c.users?.is_active
                        ? { backgroundColor: primary + '18', color: primary }
                        : { backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                      {c.users?.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
