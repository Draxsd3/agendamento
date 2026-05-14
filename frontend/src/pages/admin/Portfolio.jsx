import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ImagePlus, Check, Instagram, Globe, ExternalLink,
  MessageCircle, Sparkles, AlignLeft, BarChart2, Calendar, X,
} from 'lucide-react';
import { establishmentsService } from '@/services/establishments.service';
import { hexToRgba } from '@/utils/branding';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errors';

const MAX_GALLERY = 12;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function splitHighlights(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function getInitial(name = '') {
  return name.trim().charAt(0).toUpperCase() || 'E';
}

function getSocialHref(label, value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (!trimmed) return '';

  if (label === 'WhatsApp') {
    const digits = trimmed.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function SectionCard({ icon: Icon, title, hint, primary, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div
        className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
        style={{ borderLeftWidth: 3, borderLeftColor: primary }}
      >
        <Icon size={16} style={{ color: primary }} />
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {hint && <p className="text-xs text-gray-400">{hint}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function PreviewLogo({ establishment, accent }) {
  const hasLogo = Boolean(establishment.logo_url);

  return (
    <div
      className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg flex items-center justify-center"
      style={hasLogo ? { backgroundColor: '#fff' } : { backgroundColor: accent, color: '#fff' }}
    >
      {hasLogo ? (
        <img
          src={establishment.logo_url}
          alt=""
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="text-2xl font-bold" style={{ color: '#fff' }}>
          {getInitial(establishment.name)}
        </span>
      )}
    </div>
  );
}

function PreviewCover({ establishment, primary, accent }) {
  if (!establishment.cover_url) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.92)} 0%, ${hexToRgba(primary, 0.78)} 100%)`,
        }}
      />
    );
  }

  return (
    <>
      <img
        src={establishment.cover_url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(accent, 0.42)} 0%, ${hexToRgba(primary, 0.26)} 100%)`,
        }}
      />
      <img
        src={establishment.cover_url}
        alt=""
        className="absolute inset-0 h-full w-full object-contain object-top p-3 sm:p-5"
      />
    </>
  );
}

