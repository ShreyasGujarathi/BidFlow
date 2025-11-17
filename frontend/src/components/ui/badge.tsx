import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all";

  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success)',
          borderColor: 'var(--success-border)',
        };
      case "warning":
        return {
          backgroundColor: 'var(--warning-bg)',
          color: 'var(--warning)',
          borderColor: 'var(--warning-border)',
        };
      case "error":
        return {
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error)',
          borderColor: 'var(--error-border)',
        };
      case "secondary":
        return {
          backgroundColor: 'var(--surface)',
          color: 'var(--muted-foreground)',
          borderColor: 'var(--border)',
        };
      case "outline":
        return {
          backgroundColor: 'transparent',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        };
      default:
        return {
          backgroundImage: 'linear-gradient(120deg, var(--primary), #7c3bff)',
          color: '#ffffff',
          borderColor: 'transparent',
          boxShadow: '0 15px 35px rgba(59, 167, 255, 0.35)',
        };
    }
  };

  return (
    <span
      className={cn(baseStyles, className)}
      style={getStyles()}
      {...props}
    />
  );
}

export { Badge };

