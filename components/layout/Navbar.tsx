import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '../../constants';
import { Menu, X, Award, ArrowRight, ChevronRight, Trophy } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (page: 'home' | 'nominate' | 'login' | 'hall-of-fame') => void;
  isNominationPage?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, isNominationPage = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    if (isNominationPage && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (isNominationPage && onNavigate) {
      onNavigate('home');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-[110] transition-all duration-500 will-change-transform transform-gpu ${isScrolled || isNominationPage || isMobileMenuOpen
            ? 'bg-gkk-navy/95 backdrop-blur-md shadow-2xl py-3'
            : 'bg-transparent py-6'
          }`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center relative">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleLogoClick}>
              <div className="bg-gradient-to-tr from-gkk-gold to-yellow-200 p-2 rounded-xl shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform duration-300">
                <Award className="h-6 w-6 text-gkk-navy" />
              </div>
              <div className="text-white">
                <span className="block font-serif text-lg font-bold tracking-wider leading-none group-hover:text-gkk-gold transition-colors duration-300">
                  14<sup>th</sup> GKK
                </span>
                <span className="block text-[10px] font-bold text-gkk-goldLight tracking-[0.2em] uppercase mt-1">Gawad Kaligtasan at Kalusugan</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isNominationPage && (
              <div className="hidden lg:flex items-center space-x-8">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="text-gray-300 hover:text-gkk-gold transition-colors text-xs font-bold uppercase tracking-widest relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gkk-gold transition-all duration-300 group-hover:w-full"></span>
                  </button>
                ))}
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                <button
                  onClick={() => onNavigate && onNavigate('hall-of-fame')}
                  className="flex items-center px-4 py-2 text-gkk-gold hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all border border-gkk-gold/30 rounded-lg hover:bg-gkk-gold/10 hover:border-gkk-gold"
                >
                  <Trophy size={14} className="mr-2" /> GKK Winners
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('login')}
                  className="flex items-center px-6 py-2.5 bg-gkk-gold text-gkk-navy font-bold rounded-lg shadow-lg shadow-gkk-gold/20 hover:shadow-gkk-gold/40 hover:-translate-y-0.5 hover:bg-white transition-all text-xs uppercase tracking-widest group"
                >
                  Login <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Nomination Page Specific Button */}
            {isNominationPage && (
              <div className="hidden lg:block">
                <button onClick={() => onNavigate && onNavigate('home')} className="flex items-center text-white hover:text-gkk-gold text-xs font-bold uppercase tracking-widest transition-colors group">
                  <ChevronRight size={16} className="rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
                </button>
              </div>
            )}

            {/* Mobile/Tablet Menu Toggle */}
            <div className="lg:hidden flex items-center space-x-4">
              {!isNominationPage && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-gkk-gold transition-all p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Slide-in Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-gkk-navy/80 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[380px] bg-gkk-navy shadow-2xl border-l border-white/10 transform transition-transform duration-500 ease-out flex flex-col pt-24 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center space-x-3">
              <span className="text-white font-serif font-bold text-lg uppercase tracking-widest">Portal Navigation</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4">
            {NAV_LINKS.map((link, idx) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-gray-200 hover:text-white transition-all group"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <span className="text-sm font-bold uppercase tracking-widest">{link.name}</span>
                <ChevronRight size={18} className="text-gkk-gold group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                onClick={() => { if (onNavigate) onNavigate('hall-of-fame'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center space-x-4 px-5 py-4 text-gkk-gold hover:text-white font-bold uppercase tracking-widest text-xs transition-colors"
              >
                <Trophy size={18} /> <span>Hall of Fame</span>
              </button>
            </div>
          </div>
          <div className="p-6 border-t border-white/5 bg-black/20">
            <button
              onClick={() => { if (onNavigate) onNavigate('login'); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center px-6 py-4 bg-gkk-gold text-gkk-navy font-bold rounded-xl shadow-xl hover:bg-white transition-all uppercase tracking-widest text-sm group"
            >
              Secure Login <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-6">
              Official OSHC-GKK Portal
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;