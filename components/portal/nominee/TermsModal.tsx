import React from 'react';
import { ShieldAlert, X, CheckCircle, Send } from 'lucide-react';

interface TermsModalProps {
    showTermsModal: boolean;
    setShowTermsModal: (open: boolean) => void;
    agreedDataPrivacy: boolean;
    setAgreedDataPrivacy: (agreed: boolean) => void;
    agreedAuthority: boolean;
    setAgreedAuthority: (agreed: boolean) => void;
    handleConfirmSubmit: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
    showTermsModal,
    setShowTermsModal,
    agreedDataPrivacy,
    setAgreedDataPrivacy,
    agreedAuthority,
    setAgreedAuthority,
    handleConfirmSubmit
}) => {
    if (!showTermsModal) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gkk-navy/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><ShieldAlert size={28} /></div>
                        <h3 className="text-xl font-bold text-gkk-navy font-serif uppercase tracking-wider">Terms and Conditions</h3>
                    </div>
                    <button onClick={() => setShowTermsModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-xl shadow-sm"><X size={24} /></button>
                </div>

                <div className="p-10 overflow-y-auto space-y-8 text-base text-gray-700 leading-relaxed scrollbar-thin flex-1">
                    <div className="space-y-6">
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gkk-navy"></div>
                            <p className="font-medium text-gkk-navy">I am giving my consent to the OSHC to collect, process, retain, store, and dispose our company's data in accordance with the provisions of Republic Act 10173, or the Data Privacy Act of 2012.</p>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gkk-gold"></div>
                            <p>I hereby certify that I am the duly authorized representative of the company and have been granted the express authority to submit the application form and documentary requirements, and provide the required company details on behalf of the establishment and its registered owner/s.</p>
                        </div>

                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gkk-gold"></div>
                            <p>I certify that the information I provided are true and correct to the best of my knowledge and belief, and have been vetted and approved for submission by the company management. I authorize the OSHC and other agencies to investigate the authenticity of all the information provided.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                    <div className="space-y-4">
                        <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="relative flex items-center shrink-0 mt-0.5">
                                <input type="checkbox" checked={agreedDataPrivacy} onChange={(e) => setAgreedDataPrivacy(e.target.checked)} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-gkk-gold checked:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/20 outline-none transition-all cursor-pointer shadow-inner" />
                                <CheckCircle size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gkk-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold scale-50 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className="text-sm font-bold text-gkk-navy leading-tight mt-1 group-hover:text-gkk-gold transition-colors block">
                                <strong className="block mb-1 text-xs uppercase tracking-widest text-gray-500">Data Consent</strong>
                                I consent to the OSHC data processing and retention policy as stated above.
                            </span>
                        </label>

                        <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="relative flex items-center shrink-0 mt-0.5">
                                <input type="checkbox" checked={agreedAuthority} onChange={(e) => setAgreedAuthority(e.target.checked)} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-gkk-gold checked:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/20 outline-none transition-all cursor-pointer shadow-inner" />
                                <CheckCircle size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gkk-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold scale-50 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className="text-sm font-bold text-gkk-navy leading-tight mt-1 group-hover:text-gkk-gold transition-colors block">
                                <strong className="block mb-1 text-xs uppercase tracking-widest text-gray-500">Certification</strong>
                                I certify the authority, correctness, and authenticity of this submission.
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setShowTermsModal(false)} className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 hover:bg-gray-100 rounded-2xl transition-all w-40 text-center">Cancel</button>
                        <button onClick={handleConfirmSubmit} disabled={!agreedDataPrivacy || !agreedAuthority} className="flex-1 px-8 py-4 bg-gradient-to-r from-gkk-navy to-gkk-royalBlue text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                            <Send size={18} /> Confirm Submission
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
