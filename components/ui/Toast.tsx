import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={24} />,
        error: <AlertCircle className="text-red-500" size={24} />,
        warning: <AlertCircle className="text-amber-500" size={24} />,
        info: <Info className="text-blue-500" size={24} />
    };

    const bgs = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-red-50 border-red-100',
        warning: 'bg-amber-50 border-amber-100',
        info: 'bg-blue-50 border-blue-100'
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`flex items-start gap-4 p-4 rounded-2xl shadow-xl shadow-black/5 border ${bgs[type]} min-w-[300px] max-w-sm`}>
                <div className="shrink-0 font-bold mix-blend-multiply">
                    {icons[type]}
                </div>
                <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-slate-800 leading-tight">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-black/5 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
