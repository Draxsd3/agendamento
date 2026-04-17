import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ImagePlus, Trash2, Check, Instagram, Globe,
  MessageCircle, Sparkles, AlignLeft, BarChart2, X,
} from 'lucide-react';
import { establishmentsService } from '@/services/establishments.service';
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

export default function AdminPortfolio() {
  const ctx = useOutletContext() || {};
  const branding = ctx.branding || {};
  const primary = branding.primaryColor || '#111827';

  const galleryInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

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
        highlights: highlights.split('\n').map((h) => h.trim()).filter(Boolean),
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: primary }}
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Check size={15} strokeWidth={2.5} />}
          Salvar portfólio
        </button>
      </div>

      {/* Gallery */}
      <SectionCard icon={ImagePlus} title="Galeria de fotos" hint={`Até ${MAX_GALLERY} imagens — PNG, JPG ou WEBP até 2 MB cada`} primary={primary}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {gallery.map((img, idx) => (
            <div key={img.url || idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
          {gallery.length}/{MAX_GALLERY} imagens • Clique no X para remover
        </p>
      </SectionCard>

      {/* Identity */}
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

      {/* Highlights */}
      <SectionCard
        icon={BarChart2}
        title="Destaques / estatísticas"
        hint="Um destaque por linha — aparecem como cards na página pública"
        primary={primary}
      >
        <textarea
          className="input-base resize-none h-28"
          placeholder={"10 anos de experiência\n500+ clientes atendidos\nArtistas premiados\nAmbiente esterilizado"}
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
        />
        {highlights && (
          <div className="mt-3 flex flex-wrap gap-2">
            {highlights.split('\n').filter(Boolean).map((h, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 rounded-lg border font-medium"
                style={{ borderColor: primary + '40', color: primary, backgroundColor: primary + '0f' }}
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Social Links */}
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
  );
}
