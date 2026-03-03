import React, { useState, Suspense, lazy, useCallback, useMemo, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/landing/Hero';

import About from './components/landing/About';
import Categories from './components/landing/Categories';
import Timeline from './components/landing/Timeline';
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
const CriteriaInstructions = lazy(() => import('./components/landing/CriteriaInstructions'));


type ViewState = 'home' | 'nominate' | 'login' | 'nominee-portal' | 'evaluator-portal' | 'hall-of-fame' | 'under-development' | 'criteria';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [prevView, setPrevView] = useState<ViewState>('home');
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [currentNomineeId, setCurrentNomineeId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedView = sessionStorage.getItem('gkk_last_view') as ViewState;
      if (savedView && ['hall-of-fame', 'nominate', 'login', 'under-development', 'criteria'].includes(savedView)) {
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
          } else if (['evaluator', 'scd_team_leader', 'reu', 'admin'].includes(role)) {
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
      const newApp = await createNominee(newId, regId, companyName, 'Industry', email, 'NCR');

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
      const updates: any = {
        round2Unlocked: unlocked,
        stage2TriggeredByScd: unlocked
      };

      // If deactivating Stage 2, also reset REU verify lock to let them edit again
      if (!unlocked) {
        updates.stage1PassedByReu = false;
      }

      await updateNominee(nomineeId, updates);
      setNominees(prev => prev.map(app => app.id === nomineeId ? { ...app, ...updates } : app));
    } catch (err) {
      console.error("Failed to toggle round 2 details to local database", err);
    }
  }, []);

  const handleToggleRound3 = useCallback(async (nomineeId: string, unlocked: boolean) => {
    try {
      const updates: any = { round3Unlocked: unlocked, stage3TriggeredByScd: unlocked };
      if (unlocked) {
        updates.status = 'in_progress';
      }
      await updateNominee(nomineeId, updates);
      setNominees(prev => prev.map(app => app.id === nomineeId ? { ...app, ...updates } : app));
    } catch (err) {
      console.error("Failed to toggle round 3 details to local database", err);
    }
  }, []);

  const isPortalView = useMemo(() => view === 'nominee-portal' || view === 'evaluator-portal', [view]);
  const isSpecialView = useMemo(() => view === 'nominate' || view === 'login' || view === 'hall-of-fame' || view === 'under-development' || view === 'criteria', [view]);

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

  if (view === 'criteria') {
    return (
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
        <CriteriaInstructions onBack={() => navigateTo('home')} />
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
    <div className="h-screen overflow-hidden bg-white font-sans text-slate-800">
      {!isPortalView && (
        <Navbar onNavigate={navigateTo} isNominationPage={isSpecialView} />
      )}

      <main key={view} className={!isPortalView ? "h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide page-transition" : "h-full overflow-hidden page-transition"}>
        {view === 'home' && (
          <>
            <Hero onNominate={() => navigateTo('nominate')} onUnderDev={() => navigateTo('under-development')} />
            <About />
            <Categories onViewCriteria={() => navigateTo('criteria')} />
            <Timeline />
            <div className="snap-start">
              <Contact />
              <Footer onUnderDev={() => navigateTo('under-development')} />
            </div>


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
                setAuthUser(uid, email || '');
                if (role === 'nominee' && uid) {
                  const data = await getNominee(uid);
                  if (data) {
                    sessionStorage.setItem('gkk_session', JSON.stringify({ role, uid, email }));
                    setNominees([data]);
                    setCurrentNomineeId(uid);
                    navigateTo('nominee-portal');
                  } else {
                    throw new Error("Nominee profile missing. If you activated your key manually, please ensure the application record exists in Supabase.");
                  }
                } else if (['evaluator', 'scd_team_leader', 'reu', 'admin'].includes(role)) {
                  sessionStorage.setItem('gkk_session', JSON.stringify({ role, uid, email }));
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
        <ChatWidget />
      )}
    </div>
  );
}

export default App;