import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Search, UserPlus, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { appointmentsService } from '@/services/appointments.service';
import { customersService } from '@/services/customers.service';
import { servicesService } from '@/services/services.service';
import { professionalsService } from '@/services/professionals.service';
import { branchesService } from '@/services/branches.service';
import { getErrorMessage } from '@/utils/errors';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
];

const EMPTY_NEW_CUSTOMER = {
  name: '',
  email: '',
  phone: '',
};

function toLocalDateInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toIsoFromLocal(date, time) {
  if (!date || !time) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const local = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

export default function ManualAppointmentModal({ isOpen, onClose, establishmentId, onCreated }) {
  const now = useMemo(() => new Date(), []);

  const [loadingRefs, setLoadingRefs] = useState(true);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customersLoading, setCustomersLoading] = useState(false);

  const [mode, setMode] = useState('existing');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState(EMPTY_NEW_CUSTOMER);

  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [date, setDate] = useState(toLocalDateInput(now));
  const [time, setTime] = useState('09:00');
  const [status, setStatus] = useState('confirmed');
  const [totalPrice, setTotalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [skipBusinessHoursCheck, setSkipBusinessHoursCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !establishmentId) return;

    let active = true;
    setLoadingRefs(true);

    Promise.all([
      servicesService.getAll().catch(() => []),
      professionalsService.getAll(establishmentId).catch(() => []),
      branchesService.getAll().catch(() => []),
    ])
      .then(([svc, profs, brs]) => {
        if (!active) return;
        setServices(svc || []);
        setProfessionals(profs || []);
        setBranches(brs || []);
      })
      .finally(() => {
        if (active) setLoadingRefs(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, establishmentId]);

  useEffect(() => {
    if (!isOpen || !establishmentId) return undefined;

    let active = true;
    setCustomersLoading(true);
    const timeoutId = window.setTimeout(() => {
      customersService
        .getByEstablishment(establishmentId, { search: customerSearch || undefined, limit: 20 })
        .then((res) => {
          if (!active) return;
          setCustomers(res.data || []);
        })
        .catch(() => {
          if (!active) return;
          setCustomers([]);
        })
        .finally(() => {
          if (active) setCustomersLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, establishmentId, customerSearch]);

  useEffect(() => {
    if (!isOpen) {
      setMode('existing');
      setSelectedCustomer(null);
      setNewCustomer(EMPTY_NEW_CUSTOMER);
      setCustomerSearch('');
      setServiceId('');
      setProfessionalId('');
      setBranchId('');
      setDate(toLocalDateInput(new Date()));
      setTime('09:00');
      setStatus('confirmed');
      setTotalPrice('');
      setNotes('');
      setSkipBusinessHoursCheck(false);
    }
  }, [isOpen]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  const filteredProfessionals = useMemo(() => {
    if (!selectedService) return professionals;
    const matching = professionals.filter((prof) =>
      (prof.professional_services || []).some((ps) => ps.service_id === selectedService.id)
    );
    return matching.length > 0 ? matching : professionals;
  }, [professionals, selectedService]);

  useEffect(() => {
    if (professionalId && !filteredProfessionals.some((p) => p.id === professionalId)) {
      setProfessionalId('');
    }
  }, [filteredProfessionals, professionalId]);

  const ensureCustomerId = async () => {
    if (mode === 'existing') {
      if (!selectedCustomer) throw new Error('Selecione um cliente.');
      return selectedCustomer.id;
    }

    const trimmedName = newCustomer.name.trim();
    const trimmedEmail = newCustomer.email.trim().toLowerCase();
    if (!trimmedName) throw new Error('Informe o nome do cliente.');
    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      throw new Error('Informe um e-mail válido.');
    }

    const response = await customersService.createForEstablishment(establishmentId, {
      name: trimmedName,
      email: trimmedEmail,
      phone: newCustomer.phone.trim() || undefined,
    });

    const customerId = response?.customer?.id || response?.id;
    if (!customerId) throw new Error('Não foi possível registrar o cliente.');
    return customerId;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!serviceId) {
      toast.error('Selecione um serviço.');
      return;
    }
    if (!professionalId) {
      toast.error('Selecione um profissional.');
      return;
    }

    const startTime = toIsoFromLocal(date, time);
    if (!startTime) {
      toast.error('Data ou horário inválido.');
      return;
    }

    setSubmitting(true);
    try {
      const customerId = await ensureCustomerId();
      const payload = {
        customerId,
        serviceId,
        professionalId,
        startTime,
        status,
        skipBusinessHoursCheck,
      };
      if (branchId) payload.branchId = branchId;
      if (notes.trim()) payload.notes = notes.trim();
      if (totalPrice !== '') payload.totalPrice = Number(totalPrice);

      await appointmentsService.bookManual(establishmentId, payload);
      toast.success('Agendamento criado.');
      onCreated?.();
      onClose?.();
    } catch (err) {
      if (err?.response) {
        toast.error(getErrorMessage(err, 'Não foi possível criar o agendamento.'));
      } else {
        toast.error(err.message || 'Não foi possível criar o agendamento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo agendamento" size="lg">
      {loadingRefs ? (
        <div className="py-12 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Cliente</h3>
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('existing')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    mode === 'existing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Existente
                </button>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 ${
                    mode === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <UserPlus size={12} />
                  Novo
                </button>
              </div>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-2">
                {selectedCustomer ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedCustomer.users?.name || '—'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedCustomer.users?.email}
                        {selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Remover cliente"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Input
                      icon={Search}
                      placeholder="Buscar por nome, e-mail ou telefone"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                      {customersLoading ? (
                        <p className="py-6 text-center text-xs text-gray-400">Buscando…</p>
                      ) : customers.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-400">
                          Nenhum cliente encontrado.
                        </p>
                      ) : (
                        customers.map((customer) => (
                          <button
                            type="button"
                            key={customer.id}
                            onClick={() => setSelectedCustomer(customer)}
                            className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {customer.users?.name || '—'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {customer.users?.email}
                              {customer.phone ? ` · ${customer.phone}` : ''}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nome"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Nome completo"
                />
                <Input
                  label="E-mail"
                  type="email"
                  required
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer((s) => ({ ...s, email: e.target.value }))}
                  placeholder="cliente@exemplo.com"
                />
                <Input
                  label="Telefone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="sm:col-span-2"
                />
                <p className="text-xs text-gray-400 sm:col-span-2">
                  Uma senha temporária será gerada para o novo cliente.
                </p>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Serviço e profissional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Serviço <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="input-base"
                >
                  <option value="">Selecione…</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.duration_minutes}min
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Profissional <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="input-base"
                >
                  <option value="">Selecione…</option>
                  {filteredProfessionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Data e horário</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Data"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Hora"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={skipBusinessHoursCheck}
                onChange={(e) => setSkipBusinessHoursCheck(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300"
              />
              Permitir horário fora do funcionamento
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Detalhes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-base"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Valor total (opcional)"
                type="number"
                min="0"
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder={selectedService ? `Padrão: R$ ${Number(selectedService.price || 0).toFixed(2)}` : 'Em branco usa preço do serviço'}
              />
            </div>

            {branches.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Filial</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="input-base"
                >
                  <option value="">Sem filial específica</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Anotações internas sobre este agendamento"
                className="input-base resize-none"
              />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting} icon={CalendarPlus}>
              Criar agendamento
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
