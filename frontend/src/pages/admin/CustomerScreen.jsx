import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Camera, Palette, Building2, Image, Type, Check,
} from 'lucide-react';
import CustomerAreaPreview from '@/components/branding/CustomerAreaPreview';
import { establishmentsService } from '@/services/establishments.service';
import { extractPaletteFromImageSource, getBrandingTheme } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

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

export default function AdminCustomerScreen() {
  const outletContext = useOutletContext() || {};
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [detectedPalette, setDetectedPalette] = useState([]);

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const brandingTheme = useMemo(() => getBrandingTheme(branding), [branding]);
  const primary = brandingTheme.primaryColor || '#111827';
  const accent = brandingTheme.accentColor || '#111827';

  useEffect(() => {
    const load = async () => {
      try {
        const establishment = await establishmentsService.getMine();
        setBranding({
          name: establishment.name || '',
          slug: establishment.slug || '',
          logo_url: establishment.logo_url || '',
          cover_url: establishment.cover_url || '',
          primary_color: establishment.primary_color || '#2563EB',
          accent_color: establishment.accent_color || '#0F172A',
          booking_heading: establishment.booking_heading || '',
          booking_subheading: establishment.booking_subheading || '',
        });
      } catch (err) {
        toast.error(getErrorMessage(err, 'Erro ao carregar personalização da tela do cliente.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateBranding = (field, value) =>
    setBranding((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Use PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Máximo 2 MB.');
      return;
    }

    setUploadingLogo(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      const base64 = await fileToBase64(file);
      const uploaded = await establishmentsService.uploadLogo({ fileName: file.name, contentType: file.type, base64 });
      setBranding((prev) => ({ ...prev, logo_url: uploaded.logo_url }));
      try {
        const palette = await extractPaletteFromImageSource(previewUrl);
        setDetectedPalette(palette.swatches || []);
        setBranding((prev) => ({ ...prev, primary_color: palette.primary, accent_color: palette.accent }));
      } catch (paletteError) {
        void paletteError;
      }
      toast.success('Logo atualizada!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Use PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Máximo 2 MB.');
      return;
    }

    setUploadingCover(true);
    try {
      const base64 = await fileToBase64(file);
      const uploaded = await establishmentsService.uploadCover({ fileName: file.name, contentType: file.type, base64 });
      setBranding((prev) => ({ ...prev, cover_url: uploaded.cover_url }));
      toast.success('Capa atualizada!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      const updated = await establishmentsService.updateMine({
        primary_color: branding.primary_color,
        accent_color: branding.accent_color,
        booking_heading: branding.booking_heading,
        booking_subheading: branding.booking_subheading,
      });
      setBranding((prev) => ({
        ...prev,
        primary_color: updated.primary_color || prev.primary_color,
        accent_color: updated.accent_color || prev.accent_color,
        booking_heading: updated.booking_heading || '',
        booking_subheading: updated.booking_subheading || '',
      }));
      toast.success('Tela do cliente salva.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingBranding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-none">
      <div>
        <h1 className="page-title">Tela do cliente</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Personalize a aparência da área do cliente e da identidade visual do estabelecimento.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="min-w-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Image size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Fotos</p>
              <span className="text-xs text-gray-400">capa e logo do estabelecimento</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            ) : (
              <div className="p-6">
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative h-36 bg-gray-100 group">
                    {branding.cover_url
                      ? <img src={branding.cover_url} alt="Capa" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={32} className="text-gray-300" />
                        </div>}
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

                  <div className="px-5 pb-5">
                    <div className="relative -mt-10 w-20 h-20 inline-block">
                      <div
                        className="w-20 h-20 rounded-xl border-2 border-white overflow-hidden shadow-md flex items-center justify-center"
                        style={{ backgroundColor: accent }}
                      >
                        {branding.logo_url
                          ? <img src={branding.logo_url} alt="Logo" className="w-full h-full object-cover" />
                          : <span className="text-2xl font-bold text-white">{(branding.name || 'E').charAt(0)}</span>}
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
                      <p className="text-xs text-gray-400">/{branding.slug || outletContext.slug || 'slug'}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Clique na capa ou no ícone de câmera na logo para atualizar. PNG, JPG ou WEBP até 2 MB.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Palette size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Cores da marca</p>
              <span className="text-xs text-gray-400">cores usadas na área do cliente</span>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: 'primary_color', label: 'Cor principal', hint: 'botões, CTAs e destaques' },
                  { field: 'accent_color', label: 'Cor de destaque', hint: 'sidebar, avatares e gradientes' },
                ].map(({ field, label, hint }) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="h-11 w-14 rounded-lg border border-gray-200 cursor-pointer bg-white"
                        value={branding[field]}
                        onChange={(e) => updateBranding(field, e.target.value.toUpperCase())}
                      />
                      <input
                        className="input-base font-mono"
                        value={branding[field]}
                        onChange={(e) => updateBranding(field, e.target.value.toUpperCase())}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{hint}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 rounded-l-full" style={{ backgroundColor: branding.primary_color }} />
                  <div className="h-3 flex-1 rounded-r-full" style={{ backgroundColor: branding.accent_color }} />
                </div>
                <p className="text-xs text-gray-400 mt-3">Prévia rápida da combinação principal/destaque</p>
              </div>

              {detectedPalette.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Paleta sugerida da logo</p>
                  <div className="flex flex-wrap gap-2">
                    {detectedPalette.slice(0, 6).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateBranding('primary_color', color)}
                        className="h-9 w-9 rounded-full border border-white shadow ring-1 ring-gray-200"
                        style={{ backgroundColor: color }}
                        title={`Usar ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
              style={{ borderLeftWidth: 3, borderLeftColor: primary }}>
              <Type size={16} style={{ color: primary }} />
              <p className="text-sm font-semibold text-gray-800">Textos da experiência</p>
              <span className="text-xs text-gray-400">título e subtítulo visíveis ao cliente</span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Título principal</label>
                <input
                  className="input-base pl-4"
                  placeholder={`Agende com ${branding.name || 'sua equipe'}`}
                  value={branding.booking_heading}
                  onChange={(e) => updateBranding('booking_heading', e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Aparece em destaque na área do cliente.</p>
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
          </div>

          {!loading && (
            <div className="pt-2">
              <SaveButton loading={savingBranding} onClick={handleSaveBranding} primary={primary}>
                Salvar tela do cliente
              </SaveButton>
            </div>
          )}
        </div>

        <div className="hidden xl:block min-w-0 sticky top-8">
          <div className="rounded-[30px] border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                <p className="text-xs font-medium text-gray-500">Preview ao vivo</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-gray-400 shadow-sm">
                Tela do cliente
              </span>
            </div>

            <div className="rounded-[28px] bg-white/70 p-3">
              {loading ? (
                <div className="h-80 bg-white rounded-[24px] border border-gray-200 animate-pulse" />
              ) : (
                <CustomerAreaPreview
                  establishment={branding}
                  branding={brandingTheme}
                  slug={branding.slug || outletContext.slug}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
