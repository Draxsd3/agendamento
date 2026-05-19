interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { text: "text-lg", icon: 18, gap: "gap-1.5" },
  md: { text: "text-2xl", icon: 22, gap: "gap-2" },
  lg: { text: "text-3xl md:text-4xl", icon: 28, gap: "gap-2.5" },
};

export const ClickCursor = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Click sparks/lines */}
    <path
      d="M19 4 L18 9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M24 5 L22 9.5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M14 6 L16 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Arrow/cursor */}
    <path
      d="M16 12 L29 19 L22 21 L19 28 L16 12 Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const Logo = ({ className = "", variant = "default", iconOnly = false, size = "md" }: LogoProps) => {
  const sizeCfg = SIZE_MAP[size];
  const baseColor = variant === "light" ? "text-white" : "text-foreground";

  if (iconOnly) {
    return <ClickCursor size={sizeCfg.icon} className={`text-primary ${className}`} />;
  }

  return (
    <div className={`flex items-center ${sizeCfg.gap} ${className}`}>
      <span className={`font-display font-extrabold tracking-tight italic ${sizeCfg.text} ${baseColor}`}>
        Agen
      </span>
      <span className={`font-display font-extrabold tracking-tight italic ${sizeCfg.text} text-primary -ml-1`}>
        click
      </span>
      <ClickCursor size={sizeCfg.icon} className="text-primary -ml-0.5" />
    </div>
  );
};

export default Logo;
