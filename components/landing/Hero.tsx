import React from 'react';
import { ArrowRight, ChevronDown, Lock } from 'lucide-react';

interface HeroProps {
  onNominate?: () => void;
  onUnderDev?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onNominate, onUnderDev }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gkk-navy">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-radial from-gkk-royalBlue/40 via-gkk-navy to-black opacity-80"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gkk-gold/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-gkk-gold/30 rounded-full px-4 py-1.5 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gkk-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gkk-gold"></span>
            </span>
            <span className="text-gkk-goldLight text-xs font-bold uppercase tracking-widest">14<sup>th</sup> Cycle Nominations Active</span>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold leading-tight tracking-tight text-gold-gradient">
            GAWAD KALIGTASAN <br className="hidden md:block" /> AT KALUSUGAN
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300 font-sans leading-relaxed">
            Honoring the elite OSH champions <strong>nominated by the Department of Labor and Employment</strong> for their unwavering commitment to Filipino worker safety.
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={onNominate}
              className="relative px-8 py-4 bg-gkk-gold hover:bg-white text-gkk-navy font-bold rounded-lg transition-all duration-300 shadow-xl transform hover:-translate-y-1 flex items-center justify-center min-w-[240px] group"
            >
              <Lock className="w-4 h-4 mr-2 group-hover:text-gkk-navy" />
              GKK Access Key Activation <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={onUnderDev}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center min-w-[200px]"
            >
              View Guidelines
            </button>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Invitation Only • DOLE-OSHC Official System</p>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-bounce"><ChevronDown className="w-6 h-6 text-gkk-gold/50" /></div>
    </section>
  );
};
export default Hero;