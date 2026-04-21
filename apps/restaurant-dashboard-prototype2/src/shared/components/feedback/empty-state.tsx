import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/components/ui/card";

type EmptyStateProps = {
  label?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ label = "Sin resultados", description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed text-sm text-slate-500", className)}>
      <div className="space-y-2">
        <p className="font-medium text-slate-700">{label}</p>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        {action ? <div>{action}</div> : null}
      </div>
    </Card>
  );
}
