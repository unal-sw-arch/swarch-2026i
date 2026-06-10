import { useLocation, useNavigate } from 'react-router-dom';
import type { OrderConfirmation } from '../types';
import { CheckCircle2, ChevronRight, Package, Receipt } from 'lucide-react';

export const ConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const confirmation: OrderConfirmation = location.state?.confirmation;

    if (!confirmation) {
        return (
            <div className="flex flex-col items-center justify-center py-32 mt-8 animate-fade-in text-center">
                <p className="text-brand-muted mb-6 text-lg">No order data found.</p>
                <button
                    onClick={() => navigate('/menu/1')}
                    className="inline-flex items-center px-6 py-3 bg-brand-surface text-brand-green border border-brand-green/30 font-bold rounded-full smooth-hover shadow-lg"
                >
                    Return to Menu
                </button>
            </div>
        );
    }

    // Comply directly with WA-TEC-03 (Display orderId, status, totalAmount)
    return (
        <div className="max-w-3xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="bg-brand-surface shadow-2xl border border-white/5 rounded-[32px] overflow-hidden">
                <div className="bg-[#1A1A1A] border-b border-white/5 px-6 py-12 text-center rounded-t-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl mix-blend-screen pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
                    <CheckCircle2 className="mx-auto h-20 w-20 text-brand-green mb-6 animate-bounce relative z-10" />
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight relative z-10">Order Confirmed!</h2>
                    <p className="mt-3 text-lg text-brand-muted font-medium relative z-10">
                        Thank you for your order. We are preparing it now.
                    </p>
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 relative z-10">
                        <span className="inline-flex items-center px-5 py-2.5 rounded-xl text-[15px] font-bold bg-[#0B0B0B] text-white border border-white/10 shadow-inner">
                            Order #{confirmation.orderId}
                        </span>
                        <span className="inline-flex items-center px-5 py-2.5 rounded-xl text-[15px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
                            Status: {confirmation.status}
                        </span>
                    </div>
                </div>

                <div className="px-8 py-10 bg-[#0B0B0B]">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <Receipt className="w-6 h-6 mr-3 text-brand-orange" />
                        Order Details
                    </h3>

                    <ul className="divide-y divide-white/5 border-t border-b border-white/5 mb-8">
                        {confirmation.items?.map((item, idx) => (
                            <li key={idx} className="py-6 flex justify-between items-center group">
                                <div className="flex-1">
                                    <p className="text-[16px] font-bold text-white mb-1">{item.productName}</p>
                                    <p className="text-[14px] text-brand-muted font-medium">
                                        Qty: {item.quantity}  <span className="mx-2 text-white/10">|</span>  ${item.unitPrice}
                                    </p>
                                </div>
                                <div className="text-[18px] font-bold text-white bg-[#1A1A1A] px-4 py-2 rounded-xl group-hover:bg-white/5 transition-colors">
                                    ${item.subtotal}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="flex justify-between items-center text-xl font-bold">
                        <p className="text-brand-muted uppercase tracking-wider text-sm">Total Amount</p>
                        <p className="text-[32px] text-white">${confirmation.totalAmount}</p>
                    </div>
                </div>

                <div className="px-8 py-8 bg-[#1A1A1A] border-t border-white/5 flex flex-col sm:flex-row gap-6 justify-between items-center">
                    <button
                        onClick={() => navigate('/menu/1')}
                        className="text-brand-muted hover:text-white font-bold transition-colors"
                    >
                        Back to Menu
                    </button>

                    <button
                        onClick={() => navigate(`/tracking/${confirmation.orderId}`)}
                        className="inline-flex items-center px-8 py-4 text-[16px] font-bold rounded-2xl text-white bg-brand-green hover:brightness-110 shadow-lg shadow-brand-green/20 smooth-hover w-full sm:w-auto justify-center active:scale-95"
                    >
                        <Package className="w-5 h-5 mr-3 fill-current/20" />
                        Track Order
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};
