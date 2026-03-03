import React from 'react';
import {
    FileText, ShieldAlert, Zap, Lock, Upload, Eye, Check, X
} from 'lucide-react';

interface DocumentSlot {
    id: string;
    category: 'Reportorial Compliance' | 'Legal & Administrative' | 'OSH Systems' | 'Deficiency Correction' | string;
    label: string;
    fileName: string | null;
    status: 'pending' | 'uploaded';
    lastUpdated: string;
    previewUrl: string | null;
    type: string;
    round: number;
    remarks?: string;
    verdict?: 'pass' | 'fail';
    verdict_r2?: 'pass' | 'fail';
    remarks_r2?: string;
    isCorrection?: boolean;
}

interface DocumentGridProps {
    round: number;
    documents: DocumentSlot[];
    nomineeData: any;
    handleOpenUpload: (id: string) => void;
    handlePreview: (doc: any) => void;
    isReviewMode?: boolean;
    onVerdict?: (slotId: string, verdict: 'pass' | 'fail') => void;
    onRemarkChange?: (slotId: string, remark: string) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
    round,
    documents,
    nomineeData,
    handleOpenUpload,
    handlePreview,
    isReviewMode = false,
    onVerdict,
    onRemarkChange
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
            // Stage 3: Only show dynamic deficiency slots (corrections)
            // We ignore base stage3 requirements as the workflow is deficiency-driven
            return doc.round === 3 && (doc.id.startsWith('r3-deficiency-') || doc.isCorrection);
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
                // Stage 2 evaluation logic
                const effectiveVerdict = round === 2 ? doc.verdict_r2 : doc.verdict;
                const effectiveRemarks = round === 2 ? doc.remarks_r2 : doc.remarks;

                // Stage 1 is locked if Stage 2 is active
                // Stage 2 is locked if Stage 3 is active
                const isLockedInThisRound =
                    (nomineeData?.status === 'completed') ||
                    (round === 1 && nomineeData?.round2Unlocked) ||
                    (round === 2 && nomineeData?.round3Unlocked) ||
                    (round === 3 && (!nomineeData?.round3Unlocked || (doc.status === 'uploaded' && doc.verdict !== 'fail')));

                // Hide verdicts and remarks in Stage 1
                const showVerdicts = round !== 1;

                return (
                    <div key={doc.id} className={`group p-4 border rounded-2xl transition-all ${doc.status === 'uploaded' ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-200 hover:border-gkk-gold/30 hover:shadow-lg hover:-translate-y-0.5'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${doc.status === 'uploaded' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {doc.status === 'uploaded' ? 'SUBMITTED' : 'PENDING'}
                                </span>
                                {showVerdicts && effectiveVerdict === 'fail' && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-red-100 text-red-600 border border-red-200">
                                        INCOMPLETE
                                    </span>
                                )}
                                {showVerdicts && effectiveVerdict === 'pass' && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200">
                                        PASSED
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
                                        Submitted: <span className="text-gkk-navy/60">
                                            {(() => {
                                                const d = new Date(doc.lastUpdated);
                                                return isNaN(d.getTime())
                                                    ? doc.lastUpdated
                                                    : d.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) + ' at ' + d.toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    });
                                            })()}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mb-4 h-[34px]"></div>
                        )}

                        {showVerdicts && effectiveRemarks && !isReviewMode && (
                            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-xl">
                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                                <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{effectiveRemarks}</p>
                            </div>
                        )}

                        {isReviewMode && doc.status === 'uploaded' && (
                            <div className="mb-3 space-y-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onVerdict?.(doc.id, 'pass')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${effectiveVerdict === 'pass' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                    >
                                        <Check size={16} /> PASS
                                    </button>
                                    <button
                                        onClick={() => onVerdict?.(doc.id, 'fail')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${effectiveVerdict === 'fail' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-200 hover:bg-red-50 hover:text-red-600'}`}
                                    >
                                        <X size={16} /> INCOMPLETE
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Add remarks for the nominee..."
                                    value={effectiveRemarks || ''}
                                    onChange={(e) => onRemarkChange?.(doc.id, e.target.value)}
                                    className="w-full p-3 text-[11px] font-medium bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gkk-gold/20 outline-none resize-none min-h-[60px] text-gkk-navy"
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            {!isLockedInThisRound && (
                                <button
                                    onClick={() => handleOpenUpload(doc.id)}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap ${doc.status === 'uploaded' ? 'bg-white text-gkk-navy border border-gray-200 hover:bg-gray-50' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue shadow-md'}`}
                                >
                                    <Upload size={14} />
                                    <span>{doc.status === 'uploaded' ? 'RE-UPLOAD' : (doc.round === 3 && (doc.id.includes('deficiency') || doc.category === 'Deficiency Correction')) ? 'NEW UPLOAD' : 'UPLOAD PDF'}</span>
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
