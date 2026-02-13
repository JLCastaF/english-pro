import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lightbulb, Trophy, ArrowRight, Eye, Flame, RefreshCcw, CheckCircle2, XCircle, Loader2, BookOpen } from 'lucide-react';
import { exerciseData } from '../data/questions';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';

import { auth, db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'; 

export default function Exercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isEmptyError, setIsEmptyError] = useState(false);
  const [isWrongError, setIsWrongError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const exerciseTitle = id ? id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "Exercise";

  const levels = [
    { min: 0, max: 25, bannerBg: 'from-blue-600 to-blue-400' },
    { min: 26, max: 50, bannerBg: 'from-amber-600 to-amber-400' },
    { min: 51, max: 75, bannerBg: 'from-orange-600 to-orange-400' },
    { min: 76, max: 100, bannerBg: 'from-emerald-600 to-emerald-400' },
  ];

  useEffect(() => {
    const fetchContentAndProgress = async () => {
      setIsLoading(true);
      const user = auth.currentUser;
      let finalQuestions = [];
      try {
        const docRef = doc(db, 'exercises', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().questions) {
          finalQuestions = docSnap.data().questions;
        } else if (exerciseData[id]) {
          finalQuestions = exerciseData[id].questions;
        }

        const shuffled = [...finalQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled);

        if (user) {
          const snapshot = await getDocs(collection(db, 'users', user.uid, 'progress'));
          const completedCount = snapshot.docs.filter(doc => doc.data().completed).length;
          const totalTopics = Object.keys(exerciseData).length || 1;
          setGlobalProgress(Math.round((completedCount / totalTopics) * 100));
        }
      } catch (e) { console.error(e); }
      setIsLoading(false);
    };
    fetchContentAndProgress();
  }, [id]);

  const saveProgress = async () => {
    const user = auth.currentUser;
    if (!user || score < questions.length) return;

    try {
      await setDoc(doc(db, 'users', user.uid, 'progress', id), {
        completed: true,
        score: score,
        updatedAt: new Date()
      });
    } catch (e) { console.error("Error saving progress:", e); }
  };

  const currentLevel = levels.find(l => globalProgress >= l.min && globalProgress <= l.max) || levels[0];

  const checkAnswer = (e) => {
    if (e) e.preventDefault();
    if (status !== 'idle' || !userAnswer.trim()) {
      if (!userAnswer.trim()) { setIsEmptyError(true); setTimeout(() => setIsEmptyError(false), 400); }
      return;
    }
    const currentQ = questions[current];
    const answers = currentQ.acceptedAnswers || [currentQ.acceptedAnswer];
    const isCorrect = answers.some(ans => ans?.toLowerCase().trim() === userAnswer.toLowerCase().trim());

    if (isCorrect) { 
      setStatus('correct'); setScore(s => s + 1); setStreak(streak + 1); 
    } else { 
      setStatus('incorrect'); setStreak(0); setIsWrongError(true); setTimeout(() => setIsWrongError(false), 400); 
    }
  };

  const nextQuestion = () => {
    setIsEmptyError(false); setIsWrongError(false); setShowHelp(false);
    if (current + 1 < questions.length) {
      setStatus('idle'); setUserAnswer(''); setCurrent(current + 1);
    } else {
      saveProgress();
      setShowResult(true);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>;

  const currentQ = questions[current];

  if (showResult) {
    const isPerfect = score === questions.length;
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in zoom-in duration-300">
          <div data-test="result-card" className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 text-center relative overflow-hidden">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${isPerfect ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-slate-100'}`}>
              {isPerfect ? <Trophy className="w-10 h-10 text-white fill-current" /> : <RefreshCcw className="w-10 h-10 text-slate-400" />}
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">{isPerfect ? '¡Nivel Completado!' : 'Sigue Practicando'}</h2>
            <div className="mb-10 tracking-tighter">
              <span data-test="final-score" className="text-7xl font-black text-indigo-600">{score}</span>
              <span className="text-3xl font-black text-slate-200 mx-1">/</span>
              <span className="text-4xl font-black text-slate-300">{questions.length}</span>
            </div>
            <button 
              data-test="finish-button"
              onClick={() => navigate('/study')} 
              className={`w-full py-5 rounded-2xl font-black text-sm text-white shadow-lg bg-gradient-to-r ${currentLevel.bannerBg} transition-all active:scale-95`}
            >
              CONTINUAR AL HUB
            </button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center p-6">
      <div className="w-full max-w-xl flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-6 px-1">
          <BackButton to="/study" text="Salir" />
          <div className="px-4 py-1.5 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center gap-2">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 fill-current' : 'text-slate-300'}`} />
            <span data-test="streak-count" className="font-black text-slate-700 text-sm">{streak}</span>
          </div>
        </div>

        <div className="mb-8 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            data-test="progress-bar"
            className={`h-full bg-gradient-to-r ${currentLevel.bannerBg} transition-all duration-700`} 
            style={{ width: `${(current / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className={`bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-slate-100 transition-all ${(isEmptyError || isWrongError) ? 'animate-shake-error border-red-200' : ''}`}>
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                {exerciseTitle}
              </span>
              <span data-test="question-counter" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg w-fit">
                Pregunta {current + 1} de {questions.length}
              </span>
            </div>
            <button 
              data-test="help-button"
              onClick={() => setShowHelp(!showHelp)} 
              className={`p-2 rounded-lg transition-all ${showHelp ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-50'}`}
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center mb-10">
             <div className="w-20 h-20 bg-indigo-50 rounded-[2.2rem] flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-indigo-400" />
             </div>
          </div>

          <h2 data-test="question-text" className="text-xl md:text-2xl font-bold text-slate-800 mb-10 leading-snug text-center">
            {currentQ.question.split('___').map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i === 0 && (
                  <span className="mx-2 px-3 py-0.5 bg-indigo-50 text-indigo-600 border-b-2 border-indigo-200 rounded-lg italic font-black text-xl">
                    {currentQ.verb || '...'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </h2>

          <div className="space-y-4">
            <form onSubmit={checkAnswer}>
              <div className="relative">
                <input
                  data-test="exercise-input"
                  autoFocus
                  className={`w-full p-5 rounded-2xl border-2 outline-none transition-all text-xl font-bold text-center
                    ${status === 'idle' ? (isEmptyError ? 'border-red-400 bg-red-50' : 'border-slate-100 focus:border-indigo-400 bg-slate-50/50') : 
                      status === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700'}`}
                  placeholder={isEmptyError ? "¡Escribe algo!" : "Respuesta..."}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={status !== 'idle'}
                  autoComplete="off"
                />
                {status === 'correct' && <CheckCircle2 data-test="icon-correct" className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500" />}
                {status === 'incorrect' && <XCircle data-test="icon-wrong" className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />}
              </div>
            </form>

            <button 
              data-test="exercise-action-button"
              onClick={status === 'idle' ? checkAnswer : nextQuestion}
              className={`w-full py-5 rounded-2xl font-black text-sm text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2
                ${status === 'idle' ? `bg-gradient-to-r ${currentLevel.bannerBg}` : 
                  status === 'correct' ? 'bg-emerald-600' : 'bg-red-600'}`}
            >
              {status === 'idle' ? 'COMPROBAR' : 'SIGUIENTE'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {status === 'incorrect' && (
            <div data-test="correct-answer-feedback" className="mt-8 p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase mb-1 tracking-widest">
                <Eye className="w-3.5 h-3.5" /> Debería ser:
              </div>
              <p className="text-xl font-black text-amber-900">
                {(currentQ.acceptedAnswers || [currentQ.acceptedAnswer])[0]}
              </p>
            </div>
          )}

          {showHelp && (
            <div data-test="help-box" className="mt-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm italic animate-in zoom-in-95 duration-200">
              <div className="font-black text-[10px] uppercase text-amber-600 mb-1 tracking-widest flex items-center gap-2">
                <Lightbulb size={12} /> Sugerencia:
              </div>
              {currentQ.hint || currentQ.formula || "No hay una pista disponible para esta pregunta."}
            </div>
          )}
        </div>
        
        <Footer />
      </div>

      <style>{`
        @keyframes shake-error {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake-error { animation: shake-error 0.35s ease-in-out; }
      `}</style>
    </div>
  );
}