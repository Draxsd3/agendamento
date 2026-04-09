import { Clock, Tag } from 'lucide-react';

export default function ServiceSelector({
  services,
  selected,
  onSelect,
  planServices = [],
  planDiscountPercent = 0,
  theme,
}) {
  const getPricing = (service) => {
    const originalPrice = Number(service.price);
    const planService = planServices.find((item) => String(item.service_id) === String(service.id));

    if (planService) {
      if (planService.price_override !== null) {
        return {
          displayPrice: Number(planService.price_override),
          originalPrice,
          badge: 'Incluido no seu plano',
        };
      }

      if (planDiscountPercent > 0) {
        return {
          displayPrice: originalPrice * (1 - planDiscountPercent / 100),
          originalPrice,
          badge: `${planDiscountPercent}% off no seu plano`,
        };
      }
    }

    if (planDiscountPercent > 0) {
      return {
        displayPrice: originalPrice * (1 - planDiscountPercent / 100),
        originalPrice,
        badge: `${planDiscountPercent}% off no seu plano`,
      };
    }

    return {
      displayPrice: originalPrice,
      originalPrice,
      badge: null,
    };
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide font-medium" style={{ color: '#9CA3AF' }}>
        Escolha o servico
      </p>
      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selected?.id === service.id;
          const { displayPrice, originalPrice, badge } = getPricing(service);
          const hasSpecialPricing = displayPrice !== originalPrice;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className="w-full rounded-lg border bg-white p-4 text-left transition-all"
              style={isSelected
                ? {
                    borderColor: theme?.primaryColor || '#111827',
                    backgroundColor: theme?.accentColor || '#111827',
                    color: theme?.accentTextColor || '#FFFFFF',
                  }
                : {
                    borderColor: theme?.subtleBorder || '#E5E7EB',
                  }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : '#111827' }}
                  >
                    {service.name}
                  </p>
                  {service.description ? (
                    <p
                      className="mt-0.5 line-clamp-1 text-xs"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : '#9CA3AF' }}
                    >
                      {service.description}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  {hasSpecialPricing ? (
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : '#111827' }}
                      >
                        {displayPrice === 0
                          ? 'Gratis'
                          : displayPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p
                        className="text-xs line-through"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.65)' : '#9CA3AF' }}
                      >
                        {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm font-bold"
                      style={{ color: isSelected ? (theme?.accentTextColor || '#FFFFFF') : '#111827' }}
                    >
                      {originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}

                  <p
                    className="mt-0.5 flex items-center justify-end gap-0.5 text-xs"
                    style={{ color: isSelected ? 'rgba(255,255,255,0.72)' : '#9CA3AF' }}
                  >
                    <Clock size={11} />
                    {service.duration_minutes} min
                  </p>
                </div>
              </div>

              {badge ? (
                <div className="mt-2 flex items-center gap-1">
                  <Tag
                    size={10}
                    style={{ color: isSelected ? (theme?.primaryTextColor || '#FFFFFF') : (theme?.primaryColor || '#16A34A') }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: isSelected ? (theme?.primaryTextColor || '#FFFFFF') : (theme?.primaryColor || '#16A34A') }}
                  >
                    {badge}
                  </span>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
