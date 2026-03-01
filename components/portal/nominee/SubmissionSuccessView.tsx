import React from 'react';
import { CheckCircle, Clock, ArrowRight, FileText, ShieldCheck } from 'lucide-react';

interface SubmissionSuccessViewProps {
    onViewRecords: () => void;
    companyName?: string;
}

const SubmissionSuccessView: React.FC<SubmissionSuccessViewProps> = ({ onViewRecords, companyName }) => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-700 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gkk-gold via-yellow-400 to-gkk-gold"></div>

                <div className="p-10 md:p-16 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-green-50/50 animate-bounce">
                        <CheckCircle size={48} />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-serif font-black text-gkk-navy leading-tight mb-4 uppercase tracking-tight">
                        Submission Received
                    </h2>

                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-8">
                        Technical Verification Phase: 14th GKK Cycle
                    </p>

                    <div className="w-full bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100 space-y-6 text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gkk-gold/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="flex items-start gap-4 transition-all hover:translate-x-1">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0"><Clock size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gkk-navy text-sm uppercase tracking-wide">Under National Review</h4>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Your corrections have been transmitted to the Regional Extension Unit (REU) and the SCD National Board. Estimated final validation: 5-7 working days.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 transition-all hover:translate-x-1">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0"><ShieldCheck size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gkk-navy text-sm uppercase tracking-wide">Next Steps</h4>
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Once evaluation is complete, you will receive a notification regarding your qualification for the next phase of the GKK Awards.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <button
                            onClick={onViewRecords}
                            className="px-10 py-5 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue transition-all uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95"
                        >
                            <FileText size={18} /> View Submitted Records
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 font-bold rounded-2xl hover:border-gkk-gold hover:text-gkk-navy transition-all uppercase tracking-widest text-xs active:scale-95"
                        >
                            Refresh Status
                        </button>
                    </div>

                    <p className="mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em]">
                        Safety is our Priority • {companyName || "Organization Verified"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubmissionSuccessView;
