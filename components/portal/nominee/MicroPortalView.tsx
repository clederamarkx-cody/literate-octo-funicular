import React from 'react';
import { Store, MapPin, Briefcase, Users, Hash, HardHat, Unlock, Lock, ChevronUp, ChevronDown, Send, ShieldAlert, FileText, Eye, Upload } from 'lucide-react';
import { Nominee, NomineeDocument } from '../../../types';
import StageProgress from './StageProgress';
import DocumentGrid from './DocumentGrid';

interface MicroPortalViewProps {
    nomineeData: Nominee | null;
    documents: any[];
    stage1Progress: number;
    stage2Progress: number;
    stage3Progress: number;
    handleOpenUpload: (id: string) => void;
    handlePreview: (doc: any) => void;
    handleStageSubmit: (stage: number) => void;
    round2Open: boolean;
    setRound2Open: (open: boolean) => void;
    round3Open: boolean;
    setRound3Open: (open: boolean) => void;
}

const MicroPortalView: React.FC<MicroPortalViewProps> = ({
    nomineeData,
    documents,
    stage1Progress,
    stage2Progress,
    stage3Progress,
    handleOpenUpload,
    handlePreview,
    handleStageSubmit,
    round2Open,
    setRound2Open,
    round3Open,
    setRound3Open
}) => {
    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-2 bg-amber-500 h-full group-hover:w-3 transition-all"></div>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-10">
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center space-x-5">
                                <div className="p-4 bg-amber-50 rounded-3xl text-amber-600 ring-1 ring-amber-100 transition-colors">
                                    <Store size={36} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif font-bold text-gkk-navy leading-tight">{nomineeData?.name || nomineeData?.organizationName}</h2>
                                    <p className="text-gray-500 flex items-center gap-2 mt-2 font-medium"><MapPin size={14} className="text-amber-500" /> {nomineeData?.details?.address}, {nomineeData?.region}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Business Type</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Briefcase size={16} className="text-amber-500" /> {nomineeData?.details?.industry || nomineeData?.industrySector || 'Micro Enterprise'}</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Team Size</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Users size={16} className="text-amber-500" /> {nomineeData?.details?.employees || nomineeData?.workforceSize} Pax</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Registration ID</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy font-mono"><Hash size={16} className="text-amber-500" /> {nomineeData?.regId}</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Safety Contact</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><HardHat size={16} className="text-amber-500" /> {nomineeData?.details?.focalName || nomineeData?.details?.safetyOfficer || 'Owner/Proprietor'}</div></div>
                            </div>
                        </div>
                        <StageProgress
                            stage1Progress={stage1Progress}
                            stage2Progress={stage2Progress}
                            stage3Progress={stage3Progress}
                            nomineeData={nomineeData}
                        />
                    </div>
                </div>
            </div>

            <div id="documents-section" className="space-y-8 pb-20">
                {/* Stage 1 */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Micro Enterprise Requirements (Stage 1)</h3>
                            <p className="text-sm border-l-4 border-amber-500 pl-3 py-1 font-bold italic text-gkk-navy/80 bg-amber-50/50 mt-4">Simplified OSH documentation and essential safety checklists for small businesses.</p>
                        </div>
                        <button onClick={() => handleStageSubmit(1)} disabled={stage1Progress === 0 || !!nomineeData?.round2Unlocked} className="px-8 py-3 bg-amber-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-amber-600/40 hover:-translate-y-1 transition-all disabled:opacity-30 flex items-center gap-2 text-xs uppercase tracking-widest truncate">Submit Stage 1</button>
                    </div>
                    <DocumentGrid round={1} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                </div>

                {/* Stage 2 */}
                <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${nomineeData?.round2Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <button onClick={() => nomineeData?.round2Unlocked && setRound2Open(!round2Open)} disabled={!nomineeData?.round2Unlocked} className={`w-full p-8 flex items-center justify-between group transition-colors ${nomineeData?.round2Unlocked ? 'cursor-pointer hover:bg-amber-50/20' : 'cursor-not-allowed'}`}>
                        <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round2Unlocked ? 'bg-amber-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{nomineeData?.round2Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round2Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>2</div>
                                    <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 2 (Technical Evaluation)</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{nomineeData?.round2Unlocked ? 'Unlocked - Technical Board Review' : 'Locked'}</p>
                            </div>
                        </div>
                        {nomineeData?.round2Unlocked && (
                            <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-amber-600 group-hover:text-white transition-all"><span>{round2Open ? 'Hide' : 'Review'}</span>{round2Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        )}
                    </button>
                    <div className={`transition-all duration-700 ease-in-out ${round2Open ? 'max-h-[9999px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        {/* Failed Stage 1 Documents — Action Required */}
                        {(() => {
                            const failedStage1Docs = documents.filter(d => {
                                if (d.round !== 1) return false;
                                const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === d.id);
                                return persisted?.verdict === 'fail';
                            });
                            if (failedStage1Docs.length === 0) return null;
                            return (
                                <div className="mb-8 rounded-2xl border border-red-100 bg-red-50/60 overflow-hidden">
                                    <div className="flex items-center gap-3 px-6 py-4 bg-red-500 text-white">
                                        <ShieldAlert size={20} className="shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-widest">Action Required — Incomplete Stage 1 Documents</h4>
                                            <p className="text-[10px] font-semibold text-red-100 mt-0.5">The following documents were flagged by the evaluator. Please upload corrected replacements.</p>
                                        </div>
                                        <span className="ml-auto shrink-0 bg-white text-red-500 font-black text-xs px-3 py-1 rounded-full">{failedStage1Docs.length} Item{failedStage1Docs.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {failedStage1Docs.map(doc => {
                                            const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === doc.id);
                                            return (
                                                <div key={doc.id} className="bg-white border border-red-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="text-sm font-bold text-gkk-navy leading-snug">{doc.label}</h5>
                                                        <span className="shrink-0 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase">Incomplete</span>
                                                    </div>

                                                    {doc.fileName && (
                                                        <p className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 truncate">
                                                            <FileText size={12} className="shrink-0" />{doc.fileName}
                                                        </p>
                                                    )}

                                                    {persisted?.remarks && (
                                                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                                                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{persisted.remarks}</p>
                                                        </div>
                                                    )}

                                                    {doc.status === 'uploaded' && (
                                                        <button
                                                            onClick={() => handlePreview(doc)}
                                                            className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                                                        >
                                                            <Eye size={13} /> View Document
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                        <DocumentGrid round={2} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                </div>

                {/* Stage 3 */}
                <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${nomineeData?.round3Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <button onClick={() => nomineeData?.round3Unlocked && setRound3Open(!round3Open)} disabled={!nomineeData?.round3Unlocked} className={`w-full p-8 flex items-center justify-between group transition-colors ${nomineeData?.round3Unlocked ? 'cursor-pointer hover:bg-gold-50/20' : 'cursor-not-allowed'}`}>
                        <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round3Unlocked ? 'bg-gkk-gold text-gkk-navy shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{nomineeData?.round3Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round3Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>3</div>
                                    <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 3 (National Validation)</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{nomineeData?.round3Unlocked ? 'Unlocked - Final Board Deliberation' : 'Locked'}</p>
                            </div>
                        </div>
                        {nomineeData?.round3Unlocked && (
                            <div className="flex items-center space-x-3 text-gkk-gold bg-gold-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-gkk-gold group-hover:text-gkk-navy transition-all"><span>{round3Open ? 'Hide' : 'Review'}</span>{round3Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        )}
                    </button>
                    <div className={`transition-all duration-700 ease-in-out ${round3Open && nomineeData?.round3Unlocked ? 'max-h-[9999px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        {/* Stage 3 — Stage 1 Incomplete Documents */}
                        {(() => {
                            const failedStage1Docs = documents.filter(d => {
                                if (d.round !== 1) return false;
                                const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === d.id);
                                return persisted?.verdict === 'fail';
                            });
                            if (failedStage1Docs.length === 0) return null;
                            return (
                                <div className="mb-8 rounded-2xl border border-red-100 bg-red-50/60 overflow-hidden">
                                    <div className="flex items-center gap-3 px-6 py-4 bg-red-500 text-white">
                                        <ShieldAlert size={20} className="shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-widest">Action Required — Incomplete Stage 1 Documents</h4>
                                            <p className="text-[10px] font-semibold text-red-100 mt-0.5">The following documents were flagged by the evaluator. Please upload corrected replacements for these incomplete items.</p>
                                        </div>
                                        <span className="ml-auto shrink-0 bg-white text-red-500 font-black text-xs px-3 py-1 rounded-full">{failedStage1Docs.length} Item{failedStage1Docs.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {failedStage1Docs.map(doc => {
                                            const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === d.id);
                                            return (
                                                <div key={doc.id} className="bg-white border border-red-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="text-sm font-bold text-gkk-navy leading-snug">{doc.label}</h5>
                                                        <span className="shrink-0 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase">Incomplete</span>
                                                    </div>

                                                    {doc.fileName && (
                                                        <p className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 truncate">
                                                            <FileText size={12} className="shrink-0" />{doc.fileName}
                                                        </p>
                                                    )}

                                                    {persisted?.remarks && (
                                                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                                                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{persisted.remarks}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-auto">
                                                        {doc.status === 'uploaded' && (
                                                            <button
                                                                onClick={() => handlePreview(doc)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all shadow-sm whitespace-nowrap"
                                                            >
                                                                <Eye size={13} /> View
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenUpload(doc.id)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md whitespace-nowrap"
                                                        >
                                                            <Upload size={13} /> Re-upload
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Stage 3 Failed Stage 2 Documents — Action Required */}
                        {(() => {
                            const failedStage2Docs = documents.filter(d => {
                                if (d.round !== 2) return false;
                                const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === d.id);
                                return persisted?.verdict === 'fail';
                            });
                            if (failedStage2Docs.length === 0) return null;
                            return (
                                <div className="mb-8 rounded-2xl border border-red-100 bg-red-50/60 overflow-hidden">
                                    <div className="flex items-center gap-3 px-6 py-4 bg-red-500 text-white">
                                        <ShieldAlert size={20} className="shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-sm uppercase tracking-widest">Action Required — Incomplete Stage 2 Documents</h4>
                                            <p className="text-[10px] font-semibold text-red-100 mt-0.5">The following documents were flagged by the evaluator. Please upload corrected replacements.</p>
                                        </div>
                                        <span className="ml-auto shrink-0 bg-white text-red-500 font-black text-xs px-3 py-1 rounded-full">{failedStage2Docs.length} Item{failedStage2Docs.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {failedStage2Docs.map(doc => {
                                            const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === doc.id);
                                            return (
                                                <div key={doc.id} className="bg-white border border-red-100 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="text-sm font-bold text-gkk-navy leading-snug">{doc.label}</h5>
                                                        <span className="shrink-0 text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase">Incomplete</span>
                                                    </div>

                                                    {doc.fileName && (
                                                        <p className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 truncate">
                                                            <FileText size={12} className="shrink-0" />{doc.fileName}
                                                        </p>
                                                    )}

                                                    {persisted?.remarks && (
                                                        <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-1">Evaluator Remarks</span>
                                                            <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">{persisted.remarks}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-auto">
                                                        {doc.status === 'uploaded' && (
                                                            <button
                                                                onClick={() => handlePreview(doc)}
                                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all shadow-sm whitespace-nowrap"
                                                            >
                                                                <Eye size={13} /> View
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleOpenUpload(doc.id)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md whitespace-nowrap"
                                                        >
                                                            <Upload size={13} /> Re-upload
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="flex justify-end mb-6">
                            <button onClick={() => handleStageSubmit(3)} disabled={stage3Progress === 0} className="px-8 py-3 bg-amber-600 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-30 text-xs uppercase tracking-widest flex items-center gap-2"><Send size={16} /> Submit Deficiencies</button>
                        </div>
                        <DocumentGrid round={3} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MicroPortalView;
