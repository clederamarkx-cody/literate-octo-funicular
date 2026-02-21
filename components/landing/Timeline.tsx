import React from 'react';
import { TIMELINE_EVENTS } from '../../constants';
import { Calendar, CheckCircle, Flag, Award, Search, Zap } from 'lucide-react';

const icons = [Flag, Search, CheckCircle, Calendar, Award];

const Timeline: React.FC = () => {
  // Triple the events to ensure a perfectly seamless infinite scroll loop on all screen widths
  const marqueeItems = [...TIMELINE_EVENTS, ...TIMELINE_EVENTS, ...TIMELINE_EVENTS];

  return (
    <section id="timeline" className="py-24 bg-white relative overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-340px * 5 - 2rem * 5)); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll 45s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Subtle Background Accents */}
      <div className="absolute -left-20 bottom-0 w-96 h-96 bg-gkk-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-20 top-0 w-96 h-96 bg-gkk-navy/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Centered Header - Still Contained for Readability */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50/50 rounded-full border border-gkk-gold/10 mb-4">
          <Zap size={10} className="text-gkk-gold fill-current" />
          <span className="text-gkk-gold text-[9px] font-black uppercase tracking-[0.25em]">Excellence Journey</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gkk-navy mt-2 mb-4 tracking-tight">Award Cycle</h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm font-medium leading-relaxed uppercase tracking-widest opacity-60">
          A continuous journey of safety validation
        </p>
      </div>

      {/* Full-Width Marquee - Container Removed for "Edge-to-Edge" Look */}
      <div className="relative w-full">
        {/* Deeper Fade Masks for Seamless Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[15%] bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none"></div>

        {/* Marquee Track */}
        <div className="marquee-track py-8 gap-8">
          {marqueeItems.map((event, index) => {
            const Icon = icons[index % TIMELINE_EVENTS.length];
            const phaseNumber = (index % TIMELINE_EVENTS.length) + 1;

            return (
              <div 
                key={index} 
                className="w-[340px] flex-shrink-0 relative group/item"
              >
                {/* Phase Counter Node - Floating Circle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-all duration-500 group-hover/item:border-gkk-gold group-hover/item:shadow-lg group-hover/item:shadow-gkk-gold/10">
                    <span className="font-serif font-bold text-gray-200 text-lg group-hover/item:text-gkk-gold transition-colors">
                      {phaseNumber}
                    </span>
                  </div>
                </div>

                {/* Content Card - Minimal Floating Design */}
                <div className="mt-16 mx-3 bg-white p-10 rounded-[48px] border border-gray-50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] transition-all duration-700 h-[340px] flex flex-col group-hover/item:-translate-y-2">
                  {/* Icon & Date Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-4 bg-gray-50/50 rounded-2xl text-gkk-gold group-hover/item:bg-gkk-navy group-hover/item:text-white transition-all duration-500">
                      <Icon size={22} strokeWidth={1.2} />
                    </div>
                    <div className="px-4 py-1.5 bg-amber-50/50 rounded-full border border-gkk-gold/5">
                      <span className="text-[9px] font-black text-gkk-gold uppercase tracking-[0.15em]">{event.date}</span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="space-y-4 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{event.phase}</p>
                    <h3 className="text-2xl font-serif font-bold text-gkk-navy leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                      {event.description}
                    </p>
                  </div>

                  {/* Minimal Learn More Action */}
                  <div className="mt-8 pt-8 border-t border-gray-50/50">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover/item:text-gkk-navy transition-colors">
                      Learn More
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Timeline;