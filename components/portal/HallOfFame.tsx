import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Trophy,
  Medal,
  Star,
  Award,
  Crown,
  Search,
  Filter,
  ArrowLeft,
  Building2,
  History,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getHallOfFame } from '../../services/dbService';

interface Winner {
  id?: string;
  category: string;
  company: string;
  region: string;
  award: 'Presidential' | 'Gold' | 'Silver' | 'Special';
  year: string;
  sector: 'Institutional' | 'Individual' | 'Government' | 'Micro';
  achievement?: string;
  image?: string;
}

interface HallOfFameProps {
  onBack: () => void;
}

const HallOfFame: React.FC<HallOfFameProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [hallOfFameData, setHallOfFameData] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHallOfFame();
        // Sort by year descending implicitly via UI requirement if not sorted in query
        setHallOfFameData(data.sort((a, b) => parseInt(b.year) - parseInt(a.year)) as Winner[]);
      } catch (error) {
        console.error("Failed to fetch Hall of Fame:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const years = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012'];
  const sectors = ['All', 'Institutional', 'Individual', 'Government', 'Micro'];

  const filteredWinners = useMemo(() => {
    return hallOfFameData.filter(winner => {
      const matchesSearch = winner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        winner.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = selectedYear === 'All' || winner.year === selectedYear;
      const matchesSector = selectedSector === 'All' || winner.sector === selectedSector;
      return matchesSearch && matchesYear && matchesSector;
    });
  }, [searchTerm, selectedYear, selectedSector, hallOfFameData]);

  const getAwardBadge = (award: Winner['award']) => {
    switch (award) {
      case 'Presidential': return { bg: 'bg-amber-100 text-amber-700', icon: <Crown size={14} />, label: 'Presidential Award' };
      case 'Gold': return { bg: 'bg-yellow-50 text-gkk-goldDark', icon: <Medal size={14} />, label: 'Gold Award' };
      case 'Silver': return { bg: 'bg-slate-100 text-slate-600', icon: <Award size={14} />, label: 'Silver Award' };
      default: return { bg: 'bg-blue-50 text-blue-600', icon: <Star size={14} />, label: 'Special Recognition' };
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans page-transition">
      {/* Premium Hero Section */}
      <section className="relative bg-gkk-navy pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-gkk-royalBlue/40 to-transparent"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gkk-gold/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-8 shadow-2xl">
              <Trophy className="w-5 h-5 text-gkk-gold" />
              <span className="text-gkk-gold text-[10px] font-black uppercase tracking-[0.3em]">National Safety Gallery</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight tracking-tight">
              Legacy of <span className="text-gold-gradient">Champions</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
              Recognizing the institutions and safety professionals who have defined excellence in Philippine Occupational Safety and Health across the years.
            </p>

            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-white/20"></div>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Establishing Benchmark Standards</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Filter Bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gkk-gold transition-colors" size={18} />
              <input
                type="text"
                placeholder="Find a winner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gkk-gold/5 focus:bg-white focus:border-gkk-gold transition-all outline-none font-medium"
              />
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full lg:w-auto min-w-0">
                <History size={16} className="text-gray-400 shrink-0" />
                <div className="relative flex items-center w-full lg:w-96">
                  <button
                    onClick={() => scrollNav('left')}
                    className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent text-gray-400 hover:text-gkk-navy"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div
                    ref={scrollRef}
                    className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide mx-6 w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {years.map(year => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedYear === year ? 'bg-gkk-navy text-white shadow-lg shadow-gkk-navy/20' : 'text-gray-400 hover:text-gkk-navy'}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => scrollNav('right')}
                    className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent text-gray-400 hover:text-gkk-navy"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-gray-50 border border-gray-100 text-xs font-bold text-gkk-navy rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-gkk-gold/20"
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector === 'All' ? 'All Sectors' : sector}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winners Gallery */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-12 h-12 border-4 border-gray-200 border-t-gkk-gold rounded-full mb-4"></div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Synchronizing with GKK Archive...</p>
            </div>
          ) : filteredWinners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredWinners.map((winner, idx) => {
                const award = getAwardBadge(winner.award);
                return (
                  <div
                    key={`${winner.company}-${idx}`}
                    className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gkk-gold/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Visual Header */}
                    <div className="h-48 relative overflow-hidden bg-gray-100">
                      {winner.image ? (
                        <img src={winner.image} alt={winner.company} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gkk-navy to-gkk-royalBlue flex items-center justify-center">
                          <Building2 className="text-white/10" size={80} />
                        </div>
                      )}

                      {/* Year Overlay */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-gkk-navy shadow-sm">
                          {winner.year}
                        </div>
                        <div className="bg-gkk-gold px-3 py-1 rounded-full text-[10px] font-black text-white shadow-sm">
                          {winner.region}
                        </div>
                      </div>

                      {/* Award Badge Floating */}
                      <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-xl border border-white/20 ${award.bg} ring-1 ring-black/5`}>
                        {award.icon}
                        <span className="text-[10px] font-black uppercase tracking-wider">{award.label}</span>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-gkk-gold uppercase tracking-[0.2em] mb-1">{winner.sector} EXCELLENCE</p>
                        <h3 className="text-2xl font-serif font-bold text-gkk-navy leading-tight group-hover:text-gkk-goldDark transition-colors">
                          {winner.company}
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1 opacity-50">Core Category</p>
                        <p className="text-sm font-bold text-slate-700">{winner.category}</p>
                      </div>

                      {winner.achievement && (
                        <div className="flex items-start gap-3 mt-auto pt-6 border-t border-gray-50">
                          <ShieldCheck size={18} className="text-green-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-500 font-medium italic leading-relaxed">
                            "{winner.achievement}"
                          </p>
                        </div>
                      )}

                      <div className="mt-8">
                        <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-gkk-navy transition-colors group/btn">
                          View Technical Summary <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-40 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gray-100 rounded-[35px] flex items-center justify-center mx-auto mb-8 text-gray-300">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gkk-navy mb-2">No Winners Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search keywords.</p>
              <button
                onClick={() => { setSelectedYear('All'); setSelectedSector('All'); setSearchTerm(''); }}
                className="mt-8 px-8 py-3 bg-gkk-navy text-white font-bold rounded-2xl shadow-xl shadow-gkk-navy/20 hover:bg-gkk-royalBlue transition-all"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Legacy Footer CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block p-4 bg-amber-50 rounded-3xl mb-8">
            <Medal size={40} className="text-gkk-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gkk-navy mb-6">
            The Search for the <br /> 14<sup>th</sup> Cycle is Active
          </h2>
          <p className="text-lg text-gray-500 mb-12 font-medium leading-relaxed">
            Continuing a decade-long tradition of safety excellence. Your establishment could be the next to join this prestigious hall of fame.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-10 py-5 bg-gkk-navy text-white font-bold rounded-2xl shadow-2xl shadow-gkk-navy/30 hover:bg-gkk-royalBlue hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
            >
              <Trophy size={20} className="text-gkk-gold group-hover:scale-110 transition-transform" />
              Proceed to 14<sup>th</sup> Cycle Registration
            </button>
            <button
              onClick={() => window.open('https://oshc.dole.gov.ph', '_blank')}
              className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              Official OSHC Archive <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HallOfFame;