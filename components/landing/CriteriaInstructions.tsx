import React, { useState } from 'react';
import {
    ArrowLeft,
    FileText,
    ClipboardList,
    Users,
    Activity,
    ShieldCheck,
    Building2,
    Award,
    CheckCircle2,
    ChevronDown,
    Info
} from 'lucide-react';

interface CriteriaProps {
    onBack: () => void;
}

const criteriaGroups = [
    {
        title: "List of Requirements",
        icon: <ShieldCheck className="w-6 h-6 text-gkk-gold" />,
        items: [
            "1. Endorsement by the DOLE Regional Office",
            "2. Accomplished GKK Application Form",
            "3. Company Safety and Health Policy duly signed by the Authorized Personnel or Owner",
            "4. Full copy of the OSH Program submitted to the DOLE with proof of receipt (as per IRR of R.A. No. 11058)",
            "5. Proof of conduct of mandatory eight-hour OSH Orientation for all employees, contractors, and concessionaires, if applicable (such as, attendance sheets, screenshot of online conduct, pictures, certificates, modules, learning management system reports)",
            {
                text: "6. Designation of Safety Officer (i.e., SO1, SO2, SO3 or SO4) (as per IRR of R.A. No. 11058), signed by the HR Manager or Head of the Company",
                subItems: [
                    "a. Certificate of Completion of applicable mandatory OSH training course",
                    "b. Certificate of Completion of advanced/specialized OSH training courses, as applicable"
                ]
            },
            {
                text: "7. Designation or certification of Occupational Health Personnel (as per IRR of R.A. No. 11058), signed by the HR Manager or Head of the Company",
                subItems: [
                    "a. Certificate of Completion of applicable mandatory OSH training course or First Aid Training certificate for First Aiders"
                ]
            },
            {
                text: "8. DOLE Reportorial Requirements (2024-2025) submitted to the DOLE (as per IRR of R.A. No. 11058) with proof of receipt:",
                subItems: [
                    "a. Annual Work Accident and Illness Exposure Data Report (AEDR)",
                    "b. Annual Medical Report (AMR)",
                    "c. Work Accident/Illness Report (WAIR) up to present",
                    "d. Report of Safety Organization (RSO)",
                    "e. Safety and Health Committee Minutes of Meetings"
                ]
            },
            "9. Signed undertaking that the principal, contractor, and subcontractors have no record of any disabling and/or fatality case (2024-2025)",
            "10. Work Environment Measurement (2024-2025)",
            {
                text: "11. Written policies on:",
                subItems: [
                    "a. DOLE D.O. No. 136-14 (GHS in Chemical Safety Program in the Workplace)",
                    "b. DOLE D.O. No. 53-03 (Drug-Free Workplace)",
                    "c. DOLE D.O. No. 102-10 and Labor Advisory No. 22-23 (HIV and AIDS Prevention and Control)",
                    "d. DOLE D.O. No. 73-05 and Labor Advisory No. 21-23 (Tuberculosis Prevention Workplace Policy and Program)",
                    "e. Labor Advisory No. 05-10 (Hepatitis B Prevention and Control)",
                    "f. DOLE D.O. No. 208-20 and Labor Advisory No. 19-23 (Mental Health Workplace Policies and Programs)",
                    "g. R.A. No. 11215 and Labor Advisory No. 20-23 (Cancer Prevention)",
                    "h. R.A. No. 9211 (Smoke-Free Workplace Policy and Program)",
                    "i. DOLE D.O. No. 252-25 - Annex B.2.7 (Alcohol-Free Workplace Policy and Program)",
                    "j. R.A. No. 7877 and Republic Act No. 11313 (Sexual Harassment Policy and Procedure)",
                    "k. DOLE D.O. No. 252, series of 2025 - Annex B.2.10 (Policy Procedure for Establishing the Committee on Decorum and Investigation)",
                    "l. Labor Advisory No. 01-23 (Food and Waterborne Disease Prevention and Control in the Workplace)",
                    "m. DOLE D.O. No. 56-03 (Rationalizing the Implementation of Family Welfare Program (FWP) in DOLE, for 200 or more workers)"
                ]
            },
            "12. Risk-Based Policy and Program (such as, but not limited to programs on hearing conservation, heat stress, etc.)",
            "13. DOLE-approved Registration of Establishment (per OSHS Rule 1020)",
            "14. List of medical facilities and emergency medicines",
            "15. Copy of signed HIRAC/Risk Assessment conducted (2024-2025)",
            "16. OSH Information, 2024-2025 (such as, but not limited to, communication plan, bulletin boards, information system, etc.)",
            "17. Valid Permits to Operate (boiler, pressure vessel, internal combustion engine, elevators, etc.)",
            {
                text: "18. Electrical Wiring Installation Inspection (Rule 1210)",
                subItems: [
                    "a. For construction: certificate of electrical inspection issued by the LGU"
                ]
            },
            "19. Employees’ Compensation Logbook",
            {
                text: "20. Valid Fire Safety Inspection Certificate (FSIC) from the Bureau of Fire Protection (BFP)",
                subItems: [
                    "a. For construction: fire safety evaluation from the BFP"
                ]
            },
            "21. Fire Evacuation Drill Certificate from the BFP (2024-2025)",
            "22. Corporate Social Responsibility or any community relations/assistance programs (2024-2025)",
            "23. OSH budget (2024-2025)",
            {
                text: "24. Proof of Compliance (not more than a six-month coverage)",
                subItems: [
                    "a. Social Security System (SSS)",
                    "b. PhilHealth",
                    "c. Pag-IBIG"
                ]
            },
            {
                text: "25. Compliance with applicable environmental laws and programs, such as, but not limited to:",
                subItems: [
                    "a. Environmental Compliance Certificate (ECC)",
                    "b. Certificate of No Pending Case/Violation issued by the Department of Environment and Natural Resources-Environmental Management Bureau (DENR-EMB)",
                    "c. Pollution Control Officer (PCO) Certificate",
                    "d. Compliance Monitoring Report CMR)",
                    "e. Self-Monitoring Report (SMR)",
                    "f. Chemical Control Order (CCO) Certificate",
                    "g. Permit to Operate",
                    "h. Philippine Drug Enforcement Agency (PDEA) and Philippine National Police (PNP) licenses"
                ]
            }
        ]
    },
    {
        title: "For Construction (Additional Documents)",
        icon: <Building2 className="w-6 h-6 text-gkk-gold" />,
        items: [
            "26. Valid Philippine Contractors Accreditation Board (PCAB) registration",
            {
                text: "27. Full copy of the Construction Safety and Health Program (CSHP) submitted to DOLE, with proof of receipt by DOLE",
                subItems: [
                    "a. For publicly funded projects, DPWH-approved CSHP"
                ]
            },
            "28. Proof of Project Duration (start to end of project)",
            "29. Valid Construction Heavy Equipment (CHE) Testing",
            "30. For CHE operators, valid Technical Education and Skills Development Authority (TESDA) Certification",
            {
                text: "31. Valid Worker’s Skills Certification for Critical Occupations (welding, scaffolding, rigging, heavy equipment operation, etc.), if applicable",
                subItems: [
                    "a. If TESDA certification is not applicable, skills training and valid authorization issued by the company"
                ]
            },
            "32. Temporary Accommodation and Welfare Facilities"
        ]
    },
    {
        title: "Other Documents",
        icon: <Award className="w-6 h-6 text-gkk-gold" />,
        items: [
            "33. Valid OSH-related certifications/accreditations/awards (e.g., ISO 45001, 14001)",
            "34. Industry-specific compliances with guidelines set by authorities having jurisdiction as specified in the IRR of R.A. No. 11058"
        ]
    }
];

