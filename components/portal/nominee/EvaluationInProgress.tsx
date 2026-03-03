import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

const EvaluationInProgress: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center bg-gradient-to-br from-blue-50/50 via-white to-gkk-gold/5 rounded-[40px] border border-gray-100 shadow-inner relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gkk-navy/5 rounded-full blur-[80px] group-hover:bg-gkk-gold/10 transition-colors duration-1000"></div>

            <div className="relative space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Dynamic Icon Stack */}
                <div className="relative mx-auto w-24 h-24">
                    {/* Pulsing Outer Shield */}
                    <div className="absolute inset-0 bg-blue-100/50 rounded-full animate-ping opacity-20"></div>

                    {/* Rotating Border */}
                    <div className="absolute -inset-2">
                        <Loader2
                            size={112}
                            className="text-gkk-navy/10 animate-[spin_8s_linear_infinite]"
                            strokeWidth={1}
                        />
                    </div>

                    {/* Main Icon Card */}
                    <div className="absolute inset-0 bg-white rounded-[28px] shadow-2xl flex items-center justify-center border border-gray-100 ring-4 ring-black/5 rotate-in-view">
                        <ShieldCheck size={48} className="text-gkk-navy animate-pulse" />
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                    <h5 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">
                        Evaluation in Progress
                    </h5>

                    <div className="h-1 w-20 bg-gkk-gold mx-auto rounded-full group-hover:w-32 transition-all duration-700"></div>

                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        The Regional Evaluation Unit is currently conducting a thorough review
                        of your submissions.
                    </p>

                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] bg-white/50 backdrop-blur-sm py-2 px-4 rounded-full border border-gray-100 inline-block shadow-sm">
                        Anticipated Update: Stage 3
                    </p>
                </div>

                {/* Visual Accent */}
                <div className="flex justify-center gap-1.5">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full bg-gkk-navy/20 animate-bounce`}
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EvaluationInProgress;
