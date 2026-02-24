import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Download,
  X,
  Loader2,
  FileIcon,
  Eye,
  Zap,
  ShieldCheck,
  Briefcase,
  Users,
  MapPin,
  Hash,
  HardHat,
  User,
  Building2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Send,
  ArrowLeft
} from 'lucide-react';
import { Nominee, NomineeDocument } from '../../types';
import { uploadNomineeFile, resolveFileUrl, updateNominee, addNomineeDocument, getRequirementsByCategory } from '../../services/dbService';
import OnboardingTour, { TourStep } from './OnboardingTour';
import Toast, { ToastType } from '../ui/Toast';
import NomineeSidebar from './nominee/NomineeSidebar';
import NomineeProfileHeader from './nominee/NomineeProfileHeader';
import StageProgress from './nominee/StageProgress';
import DocumentGrid from './nominee/DocumentGrid';
import UploadModal from './nominee/UploadModal';
import TermsModal from './nominee/TermsModal';
import NomineeProfileEdit from './nominee/NomineeProfileEdit';

export const STAGE_1_REQUIREMENTS = [
  { category: 'Management', label: '1. Endorsement by DOLE Regional Office' },
  { category: 'Management', label: '2. Accomplished GKK Application Form' },
  { category: 'Systems', label: '3. Company Safety and Health Policy (Signed)' },
  { category: 'Systems', label: '4. Occupational Safety and Health Program' },
  { category: 'Training', label: '5. OSH Committee Organization/Minutes (Latest)' },
  { category: 'Compliance', label: '6. DOLE Registration (Rule 1020)' },
  { category: 'Compliance', label: '7. TAV/Joint Delivery Report (Latest)' },
  { category: 'Compliance', label: '8. Certificate of Compliance (Labor Standards)' },
  { category: 'Compliance', label: '9. Certificate of Compliance (OSH Standards)' },
  { category: 'Designation', label: '10. Designation of Safety Officer' },
  { category: 'Designation', label: '11. Designation of OH Personnel (Nurse/First Aider)' },
  { category: 'Training', label: '12. Training Certificates (Safety Officer)' },
  { category: 'Training', label: '13. Training Certificates (First Aid)' },
  { category: 'Systems', label: '14. Emergency Preparedness & Response Plan' },
  { category: 'Systems', label: '15. Fire Safety Inspection Certificate (FSIC)' },
  { category: 'Systems', label: '16. Annual Medical Report (Latest)' },
  { category: 'Systems', label: '17. Annual Work Accident/Illness Report (WAIR)' },
  { category: 'Systems', label: '18. Minutes of OSH Committee Meetings (Full Year)' },
  { category: 'Systems', label: '19. OSH Promotion & Enhancement Activities' },
  { category: 'Systems', label: '20. PPE Issuance Records' },
  { category: 'Systems', label: '21. OSH Training/Orientation for Workers' },
  { category: 'Systems', label: '22. OSH Rules & Regulation Handbook' },
  { category: 'Health', label: '23. Drug-Free Workplace Policy & Program' },
  { category: 'Health', label: '24. HIV/AIDS Workplace Policy & Program' },
  { category: 'Health', label: '25. Tuberculosis Policy & Program' },
  { category: 'Health', label: '26. Hepatitis B Policy & Program' },
  { category: 'Health', label: '27. Mental Health Policy & Program' },
  { category: 'Systems', label: '28. Work Equipment/Machine Guarding' },
  { category: 'Systems', label: '29. Material Safety Data Sheets (MSDS)' },
  { category: 'Systems', label: '30. Waste Management System' },
  { category: 'Systems', label: '31. OSH Innovative Programs' },
  { category: 'Construction', label: '32. CSHP (For Construction Projects)' },
  { category: 'Excellence', label: '33. CSR Programs Related to Safety' },
  { category: 'Management', label: '34. Social Accountability Records' },
  { category: 'General', label: '35. Additional Documents (Requested)' }
];
interface NomineePortalProps {
  onLogout: () => void;
  onUnderDev: () => void;
  nomineeData: Nominee | null;
  onDocumentUpload?: (doc: NomineeDocument) => void;
  onUpdateNominee?: (updates: Partial<Nominee>) => void;
}

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
}