const publicSectorCriteria = [
    {
        title: "List of Requirements",
        icon: <ShieldCheck className="w-6 h-6 text-gkk-gold" />,
        items: [
            "1. Accomplished GKK Application Form",
            "2. Signed undertaking that the principal, contractor and subcontractors have no record of any disabling and/or fatality case (2024-2025)",
            "3. OSH Program duly signed by the Management in compliance with CSC-DOH-DOLE JMC No. 1-20, or the “OSH Standards for the Public Sector”",
            "4. Risk Reduction Management System and Crisis Management Plan and Contingency Program duly signed by the Management in compliance with CSC-DOH-DOLE JMC No. 1-20, or the “OSH Standards for the Public Sector”",
            "5. Public Service Continuity Plan (PSCP)",
            "6. Organization of Safety and Health Committee (2024-2025)",
            {
                text: "7. Written policies on:",
                subItems: [
                    "a. CSC MC 13-17 (Drug-Free Workplace)",
                    "b. CSC MC 11-13 (HIV and AIDS Prevention and Control)",
                    "c. E.O. 187-03 (Tuberculosis Prevention Workplace Policy and Program)",
                    "d. CSC-DOH-DOLE JMC No. 1-20 (Hepatitis B Prevention and Control)",
                    "e. CSC MC 04-20 (Mental Health Workplace Policies and Programs)"
                ]
            },
            "8. Risk-Based Policy and Program (such as, but not limited to, programs on hearing conservation, heat stress, etc.)",
            "9. Indoor Air Quality Management Program (per JMC No. 1-20) or other related programs (e.g., Industrial Hygiene, Work Environment Measurement, Chemical Safety, etc.)",
            "10. Annual Medical Examination (AME) Records (2024-2025)",
            "11. Copies of OSH reports (2024-2025)",
            "12. Official Designation/Memorandum of Safety Personnel",
            "13. OSH Training Plan (proof of OSH capacity building/OSH training programs and certifications of personnel, 2024-2025)",
            "14. Proof of budget in OSH Program (2024-2025)",
            "15. OSH Communication Plan (2024-2025)",
            "16. Valid Fire Safety Inspection Certificate (FSIC) from the BFP",
            "17. Fire Evacuation Drill Certificate from the BFP (2024-2025)",
            {
                text: "18. Proof of Compliance (not more than a six-month coverage)",
                subItems: [
                    "a. Government Service Insurance System (GSIS)",
                    "b. PhilHealth",
                    "c. Pag-IBIG"
                ]
            },
            {
                text: "19. Compliance with applicable environmental laws and programs, such as, but not limited to:",
                subItems: [
                    "a. Environmental Compliance Certificate (ECC)",
                    "b. Solid Waste Management Program",
                    "c. Pollution Control Officer (PCO) Certificate",
                    "d. Compliance Monitoring Report (CMR)",
                    "e. Self-Monitoring Report (SMR)"
                ]
            }
        ]
    },
    {
        title: "Other Documents",
        icon: <Award className="w-6 h-6 text-gkk-gold" />,
        items: [
            "20. Valid OSH-related certifications/accreditations/awards (e.g., ISO 45001, 14001)"
        ]
    }
];

