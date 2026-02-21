import React from 'react';
import { TESTIMONIALS } from '../../constants';
import { Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gkk-navy">Voices of Champions</h2>
          <div className="w-20 h-1 bg-gkk-gold mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 relative">
               <Quote className="absolute top-6 right-6 text-gkk-gold/20 w-10 h-10" />
               <p className="text-gray-600 italic mb-6 leading-relaxed">"{t.quote}"</p>
               <div className="flex items-center">
                  <div className="w-10 h-10 bg-gkk-navy rounded-full flex items-center justify-center text-white font-bold font-serif text-sm">
                      {t.author.charAt(0)}
                  </div>
                  <div className="ml-3">
                      <p className="text-sm font-bold text-gkk-navy">{t.author}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                      <p className="text-xs text-gkk-gold font-semibold">{t.company}</p>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;