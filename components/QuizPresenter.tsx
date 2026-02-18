
import React, { useState, useEffect } from 'react';
import { useQuizSync } from '../hooks/useQuizSync';
import { GameStatus } from '../types';

const QuizPresenter: React.FC = () => {
  const { state } = useQuizSync('presenter');
  const [timeLeft, setTimeLeft] = useState(0);

  const currentQuestion = state.questions[state.currentQuestionIndex];

  useEffect(() => {
    if (state.status === GameStatus.SHOWING_QUESTION && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.currentQuestionIndex, state.status, currentQuestion]);

  if (state.status === GameStatus.IDLE || state.status === GameStatus.WAITING) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0f1d] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 animate-pulse"></div>
        <div className="z-10 text-center space-y-8 animate-float">
          <div className="w-32 h-32 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40">
            <i className="fas fa-bolt text-5xl text-white -rotate-12"></i>
          </div>
          <h1 className="text-7xl font-black font-outfit text-white drop-shadow-lg tracking-tighter">
            QUIZ<span className="text-indigo-500">CAST</span> PRO
          </h1>
          <p className="text-slate-400 text-2xl font-medium tracking-widest animate-pulse uppercase">
            Waiting for Host to start...
          </p>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>
    );
  }

  if (state.status === GameStatus.GAME_OVER) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0f1d] p-10 text-center">
        <h1 className="text-8xl font-black mb-6 text-white font-outfit uppercase tracking-tighter">
          Victory!
        </h1>
        <p className="text-3xl text-indigo-400 mb-12">The quiz session has ended.</p>
        <div className="p-8 glass rounded-3xl border-2 border-indigo-500/30">
          <p className="text-slate-400 text-lg">Thank you for playing</p>
          <p className="text-2xl font-bold mt-2">See you in the next round!</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const getAnimationClass = () => {
    switch (state.animationStyle) {
      case 'fade': return 'animate-fade-in-up';
      case 'zoom': return 'animate-zoom-in';
      case 'slide': 
      default: return 'animate-slide-in-right';
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0a0f1d] text-white flex flex-col p-12 overflow-hidden relative">
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        {/* Question Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            <i className="fas fa-question"></i>
          </div>
          <div>
            <h2 className="text-indigo-400 font-bold uppercase tracking-widest text-lg">Question</h2>
            <p className="text-3xl font-black">{state.currentQuestionIndex + 1} / {state.questions.length}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div className={`text-6xl font-black font-outfit mb-1 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeLeft}
          </div>
          <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Reward Info */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <h2 className="text-emerald-400 font-bold uppercase tracking-widest text-lg">Reward</h2>
            <p className="text-3xl font-black text-emerald-400">{currentQuestion.points} pts</p>
          </div>
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            <i className="fas fa-coins"></i>
          </div>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 max-w-6xl mx-auto w-full">
        <div className="bg-slate-900/60 p-12 rounded-[40px] border-2 border-slate-800 shadow-2xl mb-16 w-full transform transition-all animate-float text-center">
          <h1 className="text-5xl lg:text-6xl font-black leading-tight font-outfit text-white drop-shadow-xl inline-block">
            {currentQuestion.text}
          </h1>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-8 w-full">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isRevealing = state.status === GameStatus.REVEALING_ANSWER;
            const isShowing = state.status === GameStatus.SHOWING_QUESTION;
            
            let cardStyle = "bg-slate-900/40 border-slate-700/50";
            let textStyle = "text-slate-200";
            let icon = null;

            if (isRevealing) {
              if (isCorrect) {
                cardStyle = "bg-emerald-600/20 border-emerald-500 scale-105 shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]";
                textStyle = "text-emerald-400";
                icon = <i className="fas fa-check-circle mr-3"></i>;
              } else {
                cardStyle = "opacity-30 border-slate-800 scale-95 grayscale";
                textStyle = "text-slate-500";
              }
            }

            const markers = ['A', 'B', 'C', 'D'];
            const animationClass = isShowing ? getAnimationClass() : (isRevealing ? '' : 'opacity-0');

            return (
              <div 
                key={`${state.currentQuestionIndex}-${idx}`} 
                className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 flex items-center ${cardStyle} ${animationClass}`}
                style={{ 
                  animationDelay: isShowing ? `${idx * 0.15}s` : '0s'
                }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl mr-6 transition-all duration-500 ${
                  isRevealing && isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {markers[idx]}
                </div>
                <div className={`text-3xl font-bold tracking-tight ${textStyle}`}>
                  {icon}
                  {option}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 flex justify-between items-center opacity-40">
        <div className="text-xl font-bold tracking-widest font-outfit">QUIZCAST PRO</div>
        <div className="flex gap-4">
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
          <i className="fas fa-globe"></i>
        </div>
      </div>
    </div>
  );
};

export default QuizPresenter;
