import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2",
        className
      )}
      {...props}
    />
  );
});
