import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { CalendarCheck, CreditCard, LogIn, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { publicEstablishmentsService } from '@/services/establishments.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getBrandingTheme } from '@/utils/branding';

export default function TenantLayout() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await publicEstablishmentsService.getBySlug(slug);
        setEstablishment(result);
        localStorage.setItem('activeEstablishmentSlug', slug);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const branding = useMemo(() => getBrandingTheme(establishment), [establishment]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to={`/${slug}`} className="flex items-center gap-3 min-w-0">
            {establishment?.logo_url ? (
              <img
                src={establishment.logo_url}
                alt={`Logo de ${establishment?.name}`}
                className="h-10 w-10 rounded-2xl object-cover border"
                style={{
                  borderColor: branding.subtleBorder,
                  backgroundColor: branding.softPrimary,
                }}
              />
            ) : (
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center font-semibold border"
                style={{
                  borderColor: branding.subtleBorder,
                  backgroundColor: branding.softPrimary,
                  color: branding.primaryColor,
                }}
              >
                {establishment?.name?.charAt(0) || 'E'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{establishment?.name}</p>
              <p className="text-xs truncate" style={{ color: branding.primaryColor }}>
                /{slug}
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to={`/${slug}/planos`}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <CreditCard size={16} />
              <span className="hidden sm:inline">Planos</span>
            </Link>

            {isAuthenticated && user?.role === 'customer' ? (
              <Link
                to={`/${slug}/cliente`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border transition-colors"
                style={{
                  borderColor: branding.subtleBorder,
                  color: branding.accentColor,
                  backgroundColor: branding.softAccent,
                }}
              >
                <UserCircle size={16} />
                <span className="hidden sm:inline">Minha area</span>
              </Link>
            ) : (
              <Link
                to={`/${slug}/login`}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: branding.primaryColor,
                  color: branding.primaryTextColor,
                }}
              >
                <LogIn size={16} />
                <span className="hidden sm:inline">Entrar</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <Outlet context={{ establishment, branding }} />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarCheck size={16} style={{ color: branding.primaryColor }} />
            <span>{establishment?.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to={`/${slug}`} className="hover:text-gray-900 transition-colors">Inicio</Link>
            <Link to={`/${slug}/agendar`} className="hover:text-gray-900 transition-colors">Agendar</Link>
            <Link to={`/${slug}/planos`} className="hover:text-gray-900 transition-colors">Planos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
