import { Applicant } from './types';

export const GKK_INFO = `
  The 14th Gawad Kaligtasan at Kalusugan (GKK) is the highest national award for Occupational Safety and Health in the Philippines. 
  Unlike traditional awards, establishments do not apply directly. Instead, the Department of Labor and Employment (DOLE) Regional Offices nominate 
  outstanding organizations based on their consistent compliance with OSH standards, zero-accident records, and exceptional safety performance 
  validated during routine labor inspections and audits.
  
  Once nominated by DOLE, the establishment is invited to the GKK Portal to submit high-level technical evidence for the National Board of Judges.
`;

export const NAV_LINKS = [
  { name: 'Award Cycle', href: '#timeline' },
  { name: 'Categories', href: '#categories' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact Us', href: '#contact' },
];

export const TIMELINE_EVENTS = [
  { phase: "Phase 1", title: "DOLE Selection & Nomination", description: "DOLE Regional Offices identify top OSH performers based on audit records and inspection data. Selected establishments receive an official invitation.", date: "Q1 2024" },
  { phase: "Phase 2", title: "Documentary Submission", description: "Nominated establishments access the portal using their unique invitation code to upload technical evidence and OSH system manuals.", date: "Q2 2024" },
  { phase: "Phase 3", title: "Regional Validation", description: "Regional Selection Committees conduct comprehensive document reviews and onsite technical validations of the nominees.", date: "Q3 2024" },
  { phase: "Phase 4", title: "National Deliberation", description: "The National Board of Judges conducts final scoring and selects the National Winners across all categories.", date: "Q4 2024" },
  { phase: "Phase 5", title: "Gawad Parangal", description: "The Grand Awarding Ceremony honoring the champions of Occupational Safety and Health.", date: "December 2024" }
];

export const BENEFITS = [
  { title: "National Recognition", description: "Receive the highest seal of excellence from the Secretary of Labor, marking your company as a benchmark for safety.", icon: "Award" },
  { title: "Technical Verification", description: "The validation acts as an elite-level technical audit, providing insights into advanced safety management systems.", icon: "TrendingUp" },
  { title: "Vision Zero Leader", description: "Be recognized as a national leader in the Global Vision Zero movement, enhancing your reputation with stakeholders.", icon: "ShieldCheck" }
];

export const TESTIMONIALS = [
  { quote: "Being nominated by DOLE was a surprise and a profound honor. It validated years of silent hard work our safety team put in every day.", author: "Engr. Maria Santos", role: "Safety Manager, Atlas Mining", company: "2022 Presidential Awardee" },
  { quote: "The process is rigorous because it's based on actual performance data already tracked by the government. It's truly an award for those who walk the talk.", author: "John Doe", role: "Proprietor", company: "EcoBuild Solutions" },
  { quote: "The feedback we received during the National Validation helped us scale our OSH programs to international standards.", author: "Dr. Robert Lim", role: "Medical Director", company: "St. Luke's Medical Center" }
];

export const FAQS = [
  { question: "Can our company apply for the GKK Award?", answer: "No, direct applications are not accepted. DOLE Regional Offices nominate establishments that have shown exemplary OSH performance. However, you can express interest to your Regional OSH Center to ensure your safety programs are properly audited." },
  { question: "How will we know if we are nominated?", answer: "Your DOLE Regional Office will send an official invitation letter containing a unique Access Key. You will use this key to activate your account on this portal." },
  { question: "What is the criteria for nomination?", answer: "DOLE looks for consistent compliance with OSH standards, an active Safety Committee, zero-accident records for at least 2 years, and innovative health programs." },
  { question: "Is the validation process different for nominees?", answer: "Yes. Once nominated, the validation is much more technical and deep-dives into your management systems, worker participation, and social accountability." }
];

export const PARTNERS = [
  "Department of Labor and Employment",
  "Occupational Safety and Health Center"
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'nominee_1_new',
    regId: 'NOM-2024-001',
    name: 'Pioneer Builders Inc.',
    industry: 'Construction',
    region: 'NCR',
    status: 'pending',
    submittedDate: 'Oct 10, 2024',
    round2Unlocked: false,
    documents: [
      { name: 'OSH_Policy_Signed.pdf', type: 'application/pdf' },
      { name: 'Annual_Accident_Report_2023.pdf', type: 'application/pdf' }
    ],
    details: {
      employees: '450',
      address: 'Tower 1, Makati CBD',
      representative: 'Carlos Magnaye',
      designation: 'VP of Operations',
      email: 'carlos@pioneer.demo',
      phone: '+63 917 111 2222',
      safetyOfficer: 'Engr. Danica Flores'
    }
  },
  {
    id: 'nominee_2_stage1_pass',
    regId: 'NOM-2024-002',
    name: 'Agri-Tech Solutions Mindanao',
    industry: 'Agriculture',
    region: 'Region XI',
    status: 'in_progress',
    submittedDate: 'Oct 15, 2024',
    round2Unlocked: false, // Waiting for SCD to trigger Stage 2
    stage1PassedByReu: true,
    documents: [
      { name: 'OSH_Policy_Current.pdf', type: 'application/pdf' },
      { name: 'Training_Certificates.zip', type: 'application/zip' }
    ],
    details: {
      employees: '120',
      address: 'Davao Agribusiness Park',
      representative: 'Maria Santos',
      designation: 'General Manager',
      email: 'maria@agritech.demo',
      phone: '+63 918 333 4444',
      safetyOfficer: 'Engr. Roberto Luna'
    }
  },
  {
    id: 'nominee_3_stage2_active',
    regId: 'NOM-2024-003',
    name: 'Oceanic Shipping Corp',
    industry: 'Logistics',
    region: 'Region VII',
    status: 'in_progress',
    submittedDate: 'Nov 01, 2024',
    round2Unlocked: true,
    stage1PassedByReu: true,
    stage2TriggeredByScd: true,
    documents: [
      { name: 'DOLE_Clearance.pdf', type: 'application/pdf' }
    ],
    details: {
      employees: '890',
      address: 'Cebu Port Authority Complex',
      representative: 'Capt. Rizal',
      designation: 'Fleet Commander',
      email: 'rizal@oceanic.demo',
      phone: '+63 919 555 6666',
      safetyOfficer: 'Engr. Sarah Lim'
    }
  },
  {
    id: 'nominee_4_stage3_active',
    regId: 'NOM-2024-004',
    name: 'Peak Energy grid',
    industry: 'Energy',
    region: 'Region III',
    status: 'in_progress',
    submittedDate: 'Nov 15, 2024',
    round2Unlocked: true,
    round3Unlocked: true,
    stage1PassedByReu: true,
    stage2TriggeredByScd: true,
    stage3TriggeredByScd: true,
    documents: [
      { name: 'Risk_Assessment_Summary.pdf', type: 'application/pdf' }
    ],
    details: {
      employees: '300',
      address: 'Industrial Park, Pampanga',
      representative: 'Dr. Emily Chen',
      designation: 'EHS Director',
      email: 'emily@peakenergy.demo',
      phone: '+63 920 777 8888',
      safetyOfficer: 'Engr. Mark Bautista'
    }
  },
  {
    id: 'nominee_5_completed',
    regId: 'NOM-2024-005',
    name: 'Metro Health Alliance',
    industry: 'Healthcare',
    region: 'NCR',
    status: 'completed',
    verdict: 'Pass',
    submittedDate: 'Dec 01, 2024',
    round2Unlocked: true,
    round3Unlocked: true,
    stage1PassedByReu: true,
    stage2TriggeredByScd: true,
    stage3TriggeredByScd: true,
    documents: [
      { name: 'Final_Validation_Report.pdf', type: 'application/pdf' }
    ],
    details: {
      employees: '1500',
      address: 'Medical Center Avenue, QC',
      representative: 'Dr. Alex Reyes',
      designation: 'Chief Medical Officer',
      email: 'alex@metrohealth.demo',
      phone: '+63 921 999 0000',
      safetyOfficer: 'Engr. Bea Cruz'
    }
  },
  {
    // Keeping the completely open test account for the user's direct login testing
    id: 'nominee_open',
    regId: 'NOM-OPEN-STAGES',
    name: 'Universal Safety Innovators (Demo)',
    industry: 'Technology',
    region: 'NCR',
    status: 'in_progress',
    submittedDate: 'Nov 01, 2024',
    round2Unlocked: true,
    round3Unlocked: true,
    stage1PassedByReu: true,
    stage2TriggeredByScd: true,
    stage3TriggeredByScd: true,
    documents: [
      { name: 'OSH_Policy_Signed.pdf', type: 'application/pdf' }
    ],
    details: {
      employees: '120',
      address: 'Cyberpark, BGC, Taguig City',
      representative: 'Juan O. Tech',
      designation: 'EHS Lead',
      email: 'juan.tech@universalsafety.demo',
      phone: '+63 917 000 0000',
      safetyOfficer: 'Engr. Techie'
    }
  }
];

