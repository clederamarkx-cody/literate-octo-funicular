import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface FailedDocumentsAlertProps {
    failedDocs: any[];
}

const FailedDocumentsAlert: React.FC<FailedDocumentsAlertProps> = ({ failedDocs }) => {
    if (failedDocs.length === 0) return null;

    return (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm transition-all text-left">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-500 text-white rounded-xl shadow-md">
                    <ShieldAlert size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-black text-red-500 uppercase tracking-tighter italic leading-none">Action Required: Your attention is needed</h3>
                    <p className="text-[11px] font-bold text-red-800 mt-1 leading-relaxed">
                        Evaluators flagged <span className="underline">{failedDocs.length} items</span> as <span className="font-black">INCOMPLETE</span>. Upload replacements below.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {failedDocs.slice(0, 3).map(doc => (
                            <div key={doc.id} className="bg-white/80 backdrop-blur px-2 py-1 rounded-lg border border-red-100 text-[9px] font-black text-red-500 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {doc.label}
                            </div>
                        ))}
                        {failedDocs.length > 3 && (
                            <div className="bg-white/80 backdrop-blur px-2 py-1 rounded-lg border border-red-100 text-[9px] font-black text-red-500">
                                + {failedDocs.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FailedDocumentsAlert;
