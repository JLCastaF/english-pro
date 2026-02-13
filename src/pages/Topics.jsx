import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, GraduationCap, Check, CheckCircle, 
  BookOpen, Clock, Zap, Star 
} from 'lucide-react';
import { exerciseData } from '../data/questions';
import BackButton from '../components/BackButton';
import Footer from '../components/Footer';

// --- IMPORTACIONES DE FIREBASE ---
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Topics() {
  const navigate = useNavigate();
  const [completedTopics, setCompletedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lógica de Niveles (Consistente con Dashboard)
  const levels = [
    { name: 'Principiante', min: 0, max: 25, color: 'text-blue-600', bg: 'bg-blue-600', bannerBg: 'from-blue-700 to-blue-500', lightBg: 'bg-blue-50' },
    { name: 'Intermedio', min: 26, max: 50, color: 'text-amber-600', bg: 'bg-amber-600', bannerBg: 'from-amber-600 to-amber-500', lightBg: 'bg-amber-50' },
    { name: 'Avanzado', min: 51, max: 75, color: 'text-orange-600', bg: 'bg-orange-600', bannerBg: 'from-orange-600 to-orange-500', lightBg: 'bg-orange-50' },
    { name: 'Experto', min: 76, max: 100, color: 'text-emerald-600', bg: 'bg-emerald-600', bannerBg: 'from-emerald-600 to-emerald-500', lightBg: 'bg-emerald-50' },
  ];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProgress = async () => {
      try {
        const progressRef = collection(db, 'users', user.uid, 'progress');
        const snapshot = await getDocs(progressRef);
        const completedIds = snapshot.docs
          .filter(doc => doc.data().completed === true)
          .map(doc => doc.id);
        setCompletedTopics(completedIds);
      } catch (error) {
        console.error("Error cargando progreso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [navigate]);

  const allTopicIds = Object.keys(exerciseData);
  const totalCount = allTopicIds.length;
  const completedCount = completedTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const currentLevel = levels.find(l => progressPercent >= l.min && progressPercent <= l.max) || levels[0];

  const getTopicStyle = (id) => {
    if (id.includes('present')) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    if (id.includes('past')) return "bg-amber-50 text-amber-600 border-amber-100";
    if (id.includes('future')) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const getTopicIcon = (id) => {
    if (id.includes('present')) return <Zap className="w-6 h-6 fill-current" />;
    if (id.includes('past')) return <Clock className="w-6 h-6" />;
    if (id.includes('future')) return <BookOpen className="w-6 h-6" />;
    return <GraduationCap className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="mb-8 flex justify-start">
          <BackButton to="/dashboard" text="Volver al Dashboard" />
        </div>

        <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 md:p-14 border border-white/60 relative overflow-hidden">
          
          <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none rotate-12">
            <Star className="w-64 h-64 text-slate-900 fill-current" />
          </div>

          <header className="mb-12 relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${currentLevel.bg} p-3 rounded-2xl shadow-xl transition-colors duration-1000`}>
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className={`${currentLevel.color} font-black text-[10px] uppercase tracking-[0.4em]`}>
                QAUPVE Educational Tier
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tighter">Tiempos Verbales</h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
              Practica tu gramática técnica. Cada módulo completado desbloquea nuevas insignias en tu perfil.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {Object.entries(exerciseData).map(([id, topic]) => {
              const isCompleted = completedTopics.includes(id);
              return (
                <div
                  key={id}
                  onClick={() => navigate(`/exercise/${id}`)}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center group
                    ${isCompleted 
                      ? 'bg-emerald-50/20 border-emerald-100/50' 
                      : 'bg-white border-slate-50 hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-1'}`}
                >
                  <div className={`p-4 rounded-2xl mr-5 transition-all duration-500 
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : getTopicStyle(id)}`}>
                    {isCompleted ? <Check className="w-6 h-6 stroke-[3]" /> : getTopicIcon(id)}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-black text-lg ${isCompleted ? 'text-emerald-700' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                      {topic.title}
                    </h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {isCompleted ? 'Completado' : 'Práctica Lista'}
                    </span>
                  </div>

                  <div className={`p-2 rounded-xl transition-all
                    ${isCompleted 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER DINÁMICO (Ahora hereda el color del nivel como el Dashboard) */}
          <footer className={`mt-14 p-8 bg-gradient-to-br ${currentLevel.bannerBg} rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-1000`}>
            <div className="flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                <Star className="text-white w-8 h-8 fill-current" />
              </div>
              <div>
                <p className="text-white/70 font-black uppercase text-[10px] tracking-[0.3em] mb-1">
                  Tu progreso en Nivel {currentLevel.name}
                </p>
                <p className="text-white text-lg font-black tracking-tight">
                  {completedCount} de {totalCount} Módulos Dominados
                </p>
              </div>
            </div>
            
            <div className="bg-white text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-2xl shadow-xl shadow-black/10">
              {progressPercent}%
            </div>
          </footer>
        </div>

        <Footer />
      </div>
    </div>
  );
}