const individualCriteria = [
    {
        title: "List of Requirements",
        icon: <ShieldCheck className="w-6 h-6 text-gkk-gold" />,
        items: [
            "1. Accomplished GKK Application Form",
            {
                text: "2. Certificate of Employment with the following conditions:",
                subItems: [
                    "a. For individuals from the private sector: with indication of duties and responsibilities and designation as OSH Personnel for at least two (2) years in the GK- nominated company",
                    "b. For individuals from the public sector: with proof of designation as OSH Officer for an aggregate of at least two (2) years from the interested government agency"
                ]
            },
            {
                text: "3. Summary and supporting proof of the individual’s major contributions to the company’s programs, specifically:",
                subItems: [
                    "a. Occupational Safety, Health, and Environment (OSHE) Programs – including the impact of these programs on the company’s overall safety and health performance; and",
                    "b. Corporate Social Responsibility (CSR) or other Community relations/assistance programs."
                ]
            },
            "The summary must be duly signed, certified, and endorsed by the company’s HR Department or employer and the authorized union or workers’ representative.",
            "4. Certificate of Completion of applicable mandatory OSH training course",
            "5. Certificate of Completion of advanced/specialized OSH training courses",
            "6. Valid OSH Practitioner/Consultant Accreditation Certificate (if applicable)",
            "7. Valid Professional Regulation Commission (PRC) license (if applicable)"
        ]
    },
    {
        title: "Other Documents",
        icon: <Award className="w-6 h-6 text-gkk-gold" />,
        items: [
            "8. Any OSH-related Awards"
        ]
    }
];

