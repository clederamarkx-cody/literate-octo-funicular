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
  remarks?: string;
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
  stage1PassedByReu?: boolean;
  stage2TriggeredByScd?: boolean;
  stage3TriggeredByScd?: boolean;
  stage1Verdict?: 'Pass' | 'Fail';
  stage2Verdict?: 'Pass' | 'Fail';
  stage3Verdict?: 'Pass' | 'Fail';
  details?: {
    nomineeCategory?: 'private' | 'government' | 'micro' | 'individual';
    employees?: string;
    address?: string;
    representative?: string;
    designation?: string;
    email?: string;
    phone?: string;
    safetyOfficer?: string;
  };
}