import { useEffect, useState } from 'react';
import { Bike } from 'lucide-react';

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Show splash for 2.5 seconds, then fade out
        const timer1 = setTimeout(() => {
            setIsFadingOut(true);
        }, 2500);

        // Notify parent to unmount after fade transition (500ms)
        const timer2 = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] bg-[#0B0B0B] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="flex flex-col items-center animate-fade-in-up">
                <div className="relative mb-6">
                    {/* Pulsing glow effect behind bike */}
                    <div className="absolute inset-0 bg-brand-orange rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center border-4 border-brand-orange relative z-10 shadow-2xl overflow-hidden">
                        {/* Bike rides across inside the circle */}
                        <Bike className="w-12 h-12 text-brand-orange animate-bounce" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase flex items-center">
                    DELI<span className="text-brand-orange tracking-tighter">UNAL</span>
                </h1>
                <p className="text-brand-muted mt-4 font-medium tracking-widest text-sm uppercase">Premium Delivery</p>
            </div>
        </div>
    );
};
