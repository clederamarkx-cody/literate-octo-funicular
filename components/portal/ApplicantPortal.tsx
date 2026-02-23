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
import { Applicant, ApplicantDocument } from '../../types';
import { uploadApplicantFile, resolveFileUrl } from '../../services/dbService';
import OnboardingTour, { TourStep } from './OnboardingTour';
import Toast, { ToastType } from '../ui/Toast';
import ApplicantSidebar from './applicant/ApplicantSidebar';
import ApplicantProfileHeader from './applicant/ApplicantProfileHeader';
import StageProgress from './applicant/StageProgress';
import DocumentGrid from './applicant/DocumentGrid';
import UploadModal from './applicant/UploadModal';
import TermsModal from './applicant/TermsModal';

interface ApplicantPortalProps {
  onLogout: () => void;
  onUnderDev: () => void;
  applicantData: Applicant | null;
  onDocumentUpload?: (doc: ApplicantDocument) => void;
  onUpdateApplicant?: (updates: Partial<Applicant>) => void;
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

const ApplicantPortal: React.FC<ApplicantPortalProps> = ({ onLogout, onUnderDev, applicantData, onDocumentUpload, onUpdateApplicant }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry'>('dashboard');
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
    if (applicantData?.id) {
      const tourKey = `gkk_tour_completed_${applicantData.id}`;
      if (!localStorage.getItem(tourKey)) {
        // Add a slight delay to let the UI render first
        setTimeout(() => setIsTourOpen(true), 500);
      }
    }
  }, [applicantData?.id]);

  const handleTourComplete = () => {
    setIsTourOpen(false);
    if (applicantData?.id) {
      localStorage.setItem(`gkk_tour_completed_${applicantData.id}`, 'true');
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
    companyName: applicantData?.name || "Acme Manufacturing Phils.",
    regId: applicantData?.regId || "NOM-2024-8821",
    industry: applicantData?.industry || "Manufacturing",
    employees: applicantData?.details?.employees || "250",
    region: applicantData?.region || "Region IV-A",
    address: applicantData?.details?.address || "Industrial Park, Laguna",
    representative: applicantData?.details?.representative || "Juan Dela Cruz",
    designation: applicantData?.details?.designation || "Safety Manager",
    email: applicantData?.details?.email || "safety@acme.ph",
    phone: applicantData?.details?.phone || "0917-123-4567",
    safetyOfficer: applicantData?.details?.safetyOfficer || "Engr. Maria Clara",
    doleRegNo: "R4A-12345-2020",
    philhealthNo: "00-123456789-0"
  };

  const REQUIREMENTS_MAP: Record<string, { round1: { category: string, label: string }[], round2: { category: string, label: string }[], round3: { category: string, label: string }[] }> = {
    private: {
      round1: [
        { category: 'Reportorial Compliance', label: 'WAIR (Work Accident Report)' },
        { category: 'Reportorial Compliance', label: 'AEDR (Annual Exposure Data)' },
        { category: 'Reportorial Compliance', label: 'AMR (Annual Medical Report)' },
        { category: 'Legal & Administrative', label: 'Rule 1020 Registration' },
        { category: 'Legal & Administrative', label: 'FSIC (Fire Safety)' },
        { category: 'OSH Systems', label: 'Signed OSH Policy' }
      ],
      round2: [
        { category: 'Reportorial Compliance', label: 'Minutes of OSH Committee Meeting' },
        { category: 'Reportorial Compliance', label: 'OSH Training Records' },
        { category: 'Legal & Administrative', label: 'DOLE Clearance / Regional Certification' },
        { category: 'Legal & Administrative', label: 'LGU Business Permit (Current Year)' },
        { category: 'OSH Systems', label: 'HIRAC (Hazard Identification Risk Assessment)' },
        { category: 'OSH Systems', label: 'Emergency Response Preparedness Plan' }
      ],
      round3: [
        { category: 'OSH Systems', label: 'Innovative OSH Programs (Documentation)' },
        { category: 'OSH Systems', label: 'OSH Best Practices (Case Study)' },
        { category: 'OSH Systems', label: 'CSR Safety Initiatives' },
        { category: 'OSH Systems', label: 'Final Board Presentation (Slide Deck)' }
      ]
    },
    government: {
      round1: [
        { category: 'Reportorial Compliance', label: 'CSC Resolution Compliance' },
        { category: 'Reportorial Compliance', label: 'AEDR (Annual Exposure Data)' },
        { category: 'Reportorial Compliance', label: 'AMR (Annual Medical Report)' },
        { category: 'Legal & Administrative', label: 'Agency Profile' },
        { category: 'Legal & Administrative', label: 'FSIC (Fire Safety)' },
        { category: 'OSH Systems', label: 'Signed OSH Policy' }
      ],
      round2: [
        { category: 'Reportorial Compliance', label: 'Minutes of Safety Health Committee Meeting' },
        { category: 'Reportorial Compliance', label: 'OSH Training Records' },
        { category: 'Legal & Administrative', label: 'CSC Clearance' },
        { category: 'OSH Systems', label: 'HIRAC (Hazard Identification Risk Assessment)' },
        { category: 'OSH Systems', label: 'Emergency Preparedness Plan' }
      ],
      round3: [
        { category: 'OSH Systems', label: 'Innovative Public Service OSH Programs' },
        { category: 'OSH Systems', label: 'OSH Best Practices (Case Study)' },
        { category: 'OSH Systems', label: 'Final Board Presentation (Slide Deck)' }
      ]
    },
    micro: {
      round1: [
        { category: 'Reportorial Compliance', label: 'WAIR (Work Accident Report)' },
        { category: 'Legal & Administrative', label: 'Rule 1020 Registration' },
        { category: 'Legal & Administrative', label: 'BMBE Certificate' },
        { category: 'OSH Systems', label: 'Signed OSH Policy' }
      ],
      round2: [
        { category: 'Reportorial Compliance', label: 'Basic OSH Training Certificate (BOSH/COSH)' },
        { category: 'Legal & Administrative', label: 'LGU Business Permit (Current Year)' },
        { category: 'OSH Systems', label: 'Simplified HIRAC' },
        { category: 'OSH Systems', label: 'Emergency Response Plan' }
      ],
      round3: [
        { category: 'OSH Systems', label: 'OSH Implementation Report' },
        { category: 'OSH Systems', label: 'Final Board Presentation (Slide Deck)' }
      ]
    },
    individual: {
      round1: [
        { category: 'Legal & Administrative', label: 'Professional PRC ID / DOLE Accreditation' },
        { category: 'Legal & Administrative', label: 'Resume / Curriculum Vitae' },
        { category: 'Reportorial Compliance', label: 'Certificate of Employment' }
      ],
      round2: [
        { category: 'Reportorial Compliance', label: 'OSH Training Certificates' },
        { category: 'OSH Systems', label: 'Portfolio of OSH Projects' },
        { category: 'Legal & Administrative', label: 'Recommendation Letters' }
      ],
      round3: [
        { category: 'OSH Systems', label: 'Significant OSH Contributions' },
        { category: 'OSH Systems', label: 'Final Panel Interview Slide Deck' }
      ]
    }
  };

  const [documents, setDocuments] = useState<DocumentSlot[]>(() => {
    const currentCategory = applicantData?.details?.nomineeCategory || 'private';
    const activeRequirements = REQUIREMENTS_MAP[currentCategory] || REQUIREMENTS_MAP['private'];
    const initialDocs: DocumentSlot[] = [];

    activeRequirements.round1.forEach((req, idx) => {
      const slotId = `r1-${idx}`;
      const savedDoc = applicantData?.documents?.find((d: any) => d.slotId === slotId);
      initialDocs.push({
        id: slotId,
        category: req.category as any,
        label: req.label,
        fileName: savedDoc ? savedDoc.name : null,
        status: savedDoc ? 'uploaded' : 'pending',
        lastUpdated: savedDoc ? (savedDoc.date || '-') : '-',
        previewUrl: savedDoc ? (savedDoc.url || null) : null,
        type: savedDoc ? (savedDoc.type || '') : '',
        round: 1
      });
    });

    activeRequirements.round2.forEach((req, idx) => {
      const slotId = `r2-${idx}`;
      const savedDoc = applicantData?.documents?.find((d: any) => d.slotId === slotId);
      initialDocs.push({
        id: slotId,
        category: req.category as any,
        label: req.label,
        fileName: savedDoc ? savedDoc.name : null,
        status: savedDoc ? 'uploaded' : 'pending',
        lastUpdated: savedDoc ? (savedDoc.date || '-') : '-',
        previewUrl: savedDoc ? (savedDoc.url || null) : null,
        type: savedDoc ? (savedDoc.type || '') : '',
        round: 2
      });
    });

    activeRequirements.round3.forEach((req, idx) => {
      const slotId = `r3-${idx}`;
      const savedDoc = applicantData?.documents?.find((d: any) => d.slotId === slotId);
      initialDocs.push({
        id: slotId,
        category: req.category as any,
        label: req.label,
        fileName: savedDoc ? savedDoc.name : null,
        status: savedDoc ? 'uploaded' : 'pending',
        lastUpdated: savedDoc ? (savedDoc.date || '-') : '-',
        previewUrl: savedDoc ? (savedDoc.url || null) : null,
        type: savedDoc ? (savedDoc.type || '') : '',
        round: 3
      });
    });

    return initialDocs;
  });

  // Re-sync if applicantData changes after mount
  useEffect(() => {
    if (applicantData?.documents) {
      setDocuments(prev => prev.map(doc => {
        const savedDoc = applicantData.documents.find((d: any) => d.slotId === doc.id);
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
  }, [applicantData?.documents]);

  const docCategories: { id: string, name: string, icon: React.ElementType }[] = [
    { id: 'Reportorial Compliance', name: 'Compliance Reports', icon: FileCheck },
    { id: 'Legal & Administrative', name: 'Legal Docs', icon: Hash },
    { id: 'OSH Systems', name: 'OSH Management', icon: ShieldCheck },
  ];

  const getProgress = (round: number) => {
    const roundDocs = documents.filter(d => d.round === round);
    if (roundDocs.length === 0) return 0;
    const completed = roundDocs.filter(d => d.status === 'uploaded').length;
    return Math.round((completed / roundDocs.length) * 100);
  };

  const stage1Progress = getProgress(1);
  const stage2Progress = getProgress(2);
  const stage3Progress = getProgress(3);

  const handleOpenUpload = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc?.status === 'uploaded') {
      const isLocked = (doc.round === 1 && applicantData?.round2Unlocked) || (doc.round === 2 && applicantData?.round3Unlocked);
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
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !applicantData) return;
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
      const fileUrl = await uploadApplicantFile(
        applicantData.id,
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
      const updatedDoc: ApplicantDocument = {
        name: selectedFile.name,
        type: selectedFile.type,
        url: fileUrl,
        date: today,
        slotId: selectedDocId || undefined,
        remarks: uploadRemarks
      };

      setDocuments(prev => prev.map(doc => doc.id === selectedDocId ? { ...doc, status: 'uploaded', fileName: selectedFile.name, lastUpdated: today, previewUrl: fileUrl, type: selectedFile.type, remarks: uploadRemarks } : doc));

      if (onDocumentUpload) onDocumentUpload(updatedDoc);
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
    if (progress < 100) {
      setToast({ message: `Incomplete Submission. Please upload all required documents for Stage ${stage}.`, type: 'warning' });
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
    if (onUpdateApplicant && targetSubmitStage === 3) {
      onUpdateApplicant({ status: 'completed' });
    }
  };



  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden page-transition">
      <ApplicantSidebar activeTab={activeTab} setActiveTab={setActiveTab} onUnderDev={onUnderDev} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <ApplicantProfileHeader
          activeTab={activeTab}
          profileData={profileData}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          onUnderDev={onUnderDev}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
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
                        applicantData={applicantData}
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
                          <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy/80 bg-gold-50/50">3. A remarks section must be included per file upload to capture feedback or reviewer notes.</p>
                        </div>
                      </div>
                      <button onClick={() => handleStageSubmit(1)} disabled={stage1Progress < 100} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gkk-navy to-gkk-royalBlue text-white font-bold rounded-2xl shadow-xl hover:shadow-gkk-navy/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest shrink-0"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 1</button>
                    </div>
                    <div className="space-y-4">
                      <DocumentGrid round={1} documents={documents} applicantData={applicantData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div id="round-2-lock" className={`rounded-3xl border transition-all duration-300 overflow-hidden ${applicantData?.round2Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <button onClick={() => applicantData?.round2Unlocked && setRound2Open(!round2Open)} disabled={!applicantData?.round2Unlocked} className={`w-full p-8 flex items-center justify-between group transition-colors ${applicantData?.round2Unlocked ? 'cursor-pointer hover:bg-blue-50/20' : 'cursor-not-allowed'}`}>
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${applicantData?.round2Unlocked ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>{applicantData?.round2Unlocked ? <Unlock size={24} /> : <Lock size={24} />}</div>
                          <div className="text-left"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${applicantData?.round2Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>2</div><h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 2 Submission</h4></div>
                            <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{applicantData?.round2Unlocked ? 'Unlocked - Technical Board' : 'Locked'}</p>
                            {applicantData?.round2Unlocked && (
                              <div className="mt-4 space-y-2 max-w-lg">
                                <p className="text-sm border-l-4 border-blue-400 pl-3 py-1 font-bold italic text-blue-800 bg-blue-50">1. This stage focuses on the correctness and consistency of data and validity.</p>
                                <p className="text-sm border-l-4 border-blue-400 pl-3 py-1 font-bold italic text-blue-800 bg-blue-50">2. A remarks section must be included per file upload to capture feedback or reviewer notes.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {applicantData?.round2Unlocked && (
                          <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all"><span>{round2Open ? 'Hide' : 'Review'}</span>{round2Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                        )}
                      </button>
                      <div className={`transition-all duration-700 ease-in-out ${round2Open ? 'max-h-[2000px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        <div className="flex justify-end mb-6">
                          <button onClick={() => handleStageSubmit(2)} disabled={stage2Progress < 100} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 2</button>
                        </div>
                        <DocumentGrid round={2} documents={documents} applicantData={applicantData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                      </div>
                    </div>
                  </div>

                  {/* Stage 3 Selection */}
                  <div className="space-y-4">
                    <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${applicantData?.round3Unlocked ? 'bg-white border-gray-200 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                      <button
                        onClick={() => applicantData?.round3Unlocked && setRound3Open(!round3Open)}
                        disabled={!applicantData?.round3Unlocked}
                        className={`w-full p-8 flex items-center justify-between group transition-colors ${applicantData?.round3Unlocked ? 'cursor-pointer hover:bg-gold-50/20' : 'cursor-not-allowed'}`}
                      >
                        <div className="flex items-center space-x-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${applicantData?.round3Unlocked ? 'bg-gkk-gold text-gkk-navy shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                            {applicantData?.round3Unlocked ? <Unlock size={24} /> : <Lock size={24} />}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${applicantData?.round3Unlocked ? 'bg-gkk-navy text-white' : 'bg-gray-300 text-white'}`}>3</div>
                              <h4 className="font-bold text-gkk-navy text-xl leading-none">Stage 3 Submission</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">
                              {applicantData?.round3Unlocked ? 'Unlocked - National Board' : 'Locked - National Level'}
                            </p>
                            {applicantData?.round3Unlocked && (
                              <div className="mt-4 space-y-2 max-w-lg">
                                <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy bg-gold-50">1. Only upload requirements that are for re-submission.</p>
                                <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy bg-gold-50">2. Only PDF files are accepted as the required file type.</p>
                                <p className="text-sm border-l-4 border-gkk-gold pl-3 py-1 font-bold italic text-gkk-navy bg-gold-50">3. A remarks section must be included per file upload to capture feedback or reviewer notes.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {applicantData?.round3Unlocked && (
                          <div className="flex items-center space-x-3 text-gkk-gold bg-gold-50 px-5 py-2 rounded-2xl font-bold uppercase tracking-widest text-[10px] group-hover:bg-gkk-gold group-hover:text-gkk-navy transition-all">
                            <span>{round3Open ? 'Hide' : 'Review'}</span>
                            {round3Open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        )}
                      </button>
                      <div className={`transition-all duration-700 ease-in-out ${round3Open && applicantData?.round3Unlocked ? 'max-h-[2000px] border-t border-gray-100 p-8 bg-white' : 'max-h-0 overflow-hidden'}`}>
                        <div className="flex justify-end mb-6">
                          <button onClick={() => handleStageSubmit(3)} disabled={stage3Progress < 100} className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gkk-gold to-yellow-500 text-gkk-navy font-bold rounded-2xl shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed group text-xs uppercase tracking-widest"><Send size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />Submit Stage 3</button>
                        </div>
                        <DocumentGrid round={3} documents={documents} applicantData={applicantData} handleOpenUpload={handleOpenUpload} handlePreview={handlePreview} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
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
              ) : <div className="text-center p-20 bg-white rounded-[40px] shadow-2xl max-w-md"><div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200"><FileIcon size={48} /></div><h4 className="text-2xl font-bold text-gkk-navy uppercase tracking-widest">Rendering...</h4></div>}
            </div>
          </div>
        </div>
      )}

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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ApplicantPortal;