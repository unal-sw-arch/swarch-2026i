import { useLocation } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { useAuthStore } from "@/app/store/auth.store";

const sectionTitles: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Restaurant Dashboard",
  [ROUTES.ORDERS]: "Orders",
  [ROUTES.KITCHEN]: "Kitchen",
  [ROUTES.PRODUCTS]: "Products",
};

export function Topbar() {
  const pathname = useLocation().pathname;
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const role = useAuthStore((state) => state.role);

  const title = sectionTitles[pathname] ?? "Restaurant Dashboard";

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">
          Restaurant: {restaurantId ?? "-"} {role ? `| Role: ${role}` : ""}
        </p>
      </div>
    </header>
  );
}
