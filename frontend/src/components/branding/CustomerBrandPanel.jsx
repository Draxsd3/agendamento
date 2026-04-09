export default function CustomerBrandPanel({
  establishment,
  branding,
  slug,
  className = '',
  logoClassName = 'h-20 w-20 rounded-2xl',
  contentClassName = 'px-4 py-6',
  coverAction,
  logoAction,
}) {
  const name = establishment?.name || slug || 'Minha Conta';
  const handle = establishment?.slug || slug || 'cliente';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {establishment?.cover_url ? (
        <img
          src={establishment.cover_url}
          alt={`Capa de ${name}`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${branding.accentColor} 0%, ${branding.primaryColor} 100%)`,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${branding.accentColor}26 0%, ${branding.accentColor}CC 100%)`,
        }}
      />

      {coverAction}

      <div className={`relative flex flex-col items-center text-center text-white ${contentClassName}`}>
        <div className="relative">
          {establishment?.logo_url ? (
            <img
              src={establishment.logo_url}
              alt={`Logo de ${name}`}
              className={`${logoClassName} object-cover border border-white/20 bg-white/10`}
            />
          ) : (
            <div
              className={`${logoClassName} flex items-center justify-center border border-white/20 bg-white/10 font-bold`}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          {logoAction}
        </div>

        <div className="mt-4 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-xs text-white/75 truncate">/{handle}</p>
        </div>
      </div>
    </div>
  );
}
