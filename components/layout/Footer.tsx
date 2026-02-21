import React from 'react';
import { Facebook, Globe, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onUnderDev?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onUnderDev }) => {
  return (
    <footer className="bg-gkk-navy border-t border-white/10 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-serif text-2xl font-bold text-gkk-gold mb-4">14<sup>th</sup> GKK Awards</h2>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Occupational Safety and Health Center<br/>
              Department of Labor and Employment<br/>
              North Avenue corner Science Road, Diliman, Quezon City
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gkk-gold hover:text-gkk-navy transition-all duration-300"><Facebook size={20} /></a>
              <a href="https://oshc.dole.gov.ph" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gkk-gold hover:text-gkk-navy transition-all duration-300"><Globe size={20} /></a>
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><button onClick={onUnderDev} className="text-sm font-bold text-gray-400 hover:text-gkk-gold transition-colors uppercase tracking-widest">Nomination Forms</button></li>
              <li><button onClick={onUnderDev} className="text-sm font-bold text-gray-400 hover:text-gkk-gold transition-colors uppercase tracking-widest">Criteria Guidelines</button></li>
              <li><button onClick={onUnderDev} className="text-sm font-bold text-gray-400 hover:text-gkk-gold transition-colors uppercase tracking-widest">Previous Winners</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]"><Phone size={16} className="mr-3 text-gkk-gold" /><span>(02) 8929-6036</span></li>
              <li className="flex items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]"><Mail size={16} className="mr-3 text-gkk-gold" /><span>gkk@oshc.dole.gov.ph</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <p> 2024 Occupational Safety and Health Center. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Republic of the Philippines</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;