const NomineePortal: React.FC<NomineePortalProps> = ({ onLogout, onUnderDev, nomineeData: nomineeData, onDocumentUpload, onUpdateNominee: onUpdateNominee }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'profile'>('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cancelTokenRef = useRef<{ cancel?: () => void }>({});
  const isCancelledRef = useRef(false);

  // Accordion State
  const [round2Open, setRound2Open] = useState(false);
  const [round3Open, setRound3Open] = useState(false);

  // Onboarding Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (nomineeData?.id) {
      const tourKey = `gkk_tour_completed_${nomineeData.id}`;
      if (!localStorage.getItem(tourKey)) {
        // Add a slight delay to let the UI render first
        setTimeout(() => setIsTourOpen(true), 500);
      }
    }
  }, [nomineeData?.id]);

  const handleTourComplete = () => {
    setIsTourOpen(false);
    if (nomineeData?.id) {
      localStorage.setItem(`gkk_tour_completed_${nomineeData.id}`, 'true');
    }
  };

  const tourSteps: TourStep[] = [
    {
      targetId: null,
      title: <>Welcome to the 14<sup>th</sup> GKK Awards</>,
      content: "This is your official Nominee Portal. We'll guide you through a quick tour of your dashboard so you know exactly how to secure your nomination."
    },
    {
      targetId: "readiness-meter",
      title: "Track Your Readiness",
      content: "This meter tracks your progress towards completing the Technical Verification. You need to hit 100% to proceed.",
      placement: "bottom"
    },
    {
      targetId: "documents-section",
      title: "Stage 1 Submission",
      content: "Upload your mandatory Compliance and Legal reports here. Once Stage 2 is triggered, these will be locked and sent to the Regional Board.",
      placement: "top"
    },
    {
      targetId: "round-2-lock",
      title: "Stage 2 Submission",
      content: "This section automatically unlocks once the Technical Board fully approves your Stage 1 documents.",
      placement: "top"
    }
  ];

  // Consent & Validation
  const [agreedDataPrivacy, setAgreedDataPrivacy] = useState(false);
  const [agreedAuthority, setAgreedAuthority] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [targetSubmitStage, setTargetSubmitStage] = useState<number | null>(null);

  // Preview State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string, url: string | null, type: string } | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'encrypting' | 'uploading' | 'success'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadRemarks, setUploadRemarks] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileData = {
    companyName: nomineeData?.name || "Acme Manufacturing Phils.",
    regId: nomineeData?.regId || "NOM-2024-8821",
    industry: nomineeData?.industry || "Manufacturing",
    employees: nomineeData?.details?.employees || "250",
    region: nomineeData?.region || "Region IV-A",
    address: nomineeData?.details?.address || "Industrial Park, Laguna",
    representative: nomineeData?.details?.representative || "Juan Dela Cruz",
    designation: nomineeData?.details?.designation || "Safety Manager",
    email: nomineeData?.details?.email || "safety@acme.ph",
    phone: nomineeData?.details?.phone || "0917-123-4567",
    safetyOfficer: nomineeData?.details?.safetyOfficer || "Engr. Maria Clara",
    doleRegNo: "R4A-12345-2020",
    philhealthNo: "00-123456789-0"
  };

  const [isLoadingRequirements, setIsLoadingRequirements] = useState(true);
  const [dynamicRequirements, setDynamicRequirements] = useState<any>(null);

  useEffect(() => {
    const fetchReqs = async () => {
      const category = nomineeData?.details?.nomineeCategory || 'Industry';
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
  }, [nomineeData?.details?.nomineeCategory]);

  const [documents, setDocuments] = useState<DocumentSlot[]>([]);

  useEffect(() => {
    if (!dynamicRequirements) return;

    const initialDocs: DocumentSlot[] = [];

    const processStage = (stageReqs: any[], round: number, prefix: string) => {
      stageReqs.forEach((req, idx) => {
        const slotId = `${prefix}-${idx}`;
        const savedDoc = nomineeData?.documents?.find((d: any) => d.slotId === slotId);
        initialDocs.push({
          id: slotId,
          category: (req.category || 'General') as any,
          label: req.label,
          fileName: savedDoc ? savedDoc.name : null,
          status: savedDoc ? 'uploaded' : 'pending',
          lastUpdated: savedDoc ? (savedDoc.date || '-') : '-',
          previewUrl: savedDoc ? (savedDoc.url || null) : null,
          type: savedDoc ? (savedDoc.type || '') : '',
          round: round
        });
      });
    };

    if (dynamicRequirements.stage1) processStage(dynamicRequirements.stage1, 1, 'r1');
    if (dynamicRequirements.stage2) processStage(dynamicRequirements.stage2, 2, 'r2');
    if (dynamicRequirements.stage3) processStage(dynamicRequirements.stage3, 3, 'r3');

    setDocuments(initialDocs);
  }, [dynamicRequirements, nomineeData?.id]);

  // Re-sync if nomineeData changes after mount
  useEffect(() => {
    if (nomineeData?.documents) {
      setDocuments(prev => prev.map(doc => {
        const savedDoc = nomineeData.documents.find((d: any) => d.slotId === doc.id);
        if (savedDoc) {
          return {
            ...doc,
            status: 'uploaded',
            fileName: savedDoc.name,
            lastUpdated: savedDoc.date || '-',
            previewUrl: savedDoc.url || null,
            type: savedDoc.type || '',
            remarks: savedDoc.remarks || ''
          };
        }
        return doc;
      }));
    }
  }, [nomineeData?.documents]);

  const docCategories: { id: string, name: string, icon: React.ElementType }[] = [
    { id: 'Reportorial Compliance', name: 'Compliance Reports', icon: FileCheck },
    { id: 'Legal & Administrative', name: 'Legal Docs', icon: Hash },
    { id: 'OSH Systems', name: 'OSH Management', icon: ShieldCheck },
  ];

  const getProgress = (round: number) => {
    if (!dynamicRequirements) return 0;
    const stageKey = round === 1 ? 'stage1' : round === 2 ? 'stage2' : 'stage3';
    const stageReqs = dynamicRequirements[stageKey] || [];
    if (stageReqs.length === 0) return 0;

    const roundDocs = documents.filter(d => d.round === round);
    const completed = roundDocs.filter(d => d.status === 'uploaded').length;
    return Math.round((completed / stageReqs.length) * 100);
  };

  const stage1Progress = getProgress(1);
  const stage2Progress = getProgress(2);
  const stage3Progress = getProgress(3);

  const handleOpenUpload = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc?.status === 'uploaded') {
      const isLocked = (doc.round === 1 && nomineeData?.round2Unlocked) || (doc.round === 2 && nomineeData?.round3Unlocked);
      if (isLocked) {
        setToast({ message: `Stage ${doc.round} is now locked for board evaluation.`, type: 'info' });
        return;
      }
    }
    isCancelledRef.current = false;
    cancelTokenRef.current = {};
    setSelectedDocId(id);
    setUploadStatus('idle');
    setUploadProgress(0);
    setSelectedFile(null);
    setUploadRemarks('');
    setIsUploadModalOpen(true);
  };

  const handleCloseUpload = () => {
    isCancelledRef.current = true;
    if (cancelTokenRef.current.cancel) {
      cancelTokenRef.current.cancel();
    }
    setUploadStatus('idle');
    setUploadProgress(0);
    setIsUploadModalOpen(false);
    setSelectedDocId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setToast({ message: "Only PDF files are accepted. Please select a valid document.", type: 'error' });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !nomineeData) return;
    setUploadStatus('encrypting');
    setUploadProgress(0);
    isCancelledRef.current = false;
    cancelTokenRef.current = {};

    // Simulate encryption before uploading
    for (let i = 0; i <= 100; i += 5) {
      if (isCancelledRef.current) return;
      await new Promise(res => setTimeout(res, 50));
      setUploadProgress(i);
    }
    if (isCancelledRef.current) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      setUploadProgress(1); // Give an initial tiny boost so it's not sitting at 0%
      const fileUrl = await uploadNomineeFile(
        nomineeData.id,
        selectedDocId || 'unknown_slot',
        selectedFile,
        (progress) => {
          // Normalize to [10, 99] range during the upload phase so it never resets to 0
          const displayProgress = Math.max(10, Math.min(99, progress));
          setUploadProgress(displayProgress);
        },
        cancelTokenRef.current
      );

      if (isCancelledRef.current) return;

      setUploadProgress(100);
      setUploadStatus('success');

      const today = new Date().toLocaleString();
      const updatedDoc: NomineeDocument = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: fileUrl,
        date: today,
        slotId: selectedDocId || undefined,
        remarks: uploadRemarks
      };

      setDocuments(prev => prev.map(doc => doc.id === selectedDocId ? { ...doc, status: 'uploaded', fileName: selectedFile.name, lastUpdated: today, previewUrl: fileUrl, type: selectedFile.type, remarks: uploadRemarks } : doc));

      await addNomineeDocument(nomineeData.id, updatedDoc);
      setTimeout(() => handleCloseUpload(), 1500);
    } catch (e: any) {
      if (e.message !== "Upload cancelled by user") {
        console.error("Firebase Storage Upload Failed", e);
        if (!isCancelledRef.current) {
          setUploadStatus('idle');
          setToast({ message: `Upload failed: ${e.code || e.message || 'Unknown error'}`, type: 'error' });
        }
      }
    }
  };

  const handlePreview = async (doc: any) => {
    setIsResolvingUrl(true);
    setPreviewDoc({ name: doc.label, url: null, type: doc.type });
    setPreviewModalOpen(true);

    try {
      const resolvedUrl = await resolveFileUrl(doc.previewUrl);
      setPreviewDoc({ name: doc.label, url: resolvedUrl, type: doc.type });
    } catch (e) {
      console.error("Failed to load document", e);
      alert("Failed to decrypt and load the document.");
      setPreviewModalOpen(false);
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleStageSubmit = (stage: number) => {
    const progress = getProgress(stage);
    if (progress === 0) {
      setToast({ message: `Incomplete Submission. Please upload at least one required document for Stage ${stage}.`, type: 'warning' });
      return;
    }
    setTargetSubmitStage(stage);
    setAgreedDataPrivacy(false);
    setAgreedAuthority(false);
    setShowTermsModal(true);
  };

  const handleConfirmSubmit = () => {
    if (!agreedDataPrivacy || !agreedAuthority) {
      setToast({ message: "Consent required. Please accept both Terms and Conditions.", type: 'error' });
      return;
    }
    setToast({ message: `Stage ${targetSubmitStage} records successfully transmitted.`, type: 'success' });
    setShowTermsModal(false);
    if (onUpdateNominee && targetSubmitStage === 3) {
      onUpdateNominee({ status: 'completed' });
    }
  };



  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden page-transition">
      <NomineeSidebar activeTab={activeTab} setActiveTab={setActiveTab} onUnderDev={onUnderDev} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <NomineeProfileHeader
          activeTab={activeTab}
          profileData={profileData}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          onUnderDev={onUnderDev}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {activeTab === 'dashboard' ? (
              <div className="animate-in fade-in duration-500 space-y-8">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-2 bg-gkk-gold h-full group-hover:w-3 transition-all"></div>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-10">
                      <div className="flex-1 space-y-8">
                        <div className="flex items-center space-x-5">
                          <div className="p-4 bg-gkk-navy/5 rounded-3xl text-gkk-navy ring-1 ring-gkk-navy/10 transition-colors">
                            <Building2 size={36} />
                          </div>
                          <div>
                            <h2 className="text-3xl font-serif font-bold text-gkk-navy leading-tight">{profileData.companyName}</h2>
                            <p className="text-gray-500 flex items-center gap-2 mt-2 font-medium"><MapPin size={14} className="text-gkk-gold" /> {profileData.address}, {profileData.region}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Industry Sector</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Briefcase size={16} className="text-gkk-gold" /> {profileData.industry}</div></div>
                          <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Workforce Size</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><Users size={16} className="text-gkk-gold" /> {profileData.employees} Pax</div></div>
                          <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Nomination ID</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy font-mono"><Hash size={16} className="text-gkk-gold" /> {profileData.regId}</div></div>
                          <div className="space-y-2"><span className="text-[10px] font-bold text-gray-400 uppercase block">Safety Focal</span><div className="flex items-center gap-2 text-sm font-bold text-gkk-navy"><HardHat size={16} className="text-gkk-gold" /> {profileData.safetyOfficer}</div></div>
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

                <div id="documents-section" className="space-y-8">
                  <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-gkk-navy uppercase tracking-widest">Stage 1</h3>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy/80 bg-gold-50/50">1. Each specific requirement must be uploaded as a single PDF file.</p>
                          <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy/80 bg-gold-50/50">2. This stage focuses on the completeness of the submissions.</p>
                        </div>
                      </div>
                      <button onClick={() => handleStageSubmit(1)} disabled={stage1Progress === 0} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gkk-navy to-gkk-royalBlue text-white font-bold rounded-2xl shadow-xl hover:shadow-gkk-navy/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest shrink-0"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 1</button>
                    </div>
                    <div className="space-y-4">
                      <DocumentGrid round={1} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div id="round-2-lock" className={`rounded-3xl border transition-all duration-300 overflow-hidden ${nomineeData?.round2Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <button onClick={() => nomineeData?.round2Unlocked && setRound2Open(!round2Open)} disabled={!nomineeData?.round2Unlocked} className={`w-full p-8 flex items-center justify-between group transition-colors ${nomineeData?.round2Unlocked ? 'cursor-pointer hover:bg-blue-50/20' : 'cursor-not-allowed'}`}>
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round2Unlocked ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{nomineeData?.round2Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                          <div className="text-left"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round2Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>2</div><h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 2 Submission</h4></div>
                            <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{nomineeData?.round2Unlocked ? 'Unlocked - Technical Board' : 'Locked'}</p>
                            {nomineeData?.round2Unlocked && (
                              <div className="mt-4 space-y-2 max-w-lg">
                                <p className="text-sm border-l-4 border-blue-400 pl-3 py-1 font-bold italic text-blue-800 bg-blue-50">1. This stage focuses on the correctness and consistency of data and validity.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {nomineeData?.round2Unlocked && (
                          <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all"><span>{round2Open ? 'Hide' : 'Review'}</span>{round2Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        )}
                      </button>
                      <div className={`transition-all duration-700 ease-in-out ${round2Open ? 'max-h-[2000px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        <div className="flex justify-end mb-6">
                          <button onClick={() => handleStageSubmit(2)} disabled={stage2Progress === 0} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 2</button>
                        </div>
                        <DocumentGrid round={2} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                      </div>
                    </div>
                  </div>

                  {/* Stage 3 Selection */}
                  <div className="space-y-4">
                    <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${nomineeData?.round3Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <button
                        onClick={() => nomineeData?.round3Unlocked && setRound3Open(!round3Open)}
                        disabled={!nomineeData?.round3Unlocked}
                        className={`w-full p-8 flex items-center justify-between group transition-colors ${nomineeData?.round3Unlocked ? 'cursor-pointer hover:bg-gold-50/20' : 'cursor-not-allowed'}`}
                      >
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${nomineeData?.round3Unlocked ? 'bg-gkk-gold text-gkk-navy shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                            {nomineeData?.round3Unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${nomineeData?.round3Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>3</div>
                              <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 3 Submission</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">
                              {nomineeData?.round3Unlocked ? 'Unlocked - National Board' : 'Locked - National Level'}
                            </p>
                            {nomineeData?.round3Unlocked && (
                              <div className="mt-4 space-y-2 max-w-lg">
                                <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy bg-gold-50">1. Requirements for re-submission must be uploaded as a single PDF file.</p>
                                <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy bg-gold-50">2. Only PDF files are accepted as the required file type.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {nomineeData?.round3Unlocked && (
                          <div className="flex items-center space-x-3 text-gkk-gold bg-gold-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-gkk-gold group-hover:text-gkk-navy transition-all">
                            <span>{round3Open ? 'Hide' : 'Review'}</span>
                            {round3Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        )}
                      </button>
                      <div className={`transition-all duration-700 ease-in-out ${round3Open && nomineeData?.round3Unlocked ? 'max-h-[2000px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        <div className="flex justify-end mb-6">
                          <button onClick={() => handleStageSubmit(3)} disabled={stage3Progress === 0} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gkk-gold to-yellow-500 text-gkk-navy font-bold rounded-2xl shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 3</button>
                        </div>
                        <DocumentGrid round={3} documents={documents} nomineeData={nomineeData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'profile' ? (
              <NomineeProfileEdit
                profileData={profileData}
                onUpdateProfile={async (updatedData) => {
                  setToast({ message: "Profile updated successfully.", type: 'success' });
                  if (onUpdateNominee) {
                    onUpdateNominee(updatedData);
                  }
                  await updateNominee(nomineeData.id, updatedData);
                }}
                onUnderDev={onUnderDev}
              />
            ) : (
              <div className="text-center p-20 bg-white rounded-3xl shadow-xl border border-gray-200 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300"><Building2 size={48} /></div>
                <h3 className="text-3xl font-serif font-bold text-gkk-navy uppercase">Profile Verified</h3>
                <p className="text-gray-400 font-medium">Organization metadata is synchronized with Regional DOLE records.</p>
                <button onClick={() => setActiveTab('dashboard')} className="inline-flex items-center gap-2 text-gkk-gold font-bold hover:text-gkk-navy transition-colors"><ArrowLeft size={16} /> Return to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal
        isUploadModalOpen={isUploadModalOpen}
        handleCloseUpload={handleCloseUpload}
        uploadStatus={uploadStatus}
        documents={documents}
        selectedDocId={selectedDocId}
        handleFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        uploadRemarks={uploadRemarks}
        setUploadRemarks={setUploadRemarks}
        uploadProgress={uploadProgress}
        handleUpload={handleUpload}
      />

      {/* Preview Modal */}
      {
        previewModalOpen && previewDoc && (
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
                ) : <div className="text-center p-20 bg-white rounded-[40px] shadow-2xl max-w-md"><div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200"><FileIcon size={48} /></div><h4 className="text-2xl font-bold text-gkk-navy uppercase tracking-widest">Rendering...</h4></div>}
              </div>
            </div>
          </div>
        )
      }

      <TermsModal
        showTermsModal={showTermsModal}
        setShowTermsModal={setShowTermsModal}
        agreedDataPrivacy={agreedDataPrivacy}
        setAgreedDataPrivacy={setAgreedDataPrivacy}
        agreedAuthority={agreedAuthority}
        setAgreedAuthority={setAgreedAuthority}
        handleConfirmSubmit={handleConfirmSubmit}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isTourOpen}
        steps={tourSteps}
        onComplete={handleTourComplete}
        onClose={handleTourComplete}
      />

      {/* Toast Notification */}
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </div >
  );
};

export default NomineePortal;