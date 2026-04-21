import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

type ErrorStateProps = {
  label?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function ErrorState({
  label = "Ocurrió un error",
  description,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("border-red-200 bg-red-50 text-sm text-red-700", className)}>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="font-medium text-red-800">{label}</p>
          {description ? <p className="text-xs text-red-700">{description}</p> : null}
        </div>
        {onRetry ? (
          <Button type="button" variant="subtle" onClick={onRetry} className="border border-red-200 bg-white text-red-700 hover:bg-red-100">
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
