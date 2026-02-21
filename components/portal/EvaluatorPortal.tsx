import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Eye,
  Download,
  Star,
  AlertCircle,
  LogOut,
  Bell,
  Building2,
  ChevronLeft,
  PieChart,
  ClipboardCheck,
  ThumbsUp,
  ThumbsDown,
  X,
  User,
  Save,
  Send,
  Lock,
  Unlock,
  MapPin,
  Briefcase,
  Hash,
  HardHat,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Scale,
  FileCheck,
  FileIcon
} from 'lucide-react';
import { Applicant, ApplicantDocument } from '../../types';

interface EvaluatorPortalProps {
  onLogout: () => void;
  onUnderDev: () => void;
  applicants: Applicant[];
  userRole?: string | null;
  onToggleRound2?: (applicantId: string, unlocked: boolean) => void;
  onToggleRound3?: (applicantId: string, unlocked: boolean) => void;
}

const EvaluatorPortal: React.FC<EvaluatorPortalProps> = ({ onLogout, onUnderDev, applicants: propApplicants, userRole, onToggleRound2, onToggleRound3 }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries'>('dashboard');
  const [view, setView] = useState<'list' | 'review'>('list');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [round2Open, setRound2Open] = useState(false);
  const [docEvaluations, setDocEvaluations] = useState<Record<string, 'pass' | 'fail'>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string, url: string | null, type: string } | null>(null);

  const applicants = propApplicants || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReview = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setView('review');
    setDocEvaluations({});
    setRound2Open(false);
  };

  const handleBackToList = () => {
    setSelectedApplicant(null);
    setView('list');
  };

  const handlePreview = (doc: ApplicantDocument) => {
    setPreviewDoc({ name: doc.name, url: doc.url || null, type: doc.type });
    setPreviewModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const round1Requirements = [
    { category: 'Reportorial Compliance', label: 'WAIR (Work Accident Report)', icon: FileCheck },
    { category: 'Reportorial Compliance', label: 'AEDR (Annual Exposure Data)', icon: FileCheck },
    { category: 'Reportorial Compliance', label: 'AMR (Annual Medical Report)', icon: FileCheck },
    { category: 'Legal & Administrative', label: 'Rule 1020 Registration', icon: Hash },
    { category: 'Legal & Administrative', label: 'FSIC (Fire Safety)', icon: Hash },
    { category: 'OSH Systems', label: 'Signed OSH Policy', icon: ShieldCheck }
  ];

  const round2Requirements = [
    { category: 'Reportorial Compliance', label: 'Minutes of OSH Committee Meeting', icon: FileCheck },
    { category: 'Reportorial Compliance', label: 'OSH Training Records', icon: FileCheck },
    { category: 'Legal & Administrative', label: 'DOLE Clearance / Regional Certification', icon: Hash },
    { category: 'Legal & Administrative', label: 'LGU Business Permit (Current Year)', icon: Hash },
    { category: 'OSH Systems', label: 'HIRAC (Hazard Identification Risk Assessment)', icon: ShieldCheck },
    { category: 'OSH Systems', label: 'Emergency Response Preparedness Plan', icon: ShieldCheck }
  ];

  const round3Requirements = [
    { category: 'OSH Systems', label: 'Innovative OSH Programs (Documentation)', icon: Star },
    { category: 'OSH Systems', label: 'OSH Best Practices (Case Study)', icon: Star },
    { category: 'OSH Systems', label: 'CSR Safety Initiatives', icon: Star },
    { category: 'OSH Systems', label: 'Final Board Presentation (Slide Deck)', icon: FileText }
  ];

  const renderDocumentGrid = (round: number) => {
    if (!selectedApplicant) return null;
    const activeRequirements = round === 1 ? round1Requirements : round === 2 ? round2Requirements : round3Requirements;

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Reportorial Compliance', 'Legal & Administrative', 'OSH Systems'].map(cat => {
          const catReqs = activeRequirements.filter(r => r.category === cat);
          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
                <h4 className="font-bold text-gkk-navy text-[10px] uppercase tracking-[0.2em]">{cat}</h4>
              </div>
              <div className="p-4 flex-1 space-y-4">
                {catReqs.map((req, localIdx) => {
                  // Reconstruct the global index for the slotId to match how ApplicantPortal saves it
                  const globalIdx = activeRequirements.findIndex(r => r.label === req.label);
                  const slotId = `r${round}-${globalIdx}`;
                  const evalKey = `${selectedApplicant.id}-${round}-${req.label}`;
                  const docStatus = docEvaluations[evalKey];
                  const doc = selectedApplicant.documents?.find(d => d.slotId === slotId);
                  return (
                    <div key={localIdx} className={`p-4 border rounded-2xl transition-all ${docStatus === 'pass' ? 'bg-green-50 border-green-200 shadow-inner' : docStatus === 'fail' ? 'bg-red-50 border-red-200 shadow-inner' : doc ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence</span>
                        <div className="flex gap-1">
                          {docStatus === 'pass' && <span className="text-[8px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">PASSED</span>}
                          {docStatus === 'fail' && <span className="text-[8px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">FAILED</span>}
                          {doc ? <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">UPLOADED</span> : <span className="text-[8px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">EMPTY</span>}
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-gkk-navy mb-1 uppercase tracking-tight">{req.label}</h5>
                      {doc && <p className="text-[10px] text-blue-600 truncate mb-4 font-bold tracking-tight">{doc.name}</p>}
                      <div className="mt-4 space-y-2">
                        {doc ? (
                          <>
                            <button onClick={() => handlePreview(doc)} className="w-full py-2 bg-gkk-navy text-white hover:bg-gkk-royalBlue rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"><Eye size={12} /> Verify Record</button>
                            <div className="flex gap-2">
                              <button onClick={() => setDocEvaluations({ ...docEvaluations, [evalKey]: 'pass' })} className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${docStatus === 'pass' ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-gray-400 border-gray-200 hover:text-green-600'}`}>PASS</button>
                              <button onClick={() => setDocEvaluations({ ...docEvaluations, [evalKey]: 'fail' })} className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${docStatus === 'fail' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white text-gray-400 border-gray-200 hover:text-red-600'}`}>FAIL</button>
                            </div>
                          </>
                        ) : <div className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center cursor-not-allowed italic">Awaiting</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">My Nominees</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{applicants.length}</h3></div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ClipboardCheck size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Pending Validation</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{applicants.filter(a => a.status !== 'completed').length}</h3></div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Cycle Verified</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{applicants.filter(a => a.status === 'completed').length}</h3></div>
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle size={28} /></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30"><h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">Assigned Queue</h3><button onClick={() => setActiveTab('entries')} className="text-xs font-bold text-gkk-gold hover:text-gkk-navy uppercase tracking-widest">Full Pipeline</button></div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[500px]">
            {applicants.map(applicant => (
              <div key={applicant.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-5"><div className="w-12 h-12 bg-gkk-navy/5 text-gkk-navy rounded-2xl flex items-center justify-center font-bold border border-gkk-navy/5 group-hover:bg-gkk-navy group-hover:text-white transition-all">{(applicant.name || '?').charAt(0)}</div><div><h4 className="font-bold text-gkk-navy uppercase tracking-tighter text-sm">{applicant.name || 'Unknown'}</h4><p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{applicant.industry || 'Unknown'}</p></div></div>
                <div className="flex items-center gap-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border tracking-widest uppercase ${getStatusColor(applicant.status || 'in_progress')}`}>{(applicant.status || 'in_progress').replace('_', ' ')}</span><button onClick={() => handleReview(applicant)} className="p-3 bg-gray-100 text-gray-400 hover:bg-gkk-navy hover:text-white rounded-2xl transition-all"><ChevronRight size={20} /></button></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gkk-navy rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gkk-gold/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
          <h3 className="font-serif font-bold text-2xl mb-2 text-gkk-gold uppercase tracking-widest">14<sup>th</sup> Cycle</h3>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-12">Regional Board View</p>
          <div className="space-y-6 relative z-10 flex-1">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm shadow-xl"><div className="flex items-center gap-3 mb-4"><div className="p-2 bg-gkk-gold/20 rounded-xl"><Clock size={20} className="text-gkk-gold" /></div><span className="font-bold text-[10px] uppercase tracking-[0.2em]">Validation Deadline</span></div><p className="text-3xl font-serif font-bold">Nov 30, 2024</p></div>
            <div className="p-6 rounded-3xl border border-white/5 bg-white/5"><div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-500/20 rounded-xl"><PieChart size={20} className="text-blue-400" /></div><span className="font-bold text-[10px] uppercase tracking-[0.2em]">Validation Velocity</span></div><div className="w-full bg-black/40 h-2.5 rounded-full mb-3"><div className="bg-gkk-gold h-full rounded-full transition-all duration-1000" style={{ width: '42%' }}></div></div><p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-right">42% Finalized</p></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEntries = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[35px] border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-[450px] group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gkk-gold transition-colors" /><input type="text" placeholder="Filter Nominee Pipeline..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-[25px] focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:bg-white focus:border-gkk-gold transition-all font-bold text-sm tracking-tight" /></div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onUnderDev} className="flex-1 lg:flex-none px-6 py-4 bg-white border border-gray-100 text-gray-400 font-bold rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:text-gkk-navy transition-all"><Filter size={18} className="mr-2" /> Filter</button>
          <button onClick={onUnderDev} className="flex-1 lg:flex-none px-6 py-4 bg-gkk-navy text-white font-bold rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-gkk-royalBlue transition-all"><Download size={18} className="mr-2" /> Export</button>
        </div>
      </div>
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden"><table className="w-full text-left border-collapse"><thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]"><tr className="border-b border-gray-100"><th className="px-8 py-6">Establishment Identity</th><th className="px-8 py-6">Sector</th><th className="px-8 py-6">Artifacts</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-50">{applicants.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(applicant => (<tr key={applicant.id} className="hover:bg-gray-50/50 transition-all group cursor-pointer" onClick={() => handleReview(applicant)}><td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gkk-navy/5 text-gkk-navy rounded-2xl flex items-center justify-center font-bold border border-gkk-navy/5 group-hover:bg-gkk-navy group-hover:text-white transition-all">{(applicant.name || '?').charAt(0)}</div><div><p className="font-bold text-gkk-navy text-sm uppercase tracking-tight leading-none">{applicant.name}</p><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">{applicant.regId}</p></div></div></td><td className="px-8 py-6"><p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{applicant.industry}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{applicant.region}</p></td><td className="px-8 py-6"><div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FileText size={16} className="text-gray-300" /> {applicant.documents?.length || 0} Records</div></td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-bold border tracking-widest uppercase ${getStatusColor(applicant.status || 'in_progress')}`}>{(applicant.status || 'in_progress').replace('_', ' ')}</span></td><td className="px-8 py-6 text-right"><button className="p-3 bg-gray-50 text-gray-400 group-hover:bg-gkk-gold group-hover:text-gkk-navy rounded-2xl transition-all"><ChevronRight size={20} /></button></td></tr>))}</tbody></table></div>
    </div>
  );

  const renderReview = () => {
    if (!selectedApplicant) return null;
    return (
      <div className="animate-in fade-in duration-500 space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[35px] border border-gray-200 shadow-sm sticky top-0 z-30"><div className="flex items-center gap-5"><button onClick={handleBackToList} className="p-3 bg-gray-50 text-gray-500 hover:bg-gkk-navy hover:text-white rounded-2xl transition-all border border-gray-100"><ChevronLeft size={24} /></button><div><h2 className="text-2xl font-serif font-bold text-gkk-navy leading-none uppercase tracking-tight">{selectedApplicant.name}</h2><div className="flex items-center gap-3 mt-3"><span className="bg-gray-100 px-3 py-0.5 rounded-full font-bold text-[9px] text-gray-500 uppercase tracking-widest">ID: {selectedApplicant.regId}</span><span className={`px-3 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusColor(selectedApplicant.status)}`}>{selectedApplicant.status.replace('_', ' ')}</span></div></div></div><div className="flex items-center gap-3 w-full lg:w-auto"><button onClick={onUnderDev} className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-gray-400 font-bold rounded-2xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest"><Save size={18} className="mr-2" /> Draft</button><button onClick={onUnderDev} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-3 bg-gkk-navy text-white font-bold rounded-2xl hover:bg-gkk-royalBlue transition-all text-xs uppercase tracking-widest shadow-xl shadow-gkk-navy/20">Finalize</button></div></div>
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden p-8"><div className="flex flex-col md:flex-row justify-between gap-10 items-start md:items-center"><div className="flex items-center space-x-6"><div className="p-4 bg-gkk-navy/5 rounded-[25px] text-gkk-navy ring-1 ring-gkk-navy/10"><Building2 size={36} /></div><div><h2 className="text-3xl font-serif font-bold text-gkk-navy leading-tight uppercase tracking-tight">{selectedApplicant.name}</h2><p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2"><MapPin size={12} className="text-gkk-gold" /> {selectedApplicant.region}, Philippines</p></div></div><div className="md:w-64 bg-gray-50 rounded-[30px] p-6 text-center border border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Submission Readiness</p><div className="text-4xl font-serif font-bold text-gkk-navy">100%</div><div className="mt-3 px-4 py-1.5 bg-gkk-navy text-white rounded-full text-[9px] font-bold uppercase tracking-widest">Validated Phase 1</div></div></div></div>
        <div className="space-y-8"><div><h3 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Artifact Board</h3><p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest italic opacity-60">Mark artifacts as PASS or FAIL to complete validation.</p></div>
          <div className="space-y-4">{renderDocumentGrid(1)}</div>

          <div className="space-y-4">
            <div className={`rounded-[40px] border transition-all duration-300 overflow-hidden ${(selectedApplicant.round2Unlocked || userRole === 'admin' || userRole === 'scd') ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-8">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${(selectedApplicant.round2Unlocked || userRole === 'admin' || userRole === 'scd') ? 'bg-gkk-gold text-gkk-navy shadow-xl' : 'bg-gray-200 text-gray-400'}`}>{(selectedApplicant.round2Unlocked || userRole === 'admin' || userRole === 'scd') ? <Unlock size={28} /> : <Lock size={28} />}</div>
                  <div className="text-left"><h4 className="font-bold text-gkk-navy text-xl uppercase tracking-tighter leading-none">Phase 2 Verification</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">{selectedApplicant.round2Unlocked ? 'Reviewing national shortlist' : (userRole === 'admin' || userRole === 'scd') ? 'Preview Mode (System Authorized)' : 'Region 1 Review pending'}</p></div>
                </div>
                <button onClick={() => onToggleRound2 && onToggleRound2(selectedApplicant.id, !selectedApplicant.round2Unlocked)} className={`px-10 py-4 rounded-[20px] font-bold transition-all shadow-xl text-[10px] tracking-widest uppercase ${selectedApplicant.round2Unlocked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gkk-gold text-gkk-navy hover:bg-white'}`}>{selectedApplicant.round2Unlocked ? 'Deactivate Round 2' : 'Authorize Round 2'}</button>
              </div>
              {(selectedApplicant.round2Unlocked || userRole === 'admin' || userRole === 'scd') && (
                <div className="border-t border-gray-100">
                  <button onClick={() => setRound2Open(!round2Open)} className="w-full py-5 bg-gray-50/50 hover:bg-gray-100 transition-colors flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">{(round2Open || userRole === 'admin' || userRole === 'scd') ? 'Collapse Records' : 'Review Records'}{(round2Open || userRole === 'admin' || userRole === 'scd') ? <ChevronUp size={16} className="ml-2" /> : <ChevronDown size={16} className="ml-2" />}</button>
                  <div className={`transition-all duration-700 ease-in-out ${(round2Open || userRole === 'admin' || userRole === 'scd') ? 'max-h-[2000px] p-10 bg-white' : 'max-h-0 overflow-hidden'}`}>{renderDocumentGrid(2)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-[40px] border transition-all duration-300 overflow-hidden ${(selectedApplicant.round3Unlocked || userRole === 'admin' || userRole === 'scd') ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center space-x-8">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${(selectedApplicant.round3Unlocked || userRole === 'admin' || userRole === 'scd') ? 'bg-gkk-navy text-white shadow-xl' : 'bg-gray-200 text-gray-400'}`}>{(selectedApplicant.round3Unlocked || userRole === 'admin' || userRole === 'scd') ? <Unlock size={28} /> : <Lock size={28} />}</div>
                  <div className="text-left">
                    <h4 className="font-bold text-gkk-navy text-xl uppercase tracking-tighter leading-none">Stage 3 Verification</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">
                      {selectedApplicant.round3Unlocked ? 'National Board Final Evaluation' : (userRole === 'scd' || userRole === 'admin') ? 'Preview Mode (Master Authority)' : 'Pending Team Leader Approval'}
                    </p>
                  </div>
                </div>

                {(userRole === 'scd' || userRole === 'admin') ? (
                  <button
                    onClick={() => onToggleRound3 && onToggleRound3(selectedApplicant.id, !selectedApplicant.round3Unlocked)}
                    className={`px-10 py-4 rounded-[20px] font-bold transition-all shadow-xl text-[10px] tracking-widest uppercase ${selectedApplicant.round3Unlocked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue'}`}
                  >
                    {selectedApplicant.round3Unlocked ? 'Deactivate Stage 3' : 'Proceed to Stage 3'}
                  </button>
                ) : (
                  <div className="px-6 py-4 bg-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Restricted to SCD Team Leader
                  </div>
                )}
              </div>
              {(selectedApplicant.round3Unlocked || userRole === 'admin' || userRole === 'scd') && (
                <div className="border-t border-gray-100">
                  <div className="p-10 bg-white">
                    {renderDocumentGrid(3)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden page-transition">
      <aside className="w-64 bg-gkk-navy text-white flex flex-col flex-shrink-0 border-r border-white/5">
        <div className="p-6 border-b border-white/5"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-gradient-to-tr from-gkk-gold to-yellow-200 rounded-lg flex items-center justify-center"><span className="text-gkk-navy font-bold text-sm">14<sup>th</sup></span></div><span className="font-serif font-bold tracking-widest text-lg uppercase">
          {userRole === 'admin' ? 'Admin' : userRole === 'scd' ? 'SCD Team' : userRole === 'reu' ? 'REU' : userRole === 'dole' ? 'DOLE' : 'Validator'}
        </span></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab('dashboard'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><LayoutDashboard size={20} /><span className="text-sm font-medium">Dashboard</span></button>
          <button onClick={() => { setActiveTab('entries'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'entries' || view === 'review' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Users size={20} /><span className="text-sm font-medium">Nominee Queue</span></button>
          <div className="pt-6 mt-6 border-t border-white/5"><p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Board Tools</p><button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><Scale size={20} /><span className="text-sm font-medium">Scoring Matrix</span></button><button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><ShieldAlert size={20} /><span className="text-sm font-medium">Audit Logs</span></button></div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20">
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <span>Validator Portal</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-gkk-navy">{activeTab === 'dashboard' ? 'Overview' : 'Queue'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={onUnderDev} className="relative p-2 text-gray-400 hover:text-gkk-navy transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-3 group bg-gray-50 hover:bg-gray-100 p-1 rounded-2xl transition-all pr-4"
              >
                <div className="w-10 h-10 bg-gkk-navy rounded-xl flex items-center justify-center text-white font-bold border-2 border-gkk-gold group-hover:scale-105 transition-transform">
                  JD
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gkk-navy leading-none">Judge J. Doe</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Region IV-A</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in slide-in-from-top-2 duration-300 overflow-hidden ring-4 ring-black/5">
                  <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {userRole === 'admin' ? 'System Admin' : userRole === 'scd' ? 'SCD Team Leader' : userRole === 'reu' ? 'Regional Evaluation Unit' : userRole === 'dole' ? 'DOLE Representative' : 'Evaluator'}
                    </p>
                    <p className="text-sm font-bold text-gkk-navy mt-1 truncate">Current User</p>
                  </div>
                  <div className="px-2 space-y-1">
                    <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
                      <User size={18} className="text-gray-400" />
                      <span className="font-medium">Account Settings</span>
                    </button>
                  </div>
                  <div className="h-px bg-gray-50 my-2 mx-3"></div>
                  <div className="px-2">
                    <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors group">
                      <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="font-bold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth"><div className="max-w-7xl mx-auto">{view === 'list' ? (activeTab === 'dashboard' ? renderDashboard() : renderEntries()) : renderReview()}</div></div>
      </main>
      {previewModalOpen && previewDoc && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-gkk-navy/95 backdrop-blur-md p-4 animate-in fade-in duration-500"><div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"><div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10"><div className="flex items-center space-x-5"><div className="p-3 bg-gkk-navy text-white rounded-2xl shadow-lg"><FileText size={24} /></div><div><h3 className="text-xl font-bold text-gkk-navy uppercase tracking-wider">{previewDoc.name}</h3><p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-widest">Digital Evidence Viewer</p></div></div><button onClick={() => setPreviewModalOpen(false)} className="p-3 text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 rounded-2xl transition-all"><X size={24} /></button></div><div className="flex-1 bg-gray-50 p-10 flex items-center justify-center">{previewDoc.url ? ((previewDoc.type && previewDoc.type.includes('image')) ? <img src={previewDoc.url} alt="Evidence" className="max-w-full max-h-full rounded-3xl shadow-2xl border-8 border-white" /> : <iframe src={previewDoc.url} title="Evidence Reader" className="w-full h-full rounded-3xl shadow-2xl bg-white border-0" />) : <div className="text-center p-20 bg-white rounded-[40px] shadow-2xl max-w-md"><FileIcon size={64} className="text-gray-200 mx-auto mb-8" /><h4 className="text-2xl font-bold text-gkk-navy leading-tight uppercase tracking-widest">Rendering...</h4></div>}</div></div></div>)}
    </div>
  );
};
export default EvaluatorPortal;