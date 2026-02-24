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
    // Default all categories to open for better visibility of the 35+ items
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        docCategories.forEach(cat => {
            initialState[cat.id] = true;
        });
        return initialState;
    });

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
                    <div key={`${cat.id}-${round}`} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col mb-4 overflow-hidden transition-all duration-300">
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

                        <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/10">
                                {catDocs.map(doc => (
                                    <div key={doc.id} className={`group p-3 border rounded-2xl transition-all ${doc.status === 'uploaded' ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-100 hover:border-gkk-gold/30 hover:shadow-md'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded ${doc.status === 'uploaded' ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-600'}`}>
                                                {doc.status === 'uploaded' ? 'Complete' : 'Required'}
                                            </span>
                                        </div>
                                        <h5 className="text-[11px] font-bold text-gkk-navy mb-1 leading-snug min-h-[2.5em] line-clamp-2">{doc.label}</h5>

                                        {doc.fileName ? (
                                            <p className="text-[9px] text-blue-600 truncate mb-3 font-medium bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/30 flex items-center gap-1">
                                                <FileText size={10} /> {doc.fileName}
                                            </p>
                                        ) : (
                                            <div className="mb-3 h-[26px]"></div> /* Spacer */
                                        )}

                                        <div className="flex gap-1.5 pt-2 border-t border-gray-50">
                                            {((round === 1 && nomineeData?.round2Unlocked) || (round === 2 && nomineeData?.round3Unlocked)) ? (
                                                <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-bold border border-gray-100">
                                                    <Lock size={10} /> <span>Locked</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenUpload(doc.id)}
                                                    className={`flex-1 py-1.5 rounded-xl text-[9px] font-bold transition-all flex items-center justify-center gap-1.5 ${doc.status === 'uploaded' ? 'bg-white text-gkk-navy border border-gray-100 hover:bg-gray-50' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue shadow-sm'}`}
                                                >
                                                    <Upload size={12} />
                                                    <span>{doc.status === 'uploaded' ? 'Update' : 'Upload PDF'}</span>
                                                </button>
                                            )}
                                            {doc.status === 'uploaded' && (
                                                <button onClick={() => handlePreview(doc)} className="px-2 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100" title="View Document">
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                        </div>
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
