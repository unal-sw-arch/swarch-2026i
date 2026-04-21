import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { MenuItem } from '../types';
import { getMenuItems } from '../services/order.service';
import { Flame, Plus, ChevronDown, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export const CatalogPage = () => {
    const { menuId } = useParams();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { cart, addToCart } = useCart();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setLoading(true);
                const data = await getMenuItems(menuId || 1);
                setItems(data.filter(item => item.isAvailable));
            } catch (err) {
                // Global error handler handles this
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [menuId]);

    // Decorative static mock data for the UI
    const lastOrders = [
        { id: 1, name: 'Vegetable bowl', weight: '360 g', price: 15, date: '24.02.2024', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
        { id: 2, name: 'Orange salad', weight: '400 g', price: 20, date: '24.02.2024', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop' },
        { id: 3, name: 'Avocado salad', weight: '350 g', price: 25, date: '23.02.2024', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' },
    ];

    if (loading) {
        return (
            <div className="flex gap-10 w-full relative">
                <div className="flex-1 min-w-0">
                    <div className="bg-[#1A1A1A] rounded-[24px] h-[250px] mb-16 animate-pulse border border-white/5"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-[120px] mt-28">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-[#1A1A1A] rounded-[24px] h-[200px] animate-pulse border border-white/5 relative">
                                <div className="absolute -top-[70px] left-1/2 -translate-x-1/2 w-[160px] h-[160px] bg-brand-bg rounded-full border-4 border-[#1A1A1A]"></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-[340px] shrink-0 hidden lg:block bg-[#1A1A1A] rounded-[24px] border border-white/5 h-screen sticky top-6 animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="flex gap-10 w-full relative">
            <div className="flex-1 min-w-0">
                {/* PROMO BANNER */}
                <div className="bg-brand-orange rounded-[24px] p-8 md:p-12 relative overflow-hidden mb-16 shadow-lg shadow-brand-orange/10 flex items-center min-h-[250px]">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl mix-blend-overlay"></div>

                    <div className="relative z-10 max-w-[60%]">
                        <h1 className="text-3xl md:text-[40px] font-black text-white leading-[1.1] uppercase tracking-tight mb-8">
                            Enjoy our service<br />in 104 areas <span className="text-yellow-300">✨</span>
                        </h1>
                        <button className="bg-brand-green hover:brightness-110 text-white font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 smooth-hover text-sm">
                            Chose your city
                            <ChevronDown className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80" alt="Pizza" className="absolute -right-8 -top-8 w-56 h-56 object-cover rounded-full shadow-2xl border-4 border-brand-orange hidden md:block" />
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" alt="Bowl" className="absolute right-36 -bottom-16 w-48 h-48 object-cover rounded-full shadow-2xl border-4 border-brand-orange z-0 hidden md:block" />
                </div>

                <div className="flex items-center justify-between mb-28">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">For you</h2>
                    <button className="bg-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white px-5 py-2.5 rounded-full text-sm font-bold smooth-hover inline-flex items-center gap-1">
                        See more <span className="ml-1 tracking-tighter">»</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-[120px]">
                    {items.length === 0 && !loading ? (
                        <div className="col-span-1 sm:col-span-2 xl:col-span-3 text-center py-20 text-brand-muted">
                            <Flame className="w-12 h-12 mx-auto mb-4 text-brand-orange/50" />
                            <h3 className="text-xl font-bold text-white mb-2">No menu available</h3>
                            <p className="text-[14px]">Could not fetch the latest delicious dishes from the kitchen.<br />Make sure the backend service is running.</p>
                        </div>
                    ) : items.map(item => {
                        const inCart = cart.find(c => c.menuItemId === item.id);
                        return (
                            <div key={item.id} className="bg-brand-surface rounded-[24px] relative border border-white/5 card-hover flex flex-col pt-[110px] pb-6 px-6">
                                <div className="absolute -top-[70px] left-1/2 -translate-x-1/2 w-[160px] h-[160px]">
                                    <img
                                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300'}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-full shadow-2xl shadow-black/60 border border-white/10"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300';
                                        }}
                                    />
                                    <div className="absolute top-2 -right-4 bg-brand-bg rounded-full p-2 border border-white/5 shadow-lg">
                                        <Flame className="w-4 h-4 text-brand-orange" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center mt-2">
                                    <h3 className="text-[17px] font-bold text-white mb-2">{item.name}</h3>
                                    <p className="text-[13px] text-brand-muted leading-relaxed line-clamp-2 px-2 lowercase">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/5">
                                    <div className="flex items-center gap-1.5">
                                        <Flame className="w-4 h-4 text-brand-orange" />
                                        <span className="text-white font-bold text-sm">{Math.floor(Math.random() * 200 + 150)} Kcal</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-bold text-white">
                                            ${item.price}
                                        </span>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-[42px] h-[42px] bg-brand-green rounded-[14px] flex items-center justify-center hover:brightness-110 smooth-hover shadow-lg shadow-brand-green/20 active:scale-95"
                                        >
                                            {inCart ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="w-[340px] shrink-0 hidden lg:block bg-brand-surface rounded-[24px] border border-white/5 p-7 h-fit sticky top-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Last orders</h3>
                    <button className="bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white px-4 py-1.5 rounded-full text-sm font-bold smooth-hover">
                        See all
                    </button>
                </div>

                <div className="flex flex-col">
                    {lastOrders.map((order) => (
                        <div key={order.id} className="relative mb-6">
                            <div className="flex items-center justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-4">
                                    <img src={order.image} alt={order.name} className="w-[52px] h-[52px] rounded-full object-cover border border-white/10" />
                                    <div>
                                        <h4 className="font-bold text-white text-[15px] leading-tight">{order.name}</h4>
                                        <p className="text-[13px] text-brand-muted mt-0.5">{order.weight}</p>
                                        <p className="text-[14px] font-bold text-white mt-1.5">${order.price}</p>
                                    </div>
                                </div>
                                <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-[12px] text-xs font-bold smooth-hover shadow-sm">
                                    Repeat
                                </button>
                            </div>
                            <p className="text-xs text-brand-muted font-medium mb-2 pl-[68px]">{order.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
