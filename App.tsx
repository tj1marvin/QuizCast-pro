
import React, { useEffect, useState } from 'react';
import QuizManager from './components/QuizManager';
import QuizPresenter from './components/QuizPresenter';

const App: React.FC = () => {
  const [view, setView] = useState<'manager' | 'presenter'>('manager');

  useEffect(() => {
    // Basic hash-based routing to switch between views
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'presenter') {
        setView('presenter');
      } else {
        setView('manager');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen">
      {view === 'manager' ? <QuizManager /> : <QuizPresenter />}
      
      {/* Utility Footer for Manager Only */}
      {view === 'manager' && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex justify-center items-center gap-8 text-xs text-slate-500 uppercase tracking-widest z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sync Active
          </div>
          <div>Powered by Gemini Flash 3</div>
          <div className="hidden md:block">Optimized for Smart TV display</div>
        </footer>
      )}
    </div>
  );
};

export default App;
