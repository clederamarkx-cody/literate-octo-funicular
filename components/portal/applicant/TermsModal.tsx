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

                <div className="p-10 overflow-y-auto space-y-8 text-sm text-gray-600 leading-relaxed scrollbar-thin flex-1">
                    <p className="font-medium text-base">By uploading documents to this platform, the submitting party — whether an individual, micro-enterprise, industry organization, or government entity — acknowledges and agrees to the following:</p>

                    <div className="space-y-6">
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                            <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Authorization to Upload</h5>
                            <p>The submitting party confirms that they are duly authorized to provide the documents and that such submission is within their rights and responsibilities.</p>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                            <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Nature of Documents</h5>
                            <p>The submitting party understands that uploaded documents may contain sensitive, confidential, or proprietary information belonging to themselves, their organization, or the company.</p>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                            <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Accuracy and Authenticity</h5>
                            <p>The submitting party certifies that all documents submitted are authentic, accurate, and final versions, free from unauthorized alterations or falsifications.</p>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                            <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Company Rights</h5>
                            <p>The company reserves the right to review, verify, and reject any documents that do not meet authenticity, compliance, or security standards.</p>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                            <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Confidential Handling</h5>
                            <p>The company will handle uploaded documents with appropriate safeguards. However, submission implies consent to internal review, processing, and storage in accordance with company policies.</p>
                        </div>
                        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                            <h5 className="font-bold text-red-600 uppercase tracking-widest text-xs mb-2">Liability</h5>
                            <p className="font-medium text-gray-700">The submitting party accepts full responsibility for the content of the documents they upload. The company is not liable for any misrepresentation, falsification, or unauthorized disclosure originating from the submission.</p>
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
                                <strong className="block mb-1">Data Privacy Act Compliance</strong>
                                I consent to the collection, processing, and storage of my organization's data strictly for the purposes of the GKK Awards evaluation in accordance with the Data Privacy Act of 2012.
                            </span>
                        </label>

                        <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <div className="relative flex items-center shrink-0 mt-0.5">
                                <input type="checkbox" checked={agreedAuthority} onChange={(e) => setAgreedAuthority(e.target.checked)} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-gkk-gold checked:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/20 outline-none transition-all cursor-pointer shadow-inner" />
                                <CheckCircle size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gkk-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold scale-50 peer-checked:scale-100 duration-300" />
                            </div>
                            <span className="text-sm font-bold text-gkk-navy leading-tight mt-1 group-hover:text-gkk-gold transition-colors block">
                                <strong className="block mb-1">Authority to Submit</strong>
                                I certify that I am duly authorized by my organization to submit these documents and that all information provided is true, correct, and unaltered.
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
