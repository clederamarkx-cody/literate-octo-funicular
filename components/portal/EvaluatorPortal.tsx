import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
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
  Upload,
  AlertTriangle
} from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Nominee, NomineeDocument, UserRole, AccessKey, User as UserType } from '../../types';
import { STAGE_1_REQUIREMENTS } from './NomineePortal';
import { getAllNominees, resolveFileUrl, updateDocumentEvaluation, updateDocumentRemarks, getRequirementsByCategory, issueAccessKey, getAllAccessKeys, getUserProfile, updateUserProfile, updateNominee, getAllIndustrySectors } from '../../services/dbService';
import StaffProfileEdit from './StaffProfileEdit';
import { UserProfileTable } from './management/UserProfileTable';
import { PH_REGIONS } from '../../constants';
import PrivateSectorPortalView from './nominee/PrivateSectorPortalView';
import GovernmentPortalView from './nominee/GovernmentPortalView';
import MicroPortalView from './nominee/MicroPortalView';
import IndividualPortalView from './nominee/IndividualPortalView';

interface EvaluatorPortalProps {
  onLogout: () => void;
  onUnderDev: () => void;
  nomineesData: Nominee[];
  userRole?: string | null;
  onToggleRound2?: (nomineeId: string, unlocked: boolean) => void;
  onToggleRound3?: (nomineeId: string, unlocked: boolean) => void;
}

