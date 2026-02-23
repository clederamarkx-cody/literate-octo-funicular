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

  const round1Requirements = [
    { category: 'Reportorial Compliance', label: 'WAIR (Work Accident Report)' },
    { category: 'Reportorial Compliance', label: 'AEDR (Annual Exposure Data)' },
    { category: 'Reportorial Compliance', label: 'AMR (Annual Medical Report)' },
    { category: 'Legal & Administrative', label: 'Rule 1020 Registration' },
    { category: 'Legal & Administrative', label: 'FSIC (Fire Safety)' },
    { category: 'OSH Systems', label: 'Signed OSH Policy' }
  ];

  const round2Requirements = [
    { category: 'Reportorial Compliance', label: 'Minutes of OSH Committee Meeting' },
    { category: 'Reportorial Compliance', label: 'OSH Training Records' },
    { category: 'Legal & Administrative', label: 'DOLE Clearance / Regional Certification' },
    { category: 'Legal & Administrative', label: 'LGU Business Permit (Current Year)' },
    { category: 'OSH Systems', label: 'HIRAC (Hazard Identification Risk Assessment)' },
    { category: 'OSH Systems', label: 'Emergency Response Preparedness Plan' }
  ];

  const round3Requirements = [
    { category: 'OSH Systems', label: 'Innovative OSH Programs (Documentation)' },
    { category: 'OSH Systems', label: 'OSH Best Practices (Case Study)' },
    { category: 'OSH Systems', label: 'CSR Safety Initiatives' },
    { category: 'OSH Systems', label: 'Final Board Presentation (Slide Deck)' }
  ];

  const [documents, setDocuments] = useState<DocumentSlot[]>(() => {
    const initialDocs: DocumentSlot[] = [];
    round1Requirements.forEach((req, idx) => {
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
    round2Requirements.forEach((req, idx) => {
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
    round3Requirements.forEach((req, idx) => {
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

  const renderDocumentGrid = (round: number) => (
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
                    {((round === 1 && applicantData?.round2Unlocked) || (round === 2 && applicantData?.round3Unlocked)) ? (
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

  const circumference = 226.2;

  const renderProgressBar = (round: number) => {
    const progress = getProgress(round);
    const label = round === 1 ? 'Technical' : round === 2 ? 'Shortlist' : 'Final Board';
    const colorClass = round === 1 ? 'bg-gkk-gold' : round === 2 ? 'bg-blue-600' : 'bg-gkk-navy';
    const locked = round === 2 ? !applicantData?.round2Unlocked : round === 3 ? !applicantData?.round3Unlocked : false;

    return (
      <div className={`w-full ${locked ? 'opacity-40' : ''}`}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Stage {round}: {label}</span>
          <span className="text-[9px] font-bold text-gkk-navy">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden page-transition">
      {/* Sidebar */}
      <aside className="w-64 bg-gkk-navy text-white flex flex-col flex-shrink-0 border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-gkk-gold to-yellow-200 rounded-lg flex items-center justify-center">
              <span className="text-gkk-navy font-bold text-sm">14<sup>th</sup></span>
            </div>
            <span className="font-serif font-bold tracking-widest text-lg uppercase">Nominee</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Nominee Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('entry')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'entry' ? 'bg-gkk-gold text-gkk-navy font-bold shadow-lg shadow-yellow-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <FileCheck size={20} />
            <span className="text-sm font-medium">Verify Records</span>
          </button>
          <div className="pt-6 mt-6 border-t border-white/5">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">GKK Support</p>
            <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <Download size={20} />
              <span className="text-sm font-medium">Submission Kit</span>
            </button>
            <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
              <ShieldCheck size={20} />
              <span className="text-sm font-medium">OSH Standards</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-40">
          <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Nomination Portal</span>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-gkk-navy">{activeTab === 'dashboard' ? 'Summary' : 'Stage 1 Verification'}</span>
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
                  {profileData.representative.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gkk-navy leading-none">{profileData.representative}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Nominee Lead</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in slide-in-from-top-2 duration-300 overflow-hidden ring-4 ring-black/5">
                  <div className="px-5 py-3 border-b border-gray-50 mb-2 bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nominated via DOLE</p>
                    <p className="text-sm font-bold text-gkk-navy mt-1 truncate">{profileData.email}</p>
                  </div>
                  <div className="px-2 space-y-1">
                    <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
                      <User size={18} className="text-gray-400" />
                      <span className="font-medium">Account Settings</span>
                    </button>
                    <button onClick={onUnderDev} className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gkk-navy rounded-xl transition-colors">
                      <Building2 size={18} className="text-gray-400" />
                      <span className="font-medium">Establishment Info</span>
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
                      <div id="readiness-meter" className="md:w-80 bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 flex flex-col justify-center border border-gray-100 shadow-inner space-y-6">
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Submission Progress</p>
                          <div className="relative w-28 h-28 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                              <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gkk-gold transition-all duration-1000" strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * stage1Progress) / 100} strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-2xl font-bold text-gkk-navy">{stage1Progress}%</span>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-gkk-navy text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Stage 1 Readiness</div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          {renderProgressBar(2)}
                          {renderProgressBar(3)}
                        </div>
                      </div>
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
                    <div className="space-y-4">{renderDocumentGrid(1)}</div>
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
                        {renderDocumentGrid(2)}
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
                        {renderDocumentGrid(3)}
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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gkk-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="p-2 bg-gkk-navy rounded-xl text-white"><Upload size={24} /></div><h3 className="text-xl font-bold text-gkk-navy font-serif uppercase tracking-wider">Secure Upload</h3></div>
              <button onClick={handleCloseUpload} className="p-2 text-gray-400 hover:text-gkk-navy"><X size={24} /></button>
            </div>
            <div className="p-10">
              {uploadStatus === 'success' ? (
                <div className="text-center py-10"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div><h4 className="text-2xl font-bold text-gkk-navy uppercase tracking-widest">Success</h4><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Document Verified</p></div>
              ) : (
                <div className="space-y-8">
                  <div className="relative group border-4 border-dashed border-gray-200 rounded-[35px] p-12 text-center hover:border-gkk-gold transition-all cursor-pointer">
                    <input type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept={documents.find(d => d.id === selectedDocId)?.round === 3 ? ".pdf" : ".pdf,.png,.jpg"} />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 group-hover:text-gkk-gold transition-colors"><Upload size={32} /></div>
                      <p className="text-sm font-bold text-gkk-navy uppercase tracking-widest">{selectedFile ? selectedFile.name : 'Select Artifact'}</p>
                    </div>
                  </div>
                  {uploadStatus === 'idle' && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Selected File</p>
                      <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gkk-navy font-bold">
                        {selectedFile ? selectedFile.name : 'No file selected.'}
                      </div>

                      {selectedFile && (
                        <div className="mt-4 text-left">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Reviewer Remarks (Optional)</label>
                          <textarea
                            value={uploadRemarks}
                            onChange={(e) => setUploadRemarks(e.target.value)}
                            placeholder="Add any notes here regarding this submission..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gkk-navy font-medium focus:outline-none focus:ring-2 focus:ring-gkk-gold/50 resize-none h-24"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {(uploadStatus === 'uploading' || uploadStatus === 'encrypting') && (
                    <div className="space-y-3"><div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest"><span>{uploadStatus === 'encrypting' ? 'Encrypting...' : 'Uploading...'}</span><span>{uploadProgress}%</span></div><div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden"><div className="bg-gkk-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div></div></div>
                  )}
                </div>
              )}
            </div>
            <div className="p-8 bg-gray-50 flex justify-end gap-4">
              {uploadStatus !== 'success' && (
                <>
                  <button onClick={handleCloseUpload} className="px-8 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel</button>
                  <button onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'encrypting'} className="px-10 py-3 bg-gkk-navy text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl disabled:opacity-20">{(uploadStatus === 'uploading' || uploadStatus === 'encrypting') ? '...' : 'Upload'}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gkk-navy/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-2xl text-amber-600"><ShieldAlert size={28} /></div>
                <h3 className="text-xl font-bold text-gkk-navy font-serif uppercase tracking-wider">Terms and Conditions</h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-xl shadow-sm"><X size={24} /></button>
            </div>

            <div className="p-10 overflow-y-auto space-y-8 text-sm text-gray-600 leading-relaxed scrollbar-thin flex-1">
              <p className="font-medium text-base">By uploading documents to this platform, the submitting party — whether an individual, micro-enterprise, industry organization, or government entity — acknowledges and agrees to the following:</p>

              <div className="space-y-6">
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                  <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Authorization to Upload</h5>
                  <p>The submitting party confirms that they are duly authorized to provide the documents and that such submission is within their rights and responsibilities.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                  <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Nature of Documents</h5>
                  <p>The submitting party understands that uploaded documents may contain sensitive, confidential, or proprietary information belonging to themselves, their organization, or the company.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                  <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Accuracy and Authenticity</h5>
                  <p>The submitting party certifies that all documents submitted are authentic, accurate, and final versions, free from unauthorized alterations or falsifications.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                  <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Company Rights</h5>
                  <p>The company reserves the right to review, verify, and reject any documents that do not meet authenticity, compliance, or security standards.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gkk-gold"></div>
                  <h5 className="font-bold text-gkk-navy uppercase tracking-widest text-xs mb-2">Confidential Handling</h5>
                  <p>The company will handle uploaded documents with appropriate safeguards. However, submission implies consent to internal review, processing, and storage in accordance with company policies.</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-gkk-gold/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                  <h5 className="font-bold text-red-600 uppercase tracking-widest text-xs mb-2">Liability</h5>
                  <p className="font-medium text-gray-700">The submitting party accepts full responsibility for the content of the documents they upload. The company is not liable for any misrepresentation, falsification, or unauthorized disclosure originating from the submission.</p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col gap-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
              <div className="space-y-4">
                <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="relative flex items-center shrink-0 mt-0.5">
                    <input type="checkbox" checked={agreedDataPrivacy} onChange={(e) => setAgreedDataPrivacy(e.target.checked)} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-gkk-gold checked:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/20 outline-none transition-all cursor-pointer shadow-inner" />
                    <CheckCircle size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gkk-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold scale-50 peer-checked:scale-100 duration-300" />
                  </div>
                  <span className="text-sm font-bold text-gkk-navy leading-tight mt-1 group-hover:text-gkk-gold transition-colors block">
                    <strong className="block mb-1">Data Privacy Act Compliance</strong>
                    I consent to the collection, processing, and storage of my organization's data strictly for the purposes of the GKK Awards evaluation in accordance with the Data Privacy Act of 2012.
                  </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="relative flex items-center shrink-0 mt-0.5">
                    <input type="checkbox" checked={agreedAuthority} onChange={(e) => setAgreedAuthority(e.target.checked)} className="peer appearance-none w-7 h-7 border-2 border-gray-300 rounded-xl checked:bg-gkk-gold checked:border-gkk-gold focus:ring-4 focus:ring-gkk-gold/20 outline-none transition-all cursor-pointer shadow-inner" />
                    <CheckCircle size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gkk-navy opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity font-bold scale-50 peer-checked:scale-100 duration-300" />
                  </div>
                  <span className="text-sm font-bold text-gkk-navy leading-tight mt-1 group-hover:text-gkk-gold transition-colors block">
                    <strong className="block mb-1">Authority to Submit</strong>
                    I certify that I am duly authorized by my organization to submit these documents and that all information provided is true, correct, and unaltered.
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowTermsModal(false)} className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest bg-white border border-gray-200 hover:bg-gray-100 rounded-2xl transition-all w-40 text-center">Cancel</button>
                <button onClick={handleConfirmSubmit} disabled={!agreedDataPrivacy || !agreedAuthority} className="flex-1 px-8 py-4 bg-gradient-to-r from-gkk-navy to-gkk-royalBlue text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                  <Send size={18} /> Confirm Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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