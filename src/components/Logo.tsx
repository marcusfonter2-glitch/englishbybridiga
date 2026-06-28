import logoUrl from "@/assets/logo.png";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

export function Logo({ className = "", showWordmark = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-10",
    md: "h-12",
    lg: "h-20",
    xl: "h-28",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoUrl}
        alt="English by Brigida"
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showWordmark && (
        <div className="leading-none">
          <div className="font-display text-lg font-extrabold tracking-tight text-navy">
            English
          </div>
          <div className="-mt-0.5 font-display text-xs italic text-brand">
            by Brigida
          </div>
        </div>
      )}
    </div>
  );
}
