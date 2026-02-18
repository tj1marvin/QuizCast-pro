
import React, { useState, useRef } from 'react';
import { useQuizSync } from '../hooks/useQuizSync';
import { generateQuestions } from '../services/geminiService';
import { GameStatus, Question, AnimationStyle, QuizState } from '../types';

const QuizManager: React.FC = () => {
  const { state, updateState } = useQuizSync('manager');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState<QuizState[]>([]);
  
  // Manual Question Form State
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualQ, setManualQ] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 100,
    timeLimit: 30
  });

  const pushToHistory = () => {
    setHistory(prev => [...prev, { ...state }].slice(-20)); // Keep last 20 states
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    updateState(previousState);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const newQuestions = await generateQuestions(topic);
      pushToHistory();
      updateState({ questions: [...state.questions, ...newQuestions], currentQuestionIndex: state.currentQuestionIndex, status: state.status === GameStatus.IDLE ? GameStatus.WAITING : state.status });
      setTopic('');
    } catch (err) {
      alert("Error generating questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQ.text || manualQ.options.some(opt => !opt)) {
      alert("Please fill in the question and all 4 options.");
      return;
    }

    const newQuestion: Question = {
      ...manualQ,
      id: Math.random().toString(36).substring(2, 9)
    };

    pushToHistory();
    updateState({ 
      questions: [...state.questions, newQuestion], 
      status: state.status === GameStatus.IDLE ? GameStatus.WAITING : state.status 
    });

    // Reset form
    setManualQ({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 100,
      timeLimit: 30
    });
    setIsManualOpen(false);
  };

  const updateManualOption = (index: number, value: string) => {
    const newOptions = [...manualQ.options];
    newOptions[index] = value;
    setManualQ({ ...manualQ, options: newOptions });
  };

  const clearQuestions = () => {
    if (confirm("Clear all questions?")) {
      pushToHistory();
      updateState({ questions: [], currentQuestionIndex: -1, status: GameStatus.IDLE });
    }
  };

  const startQuiz = () => {
    if (state.questions.length === 0) return;
    pushToHistory();
    updateState({ currentQuestionIndex: 0, status: GameStatus.SHOWING_QUESTION });
  };

  const nextQuestion = () => {
    pushToHistory();
    if (state.currentQuestionIndex < state.questions.length - 1) {
      updateState({ 
        currentQuestionIndex: state.currentQuestionIndex + 1, 
        status: GameStatus.SHOWING_QUESTION 
      });
    } else {
      updateState({ status: GameStatus.GAME_OVER });
    }
  };

  const revealAnswer = () => {
    pushToHistory();
    updateState({ status: GameStatus.REVEALING_ANSWER });
  };

  const setAnimationStyle = (style: AnimationStyle) => {
    pushToHistory();
    updateState({ animationStyle: style });
  };

  const setGameOver = () => {
    pushToHistory();
    updateState({ status: GameStatus.GAME_OVER });
  };

  const openTVView = () => {
    window.open(window.location.origin + window.location.pathname + '#presenter', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div>
          <h1 className="text-3xl font-black font-outfit bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            QuizCast Control
          </h1>
          <p className="text-slate-400 text-sm">Manager Interface</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xl font-bold border border-slate-600"
            title="Undo last action"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button 
            onClick={openTVView}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-bold shadow-lg shadow-indigo-500/20"
          >
            <i className="fas fa-tv"></i>
            Launch Display
          </button>
        </div>
      </header>

      {/* Settings Section */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <i className="fas fa-cog text-indigo-400"></i>
          Presentation Vibe
        </h2>
        <div className="flex gap-4">
          {(['slide', 'fade', 'zoom'] as AnimationStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setAnimationStyle(style)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold capitalize border-2 transition-all ${
                state.animationStyle === style 
                  ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                  : 'border-slate-700 bg-slate-800/50 text-slate-400'
              }`}
            >
              {style} Entry
            </button>
          ))}
        </div>
      </section>

      {/* Input Methods Tabs */}
      <div className="grid grid-cols-2 gap-4 bg-slate-800/30 p-1.5 rounded-2xl">
        <button 
          onClick={() => setIsManualOpen(false)}
          className={`py-3 rounded-xl font-bold transition-all ${!isManualOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="fas fa-magic mr-2"></i> AI Generate
        </button>
        <button 
          onClick={() => setIsManualOpen(true)}
          className={`py-3 rounded-xl font-bold transition-all ${isManualOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <i className="fas fa-edit mr-2"></i> Manual Entry
        </button>
      </div>

      {!isManualOpen ? (
        /* Generator Section */
        <section className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-magic text-blue-400"></i>
            AI Question Generator
          </h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g. Space Exploration, 80s Rock Music)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic}
              className="px-6 py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-white transition-colors disabled:opacity-50"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Generate'}
            </button>
          </div>
        </section>
      ) : (
        /* Manual Question Form */
        <section className="glass rounded-2xl p-6 border border-indigo-500/30 animate-fade-in-up" style={{opacity: 1}}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fas fa-pen-fancy text-indigo-400"></i>
            Create New Question
          </h2>
          <form onSubmit={handleAddManual} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question Text</label>
              <textarea 
                value={manualQ.text}
                onChange={(e) => setManualQ({...manualQ, text: e.target.value})}
                placeholder="What is the capital of..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {manualQ.options.map((opt, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Option {String.fromCharCode(65 + idx)}</label>
                    <button 
                      type="button"
                      onClick={() => setManualQ({...manualQ, correctAnswer: idx})}
                      className={`text-xs font-bold px-2 py-1 rounded-md transition-all ${manualQ.correctAnswer === idx ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-500 hover:bg-slate-600'}`}
                    >
                      {manualQ.correctAnswer === idx ? 'CORRECT ANSWER' : 'SET AS CORRECT'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => updateManualOption(idx, e.target.value)}
                    placeholder={`Answer option ${idx + 1}`}
                    className={`w-full bg-slate-900 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${manualQ.correctAnswer === idx ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-700 focus:ring-indigo-500'}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Points Reward</label>
                <div className="relative">
                  <i className="fas fa-coins absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input 
                    type="number" 
                    value={manualQ.points}
                    onChange={(e) => setManualQ({...manualQ, points: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Time Limit (s)</label>
                <div className="relative">
                  <i className="fas fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input 
                    type="number" 
                    value={manualQ.timeLimit}
                    onChange={(e) => setManualQ({...manualQ, timeLimit: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus-circle"></i>
              Add to Quiz Deck
            </button>
          </form>
        </section>
      )}

      {/* Game Control Section */}
      {state.questions.length > 0 && (
        <section className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Session Control</h2>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                state.status === GameStatus.SHOWING_QUESTION ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {state.status}
              </span>
              <button onClick={clearQuestions} className="text-red-400 hover:text-red-300 text-sm">Clear All</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={startQuiz}
              disabled={state.status !== GameStatus.WAITING && state.status !== GameStatus.IDLE}
              className="p-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold disabled:opacity-50 transition-all flex flex-col items-center gap-2 shadow-lg shadow-green-900/20"
            >
              <i className="fas fa-play"></i>
              Start Quiz
            </button>
            <button 
              onClick={revealAnswer}
              disabled={state.status !== GameStatus.SHOWING_QUESTION}
              className="p-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold disabled:opacity-50 transition-all flex flex-col items-center gap-2 shadow-lg shadow-amber-900/20"
            >
              <i className="fas fa-eye"></i>
              Reveal Answer
            </button>
            <button 
              onClick={nextQuestion}
              disabled={state.status !== GameStatus.REVEALING_ANSWER || state.currentQuestionIndex >= state.questions.length - 1}
              className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold disabled:opacity-50 transition-all flex flex-col items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <i className="fas fa-forward"></i>
              Next Question
            </button>
            <button 
              onClick={setGameOver}
              className="p-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all flex flex-col items-center gap-2"
            >
              <i className="fas fa-stop"></i>
              End Game
            </button>
          </div>
        </section>
      )}

      {/* Questions List */}
      <section className="space-y-4 pb-20">
        <h2 className="text-xl font-bold px-2">Quiz Deck ({state.questions.length})</h2>
        {state.questions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-3xl text-slate-500">
            <i className="fas fa-layer-group text-4xl mb-4 block"></i>
            <p>No questions yet. Use the generator or manual form above!</p>
          </div>
        ) : (
          state.questions.map((q, idx) => (
            <div key={q.id} className={`p-5 rounded-2xl border transition-all ${
              state.currentQuestionIndex === idx ? 'border-blue-500 bg-blue-500/10 shadow-xl shadow-blue-500/5' : 'border-slate-800 bg-slate-900/50'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Question {idx + 1}</span>
                <span className="px-2 py-1 bg-slate-800 rounded-md text-xs">{q.points}pts</span>
              </div>
              <p className="font-medium text-lg mb-4">{q.text}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`px-3 py-2 rounded-lg border ${
                    q.correctAnswer === oIdx ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-slate-700 bg-slate-800/50 text-slate-400'
                  }`}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default QuizManager;
