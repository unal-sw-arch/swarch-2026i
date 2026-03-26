import { useEffect, useState } from 'react';
import type { ErrorResponse } from '../types';
import { XCircle, X } from 'lucide-react';

export const GlobalErrorHandler = () => {
    const [error, setError] = useState<ErrorResponse | null>(null);

    useEffect(() => {
        const handleApiError = (event: Event) => {
            const customEvent = event as CustomEvent<ErrorResponse>;
            setError(customEvent.detail);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                setError(null);
            }, 5000);
        };

        window.addEventListener('api-error', handleApiError);
        return () => {
            window.removeEventListener('api-error', handleApiError);
        };
    }, []);

    if (!error) return null;

    // WA-TEC-05: Visual error management based on {code, message} contract, but in Premium Dark Theme
    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in-up">
            <div className="flex items-start bg-[#1A1A1A] border border-red-500/30 p-5 shadow-2xl rounded-2xl max-w-sm w-full">
                <div className="flex-shrink-0 bg-red-500/10 p-2 rounded-full">
                    <XCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-4 flex-1 pt-1">
                    <h3 className="text-[15px] font-bold text-white tracking-wide">{error.code}</h3>
                    <div className="mt-1 text-[14px] font-medium text-brand-muted">
                        <p>{error.message}</p>
                    </div>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5 pt-1">
                        <button
                            type="button"
                            className="inline-flex rounded-xl p-2 text-brand-muted hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
                            onClick={() => setError(null)}
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
