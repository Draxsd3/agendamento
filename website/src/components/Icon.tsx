import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icon — wrapper único para toda a UI.
 *
 * Regras da família de ícones:
 *  • Outline (Lucide), grid 24x24
 *  • Stroke 2.5 fixo (consistente em toda a interface)
 *  • Cor única via `currentColor` — herda do `text-*` do contexto
 *  • Tamanhos padronizados: sm (16) · md (20) · lg (24) · xl (28)
 *  • Cantos arredondados (linecap/linejoin = round) — padrão Lucide
 *
 * Uso:
 *   <Icon as={Calendar} />               // md, currentColor
 *   <Icon as={ArrowRight} size="sm" />
 *   <Icon as={Check} className="text-primary" />
 */

type IconSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<IconSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-7 h-7",
};

interface IconProps extends Omit<LucideProps, "size" | "strokeWidth" | "color" | "ref"> {
  as: LucideIcon;
  size?: IconSize;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ as: Component, size = "md", className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        strokeWidth={2.5}
        absoluteStrokeWidth
        className={cn(SIZE_MAP[size], "shrink-0", className)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Icon.displayName = "Icon";
