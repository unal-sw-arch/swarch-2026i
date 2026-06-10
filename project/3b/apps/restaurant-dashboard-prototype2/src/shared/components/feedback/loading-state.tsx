import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/components/ui/card";

type LoadingStateProps = {
  label?: string;
  description?: string;
  className?: string;
  icon?: ReactNode;
};

export function LoadingState({
  label = "Cargando...",
  description,
  className,
  icon,
}: LoadingStateProps) {
  return (
    <Card className={cn("border-dashed text-sm text-slate-600", className)}>
      <div className="flex items-center gap-3">
        {icon ?? <div className="h-3 w-3 animate-pulse rounded-full bg-slate-400" />}
        <div className="space-y-1">
          <p className="font-medium text-slate-700">{label}</p>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
    </Card>
  );
}
