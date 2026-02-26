import React, { useState } from 'react';
import {
    FileText, ShieldAlert, Zap, Lock, Upload, Eye, CheckCircle, ChevronDown, ChevronUp
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

const docCategories = [
    { id: 'Compliance', name: 'Compliance Reports', icon: FileText },
    { id: 'Legal', name: 'Legal Documents', icon: ShieldAlert },
    { id: 'Systems', name: 'OSH Systems & Programs', icon: Zap },
    { id: 'Training', name: 'Training & Orientations', icon: FileText },
    { id: 'Designation', name: 'Personnel Designation', icon: FileText },
    { id: 'Safety', name: 'Safety Certificates', icon: ShieldAlert },
    { id: 'Health', name: 'Health & Medical', icon: Zap },
    { id: 'Construction', name: 'Construction Specific', icon: ShieldAlert },
    { id: 'Excellence', name: 'Excellence Programs', icon: Zap },
    { id: 'Management', name: 'Management & Budget', icon: FileText },
    { id: 'Other', name: 'Other Documents', icon: FileText },
    { id: 'General', name: 'General Requirements', icon: FileText }
];

const DocumentGrid: React.FC<DocumentGridProps> = ({
    round,
    documents,
    nomineeData,
    handleOpenUpload,
    handlePreview
}) => {
    // Filter documents for the current round
    const roundDocs = documents.filter(d => d.round === round);

    if (roundDocs.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roundDocs.map(doc => (
                <div key={doc.id} className={`group p-4 border rounded-2xl transition-all ${doc.status === 'uploaded' ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-200 hover:border-gkk-gold/30 hover:shadow-lg hover:-translate-y-0.5'}`}>
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${doc.status === 'uploaded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.status === 'uploaded' ? 'Complete' : 'Required'}
                            </span>
                            {doc.verdict === 'fail' && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-600 animate-pulse border border-red-200">
                                    INCOMPLETE
                                </span>
                            )}
                            {doc.verdict === 'pass' && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 border border-emerald-200">
                                    VERIFIED
                                </span>
                            )}
                        </div>
                    </div>
                    <h5 className="text-sm font-bold text-gkk-navy mb-2 leading-relaxed min-h-[3em] line-clamp-2">{doc.label}</h5>

                    {doc.fileName ? (
                        <p className="text-xs text-blue-600 truncate mb-4 font-bold bg-blue-50/50 p-2 rounded-xl border border-blue-100/50 flex items-center gap-2">
                            <FileText size={14} className="shrink-0" /> {doc.fileName}
                        </p>
                    ) : (
                        <div className="mb-4 h-[34px]"></div> /* Consistent Spacer */
                    )}

                    {doc.remarks && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-xl">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{doc.remarks}</p>
                        </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                        {round === 2 ? (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600/60 rounded-xl text-[10px] font-bold border border-blue-100">
                                <Lock size={12} /> <span>READ ONLY</span>
                            </div>
                        ) : (!doc.verdict || doc.verdict !== 'fail') && ((round === 1 && nomineeData?.round2Unlocked) || (round === 2 && nomineeData?.round3Unlocked)) ? (
                            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-bold border border-gray-200">
                                <Lock size={12} /> <span>LOCKED</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleOpenUpload(doc.id)}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${doc.status === 'uploaded' ? 'bg-white text-gkk-navy border border-gray-200 hover:bg-gray-50' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue shadow-md'}`}
                            >
                                <Upload size={14} />
                                <span>{doc.status === 'uploaded' ? 'UPDATE' : 'UPLOAD PDF'}</span>
                            </button>
                        )}
                        {doc.status === 'uploaded' && (
                            <button
                                onClick={() => handlePreview(doc)}
                                className="px-3 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-200 shadow-sm flex items-center justify-center gap-2"
                                title="View Proof"
                            >
                                <Eye size={16} />
                                <span className="text-[10px] font-bold hidden sm:inline">VIEW</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentGrid;
