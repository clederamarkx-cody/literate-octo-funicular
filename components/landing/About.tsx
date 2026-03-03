import React from 'react';
import { Shield, Target, Check, Award, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-gray-50/50 relative overflow-hidden min-h-screen flex flex-col justify-center snap-start">
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
              Gawad Kaligtasan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gkk-goldDark to-gkk-gold">at Kalusugan</span>
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed font-sans text-lg">
              <p>
                The <strong>Gawad Kaligtasan at Kalusugan (GKK)</strong> is an award given by the Department of Labor and Employment (DOLE) to recognize private establishments, government agencies, individuals, microenterprises, and the informal sector for their outstanding achievements in addressing the safety and health needs of workers, workplaces, and their communities.
              </p>
              <p>
                It highlights the exemplary efforts of the <strong>“best of the best”</strong> — those who have demonstrated exceptional commitment to ensuring the safety, health, and well-being of Filipino workers. These outstanding establishments and individuals are honored as <strong>GKK Champions</strong> for their remarkable and sustained contributions to the advancement of OSH.
              </p>
            </div>
            <div className="mt-10">
              <h4 className="font-serif font-bold text-3xl text-gkk-navy">
                14<sup>th</sup> Gawad Kaligtasan at Kalusugan
              </h4>
            </div>
          </div>

          {/* Visual/Image Card - Objectives Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gkk-navy transform translate-x-4 translate-y-4 rounded-lg"></div>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-2xl h-full flex flex-col p-8 border border-gray-200">
              <div className="flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-gkk-gold" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gkk-navy mb-6 text-center">Objectives of the GKK</h3>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-start">
                  <div className="bg-gkk-gold/10 p-2 rounded-lg mr-4 mt-1">
                    <Check className="w-5 h-5 text-gkk-gold" />
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    To encourage institutions, companies, and organizations to implement effective and sustainable safety, health, and environmental programs that enhance productivity and quality, and contribute to achieving zero accident/illness in the workplace.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="bg-gkk-gold/10 p-2 rounded-lg mr-4 mt-1">
                    <Award className="w-5 h-5 text-gkk-gold" />
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    To recognize exemplary establishments, organizations, and individuals that have successfully implemented OSH policies, programs, and practices that lead to safer, healthier, and more productive work environments.
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="bg-gkk-gold/10 p-2 rounded-lg mr-4 mt-1">
                    <TrendingUp className="w-5 h-5 text-gkk-gold" />
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    To promote OSH innovations, improvements, and best practices, particularly among micro, small, and medium enterprises (MSMEs) and the informal sector, as models for replication and continuous improvement.
                  </p>
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