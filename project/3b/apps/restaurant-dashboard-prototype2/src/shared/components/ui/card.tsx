import { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/cn";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return <div className={cn("rounded border border-slate-200 bg-white p-4", className)}>{children}</div>;
}
