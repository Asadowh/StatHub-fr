interface CountryBadgeProps {
  code: string;
  flag: string;
  className?: string;
}

export const CountryBadge = ({ code, flag, className = "" }: CountryBadgeProps) => {
  return (
    <div className={`relative inline-flex items-center justify-center px-3 py-1 rounded-md bg-muted/30 border border-border/50 ${className}`}>
      <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 pointer-events-none">
        {flag}
      </span>
      <span className="relative z-10 font-semibold text-sm">{code}</span>
    </div>
  );
};
