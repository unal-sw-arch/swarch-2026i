import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { useAuthStore } from "@/app/store/auth.store";
import { Button } from "@/shared/components/ui/button";

const links = [
  { to: ROUTES.DASHBOARD, label: "Dashboard" },
  { to: ROUTES.ORDERS, label: "Orders" },
  { to: ROUTES.KITCHEN, label: "Kitchen" },
  { to: ROUTES.PRODUCTS, label: "Products" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4">
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Restaurant</p>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              [
                "rounded px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")
            }
          >
            {link.label}
          </NavLink>
        ))}
        <div className="mt-auto pt-4">
          <Button type="button" variant="subtle" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </nav>
    </aside>
  );
}
