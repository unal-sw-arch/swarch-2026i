import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { BarChart3, Clock, Gift, Edit3, Truck, LogOut, Check } from 'lucide-react';

// Shared internal Sidebar component
const ProfileSidebar = () => {
    const navItems = [
        { path: 'analytics', label: 'Analytics', icon: BarChart3 },
        { path: 'history', label: 'History of orders', icon: Clock },
        { path: 'points', label: 'Bonus points', icon: Gift },
        { path: 'edit', label: 'Edit profile', icon: Edit3 },
        { path: 'terms', label: 'Delivery term', icon: Truck },
    ];

    return (
        <div className="w-[300px] shrink-0 bg-[#1A1A1A] p-2 flex flex-col justify-between h-full rounded-[32px] border border-white/5">
            <nav className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-4 px-6 py-[18px] rounded-[20px] font-bold text-[15px] smooth-hover ${isActive ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-brand-muted hover:bg-white/5 hover:text-white'}`}
                    >
                        <item.icon className="w-[20px] h-[20px]" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4">
                <button className="flex items-center gap-4 px-6 py-[18px] w-full rounded-[20px] font-bold text-[15px] text-white bg-white/5 hover:bg-white/10 smooth-hover">
                    <LogOut className="w-[20px] h-[20px]" />
                    Exit
                </button>
            </div>
        </div>
    );
};

// Analytics/Rewards View
const AnalyticsView = () => {
    const rewards = [
        { title: 'Coffee Hero', type: 'coffee', icon: '☕', progress: 120, max: 120, bg: 'bg-[#B13A24]' },
        { title: 'Loyal Patron', type: 'loyal', icon: '🧛‍♂️', progress: 100, max: 100, bg: 'bg-brand-orange' },
        { title: 'Exotic Taste', type: 'exotic', icon: '🏝️', progress: 120, max: 120, bg: 'bg-[#2E7F18]' },
        { title: 'Quick Starter', type: 'quick', icon: '🏃', progress: 120, max: 120, bg: 'bg-[#007EA7]' },
        { title: 'Cake Hero', type: 'cake', icon: '🍰', progress: 100, max: 100, bg: 'bg-[#DDA15E]' },
    ];

    // Mock graph points (SVG path simple version)
    const points = "0,80 50,75 100,60 150,65 200,40 250,50 300,20 350,30 400,10";

    return (
        <div className="flex-1 animate-fade-in pr-6 lg:pr-12">
            <h2 className="text-2xl font-bold text-white mb-8 pl-2">Your rewards</h2>

            <div className="flex gap-6 mb-12 overflow-x-auto pb-4 custom-scrollbar">
                {rewards.map((r, idx) => (
                    <div key={idx} className="flex flex-col items-center shrink-0">
                        <div className={`w-[96px] h-[96px] rounded-full border-4 ${r.progress >= r.max ? 'border-brand-green' : 'border-brand-muted/30'} flex justify-center items-center shadow-2xl relative mb-3 group`}>
                            <div className={`w-[84px] h-[84px] rounded-full flex justify-center items-center ${r.bg} border-2 border-[#1A1A1A] text-[36px]`}>
                                {r.icon}
                            </div>
                            {/* Lemon badge */}
                            <div className="absolute -bottom-1 -right-1 w-[26px] h-[26px] bg-[#FFD166] rounded-full border-[3px] border-[#0B0B0B] flex items-center justify-center text-[10px] transform group-hover:scale-110 smooth-hover shadow-md">🍋</div>
                        </div>
                        <span className="text-[14px] font-bold text-white tracking-wide">{r.progress}/{r.max} point</span>
                    </div>
                ))}
            </div>

            <div className="bg-[#1A1A1A] rounded-[32px] p-8 border border-white/5 mb-10 overflow-hidden relative group">
                <h3 className="text-xl font-bold text-white text-center mb-6">What new dish would you like to see on our menu?</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { n: 'Spicy seasoned seafood noodles', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150' },
                        { n: 'Beef dumpling in hot and sour soup', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150' },
                        { n: 'Healthy noodle with spinach leaf', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150' },
                        { n: 'Spicy instant noodle with omelet', img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=150' }
                    ].map((dish, i) => (
                        <div key={i} className="bg-[#0B0B0B] flex flex-col justify-center items-center text-center p-4 rounded-3xl cursor-pointer hover:bg-white/5 relative border border-white/5 group-hover:border-transparent smooth-hover">
                            <img src={dish.img} className="w-[72px] h-[72px] rounded-full object-cover mb-4 border-2 border-[#1A1A1A] shadow-lg group-hover:scale-110 transition-transform duration-500" />
                            <p className="text-[12px] font-bold text-brand-muted leading-snug lowercase">{dish.n}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytics Chart Region */}
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 pb-10 border border-white/5 relative min-h-[300px] overflow-hidden">
                <div className="flex justify-between items-center mb-[60px] relative z-10">
                    <h3 className="text-xl font-bold text-white">Average Sum of check</h3>
                </div>

                <div className="absolute inset-x-8 bottom-10 top-[100px] flex">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-full text-[12px] font-bold text-brand-muted shrink-0 w-[40px] pt-1 z-10">
                        <span>$700</span>
                        <span>$600</span>
                        <span>$400</span>
                        <span>$250</span>
                        <span>$100</span>
                        <span>$50</span>
                    </div>

                    {/* Chart SVG Area */}
                    <div className="flex-1 h-full relative" style={{ marginLeft: '16px' }}>
                        <svg className="w-full h-[180px] overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                            <defs>
                                <linearGradient id="chart-grad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {/* Area fill */}
                            <path d={`M0,100 L${points} L400,100 Z`} fill="url(#chart-grad)" className="animate-fade-in-up origin-bottom" style={{ animationDuration: '1s' }} />

                            {/* Line */}
                            <path d={`M${points}`} fill="none" stroke="#FF4D00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Data points */}
                            <g fill="#0B0B0B" stroke="#FF4D00" strokeWidth="3">
                                {points.split(' ').map((p, i) => {
                                    const [x, y] = p.split(',');
                                    const isMax = i === 6; // Just picking a highlight point
                                    return (
                                        <g key={i}>
                                            <circle cx={x} cy={y} r="5" className="animate-pulse" />
                                            {isMax && (
                                                <g transform={`translate(${Number(x)}, ${Number(y) - 25})`}>
                                                    <rect x="-15" y="-12" width="30" height="20" rx="6" fill="#1A1A1A" stroke="#FF4D00" strokeWidth="1" />
                                                    <text x="0" y="2" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle">612</text>
                                                    <polygon points="-4,8 4,8 0,14" fill="#1A1A1A" />
                                                </g>
                                            )}
                                        </g>
                                    )
                                })}
                            </g>
                        </svg>

                        {/* X-axis labels */}
                        <div className="flex justify-between text-[11px] font-bold text-brand-muted/50 uppercase mt-4 w-full">
                            <span>January</span>
                            <span>February</span>
                            <span>March</span>
                            <span>April</span>
                            <span>May</span>
                            <span>June</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Edit Profile View
const EditProfileView = () => {
    return (
        <div className="flex-1 animate-fade-in pr-6 lg:pr-[120px]">
            <div className="mb-12 flex items-center gap-6">
                <div className="relative">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=FF4D00" alt="Avatar" className="w-[100px] h-[100px] rounded-full border-[6px] border-[#1A1A1A] shadow-2xl object-cover bg-brand-orange" />
                    <div className="absolute bottom-0 right-0 w-[32px] h-[32px] bg-brand-green border-4 border-[#0B0B0B] rounded-full flex justify-center items-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="text-[28px] font-bold text-white leading-none mb-2">Martin John</h2>
                    <p className="text-brand-muted text-[15px] font-semibold">1000 points</p>
                </div>
            </div>

            <div className="space-y-12 max-w-[800px]">
                <div>
                    <h3 className="text-xl font-bold text-white mb-6">Personal contacts</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">First name</label>
                            <input type="text" defaultValue="Martin" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">Last name</label>
                            <input type="text" defaultValue="John" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">Phone number</label>
                            <input type="tel" defaultValue="38 (096) 243 96 73" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">Email</label>
                            <input type="email" defaultValue="martinjohn@gmail.com" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner" />
                        </div>
                    </div>
                    <button className="mt-8 bg-brand-surface/80 hover:bg-brand-surface border border-brand-green/30 text-brand-green hover:text-white px-8 py-4 rounded-[16px] font-bold transition-all shadow-md smooth-hover">
                        Save changes
                    </button>
                </div>

                <div className="border-t border-white/5 pt-12">
                    <h3 className="text-xl font-bold text-white mb-6">Delivery</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">City</label>
                            <div className="relative">
                                <select className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] appearance-none font-medium">
                                    <option>Lviv</option>
                                </select>
                                <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-[2]">
                                <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">Street</label>
                                <input type="text" defaultValue="St. Bandera" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-brand-muted ml-1 mb-2">House number №</label>
                                <input type="text" defaultValue="22A" className="w-full bg-brand-surface border-none rounded-[16px] px-6 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] shadow-inner text-center" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Icon helper
const ChevronDownIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
);

export const ProfilePage = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-10 w-full mt-2 lg:px-6 h-[calc(100vh-[150px])]">
            <div className="hidden lg:block h-full">
                <ProfileSidebar />
            </div>

            <div className="flex-1 overflow-y-auto h-full custom-scrollbar pt-2 pl-4 pb-20">
                <Routes>
                    <Route path="analytics" element={<AnalyticsView />} />
                    <Route path="edit" element={<EditProfileView />} />
                    {/* Fallbacks */}
                    <Route path="*" element={<Navigate to="analytics" replace />} />
                </Routes>
            </div>
        </div>
    );
};
