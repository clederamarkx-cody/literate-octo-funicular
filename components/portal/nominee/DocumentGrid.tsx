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
    // Keep track of which categories are expanded. By default, maybe expand the first one that has documents.
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    return (
        <div className="space-y-4">
            {docCategories.map(cat => {
                const catDocs = documents.filter(d => (d.category === cat.id || d.category === cat.name) && d.round === round);
                if (catDocs.length === 0) return null;

                const isOpen = openCategories[cat.id];
                const completedCount = catDocs.filter(d => d.status === 'uploaded').length;
                const isAllCompleted = completedCount === catDocs.length;

                return (
                    <div key={`${cat.id}-${round}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all duration-300">
                        <button
                            onClick={() => toggleCategory(cat.id)}
                            className="w-full p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center">
                                <cat.icon size={18} className="text-gkk-navy mr-3" />
                                <h4 className="font-bold text-gkk-navy text-sm uppercase tracking-wider">{cat.name}</h4>
                                <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${isAllCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {completedCount} / {catDocs.length}
                                </span>
                            </div>
                            <div className="text-gkk-navy">
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white">
                                {catDocs.map(doc => (
                                    <div key={doc.id} className={`group p-4 border rounded-xl transition-all ${doc.status === 'uploaded' ? 'bg-green-50/30 border-green-100 shadow-sm' : 'bg-white border-gray-200 hover:border-gkk-gold/50 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requirement</span>
                                            {doc.status === 'uploaded' ? (
                                                <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                                    <CheckCircle size={10} className="mr-1" /> VERIFIED
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">MANDATORY</span>
                                            )}
                                        </div>
                                        <h5 className="text-sm font-bold text-gkk-navy mb-2 leading-tight">{doc.label}</h5>
                                        {doc.fileName && <p className="text-[11px] text-blue-600 truncate mb-4 font-medium">{doc.fileName}</p>}

                                        <div className="flex gap-2 mt-4">
                                            {((round === 1 && nomineeData?.round2Unlocked) || (round === 2 && nomineeData?.round3Unlocked)) ? (
                                                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold cursor-not-allowed border border-gray-200">
                                                    <Lock size={12} />
                                                    <span>Locked</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenUpload(doc.id)}
                                                    className={`flex-1 py-2 ${doc.status === 'uploaded' ? 'bg-gkk-gold/10 text-gkk-navy hover:bg-gkk-gold/20 border border-gkk-gold/20' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue shadow-md hover:shadow-lg'} rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2`}
                                                >
                                                    <Upload size={14} />
                                                    <span>{doc.status === 'uploaded' ? 'Replace' : 'Upload PDF'}</span>
                                                </button>
                                            )}
                                            {doc.status === 'uploaded' && (
                                                <button onClick={() => handlePreview(doc)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100" title="View Document">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </div>
                                        {doc.remarks && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Remarks</p>
                                                <p className="text-xs text-gray-600 italic">"{doc.remarks}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentGrid;
