export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export type UserRole = 'nominee' | 'reu' | 'dole' | 'evaluator' | 'scd' | 'admin';

export interface Category {
  title: string;
  description: string;
  icon: string;
}

export interface TimelineEvent {
  phase: string;
  date: string;
  title: string;
  description: string;
}

export interface ApplicantDocument {
  name: string;
  type: string;
  url?: string;
  date?: string;
  slotId?: string;
}

export interface Applicant {
  id: string;
  regId: string;
  name: string;
  industry: string;
  region: string;
  status: 'pending' | 'in_progress' | 'completed';
  verdict?: 'Pass' | 'Fail';
  submittedDate: string;
  documents: ApplicantDocument[];
  round2Unlocked?: boolean;
  round3Unlocked?: boolean;
  details?: {
    employees?: string;
    address?: string;
    representative?: string;
    designation?: string;
    email?: string;
    phone?: string;
    safetyOfficer?: string;
  };
}