const EvaluatorPortal: React.FC<EvaluatorPortalProps> = ({ onLogout, onUnderDev, nomineesData: propNominees, userRole, onToggleRound2, onToggleRound3 }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'management' | 'staff_directory' | 'profile'>('dashboard');
  const [view, setView] = useState<'list' | 'review'>('list');
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localNominees, setLocalNominees] = useState<Nominee[]>(propNominees);
  const [isLoading, setIsLoading] = useState(true);
  const [staffProfile, setStaffProfile] = useState<UserType | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'warning' | 'success' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'warning'
  });

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

    // Fetch own profile
    const fetchProfile = async () => {
      let uid = '';

      const { auth } = await import('../../services/dbService');
      if (auth.currentUser) {
        uid = auth.currentUser.uid;
      } else {
        // Fallback to session storage if auth state is not yet synced
        const session = sessionStorage.getItem('gkk_session');
        if (session) {
          try {
            const { uid: sessionUid } = JSON.parse(session);
            uid = sessionUid;
          } catch (e) {
            console.error("Failed to parse session for profile fetch", e);
          }
        }
      }

      if (uid) {
        const profile = await getUserProfile(uid);
        if (profile) {
          setStaffProfile(profile);
        } else {
          // If profile doesn't exist in DB, create a minimal one from session or mock it
          const session = sessionStorage.getItem('gkk_session');
          let email = 'staff@gkk.gov.ph';
          let role = (userRole as UserRole) || 'evaluator';

          if (session) {
            const sData = JSON.parse(session);
            email = sData.email || email;
            role = sData.role || role;
          }

          setStaffProfile({
            userId: uid,
            email,
            role,
            name: email.split('@')[0].toUpperCase(),
            region: 'REGION',
            status: 'active'
          } as UserType);
        }
      } else {
        console.warn("No UID found for profile fetch");
      }
    };
    fetchProfile();
  }, []);
  const [round2Open, setRound2Open] = useState(false);
  const [docEvaluations, setDocEvaluations] = useState<Record<string, 'pass' | 'fail'>>({});
  const [docRemarks, setDocRemarks] = useState<Record<string, string>>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string, url: string | null, type: string } | null>(null);
  const [isExporting, setIsExporting] = useState<number | null>(null);
  const [isStage1Folded, setIsStage1Folded] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [dynamicRequirements, setDynamicRequirements] = useState<any>(null);
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [keySearchTerm, setKeySearchTerm] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState<string>('all');
  const [keyRoleFilter, setKeyRoleFilter] = useState<string>('all');
  const [isIssuingKey, setIsIssuingKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState({ companyName: '', focalName: '', email: '', region: 'NCR', role: 'nominee', category: 'Private' as 'Private' | 'Individual' | 'Micro Enterprise' | 'Government' | 'Private Construction', industry: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [issuedKeyId, setIssuedKeyId] = useState('');
  const [industrySectors, setIndustrySectors] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'management') {
      const fetchKeys = async () => {
        const [keys, industries] = await Promise.all([
          getAllAccessKeys(),
          getAllIndustrySectors()
        ]);
        setAllKeys(keys);
        setIndustrySectors(industries);

        // Default industry if sectors are loaded
        if (industries.length > 0 && !newKeyData.industry) {
          setNewKeyData(prev => ({ ...prev, industry: industries[0].name }));
        }
      };
      fetchKeys();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedNominee && view === 'review') {
      // Auto-fold Stage 1 for national roles (SCD/Evaluator/Admin) if Stage 2 is unlocked
      if (userRole !== 'reu' && selectedNominee.round2Unlocked) {
        setIsStage1Folded(true);
      } else {
        // Default to unfolded for REU or if Stage 2 is locked
        setIsStage1Folded(false);
      }
    }
  }, [selectedNominee?.id, view, userRole]);

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


  const handleIssueKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuingKey(true);
    try {
      const keyId = await issueAccessKey(newKeyData);
      setIssuedKeyId(keyId);
      setShowSuccessModal(true);
      setNewKeyData({ companyName: '', focalName: '', email: '', region: 'NCR', role: 'nominee', category: 'Private Sector', industry: industrySectors[0]?.name || '' });
      const updatedKeys = await getAllAccessKeys();
      setAllKeys(updatedKeys);
    } catch (err) {
      alert("Failed to issue key.");
    } finally {
      setIsIssuingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (selectedNominee && view === 'review') {
      const fetchReqs = async () => {
        setIsLoadingRequirements(true);
        const category = selectedNominee.details?.nomineeCategory || 'Private Sector';
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

  // 1. First, filter by region if role is REU
  const filteredNominees = useMemo(() => {
    let list = [...(localNominees || [])];

    // Strict Region-Based Visibility for REU
    if (staffProfile?.role === 'reu' && staffProfile?.region) {
      list = list.filter(app => app.region === staffProfile.region);
    }

    return list;
  }, [localNominees, staffProfile]);

  // 2. Then, sort the filtered list
  const sortedApplicants = useMemo(() => {
    return [...filteredNominees].sort((a, b) => {
      const getLatest = (app: Nominee) => {
        const docDates = (app.documents || []).map(d => new Date(d.date || 0).getTime()).filter(t => !isNaN(t));
        const subDate = new Date(app.submittedDate || 0).getTime();
        return Math.max(isNaN(subDate) ? 0 : subDate, ...docDates, 0);
      };
      return getLatest(b) - getLatest(a);
    });
  }, [filteredNominees]);

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

  const handlePreview = async (doc: any) => {
    setIsResolvingUrl(true);
    // Support both NomineeDocument and DocumentSlot structures
    const docName = doc.name || doc.fileName || doc.label || 'Document';
    const docUrl = doc.url || doc.previewUrl;

    setPreviewDoc({ name: docName, url: null, type: doc.type });
    setPreviewModalOpen(true);

    try {
      const resolvedUrl = await resolveFileUrl(docUrl);
      setPreviewDoc({ name: docName, url: resolvedUrl, type: doc.type });
    } catch (e) {
      console.error("Failed to load document", e);
      alert("Failed to decrypt and load the evidence.");
      setPreviewModalOpen(false);
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleDocVerdict = async (slotId: string, verdict: 'pass' | 'fail', round: number = 1) => {
    if (!selectedNominee) return;
    try {
      const result = await updateDocumentEvaluation(selectedNominee.id, slotId, verdict, round);
      if (result.error) {
        alert(`Warning: Database evaluation update failed.\nError: ${result.error}\nThe change may not persist after a refresh.`);
      }

      const updatedDocs = (selectedNominee.documents || []).map(d =>
        d.slotId === slotId
          ? (round === 2 ? { ...d, verdict_r2: verdict } : { ...d, verdict })
          : d
      );
      const updatedNominee = { ...selectedNominee, documents: updatedDocs };
      setSelectedNominee(updatedNominee);
      setLocalNominees(prev => prev.map(a => a.id === selectedNominee.id ? updatedNominee : a));
    } catch (e: any) {
      console.error(e);
      alert(`Error updating verdict: ${e.message}`);
    }
  };

  const handleDocRemark = async (slotId: string, remark: string, round: number = 1) => {
    if (!selectedNominee) return;
    const success = await updateDocumentRemarks(selectedNominee.id, slotId, remark, round);
    if (success) {
      const updatedDocs = (selectedNominee.documents || []).map(d =>
        d.slotId === slotId
          ? (round === 2 ? { ...d, remarks_r2: remark } : { ...d, remarks: remark })
          : d
      );
      const updatedNominee = { ...selectedNominee, documents: updatedDocs };
      setSelectedNominee(updatedNominee);
      setLocalNominees(prev => prev.map(a => a.id === selectedNominee.id ? updatedNominee : a));
    }
  };

  const handleExportStage = async (round: number) => {
    if (!selectedNominee || !selectedNominee.documents) return;
    setIsExporting(round);

    const stagePrefix = round === 1 ? 'r1' : round === 2 ? 'r2' : 'r3';
    const allDocs = selectedNominee.documents || [];
    // Use case-insensitive matching for slotId
    const stageDocs = allDocs.filter(doc => doc.slotId?.toLowerCase().startsWith(stagePrefix));
    const docsToExport = stageDocs.filter(doc => doc.url);

    console.log(`[EXPORT] Diagnostics - Total: ${allDocs.length}, Stage ${round}: ${stageDocs.length}, With URL: ${docsToExport.length}`);

    if (docsToExport.length === 0) {
      alert(`No documents found for Stage ${round}.\n(Slots found: ${stageDocs.length}, with valid URLs: 0)`);
      setIsExporting(null);
      return;
    }

    if (docsToExport.length < stageDocs.length) {
      alert(`Exporting ${docsToExport.length} files. Note: ${stageDocs.length - docsToExport.length} files were skipped because they lack a valid upload URL.`);
    }

    try {
      const zip = new JSZip();

      console.log(`[EXPORT] Starting batched fetch for ${docsToExport.length} files...`);

      const batchSize = 5;
      for (let i = 0; i < docsToExport.length; i += batchSize) {
        const batch = docsToExport.slice(i, i + batchSize);
        console.log(`[EXPORT] Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docsToExport.length / batchSize)}...`);

        await Promise.all(batch.map(async (doc) => {
          if (!doc.url) return;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

          try {
            const resolvedUrl = await resolveFileUrl(doc.url);
            const response = await fetch(resolvedUrl, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const safeName = (doc.name || 'document').replace(/[/\\?%*:|"<>]/g, '-');
            const fileName = `${doc.slotId}_${safeName}.pdf`;
            zip.file(fileName, blob);
            console.log(`[EXPORT] Added: ${fileName}`);
          } catch (fetchError: any) {
            console.error(`[EXPORT] Error/Timeout fetching ${doc.slotId}:`, fetchError);
          } finally {
            clearTimeout(timeoutId);
          }
        }));
      }

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const companyName = selectedNominee.name || 'Company';
      const zipFileName = `${companyName} - Stage ${round} Requirements.zip`;

      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();

      // Delay revocation to ensure browser handles the download stream properly
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`[EXPORT] Export process complete.`);
      }, 1000);

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate ZIP archive. Please try again.");
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

    const stageKey = round === 3 ? 'stage3' : 'stage1';
    const activeRequirements = dynamicRequirements[stageKey] || [];

    const totalEvaluated = activeRequirements.filter((req: any, idx: number) => {
      const stagePrefix = round === 3 ? 'r3' : 'r1';
      const slotId = `${stagePrefix}-${idx}`;
      const doc = selectedNominee.documents?.find(d => d.slotId === slotId);
      return doc?.verdict === 'pass' || doc?.verdict === 'fail';
    }).length;

    // Inclusion logic for Deficiencies in Stage 3 Summary
    const deficiencies = round === 3
      ? (selectedNominee.documents || []).filter(d => d.slotId?.startsWith('r3-deficiency-'))
      : [];

    const deficienciesEvaluated = deficiencies.filter(d => d.verdict === 'pass' || d.verdict === 'fail').length;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <FileText size={22} className="text-gkk-navy mr-4" />
            <h4 className="font-bold text-gkk-navy text-sm uppercase tracking-wider">Evaluation Checklist</h4>
            <span className={`ml-4 text-[10px] font-black px-3 py-1 rounded-full border ${(round === 3 ? deficienciesEvaluated : totalEvaluated) === (round === 3 ? deficiencies.length : activeRequirements.length) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {round === 3 ? deficienciesEvaluated : totalEvaluated} / {round === 3 ? deficiencies.length : activeRequirements.length} EVALUATED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Base Requirements - Only for Stage 1 & 2. Stage 3 is correction-only. */}
          {round < 3 && activeRequirements.map((req: any, idx: number) => {
            const stagePrefix = 'r1';
            const slotId = `${stagePrefix}-${idx}`;
            return renderRequirementCard(req, slotId);
          })}

          {/* Dynamic Deficiency Slots (Stage 3 Only) */}
          {round === 3 && deficiencies.map((doc: any, idx: number) => {
            const originalSlotId = doc.slotId?.replace('r3-deficiency-', '');
            const [prefix, indexStr] = (originalSlotId || '').split('-');
            const index = parseInt(indexStr);
            const stageKey = prefix === 'r1' ? 'stage1' : 'stage2';
            const originalLabel = dynamicRequirements[stageKey]?.[index]?.label || 'Requirement';

            const mockReq = {
              label: `[DEFICIENCY] ${originalLabel}`,
              category: 'Deficiency Correction'
            };
            return renderRequirementCard(mockReq, doc.slotId);
          })}
        </div>
      </div>
    );
  };

  const renderRequirementCard = (req: any, slotId: string) => {
    if (!selectedNominee) return null;
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

    const isReuReadOnly = userRole === 'reu' && selectedNominee.stage1PassedByReu;

    return (
      <div key={slotId} className={`p-5 border rounded-2xl transition-all ${(!isReuReadOnly && docStatus === 'pass') ? 'bg-green-50 border-green-200 shadow-inner' : (!isReuReadOnly && docStatus === 'fail') ? 'bg-red-50 border-red-200 shadow-inner' : doc ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{req.category === 'Deficiency Correction' ? 'Correction' : 'Evidence'}</span>
          <div className="flex gap-1.5">
            {(!isReuReadOnly && docStatus === 'pass') && <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-md">PASSED</span>}
            {(!isReuReadOnly && docStatus === 'fail') && <span className="text-[9px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md">INCOMPLETE</span>}
            {(doc?.isCorrection || req.category === 'Deficiency Correction') && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shadow-sm">DEFICIENCY</span>}
            {doc ? <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">SUBMITTED</span> : <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">EMPTY</span>}
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
                <Eye size={14} /> VIEW DOCUMENT
              </button>
              {!(userRole === 'reu' && selectedNominee.stage1PassedByReu) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDocVerdict('pass')}
                    disabled={userRole === 'reu' && selectedNominee.stage1PassedByReu}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${userRole === 'reu' && selectedNominee.stage1PassedByReu ? 'opacity-50 cursor-not-allowed' : ''} ${docStatus === 'pass' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:text-green-600'}`}
                  >
                    PASS
                  </button>
                  <button
                    onClick={() => handleDocVerdict('fail')}
                    disabled={userRole === 'reu' && selectedNominee.stage1PassedByReu}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${userRole === 'reu' && selectedNominee.stage1PassedByReu ? 'opacity-50 cursor-not-allowed' : ''} ${docStatus === 'fail' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:text-red-600'}`}
                  >
                    INCOMPLETE
                  </button>
                </div>
              )}
              <div className="mt-3 pb-2">
                {!isReuReadOnly && (
                  <textarea
                    placeholder="Add remarks for the nominee..."
                    disabled={userRole === 'reu' && selectedNominee.stage1PassedByReu}
                    value={docRemarks[slotId] ?? doc.remarks ?? ''}
                    onChange={(e) => setDocRemarks(prev => ({ ...prev, [slotId]: e.target.value }))}
                    onBlur={async () => {
                      const remark = docRemarks[slotId];
                      if (remark !== undefined && remark !== (doc.remarks ?? '')) {
                        await updateDocumentRemarks(selectedNominee.id, slotId, remark);
                        const updatedDocs = (selectedNominee.documents || []).map(d =>
                          d.slotId === slotId ? { ...d, remarks: remark } : d
                        );
                        const updatedNominee = { ...selectedNominee, documents: updatedDocs };
                        setSelectedNominee(updatedNominee);
                        setLocalNominees(prev => prev.map(a => a.id === selectedNominee.id ? updatedNominee : a));
                      }
                    }}
                    className={`w-full text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-gkk-gold/50 focus:ring-1 focus:ring-gkk-gold/20 placeholder:text-gray-300 transition-all ${userRole === 'reu' && selectedNominee.stage1PassedByReu ? 'opacity-50 cursor-not-allowed' : ''}`}
                    rows={2}
                  />
                )}
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
  };

  const calculateProgress = (nominee: Nominee, round: number) => {
    if (!dynamicRequirements) return { percent: 0, count: 0, total: 0 };

    // Stage 2 override: 100% if Stage 3 is unlocked
    if (round === 2 && nominee.round3Unlocked) {
      const stageKey = 'stage1';
      const total = dynamicRequirements[stageKey]?.length || 0;
      return { percent: 100, count: total, total };
    }

    const roundDocs = nominee.documents || [];

    // Stage 3: Deficiency-only model (no base requirements)
    if (round === 3) {
      const deficiencies = roundDocs.filter(d => d.slotId?.startsWith('r3-deficiency-'));
      const totalItems = deficiencies.length;
      if (totalItems === 0) return { percent: 0, count: 0, total: 0 };
      const evaluatedCount = deficiencies.filter(d => d.verdict === 'pass' || d.verdict === 'fail').length;
      return {
        percent: Math.round((evaluatedCount / totalItems) * 100),
        count: evaluatedCount,
        total: totalItems
      };
    }

    const stageKey = 'stage1';
    const stageReqs = dynamicRequirements[stageKey] || [];
    const stagePrefix = 'r1';

    const totalItems = stageReqs.length;
    if (totalItems === 0) return { percent: 0, count: 0, total: 0 };

    const evaluatedCount = stageReqs.filter((req: any, idx: number) => {
      const slotId = `${stagePrefix}-${idx}`;
      const doc = roundDocs.find(d => d.slotId === slotId);
      // Round 2 (SCD/Evaluator) uses verdict_r2 field on the same r1 slots
      return round === 2
        ? (doc?.verdict_r2 === 'pass' || doc?.verdict_r2 === 'fail')
        : (doc?.verdict === 'pass' || doc?.verdict === 'fail');
    }).length;

    return {
      percent: Math.round((evaluatedCount / totalItems) * 100),
      count: evaluatedCount,
      total: totalItems
    };
  };

  const renderProgressBar = (nominee: Nominee, round: number) => {
    const { percent, count, total } = calculateProgress(nominee, round);

    // Role-specific labels and colors
    let label = 'Progress';
    let colorClass = 'bg-gkk-navy';

    if (round === 1) {
      label = 'REU Validation';
      colorClass = 'bg-gkk-navy';
    } else if (round === 2) {
      label = 'OSHC Evaluation';
      colorClass = 'bg-blue-600';
    } else if (round === 3) {
      label = 'Final Correction';
      colorClass = 'bg-gkk-gold';
    }

    // Highlight if relevant to current user role
    const isRelevant = (round === 1 && userRole === 'reu') ||
      (round === 2 && ['scd_team_leader', 'evaluator'].includes(userRole || '')) ||
      (round === 3 && ['scd_team_leader', 'evaluator'].includes(userRole || ''));

    return (
      <div className={`w-full transition-all ${isRelevant ? 'scale-100' : 'scale-[0.98] opacity-80'}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isRelevant ? 'text-gkk-navy' : 'text-gray-400'}`}>
            {label}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-gkk-navy">{percent}%</span>
            <span className="text-[9px] font-bold text-gray-300">({count}/{total})</span>
          </div>
        </div>
        <div className={`h-2 w-full ${isRelevant ? 'bg-gray-100' : 'bg-gray-50'} rounded-full overflow-hidden shadow-inner border border-black/5`}>
          <div
            className={`h-full ${colorClass} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">My Nominees</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{filteredNominees.length}</h3></div>
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ClipboardCheck size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Pending Validation</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{filteredNominees.filter(a => a.status !== 'completed').length}</h3></div>
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Clock size={28} /></div>
        </div>
        <div className="bg-white p-8 rounded-[35px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gkk-gold/30 transition-all">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Cycle Verified</p><h3 className="text-4xl font-serif font-bold text-gkk-navy">{filteredNominees.filter(a => a.status === 'completed').length}</h3></div>
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
      <div className="grid lg:grid-cols-1 gap-8">
        {/* Issuance Form */}
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full">
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">GKK Access Key Generator</h3>
            <p className="text-[14.5px] text-gray-400 font-semibold mt-2">Generate invitation keys for new nominees and staff.</p>
          </div>
          <form onSubmit={handleIssueKey} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Primary Focal Person</label>
                <input
                  type="text"
                  required
                  value={newKeyData.focalName}
                  onChange={(e) => setNewKeyData({ ...newKeyData, focalName: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight"
                  placeholder="e.g. Juan Dela Cruz"
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
                  <option value="evaluator">Evaluator</option>
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

              {newKeyData.role === 'nominee' ? (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nominee Sector / Class</label>
                  <select
                    value={newKeyData.category}
                    onChange={(e) => setNewKeyData({ ...newKeyData, category: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight appearance-none"
                  >
                    <option value="Private">Private</option>
                    <option value="Private Construction">Private Construction</option>
                    <option value="Individual">Individual</option>
                    <option value="Micro Enterprise">Micro Enterprise</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-end pb-1">
                  <div className="w-full p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex items-center justify-center">
                    <p className="text-[14.5px] text-gray-400 font-semibold">Sector selection only for Nominees</p>
                  </div>
                </div>
              )}

              {newKeyData.role === 'nominee' ? (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Industry Category</label>
                  <select
                    value={newKeyData.industry}
                    onChange={(e) => setNewKeyData({ ...newKeyData, industry: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold outline-none transition-all font-bold text-sm tracking-tight appearance-none"
                  >
                    <option value="">Select Industry...</option>
                    {industrySectors.map(ind => (
                      <option key={ind.id} value={ind.name}>{ind.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-end pb-1">
                  <div className="w-full p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex items-center justify-center">
                    <p className="text-[14.5px] text-gray-400 font-semibold">Industry category selection only for Nominees</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={isIssuingKey}
                className="px-12 py-4 bg-gkk-navy text-white font-semibold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue transition-all uppercase tracking-wider text-[14.5px] disabled:opacity-50"
              >
                {isIssuingKey ? 'Generating...' : 'Issue GKK Access Key'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Access Key Log - Full Width Landscape */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif font-bold text-xl text-gkk-navy uppercase tracking-wider">Access Key Log</h3>
            <span className="text-[14.5px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
              {allKeys.filter((k: any) => {
                const matchesSearch = keySearchTerm === '' || (k.key_id || '').toLowerCase().includes(keySearchTerm.toLowerCase()) || (k.name || '').toLowerCase().includes(keySearchTerm.toLowerCase()) || (k.email || '').toLowerCase().includes(keySearchTerm.toLowerCase());
                const matchesStatus = keyStatusFilter === 'all' || k.status === keyStatusFilter;
                const matchesRole = keyRoleFilter === 'all' || k.role === keyRoleFilter;
                return matchesSearch && matchesStatus && matchesRole;
              }).length} of {allKeys.length} Keys
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gkk-gold transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search by key, name, or email..."
                value={keySearchTerm}
                onChange={(e) => setKeySearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold transition-all font-semibold text-[14.5px] w-full shadow-sm"
              />
            </div>
            <select
              value={keyStatusFilter}
              onChange={(e) => setKeyStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold transition-all font-semibold text-[14.5px] shadow-sm appearance-none min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="activated">Activated</option>
              <option value="revoked">Revoked</option>
              <option value="reusable">Reusable</option>
            </select>
            <select
              value={keyRoleFilter}
              onChange={(e) => setKeyRoleFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gkk-gold/5 focus:border-gkk-gold transition-all font-semibold text-[14.5px] shadow-sm appearance-none min-w-[160px]"
            >
              <option value="all">All Roles</option>
              <option value="nominee">Nominee</option>
              <option value="evaluator">Evaluator</option>
              <option value="reu">REU</option>
              <option value="scd_team_leader">SCD Team Leader</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Pass Key</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Establishment / User</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Region</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Industry</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-[14.5px] font-semibold text-gray-400 uppercase tracking-wide text-right">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(() => {
                const filteredKeys = allKeys.filter((k: any) => {
                  const matchesSearch = keySearchTerm === '' || (k.key_id || '').toLowerCase().includes(keySearchTerm.toLowerCase()) || (k.name || '').toLowerCase().includes(keySearchTerm.toLowerCase()) || (k.email || '').toLowerCase().includes(keySearchTerm.toLowerCase());
                  const matchesStatus = keyStatusFilter === 'all' || k.status === keyStatusFilter;
                  const matchesRole = keyRoleFilter === 'all' || k.role === keyRoleFilter;
                  return matchesSearch && matchesStatus && matchesRole;
                });
                return filteredKeys.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-400 font-semibold uppercase tracking-wide text-[14.5px]">{allKeys.length === 0 ? 'No keys issued yet.' : 'No keys match your filters.'}</td>
                  </tr>
                ) : (
                  filteredKeys.sort((a: any, b: any) => new Date(b.created_at || b.issuedAt).getTime() - new Date(a.created_at || a.issuedAt).getTime()).map((key: any) => (
                    <tr key={key.key_id || key.keyId} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] font-semibold text-gkk-navy uppercase tracking-wide select-all">{key.key_id || key.keyId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] text-gkk-navy font-semibold uppercase">{key.name || '---'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] text-gray-500 font-semibold">{key.email || '---'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[14.5px] font-semibold uppercase">
                          {key.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] text-gray-500 font-semibold uppercase">{key.region}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] text-gray-500 font-semibold uppercase">{key.category || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14.5px] text-gray-500 font-semibold uppercase truncate max-w-[200px]" title={key.industry}>{key.industry || '---'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[14.5px] font-semibold uppercase border ${key.status === 'activated' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14.5px] text-gray-400 font-semibold uppercase">{new Date(key.created_at || key.issuedAt).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStaffDirectory = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <UserProfileTable />
    </div>
  );

  const renderReview = () => {
    if (!selectedNominee) return null;
    return (
      <div className="animate-in fade-in duration-500 space-y-8 pb-20">
        <div className="bg-white p-6 rounded-[35px] border border-gray-200 shadow-xl sticky top-0 z-30 ring-1 ring-black/5">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            {/* Left: Actions & Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                onClick={handleBackToList}
                className="p-3.5 bg-gray-50 text-gray-400 hover:bg-gkk-navy hover:text-white rounded-[20px] transition-all border border-gray-100 hover:scale-110 active:scale-95 shadow-sm shrink-0"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-5">
                <div className="p-4 bg-gkk-navy/5 rounded-[22px] text-gkk-navy ring-1 ring-gkk-navy/10 hidden md:block">
                  <Building2 size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-black text-gkk-navy leading-none uppercase tracking-tight mb-2.5">
                    {selectedNominee.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-gray-100 px-3 py-1 rounded-full font-bold text-[9px] text-gray-500 uppercase tracking-widest border border-gray-200/50">
                      ID: {selectedNominee.regId}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-widest ${getStatusColor(selectedNominee.status)}`}>
                      {selectedNominee.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 ml-2">
                      <MapPin size={11} className="text-gkk-gold" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {selectedNominee.region}, PH
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Consolidated Progress Trackers and Actions */}
            <div className="flex flex-col gap-4 items-end">
              <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-2 rounded-[25px] border border-gray-100/50">
                <div className="w-48 bg-white rounded-[20px] p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  {renderProgressBar(selectedNominee, 1)}
                </div>
                {userRole !== 'reu' && (selectedNominee.round2Unlocked || ['admin', 'scd_team_leader', 'evaluator'].includes(userRole || '')) && (
                  <div className="w-48 bg-white rounded-[20px] p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    {renderProgressBar(selectedNominee, 2)}
                  </div>
                )}
                {userRole !== 'reu' && (selectedNominee.round3Unlocked || ['admin', 'scd_team_leader', 'evaluator'].includes(userRole || '')) && (
                  <div className="w-48 bg-white rounded-[20px] p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                    {renderProgressBar(selectedNominee, 3)}
                  </div>
                )}
              </div>

              {(userRole === 'admin' || userRole === 'scd_team_leader') && (
                <div className="flex gap-3 mt-4 w-full justify-end">
                  <button
                    onClick={() => {
                      const newStatus = !selectedNominee.round2Unlocked;
                      onToggleRound2?.(selectedNominee.id, newStatus);
                      const updated = { ...selectedNominee, round2Unlocked: newStatus };
                      setSelectedNominee(updated);
                      setLocalNominees(prev => prev.map(n => n.id === updated.id ? updated : n));
                    }}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-sm text-[10px] tracking-widest uppercase flex items-center gap-2 ${selectedNominee.round2Unlocked ? 'bg-red-50/30 text-red-600 border border-black hover:bg-red-50' : 'bg-gkk-gold text-gkk-navy hover:bg-yellow-400'}`}
                  >
                    {selectedNominee.round2Unlocked ? <Lock size={14} /> : <Unlock size={14} />}
                    {selectedNominee.round2Unlocked ? 'Lock Stage 2' : 'Proceed to Stage 2'}
                  </button>

                  <button
                    onClick={() => {
                      const newStatus = !selectedNominee.round3Unlocked;
                      onToggleRound3?.(selectedNominee.id, newStatus);
                      const updated = { ...selectedNominee, round3Unlocked: newStatus, status: newStatus ? 'in_progress' : selectedNominee.status };
                      setSelectedNominee(updated as any);
                      setLocalNominees(prev => prev.map(n => n.id === updated.id ? (updated as any) : n));
                    }}
                    disabled={!selectedNominee.round2Unlocked}
                    className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-sm text-[10px] tracking-widest uppercase flex items-center gap-2 ${selectedNominee.round3Unlocked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gkk-navy text-white hover:bg-gkk-royalBlue'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedNominee.round3Unlocked ? <Lock size={14} /> : <Unlock size={14} />}
                    {selectedNominee.round3Unlocked ? 'Lock Stage 3' : 'Proceed to Stage 3'}
                  </button>

                  {selectedNominee.status !== 'completed' ? (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Close Application',
                          message: 'Are you sure you want to close this application? This marks the review process as fully completed, locking Stage 2 and 3 for the nominee.',
                          type: 'warning',
                          onConfirm: async () => {
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            try {
                              await updateNominee(selectedNominee.id, {
                                status: 'completed'
                              });

                              const updated = {
                                ...selectedNominee,
                                status: 'completed' as any
                              };
                              setSelectedNominee(updated);
                              setLocalNominees(prev => prev.map(n => n.id === updated.id ? updated : n));
                            } catch (error) {
                              console.error("Failed to close application.", error);
                              alert("Failed to close application.");
                            }
                          }
                        });
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all text-[10px] tracking-widest uppercase shadow-md flex items-center gap-2 ml-2"
                    >
                      <CheckCircle size={14} /> Close Application
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: 'Reopen Application',
                          message: 'Are you sure you want to reopen this application?',
                          type: 'warning',
                          onConfirm: async () => {
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            try {
                              await updateNominee(selectedNominee.id, { status: 'in_progress' });
                              const updated = { ...selectedNominee, status: 'in_progress' as any };
                              setSelectedNominee(updated);
                              setLocalNominees(prev => prev.map(n => n.id === updated.id ? updated : n));
                            } catch (error) {
                              console.error("Failed to reopen application.", error);
                              alert("Failed to reopen application.");
                            }
                          }
                        });
                      }}
                      className="px-6 py-2.5 bg-gray-500 text-white font-bold rounded-2xl hover:bg-gray-600 transition-all text-[10px] tracking-widest uppercase shadow-md flex items-center gap-2 ml-2"
                    >
                      <Unlock size={14} /> Reopen Application
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {(() => {
            const category = selectedNominee.details?.nomineeCategory || 'Private Sector';

            const assembledDocs: any[] = [];
            if (dynamicRequirements) {
              const processStage = (stageReqs: any[], round: number, prefix: string) => {
                stageReqs.forEach((req: any, idx: number) => {
                  const slotId = `${prefix}-${idx}`;
                  const savedDoc = selectedNominee.documents?.find(d => d.slotId === slotId);
                  assembledDocs.push({
                    id: slotId,
                    category: req.category || 'General',
                    label: req.label,
                    fileName: savedDoc ? savedDoc.name : null,
                    status: savedDoc ? 'uploaded' : 'pending',
                    lastUpdated: savedDoc ? (savedDoc.date || '-') : '-',
                    previewUrl: savedDoc ? (savedDoc.url || null) : null,
                    type: savedDoc ? (savedDoc.type || '') : '',
                    round: round,
                    remarks: savedDoc?.remarks || undefined,
                    verdict: savedDoc?.verdict || undefined,
                    remarks_r2: savedDoc?.remarks_r2 || undefined,
                    verdict_r2: savedDoc?.verdict_r2 || undefined,
                    isCorrection: false
                  });

                  // We ONLY create deficiency slots when processing round 1 to prevent duplication,
                  // because we check BOTH the Stage 1 verdict AND the Stage 2 verdict on the `r1-` document.
                  // Stage 2 evaluation actually evaluates the `r1-` document slots. Wait, does it?
                  // Let's check how Stage 2 evaluates. If evaluator evaluates Stage 2, it updates `verdict_r2` on the `r1-` slot?
                  // No, Stage 2 has its own `r2-` slots or it evaluates `r1-`? 
                  // If `dynamicRequirements.stage2` has its own slots (`r2-x`), then `isR2Failed` is correct.

                  // THE REQUIREMENT IS: Stage 3 should ONLY pull items strictly marked as "INCOMPLETE" from Stage 2.
                  // AND it should ONLY show them once Stage 3 is actually unlocked/authorized.
                  // Note: Stage 2 evaluation happens on Stage 1 documents (r1-x).
                  const isR2Failed = (round === 1 || round === 2) && savedDoc?.verdict_r2 === 'fail' && selectedNominee?.round3Unlocked;

                  if (isR2Failed) {
                    // Normalize the deficiency ID to always point back to the r1 origin
                    const originSlotId = slotId.startsWith('r2-') ? slotId.replace('r2-', 'r1-') : slotId;
                    const deficiencySlotId = `r3-deficiency-${originSlotId}`;
                    const currentCorrection = selectedNominee.documents?.find(d => d.slotId === deficiencySlotId);

                    // Prevent pushing the same deficiency slot twice
                    if (!assembledDocs.some(d => d.id === deficiencySlotId)) {
                      assembledDocs.push({
                        id: deficiencySlotId,
                        category: 'Deficiency Correction',
                        label: `[DEFICIENCY] ${req.label}`,
                        fileName: currentCorrection ? currentCorrection.name : null,
                        status: currentCorrection ? 'uploaded' : 'pending',
                        lastUpdated: currentCorrection ? (currentCorrection.date || '-') : '-',
                        previewUrl: currentCorrection ? (currentCorrection.url || null) : null,
                        type: currentCorrection ? (currentCorrection.type || '') : '',
                        round: 3,
                        remarks: currentCorrection?.remarks || undefined,
                        verdict: currentCorrection?.verdict || undefined,
                        isCorrection: true
                      });
                    }
                  }
                });
              };
              if (dynamicRequirements.stage1) processStage(dynamicRequirements.stage1, 1, 'r1');
              if (dynamicRequirements.stage2) processStage(dynamicRequirements.stage2, 2, 'r2');
              if (dynamicRequirements.stage3) processStage(dynamicRequirements.stage3, 3, 'r3');
            }

            const commonProps = {
              nomineeData: selectedNominee,
              documents: assembledDocs,
              stage1Progress: calculateProgress(selectedNominee, 1),
              stage2Progress: calculateProgress(selectedNominee, 2),
              stage3Progress: calculateProgress(selectedNominee, 3),
              handleOpenUpload: () => { }, // Read-only for evaluators
              handlePreview: handlePreview,
              handleStageSubmit: () => { }, // Evaluators don't submit
              handleExportStage: handleExportStage,
              isExporting: isExporting,
              failedDocs: (selectedNominee.documents || []).filter(d => d.verdict === 'fail'),
              stage1Open: !isStage1Folded,
              setStage1Open: (open: boolean) => setIsStage1Folded(!open),
              stage2Open: round2Open, // Tied to the actual state
              setStage2Open: (open: boolean) => setRound2Open(open),
              isReviewMode: true,
              isReadOnly: userRole === 'reu' && selectedNominee.round2Unlocked,
              onVerdict: (slotId: string, verdict: 'pass' | 'fail', round: number = 1) => {
                // If we are looking at round 2, we use round 2
                // But wait, the PortalView doesn't know the round yet.
                // I'll handle the round logic inside the callback by checking slotIds or passing it from DocumentGrid
                handleDocVerdict(slotId, verdict, round);
              },
              onRemarkChange: (slotId: string, remark: string, round: number = 1) => {
                handleDocRemark(slotId, remark, round);
              }
            };

            switch (category) {
              case 'Industry':
              case 'Private Sector':
                return <PrivateSectorPortalView {...commonProps} />;
              case 'Government':
                return <GovernmentPortalView {...commonProps} />;
              case 'Micro Enterprise':
                return <MicroPortalView {...commonProps} />;
              case 'Individual':
                return <IndividualPortalView {...commonProps} />;
              default:
                return <PrivateSectorPortalView {...commonProps} />;
            }
          })()}
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

          {(userRole === 'admin' || userRole === 'scd_team_leader') && (
            <button onClick={() => { setActiveTab('management'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'management' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Zap size={20} />
              <span className="text-sm font-medium">Management</span>
            </button>
          )}

          {(userRole === 'admin' || userRole === 'scd_team_leader') && (
            <button onClick={() => { setActiveTab('staff_directory'); setView('list'); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'staff_directory' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <Briefcase size={20} />
              <span className="text-sm font-medium">Staff Directory</span>
            </button>
          )}
          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Board Tools</p>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <User size={20} /><span className="text-sm font-medium">My Profile</span>
            </button>
            <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><Scale size={20} /><span className="text-sm font-medium">Scoring Matrix</span></button>
            <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"><ShieldAlert size={20} /><span className="text-sm font-medium">Audit Logs</span></button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <span>Validator Portal</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-gkk-navy">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'management' ? 'Management' : activeTab === 'staff_directory' ? 'Staff Directory' : activeTab === 'profile' ? 'My Profile' : 'Queue'}
            </span>
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
                <div className="w-10 h-10 bg-gkk-navy rounded-xl flex items-center justify-center text-white font-bold border-2 border-gkk-gold group-hover:scale-105 transition-transform uppercase">
                  {(staffProfile?.name || 'JD').substring(0, 2)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gkk-navy leading-none">{staffProfile?.name || 'Judge J. Doe'}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{staffProfile?.region || 'National HQ'}</p>
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
                    <button onClick={() => { setActiveTab('profile'); setView('list'); setIsProfileDropdownOpen(false); }} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
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
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {view === 'list' ? (
              activeTab === 'dashboard' ? renderDashboard() :
                activeTab === 'management' ? renderManagement() :
                  activeTab === 'staff_directory' ? renderStaffDirectory() :
                    activeTab === 'profile' ? (
                      staffProfile ? (
                        <StaffProfileEdit
                          userData={staffProfile}
                          onUpdateProfile={async (updates) => {
                            if (!staffProfile?.userId) return false;
                            // Spread staffProfile to ensure role and status are included for the upsert
                            const success = await updateUserProfile(staffProfile.userId, { ...staffProfile, ...updates });
                            if (success) {
                              setStaffProfile(prev => prev ? { ...prev, ...updates } : null);
                            }
                            return success;
                          }}
                          onUnderDev={onUnderDev}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[40px] border border-gray-100 shadow-sm animate-pulse">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-6">
                            <User size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">Loading Profile...</h3>
                          <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tight">Syncing security credentials</p>
                        </div>
                      )
                    ) : renderEntries()
            ) : renderReview()}
          </div>
        </div>
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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gkk-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg p-10 text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gkk-gold via-yellow-400 to-gkk-gold"></div>

            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50/50">
              <CheckCircle size={40} />
            </div>

            <h3 className="text-3xl font-serif font-bold text-gkk-navy uppercase tracking-tight mb-2">Key Issued!</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Access key generated successfully</p>

            <div className="bg-gray-50 rounded-3xl p-8 mb-8 border border-gray-100 relative group">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-3">Your Unique Pass Key</p>
              <h4 className="font-mono text-2xl font-black text-gkk-navy tracking-widest break-all px-4">{issuedKeyId}</h4>

              <button
                onClick={() => copyToClipboard(issuedKeyId)}
                className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 text-gray-400 hover:text-gkk-navy hover:border-gkk-navy transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm"
              >
                <Save size={14} /> Copy to Clipboard
              </button>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-5 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue transition-all uppercase tracking-widest text-xs"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
export default EvaluatorPortal;
