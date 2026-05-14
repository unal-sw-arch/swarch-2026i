import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserInitials, getCurrentUserRole } from '@/lib/auth';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = useMemo(() => getCurrentUserInitials(), []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allQuickLinks = [
    { label: "Dashboard", path: "/", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Productos", path: "/products", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Usuarios", path: "/users", roles: ['ADMIN'] },
    { label: "Órdenes", path: "/orders", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Reservas", path: "/reservations", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Restaurantes", path: "/restaurants", roles: ['ADMIN'] },
    { label: "Ratings", path: "/ratings", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Reportes", path: "/reports", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Notificaciones", path: "/notifications", roles: ['ADMIN', 'RESTAURANT_MANAGER'] },
    { label: "Ajustes", path: "/settings", roles: ['ADMIN'] },
    { label: "Ayuda", path: "/help", roles: ['ADMIN'] },
  ];

  const quickLinks = useMemo(() => {
    const userRole = getCurrentUserRole();
    if (!userRole) return [];
    
    return allQuickLinks.filter(link => link.roles.includes(userRole));
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickLinks.slice(0, 5);
    return quickLinks.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, quickLinks]);

  const handleSelect = (path: string) => {
    setFocused(false);
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0].path);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 h-18">
      <div className="flex items-center justify-between">
        {/* Search */}
        <form className="flex-1 max-w-md" onSubmit={handleSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder="Busca secciones: productos, usuarios, órdenes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {focused && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.path}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(item.path)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-800"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button title="button" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <button title="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageSquare size={20} />
          </button>
          
          <button title="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-lg transition-shadow flex items-center gap-1"
            >
              {userInitial}              
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.username || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Rol'}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                    navigate('/auth/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
