import React from 'react';
import { Lightbulb, CheckCircle2, Search, RefreshCw, ArrowRight } from 'lucide-react';

const QuickStartGuide: React.FC = () => {
    const steps = [
        {
            icon: <CheckCircle2 className="text-green-500" size={20} />,
            title: "1. Stage 1 (Submission)",
            description: "Begin here by uploading your mandatory OSH and Legal records."
        },
        {
            icon: <Search className="text-blue-500" size={20} />,
            title: "2. Stage 2 (Document Evaluation)",
            description: "Once submitted, the Regional Board will review your files for compliance."
        },
        {
            icon: <RefreshCw className="text-amber-500" size={20} />,
            title: "3. Stage 3 (Submission of Deficiencies)",
            description: "If any item is flagged 'Action Required', upload the corrected version here."
        }
    ];

    return (
        <div className="bg-gradient-to-br from-gkk-navy to-gkk-royalBlue rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            {/* Background Decorative Element */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gkk-gold rounded-xl text-gkk-navy">
                        <Lightbulb size={24} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-wider">How to secure your nomination</h3>
                        <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mt-1">Quick Start Guide for New Nominees</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/15 transition-all group/step cursor-default">
                            <div className="flex items-center gap-3 mb-3">
                                {step.icon}
                                <h4 className="font-bold text-sm text-white group-hover/step:text-gkk-gold transition-colors">{step.title}</h4>
                            </div>
                            <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">Evaluation Protocol: Gawad Kaligtasan at Kalusugan</p>
                    <div className="flex items-center gap-2 text-gkk-gold text-xs font-bold uppercase tracking-widest animate-pulse">
                        Scroll down to begin <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickStartGuide;