const microenterpriseCriteria = [
    {
        title: "List of Requirements (Such as but not limited to:)",
        icon: <ShieldCheck className="w-6 h-6 text-gkk-gold" />,
        items: [
            {
                text: "1. Materials storage and handling (Imbakan at Paghawak ng mga Materyales)",
                subItems: [
                    "• Transport ways, wheeled device, storage rack, pallet, container and mechanical lifting equipment"
                ]
            },
            {
                text: "2. Machine Safety (Kaligtasan sa Makina at Kagamitan)",
                subItems: [
                    "• Machine guarding, safety mechanical device, label and signage and emergency control"
                ]
            },
            {
                text: "3. Work-stations (Istasyon ng trabaho)",
                subItems: [
                    "• Working height, foot platforms, tools and materials storage, jigs or clamps and working chair or bench"
                ]
            },
            {
                text: "4. Lighting (Tamang Ilaw o Liwanag)",
                subItems: [
                    "• Skylight, ceiling or wall paint, light sources and artificial lighting"
                ]
            },
            {
                text: "5. Control of hazard sources (Pagkontrol ng mga Panganib)",
                subItems: [
                    "• Sources of dust, chemicals, noise or heat, partitions, hazardous chemical storage and label, ventilation and personal protective equipment"
                ]
            },
            {
                text: "6. Premises (Lugar Pagawaan)",
                subItems: [
                    "• Electrical wirings, insulation, fire extinguisher and evacuation exits and plan"
                ]
            },
            {
                text: "7. Welfare facilities (Kagalingan ng mga Manggagawa)",
                subItems: [
                    "• Safe Drinking water, clean toilets and washing facility, resting area and first-aid equipment"
                ]
            },
            {
                text: "8. Work organization (Organisasyon sa Trabaho)",
                subItems: [
                    "• Varying and shifting of work, efficient work flow and operation"
                ]
            },
            {
                text: "9. Environment Protection (Proteksyon sa Kapaligiran sa Trabaho)",
                subItems: [
                    "• Energy conservation program, tree planting, segregation and disposal of chemicals and wastes and practice of recycling"
                ]
            },
            {
                text: "10. Training on OSH (Pagsasanay sa Kaligtasan at Kalusugan sa Trabaho)",
                subItems: [
                    "• Mandatory and other OSH-related training and OSH orientation of workers"
                ]
            },
            "11. Company Initiatives on Productivity Improvement"
        ]
    }
];

