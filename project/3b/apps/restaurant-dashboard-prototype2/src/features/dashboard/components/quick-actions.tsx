import { Link } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { Card } from "@/shared/components/ui/card";

const actions = [
  { to: ROUTES.ORDERS, label: "Orders", description: "Revisar pedidos del restaurante" },
  { to: ROUTES.KITCHEN, label: "Kitchen", description: "Ver cola y estado de cocina" },
  { to: ROUTES.PRODUCTS, label: "Products", description: "Controlar disponibilidad" },
];

export function QuickActions() {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
        <p className="text-sm text-slate-600">Atajos a las áreas operativas principales.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded border border-slate-200 bg-slate-50 p-3 text-sm transition-colors hover:border-slate-300 hover:bg-white"
          >
            <div className="font-medium text-slate-900">{action.label}</div>
            <div className="mt-1 text-xs text-slate-500">{action.description}</div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
