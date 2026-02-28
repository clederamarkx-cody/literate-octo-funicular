import React from 'react';
import {
    FileText, ShieldAlert, Zap, Lock, Upload, Eye
} from 'lucide-react';

interface DocumentSlot {
    id: string;
    category: 'Reportorial Compliance' | 'Legal & Administrative' | 'OSH Systems' | string;
    label: string;
    fileName: string | null;
    status: 'pending' | 'uploaded';
    lastUpdated: string;
    previewUrl: string | null;
    type: string;
    round: number;
    remarks?: string;
    verdict?: 'pass' | 'fail';
}

interface DocumentGridProps {
    round: number;
    documents: DocumentSlot[];
    nomineeData: any;
    handleOpenUpload: (id: string) => void;
    handlePreview: (doc: any) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
    round,
    documents,
    nomineeData,
    handleOpenUpload,
    handlePreview
}) => {
    // Filter logic for Document Migration:
    // Stage 1: Show only Stage 1 docs.
    // Stage 2: Show ALL docs from Stage 1 (The Results Bank).
    // Stage 3: Show Stage 3 docs + any Failed Stage 1 or Stage 2 docs (Deficiency Correction).
    const roundDocs = documents.filter(doc => {
        if (round === 1) {
            return doc.round === 1;
        }
        if (round === 2) {
            // Stage 2 is a "Bank" for ALL Stage 1 documents
            return doc.round === 1;
        }
        if (round === 3) {
            // Stage 3 is for Stage 3 requirements + any previous failures
            return doc.round === 3 || (doc.round < 3 && doc.verdict === 'fail');
        }
        return false;
    });

    if (roundDocs.length === 0 && (round === 1 || round === 3)) return null;

    // Special handling for empty Stage 2 Bank
    if (roundDocs.length === 0 && round === 2) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">No documents available from Stage 1.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roundDocs.map(doc => {
                // Determine if this document should be locked in the CURRENT view
                // Stage 1 is locked if Stage 2 is active
                // Stage 2 is ALWAYS read-only/locked
                // Stage 3 is locked if Stage 3 hasn't been triggered
                const isLockedInThisRound =
                    (nomineeData?.status === 'completed') ||
                    (round === 1 && nomineeData?.round2Unlocked) ||
                    (round === 2) ||
                    (round === 3 && !nomineeData?.round3Unlocked);

                // Hide verdicts and remarks in Stage 1
                const showVerdicts = round !== 1;

                return (
                    <div key={doc.id} className={`group p-4 border rounded-2xl transition-all ${doc.status === 'uploaded' ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-200 hover:border-gkk-gold/30 hover:shadow-lg hover:-translate-y-0.5'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${doc.status === 'uploaded' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {doc.status === 'uploaded' ? 'SUBMITTED' : 'PENDING'}
                                </span>
                                {showVerdicts && doc.verdict === 'fail' && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-red-100 text-red-600 animate-pulse border border-red-200">
                                        ACTION REQUIRED
                                    </span>
                                )}
                                {showVerdicts && doc.verdict === 'pass' && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                                        APPROVED
                                    </span>
                                )}
                            </div>
                        </div>
                        <h5 className="text-sm font-bold text-gkk-navy mb-2 leading-relaxed min-h-[3em] line-clamp-2">{doc.label}</h5>

                        {doc.fileName ? (
                            <div className="mb-4 space-y-1.5">
                                <p className="text-xs text-blue-600 truncate font-bold bg-blue-50/50 p-2 rounded-xl border border-blue-100/50 flex items-center gap-2">
                                    <FileText size={14} className="shrink-0" /> {doc.fileName}
                                </p>
                                {doc.lastUpdated && (
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider px-2">
                                        Submitted: <span className="text-gkk-navy/60">{doc.lastUpdated}</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mb-4 h-[34px]"></div>
                        )}

                        {showVerdicts && doc.remarks && (
                            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-xl">
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{doc.remarks}</p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            {!isLockedInThisRound && (
                                <button
                                    onClick={() => handleOpenUpload(doc.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${doc.status === 'uploaded' ? 'bg-white text-gkk-navy border border-gray-200 hover:bg-gray-50' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue shadow-md'}`}
                                >
                                    <Upload size={14} />
                                    <span>{doc.status === 'uploaded' ? 'UPDATE' : 'UPLOAD PDF'}</span>
                                </button>
                            )}
                            {doc.status === 'uploaded' && (
                                <button
                                    onClick={() => handlePreview(doc)}
                                    className={`${!isLockedInThisRound ? 'px-3' : 'flex-1'} py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-200 shadow-sm flex items-center justify-center gap-2`}
                                    title="View Proof"
                                >
                                    <Eye size={16} />
                                    <span className="text-[10px] font-bold">VIEW</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentGrid;
