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
  verdict?: 'pass' | 'fail'; // Added for persistent evaluation feedback
}

// 1. Users (Consolidated Staff & Nominees)
export interface User {
  userId: string; // Internal UID
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string; // ISO string
  region?: string;
}

// 2. Access Keys
export interface AccessKey {
  keyId: string; // The physical pass key string
  userId?: string; // If activated
  role: string;
  status: 'issued' | 'activated' | 'revoked' | 'expired';
  issuedAt?: string;
  activatedAt?: string;
  email?: string;
  region?: string;
  name?: string;
  category?: string;
}

// 4. GKK Winners (Hall of Fame)
export interface GKKWinner {
  winnerId: string;
  applicationId?: string;
  nomineeId?: string;
  category: string;
  year: number;
  title: string;
  remarks?: string;
  announcedAt?: string;
}

// 3. Applications (Core Data Model)
export interface Nominee {
  id: string; // applicationId / userId overlapping logic in UI
  applicationId?: string;
  nomineeId?: string;
  regId: string; // The Access Key used

  // Extension Fields
  category?: string;
  title?: string;
  description?: string;
  organizationName?: string;
  industrySector?: string;
  workforceSize?: number;
  focalName?: string;
  focalEmail?: string;
  focalPhone?: string;
  addressObj?: { street: string; city: string; province: string; };

  // Legacy Content
  name: string;
  email: string;
  role: UserRole;
  industry: string;
  region: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending' | 'in_progress' | 'completed';
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