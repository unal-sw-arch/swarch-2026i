import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderPayload } from '../types';
import { createOrder } from '../services/order.service';
import { Minus, Plus, Loader2, ChevronLeft, ChevronDown } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export const OrderPage = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

    const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);

    // Step 1 State
    const [addressId, setAddressId] = useState<string>('new');
    const [city, setCity] = useState('Ternopil');
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [entrance, setEntrance] = useState('');
    const [floor, setFloor] = useState('');
    const [flat, setFlat] = useState('');
    const [intercom, setIntercom] = useState('');
    const [saveAddress, setSaveAddress] = useState(false);

    // Customer Info
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Step 2 State
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [deliveryMode, setDeliveryMode] = useState('delivery');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const savedAddresses = [
        { id: '1', label: 'Lviv, St. Red, 12A, entrance 6, floor 7, flat 76, intercom - 7621' },
        { id: '2', label: 'Kyiv, St. Green, 22A, entrance 3, floor 9, flat 98, intercom - 8742' },
    ];

    const handleContinueToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setCheckoutStep(2);
    };

    const handleOrderSubmit = async () => {
        if (cart.length === 0) return;

        setIsSubmitting(true);
        try {
            const customerNameInput = `${firstName} ${lastName}`.trim();
            const payload: OrderPayload = {
                restaurantId: 1,
                customerName: customerNameInput || "Current User",
                customerPhone: phone || "555-0199",
                notes: `Delivery to ${city}, ${street}, House ${houseNumber}, Entrance ${entrance}, Floor ${floor}, Flat ${flat}, Intercom ${intercom}`,
                items: cart.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                })),
            };

            const responseData = await createOrder(payload);
            navigate(`/confirmation/${responseData.orderId}`, {
                state: { confirmation: responseData }
            });
            clearCart();
        } catch (err) {
            // Global error handler takes care of displaying it
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/menu/1')}
                    className="inline-flex items-center px-6 py-3 bg-brand-green text-white font-bold rounded-full smooth-hover shadow-lg shadow-brand-green/20"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col xl:flex-row gap-12 w-full mt-2 lg:px-6 relative">
            {/* Left Column - Checkout Flow */}
            <div className="flex-1 min-w-0 xl:max-w-[800px]">
                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-8">
                        {checkoutStep === 2 && (
                            <button onClick={() => setCheckoutStep(1)} className="w-[42px] h-[42px] bg-brand-surface rounded-[14px] flex items-center justify-center hover:bg-white/10 smooth-hover text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-3xl md:text-[34px] font-black text-white uppercase tracking-tight">
                            Placing an order
                        </h1>
                    </div>

                    <div className="flex justify-between text-[13px] font-bold text-brand-muted mb-3">
                        <span>{checkoutStep === 1 ? 'Delivery' : 'Payment'}</span>
                        <span>{checkoutStep}/2</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-brand-surface rounded-full h-1.5 flex overflow-hidden">
                        <div className={`bg-brand-green h-full rounded-full transition-all duration-500 ${checkoutStep === 1 ? 'w-1/2' : 'w-full'}`}></div>
                    </div>
                </div>

                <div className="max-w-xl animate-fade-in">
                    {checkoutStep === 1 ? (
                        /* STEP 1: DELIVERY ADDRESS */
                        <form onSubmit={handleContinueToPayment} className="space-y-8">
                            <div className="flex flex-col gap-5">
                                {savedAddresses.map(addr => (
                                    <label key={addr.id} className="flex items-center gap-4 cursor-pointer group">
                                        <div className={`w-[22px] h-[22px] rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${addressId === addr.id ? 'border-brand-green' : 'border-brand-muted group-hover:border-white'}`}>
                                            {addressId === addr.id && <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>}
                                        </div>
                                        <span className="text-[16px] font-bold text-white leading-tight">{addr.label}</span>
                                        <input type="radio" className="hidden" name="address" value={addr.id} onChange={(e) => setAddressId(e.target.value)} checked={addressId === addr.id} />
                                    </label>
                                ))}

                                <label className="flex items-center gap-4 cursor-pointer group mt-2">
                                    <div className={`w-[22px] h-[22px] rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-colors ${addressId === 'new' ? 'border-brand-green' : 'border-brand-muted group-hover:border-white'}`}>
                                        {addressId === 'new' && <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>}
                                    </div>
                                    <span className="text-[17px] font-bold text-white">New address</span>
                                    <input type="radio" className="hidden" name="address" value="new" onChange={(e) => setAddressId(e.target.value)} checked={addressId === 'new'} />
                                </label>
                            </div>

                            {/* New Address Form */}
                            <div className={`space-y-5 transition-opacity duration-300 ${addressId === 'new' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                <div>
                                    <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">City</label>
                                    <div className="relative">
                                        <select disabled={addressId !== 'new'} value={city} onChange={e => setCity(e.target.value)} className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px] appearance-none font-medium cursor-pointer">
                                            <option value="Ternopil">Ternopil</option>
                                            <option value="Lviv">Lviv</option>
                                            <option value="Kyiv">Kyiv</option>
                                        </select>
                                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted pointer-events-none" />
                                    </div>
                                </div>

                                {/* Customer Info Capture */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">First Name</label>
                                        <input required disabled={addressId !== 'new'} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px]" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">Last Name</label>
                                        <input required disabled={addressId !== 'new'} type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">Phone Number</label>
                                    <input required disabled={addressId !== 'new'} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px]" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-[2]">
                                        <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">Street</label>
                                        <input disabled={addressId !== 'new'} type="text" placeholder="Enter street name" value={street} onChange={e => setStreet(e.target.value)} className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px] placeholder:text-brand-muted/30" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">House number №</label>
                                        <input disabled={addressId !== 'new'} type="text" placeholder="Enter building number" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px] placeholder:text-brand-muted/30 text-center" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {[{ label: 'Entrance', val: entrance, set: setEntrance }, { label: 'Floor', val: floor, set: setFloor }, { label: 'Flat', val: flat, set: setFlat }, { label: 'Intercom', val: intercom, set: setIntercom }].map((field, idx) => (
                                        <div key={idx}>
                                            <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1 truncate">{field.label}</label>
                                            <input disabled={addressId !== 'new'} type="text" value={field.val} onChange={e => field.set(e.target.value)} className="w-full bg-brand-surface border-none rounded-[14px] px-4 py-[16px] text-white focus:ring-1 focus:ring-brand-white focus:outline-none text-[15px] text-center" />
                                        </div>
                                    ))}
                                </div>

                                {/* Save Address toggle */}
                                <div className="flex items-center gap-3 mt-6 cursor-pointer" onClick={() => addressId === 'new' && setSaveAddress(!saveAddress)}>
                                    <button disabled={addressId !== 'new'} type="button" className={`w-[42px] h-[24px] rounded-full relative smooth-hover transition-colors ${saveAddress ? 'bg-brand-green' : 'bg-brand-surface border border-white/20'}`}>
                                        <div className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${saveAddress ? 'right-[3px]' : 'left-[3px] bg-brand-muted'}`}></div>
                                    </button>
                                    <span className="text-white text-[15px] font-bold">Save address</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="bg-brand-surface/80 hover:bg-brand-surface text-brand-green hover:text-white border border-brand-green/30 w-fit px-8 py-4 rounded-[16px] font-bold smooth-hover transition-colors shadow-lg">
                                    Continue to payment
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* STEP 2: PAYMENT METHOD */
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col gap-[22px]">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'courier' ? 'border-brand-green' : 'border-brand-muted group-hover:border-white'}`}>
                                        {paymentMethod === 'courier' && <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>}
                                    </div>
                                    <span className="text-[17px] font-bold text-white">Card to courier</span>
                                    <input type="radio" className="hidden" value="courier" checked={paymentMethod === 'courier'} onChange={() => setPaymentMethod('courier')} />
                                </label>

                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cash' ? 'border-brand-green' : 'border-brand-muted group-hover:border-white'}`}>
                                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>}
                                    </div>
                                    <span className="text-[17px] font-bold text-white">Cash payment</span>
                                    <input type="radio" className="hidden" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                </label>

                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'bank' ? 'border-brand-green' : 'border-brand-muted group-hover:border-white'}`}>
                                        {paymentMethod === 'bank' && <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>}
                                    </div>
                                    <span className="text-[17px] font-bold text-white">Bank card</span>
                                    <input type="radio" className="hidden" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                                </label>
                            </div>

                            {/* Bank Card Sub-form */}
                            {paymentMethod === 'bank' && (
                                <div className="pl-10 space-y-6 animate-fade-in pt-2">
                                    <div className="flex flex-col gap-5">
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-brand-muted group-hover:border-white"></div>
                                                <div className="leading-tight">
                                                    <p className="text-white text-[15px] font-medium">**** 6344</p>
                                                    <p className="text-brand-muted text-[13px]">Expires 06/24</p>
                                                </div>
                                            </div>
                                            <div className="bg-[#1434CB] px-2.5 py-1 rounded-[4px] text-[10px] font-bold italic text-white leading-none">VISA</div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-[18px] h-[18px] rounded-full border-2 border-brand-muted group-hover:border-white"></div>
                                                <div className="leading-tight">
                                                    <p className="text-white text-[15px] font-medium">**** 3456</p>
                                                    <p className="text-brand-muted text-[13px]">Expires 06/25</p>
                                                </div>
                                            </div>
                                            <div className="flex mt-0.5">
                                                <div className="w-5 h-5 bg-[#EB001B] rounded-full mix-blend-screen relative z-10"></div>
                                                <div className="w-5 h-5 bg-[#F79E1B] rounded-full mix-blend-screen -ml-2.5"></div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Add New Card Toggle */}
                                    <label className="flex items-center gap-3 cursor-pointer group mt-6 pt-1">
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-brand-green flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-brand-green rounded-full"></div>
                                        </div>
                                        <span className="text-white text-[15px] font-bold">Add new card</span>
                                    </label>

                                    {/* Add Card Inputs */}
                                    <div className="space-y-4 pt-1">
                                        <div>
                                            <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">Card number</label>
                                            <input type="text" placeholder="1234 1234 1234 1234" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] placeholder:text-brand-muted/40" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">Expiration date</label>
                                                <input type="text" placeholder="05/26" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] placeholder:text-brand-muted/40" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[13px] font-medium text-brand-muted mb-2 ml-1">CVV</label>
                                                <input type="password" placeholder="***" className="w-full bg-brand-surface border-none rounded-[14px] px-5 py-[16px] text-white focus:ring-1 focus:ring-brand-green focus:outline-none text-[15px] placeholder:text-brand-muted/40" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-8 pb-4 cursor-pointer">
                                            <button type="button" className="w-[42px] h-[24px] bg-brand-green rounded-full relative smooth-hover">
                                                <div className="absolute top-[3px] right-[3px] w-[18px] h-[18px] bg-white rounded-full"></div>
                                            </button>
                                            <span className="text-white text-[15px] font-bold">Save payment method</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - Cart Summary (Panel) */}
            <div className={`w-full xl:w-[480px] shrink-0 bg-brand-surface rounded-[32px] p-8 h-fit border border-white/5 shadow-2xl relative transition-transform duration-300 ${checkoutStep === 2 && window.innerWidth >= 1280 ? '-translate-y-8' : ''}`}>
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-[28px] font-bold text-white">Cart</h2>
                    <span className="text-sm font-bold text-brand-muted tracking-wide">Client #09293</span>
                </div>

                {/* Delivery / Pick-up Switch */}
                <div className="flex bg-[#0B0B0B] rounded-[16px] p-1.5 mb-10 border border-white/5 shadow-inner">
                    <button
                        onClick={() => setDeliveryMode('pick-up')}
                        className={`flex-1 text-center py-3 rounded-[12px] text-[15px] font-bold smooth-hover ${deliveryMode === 'pick-up' ? 'bg-white text-black shadow-md' : 'text-brand-muted hover:text-white'}`}
                    >
                        Pick-up
                    </button>
                    <button
                        onClick={() => setDeliveryMode('delivery')}
                        className={`flex-1 text-center py-3 rounded-[12px] text-[15px] font-bold smooth-hover ${deliveryMode === 'delivery' ? 'bg-white text-black shadow-md' : 'text-brand-muted hover:text-white'}`}
                    >
                        Delivery
                    </button>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-7 mb-10 max-h-[50vh] xl:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(item => (
                        <div key={item.menuItemId} className="flex gap-4 relative items-center">
                            <button onClick={() => removeFromCart(item.menuItemId)} className="absolute right-0 top-1 text-brand-muted/40 hover:text-white smooth-hover text-lg">
                                ×
                            </button>

                            <img src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150' alt={item.productName} className="w-[84px] h-[84px] rounded-full object-cover shrink-0 shadow-xl border border-white/10" />
                            <div className="flex flex-col flex-1 pr-6 pt-1">
                                <h4 className="text-[16px] font-bold text-white leading-tight mb-2 pr-4">{item.productName}</h4>
                                <p className="text-[13px] text-brand-muted leading-[1.3] line-clamp-2 mb-4 lowercase">
                                    baked salmon, arugula, avocado, cucumber (x2), cherry tomatoes...
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center bg-[#0B0B0B] rounded-lg overflow-hidden border border-white/5 py-1 px-1">
                                        <button onClick={() => updateQuantity(item.menuItemId, -1)} className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white smooth-hover rounded">
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 text-center text-[13px] font-bold text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menuItemId, 1)} className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white smooth-hover rounded">
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <span className="text-[19px] font-bold text-white tracking-wide">${item.unitPrice}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-8 border-t border-white/5 border-dashed mb-8">
                    <span className="text-[17px] font-bold text-brand-muted">Total:</span>
                    <span className="text-[17px] font-bold text-brand-green bg-brand-green/10 px-4 py-2 rounded-xl">Calculated at checkout</span>
                </div>

                <button
                    onClick={handleOrderSubmit}
                    disabled={isSubmitting || checkoutStep !== 2}
                    className={`w-full text-white font-bold py-[18px] rounded-[20px] smooth-hover flex items-center justify-center disabled:opacity-50 text-lg shadow-xl transition-all ${checkoutStep === 2 ? 'bg-brand-green hover:brightness-110 shadow-brand-green/20 cursor-pointer active:scale-95' : 'bg-brand-surface border border-white/10 cursor-not-allowed text-brand-muted'}`}
                >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Order'}
                </button>
            </div>
        </div>
    );
};