function PortfolioPreview({ establishment, slug, primary, accent }) {
  const gallery = Array.isArray(establishment.gallery)
    ? establishment.gallery.filter((item) => item?.url)
    : [];
  const highlights = splitHighlights(establishment.highlights);
  const publicPath = slug ? `/${slug}` : '';
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', value: establishment.instagram_url },
    { icon: Globe, label: 'Facebook', value: establishment.facebook_url },
    { icon: AlignLeft, label: 'TikTok', value: establishment.tiktok_url },
    { icon: MessageCircle, label: 'WhatsApp', value: establishment.whatsapp },
  ].map((item) => ({ ...item, href: getSocialHref(item.label, item.value) }))
    .filter((item) => item.href);

  return (
    <aside className="min-w-0 xl:sticky xl:top-8">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Prévia do portfólio</p>
            <p className="text-xs text-gray-400">Página pública</p>
          </div>
          {publicPath ? (
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              title="Abrir página pública"
              aria-label="Abrir página pública"
            >
              <ExternalLink size={15} />
            </a>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-300">
              <ExternalLink size={15} />
            </span>
          )}
        </div>

        <div className="bg-gray-50 p-3">
          <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-sm">
            <div className="relative h-56 overflow-hidden bg-gray-900">
              <PreviewCover establishment={establishment} primary={primary} accent={accent} />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                <PreviewLogo establishment={establishment} accent={accent} />
                <div className="min-w-0 pb-1 text-white">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {publicPath || '/seu-slug'}
                  </p>
                  <h2 className="truncate text-xl font-bold leading-tight">
                    {establishment.name || 'Seu estabelecimento'}
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-base font-semibold leading-snug text-gray-950">
                  {establishment.tagline || 'Sua frase de impacto aparece aqui.'}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-gray-500">
                  {establishment.about || 'Use o texto sobre o estabelecimento para apresentar estilo, atendimento e diferenciais para novos clientes.'}
                </p>
              </div>

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlights.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: hexToRgba(primary, 0.2),
                        color: primary,
                        backgroundColor: hexToRgba(primary, 0.08),
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Galeria
                  </p>
                  <span className="text-xs text-gray-400">
                    {gallery.length}/{MAX_GALLERY}
                  </span>
                </div>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {gallery.slice(0, 4).map((img, index) => (
                      <div
                        key={img.url || index}
                        className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="aspect-[4/3] rounded-xl border border-dashed border-gray-200 bg-white"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                  {socialLinks.length > 0 ? socialLinks.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
                    >
                      <Icon size={15} />
                    </a>
                  )) : (
                    <span className="text-xs text-gray-400">Redes sociais</span>
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: primary }}
                >
                  <Calendar size={13} />
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function AdminPortfolio() {
  const ctx = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary = branding.primaryColor || '#111827';
  const accent = branding.accentColor || '#0F172A';

  const galleryInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [establishment, setEstablishment] = useState(ctx.establishment || null);

  const [gallery, setGallery] = useState([]);
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [highlights, setHighlights] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    establishmentsService.getMine()
      .then((data) => {
        setEstablishment(data);
        setTagline(data.tagline || '');
        setAbout(data.about || '');
        setGallery(Array.isArray(data.gallery) ? data.gallery : []);
        setHighlights((data.highlights || []).join('\n'));
        setInstagram(data.instagram_url || '');
        setFacebook(data.facebook_url || '');
        setTiktok(data.tiktok_url || '');
        setWhatsapp(data.whatsapp || '');
      })
      .catch(() => toast.error('Erro ao carregar portfólio.'))
      .finally(() => setLoading(false));
  }, []);

  const previewEstablishment = useMemo(() => ({
    ...(ctx.establishment || {}),
    ...(establishment || {}),
    tagline,
    about,
    gallery,
    highlights: splitHighlights(highlights),
    instagram_url: instagram,
    facebook_url: facebook,
    tiktok_url: tiktok,
    whatsapp,
  }), [about, ctx.establishment, establishment, facebook, gallery, highlights, instagram, tagline, tiktok, whatsapp]);

  const visibleHighlights = useMemo(() => splitHighlights(highlights), [highlights]);

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const remaining = MAX_GALLERY - gallery.length;
    const toUpload = files.slice(0, remaining);

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: use PNG, JPG ou WEBP.`);
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name}: máximo 2 MB.`);
        continue;
      }
      setUploadingIdx(gallery.length + i);
      try {
        const base64 = await fileToBase64(file);
        const result = await establishmentsService.uploadGalleryImage({
          fileName: file.name, contentType: file.type, base64,
        });
        setGallery(result.gallery || []);
        toast.success('Imagem adicionada!');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setUploadingIdx(null);
      }
    }
  };

  const handleRemoveImage = async (idx) => {
    const updated = gallery.filter((_, i) => i !== idx);
    try {
      await establishmentsService.updatePortfolio({ gallery: updated });
      setGallery(updated);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await establishmentsService.updatePortfolio({
        tagline,
        about,
        highlights: splitHighlights(highlights),
        instagram_url: instagram,
        facebook_url: facebook,
        tiktok_url: tiktok,
        whatsapp,
      });
      toast.success('Portfólio salvo!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded mb-4" />
            <div className="h-24 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-none space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Portfólio</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Conteúdo exibido na sua página pública para atrair novos clientes.
          </p>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
          style={{ backgroundColor: primary }}
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Check size={15} strokeWidth={2.5} />}
          Salvar portfólio
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <div className="min-w-0 space-y-6">
          <SectionCard icon={ImagePlus} title="Galeria de fotos" hint={`Até ${MAX_GALLERY} imagens - PNG, JPG ou WEBP até 2 MB cada`} primary={primary}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.map((img, idx) => (
                <div key={img.url || idx} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover imagem"
                    aria-label="Remover imagem"
                  >
                    <X size={12} />
                  </button>
                  {uploadingIdx === idx && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              ))}

              {gallery.length < MAX_GALLERY && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ImagePlus size={22} strokeWidth={1.5} />
                  <span className="text-xs font-medium">Adicionar</span>
                </button>
              )}
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />

            <p className="text-xs text-gray-400 mt-3">
              {gallery.length}/{MAX_GALLERY} imagens - Clique no X para remover
            </p>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Identidade do portfólio" hint="Frase de impacto e texto de apresentação" primary={primary}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Frase de impacto (tagline)
                </label>
                <input
                  className="input-base"
                  placeholder="Ex: Fine line & blackwork desde 2018"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 mt-1">{tagline.length}/100 caracteres</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Sobre o estúdio / estabelecimento
                </label>
                <textarea
                  className="input-base resize-none h-32"
                  placeholder="Conte a história do seu espaço, sua especialidade, diferenciais..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={BarChart2}
            title="Destaques / estatísticas"
            hint="Um destaque por linha - aparecem como cards na página pública"
            primary={primary}
          >
            <textarea
              className="input-base resize-none h-28"
              placeholder={"10 anos de experiência\n500+ clientes atendidos\nArtistas premiados\nAmbiente esterilizado"}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
            />
            {visibleHighlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleHighlights.map((h) => (
                  <span
                    key={h}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                    style={{ borderColor: hexToRgba(primary, 0.25), color: primary, backgroundColor: hexToRgba(primary, 0.06) }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={Globe} title="Redes sociais e contato" hint="Links exibidos na página pública" primary={primary}>
            <div className="space-y-3">
              {[
                { icon: Instagram, label: 'Instagram', value: instagram, setter: setInstagram, placeholder: 'https://instagram.com/seuestudio' },
                { icon: Globe, label: 'Facebook', value: facebook, setter: setFacebook, placeholder: 'https://facebook.com/seuestudio' },
                { icon: AlignLeft, label: 'TikTok', value: tiktok, setter: setTiktok, placeholder: 'https://tiktok.com/@seuestudio' },
                { icon: MessageCircle, label: 'WhatsApp', value: whatsapp, setter: setWhatsapp, placeholder: '5511999999999 (só números com DDI)' },
              ].map(({ icon: Icon, label, value, setter, placeholder }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 bg-gray-50">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">{label}</label>
                    <input
                      className="input-base text-sm"
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="pb-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Check size={15} strokeWidth={2.5} />}
              Salvar portfólio
            </button>
          </div>
        </div>

        <PortfolioPreview
          establishment={previewEstablishment}
          slug={previewEstablishment.slug || ctx.slug}
          primary={primary}
          accent={accent}
        />
      </div>
    </div>
  );
}
