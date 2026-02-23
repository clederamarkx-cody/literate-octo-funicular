export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export type UserRole = 'nominee' | 'reu' | 'evaluator' | 'scd_team_leader' | 'admin';

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

export interface NomineeDocument {
  name: string;
  type: string;
  url?: string;
  date?: string;
  slotId?: string;
  remarks?: string;
}

export interface Nominee {
  id: string;
  regId: string;
  name: string;
  email: string;
  role: UserRole;
  industry: string;
  region: string;
  status: 'pending' | 'in_progress' | 'completed';
  verdict?: 'Pass' | 'Fail';
  submittedDate: string;
  documents: NomineeDocument[];
  round2Unlocked?: boolean;
  round3Unlocked?: boolean;
  stage1PassedByReu?: boolean;
  stage2TriggeredByScd?: boolean;
  stage3TriggeredByScd?: boolean;
  stage1Verdict?: 'Pass' | 'Fail';
  stage2Verdict?: 'Pass' | 'Fail';
  stage3Verdict?: 'Pass' | 'Fail';
  details?: {
    nomineeCategory?: 'Industry' | 'Individual' | 'Micro Enterprise' | 'Government';
    employees?: string;
    address?: string;
    representative?: string;
    designation?: string;
    email?: string;
    phone?: string;
    safetyOfficer?: string;
  };
}