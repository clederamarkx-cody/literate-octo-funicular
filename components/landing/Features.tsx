import React from 'react';
import { Award, TrendingUp, ShieldCheck } from 'lucide-react';
import { BENEFITS } from '../../constants';

const iconMap: Record<string, React.ElementType> = {
  Award,
  TrendingUp,
  ShieldCheck
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-gkk-gold font-bold tracking-wide uppercase">Why Participate?</h2>
          <p className="mt-2 text-3xl leading-8 font-serif font-bold tracking-tight text-gkk-navy sm:text-4xl">
            More Than Just a Trophy
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Participating in the GKK Awards offers tangible benefits to your organization's culture, compliance, and reputation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {BENEFITS.map((benefit, index) => {
            const Icon = iconMap[benefit.icon];
            return (
              <div key={index} className="relative group p-8 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gkk-gold/10 hover:-translate-y-2 transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-5 text-gkk-navy group-hover:opacity-10 transition-opacity">
                    <Icon size={100} />
                </div>
                <div className="w-14 h-14 bg-gkk-navy rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-gkk-navy/30 group-hover:bg-gkk-gold transition-colors duration-300">
                  <Icon className="text-white w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gkk-navy mb-3 font-serif">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;