export const INITIAL_HALL_OF_FAME = [
  {
    category: 'Manufacturing',
    company: 'Toyota Motor Philippines Corp.',
    region: 'Region IV-A',
    award: 'Presidential',
    year: '2022',
    sector: 'Institutional',
    achievement: '10 Million Safe Man-Hours without LTI'
  },
  {
    category: 'Construction',
    company: 'Megawide Construction Corporation',
    region: 'NCR',
    award: 'Gold',
    year: '2022',
    sector: 'Institutional',
    achievement: 'Excellence in High-Rise Safety Protocols'
  },
  {
    category: 'Mining',
    company: 'Philex Mining Corporation',
    region: 'CAR',
    award: 'Presidential',
    year: '2020',
    sector: 'Institutional',
    achievement: 'Exemplary Underground Mining Safety Programs'
  },
  {
    category: 'Agriculture',
    company: 'Del Monte Philippines, Inc.',
    region: 'Region X',
    award: 'Silver',
    year: '2020',
    sector: 'Institutional',
    achievement: 'Sustainable OSH Practices in Agribusiness'
  },
  {
    category: 'Training & Consulting',
    company: 'People360 Consulting Corporation',
    region: 'NCR',
    award: 'Gold',
    year: '2022',
    sector: 'Institutional',
    achievement: 'Excellence in Safety Training and Testing Services'
  },
  {
    category: 'Logistics',
    company: 'LBC Express Inc.',
    region: 'NCR',
    award: 'Silver',
    year: '2025',
    sector: 'Institutional',
    achievement: 'Innovative Fleet Safety Management'
  },
  {
    category: 'Energy',
    company: 'Energy Development Corporation',
    region: 'Region VIII',
    award: 'Presidential',
    year: '2024',
    sector: 'Institutional',
    achievement: 'Zero Lost Time Incidents in Geothermal Operations'
  },
  {
    category: 'Healthcare',
    company: 'Makati Medical Center',
    region: 'NCR',
    award: 'Gold',
    year: '2023',
    sector: 'Institutional',
    achievement: 'Advanced Infection Control and Occupational Health'
  },
  {
    category: 'BPO',
    company: 'Teleperformance Philippines',
    region: 'NCR',
    award: 'Silver',
    year: '2021',
    sector: 'Institutional',
    achievement: 'Comprehensive Mental Health and Wellness Programs'
  },
  {
    category: 'Telecommunications',
    company: 'Globe Telecom',
    region: 'NCR',
    award: 'Gold',
    year: '2018',
    sector: 'Institutional',
    achievement: 'Nationwide Safety Culture Integration'
  },
  {
    category: 'Manufacturing',
    company: 'Nestlé Philippines, Inc.',
    region: 'Region IV-A',
    award: 'Presidential',
    year: '2016',
    sector: 'Institutional',
    achievement: 'Decade of Uninterrupted Safe Operations'
  },
  {
    category: 'Utilities',
    company: 'Manila Water Company',
    region: 'NCR',
    award: 'Gold',
    year: '2014',
    sector: 'Institutional',
    achievement: 'Exemplary Water Treatment Facilities Safety'
  },
  {
    category: 'Construction',
    company: 'MDC (Makati Development Corporation)',
    region: 'NCR',
    award: 'Presidential',
    year: '2012',
    sector: 'Institutional',
    achievement: 'Pioneering Safety Standards in Philippine Construction'
  }
];