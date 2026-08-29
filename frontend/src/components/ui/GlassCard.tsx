interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accentBorder?: string;
}

export function GlassCard({ children, className = '', hover = true, accentBorder }: GlassCardProps) {
  return (
    <div
      className={`bg-surface border border-border-subtle rounded-xl ${hover ? 'glass-card' : ''} ${className}`}
      style={accentBorder ? { borderLeft: `3px solid ${accentBorder}` } : undefined}
    >
      {children}
    </div>
  );
}
