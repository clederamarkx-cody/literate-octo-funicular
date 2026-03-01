import React from 'react';
import { AlertTriangle, CheckCircle, X, Info } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'success' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning'
}) => {
    if (!isOpen) return null;

    const icons = {
        warning: <AlertTriangle size={32} className="text-amber-500" />,
        success: <CheckCircle size={32} className="text-emerald-500" />,
        info: <Info size={32} className="text-blue-500" />
    };

    const bgColors = {
        warning: 'bg-amber-50',
        success: 'bg-emerald-50',
        info: 'bg-blue-50'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gkk-navy/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-[35px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gkk-navy hover:bg-gray-50 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-16 h-16 ${bgColors[type]} rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-8 ring-offset-2 ring-transparent group-hover:ring-amber-50/50 transition-all`}>
                            {icons[type]}
                        </div>

                        <h3 className="text-2xl font-serif font-black text-gkk-navy mb-4 uppercase tracking-tight">
                            {title}
                        </h3>

                        <p className="text-gray-500 font-medium leading-relaxed mb-10">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <button
                                onClick={onClose}
                                className="px-6 py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 hover:text-gkk-navy transition-all uppercase tracking-widest text-[10px] active:scale-95 border border-gray-100"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-6 py-4 ${type === 'warning' ? 'bg-gkk-navy hover:bg-gkk-royalBlue' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[10px] active:scale-95`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