const CriteriaInstructions: React.FC<CriteriaProps> = ({ onBack, category = 'Private Sector' }) => {
    const [isAccordionOpen, setIsAccordionOpen] = useState(true);
    const [isFormAccordionOpen, setIsFormAccordionOpen] = useState(false);
    const [isUndertakingAccordionOpen, setIsUndertakingAccordionOpen] = useState(false);

    // Dynamic strings based on category
    const isPublic = category.includes('Public') || category.includes('Government');
    const isIndividual = category.includes('Individual');
    const isMicro = category.includes('Micro');

    const displayTitle = category.includes('Public') || category.includes('Government')
        ? "PUBLIC SECTOR"
        : category.includes('Private')
            ? "PRIVATE SECTOR"
            : category.toUpperCase();
    const accordionTitle = category.includes('Public')
        ? "PUBLIC SECTOR - GOVERNMENT AGENCY CATEGORY"
        : category.includes('Microenterprise')
            ? "MICROENTERPRISE INFORMAL SECTOR CATEGORY"
            : category.includes('Private')
                ? "PRIVATE SECTOR"
                : category.toUpperCase();

    return (
        <div className="min-h-screen bg-gkk-navy pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gkk-gold/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mb-6 group w-fit"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
                        14<sup>th</sup> GKK Awards
                    </h1>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-gkk-gold text-gkk-navy rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                            {displayTitle}
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg max-w-3xl">
                        Please ensure all requirements listed below are compliant and readily available
                        during the application and evaluation process for the 14<sup>th</sup> GKK Awards.
                    </p>

                    <div className="mt-6 flex items-start bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <Info className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-blue-200 font-semibold mb-1">Important Notice</h4>
                            <p className="text-sm text-blue-100/70">
                                These requirements must be complied with by the nominee or applicant. Ensure that all proofs,
                                certificates, and signatures are clearly legible before submission.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Requirements Accordion Structure */}
                <div className="space-y-4">
                    {/* List of Requirements Accordion */}
                    <div
                        className={`bg-white/5 backdrop-blur-md rounded-2xl border transition-colors duration-300 overflow-hidden ${isAccordionOpen ? 'border-gkk-gold/50' : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        <button
                            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-gkk-gold/50 rounded-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${isAccordionOpen ? 'bg-gkk-gold/20' : 'bg-white/5'}`}>
                                    <Award className="w-6 h-6 text-gkk-gold" />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">{accordionTitle}</h2>
                            </div>
                            <ChevronDown
                                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isAccordionOpen ? 'rotate-180 text-gkk-gold' : ''}`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-500 ease-in-out ${isAccordionOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-6 pb-6 pt-2 border-t border-white/5 mx-6">
                                <div className="divide-y divide-white/5">
                                    {(isPublic ? publicSectorCriteria : isIndividual ? individualCriteria : isMicro ? microenterpriseCriteria : criteriaGroups).map((group, groupIdx) => (
                                        <div key={groupIdx} className="py-8 first:pt-4 last:pb-4">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-gkk-gold/10 rounded-lg">
                                                    {React.cloneElement(group.icon as React.ReactElement, { className: "w-4 h-4 text-gkk-gold" })}
                                                </div>
                                                <h3 className="text-lg font-bold text-gkk-gold/90">{group.title}</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {group.items.map((item, itemIdx) => (
                                                    <li key={itemIdx} className="flex gap-3">
                                                        <CheckCircle2 className="w-5 h-5 text-gkk-gold/50 flex-shrink-0 mt-0.5" />
                                                        <div className="text-gray-200 text-[15px] leading-relaxed">
                                                            {typeof item === 'string' ? (
                                                                <span>{item}</span>
                                                            ) : (
                                                                <div>
                                                                    <span className="font-semibold text-white">{item.text}</span>
                                                                    <ul className="mt-3 space-y-2 pl-4 border-l border-white/10 ml-2">
                                                                        {item.subItems.map((subItem, subIdx) => (
                                                                            <li key={subIdx} className="text-gray-400 text-sm flex gap-2">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-gkk-gold/30 mt-1.5 flex-shrink-0" />
                                                                                {subItem}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Form Accordion */}
                    <div
                        className={`bg-white/5 backdrop-blur-md rounded-2xl border transition-colors duration-300 overflow-hidden ${isFormAccordionOpen ? 'border-gkk-gold/50' : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        <button
                            onClick={() => setIsFormAccordionOpen(!isFormAccordionOpen)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-gkk-gold/50 rounded-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${isFormAccordionOpen ? 'bg-gkk-gold/20' : 'bg-white/5'}`}>
                                    <FileText className="w-6 h-6 text-gkk-gold" />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">14<sup>th</sup> GKK Application Form</h2>
                            </div>
                            <ChevronDown
                                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isFormAccordionOpen ? 'rotate-180 text-gkk-gold' : ''}`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-500 ease-in-out ${isFormAccordionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-6 pb-6 pt-2 border-t border-white/5 mx-6">
                                <div className="py-8">
                                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gkk-gold/20 rounded-lg">
                                                <FileText className="w-5 h-5 text-gkk-gold" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">14<sup>th</sup> GKK Application Form</p>
                                                <p className="text-gray-400 text-sm">Official application document</p>
                                            </div>
                                        </div>
                                        <a
                                            href="/forms/14th_GKK_Application_Form.pdf"
                                            download
                                            className="px-4 py-2 bg-gkk-gold/20 hover:bg-gkk-gold/30 text-gkk-gold rounded-lg text-sm font-semibold transition-colors inline-flex items-center"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GKK Undertaking Accordion */}
                    <div
                        className={`bg-white/5 backdrop-blur-md rounded-2xl border transition-colors duration-300 overflow-hidden ${isUndertakingAccordionOpen ? 'border-gkk-gold/50' : 'border-white/10 hover:border-white/20'
                            }`}
                    >
                        <button
                            onClick={() => setIsUndertakingAccordionOpen(!isUndertakingAccordionOpen)}
                            className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-gkk-gold/50 rounded-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl transition-colors ${isUndertakingAccordionOpen ? 'bg-gkk-gold/20' : 'bg-white/5'}`}>
                                    <ShieldCheck className="w-6 h-6 text-gkk-gold" />
                                </div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">GKK Undertaking</h2>
                            </div>
                            <ChevronDown
                                className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isUndertakingAccordionOpen ? 'rotate-180 text-gkk-gold' : ''}`}
                            />
                        </button>

                        <div
                            className={`transition-all duration-500 ease-in-out ${isUndertakingAccordionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="px-6 pb-6 pt-2 border-t border-white/5 mx-6">
                                <div className="py-8">
                                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gkk-gold/20 rounded-lg">
                                                <ShieldCheck className="w-5 h-5 text-gkk-gold" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">GKK Undertaking Form</p>
                                                <p className="text-gray-400 text-sm">Mandatory for all nominees</p>
                                            </div>
                                        </div>
                                        <a
                                            href="https://drive.google.com/drive/folders/1_jgbBW7lOluqDLCg7zTIefDLZpAhzSOl?usp=sharing"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-gkk-gold/20 hover:bg-gkk-gold/30 text-gkk-gold rounded-lg text-sm font-semibold transition-colors inline-flex items-center"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info box */}
                <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-md">
                    <p className="text-gray-400 text-sm">
                        If you have questions regarding these criteria or the submission process, please contact the <br className="hidden sm:block" />
                        <span className="text-gkk-gold font-semibold">GKK Secretariat</span> at occupational safety and health center directly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CriteriaInstructions;
