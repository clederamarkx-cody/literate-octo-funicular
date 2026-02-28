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
import { uploadNomineeFile, resolveFileUrl, updateNominee, getNominee, addNomineeDocument, getRequirementsByCategory } from '../../services/dbService';
import OnboardingTour, { TourStep } from './OnboardingTour';
import Toast, { ToastType } from '../ui/Toast';
import NomineeSidebar from './nominee/NomineeSidebar';
import NomineeProfileHeader from './nominee/NomineeProfileHeader';
import StageProgress from './nominee/StageProgress';
import DocumentGrid from './nominee/DocumentGrid';
import UploadModal from './nominee/UploadModal';
import TermsModal from './nominee/TermsModal';
import NomineeProfileEdit from './nominee/NomineeProfileEdit';
import PrivateSectorPortalView from './nominee/PrivateSectorPortalView';
import GovernmentPortalView from './nominee/GovernmentPortalView';
import MicroPortalView from './nominee/MicroPortalView';
import IndividualPortalView from './nominee/IndividualPortalView';

export const STAGE_1_REQUIREMENTS = [
  { category: 'Requirement', label: '1. Endorsement by the DOLE Regional Office' },
  { category: 'Requirement', label: '2. Accomplished GKK Application Form' },
  { category: 'Requirement', label: '3. Company Safety and Health Policy duly signed by the Authorized Personnel or Owner' },
  { category: 'Requirement', label: '4. Full copy of the OSH Program submitted to the DOLE with proof of receipt' },
  { category: 'Requirement', label: '5. Proof of conduct of mandatory eight-hour OSH Orientation for all employees, contractors, and concessionaires' },
  { category: 'Requirement', label: '6. Designation of Safety Officer (SO1, SO2, SO3 or SO4), signed by the HR Manager or Head of the Company' },
  { category: 'Requirement', label: '7. Safety Officer: Certificate of Completion of applicable mandatory OSH training course' },
  { category: 'Requirement', label: '8. Safety Officer: Certificate of Completion of advanced/specialized OSH training courses, as applicable' },
  { category: 'Requirement', label: '9. Designation or certification of Occupational Health Personnel, signed by the HR Manager or Head of the Company' },
  { category: 'Requirement', label: '10. Occupational Health Personnel: Certificate of Completion of applicable mandatory OSH training course or First Aid Training certificate for First Aiders' },
  { category: 'Requirement', label: '11. Annual Work Accident and Illness Exposure Data Report (AEDR) submitted to DOLE, with proof of receipt (2024-2025)' },
  { category: 'Requirement', label: '12. Annual Medical Report (AMR) submitted to DOLE, with proof of receipt (2024-2025)' },
  { category: 'Requirement', label: '13. Work Accident / Illness Report (WAIR) submitted to DOLE, with proof of receipt (2024-up to present)' },
  { category: 'Requirement', label: '14. Report of Safety Organization (RSO) submitted to DOLE, with proof of receipt (2024-2025)' },
  { category: 'Requirement', label: '15. Safety and Health Committee Minutes of Meetings submitted to DOLE, with proof of receipt (2024-2025)' },
  { category: 'Requirement', label: '16. Signed undertaking that the principal, contractor and subcontractors have no record of any disabling and/or fatality case (2024-2025)' },
  { category: 'Requirement', label: '17. Work Environment Measurement (2024-2025)' },
  { category: 'Requirement', label: '18. Written Policy on DOLE D.O. No. 136-14 (GHS in Chemical Safety Program in the Workplace)' },
  { category: 'Requirement', label: '19. Written Policy on DOLE D.O. No. 53-03 (Drug-Free Workplace)' },
  { category: 'Requirement', label: '20. Written Policy on DOLE D.O. No. 102-10 and Labor Advisory No. 22-23 (HIV and AIDS Prevention and Control)' },
  { category: 'Requirement', label: '21. Written Policy on DOLE D.O. No. 73-05 and Labor Advisory No. 21-23 (Tuberculosis Prevention Workplace Policy and Program)' },
  { category: 'Requirement', label: '22. Written Policy on Labor Advisory No. 05-10 (Hepatitis B Prevention and Control)' },
  { category: 'Requirement', label: '23. Written Policy on DOLE D.O. No. 208-20 and Labor Advisory No. 19-23 (Mental Health Workplace Policies and Programs)' },
  { category: 'Requirement', label: '24. Written Policy on R.A. No. 11215 and Labor Advisory No. 20-23 (Cancer Prevention)' },
  { category: 'Requirement', label: '25. Written Policy on R.A. No. 9211 (Smoke-Free Workplace Policy and Program)' },
  { category: 'Requirement', label: '26. Written Policy on DOLE D.O. No. 252-25 - Annex B.2.7 (Alcohol-Free Workplace Policy and Program)' },
  { category: 'Requirement', label: '27. Written Policy on R.A. No. 7877 and Republic Act No. 11313 (Sexual Harassment Policy and Procedure)' },
  { category: 'Requirement', label: '28. Written Policy on DOLE D.O. No. 252, series of 2025 - Annex B.2.10 (Policy Procedure for Establishing the Committee on Decorum and Investigation)' },
  { category: 'Requirement', label: '29. Written Policy on Labor Advisory No. 01-23 (Food and Waterborne Disease Prevention and Control in the Workplace)' },
  { category: 'Requirement', label: '30. Written Policy on DOLE D.O. No. 56-03 (Rationalizing the Implementation of Family Welfare Program in DOLE, for 200 or more workers)' },
  { category: 'Requirement', label: '31. Risk-based Policy and Program (such as, but not limited to programs on hearing conservation, heat stress, etc.)' },
  { category: 'Requirement', label: '32. DOLE-approved Registration of Establishment (per OSHS Rule 1020)' },
  { category: 'Requirement', label: '33. List of Medical Facilities and Emergency Medicines' },
  { category: 'Requirement', label: '34. Copy of signed HIRAC / Risk Assessment conducted (2024-2025)' },
  { category: 'Requirement', label: '35. OSH Information (such as, but not limited to, communication plan, bulletin boards, information system, etc.) (2024-2025)' },
  { category: 'Requirement', label: '36. Valid Permits to Operate (boiler, pressure vessel, internal combustion engine, elevators, etc.)' },
  { category: 'Requirement', label: '37. Electrical Wiring Installation Inspection (Rule 1210) (For construction: certificate of electrical inspection issued by LGU)' },
  { category: 'Requirement', label: '38. Employees’ Compensation Logbook' },
  { category: 'Requirement', label: '39. Valid Fire Safety Inspection Certificate (FSIC) from Bureau of Fire Protection (BFP) (For construction: fire safety evaluation from BFP)' },
  { category: 'Requirement', label: '40. Fire Evacuation Drill Certificate from BFP (2024-2025)' },
  { category: 'Requirement', label: '41. Corporate Social Responsibility or any Community Relations / Assistance Programs (2024-2025)' },
  { category: 'Requirement', label: '42. OSH Budget (2024-2025)' },
  { category: 'Requirement', label: '43. SSS, Proof of Compliance (not more than 6-month coverage)' },
  { category: 'Requirement', label: '44. PhilHealth, Proof of Compliance (not more than 6-month coverage)' },
  { category: 'Requirement', label: '45. Pag-IBIG, Proof of Compliance (not more than 6-month coverage)' },
  { category: 'Requirement', label: '46. Compliance to applicable environmental laws and programs (ECC, Certificate of No Pending Case/Violation issued by DENR-EMB, PCO Certificate, CMR, SMR, CCO Certificate, Permit to Operate, PDEA and PNP Licenses, etc. – whichever is applicable)' },
  { category: 'Requirement', label: '47. Valid Philippine Contractors Accreditation Board (PCAB) Registration' },
  { category: 'Requirement', label: '48. Full copy of the Construction Safety and Health Program (CSHP) submitted to DOLE, with proof of receipt by DOLE (For publicly funded projects, DPWH-approved CSHP)' },
  { category: 'Requirement', label: '49. Proof of Project Duration (start to end of project)' },
  { category: 'Requirement', label: '50. Valid Construction Heavy Equipment (CHE) Testing' },
  { category: 'Requirement', label: '51. For CHE operators, valid Technical Education and Skills Development Authority (TESDA) Certification' },
  { category: 'Requirement', label: '52. Valid Worker’s Skills Certification for Critical Occupations (welding, scaffolding, rigging, heavy equipment operation, etc.), if applicable (If TESDA certification is not applicable, skills training and valid authorization issued by the company)' },
  { category: 'Requirement', label: '53. Temporary Accommodation and Welfare Facilities' }
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
  remarks?: string;
  verdict?: 'pass' | 'fail';
}

