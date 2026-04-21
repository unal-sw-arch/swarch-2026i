import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OrderEvent } from '../types';
import { getOrderHistory } from '../services/tracking.service';
import { Loader2, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const TrackingPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState<OrderEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const stages = ['CREATED', 'IN_PREPARATION', 'READY', 'DELIVERED'];
    const displayStages = ['order transfer', 'cooking', 'ready', 'delivery'];

    useEffect(() => {
        let isMounted = true;
        const fetchTracking = async () => {
            try {
                const data = await getOrderHistory(orderId as string);
                if (isMounted) {
                    // Sort descending (newest first)
                    const sorted = data.sort((a, b) =>
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );
                    setEvents(sorted);
                }
            } catch (err) {
                // interceptor maps to global error
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchTracking();
        const intervalId = setInterval(fetchTracking, 5000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-brand-bg relative z-10 w-full ml-[-2rem] pl-[2rem]">
                <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
                <span className="ml-2 text-brand-muted">Connecting to tracker...</span>
            </div>
        );
    }

    // Determine current active stage index
    const latestEvent = events[0] || { eventType: 'ORDER_CREATED' };
    let currentStatus = 'CREATED';
    if (latestEvent.eventType === 'ORDER_STATUS_CHANGED' && (latestEvent.details?.status || latestEvent.payload?.status)) {
        currentStatus = latestEvent.details?.status || latestEvent.payload?.status;
    } else if (latestEvent.eventType === 'ORDER_CANCELLED') {
        currentStatus = 'CANCELLED';
    } else if (!['ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'ORDER_CANCELLED'].includes(latestEvent.eventType)) {
        // Fallback for legacy mock events if any
        currentStatus = latestEvent.eventType === 'IN_PREPARATION' ? 'IN_PREPARATION' : (latestEvent.eventType === 'READY_FOR_DELIVERY' ? 'DELIVERED' : 'CREATED');
    }

    const currentIndex = Math.max(0, stages.indexOf(currentStatus));

    return (
        <div className="absolute inset-0 h-full w-full bg-[#0B0B0B] overflow-hidden flex flex-col items-center justify-center p-6">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-green/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Back button */}
            <button onClick={() => navigate('/menu/1')} className="absolute top-10 left-10 z-20 w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-white/10 smooth-hover">
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Tracker Container */}
            <div className="w-full max-w-[500px] flex flex-col relative z-10 animate-fade-in-up">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Order Tracker</h1>
                    <p className="text-brand-muted text-lg font-medium">Monitoring Order #{orderId}</p>
                </div>

                {/* Tracker Card */}
                <div className="bg-[#141414] rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-brand-green opacity-50"></div>

                    {/* Timeline Stages */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between relative px-2">
                            {/* Track Line */}
                            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-white/5 -z-10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-green transition-all duration-1000 ease-out shadow-[0_0_10px_#22C55E]" style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}></div>
                            </div>

                            {/* Stage Points */}
                            {displayStages.map((stage, idx) => {
                                const isActive = idx === currentIndex;
                                const isPast = idx < currentIndex;
                                const isCompleted = idx === stages.length - 1 && isActive;

                                return (
                                    <div key={stage} className="flex flex-col items-center gap-4 relative bg-[#141414] px-1 group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                            ${isActive ? 'border-brand-green bg-brand-green/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : isPast ? 'border-brand-green bg-brand-green text-white' : 'border-white/10 bg-[#1A1A1A] text-white/30'}
                                        `}>
                                            {isCompleted || isPast ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-brand-green animate-pulse' : 'bg-transparent'}`}></div>
                                            )}
                                        </div>
                                        <span className={`text-[12px] font-bold uppercase tracking-wider absolute -bottom-8 whitespace-nowrap
                                            ${isActive ? 'text-white' : isPast ? 'text-brand-green' : 'text-white/30'}
                                        `}>
                                            {stage}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-white/5 my-8"></div>

                    {/* Activity Log */}
                    <div>
                        <h3 className="text-white font-bold text-[16px] flex items-center gap-2 mb-6">
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_#22C55E]"></span>
                            Live Activity Log
                        </h3>
                        
                        <div className="space-y-0 h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {events.map((ev, i) => (
                                <div key={i} className="flex gap-4 items-stretch group hover:bg-white/[0.02] p-2 -mx-2 rounded-xl transition-colors">
                                    <div className="flex flex-col items-center mt-1">
                                        <div className={`w-3 h-3 rounded-full shadow-md ${i === 0 ? 'bg-brand-green shadow-brand-green/30' : 'bg-white/20 shadow-transparent'}`}></div>
                                        {i !== events.length - 1 && <div className="w-[2px] h-full bg-white/5 my-1 group-hover:bg-white/10 transition-colors"></div>}
                                    </div>
                                    <div className={`flex-1 pb-5 ${i === 0 ? 'opacity-100' : 'opacity-60'}`}>
                                        <div className="flex justify-between items-start">
                                            <p className="text-white font-bold text-[14px] tracking-wide leading-tight">
                                                {ev.eventType.replace(/_/g, ' ')}
                                            </p>
                                            <span className="text-white/40 text-[11px] font-medium whitespace-nowrap ml-2 bg-black/20 px-2 py-0.5 rounded-md">
                                                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        {ev.payload?.status && (
                                            <div className="mt-2.5 inline-flex items-center bg-brand-bg border border-white/5 rounded-lg px-2.5 py-1">
                                                <span className="text-brand-muted text-[10px] uppercase font-bold tracking-widest mr-2">Status:</span>
                                                <span className="text-white text-[11px] font-bold">{ev.payload.status}</span>
                                            </div>
                                        )}
                                        {ev.payload?.details && (
                                            <p className="text-brand-muted mt-2 text-[12px] italic">
                                                {ev.payload.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-50">
                                    <Loader2 className="w-8 h-8 text-brand-muted animate-spin mb-3" />
                                    <p className="text-brand-muted text-[13px] font-medium text-center">Waiting for activity updates...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
