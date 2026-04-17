import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Camera, Palette, Sparkles, Building2, Clock,
  Image, Type, Check, CreditCard, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerAreaPreview from '@/components/branding/CustomerAreaPreview';
import api from '@/services/api';
import { establishmentsService } from '@/services/establishments.service';
import { asaasService } from '@/services/asaas.service';
import { extractPaletteFromImageSource, getBrandingTheme } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

// ─── constants ────────────────────────────────────────────────────────────────
const WEEKDAYS = [
  { key: 'sunday',    label: 'Domingo',       short: 'Dom' },
  { key: 'monday',    label: 'Segunda-feira',  short: 'Seg' },
  { key: 'tuesday',   label: 'Terça-feira',    short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira',   short: 'Qua' },
  { key: 'thursday',  label: 'Quinta-feira',   short: 'Qui' },
  { key: 'friday',    label: 'Sexta-feira',    short: 'Sex' },
  { key: 'saturday',  label: 'Sábado',         short: 'Sáb' },
];

const defaultHours = WEEKDAYS.map(({ key }) => ({
  weekday: key,
  start_time: '08:00',
  end_time: '18:00',
  is_open: key !== 'sunday',
}));

const defaultBranding = {
  name: '', slug: '', logo_url: '', cover_url: '',
  primary_color: '#2563EB', accent_color: '#0F172A',
  booking_heading: '', booking_subheading: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveButton({ loading, onClick, children, primary }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: primary }}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        : <Check size={15} strokeWidth={2.5} />}
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const { user } = useAuth();
  useOutletContext();

  const [hours,    setHours]    = useState(defaultHours);
  const [branding, setBranding] = useState(defaultBranding);
  const [loading,  setLoading]  = useState(true);

  const [savingHours,    setSavingHours]    = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [detectedPalette, setDetectedPalette] = useState([]);

  const [asaas,          setAsaas]          = useState(null);
  const [asaasLoading,   setAsaasLoading]   = useState(true);
  const [asaasFormOpen,  setAsaasFormOpen]  = useState(false);
  const [savingAsaas,    setSavingAsaas]    = useState(false);
  const [syncingAsaas,   setSyncingAsaas]   = useState(false);
  const [asaasForm,      setAsaasForm]      = useState({
    name: '', email: '', cpfCnpj: '', personType: 'FISICA',
    birthDate: '', companyType: '', incomeValue: '',
    phone: '', address: '', addressNumber: '', complement: '',
    province: '', postalCode: '',
  });

  const logoInputRef  = useRef(null);
  const coverInputRef = useRef(null);

  // Use branding from outlet if available, else from local state
  const brandingTheme = useMemo(() => getBrandingTheme(branding), [branding]);
  const primary = brandingTheme.primaryColor || '#111827';
  const accent  = brandingTheme.accentColor  || '#111827';

  // ── load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.establishmentId) return;
    asaasService.getSubaccount()
      .then((data) => {
        setAsaas(data);
        if (data.configured) setAsaasFormOpen(false);
      })
      .catch(() => setAsaas(null))
      .finally(() => setAsaasLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user?.establishmentId) return;
    const load = async () => {
      try {
        const [hoursRes, establishment] = await Promise.all([
          api.get('/business-hours', { params: { establishmentId: user.establishmentId } }),
          establishmentsService.getMine(),
        ]);
        if (hoursRes.data?.length) {
          const map = {};
          hoursRes.data.forEach((item) => { map[item.weekday] = item; });
          setHours(defaultHours.map((item) => (map[item.weekday] ? { ...item, ...map[item.weekday] } : item)));
        }
        setBranding({
          name:               establishment.name              || '',
          slug:               establishment.slug              || '',
          logo_url:           establishment.logo_url          || '',
          cover_url:          establishment.cover_url         || '',
          primary_color:      establishment.primary_color     || '#2563EB',
          accent_color:       establishment.accent_color      || '#0F172A',
          booking_heading:    establishment.booking_heading   || '',
          booking_subheading: establishment.booking_subheading || '',
        });
      } catch (err) { toast.error(getErrorMessage(err, 'Erro ao carregar configurações.')); }
      finally  { setLoading(false); }
    };
    load();
  }, [user]);

  const updateHour    = (weekday, field, value) =>
    setHours((prev) => prev.map((item) => item.weekday === weekday ? { ...item, [field]: value } : item));
  const updateBranding = (field, value) =>
    setBranding((prev) => ({ ...prev, [field]: value }));

  // ── logo upload ──────────────────────────────────────────────────────────
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { toast.error('Use PNG, JPG ou WEBP.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Máximo 2 MB.'); return; }
    setUploadingLogo(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      const base64   = await fileToBase64(file);
      const uploaded = await establishmentsService.uploadLogo({ fileName: file.name, contentType: file.type, base64 });
      setBranding((prev) => ({ ...prev, logo_url: uploaded.logo_url }));
      try {
        const palette = await extractPaletteFromImageSource(previewUrl);
        setDetectedPalette(palette.swatches || []);
        setBranding((prev) => ({ ...prev, primary_color: palette.primary, accent_color: palette.accent }));
      } catch {}
      toast.success('Logo atualizada!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { URL.revokeObjectURL(previewUrl); setUploadingLogo(false); }
  };

  // ── cover upload ─────────────────────────────────────────────────────────
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { toast.error('Use PNG, JPG ou WEBP.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Máximo 2 MB.'); return; }
    setUploadingCover(true);
    try {
      const base64   = await fileToBase64(file);
      const uploaded = await establishmentsService.uploadCover({ fileName: file.name, contentType: file.type, base64 });
      setBranding((prev) => ({ ...prev, cover_url: uploaded.cover_url }));
      toast.success('Capa atualizada!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setUploadingCover(false); }
  };

  const handleCreateSubaccount = async () => {
    setSavingAsaas(true);
    try {
      const data = await asaasService.createSubaccount({
        ...asaasForm,
        incomeValue: Number(asaasForm.incomeValue),
      });
      setAsaas(data);
      setAsaasFormOpen(false);
      toast.success('Subconta Asaas criada com sucesso!');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSavingAsaas(false); }
  };

  const handleSyncAsaas = async () => {
    setSyncingAsaas(true);
    try {
      const data = await asaasService.syncSubaccount();
      setAsaas(data);
      toast.success('Status sincronizado.');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSyncingAsaas(false); }
  };

  const handleBillingMode = async (mode) => {
    try {
      const data = await asaasService.updateBillingMode(mode);
      setAsaas(data);
      toast.success('Modo de cobrança atualizado.');
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try { await api.put('/business-hours', { hours }); toast.success('Horários salvos.'); }
    catch (err) { toast.error(getErrorMessage(err, 'Erro ao salvar horários.')); }
    finally { setSavingHours(false); }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      const updated = await establishmentsService.updateMine({
        primary_color:      branding.primary_color,
        accent_color:       branding.accent_color,
        booking_heading:    branding.booking_heading,
        booking_subheading: branding.booking_subheading,
      });
      setBranding((prev) => ({
        ...prev,
        primary_color:      updated.primary_color      || prev.primary_color,
        accent_color:       updated.accent_color       || prev.accent_color,
        booking_heading:    updated.booking_heading    || '',
        booking_subheading: updated.booking_subheading || '',
      }));
      toast.success('Identidade visual salva.');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSavingBranding(false); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-none">
      {/* page header */}
      <div>
        <h1 className="page-title">Configurações</h1>
        <p className="text-sm text-gray-400 mt-0.5">Identidade visual e horários do estabelecimento.</p>
      </div>

      {/* ── BRANDING CARD ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* left: settings */}
        <div className="min-w-0 space-y-1">

          {/* ── Section 1: fotos ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* section label bar */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Image size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Fotos</p>
              <span className="text-xs text-gray-400">— capa e logo do estabelecimento</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <div className="p-6">
                {/* LinkedIn-style editor */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  {/* cover */}
                  <div className="relative h-36 bg-gray-100 group">
                    {branding.cover_url
                      ? <img src={branding.cover_url} alt="Capa" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={32} className="text-gray-300" />
                        </div>
                    }
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
                      title="Alterar capa"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-2.5">
                        {uploadingCover
                          ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                          : <Camera size={18} />}
                      </span>
                    </button>
                    <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleCoverUpload} />
                  </div>

                  {/* logo */}
                  <div className="px-5 pb-5">
                    <div className="relative -mt-10 w-20 h-20 inline-block">
                      <div className="w-20 h-20 rounded-xl border-2 border-white overflow-hidden shadow-md flex items-center justify-center"
                        style={{ backgroundColor: accent }}>
                        {branding.logo_url
                          ? <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          : <span className="text-2xl font-bold text-white">
                              {(branding.name || 'E').charAt(0)}
                            </span>
                        }
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
                        title="Alterar logo"
                      >
                        {uploadingLogo
                          ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin block" />
                          : <Camera size={12} className="text-gray-600" />}
                      </button>
                      <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
                    </div>
                    <div className="mt-3">
                      <p className="font-bold text-gray-900">{branding.name || 'Seu estabelecimento'}</p>
                      <p className="text-xs text-gray-400">/{branding.slug || 'slug'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Clique na capa ou no ícone de câmera na logo para atualizar. PNG, JPG ou WEBP até 2 MB.
                </p>
              </div>
            )}
          </div>

          {/* ── Section 2: cores ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Palette size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Cores da marca</p>
              <span className="text-xs text-gray-400">— aplicadas em toda a experiência do cliente</span>
            </div>

            {loading ? (
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'primary_color', label: 'Cor principal', hint: 'Botões, ícones ativos, destaques' },
                    { field: 'accent_color',  label: 'Cor de destaque', hint: 'Avatares, sidebar, gradientes' },
                  ].map(({ field, label, hint }) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400">{hint}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="relative">
                          <input
                            type="color"
                            value={branding[field]}
                            onChange={(e) => updateBranding(field, e.target.value.toUpperCase())}
                            className="h-10 w-12 rounded-lg border border-gray-200 bg-white p-1 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={branding[field]}
                          onChange={(e) => updateBranding(field, e.target.value.toUpperCase())}
                          className="input-base font-mono text-sm"
                          maxLength={7}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* color preview strip */}
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  <div className="flex-1 rounded-l-full" style={{ backgroundColor: branding.primary_color }} />
                  <div className="flex-1 rounded-r-full" style={{ backgroundColor: branding.accent_color }} />
                </div>

                {/* detected palette */}
                {detectedPalette.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-2">
                      Cores detectadas na logo — clique para aplicar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detectedPalette.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateBranding('primary_color', color)}
                          className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-400 transition-colors"
                        >
                          <span className="h-4 w-4 rounded shrink-0 border border-black/5" style={{ backgroundColor: color }} />
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Section 3: textos ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Type size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Página pública</p>
              <span className="text-xs text-gray-400">— título e descrição da área de agendamento</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Título da página</label>
                  <div className="relative">
                    <Sparkles size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      className="input-base pl-9"
                      placeholder={`Agende com ${branding.name || 'sua equipe'}`}
                      value={branding.booking_heading}
                      onChange={(e) => updateBranding('booking_heading', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Aparece em destaque na área pública.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Texto de apoio</label>
                  <textarea
                    className="input-base resize-none h-24"
                    placeholder="Descreva o diferencial do seu atendimento..."
                    value={branding.booking_subheading}
                    onChange={(e) => updateBranding('booking_subheading', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* save branding button */}
          {!loading && (
            <div className="pt-2">
              <SaveButton loading={savingBranding} onClick={handleSaveBranding} primary={primary}>
                Salvar identidade visual
              </SaveButton>
            </div>
          )}
        </div>

        {/* right: sticky preview */}
        <div className="hidden xl:block min-w-0 sticky top-8">
          <div className="rounded-[30px] border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                <p className="text-xs font-medium text-gray-500">Preview ao vivo</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-400 shadow-sm">
                Layout 50/50
              </span>
            </div>

            <div className="rounded-[28px] bg-white/70 p-3">
              {loading ? (
                <div className="h-80 bg-white rounded-[24px] border border-gray-200 animate-pulse" />
              ) : (
                <CustomerAreaPreview
                  establishment={branding}
                  branding={brandingTheme}
                  slug={branding.slug}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ASAAS INTEGRATION ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
          style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
          <div className="flex items-center gap-3">
            <CreditCard size={16} style={{ color: primary }} />
            <div>
              <p className="text-sm font-semibold text-gray-800">Integração Asaas</p>
              <p className="text-xs text-gray-400">Cobranças recorrentes via checkout Asaas</p>
            </div>
          </div>
          {!asaasLoading && asaas && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              asaas.configured
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {asaas.configured ? 'Conectado' : 'Nao configurado'}
            </span>
          )}
        </div>

        {asaasLoading ? (
          <div className="p-6 space-y-3">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : asaas?.configured ? (
          <div className="p-6 space-y-5">
            {/* Account info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email da subconta</p>
                <p className="font-medium text-gray-800">{asaas.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Chave de API</p>
                <p className="font-mono text-gray-700">{asaas.api_key_masked || '—'}</p>
              </div>
              {asaas.cpf_cnpj && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">CPF/CNPJ</p>
                  <p className="font-medium text-gray-800">{asaas.cpf_cnpj}</p>
                </div>
              )}
              {asaas.last_synced_at && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Ultima sincronia</p>
                  <p className="text-gray-600">{new Date(asaas.last_synced_at).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>

            {/* Onboarding links */}
            {asaas.onboarding_links?.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">Documentacao pendente</p>
                <div className="space-y-1.5">
                  {asaas.onboarding_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.onboardingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 underline"
                    >
                      {link.title || link.type}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Billing mode */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Modo de cobrança padrão</p>
              <div className="space-y-2">
                {(asaas.billing_mode_options || []).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleBillingMode(opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                      asaas.billing_mode === opt.value
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    style={asaas.billing_mode === opt.value ? { backgroundColor: primary, borderColor: primary } : {}}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${asaas.billing_mode === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncAsaas}
              disabled={syncingAsaas}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncingAsaas ? 'animate-spin' : ''} />
              Sincronizar status
            </button>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              Configure uma subconta Asaas para aceitar pagamentos recorrentes diretamente pelos seus planos.
            </p>

            <button
              type="button"
              onClick={() => setAsaasFormOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {asaasFormOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {asaasFormOpen ? 'Fechar formulário' : 'Configurar subconta Asaas'}
            </button>

            {asaasFormOpen && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Nome *</label>
                    <input className="input-base text-sm" placeholder="Nome do responsável ou empresa"
                      value={asaasForm.name} onChange={(e) => setAsaasForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
                    <input type="email" className="input-base text-sm" placeholder="email@empresa.com"
                      value={asaasForm.email} onChange={(e) => setAsaasForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">CPF / CNPJ *</label>
                    <input className="input-base text-sm" placeholder="000.000.000-00"
                      value={asaasForm.cpfCnpj} onChange={(e) => setAsaasForm((f) => ({ ...f, cpfCnpj: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de pessoa</label>
                    <select className="input-base text-sm" value={asaasForm.personType}
                      onChange={(e) => setAsaasForm((f) => ({ ...f, personType: e.target.value }))}>
                      <option value="FISICA">Pessoa Física</option>
                      <option value="JURIDICA">Pessoa Jurídica</option>
                    </select>
                  </div>
                  {asaasForm.personType === 'FISICA' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Data de nascimento</label>
                      <input type="date" className="input-base text-sm"
                        value={asaasForm.birthDate} onChange={(e) => setAsaasForm((f) => ({ ...f, birthDate: e.target.value }))} />
                    </div>
                  )}
                  {asaasForm.personType === 'JURIDICA' && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Tipo de empresa</label>
                      <select className="input-base text-sm" value={asaasForm.companyType}
                        onChange={(e) => setAsaasForm((f) => ({ ...f, companyType: e.target.value }))}>
                        <option value="">Selecione...</option>
                        <option value="MEI">MEI</option>
                        <option value="LIMITED">Ltda</option>
                        <option value="INDIVIDUAL">Individual</option>
                        <option value="ASSOCIATION">Associação</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Renda mensal (R$) *</label>
                    <input type="number" min="0" step="0.01" className="input-base text-sm" placeholder="3000.00"
                      value={asaasForm.incomeValue} onChange={(e) => setAsaasForm((f) => ({ ...f, incomeValue: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Telefone *</label>
                    <input className="input-base text-sm" placeholder="(11) 99999-9999"
                      value={asaasForm.phone} onChange={(e) => setAsaasForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">CEP *</label>
                    <input className="input-base text-sm" placeholder="00000-000"
                      value={asaasForm.postalCode} onChange={(e) => setAsaasForm((f) => ({ ...f, postalCode: e.target.value }))} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Rua *</label>
                    <input className="input-base text-sm" placeholder="Rua das Flores"
                      value={asaasForm.address} onChange={(e) => setAsaasForm((f) => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Número *</label>
                    <input className="input-base text-sm" placeholder="123"
                      value={asaasForm.addressNumber} onChange={(e) => setAsaasForm((f) => ({ ...f, addressNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Complemento</label>
                    <input className="input-base text-sm" placeholder="Apto 4"
                      value={asaasForm.complement} onChange={(e) => setAsaasForm((f) => ({ ...f, complement: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Bairro *</label>
                    <input className="input-base text-sm" placeholder="Centro"
                      value={asaasForm.province} onChange={(e) => setAsaasForm((f) => ({ ...f, province: e.target.value }))} />
                  </div>
                </div>

                <SaveButton loading={savingAsaas} onClick={handleCreateSubaccount} primary={primary}>
                  Criar subconta Asaas
                </SaveButton>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BUSINESS HOURS ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
          style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
          <Clock size={16} style={{ color: primary }} />
          <div>
            <p className="text-sm font-semibold text-gray-800">Horário de Funcionamento</p>
            <p className="text-xs text-gray-400">Configure os dias e horários de atendimento.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            {/* mobile: vertical list; desktop: compact grid */}
            <div className="space-y-2">
              {hours.map((item) => {
                const day = WEEKDAYS.find((w) => w.key === item.weekday);
                return (
                  <div
                    key={item.weekday}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                      item.is_open ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    {/* toggle */}
                    <button
                      type="button"
                      onClick={() => updateHour(item.weekday, 'is_open', !item.is_open)}
                      className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                      style={{ backgroundColor: item.is_open ? primary : '#d1d5db' }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: item.is_open ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </button>

                    {/* day label */}
                    <span
                      className="text-sm font-medium w-32 shrink-0"
                      style={{ color: item.is_open ? '#111827' : '#9ca3af' }}
                    >
                      {day?.label}
                    </span>

                    {/* times */}
                    {item.is_open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={item.start_time}
                          onChange={(e) => updateHour(item.weekday, 'start_time', e.target.value)}
                          className="input-base w-32 text-sm py-2"
                        />
                        <span className="text-gray-300 text-sm font-medium">→</span>
                        <input
                          type="time"
                          value={item.end_time}
                          onChange={(e) => updateHour(item.weekday, 'end_time', e.target.value)}
                          className="input-base w-32 text-sm py-2"
                        />
                        <span className="text-xs text-gray-400 hidden sm:block ml-1">
                          {(() => {
                            const [sh, sm] = item.start_time.split(':').map(Number);
                            const [eh, em] = item.end_time.split(':').map(Number);
                            const mins = (eh * 60 + em) - (sh * 60 + sm);
                            if (mins <= 0) return '';
                            const h = Math.floor(mins / 60);
                            const m = mins % 60;
                            return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`;
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <SaveButton loading={savingHours} onClick={handleSaveHours} primary={primary}>
                Salvar horários
              </SaveButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
