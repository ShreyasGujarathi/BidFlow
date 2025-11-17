import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

type ButtonVariant = NonNullable<ButtonProps["variant"]>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants: Record<ButtonVariant, string> = {
      default:
        "bg-gradient-to-r from-[var(--primary)] via-[#5b73ff] to-[#7c3bff] text-white shadow-[0_20px_45px_rgba(59,167,255,0.35)] hover:shadow-[0_30px_65px_rgba(59,167,255,0.45)] hover:-translate-y-0.5",
      outline:
        "border border-[var(--border)] text-[var(--foreground)] bg-transparent hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      ghost:
        "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
      secondary:
        "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-[0_18px_45px_rgba(246,195,80,0.35)] hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(246,195,80,0.45)]",
    };

    const sizes = {
      default: "h-11 px-6",
      sm: "h-9 px-4 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        style={style}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

