import React, { useState } from 'react';
import { FAQS } from '../../constants';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gkk-navy">Frequently Asked Questions</h2>
          <p className="mt-2 text-gray-500">Everything you need to know about the nomination process.</p>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-gkk-gold/50">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="font-semibold text-gkk-navy">{faq.question}</span>
                {openIndex === idx ? <Minus className="text-gkk-gold w-5 h-5 flex-shrink-0 ml-4" /> : <Plus className="text-gray-400 w-5 h-5 flex-shrink-0 ml-4" />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default FAQ;