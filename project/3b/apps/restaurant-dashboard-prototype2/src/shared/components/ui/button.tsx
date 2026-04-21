import { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonVariant = "primary" | "subtle";

type ExtendedButtonProps = ButtonProps & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  subtle: "bg-slate-100 text-slate-800 hover:bg-slate-200",
};

export function Button({ className, variant = "primary", ...props }: ExtendedButtonProps) {
  return (
    <button
      className={cn(
        "rounded px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
