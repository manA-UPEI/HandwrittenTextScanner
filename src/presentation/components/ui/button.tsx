import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-300",
  secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50",
};

/** The one button style used throughout the app — large touch target, mobile-first. */
export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => (
  <button
    className={`min-h-12 rounded-lg px-5 py-3 text-base font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  />
);
