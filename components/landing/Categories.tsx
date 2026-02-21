import React from 'react';
import { Briefcase, User, Building, Landmark, Check } from 'lucide-react';

const categories = [
  {
    title: "Industry",
    subtitle: "Institutional",
    desc: "For large establishments with superior OSH policies.",
    features: ["Zero Accident Record", "Social Accountability", "OSH Policy"],
    icon: <Briefcase size={24} />
  },
  {
    title: "Individual",
    subtitle: "Professional",
    desc: "For Safety Officers demonstrating exemplary leadership.",
    features: ["Safety Officers", "OSH Practitioners", "Safety Consultants"],
    icon: <User size={24} />
  },
  {
    title: "Micro Enterprise",
    subtitle: "Small Business",
    desc: "Small businesses prioritizing worker safety.",
    features: ["< 10 Employees", "Innovative Controls", "Community Impact"],
    icon: <Building size={24} />
  },
  {
    title: "Government",
    subtitle: "Public Sector",
    desc: "Agencies leading by example in safety standards.",
    features: ["Civil Service Compliant", "GAD Integration", "Public Service"],
    icon: <Landmark size={24} />
  }
];

interface CategoriesProps {
  onUnderDev?: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ onUnderDev }) => {
  return (
    <section id="categories" className="py-24 bg-gkk-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
         <div className="absolute -right-20 top-20 w-96 h-96 bg-gkk-gold rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gkk-gold text-sm font-bold tracking-widest uppercase">Select Your Track</span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-2 mb-6">Award Categories</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-gkk-gold transition-all duration-300 group hover:-translate-y-2">
              <div className="p-6 flex-1">
                 <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-gkk-gold mb-4 group-hover:bg-gkk-gold group-hover:text-gkk-navy transition-colors">
                        {cat.icon}
                 </div>
                 <h3 className="text-xl font-serif font-bold text-white mb-1">{cat.title}</h3>
                 <p className="text-gkk-goldLight text-xs font-semibold uppercase tracking-wide mb-4">{cat.subtitle}</p>
                 <div className="space-y-3 mb-6">
                    {cat.features.map((feat, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-300">
                            <Check size={14} className="text-gkk-gold mr-2" />
                            {feat}
                        </div>
                    ))}
                 </div>
              </div>
              <div className="p-4 bg-white/5 border-t border-white/5">
                 <button 
                  onClick={onUnderDev}
                  className="block w-full py-2 text-center text-xs font-bold text-white border border-white/20 rounded-lg hover:bg-white hover:text-gkk-navy transition-colors"
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