import React from 'react';
import { Construction, ArrowLeft, Mail, Phone, Clock } from 'lucide-react';

interface UnderDevelopmentProps {
  onBack: () => void;
}

const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gkk-gold/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gkk-navy/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 md:p-16 text-center relative z-10 ring-1 ring-black/5">
        <div className="w-24 h-24 bg-amber-50 text-gkk-gold rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-amber-50/50">
          <Construction size={48} />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
          We are currently refining the technical guidelines and digital resources for the 14<sup>th</sup> GKK Award Cycle. This section will be activated once the National Secretariat finalizes the updated criteria.
        </h1>
        
        <div className="w-16 h-1 bg-gkk-gold mx-auto mb-10 rounded-full opacity-30"></div>
        
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Clock size={20} className="text-gkk-gold mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected</p>
            <p className="text-sm font-bold text-gkk-navy mt-1">Q2 2024</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Mail size={20} className="text-gkk-gold mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support</p>
            <p className="text-sm font-bold text-gkk-navy mt-1">Contact OSHC</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Phone size={20} className="text-gkk-gold mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hotline</p>
            <p className="text-sm font-bold text-gkk-navy mt-1">8929-6036</p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="inline-flex items-center justify-center px-10 py-4 bg-gkk-navy text-white font-bold rounded-2xl hover:bg-gkk-royalBlue transition-all shadow-xl shadow-gkk-navy/20 group"
        >
          <ArrowLeft size={18} className="mr-3 group-hover:-translate-x-1 transition-transform" />
          Return to Portal
        </button>
      </div>
      
      <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] relative z-10">
        14<sup>th</sup> Cycle Official Portal • DOLE-OSHC
      </p>
    </div>
  );
};

export default UnderDevelopment;