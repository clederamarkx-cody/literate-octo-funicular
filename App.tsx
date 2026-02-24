import React, { useState, Suspense, lazy, useCallback, useMemo, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/landing/Hero';
import SocialProof from './components/landing/SocialProof';
import Features from './components/landing/Features';
import About from './components/landing/About';
import Categories from './components/landing/Categories';
import Timeline from './components/landing/Timeline';
import SubmissionGuidelines from './components/landing/SubmissionGuidelines';
import Testimonials from './components/landing/Testimonials';
import FAQ from './components/landing/FAQ';
import Contact from './components/landing/Contact';
import Footer from './components/layout/Footer';
import ChatWidget from './components/layout/ChatWidget';
import { FileText, Calendar, Mail } from 'lucide-react';
import { Nominee, NomineeDocument } from './types';
import { getNominee, addNomineeDocument, updateNominee, createUserProfile, createNominee, setAuthUser } from './services/dbService';

// Lazy load components
const NominationForm = lazy(() => import('./components/portal/NominationForm'));
const Login = lazy(() => import('./components/portal/Login'));
const NomineePortal = lazy(() => import('./components/portal/NomineePortal'));

const HallOfFame = lazy(() => import('./components/portal/HallOfFame'));
const EvaluatorPortal = lazy(() => import('./components/portal/EvaluatorPortal'));
const UnderDevelopment = lazy(() => import('./components/UnderDevelopment'));


type ViewState = 'home' | 'nominate' | 'login' | 'nominee-portal' | 'evaluator-portal' | 'hall-of-fame' | 'under-development';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [currentNomineeId, setCurrentNomineeId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedView = sessionStorage.getItem('gkk_last_view') as ViewState;
      if (savedView && ['hall-of-fame', 'nominate', 'login', 'under-development'].includes(savedView)) {
        setView(savedView);
      }

      const session = sessionStorage.getItem('gkk_session');
      if (session) {
        try {
          const { role, uid, email } = JSON.parse(session);

          // SESSION SANITIZER: Detect legacy non-UUID IDs and force a fresh login
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
          if (!isUuid && uid && !uid.includes('anonymous')) {
            console.warn("Legacy session detected. Clearing storage for security.");
            sessionStorage.removeItem('gkk_session');
            window.location.reload();
            return;
          }

          setAuthUser(uid, email || '');
          if (role === 'nominee' && uid) {
            const data = await getNominee(uid);
            if (data) {
              setNominees([data]);
              setCurrentNomineeId(uid);
              setView('nominee-portal');
            } else {
              sessionStorage.removeItem('gkk_session');
            }
          } else if (role === 'evaluator') {
            setView('evaluator-portal');
          }
        } catch (e) {
          sessionStorage.removeItem('gkk_session');
        }
      }
      setIsLoadingSession(false);
    };
    restoreSession();
  }, []);

  const currentNominee = useMemo(() =>
    nominees.find(a => a.id === currentNomineeId) || nominees[0],
    [nominees, currentNomineeId]
  );


  const navigateTo = useCallback((newView: ViewState) => {
    window.scrollTo(0, 0);
    setPrevView(view);
    setView(newView);
    sessionStorage.setItem('gkk_last_view', newView);
  }, [view]);

  const handleQuickRegister = useCallback(async (companyName: string) => {
    const newId = 'user_' + Date.now().toString();
    const regId = `REG-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const email = `contact@${companyName.replace(/[^a-zA-Z]/g, '').toLowerCase()}.demo`;
      await createUserProfile(newId, email, 'nominee');
      const newApp = await createNominee(newId, regId, companyName, 'Industry', email);

      sessionStorage.setItem('gkk_session', JSON.stringify({ role: 'nominee', uid: newId }));
      setNominees(prev => [newApp, ...prev]);
      setCurrentNomineeId(newId);
      navigateTo('nominee-portal');
    } catch (err) {
      console.error("Failed to quick register to local database", err);
    }
  }, [navigateTo]);

  const handleDocumentUpload = useCallback(async (doc: NomineeDocument) => {
    if (!currentNominee) return;
    try {
      await addNomineeDocument(currentNominee.id, doc);
    } catch (err) {
      console.error("Failed to save document to local database", err);
    }
    setNominees(prev => prev.map(app => app.id === currentNominee.id ? { ...app, documents: [...app.documents, doc] } : app));
  }, [currentNominee]);

  const handleUpdateNominee = useCallback(async (updates: Partial<Nominee>) => {
    if (!currentNominee) return;
    try {
      await updateNominee(currentNominee.id, updates);
    } catch (err) {
      console.error("Failed to save details to local database", err);
    }
    setNominees(prev => prev.map(app => app.id === currentNominee.id ? { ...app, ...updates } : app));
  }, [currentNominee]);

  const handleToggleRound2 = useCallback(async (nomineeId: string, unlocked: boolean) => {
    try {
      await updateNominee(nomineeId, { round2Unlocked: unlocked });
    } catch (err) {
      console.error("Failed to toggle round 2 details to local database", err);
    }
    setNominees(prev => prev.map(app => app.id === nomineeId ? { ...app, round2Unlocked: unlocked } : app));
  }, []);

  const handleToggleRound3 = useCallback(async (nomineeId: string, unlocked: boolean) => {
    try {
      await updateNominee(nomineeId, { round3Unlocked: unlocked });
    } catch (err) {
      console.error("Failed to toggle round 3 details to local database", err);
    }
    setNominees(prev => prev.map(app => app.id === nomineeId ? { ...app, round3Unlocked: unlocked } : app));
  }, []);

  const isPortalView = useMemo(() => view === 'nominee-portal' || view === 'evaluator-portal', [view]);
  const isSpecialView = useMemo(() => view === 'nominate' || view === 'login' || view === 'hall-of-fame' || view === 'under-development', [view]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('gkk_session');
    setNominees([]);
    setCurrentNomineeId(null);
    navigateTo('home');
  }, [navigateTo]);

  if (view === 'under-development') {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <UnderDevelopment onBack={() => navigateTo(prevView)} />
      </Suspense>
    );
  }

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-gkk-gold to-yellow-200 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-gkk-navy font-bold text-2xl font-serif">14<sup>th</sup></span>
          </div>
          <p className="text-gkk-navy font-bold uppercase tracking-widest text-xs">Restoring Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 scroll-smooth">
      {!isPortalView && (
        <Navbar onNavigate={navigateTo} isNominationPage={isSpecialView} />
      )}

      <main key={view} className={!isPortalView ? "page-transition" : "h-screen overflow-hidden page-transition"}>
        {view === 'home' && (
          <>
            <Hero onNominate={() => navigateTo('nominate')} onUnderDev={() => navigateTo('under-development')} />
            <SocialProof />
            <Features />
            <div className="bg-gray-50/50"><About /></div>
            <Categories onUnderDev={() => navigateTo('under-development')} />
            <Timeline />
            <SubmissionGuidelines onUnderDev={() => navigateTo('under-development')} />
            <Testimonials />
            <FAQ />
            <Contact />

            {/* CTA SECTION */}
            <section id="cta" className="relative py-28 bg-gkk-navy overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gkk-royalBlue to-transparent opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gkk-gold/10 rounded-full blur-3xl"></div>

              <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-block p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 animate-bounce">
                  <Calendar className="w-6 h-6 text-gkk-gold" />
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Ready to be Recognized?</h2>
                <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
                  If your establishment has been officially nominated by DOLE, use your invitation key below to activate your portal and submit evidence.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button onClick={() => navigateTo('nominate')} className="flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gkk-gold to-gkk-goldDark text-white font-bold tracking-wide uppercase rounded shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg group">
                    <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Register Nominee
                  </button>
                  <button onClick={() => navigateTo('under-development')} className="flex items-center justify-center px-10 py-5 bg-transparent border border-gray-600 text-gray-300 font-semibold tracking-wide uppercase rounded hover:bg-white/5 hover:border-white transition-all duration-300 text-lg">
                    <Mail className="w-5 h-5 mr-3" /> Download Kit
                  </button>
                </div>
                <p className="mt-10 text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">Official OSHC-DOLE 14<sup>th</sup> GKK Cycle</p>
              </div>
            </section>
          </>
        )}

        {view === 'nominate' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <NominationForm onBack={() => navigateTo('home')} />
          </Suspense>
        )}

        {view === 'login' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <Login
              onBack={() => navigateTo('home')}
              onRegisterClick={() => navigateTo('nominate')}
              onQuickRegister={handleQuickRegister}
              onLogin={async (role, uid, email) => {
                sessionStorage.setItem('gkk_session', JSON.stringify({ role, uid, email }));
                setAuthUser(uid, email || '');
                if (role === 'nominee' && uid) {
                  const data = await getNominee(uid);
                  if (data) {
                    setNominees([data]);
                    setCurrentNomineeId(uid);
                    navigateTo('nominee-portal');
                  }
                } else if (['evaluator', 'scd_team_leader', 'reu', 'admin'].includes(role)) {
                  navigateTo('evaluator-portal');
                }
              }}
            />
          </Suspense>
        )}

        {view === 'nominee-portal' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading Portal...</div>}>
            <NomineePortal
              onLogout={handleLogout}
              onUnderDev={() => navigateTo('under-development')}
              nomineeData={currentNominee}
              onDocumentUpload={handleDocumentUpload}
              onUpdateNominee={handleUpdateNominee}
            />
          </Suspense>
        )}

        {view === 'evaluator-portal' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <EvaluatorPortal
              onLogout={handleLogout}
              onUnderDev={() => navigateTo('under-development')}
              nomineesData={nominees}
              userRole={JSON.parse(sessionStorage.getItem('gkk_session') || '{}').role}
              onToggleRound2={handleToggleRound2}
              onToggleRound3={handleToggleRound3}
            />
          </Suspense>
        )}



        {view === 'hall-of-fame' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <HallOfFame onBack={() => navigateTo('home')} />
          </Suspense>
        )}
      </main>

      {!isPortalView && (
        <>
          <Footer onUnderDev={() => navigateTo('under-development')} />
          <ChatWidget />
        </>
      )}
    </div>
  );
}

export default App;