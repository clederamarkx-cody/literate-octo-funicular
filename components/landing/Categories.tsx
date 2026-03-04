import React from 'react';
import { Briefcase, User, Building, Landmark, Check } from 'lucide-react';

const categories = [
  {
    title: "Private Sector - Industry Category",
    desc: "Companies that have complied with the Implementing Rules and Regulations of R.A. No. 11058, otherwise known as “An Act Strengthening Compliance with Occupational Safety and Health Standards and Providing Penalties for Violations Thereof”.",
    icon: <Briefcase size={24} />,
    hasCriteria: true
  },
  {
    title: "Public Sector - Government Agency Category",
    desc: "Agencies that have complied with CSC-DOH-DOLE Joint Memorandum Circular No. 1-20, or the “Occupational Safety and Health (OSH) Standards for the Public Sector”.",
    icon: <Landmark size={24} />,
    hasCriteria: true
  },
  {
    title: "Individual Category",
    desc: "Designated OSH personnel of GKK-nominated companies or government agencies who have implemented workplace safety and health initiatives that have significantly improved their organization’s safety and health management system and who have performed duties beyond their immediate OSH responsibilities.",
    icon: <User size={24} />,
    hasCriteria: true
  },
  {
    title: "Microenterprise\nInformal Sector Category",
    desc: "Enterprises with one (1) to nine (9) workers and a capitalization of up to ₱3,000,000, organized as a single proprietorship, cooperative, partnership, or corporation, that have implemented safety and health innovations, improvements, or initiatives in their operations.",
    icon: <Building size={24} />,
    hasCriteria: true
  }
];

interface CategoriesProps {
  onUnderDev?: () => void;
  onViewCriteria?: (category: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ onUnderDev, onViewCriteria }) => {
  return (
    <section id="categories" className="py-24 bg-gkk-navy relative overflow-hidden min-h-screen flex flex-col justify-center snap-start">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 top-20 w-96 h-96 bg-gkk-gold rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gkk-gold text-sm font-bold tracking-widest uppercase">Select Your Track</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2 mb-6">Category of Entries</h2>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-gkk-gold transition-all duration-300 group hover:-translate-y-2">
              <div className="p-6 xl:p-8 flex-1 flex flex-col">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-gkk-gold mb-6 group-hover:bg-gkk-gold group-hover:text-gkk-navy transition-colors shrink-0">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4 shrink-0 leading-snug whitespace-pre-line">{cat.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed flex-1 opacity-90 text-left">
                  {cat.desc}
                </p>
              </div>
              <div className="p-5 xl:p-6 bg-white/5 border-t border-white/5">
                <button
                  onClick={() => cat.hasCriteria && onViewCriteria ? onViewCriteria(cat.title) : onUnderDev?.()}
                  className="block w-full py-2.5 text-center text-sm font-bold text-white border border-white/20 rounded-lg hover:bg-white hover:text-gkk-navy transition-colors"
                >
                  View Criteria
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Categories;