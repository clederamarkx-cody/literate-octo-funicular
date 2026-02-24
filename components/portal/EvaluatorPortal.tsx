import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FileIcon,
  KeyRound,
  Zap,
  Upload
} from 'lucide-react';
import { Nominee, NomineeDocument, UserRole, AccessKey } from '../../types';
import { STAGE_1_REQUIREMENTS } from './NomineePortal';
import { getAllNominees, resolveFileUrl, updateDocumentEvaluation, getRequirementsByCategory, issueAccessKey, getAllAccessKeys } from '../../services/dbService';
import { PH_REGIONS } from '../../constants';

interface EvaluatorPortalProps {
  onLogout: () => void;
  onUnderDev: () => void;
  nomineesData: Nominee[];
  userRole?: string | null;
  onToggleRound2?: (nomineeId: string, unlocked: boolean) => void;
  onToggleRound3?: (nomineeId: string, unlocked: boolean) => void;
}

const EvaluatorPortal: React.FC<EvaluatorPortalProps> = ({ onLogout, onUnderDev, nomineesData: propNominees, userRole, onToggleRound2, onToggleRound3 }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'management'>('dashboard');
  const [view, setView] = useState<'list' | 'review'>('list');
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localNominees, setLocalNominees] = useState<Nominee[]>(propNominees);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const data = await getAllNominees();
        setLocalNominees(data);
      } catch (error) {
        console.error("Failed to load nominees", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNominees();
  }, []);
  const [round2Open, setRound2Open] = useState(false);
  const [docEvaluations, setDocEvaluations] = useState<Record<string, 'pass' | 'fail'>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string, url: string | null, type: string } | null>(null);
  const [isExporting, setIsExporting] = useState<number | null>(null);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [dynamicRequirements, setDynamicRequirements] = useState<any>(null);
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [isIssuingKey, setIsIssuingKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState({ companyName: '', email: '', region: 'NCR', role: 'nominee' });

  useEffect(() => {
    if (activeTab === 'management') {
      const fetchKeys = async () => {
        const keys = await getAllAccessKeys();
        setAllKeys(keys);
      };
      fetchKeys();
    }
  }, [activeTab]);

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

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleIssueKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuingKey(true);
    try {
      const keyId = await issueAccessKey(newKeyData);
      alert(`Key Issued Successfully: ${keyId}`);
      setNewKeyData({ companyName: '', email: '', region: 'NCR', role: 'nominee' });
      const updatedKeys = await getAllAccessKeys();
      setAllKeys(updatedKeys);
    } catch (err) {
      alert("Failed to issue key.");
    } finally {
      setIsIssuingKey(false);
    }
  };

  useEffect(() => {
    if (selectedNominee && view === 'review') {
      const fetchReqs = async () => {
        setIsLoadingRequirements(true);
        const category = selectedNominee.details?.nomineeCategory || 'Industry';
        const reqs = await getRequirementsByCategory(category);

        // Force Stage 1 to always have the 35 requirements
        const mergedReqs = {
          ...reqs,
          stage1: STAGE_1_REQUIREMENTS
        };

        setDynamicRequirements(mergedReqs);
        setIsLoadingRequirements(false);
      };
      fetchReqs();
    }
  }, [selectedNominee?.id, view]);

  const sortedApplicants = useMemo(() => {
    return [...(localNominees || [])].sort((a, b) => {
      const getLatest = (app: Nominee) => {
        const docDates = (app.documents || []).map(d => new Date(d.date || 0).getTime()).filter(t => !isNaN(t));
        const subDate = new Date(app.submittedDate || 0).getTime();
        return Math.max(isNaN(subDate) ? 0 : subDate, ...docDates, 0);
      };
      return getLatest(b) - getLatest(a);
    });
  }, [localNominees]);

  const nominees = sortedApplicants;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReview = (nominee: Nominee) => {
    setSelectedNominee(nominee);
    setView('review');
    setDocEvaluations({});
    setRound2Open(false);
  };



  const handleBackToList = () => {
    setSelectedNominee(null);
    setView('list');
  };

  const handlePreview = async (doc: NomineeDocument) => {
    setIsResolvingUrl(true);
    setPreviewDoc({ name: doc.name, url: null, type: doc.type });
    setPreviewModalOpen(true);

    try {
      const resolvedUrl = await resolveFileUrl(doc.url);
      setPreviewDoc({ name: doc.name, url: resolvedUrl, type: doc.type });
    } catch (e) {
      console.error("Failed to load document", e);
      alert("Failed to decrypt and load the evidence.");
      setPreviewModalOpen(false);
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleExportStage = async (round: number) => {
    if (!selectedNominee || !selectedNominee.documents) return;
    setIsExporting(round);

    const stagePrefix = round === 1 ? 'r1' : round === 2 ? 'r2' : 'r3';
    const docsToExport = selectedNominee.documents.filter(doc => doc.slotId?.startsWith(stagePrefix) && doc.url);

    if (docsToExport.length === 0) {
      alert("No documents uploaded for this stage yet.");
      setIsExporting(null);
      return;
    }

    try {
      // Create hidden link element for sequential download triggers
      for (const doc of docsToExport) {
        if (!doc.url) continue;
        const resolvedUrl = await resolveFileUrl(doc.url);

        // Use a blank target to ensure it works across all browser security policies
        const link = document.createElement('a');
        link.href = resolvedUrl;
        link.download = doc.name || `document_${doc.slotId}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay to prevent browser from totally blocking multiple simultaneous popups
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to open documents. Check your browser's pop-up blocker.");
    } finally {
      setIsExporting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };


  const renderDocumentGrid = (round: number) => {
    if (!selectedNominee || !dynamicRequirements) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Requirements...</div>;

    const stageKey = round === 1 ? 'stage1' : round === 2 ? 'stage2' : 'stage3';
    const activeRequirements = dynamicRequirements[stageKey] || [];

    return (
      <div className="space-y-4">
        {docCategories.map(cat => {
          const catReqs = activeRequirements.filter((r: any) => (r.category === cat.id || r.category === cat.name) || (!r.category && cat.id === 'General'));
          if (catReqs.length === 0) return null;

          const isOpen = openCategories[cat.id];
          const completedCount = catReqs.filter((req: any) => {
            const globalIdx = activeRequirements.findIndex((r: any) => r.label === req.label);
            const stagePrefix = round === 1 ? 'r1' : round === 2 ? 'r2' : 'r3';
            const slotId = `${stagePrefix}-${globalIdx}`;
            const doc = selectedNominee.documents?.find(d => d.slotId === slotId);
            return doc?.verdict === 'pass' || doc?.verdict === 'fail';
          }).length;

          return (
            <div key={`${cat.id}-${round}`} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col transition-all duration-300">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <cat.icon size={22} className="text-gkk-navy mr-4" />
                  <h4 className="font-bold text-gkk-navy text-sm uppercase tracking-wider">{cat.name}</h4>
                  <span className={`ml-4 text-[10px] font-black px-3 py-1 rounded-full border ${completedCount === catReqs.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {completedCount} / {catReqs.length} EVALUATED
                  </span>
                </div>
                <div className="text-gkk-navy">
                  {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </button>

              <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white">
                  {catReqs.map((req: any, localIdx: number) => {
                    const globalIdx = activeRequirements.findIndex((r: any) => r.label === req.label);
                    const stagePrefix = round === 1 ? 'r1' : round === 2 ? 'r2' : 'r3';
                    const slotId = `${stagePrefix}-${globalIdx}`;

                    const doc = selectedNominee.documents?.find(d => d.slotId === slotId);
                    const docStatus = doc?.verdict;

                    const handleDocVerdict = async (verdict: 'pass' | 'fail') => {
                      const success = await updateDocumentEvaluation(selectedNominee.id, slotId, verdict);
                      if (success) {
                        const updatedDocs = (selectedNominee.documents || []).map(d =>
                          d.slotId === slotId ? { ...d, verdict } : d
                        );
                        const updatedNominee = { ...selectedNominee, documents: updatedDocs };
                        setSelectedNominee(updatedNominee);
                        setLocalNominees(prev => prev.map(a => a.id === selectedNominee.id ? updatedNominee : a));
                      }
                    };

                    return (
                      <div key={localIdx} className={`p-5 border rounded-2xl transition-all ${docStatus === 'pass' ? 'bg-green-50 border-green-200 shadow-inner' : docStatus === 'fail' ? 'bg-red-50 border-red-200 shadow-inner' : doc ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Evidence</span>
                          <div className="flex gap-1.5">
                            {docStatus === 'pass' && <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-md">PASSED</span>}
                            {docStatus === 'fail' && <span className="text-[9px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md">FAILED</span>}
                            {doc ? <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">SUBMITTED</span> : <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">EMPTY</span>}
                          </div>
                        </div>
                        <h5 className="text-sm font-bold text-gkk-navy mb-2 leading-relaxed min-h-[2.5em]">{req.label}</h5>
                        {doc && (
                          <p className="text-[11px] text-blue-600 truncate mb-4 font-bold bg-blue-50/50 p-2 rounded-xl border border-blue-100/30 flex items-center gap-2">
                            <FileText size={14} className="shrink-0" /> {doc.name}
                          </p>
                        )}

                        <div className="mt-4 space-y-3">
                          {doc ? (
                            <>
                              <button
                                onClick={() => handlePreview(doc)}
                                className="w-full py-2.5 bg-gkk-navy text-white hover:bg-gkk-royalBlue rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <Eye size={14} /> VIEW PROOF
                              </button>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDocVerdict('pass')}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${docStatus === 'pass' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:text-green-600'}`}
                                >
                                  PASS
                                </button>
                                <button
                                  onClick={() => handleDocVerdict('fail')}
                                  className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${docStatus === 'fail' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:text-red-600'}`}
                                >
                                  FAIL
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full py-2.5 bg-gray-50 border border-dashed border-gray-200 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center italic">
                              Awaiting Submission
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const calculateProgress = (nominee: Nominee, round: number) => {
    if (!dynamicRequirements) return 0;
    const stageKey = round === 1 ? 'stage1' : round === 2 ? 'stage2' : 'stage3';
    const stageReqs = dynamicRequirements[stageKey] || [];
    if (stageReqs.length === 0) return 0;

    const roundDocs = nominee.documents || [];
    const stagePrefix = round === 1 ? 'r1' : round === 2 ? 'r2' : 'r3';

    const uploadedCount = stageReqs.filter((req: any, idx: number) => {
      const slotId = `${stagePrefix}-${idx}`;
      return roundDocs.some(d => d.slotId === slotId);
    }).length;

    return Math.round((uploadedCount / stageReqs.length) * 100);
  };

  const renderProgressBar = (nominee: Nominee, round: number) => {
    const progress = calculateProgress(nominee, round);
    const colorClass = round === 1 ? 'bg-gkk-navy' : round === 2 ? 'bg-blue-600' : 'bg-gkk-gold';

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Stage {round} Progress</span>
          <span className="text-[9px] font-bold text-gray-400">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">My Nominees</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{nominees.length}</h3></div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ClipboardCheck size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Pending Validation</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{localNominees.filter(a => a.status !== 'completed').length}</h3></div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Cycle Verified</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{localNominees.filter(a => a.status === 'completed').length}</h3></div>
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><CheckCircle size={28} /></div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30"><h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">Assigned Queue</h3><button onClick={() => setActiveTab('entries')} className="text-xs font-bold text-gkk-gold hover:text-gkk-navy uppercase tracking-widest">Full Pipeline</button></div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[500px]">
            {sortedApplicants.map(nominee => (
              <div key={nominee.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-5"><div className="w-12 h-12 bg-gkk-navy/5 text-gkk-navy rounded-2xl flex items-center justify-center font-bold border border-gkk-navy/5 group-hover:bg-gkk-navy group-hover:text-white transition-all">{(nominee.name || '?').charAt(0)}</div><div><h4 className="font-bold text-gkk-navy uppercase tracking-tighter text-sm">{nominee.name || 'Unknown'}</h4><p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{nominee.industry || 'Unknown'}</p></div></div>
                <div className="flex items-center gap-6"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border tracking-widest uppercase ${getStatusColor(nominee.status || 'in_progress')}`}>{(nominee.status || 'in_progress').replace('_', ' ')}</span><button onClick={() => handleReview(nominee)} className="p-3 bg-gray-100 text-gray-400 hover:bg-gkk-navy hover:text-white rounded-2xl transition-all"><ChevronRight size={20} /></button></div>
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
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden"><table className="w-full text-left border-collapse"><thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]"><tr className="border-b border-gray-100"><th className="px-8 py-6">Establishment Identity</th><th className="px-8 py-6">Sector</th><th className="px-8 py-6">Artifacts</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-50">{sortedApplicants.filter(a => (a.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(nominee => (<tr key={nominee.id} className="hover:bg-gray-50/50 transition-all group cursor-pointer" onClick={() => handleReview(nominee)}><td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gkk-navy/5 text-gkk-navy rounded-2xl flex items-center justify-center font-bold border border-gkk-navy/5 group-hover:bg-gkk-navy group-hover:text-white transition-all">{(nominee.name || '?').charAt(0)}</div><div><p className="font-bold text-gkk-navy text-sm uppercase tracking-tight leading-none">{nominee.name}</p><p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">{nominee.regId}</p></div></div></td><td className="px-8 py-6"><p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{nominee.industry}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{nominee.region}</p></td><td className="px-8 py-6"><div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><FileText size={16} className="text-gray-300" /> {nominee.documents?.length || 0} Records</div></td><td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-bold border tracking-widest uppercase ${getStatusColor(nominee.status || 'in_progress')}`}>{(nominee.status || 'in_progress').replace('_', ' ')}</span></td><td className="px-8 py-6 text-right"><button className="p-3 bg-gray-50 text-gray-400 group-hover:bg-gkk-gold group-hover:text-gkk-navy rounded-2xl transition-all"><ChevronRight size={20} /></button></td></tr>))}</tbody></table></div>
    </div>
  );

  const renderManagement = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Issuance Form */}
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">Issue New Access Key</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Generate invitation keys for new nominees.</p>
          </div>
          <form onSubmit={handleIssueKey} className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Establishment Name</label>
                <input
                  type="text"
                  required
                  value={newKeyData.companyName}
                  onChange={(e) => setNewKeyData({ ...newKeyData, companyName: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight"
                  placeholder="e.g. Acme Corp Philippines"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Administrator Email</label>
                <input
                  type="email"
                  required
                  value={newKeyData.email}
                  onChange={(e) => setNewKeyData({ ...newKeyData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight"
                  placeholder="safety@company.ph"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Role</label>
                  <select
                    value={newKeyData.role}
                    onChange={(e) => setNewKeyData({ ...newKeyData, role: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight appearance-none"
                  >
                    <option value="nominee">Nominee</option>
                    <option value="reu">REU (Regional Extension Unit)</option>
                    <option value="scd_team_leader">SCD Team Leader</option>
                    <option value="evaluator">Regional Board Evaluator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Region</label>
                  <select
                    value={newKeyData.region}
                    onChange={(e) => setNewKeyData({ ...newKeyData, region: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight appearance-none"
                  >
                    {PH_REGIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              disabled={isIssuingKey}
              className="w-full py-4 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              {isIssuingKey ? 'Generating...' : 'Issue GKK Access Key'}
            </button>
          </form>
        </div>

        {/* Access Key Log */}
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">Access Key Log</h3>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">{allKeys.length} Total Keys</span>
          </div>
          <div className="overflow-y-auto max-h-[500px] divide-y divide-gray-50">
            {allKeys.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs italic">No keys issued yet.</div>
            ) : (
              allKeys.map((key: any) => (
                <div key={key.keyId} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-xs ${key.status === 'activated' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {key.status === 'activated' ? <CheckCircle size={18} /> : <KeyRound size={18} />}
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-gkk-navy uppercase text-sm tracking-widest">{key.keyId}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{key.name || 'Unknown Establishment'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${key.status === 'activated' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      {key.status}
                    </span>
                    <p className="text-[8px] text-gray-300 font-bold uppercase mt-2 tracking-tighter">Issued: {new Date(key.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => {
    if (!selectedNominee) return null;
    return (
      <div className="animate-in fade-in duration-500 space-y-8 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[35px] border border-gray-200 shadow-sm sticky top-0 z-30"><div className="flex items-center gap-5"><button onClick={handleBackToList} className="p-3 bg-gray-50 text-gray-500 hover:bg-gkk-navy hover:text-white rounded-2xl transition-all border border-gray-100"><ChevronLeft size={24} /></button><div><h2 className="text-2xl font-serif font-bold text-gkk-navy leading-none uppercase tracking-tight">Review Profile</h2><div className="flex items-center gap-3 mt-3"><span className="bg-gray-100 px-3 py-0.5 rounded-full font-bold text-[9px] text-gray-500 uppercase tracking-widest">ID: {selectedNominee.regId}</span><span className={`px-3 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusColor(selectedNominee.status)}`}>{selectedNominee.status.replace('_', ' ')}</span></div></div></div><div className="flex items-center gap-3 w-full lg:w-auto"><button onClick={onUnderDev} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-3 bg-gkk-navy text-white font-bold rounded-2xl hover:bg-gkk-royalBlue transition-all text-xs uppercase tracking-widest shadow-xl shadow-gkk-navy/20">Finalize</button></div></div>
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden p-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 items-start md:items-center">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gkk-navy/5 rounded-[25px] text-gkk-navy ring-1 ring-gkk-navy/10"><Building2 size={36} /></div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-gkk-navy leading-tight uppercase tracking-tight">{selectedNominee.name}</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2"><MapPin size={12} className="text-gkk-gold" /> {selectedNominee.region}, Philippines</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="w-32 bg-gray-50 rounded-[20px] p-4 text-center border border-gray-100">
                {renderProgressBar(selectedNominee, 1)}
              </div>
              {userRole !== 'reu' && (selectedNominee.round2Unlocked || userRole === 'admin' || userRole === 'scd_team_leader') && (
                <div className="w-32 bg-gray-50 rounded-[20px] p-4 text-center border border-gray-100">
                  {renderProgressBar(selectedNominee, 2)}
                </div>
              )}
              {userRole !== 'reu' && (selectedNominee.round3Unlocked || userRole === 'admin' || userRole === 'scd_team_leader') && (
                <div className="w-32 bg-gray-50 rounded-[20px] p-4 text-center border border-gray-100">
                  {renderProgressBar(selectedNominee, 3)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Stage 1 Documents</h3>
              <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest italic opacity-60">Evaluate the initial compliance records.</p>
            </div>
            <button
              onClick={() => handleExportStage(1)}
              disabled={isExporting === 1}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              <Download size={14} /> {isExporting === 1 ? "Exporting..." : "Export PDFs"}
            </button>
          </div>
          <div className="space-y-4">{renderDocumentGrid(1)}</div>



          {userRole !== 'reu' && (
            <>
              <div className="space-y-4">
                <div className={`rounded-[40px] border transition-all duration-300 overflow-hidden ${(selectedNominee.round2Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${(selectedNominee.round2Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? 'bg-blue-600 text-white shadow-xl' : 'bg-gray-200 text-gray-400'}`}>{(selectedNominee.round2Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? <Unlock size={28} /> : <Lock size={28} />}</div>
                      <div className="text-left"><h4 className="font-bold text-gkk-navy text-xl uppercase tracking-tighter leading-none">Stage 2 Verification</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">{selectedNominee.round2Unlocked ? 'Reviewing national shortlist' : (['admin', 'scd_team_leader'].includes(userRole || '')) ? 'Action Required: Trigger Stage 2' : 'Locked'}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(selectedNominee.round2Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) && (
                        <button
                          onClick={() => handleExportStage(2)}
                          disabled={isExporting === 2}
                          className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-[20px] hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                        >
                          <Download size={16} /> {isExporting === 2 ? "Export..." : "Export PDFs"}
                        </button>
                      )}
                      {(['admin', 'scd_team_leader'].includes(userRole || '')) && (
                        <button onClick={() => {
                          const newStatus = !selectedNominee.round2Unlocked;
                          if (onToggleRound2) onToggleRound2(selectedNominee.id, newStatus);
                          const updated = { ...selectedNominee, round2Unlocked: newStatus };
                          setSelectedNominee(updated);
                          setLocalNominees(prev => prev.map(a => a.id === updated.id ? updated : a));
                        }} className={`px-10 py-4 rounded-[20px] font-bold transition-all shadow-xl text-[10px] tracking-widest uppercase ${selectedNominee.round2Unlocked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gkk-gold text-gkk-navy hover:bg-gkk-navy hover:text-white'}`}>{selectedNominee.round2Unlocked ? 'Deactivate Stage 2' : 'Activate Stage 2'}</button>
                      )}


                    </div>
                  </div>
                  {(selectedNominee.round2Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) && (
                    <div className="border-t border-gray-100 bg-white">
                      <div className="p-10">{renderDocumentGrid(2)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className={`rounded-[40px] border transition-all duration-300 overflow-hidden ${(selectedNominee.round3Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${(selectedNominee.round3Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? 'bg-gkk-gold text-gkk-navy shadow-xl' : 'bg-gray-200 text-gray-400'}`}>{(selectedNominee.round3Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) ? <Unlock size={28} /> : <Lock size={28} />}</div>
                      <div className="text-left"><h4 className="font-bold text-gkk-navy text-xl uppercase tracking-tighter leading-none">Stage 3 Verification</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3">{selectedNominee.round3Unlocked ? 'National Board Final Evaluation' : (['admin', 'scd_team_leader'].includes(userRole || '')) ? 'SCD Trigger Required' : 'Locked'}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      {(selectedNominee.round3Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) && (
                        <button
                          onClick={() => handleExportStage(3)}
                          disabled={isExporting === 3}
                          className="px-6 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-[20px] hover:bg-gray-50 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                        >
                          <Download size={16} /> {isExporting === 3 ? "Export..." : "Export PDFs"}
                        </button>
                      )}
                      {(['admin', 'scd_team_leader'].includes(userRole || '')) && (
                        <button onClick={() => {
                          const newStatus = !selectedNominee.round3Unlocked;
                          if (onToggleRound3) onToggleRound3(selectedNominee.id, newStatus);
                          const updated = { ...selectedNominee, round3Unlocked: newStatus };
                          setSelectedNominee(updated);
                          setLocalNominees(prev => prev.map(a => a.id === updated.id ? updated : a));
                        }} className={`px-10 py-4 rounded-[20px] font-bold transition-all shadow-xl text-[10px] tracking-widest uppercase ${selectedNominee.round3Unlocked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue'}`}>{selectedNominee.round3Unlocked ? 'Deactivate Stage 3' : 'Activate Stage 3'}</button>
                      )}


                    </div>
                  </div>
                  {(selectedNominee.round3Unlocked || ['admin', 'scd_team_leader'].includes(userRole || '')) && (
                    <div className="border-t border-gray-100">
                      <div className="p-10 bg-white">{renderDocumentGrid(3)}</div>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden page-transition">
      <aside className="w-64 bg-gkk-navy text-white flex flex-col flex-shrink-0 border-r border-white/5">
        <div className="p-6 border-b border-white/5"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-gradient-to-tr from-gkk-gold to-yellow-200 rounded-lg flex items-center justify-center"><span className="text-gkk-navy font-bold text-sm">14<sup>th</sup></span></div><span className="font-serif font-bold tracking-widest text-lg uppercase">
          {userRole === 'admin' ? 'Admin' : userRole === 'scd_team_leader' ? 'SCD Team' : userRole === 'reu' ? 'REU' : 'Validator'}
        </span></div></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab('dashboard'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><LayoutDashboard size={20} /><span className="text-sm font-medium">Dashboard</span></button>
          <button onClick={() => { setActiveTab('entries'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'entries' || view === 'review' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><Users size={20} /><span className="text-sm font-medium">Nominee Queue</span></button>

          {userRole === 'admin' && (
            <button onClick={() => { setActiveTab('management'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'management' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Zap size={20} />
              <span className="text-sm font-medium">Management</span>
            </button>
          )}
          <div className="pt-6 mt-6 border-t border-white/5"><p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Board Tools</p><button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><Scale size={20} /><span className="text-sm font-medium">Scoring Matrix</span></button><button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><ShieldAlert size={20} /><span className="text-sm font-medium">Audit Logs</span></button></div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <span>Validator Portal</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-gkk-navy">{activeTab === 'dashboard' ? 'Overview' : activeTab === 'management' ? 'Management' : 'Queue'}</span>
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
                      {userRole === 'admin' ? 'System Admin' : userRole === 'scd_team_leader' ? 'SCD Team Leader' : userRole === 'reu' ? 'Regional Evaluation Unit' : 'Evaluator'}
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
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth"><div className="max-w-7xl mx-auto">{view === 'list' ? (activeTab === 'dashboard' ? renderDashboard() : activeTab === 'management' ? renderManagement() : renderEntries()) : renderReview()}</div></div>
      </main>
      {/* Preview Modal */}
      {previewModalOpen && previewDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gkk-navy/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center space-x-5">
                <div className="p-3 bg-gkk-navy text-white rounded-2xl"><FileText size={24} /></div>
                <div><h3 className="text-xl font-bold text-gkk-navy uppercase tracking-wider">{previewDoc.name}</h3><p className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-widest">Verified Evidence Record</p></div>
              </div>
              <button onClick={() => setPreviewModalOpen(false)} className="p-3 text-gray-400 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            <div className="flex-1 bg-gray-50 p-10 flex items-center justify-center">
              {previewDoc.url ? (
                (previewDoc.type && previewDoc.type.includes('image')) ? <img src={previewDoc.url} alt="Evidence" className="max-w-full max-h-full rounded-3xl shadow-2xl border-8 border-white" /> : <iframe src={previewDoc.url} title="Reader" className="w-full h-full rounded-3xl shadow-2xl bg-white border-0" />
              ) : <div className="text-center p-20 bg-white rounded-[40px] shadow-2xl max-w-md"><div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200"><FileIcon size={48} className="animate-pulse" /></div><h4 className="text-2xl font-bold text-gkk-navy uppercase tracking-widest text-gray-400 animate-pulse">Decrypting...</h4></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EvaluatorPortal;
