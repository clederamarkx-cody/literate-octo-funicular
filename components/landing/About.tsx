import React from 'react';
import { Shield, Target, Users, BookOpen } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Watermark Logo Effect */}
      <div className="absolute -right-20 top-40 text-gkk-navy/5 pointer-events-none select-none">
        <Shield size={600} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="h-px w-8 bg-gkk-gold"></span>
              <span className="text-gkk-gold text-sm font-bold uppercase tracking-widest">About the Award</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gkk-navy mb-8 leading-tight">
              A Legacy of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gkk-goldDark to-gkk-gold">Safety Excellence</span>
            </h2>
            
            <div className="space-y-6 text-gray-600 leading-relaxed font-sans text-lg">
              <p>
                The <strong>Gawad Kaligtasan at Kalusugan (GKK)</strong> is not merely an event; it is a biennial testament to the resilience and dedication of the Filipino workforce. Spearheaded by the Department of Labor and Employment (DOLE), it stands as the highest national recognition for OSH.
              </p>
              <p>
                From vast industrial complexes to humble micro-enterprises, the GKK shines a light on those who refuse to compromise on safety. It champions the philosophy of <strong>"Vision Zero"</strong>—the belief that all accidents are preventable and that every worker deserves to return home safe.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-serif font-bold text-3xl text-gkk-navy">
                  14<sup>th</sup>
                </h4>
                <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Edition Ceremony</p>
              </div>
              <div>
                <h4 className="font-serif font-bold text-3xl text-gkk-navy">Vision Zero</h4>
                <p className="text-sm text-gray-500 uppercase tracking-wide mt-1">Core Philosophy</p>
              </div>
            </div>
          </div>

          {/* Visual/Image Card */}
          <div className="relative">
             <div className="absolute inset-0 bg-gkk-navy transform translate-x-4 translate-y-4 rounded-lg"></div>
             <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-2xl aspect-[4/5] flex flex-col items-center justify-center p-8 text-center border border-gray-200">
                <Target className="w-16 h-16 text-gkk-gold mb-6" />
                <h3 className="text-2xl font-serif font-bold text-gkk-navy mb-4">The Criteria</h3>
                <p className="text-gray-600 mb-8 text-sm">
                  Our laureates are chosen through a rigorous validation process measuring safety policies, accident statistics, and social accountability.
                </p>
                <div className="w-full h-px bg-gray-300 mb-8"></div>
                <div className="grid grid-cols-2 w-full gap-4 text-left">
                   <div className="flex items-start">
                      <BookOpen className="w-5 h-5 text-gkk-gold mr-2 mt-1" />
                      <div>
                        <span className="block font-bold text-gkk-navy text-sm">Policy</span>
                        <span className="text-xs text-gray-500">Comprehensive Systems</span>
                      </div>
                   </div>
                   <div className="flex items-start">
                      <Users className="w-5 h-5 text-gkk-gold mr-2 mt-1" />
                      <div>
                        <span className="block font-bold text-gkk-navy text-sm">People</span>
                        <span className="text-xs text-gray-500">Empowered Workforce</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;