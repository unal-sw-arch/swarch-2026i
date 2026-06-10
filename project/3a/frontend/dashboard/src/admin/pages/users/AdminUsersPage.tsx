import { useMemo, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Role = "Customer" | "RestaurantManager" | "Waiter" | "Chef" | "SystemAdministrator";
type Status = "pending" | "active" | "suspended";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  restaurant?: string;
  createdAt: string;
  lastActivity: string;
  requiresApproval?: boolean;
}

const initialUsers: AdminUser[] = [
  {
    id: "U-1001",
    name: "Sarah Johnson",
    email: "sarah.johnson@bistro.com",
    role: "RestaurantManager",
    status: "pending",
    restaurant: "Urban Bistro",
    createdAt: "2025-10-18",
    lastActivity: "Hace 2 días",
    requiresApproval: true,
  },
  {
    id: "U-1002",
    name: "Carlos Mendez",
    email: "carlos.mendez@cafeandino.com",
    role: "RestaurantManager",
    status: "active",
    restaurant: "Café Andino",
    createdAt: "2025-09-12",
    lastActivity: "Hace 3 horas",
  },
  {
    id: "U-2001",
    name: "Ana Ríos",
    email: "ana.rios@client.com",
    role: "Customer",
    status: "active",
    createdAt: "2025-09-25",
    lastActivity: "Hace 10 minutos",
  },
  {
    id: "U-3001",
    name: "Luis Ortega",
    email: "luis.ortega@chefhouse.com",
    role: "Chef",
    status: "active",
    restaurant: "Urban Bistro",
    createdAt: "2025-08-30",
    lastActivity: "Hace 30 minutos",
  },
  {
    id: "U-4001",
    name: "Marta Díaz",
    email: "marta.diaz@service.com",
    role: "Waiter",
    status: "suspended",
    restaurant: "Café Andino",
    createdAt: "2025-07-02",
    lastActivity: "Hace 1 mes",
  },
  {
    id: "U-9001",
    name: "Admin Principal",
    email: "admin@clickmunch.com",
    role: "SystemAdministrator",
    status: "active",
    createdAt: "2025-05-01",
    lastActivity: "Hace 5 minutos",
  },
];

const roleLabels: Record<Role, string> = {
  Customer: "Cliente",
  RestaurantManager: "Administrador restaurante",
  Waiter: "Mesero",
  Chef: "Chef",
  SystemAdministrator: "Administrador del sistema",
};

const statusLabels: Record<Status, string> = {
  pending: "Pendiente",
  active: "Activo",
  suspended: "Suspendido",
};

const statusColors: Record<Status, string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.restaurant && user.restaurant.toLowerCase().includes(query));
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, roleFilter, statusFilter, search]);

  const totals = useMemo(() => {
    return {
      total: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      managersPending: users.filter((u) => u.role === "RestaurantManager" && u.status === "pending").length,
    };
  }, [users]);

  const setStatus = (id: string, status: Status) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status,
              requiresApproval: status === "pending" ? user.requiresApproval : false,
            }
          : user
      )
    );
  };

  const approveManager = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: "active",
              requiresApproval: false,
              lastActivity: "Aprobado ahora",
            }
          : user
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-600">
          Gestión de cuentas y roles (clientes, administradores de restaurante, meseros, chefs y administradores del sistema).
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={totals.total} color="blue" />
        <SummaryCard label="Activos" value={totals.active} color="green" />
        <SummaryCard label="Pendientes" value={totals.pending} color="amber" />
        <SummaryCard label="Suspendidos" value={totals.suspended} color="red" />
      </div>

      {totals.managersPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg">
          {totals.managersPending} solicitudes de administradores de restaurante requieren aprobación.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, correo o restaurante..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
              className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table>
          <TableCaption>Gestión de usuarios y aprobaciones.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-sm text-gray-500">{user.lastActivity}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{roleLabels[user.role]}</TableCell>
                <TableCell>{user.restaurant ?? "—"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                    {statusLabels[user.status]}
                  </span>
                  {user.requiresApproval && (
                    <span className="ml-2 text-xs text-amber-700">Requiere aprobación</span>
                  )}
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {user.status === "pending" && user.role === "RestaurantManager" && (
                      <button
                        onClick={() => approveManager(user.id)}
                        className="text-sm px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Aprobar
                      </button>
                    )}

                    {user.status !== "suspended" && (
                      <button
                        onClick={() => setStatus(user.id, "suspended")}
                        className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Suspender
                      </button>
                    )}
                    {user.status === "suspended" && (
                      <button
                        onClick={() => setStatus(user.id, "active")}
                        className="text-sm px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Reactivar
                      </button>
                    )}
                    {user.status === "active" && (
                      <button
                        onClick={() => setStatus(user.id, "pending")}
                        className="text-sm px-3 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"
                      >
                        Marcar pendiente
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  color: "blue" | "green" | "amber" | "red";
}

const SummaryCard = ({ label, value, color }: SummaryCardProps) => {
  const base = {
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    green: "bg-green-50 text-green-800 border-green-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
    red: "bg-red-50 text-red-800 border-red-100",
  }[color];

  return (
    <div className={`p-4 rounded-xl border ${base}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

