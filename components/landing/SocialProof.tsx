import React from 'react';
import { PARTNERS } from '../../constants';

const SocialProof: React.FC = () => {
  return (
    <section className="bg-gkk-navy border-y border-white/5 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gkk-gold/60 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Endorsed by National Safety Bodies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           {PARTNERS.map((partner, idx) => (
               <div key={idx} className="text-white font-serif font-bold text-lg md:text-xl text-center">
                   {partner}
               </div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;