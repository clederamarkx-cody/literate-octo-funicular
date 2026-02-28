import React from 'react';
import { Building2, MapPin, Briefcase, Users, Hash, HardHat, Unlock, Lock, ChevronUp, ChevronDown, Send, ShieldAlert, FileText, Eye, Upload } from 'lucide-react';
import { Nominee, NomineeDocument } from '../../../types';
import StageProgress from './StageProgress';
import DocumentGrid from './DocumentGrid';
import FailedDocumentsAlert from './FailedDocumentsAlert';

interface PrivateSectorPortalViewProps {
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
    failedDocs: any[];
    stage1Open: boolean;
    setStage1Open: (open: boolean) => void;
    stage2Open: boolean;
    setStage2Open: (open: boolean) => void;
}

const PrivateSectorPortalView: React.FC<PrivateSectorPortalViewProps> = ({
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
    setRound3Open,
    failedDocs,
    stage1Open,
    setStage1Open,
    stage2Open,
    setStage2Open
}) => {
    return (
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-2 bg-gkk-navy h-full group-hover:w-3 transition-all"></div>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-10">
                        <div className="flex-1 space-y-8">
                            <div className="flex items-center space-x-5">
                                <div className="p-4 bg-gkk-navy/5 rounded-3xl text-gkk-navy ring-1 ring-gkk-navy/10 transition-colors">
                                    <Building2 size={36} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif font-bold text-gkk-navy leading-tight">{nomineeData?.name || nomineeData?.organizationName}</h2>
                                    <p className="text-gray-500 flex items-center gap-2 mt-2 font-medium"><MapPin size={14} className="text-gkk-gold" /> {nomineeData?.details?.address}, {nomineeData?.region}</p>
                                </div>
                            </div>

                            {!!nomineeData?.round3Unlocked && nomineeData?.status !== 'completed' && failedDocs.length > 0 && (
                                <div className="animate-in slide-in-from-top-4 duration-500">
                                    <FailedDocumentsAlert failedDocs={failedDocs} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Industry Sector</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Briefcase size={16} className="text-gkk-gold" /> {nomineeData?.details?.industry || nomineeData?.industrySector}</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Workforce Size</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Users size={16} className="text-gkk-gold" /> {nomineeData?.details?.employees || nomineeData?.workforceSize} Pax</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Nomination ID</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy font-mono"><Hash size={16} className="text-gkk-gold" /> {nomineeData?.regId}</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Safety Focal</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><HardHat size={16} className="text-gkk-gold" /> {nomineeData?.details?.safetyOfficer}</div></div>
                                <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Application Status</span><div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${nomineeData?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gkk-gold/10 text-gkk-gold'}`}>{nomineeData?.status?.replace('_', ' ') || 'Pending'}</div></div>
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
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-500">
                    <div
                        className="p-8 flex flex-col md:flex-row justify-between items-start gap-4 cursor-pointer header-glass-hover"
                        onClick={() => setStage1Open(!stage1Open)}
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Private Sector Requirements - Stage 1 (Submission)</h3>
                                <div className={`transition-transform duration-300 ${stage1Open ? 'rotate-180' : 'rotate-0'}`}>
                                    <ChevronDown size={24} className="text-gray-400" />
                                </div>
                            </div>
                            <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy/80 bg-gold-50/50 mt-4">Corporate safety protocols and regulatory compliance documentation.</p>
                        </div>
                        {nomineeData?.status !== 'completed' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStageSubmit(1);
                                }}
                                disabled={stage1Progress === 0 || !!nomineeData?.round2Unlocked}
                                className="px-8 py-3 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl hover:shadow-gkk-navy/40 hover:-translate-y-1 transition-all disabled:opacity-30 flex items-center gap-2 text-xs uppercase tracking-widest truncate"
                            >
                                Submit Stage 1
                            </button>
                        )}
                    </div>
                    <div className={`collapse-transition overflow-hidden ${stage1Open ? 'max-h-[5000px] opacity-100 px-8 pb-8' : 'max-h-0 opacity-0 px-8 pb-0'}`}>
                        <DocumentGrid round={1} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                </div>

                {/* Stage 2 */}
                <div className={`rounded-3xl border transition-all duration-500 overflow-hidden ${nomineeData?.round2Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div
                        className={`w-full p-8 flex items-center justify-between border-b border-gray-100 ${nomineeData?.round2Unlocked ? 'cursor-pointer header-glass-hover' : ''}`}
                        onClick={() => nomineeData?.round2Unlocked && setStage2Open(!stage2Open)}
                    >
                        <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round2Unlocked ? 'bg-gkk-navy text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{nomineeData?.round2Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round2Unlocked ? 'bg-gkk-gold text-gkk-navy' : 'bg-gray-300 text-white'}`}>2</div>
                                    <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 2 (Document Evaluation)</h4>
                                    {!!nomineeData?.round2Unlocked && (
                                        <div className={`transition-transform duration-300 ${stage2Open ? 'rotate-180' : 'rotate-0'}`}>
                                            <ChevronDown size={20} className="text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">
                                    {nomineeData?.round2Unlocked
                                        ? 'Review Area: Current Evaluation Findings from the Regional Board'
                                        : 'Locked - Monitoring current submission status'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Stage 2 Contents - Only visible if round2Unlocked is true */}
                    <div className={`collapse-transition overflow-hidden ${!!nomineeData?.round2Unlocked && stage2Open ? 'max-h-[5000px] opacity-100 p-8' : 'max-h-0 opacity-0 px-8 pb-0'}`}>
                        <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><ShieldAlert size={18} /></div>
                            <div>
                                <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">Evaluation Logic</h5>
                                <p className="text-xs text-blue-800 font-medium leading-relaxed">This section displays documents from Stage 1 that require attention. Use this for reference; corrections must be uploaded in <span className="font-bold">Stage 3</span> once triggered.</p>
                            </div>
                        </div>
                        <DocumentGrid round={2} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                </div>

                {/* Stage 3 */}
                <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${nomineeData?.round3Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <div className={`w-full p-8 flex items-center justify-between border-b border-gray-100`}>
                        <div className="flex items-center space-x-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round3Unlocked ? 'bg-gkk-gold text-gkk-navy shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{nomineeData?.round3Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round3Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>3</div>
                                    <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 3 (Submission of Deficiencies)</h4>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{nomineeData?.round3Unlocked ? 'Correction Window: Resolve flagged incomplete items' : 'Locked'}</p>
                            </div>
                        </div>
                    </div>
                    {/* Stage 3 Contents - Only visible if round3Unlocked is true */}
                    {!!nomineeData?.round3Unlocked && (
                        <div className="p-8 bg-white">
                            {nomineeData?.status !== 'completed' && (
                                <div className="flex justify-end mb-6">
                                    <button
                                        onClick={() => handleStageSubmit(3)}
                                        disabled={stage3Progress < 100}
                                        className="px-8 py-3 bg-gradient-to-r from-gkk-gold to-yellow-500 text-gkk-navy font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-30 text-xs uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Send size={16} /> Submit Deficiencies
                                    </button>
                                </div>
                            )}
                            <DocumentGrid round={3} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivateSectorPortalView;
