import { Navigate, useNavigate } from 'react-router';
import { getCurrentUserInitials, getCurrentUserName, getCurrentUserRole } from '@/lib/auth';
import { AdminRestaurantsPage } from '@/admin/pages/restaurants/AdminRestaurantsPage';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

export const CustomerLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = getCurrentUserRole();
  const userName = getCurrentUserName() || 'Cliente';
  const userInitials = getCurrentUserInitials();
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

  if (userRole && userRole !== 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600">Cliente</p>
            <h1 className="text-3xl font-semibold text-gray-900">Bienvenido, {userName}</h1>
            <p className="text-sm text-gray-600">Explora restaurantes y haz tu pedido.</p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              {userInitials}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <AdminRestaurantsPage />
      </main>
    </div>
  );
};
