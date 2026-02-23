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

// 1. Users
export interface User {
  userId: string; // Maps to Firebase Auth UID / uid
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'completed';
  createdAt: string; // timestamp string
  region?: string;
  nomineeCategory?: 'Industry' | 'Individual' | 'Micro Enterprise' | 'Government';
}

// 2. Access Keys
export interface AccessKey {
  keyId: string;
  userId?: string; // Reference to users.userId
  role: string;
  status: 'issued' | 'activated' | 'revoked' | 'expired' | 'unused';
  issuedAt?: string;
  activatedAt?: string;
  regId: string; // The physical string key
  email?: string;
  industry?: string;
  region?: string;
  name?: string;
}

// 4. Evaluations
export interface Evaluation {
  evaluationId: string;
  applicationId: string; // reference to applications.applicationId
  evaluatorId: string; // reference to users.userId
  role: 'evaluator' | 'reu' | 'scd_team_leader';
  decision: 'Pass' | 'Fail';
  remarks: string;
  visibility: boolean; // true if nominee can see remarks
  evaluatedAt: string; // timestamp string
  status: 'pending' | 'completed' | 'approvedBySCD';
}

// 5. GKK Winners
export interface GKKWinner {
  winnerId: string;
  applicationId?: string; // reference to applications.applicationId
  nomineeId?: string; // reference to users.userId
  category: string;
  year: number;
  title: string;
  remarks: string;
  announcedAt: string; // timestamp string
}

// 6. Requirements
export interface Requirement {
  categoryId: 'industry' | 'microEnterprises' | 'individual' | 'publicSector';
  requiredFiles: string[]; // array of strings: checklist of required attachments
  optionalFiles: string[]; // array of strings: additional documents if applicable
}

// Supporting: Categories
export interface AwardCategory {
  categoryId: string;
  name: string;
  description: string;
}

// Supporting: System Logs
export interface SystemLog {
  logId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

// Supporting: Settings
export interface Setting {
  key: string;
  value: any;
}


// 3. Applications (Nominee extends this fundamentally in current UI)
// Overloading for backwards compatibility with the existing UI expectations
export interface Nominee {
  id: string; // applicationId / userId overlap
  applicationId?: string;
  nomineeId?: string; // reference to users.userId
  regId: string;

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

  // Legacy/UI Fields
  name: string; // maps to organizationName conceptually
  email: string; // maps to focalEmail conceptually
  role: UserRole;
  industry: string; // maps to industrySector conceptually
  region: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending' | 'in_progress' | 'completed';
  verdict?: 'Pass' | 'Fail';
  submittedDate: string; // equivalent to submittedAt
  documents: NomineeDocument[]; // equivalent to attachments
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
    employees?: string; // equivalent to workforceSize
    address?: string; // equivalent to addressObj
    representative?: string; // equivalent to focalName
    designation?: string;
    email?: string;
    phone?: string;
    safetyOfficer?: string; // equivalent to focalName
  };
}