const NomineePortal: React.FC<NomineePortalProps> = ({ onLogout, onUnderDev, nomineeData: nomineeData, onDocumentUpload, onUpdateNominee: onUpdateNominee }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'profile'>('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cancelTokenRef = useRef<{ cancel?: () => void }>({});
  const isCancelledRef = useRef(false);


  // Onboarding Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (nomineeData?.id) {
      const tourKey = `gkk_tour_completed_${nomineeData.id}`;
      if (!localStorage.getItem(tourKey)) {
        // Add a slight delay to let the UI render first
        setTimeout(() => setIsTourOpen(true), 500);
      }

      // Fix 4: Fresh Data on Mount - Re-fetch nomination data from Supabase
      getNominee(nomineeData.id).then((freshData: Nominee | null) => {
        if (freshData && onUpdateNominee) {
          onUpdateNominee(freshData);
        }
      }).catch((err: any) => console.error("Failed to re-fetch fresh nominee data", err));
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

  // Stage Folding State
  const [stage1Open, setStage1Open] = useState(true);
  const [stage2Open, setStage2Open] = useState(true);

  useEffect(() => {
    // Stage 1 is folded by default if Stage 2 or 3 is unlocked
    if (nomineeData?.round2Unlocked || nomineeData?.round3Unlocked) {
      setStage1Open(false);
    }
    // Stage 2 is folded by default if Stage 3 is unlocked
    if (nomineeData?.round3Unlocked) {
      setStage2Open(false);
    }
  }, [nomineeData?.id, nomineeData?.round2Unlocked, nomineeData?.round3Unlocked]);

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

  // Source email from session (users table) — not from the application record
  const sessionEmail = (() => {
    try {
      const session = sessionStorage.getItem('gkk_session');
      return session ? JSON.parse(session).email || "" : "";
    } catch { return ""; }
  })();

  const profileData = {
    details: {
      companyName: nomineeData?.name || nomineeData?.organizationName || "",
      companyAddress: nomineeData?.details?.address || "",
      region: nomineeData?.region || nomineeData?.region || "",
      industry: nomineeData?.details?.industry || nomineeData?.industrySector || "",
      workforceSize: nomineeData?.details?.employees || nomineeData?.workforceSize || "",
      nomineeCategory: nomineeData?.details?.nomineeCategory || 'Industry',
    },
    representative: nomineeData?.focalName || (nomineeData as any).representative || nomineeData?.details?.representative || "",
    email: sessionEmail || nomineeData?.email || "",
    phone: nomineeData?.details?.phone || nomineeData?.focalPhone || "",
    safetyOfficer: nomineeData?.details?.safetyOfficer || "",
    regId: nomineeData?.regId || "",
  };

  const [isLoadingRequirements, setIsLoadingRequirements] = useState(true);
  const [dynamicRequirements, setDynamicRequirements] = useState<any>(null);

  useEffect(() => {
    const fetchReqs = async () => {
      const category = nomineeData?.details?.nomineeCategory || 'Industry';
      const reqs = await getRequirementsByCategory(category);

      // Use dynamic requirements from DB for all stages
      const mergedReqs = {
        ...reqs
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
          round: round,
          remarks: savedDoc?.remarks || undefined,
          verdict: savedDoc?.verdict || undefined
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
            remarks: savedDoc.remarks || '',
            verdict: savedDoc.verdict || undefined
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
      // Strict Lock Logic with Deficiency Exception:
      // 1. Stage 1 is locked if Stage 2 is active, UNLESS Stage 3 is active and document FAILED.
      // 2. Stage 2 is locked if not active OR if Stage 3 is active, UNLESS Stage 3 is active and document FAILED.
      // 3. Stage 3 is locked if not active.
      const isLocked =
        (doc.round === 1 && nomineeData?.round2Unlocked && !(nomineeData?.round3Unlocked && doc.verdict === 'fail')) ||
        (doc.round === 2 && (!nomineeData?.round2Unlocked || (nomineeData?.round3Unlocked && doc.verdict !== 'fail'))) ||
        (doc.round === 3 && !nomineeData?.round3Unlocked);

      if (isLocked) {
        let message = `Stage ${doc.round} is currently locked.`;
        if (nomineeData?.round2Unlocked && doc.round === 1 && !nomineeData?.round3Unlocked) {
          message = "Stage 1 is locked because Stage 2 is now active.";
        } else if (nomineeData?.round3Unlocked && doc.verdict !== 'fail' && doc.round < 3) {
          message = "Only documents marked as ACTION REQUIRED can be updated in Stage 3.";
        }

        setToast({ message, type: 'info' });
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

    // Strict internal policy: PDF only
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setToast({ message: "Strict Policy: Only PDF files are accepted.", type: 'error' });
      return;
    }

    setUploadStatus('idle'); // Changed from 'encrypting' initialization to catch potential skips
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
    setUploadProgress(1); // Show we moved past encryption
    console.log("[UI TRACE] Phase Change: Real Storage Upload Initiated");

    try {
      const fileUrl = await uploadNomineeFile(
        nomineeData.id,
        selectedDocId || 'unknown_slot',
        selectedFile,
        (progress) => {
          // Deep logging in portal as well
          console.log(`[UI TRACE] Upload Progress Hook: ${progress}%`);
          // Start at 5% and head towards 95% during the stream
          const displayProgress = Math.max(5, Math.min(95, progress));
          setUploadProgress(displayProgress);
        },
        cancelTokenRef.current
      );

      if (isCancelledRef.current) return;

      setUploadProgress(100);
      setUploadStatus('success');

      const today = new Date().toISOString();
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
        console.error("Local Storage Upload Failed", e);
        if (!isCancelledRef.current) {
          setUploadStatus('idle');
          // e.message already has the user-friendly string from uploadNomineeFile
          setToast({ message: `Upload failed: ${e.message}`, type: 'error' });
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

  const handleConfirmSubmit = async () => {
    if (!agreedDataPrivacy || !agreedAuthority) {
      setToast({ message: "Consent required. Please accept both Terms and Conditions.", type: 'error' });
      return;
    }
    if (!nomineeData || !targetSubmitStage) return;

    try {
      // Persist the submission status to the database
      const updates: any = { status: 'submitted' };

      // Mark the stage as submitted so evaluators can review
      if (targetSubmitStage === 1) {
        // Stage 1 is submitted and ready for REU evaluation
        updates.status = 'submitted';
      } else if (targetSubmitStage === 2) {
        // Stage 2 submitted
        updates.status = 'under_review';
      } else if (targetSubmitStage === 3) {
        // Stage 3 submitted - final stage
        updates.status = 'under_review';
      }

      await updateNominee(nomineeData.id, updates);

      setToast({ message: `Stage ${targetSubmitStage} records successfully transmitted to the Regional Board.`, type: 'success' });
      setShowTermsModal(false);

      if (onUpdateNominee) {
        onUpdateNominee(updates);
      }
    } catch (error) {
      console.error("Stage submission failed:", error);
      setToast({ message: `Failed to submit Stage ${targetSubmitStage}. Please try again.`, type: 'error' });
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
                {(() => {
                  const failedDocs = documents.filter(d => {
                    const persisted = nomineeData?.documents?.find((nd: any) => nd.slotId === d.id);
                    return persisted?.verdict === 'fail';
                  });
                  const category = nomineeData?.details?.nomineeCategory || 'Private Sector';
                  const props = {
                    nomineeData,
                    documents,
                    stage1Progress,
                    stage2Progress,
                    stage3Progress,
                    handleStageSubmit,
                    handleOpenUpload,
                    handlePreview,
                    failedDocs, // Pass failedDocs here
                    stage1Open,
                    setStage1Open,
                    stage2Open,
                    setStage2Open
                  };

                  switch (category) {
                    case 'Government':
                    case 'Government Agency': // Defensive mapping
                      return <GovernmentPortalView {...props} />;
                    case 'Micro Enterprise':
                      return <MicroPortalView {...props} />;
                    case 'Individual':
                      return <IndividualPortalView {...props} />;
                    case 'Industry':
                    case 'Private Sector': // Support both
                    default:
                      return <PrivateSectorPortalView {...props} />;
                  }
                })()}
              </div>
            ) : activeTab === 'profile' ? (
              <NomineeProfileEdit
                profileData={profileData}
                onUpdateProfile={async (updatedData) => {
                  setToast({ message: "Profile updated successfully.", type: 'success' });
                  if (onUpdateNominee) {
                    onUpdateNominee(updatedData);
                  }
                  await updateNominee(nomineeData!.id, updatedData);
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
            )
            }
          </div >
        </div >
      </main >

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
    </div>
  );
};

export default NomineePortal;
