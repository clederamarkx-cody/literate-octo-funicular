import React from 'react';
import {
    FileText, ShieldAlert, Zap, Lock, Upload, Eye, CheckCircle
} from 'lucide-react';

interface DocumentSlot {
    id: string;
    category: 'Reportorial Compliance' | 'Legal & Administrative' | 'OSH Systems';
    label: string;
    fileName: string | null;
    status: 'pending' | 'uploaded';
    lastUpdated: string;
    previewUrl: string | null;
    type: string;
    round: number;
    remarks?: string;
}

interface DocumentGridProps {
    round: number;
    documents: DocumentSlot[];
    nomineeData: any;
    handleOpenUpload: (id: string) => void;
    handlePreview: (doc: any) => void;
}

const docCategories = [
    { id: 'Reportorial Compliance', name: 'Reportorial Compliance', icon: FileText },
    { id: 'Legal & Administrative', name: 'Legal & Administrative', icon: ShieldAlert },
    { id: 'OSH Systems', name: 'OSH Systems & Programs', icon: Zap }
];

const DocumentGrid: React.FC<DocumentGridProps> = ({
    round,
    documents,
    nomineeData,
    handleOpenUpload,
    handlePreview
}) => {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docCategories.map(cat => {
                const catDocs = documents.filter(d => d.category === cat.id && d.round === round);
                if (catDocs.length === 0) return null;
                return (
                    <div key={`${cat.id}-${round}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
                            <cat.icon size={18} className="text-gkk-navy mr-2" />
                            <h4 className="font-bold text-gkk-navy text-xs uppercase tracking-wider">{cat.name}</h4>
                        </div>
                        <div className="p-4 flex-1 space-y-4">
                            {catDocs.map(doc => (
                                <div key={doc.id} className={`group p-3 border rounded-lg transition-all ${doc.status === 'uploaded' ? 'bg-green-50/30 border-green-100' : 'bg-white border-gray-100 hover:border-gkk-gold/30'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Requirement</span>
                                        {doc.status === 'uploaded' ? (
                                            <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                                <CheckCircle size={10} className="mr-1" /> VERIFIED
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">MANDATORY</span>
                                        )}
                                    </div>
                                    <h5 className="text-sm font-bold text-gkk-navy mb-1">{doc.label}</h5>
                                    {doc.fileName && <p className="text-[11px] text-blue-600 truncate mb-3">{doc.fileName}</p>}

                                    <div className="flex gap-2 mt-3">
                                        {((round === 1 && nomineeData?.round2Unlocked) || (round === 2 && nomineeData?.round3Unlocked)) ? (
                                            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-500 rounded text-xs font-bold cursor-not-allowed border border-gray-200">
                                                <Lock size={12} />
                                                <span>Locked</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenUpload(doc.id)}
                                                className={`flex-1 py-1.5 ${doc.status === 'uploaded' ? 'bg-gkk-gold/20 text-gkk-navy hover:bg-gkk-gold/30' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue'} rounded text-xs font-bold transition-all flex items-center justify-center gap-2`}
                                            >
                                                <Upload size={12} />
                                                <span>{doc.status === 'uploaded' ? 'Re-upload' : 'Upload'}</span>
                                            </button>
                                        )}
                                        {doc.status === 'uploaded' && (
                                            <button onClick={() => handlePreview(doc)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="View Document">
                                                <Eye size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {doc.remarks && (
                                        <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Remarks</p>
                                            <p className="text-[11px] text-gray-600 italic">"{doc.remarks}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentGrid;
