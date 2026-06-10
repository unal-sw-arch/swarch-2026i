import { Outlet, NavLink } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User, ChevronDown, BarChart2, History, Settings, Bike, Search } from 'lucide-react';

const Sidebar = () => {
    const icons = [
        { icon: BarChart2, path: '/profile/analytics' },
        { icon: History, path: '/profile/history' },
        { icon: User, path: '/profile' },
        { icon: Settings, path: '/profile/settings' },
    ];

    return (
        <aside className="w-[80px] h-screen bg-brand-surface fixed left-0 top-0 flex flex-col items-center py-6 z-50 border-r border-white/5 rounded-r-[24px]">
            <div className="bg-brand-orange rounded-[16px] w-12 h-12 flex items-center justify-center mb-10 overflow-hidden text-white font-bold shadow-lg shadow-brand-orange/20">
                <Bike className="w-6 h-6" />
            </div>
            <nav className="flex flex-col gap-6">
                <NavLink to="/" className={({ isActive }) => `relative p-3 rounded-xl transition-colors group ${isActive ? 'text-white' : 'text-brand-muted hover:text-white'}`}>
                    {({ isActive }) => (
                        <>
                            <Home className="w-6 h-6" />
                            {isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-orange rounded-full" />}
                            {/* Hover indicator */}
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden" />
                        </>
                    )}
                </NavLink>
                {icons.map((item, idx) => (
                    <NavLink key={idx} to={item.path} className={({ isActive }) => `relative p-3 rounded-xl transition-colors group ${isActive ? 'text-white' : 'text-brand-muted hover:text-white'}`}>
                        {({ isActive }) => (
                            <>
                                <item.icon className="w-6 h-6" />
                                {isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-orange rounded-full" />}
                                {!isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

import { useCart } from '../hooks/useCart';

const Header = () => {
    const { cartTotalElements } = useCart();

    return (
        <header className="h-[90px] px-8 flex items-center justify-between w-full shrink-0">
            <div className="flex items-center gap-6">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                    <Bike className="w-6 h-6 text-brand-orange" />
                    <span className="font-black text-xl tracking-tight text-white uppercase">DELI<span className="text-brand-orange tracking-tighter">UNAL</span></span>
                </div>

                <div className="w-px h-6 bg-white/10 mx-2"></div>

                <div className="flex items-center gap-2 cursor-pointer smooth-hover hover:opacity-80">
                    <span className="font-bold text-[15px]">Lviv</span>
                    <ChevronDown className="w-4 h-4 text-brand-muted" />
                </div>
            </div>

            <div className="hidden lg:flex items-center bg-[#1A1A1A] rounded-[16px] px-4 py-2 border border-white/5 mx-6 flex-1 max-w-[300px]">
                <Search className="w-4 h-4 text-brand-muted mr-3" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none text-[14px] text-white focus:outline-none w-full placeholder:text-brand-muted" />
            </div>

            <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-brand-muted">
                <NavLink to="/menu/1" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white smooth-hover'}>Menu</NavLink>
                <NavLink to="/tracking/last" className={({ isActive }) => isActive ? 'text-white' : 'hover:text-white smooth-hover'}>Delivery tracker</NavLink>
                <span className="hover:text-white cursor-pointer smooth-hover">Restaurants</span>
                <span className="hover:text-white cursor-pointer smooth-hover">Help center</span>
            </nav>

            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[16px] bg-brand-surface flex items-center justify-center cursor-pointer hover:bg-brand-orange hover:border-brand-orange text-brand-muted hover:text-white smooth-hover border border-white/5">
                    <Heart className="w-5 h-5 fill-current opacity-70" />
                </div>
                <NavLink to="/order" className="w-12 h-12 rounded-[16px] bg-brand-green flex items-center justify-center cursor-pointer text-white relative smooth-hover hover:brightness-110 shadow-lg shadow-brand-green/20">
                    <ShoppingBag className="w-5 h-5" />
                    {cartTotalElements > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-bg">
                            {cartTotalElements}
                        </span>
                    )}
                </NavLink>
                <NavLink to="/profile" className="w-12 h-12 rounded-[16px] overflow-hidden bg-brand-orange ml-2 flex items-center justify-center border border-white/5 cursor-pointer smooth-hover hover:brightness-110">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=FF4D00" alt="Avatar" className="w-full h-full object-cover" />
                </NavLink>
            </div>
        </header>
    );
};

export const Layout = () => {
    return (
        <div className="min-h-screen bg-brand-bg text-white flex">
            {/* Sidebar spacing reservation */}
            <div className="w-[80px] shrink-0 hidden sm:block">
                <Sidebar />
            </div>

            <div className="flex flex-col w-full min-w-0">
                <Header />
                <main className="flex-1 w-full px-4 sm:px-8 pb-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
