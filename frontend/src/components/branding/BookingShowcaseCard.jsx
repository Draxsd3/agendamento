export default function BookingShowcaseCard({
  establishment,
  theme,
  preview = false,
  eyebrow,
  details,
  actions,
  footer,
  className = '',
}) {
  const name = establishment?.name || 'Seu estabelecimento';
  const slug = establishment?.slug || 'slug';
  const initial = name.charAt(0).toUpperCase();
  const hasCover = Boolean(establishment?.cover_url);

  return (
    <div
      className={`overflow-hidden border border-black/5 bg-white shadow-sm ${
        preview ? 'rounded-[24px]' : 'rounded-[28px]'
      } ${className}`}
    >
      <div className={`relative ${preview ? 'h-36' : 'h-48'}`}>
        {hasCover ? (
          <img
            src={establishment.cover_url}
            alt={`Capa de ${name}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.accentColor} 0%, ${theme.primaryColor} 100%)`,
            }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: hasCover
              ? `linear-gradient(180deg, ${theme.accentColor}33 0%, ${theme.accentColor}80 55%, ${theme.accentColor}CC 100%)`
              : 'linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.26) 100%)',
          }}
        />

        <div className={`absolute inset-x-0 bottom-0 ${preview ? 'p-4' : 'p-6'}`}>
          <div className="flex items-end gap-3">
            {establishment?.logo_url ? (
              <img
                src={establishment.logo_url}
                alt={`Logo de ${name}`}
                className={`object-cover border border-white/20 bg-white/10 ${
                  preview ? 'h-12 w-12 rounded-lg' : 'h-20 w-20 rounded-3xl'
                }`}
              />
            ) : (
              <div
                className={`flex items-center justify-center border border-white/20 bg-white/10 font-bold text-white ${
                  preview ? 'h-12 w-12 rounded-lg text-lg' : 'h-20 w-20 rounded-3xl text-3xl'
                }`}
              >
                {initial}
              </div>
            )}

            <div className="min-w-0 text-white pb-0.5">
              <p className={`truncate font-semibold ${preview ? 'text-sm' : 'text-lg'}`}>{name}</p>
              <p className="truncate text-xs text-white/70">/{slug}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={preview ? 'p-5' : 'p-8'}>
        {eyebrow ? (
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              backgroundColor: theme.softAccent,
              color: theme.accentColor,
            }}
          >
            {eyebrow}
          </span>
        ) : null}

        <h1 className={`font-bold text-gray-900 ${preview ? 'mt-3 text-2xl leading-tight' : 'mt-4 text-3xl'}`}>
          {theme.title}
        </h1>
        <p className={`text-gray-500 ${preview ? 'mt-2 text-sm leading-6' : 'mt-3 leading-7'}`}>
          {theme.subtitle}
        </p>

        {details ? <div className={preview ? 'mt-4' : 'mt-5'}>{details}</div> : null}
        {actions ? <div className={preview ? 'mt-5' : 'mt-6'}>{actions}</div> : null}
        {footer ? <div className={preview ? 'mt-5' : 'mt-6'}>{footer}</div> : null}
      </div>
    </div>
  );
}
