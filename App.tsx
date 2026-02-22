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
import { Applicant, ApplicantDocument } from './types';
import { getApplicant, addApplicantDocument, updateApplicant, createUserProfile, createApplicant, seedFirebase } from './services/dbService';

// Lazy load components
const NominationForm = lazy(() => import('./components/portal/NominationForm'));
const Login = lazy(() => import('./components/portal/Login'));
const ApplicantPortal = lazy(() => import('./components/portal/ApplicantPortal'));

const HallOfFame = lazy(() => import('./components/portal/HallOfFame'));
const EvaluatorPortal = lazy(() => import('./components/portal/EvaluatorPortal'));
const UnderDevelopment = lazy(() => import('./components/UnderDevelopment'));


type ViewState = 'home' | 'nominate' | 'login' | 'applicant-portal' | 'evaluator-portal' | 'hall-of-fame' | 'under-development';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [currentApplicantId, setCurrentApplicantId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    // Temporary seed execution triggered by HMR
    seedFirebase().then(() => console.log('Successfully published seeded collections to Firebase!'));

    const restoreSession = async () => {
      const savedView = sessionStorage.getItem('gkk_last_view') as ViewState;
      if (savedView && ['hall-of-fame', 'nominate', 'login', 'under-development'].includes(savedView)) {
        setView(savedView);
      }

      const session = sessionStorage.getItem('gkk_session');
      if (session) {
        try {
          const { role, uid } = JSON.parse(session);
          if (role === 'applicant' && uid) {
            const data = await getApplicant(uid);
            if (data) {
              setApplicants([data]);
              setCurrentApplicantId(uid);
              setView('applicant-portal');
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

  const currentApplicant = useMemo(() =>
    applicants.find(a => a.id === currentApplicantId) || applicants[0],
    [applicants, currentApplicantId]
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
      await createUserProfile(newId, `contact@${companyName.replace(/[^a-zA-Z]/g, '').toLowerCase()}.demo`, 'nominee');
      const newApp = await createApplicant(newId, regId, companyName, 'private');

      sessionStorage.setItem('gkk_session', JSON.stringify({ role: 'applicant', uid: newId }));
      setApplicants(prev => [newApp, ...prev]);
      setCurrentApplicantId(newId);
      navigateTo('applicant-portal');
    } catch (err) {
      console.error("Failed to quick register to Firebase", err);
    }
  }, [navigateTo]);

  const handleDocumentUpload = useCallback(async (doc: ApplicantDocument) => {
    if (!currentApplicant) return;
    try {
      await addApplicantDocument(currentApplicant.id, doc);
    } catch (err) {
      console.error("Failed to save document to Firebase", err);
    }
    setApplicants(prev => prev.map(app => app.id === currentApplicant.id ? { ...app, documents: [...app.documents, doc] } : app));
  }, [currentApplicant]);

  const handleUpdateApplicant = useCallback(async (updates: Partial<Applicant>) => {
    if (!currentApplicant) return;
    try {
      await updateApplicant(currentApplicant.id, updates);
    } catch (err) {
      console.error("Failed to save details to Firebase", err);
    }
    setApplicants(prev => prev.map(app => app.id === currentApplicant.id ? { ...app, ...updates } : app));
  }, [currentApplicant]);

  const handleToggleRound2 = useCallback(async (applicantId: string, unlocked: boolean) => {
    try {
      await updateApplicant(applicantId, { round2Unlocked: unlocked });
    } catch (err) {
      console.error("Failed to toggle round 2 details to Firebase", err);
    }
    setApplicants(prev => prev.map(app => app.id === applicantId ? { ...app, round2Unlocked: unlocked } : app));
  }, []);

  const handleToggleRound3 = useCallback(async (applicantId: string, unlocked: boolean) => {
    try {
      await updateApplicant(applicantId, { round3Unlocked: unlocked });
    } catch (err) {
      console.error("Failed to toggle round 3 details to Firebase", err);
    }
    setApplicants(prev => prev.map(app => app.id === applicantId ? { ...app, round3Unlocked: unlocked } : app));
  }, []);

  const isPortalView = useMemo(() => view === 'applicant-portal' || view === 'evaluator-portal', [view]);
  const isSpecialView = useMemo(() => view === 'nominate' || view === 'login' || view === 'hall-of-fame' || view === 'under-development', [view]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('gkk_session');
    setApplicants([]);
    setCurrentApplicantId(null);
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
              onLogin={async (role, uid) => {
                sessionStorage.setItem('gkk_session', JSON.stringify({ role, uid }));
                if (role === 'applicant' && uid) {
                  const data = await getApplicant(uid);
                  if (data) {
                    setApplicants([data]);
                    setCurrentApplicantId(uid);
                    navigateTo('applicant-portal');
                  }
                } else if (['evaluator', 'scd', 'reu', 'admin'].includes(role)) {
                  navigateTo('evaluator-portal');
                }
              }}
            />
          </Suspense>
        )}

        {view === 'applicant-portal' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <ApplicantPortal
              onLogout={handleLogout}
              onUnderDev={() => navigateTo('under-development')}
              applicantData={currentApplicant}
              onDocumentUpload={handleDocumentUpload}
              onUpdateApplicant={handleUpdateApplicant}
            />
          </Suspense>
        )}

        {view === 'evaluator-portal' && (
          <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <EvaluatorPortal
              onLogout={handleLogout}
              onUnderDev={() => navigateTo('under-development')}
              applicants={applicants}
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